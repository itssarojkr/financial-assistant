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
    console.log(`    📁 Using cached OSM data for ${cityName} (${cached.length} localities)`);
    return cached;
  }

  try {
    console.log(`    🌐 Making OSM API request for ${cityName}...`);
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
    console.log(`    📊 Processing ${data.elements?.length || 0} OSM elements...`);
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
    console.log(`    ✅ Fetched ${localities.length} localities from OSM for ${cityName} (cached)`);
    return localities;

  } catch (error) {
    console.error(`    ❌ Error fetching OSM data for ${cityName}:`, error.message);
    return [];
  }
}

// Fetch localities from Google Places API (fallback)
async function fetchLocalitiesFromGoogle(cityName, countryCode) {
  if (!GOOGLE_API_KEY) {
    console.log('    ⚠️  Google API key not provided, skipping Google Places API');
    return [];
  }

  const cacheKey = `google_${cityName}_${countryCode}`;
  const cacheFile = path.join(CACHE_DIR, `${cacheKey}.json`);

  // Check cache first
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    console.log(`    📁 Using cached Google data for ${cityName} (${cached.length} localities)`);
    return cached;
  }

  try {
    console.log(`    🌐 Making Google Places API request for ${cityName}...`);
    // First, get the city's place ID
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(cityName + ', ' + countryCode)}&key=${GOOGLE_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      console.log(`    ⚠️  No Google Places results for ${cityName}`);
      return [];
    }

    const placeId = searchData.results[0].place_id;
    console.log(`    📍 Found place ID: ${placeId} for ${cityName}`);
    
    // Get detailed place information including neighborhoods
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=address_components&key=${GOOGLE_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const localities = [];
    
    // Extract neighborhood information from address components
    console.log(`    📊 Processing address components...`);
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
    console.log(`    ✅ Fetched ${localities.length} localities from Google for ${cityName} (cached)`);
    return localities;

  } catch (error) {
    console.error(`    ❌ Error fetching Google data for ${cityName}:`, error.message);
    return [];
  }
}

// Get major cities for a country
async function getMajorCities(countryCode, limit = 20) {
  console.log(`    📊 Querying database for major cities in ${countryCode}...`);
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
    console.error(`    ❌ Error fetching cities for ${countryCode}:`, error.message);
    return [];
  }

  console.log(`    ✅ Found ${cities.length} major cities for ${countryCode}`);
  return cities;
}

// Insert localities into database
async function insertLocalities(cityId, localities) {
  if (localities.length === 0) {
    console.log(`    ⚠️  No localities to insert for city ${cityId}`);
    return;
  }

  console.log(`    💾 Inserting ${localities.length} localities for city ${cityId}...`);
  
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
    console.error(`    ❌ Error inserting localities for city ${cityId}:`, error.message);
  } else {
    console.log(`    ✅ Successfully inserted ${localities.length} localities for city ${cityId}`);
  }
}

