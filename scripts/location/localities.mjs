import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Optional
const CACHE_DIR = path.join(__dirname, 'cache');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// OpenStreetMap Overpass API endpoint
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

// Cache for API responses
const cache = new Map();

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

// Overpass query to get neighborhoods/districts for a city
function buildOverpassQuery(cityName, countryCode) {
  return `
    [out:json][timeout:25];
    area["name:en"="${cityName}"]["admin_level"="8"]["ISO3166-1:alpha2"="${countryCode}"]->.city;
    (
      way["place"="suburb"](area.city);
      way["place"="neighbourhood"](area.city);
      way["place"="quarter"](area.city);
      way["place"="district"](area.city);
      relation["place"="suburb"](area.city);
      relation["place"="neighbourhood"](area.city);
      relation["place"="quarter"](area.city);
      relation["place"="district"](area.city);
    );
    out body;
    >;
    out skel qt;
  `;
}

// Fetch localities from OpenStreetMap
async function fetchLocalitiesFromOSM(cityName, countryCode) {
  const cacheKey = `osm_${cityName}_${countryCode}`;
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);
  
  // Check cache first
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    console.log(`Using cached OSM data for ${cityName}`);
    return cached;
  }

  try {
    const query = buildOverpassQuery(cityName, countryCode);
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`OSM API error: ${response.status}`);
    }

    const data = await response.json();
    const localities = [];

    // Parse OSM elements
    data.elements.forEach(element => {
      if (element.tags && element.tags.name) {
        localities.push({
          name: element.tags.name,
          type: element.tags.place || 'neighbourhood',
          population: element.tags.population ? parseInt(element.tags.population) : null,
          area_km2: element.tags.area ? parseFloat(element.tags.area) : null
        });
      }
    });

    // Cache the result
    fs.writeFileSync(cacheFile, JSON.stringify(localities));
    console.log(`Fetched ${localities.length} localities from OSM for ${cityName}`);
    return localities;

  } catch (error) {
    console.error(`Error fetching OSM data for ${cityName}:`, error.message);
    return [];
  }
}

// Fetch localities from Google Places API (fallback)
async function fetchLocalitiesFromGoogle(cityName, countryCode) {
  if (!GOOGLE_API_KEY) {
    console.log('Google API key not provided, skipping Google Places API');
    return [];
  }

  const cacheKey = `google_${cityName}_${countryCode}`;
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

  // Check cache first
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    console.log(`Using cached Google data for ${cityName}`);
    return cached;
  }

  try {
    // First, get the city's place ID
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(cityName + ', ' + countryCode)}&key=${GOOGLE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      console.log(`No Google Places results for ${cityName}`);
      return [];
    }

    const placeId = searchData.results[0].place_id;
    
    // Get detailed place information including neighborhoods
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components&key=${GOOGLE_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const localities = [];
    
    // Extract neighborhood information from address components
    if (detailsData.result && detailsData.result.address_components) {
      detailsData.result.address_components.forEach(component => {
        if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
          localities.push({
            name: component.long_name,
            type: 'neighbourhood',
            population: null,
            area_km2: null
          });
        }
      });
    }

    // Cache the result
    fs.writeFileSync(cacheFile, JSON.stringify(localities));
    console.log(`Fetched ${localities.length} localities from Google for ${cityName}`);
    return localities;

  } catch (error) {
    console.error(`Error fetching Google data for ${cityName}:`, error.message);
    return [];
  }
}

// Get major cities for a country
async function getMajorCities(countryCode, limit = 20) {
  const { data: cities, error } = await supabase
    .from('cities')
    .select(`
      id,
      name,
      population,
      states!inner(countries!inner(code))
    `)
    .eq('states.countries.code', countryCode)
    .not('population', 'is', null)
    .order('population', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  return cities;
}

// Insert localities into database
async function insertLocalities(cityId, localities) {
  if (localities.length === 0) return;

  const localityData = localities.map(locality => ({
    city_id: cityId,
    name: locality.name,
    population: locality.population,
    area_km2: locality.area_km2
  }));

  const { error } = await supabase
    .from('localities')
    .upsert(localityData, { onConflict: 'city_id,name' });

  if (error) {
    console.error(`Error inserting localities for city ${cityId}:`, error);
  } else {
    console.log(`Inserted ${localities.length} localities for city ${cityId}`);
  }
}

// Main function to populate localities for a country
async function populateLocalitiesForCountry(countryCode) {
  console.log(`Starting locality population for ${countryCode}...`);
  
  const cities = await getMajorCities(countryCode);
  console.log(`Found ${cities.length} major cities for ${countryCode}`);

  for (const city of cities) {
    console.log(`Processing ${city.name}...`);
    
    // Try OSM first (free)
    let localities = await fetchLocalitiesFromOSM(city.name, countryCode);
    
    // If no localities found, try Google Places API (if available)
    if (localities.length === 0 && GOOGLE_API_KEY) {
      console.log(`No OSM data for ${city.name}, trying Google Places API...`);
      localities = await fetchLocalitiesFromGoogle(city.name, countryCode);
    }

    // Insert localities into database
    await insertLocalities(city.id, localities);
    
    // Rate limiting to be respectful to APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Main execution
async function main() {
  const countries = process.argv.slice(2);
  
  if (countries.length === 0) {
    console.log('Usage: node scripts/populate-localities.mjs <country_code1> [country_code2] ...');
    console.log('Example: node scripts/populate-localities.mjs US CA UK IN');
    process.exit(1);
  }

  for (const countryCode of countries) {
    await populateLocalitiesForCountry(countryCode.toUpperCase());
  }

  console.log('Locality population complete!');
}

main().catch(err => {
  console.error('Error populating localities:', err);
  process.exit(1);
}); 