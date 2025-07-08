import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌍 Locality Population Setup');
console.log('============================\n');

// Check if .env file exists
const envFile = path.join(__dirname, '.env');
if (!fs.existsSync(envFile)) {
  console.log('❌ No .env file found in scripts directory');
  console.log('📝 Creating .env template...');
  
  const envTemplate = `# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Google Places API (Optional - for fallback locality data)
# Get your API key from: https://console.cloud.google.com/apis/credentials
GOOGLE_API_KEY=your-google-api-key

# Configuration
CACHE_ENABLED=true
BATCH_SIZE=100
`;
  
  fs.writeFileSync(envFile, envTemplate);
  console.log('✅ Created .env template');
  console.log('⚠️  Please edit scripts/.env with your actual credentials\n');
} else {
  console.log('✅ .env file found');
}

// Check required dependencies
console.log('📦 Checking dependencies...');
const packageJson = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJson)) {
  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  const required = ['@supabase/supabase-js', 'node-fetch', 'dotenv'];
  const missing = required.filter(dep => !pkg.dependencies[dep] && !pkg.devDependencies[dep]);
  
  if (missing.length > 0) {
    console.log(`❌ Missing dependencies: ${missing.join(', ')}`);
    console.log('💡 Run: npm install @supabase/supabase-js node-fetch dotenv');
  } else {
    console.log('✅ All required dependencies found');
  }
}

console.log('\n🚀 Usage Examples:');
console.log('==================');
console.log('');
console.log('1. Populate localities for specific countries:');
console.log('   node scripts/populate-localities.mjs US CA UK');
console.log('');
console.log('2. Populate localities for all supported countries:');
console.log('   node scripts/populate-localities.mjs US CA UK DE IN AU BR ZA FR');
console.log('');
console.log('3. Populate localities for a single country:');
console.log('   node scripts/populate-localities.mjs US');
console.log('');
console.log('📊 Data Sources:');
console.log('================');
console.log('• Primary: OpenStreetMap (FREE) - Comprehensive neighborhood data');
console.log('• Fallback: Google Places API (PAID) - Only if OSM data is insufficient');
console.log('');
console.log('💰 Cost Analysis:');
console.log('=================');
console.log('• OpenStreetMap: FREE (unlimited requests)');
console.log('• Google Places API: $17 per 1000 requests (after free tier)');
console.log('• Estimated cost for 1000 cities: $0-17 (depending on OSM coverage)');
console.log('');
console.log('⚡ Performance Tips:');
console.log('===================');
console.log('• Script includes caching to avoid duplicate API calls');
console.log('• Rate limiting to respect API limits');
console.log('• Batch processing for efficient database operations');
console.log('• Progress logging for monitoring');
console.log('');
console.log('🔧 Configuration:');
console.log('=================');
console.log('• Edit scripts/localities-config.mjs to customize settings');
console.log('• Adjust city limits, population thresholds, and API settings');
console.log('• Cache settings can be modified for different update frequencies');
console.log('');
console.log('📁 Output:');
console.log('==========');
console.log('• Localities stored in Supabase localities table');
console.log('• Cache files stored in scripts/cache/ directory');
console.log('• Logs show progress and any errors encountered');
console.log('');
console.log('🎯 Next Steps:');
console.log('==============');
console.log('1. Edit scripts/.env with your Supabase credentials');
console.log('2. (Optional) Add Google API key for fallback data');
console.log('3. Run the population script for your target countries');
console.log('4. Verify data in your Supabase dashboard');
console.log('5. Use the data in your web and mobile apps'); 