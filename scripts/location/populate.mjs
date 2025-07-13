import dotenv from 'dotenv';
import fetch from 'node-fetch';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DATA_DIR = path.join(__dirname, 'geonames_data');

const FILES = {
  countries: 'countryInfo.txt',
  states: 'admin1CodesASCII.txt',
  cities: 'cities1000.txt',
};

const URLS = {
  countries: 'https://download.geonames.org/export/dump/countryInfo.txt',
  states: 'https://download.geonames.org/export/dump/admin1CodesASCII.txt',
  cities: 'https://download.geonames.org/export/dump/cities1000.zip',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function downloadFile(url, dest) {
  if (fs.existsSync(dest)) {
    console.log(`📁 File already exists: ${path.basename(dest)}`);
    return;
  }
  
  console.log(`📥 Downloading ${path.basename(dest)} from ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  
  const fileStream = fs.createWriteStream(dest);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', () => {
      console.log(`✅ Downloaded: ${path.basename(dest)}`);
      resolve();
    });
  });
}

async function extractZip(zipPath, extractTo, fileName) {
  console.log(`📦 Extracting ${fileName} from ${path.basename(zipPath)}...`);
  const zip = new AdmZip(zipPath);
  zip.extractEntryTo(fileName, extractTo, false, true);
  console.log(`✅ Extracted: ${fileName}`);
}

async function ensureDataFiles() {
  console.log('📁 Checking data directory...');
  if (!fs.existsSync(DATA_DIR)) {
    console.log('📁 Creating data directory...');
    fs.mkdirSync(DATA_DIR);
  }
  
  console.log('📥 Downloading required data files...');
  // Download countryInfo.txt
  await downloadFile(URLS.countries, path.join(DATA_DIR, FILES.countries));
  // Download admin1CodesASCII.txt
  await downloadFile(URLS.states, path.join(DATA_DIR, FILES.states));
  // Download and extract cities1000.txt
  const zipPath = path.join(DATA_DIR, 'cities1000.zip');
  await downloadFile(URLS.cities, zipPath);
  extractZip(zipPath, DATA_DIR, FILES.cities);
  
  console.log('✅ All data files are ready');
}

function parseCountries() {
  console.log('📖 Reading countries file...');
  const file = fs.readFileSync(path.join(DATA_DIR, FILES.countries), 'utf8');
  const lines = file.split('\n').filter(line => line && !line.startsWith('#'));
  console.log(`📊 Processing ${lines.length} country lines...`);
  
  const countries = lines.map(line => {
    const cols = line.split('\t');
    return {
      code: cols[0],
      name: cols[4],
      currency: cols[10],
      region: cols[8],
      population: parseInt(cols[7], 10) || null,
      gdp_per_capita: null, // Not in GeoNames
    };
  });
  
  // Show some sample countries
  console.log('📋 Sample countries to be inserted:');
  countries.slice(0, 5).forEach(country => {
    console.log(`  - ${country.name} (${country.code}) - Currency: ${country.currency}`);
  });
  
  return countries;
}

function parseStates() {
  console.log('📖 Reading states/provinces file...');
  const file = fs.readFileSync(path.join(DATA_DIR, FILES.states), 'utf8');
  const lines = file.split('\n').filter(line => line);
  console.log(`📊 Processing ${lines.length} state/province lines...`);
  
  const states = lines.map(line => {
    const cols = line.split('\t');
    const [countryCode, stateCode] = cols[0].split('.');
    return {
      country_code: countryCode,
      code: stateCode,
      name: cols[1],
    };
  });
  
  // Show some sample states
  console.log('📋 Sample states/provinces to be inserted:');
  states.slice(0, 5).forEach(state => {
    console.log(`  - ${state.name} (${state.code}) for country ${state.country_code}`);
  });
  
  return states;
}

function parseCities() {
  console.log('📖 Reading cities file...');
  const file = fs.readFileSync(path.join(DATA_DIR, FILES.cities), 'utf8');
  const lines = file.split('\n').filter(line => line);
  console.log(`📊 Processing ${lines.length} city lines...`);
  
  const cities = lines.map(line => {
    const cols = line.split('\t');
    return {
      name: cols[1],
      country_code: cols[8],
      state_code: cols[10],
      population: parseInt(cols[14], 10) || null,
      latitude: parseFloat(cols[4]),
      longitude: parseFloat(cols[5]),
      timezone: cols[17],
    };
  });
  
  // Show some sample cities
  console.log('📋 Sample cities to be inserted:');
  cities.slice(0, 5).forEach(city => {
    console.log(`  - ${city.name} (${city.country_code}.${city.state_code}) - Population: ${city.population?.toLocaleString() || 'N/A'}`);
  });
  
  return cities;
}

async function upsertCountries(countries) {
  console.log(`\n📊 Inserting ${countries.length} countries...`);
  let inserted = 0;
  let skipped = 0;
  
  for (const country of countries) {
    try {
      const { error } = await supabase.from('countries').upsert([country], { onConflict: 'code' });
      if (error) {
        console.error(`❌ Error inserting country ${country.name} (${country.code}):`, error.message);
        skipped++;
      } else {
        console.log(`✅ Inserted country: ${country.name} (${country.code})`);
        inserted++;
      }
    } catch (err) {
      console.error(`❌ Error inserting country ${country.name} (${country.code}):`, err.message);
      skipped++;
    }
  }
  
  console.log(`\n📈 Countries summary: ${inserted} inserted, ${skipped} skipped`);
}

async function upsertStates(states, countryMap) {
  console.log(`\n📊 Inserting ${states.length} states/provinces...`);
  let inserted = 0;
  let skipped = 0;
  
  // Build a state map from the states we're about to insert
  const stateMap = {};
  
  for (const state of states) {
    const countryId = countryMap[state.country_code];
    if (!countryId) {
      console.log(`⚠️  Skipping state ${state.name} (${state.code}) - country ${state.country_code} not found`);
      skipped++;
      continue;
    }
    
    try {
      // First try to get existing state
      const { data: existingState } = await supabase
        .from('states')
        .select('id')
        .eq('country_id', countryId)
        .eq('name', state.name)
        .single();
      
      let stateId;
      if (existingState) {
        // State already exists
        stateId = existingState.id;
        console.log(`✅ State exists: ${state.name} (${state.code}) for country ${state.country_code}`);
      } else {
        // Insert new state
        const { data: newState, error } = await supabase.from('states').insert([
          {
            country_id: countryId,
            name: state.name,
            code: state.code,
          }
        ]).select('id').single();
        
        if (error) {
          console.error(`❌ Error inserting state ${state.name} (${state.code}) for country ${state.country_code}:`, error.message);
          skipped++;
          continue;
        } else {
          stateId = newState.id;
          console.log(`✅ Inserted state: ${state.name} (${state.code}) for country ${state.country_code}`);
        }
      }
      
      // Add to our state map
      const stateKey = `${state.country_code}.${state.code}`;
      stateMap[stateKey] = stateId;
      inserted++;
      
    } catch (err) {
      console.error(`❌ Error processing state ${state.name} (${state.code}) for country ${state.country_code}:`, err.message);
      skipped++;
    }
  }
  
  console.log(`\n📈 States summary: ${inserted} inserted, ${skipped} skipped`);
  console.log(`📊 Built state map with ${Object.keys(stateMap).length} states`);
  
  // Show some sample state mappings for debugging
  const sampleStates = Object.keys(stateMap).slice(0, 5);
  if (sampleStates.length > 0) {
    console.log('📋 Sample state mappings:');
    sampleStates.forEach(key => {
      console.log(`  - ${key} → ID: ${stateMap[key]}`);
    });
  }
  
  return stateMap; // Return the state map we built
}

async function upsertCities(cities, countryMap, stateMap) {
  console.log(`\n📊 Inserting ${cities.length} cities...`);
  let inserted = 0;
  let skipped = 0;
  let progress = 0;
  let missingCountry = 0;
  let missingState = 0;
  
  // Show some sample state keys that are available
  const availableStateKeys = Object.keys(stateMap);
  console.log(`📊 Available state keys (showing first 10): ${availableStateKeys.slice(0, 10).join(', ')}`);
  
  for (const city of cities) {
    const countryId = countryMap[city.country_code];
    const stateKey = `${city.country_code}.${city.state_code}`;
    const stateId = stateMap[stateKey];
    
    if (!countryId) {
      missingCountry++;
      if (missingCountry <= 5) { // Only show first 5 to avoid spam
        console.log(`⚠️  Skipping city ${city.name} - country ${city.country_code} not found in countryMap`);
      }
      skipped++;
      continue;
    }
    
    if (!stateId) {
      missingState++;
      if (missingState <= 5) { // Only show first 5 to avoid spam
        console.log(`⚠️  Skipping city ${city.name} - state key ${stateKey} not found in stateMap`);
      }
      skipped++;
      continue;
    }
    
    try {
      const { error } = await supabase.from('cities').upsert([
        {
          state_id: stateId,
          name: city.name,
          population: city.population,
          latitude: city.latitude,
          longitude: city.longitude,
          timezone: city.timezone,
        }
      ], { onConflict: 'state_id,name' });
      
      if (error) {
        console.error(`❌ Error inserting city ${city.name} (${city.country_code}.${city.state_code}):`, error.message);
        skipped++;
      } else {
        inserted++;
        // Show progress every 100 cities to avoid spam
        if (inserted % 100 === 0) {
          console.log(`📈 Progress: ${inserted} cities inserted...`);
        }
      }
    } catch (err) {
      console.error(`❌ Error inserting city ${city.name} (${city.country_code}.${city.state_code}):`, err.message);
      skipped++;
    }
    
    progress++;
    if (progress % 1000 === 0) {
      console.log(`🔄 Processing: ${progress}/${cities.length} cities (${Math.round(progress/cities.length*100)}%)`);
    }
  }
  
  console.log(`\n📈 Cities summary: ${inserted} inserted, ${skipped} skipped`);
  console.log(`📊 Breakdown: ${missingCountry} missing country, ${missingState} missing state`);
}

async function buildIdMaps() {
  // Build country code → id map
  const { data: countries } = await supabase.from('countries').select('id,code');
  const countryMap = {};
  const countryIdToCodeMap = {}; // Add reverse lookup
  for (const c of countries) {
    countryMap[c.code] = c.id;
    countryIdToCodeMap[c.id] = c.code; // Build reverse lookup
  }
  
  console.log(`📊 Built country map with ${Object.keys(countryMap).length} countries`);
  
  // Build state key → id map
  const { data: states } = await supabase.from('states').select('id,country_id,code');
  const stateMap = {};
  let mappedStates = 0;
  let unmappedStates = 0;
  
  for (const s of states) {
    const countryCode = countryIdToCodeMap[s.country_id];
    if (countryCode) {
      const stateKey = `${countryCode}.${s.code}`;
      stateMap[stateKey] = s.id;
      mappedStates++;
    } else {
      console.log(`⚠️  Could not find country for state ${s.code} with country_id ${s.country_id}`);
      unmappedStates++;
    }
  }
  
  console.log(`📊 Built state map with ${mappedStates} mapped states, ${unmappedStates} unmapped states`);
  console.log(`📊 Total state keys available: ${Object.keys(stateMap).length}`);
  
  // Show some sample state mappings for debugging
  const sampleStates = Object.keys(stateMap).slice(0, 5);
  if (sampleStates.length > 0) {
    console.log('📋 Sample state mappings:');
    sampleStates.forEach(key => {
      console.log(`  - ${key} → ID: ${stateMap[key]}`);
    });
  }
  
  return { countryMap, stateMap };
}

async function main() {
  // Get country codes from command line arguments
  const countryCodes = process.argv.slice(2);
  
  if (countryCodes.length === 0) {
    console.log('🚀 Location Data Population Script');
    console.log('📝 Usage: node populate.mjs <country_code1> [country_code2] ...');
    console.log('📝 Example: node populate.mjs IN US CA UK');
    console.log('📝 This script will populate location data for specified countries only');
    process.exit(1);
  }

  console.log('🚀 Starting location data population...');
  console.log(`📋 Countries to process: ${countryCodes.join(', ')}`);
  const startTime = Date.now();
  
  console.log('\n📥 Ensuring data files are available...');
  await ensureDataFiles();
  console.log('✅ Data files ready');
  
  console.log('\n📋 Parsing countries data...');
  const allCountries = parseCountries();
  // Filter countries by specified country codes
  const countries = allCountries.filter(country => 
    countryCodes.includes(country.code.toUpperCase())
  );
  console.log(`📊 Found ${countries.length} countries to insert (filtered from ${allCountries.length} total)`);
  
  // Show which countries were found and which were not
  const foundCountryCodes = countries.map(c => c.code.toUpperCase());
  const notFoundCountryCodes = countryCodes.filter(code => !foundCountryCodes.includes(code.toUpperCase()));
  
  if (countries.length > 0) {
    console.log('✅ Countries found:');
    countries.forEach(country => {
      console.log(`  - ${country.name} (${country.code})`);
    });
  }
  
  if (notFoundCountryCodes.length > 0) {
    console.log('❌ Countries not found in data:');
    notFoundCountryCodes.forEach(code => {
      console.log(`  - ${code}`);
    });
  }
  
  if (countries.length === 0) {
    console.log('❌ No countries found for the specified country codes. Please check the country codes.');
    console.log('💡 Available country codes can be found in the countryInfo.txt file');
    process.exit(1);
  }
  
  console.log('\n🌍 Inserting countries...');
  await upsertCountries(countries);
  
  console.log('\n🔗 Building country ID maps...');
  const { countryMap } = await buildIdMaps();
  console.log(`📊 Built map for ${Object.keys(countryMap).length} countries`);
  
  console.log('\n📋 Parsing states/provinces data...');
  const allStates = parseStates();
  // Filter states by specified country codes
  const states = allStates.filter(state => 
    countryCodes.includes(state.country_code.toUpperCase())
  );
  console.log(`📊 Found ${states.length} states/provinces to insert (filtered from ${allStates.length} total)`);
  
  console.log('\n🏛️  Inserting states/provinces...');
  const insertedStateMap = await upsertStates(states, countryMap);
  
  console.log('\n🔗 Building state ID maps...');
  const { stateMap: databaseStateMap } = await buildIdMaps();
  
  // Merge the inserted state map with the database state map
  const finalStateMap = { ...databaseStateMap, ...insertedStateMap };
  console.log(`📊 Built map for ${Object.keys(finalStateMap).length} states (${Object.keys(databaseStateMap).length} from DB + ${Object.keys(insertedStateMap).length} newly inserted)`);
  
  // Show some sample state mappings for debugging
  const indiaStates = Object.keys(finalStateMap).filter(key => key.startsWith('IN.'));
  if (indiaStates.length > 0) {
    console.log('📋 India state mappings found:');
    indiaStates.slice(0, 10).forEach(key => {
      console.log(`  - ${key} → ID: ${finalStateMap[key]}`);
    });
  }
  
  console.log('\n📋 Parsing cities data...');
  const allCities = parseCities();
  // Filter cities by specified country codes
  const cities = allCities.filter(city => 
    countryCodes.includes(city.country_code.toUpperCase())
  );
  console.log(`📊 Found ${cities.length} cities to insert (filtered from ${allCities.length} total)`);
  
  console.log('\n🏙️  Inserting cities...');
  await upsertCities(cities, countryMap, finalStateMap);
  
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  console.log(`\n🎉 Location data population complete! Total time: ${duration} seconds`);
  console.log(`📊 Summary: Processed ${countries.length} countries, ${states.length} states, ${cities.length} cities`);
}

main().catch(err => {
  console.error('Error populating locations:', err);
  process.exit(1);
}); 