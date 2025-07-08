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
  if (fs.existsSync(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}`);
  const fileStream = fs.createWriteStream(dest);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
}

async function extractZip(zipPath, extractTo, fileName) {
  const zip = new AdmZip(zipPath);
  zip.extractEntryTo(fileName, extractTo, false, true);
}

async function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
  // Download countryInfo.txt
  await downloadFile(URLS.countries, path.join(DATA_DIR, FILES.countries));
  // Download admin1CodesASCII.txt
  await downloadFile(URLS.states, path.join(DATA_DIR, FILES.states));
  // Download and extract cities1000.txt
  const zipPath = path.join(DATA_DIR, 'cities1000.zip');
  await downloadFile(URLS.cities, zipPath);
  extractZip(zipPath, DATA_DIR, FILES.cities);
}

function parseCountries() {
  const file = fs.readFileSync(path.join(DATA_DIR, FILES.countries), 'utf8');
  return file.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
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
}

function parseStates() {
  const file = fs.readFileSync(path.join(DATA_DIR, FILES.states), 'utf8');
  return file.split('\n')
    .filter(line => line)
    .map(line => {
      const cols = line.split('\t');
      const [countryCode, stateCode] = cols[0].split('.');
      return {
        country_code: countryCode,
        code: stateCode,
        name: cols[1],
      };
    });
}

function parseCities() {
  const file = fs.readFileSync(path.join(DATA_DIR, FILES.cities), 'utf8');
  return file.split('\n')
    .filter(line => line)
    .map(line => {
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
}

async function upsertCountries(countries) {
  for (const country of countries) {
    await supabase.from('countries').upsert([country], { onConflict: 'code' });
  }
}

async function upsertStates(states, countryMap) {
  for (const state of states) {
    const countryId = countryMap[state.country_code];
    if (!countryId) continue;
    await supabase.from('states').upsert([
      {
        country_id: countryId,
        name: state.name,
        code: state.code,
      }
    ], { onConflict: 'country_id,name' });
  }
}

async function upsertCities(cities, countryMap, stateMap) {
  for (const city of cities) {
    const countryId = countryMap[city.country_code];
    const stateKey = `${city.country_code}.${city.state_code}`;
    const stateId = stateMap[stateKey];
    if (!countryId || !stateId) continue;
    await supabase.from('cities').upsert([
      {
        state_id: stateId,
        name: city.name,
        population: city.population,
        latitude: city.latitude,
        longitude: city.longitude,
        timezone: city.timezone,
      }
    ], { onConflict: 'state_id,name' });
  }
}

async function buildIdMaps() {
  // Build country code → id map
  const { data: countries } = await supabase.from('countries').select('id,code');
  const countryMap = {};
  for (const c of countries) countryMap[c.code] = c.id;
  // Build state key → id map
  const { data: states } = await supabase.from('states').select('id,country_id,code');
  const stateMap = {};
  for (const s of states) {
    const country = Object.keys(countryMap).find(k => countryMap[k] === s.country_id);
    if (country) stateMap[`${country}.${s.code}`] = s.id;
  }
  return { countryMap, stateMap };
}

async function main() {
  await ensureDataFiles();
  const countries = parseCountries();
  await upsertCountries(countries);
  const { countryMap } = await buildIdMaps();
  const states = parseStates();
  await upsertStates(states, countryMap);
  const { stateMap } = await buildIdMaps();
  const cities = parseCities();
  await upsertCities(cities, countryMap, stateMap);
  console.log('Location data population complete!');
}

main().catch(err => {
  console.error('Error populating locations:', err);
  process.exit(1);
}); 