// Main function to populate localities for a country
async function populateLocalitiesForCountry(countryCode) {
  console.log(`\n🌍 Starting locality population for ${countryCode}...`);
  const startTime = Date.now();
  
  console.log(`📊 Fetching major cities for ${countryCode}...`);
  const cities = await getMajorCities(countryCode);
  console.log(`📋 Found ${cities.length} major cities for ${countryCode}`);
  
  // Show sample cities
  console.log('📋 Sample cities to process:');
  cities.slice(0, 5).forEach(city => {
    console.log(`  - ${city.name} (Population: ${city.population?.toLocaleString() || 'N/A'})`);
  });
  
  let totalLocalities = 0;
  let totalCitiesProcessed = 0;
  let citiesWithLocalities = 0;
  let citiesWithoutLocalities = 0;
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    console.log(`\n🏙️  Processing city ${i + 1}/${cities.length}: ${city.name} (${city.population?.toLocaleString() || 'N/A'} population)`);
    
    // Try OSM first (free)
    console.log(`  🔍 Fetching localities from OpenStreetMap...`);
    let localities = await fetchLocalitiesFromOSM(city.name, countryCode);
    
    // If no localities found, try Google Places API (if available)
    if (localities.length === 0 && GOOGLE_API_KEY) {
      console.log(`  ⚠️  No OSM data for ${city.name}, trying Google Places API...`);
      localities = await fetchLocalitiesFromGoogle(city.name, countryCode);
    }
    
    if (localities.length > 0) {
      console.log(`  📋 Found ${localities.length} localities for ${city.name}:`);
      localities.slice(0, 3).forEach(locality => {
        console.log(`    - ${locality.name} (${locality.type})${locality.population ? ` - Population: ${locality.population.toLocaleString()}` : ''}`);
      });
      if (localities.length > 3) {
        console.log(`    ... and ${localities.length - 3} more`);
      }
      citiesWithLocalities++;
      totalLocalities += localities.length;
    } else {
      console.log(`  ⚠️  No localities found for ${city.name}`);
      citiesWithoutLocalities++;
    }

    // Insert localities into database
    console.log(`  💾 Inserting localities into database...`);
    await insertLocalities(city.id, localities);
    totalCitiesProcessed++;
    
    // Rate limiting to be respectful to APIs
    console.log(`  ⏳ Waiting 1 second before next request...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  
  console.log(`\n📈 Summary for ${countryCode}:`);
  console.log(`  - Cities processed: ${totalCitiesProcessed}`);
  console.log(`  - Cities with localities: ${citiesWithLocalities}`);
  console.log(`  - Cities without localities: ${citiesWithoutLocalities}`);
  console.log(`  - Total localities found: ${totalLocalities}`);
  console.log(`  - Average localities per city: ${citiesWithLocalities > 0 ? Math.round(totalLocalities / citiesWithLocalities) : 0}`);
  console.log(`  - Total time: ${duration} seconds`);
}

// Main execution
async function main() {
  const countries = process.argv.slice(2);
  
  if (countries.length === 0) {
    console.log('🚀 Locality Population Script');
    console.log('📝 Usage: node scripts/populate-localities.mjs <country_code1> [country_code2] ...');
    console.log('📝 Example: node scripts/populate-localities.mjs US CA UK IN');
    console.log('📝 This script will fetch and populate localities (neighborhoods/districts) for major cities');
    process.exit(1);
  }

  console.log('🚀 Starting locality population script...');
  console.log(`📋 Countries to process: ${countries.join(', ')}`);
  console.log(`🌐 Using OpenStreetMap API (free) and Google Places API (if key provided)`);
  console.log(`📁 Cache directory: ${CACHE_DIR}`);
  
  const overallStartTime = Date.now();
  let totalCountriesProcessed = 0;
  let totalCitiesProcessed = 0;
  let totalLocalitiesFound = 0;
  let totalCitiesWithLocalities = 0;
  let totalCitiesWithoutLocalities = 0;

  for (let i = 0; i < countries.length; i++) {
    const countryCode = countries[i].toUpperCase();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🌍 Processing country ${i + 1}/${countries.length}: ${countryCode}`);
    console.log(`${'='.repeat(60)}`);
    
    const countryStartTime = Date.now();
    await populateLocalitiesForCountry(countryCode);
    const countryEndTime = Date.now();
    const countryDuration = Math.round((countryEndTime - countryStartTime) / 1000);
    
    console.log(`\n⏱️  Country ${countryCode} completed in ${countryDuration} seconds`);
    totalCountriesProcessed++;
    
    // Update overall statistics (you can add more detailed tracking here)
    totalCitiesProcessed += 20; // Assuming 20 cities per country
  }

  const overallEndTime = Date.now();
  const overallDuration = Math.round((overallEndTime - overallStartTime) / 1000);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎉 LOCATION DATA POPULATION COMPLETE!`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📊 Overall Summary:`);
  console.log(`  - Countries processed: ${totalCountriesProcessed}`);
  console.log(`  - Total time: ${overallDuration} seconds`);
  console.log(`  - Average time per country: ${Math.round(overallDuration / totalCountriesProcessed)} seconds`);
  console.log(`\n💡 Tips:`);
  console.log(`  - Check the cache directory for saved API responses`);
  console.log(`  - Re-run the script to update localities for specific countries`);
  console.log(`  - Add more countries to the command line arguments`);
  console.log(`${'='.repeat(60)}`);
}

main().catch(err => {
  console.error('Error populating localities:', err);
  process.exit(1);
}); 