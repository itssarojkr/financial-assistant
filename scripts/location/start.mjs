// scripts/start-population.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('🌍 Location Data Population Guide');
console.log('==================================\n');

async function main() {
  console.log('This guide will help you populate your Supabase database with comprehensive location data.\n');

  // Step 1: Check environment setup
  console.log('📋 Step 1: Environment Setup');
  console.log('----------------------------');
  
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) {
    console.log('❌ No .env file found in scripts directory');
    console.log('💡 Run: node setup.mjs');
    rl.close();
    return;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const hasSupabaseUrl = envContent.includes('SUPABASE_URL=') && !envContent.includes('your-project.supabase.co');
  const hasSupabaseKey = envContent.includes('SUPABASE_SERVICE_KEY=') && !envContent.includes('your-service-role-key');
  
  if (!hasSupabaseUrl || !hasSupabaseKey) {
    console.log('⚠️  Please configure your Supabase credentials in scripts/.env');
    console.log('   - SUPABASE_URL: Your Supabase project URL');
    console.log('   - SUPABASE_SERVICE_KEY: Your Supabase service role key');
    rl.close();
    return;
  }
  
  console.log('✅ Supabase credentials configured');
  
  // Step 2: Choose population type
  console.log('\n📋 Step 2: Choose Population Type');
  console.log('--------------------------------');
  console.log('1. Countries, States, and Cities (Basic)');
  console.log('2. Countries, States, Cities, and Localities (Complete)');
  console.log('3. Localities only (if you already have countries/states/cities)');
  
  const choice = await question('\nEnter your choice (1-3): ');
  
  // Step 3: Choose countries
  console.log('\n📋 Step 3: Choose Countries');
  console.log('---------------------------');
  console.log('Available countries: US, CA, UK, DE, IN, AU, BR, ZA, FR');
  console.log('You can select multiple countries separated by spaces.');
  
  const countriesInput = await question('\nEnter country codes (e.g., US CA UK): ');
  const countries = countriesInput.trim().split(/\s+/).filter(c => c.length > 0);
  
  if (countries.length === 0) {
    console.log('❌ No countries selected');
    rl.close();
    return;
  }
  
  console.log(`✅ Selected countries: ${countries.join(', ')}`);
  
  // Step 4: Execute population
  console.log('\n📋 Step 4: Execute Population');
  console.log('-----------------------------');
  
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    if (choice === '1' || choice === '2') {
      console.log('🔄 Populating countries, states, and cities...');
      console.log('   This may take several minutes depending on the number of countries.');
      
      const command = `node populate.mjs`;
      console.log(`   Running: ${command}`);
      
      const { stdout, stderr } = await execAsync(command);
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      
      console.log('✅ Countries, states, and cities populated successfully!');
    }
    
    if (choice === '2' || choice === '3') {
      console.log('\n🔄 Populating localities...');
      console.log('   This may take 10-30 minutes depending on the number of cities.');
      console.log('   The script uses OpenStreetMap (free) and optionally Google Places API.');
      
      const command = `node populate.mjs ${countries.join(' ')}`;
      console.log(`   Running: ${command}`);
      
      const { stdout, stderr } = await execAsync(command);
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      
      console.log('✅ Localities populated successfully!');
    }
    
    console.log('\n🎉 Population complete!');
    console.log('\n📊 Next Steps:');
    console.log('1. Check your Supabase dashboard to verify the data');
    console.log('2. Test queries in your application');
    console.log('3. Consider setting up periodic updates');
    
  } catch (error) {
    console.error('❌ Error during population:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Supabase credentials');
    console.log('2. Ensure your Supabase project is active');
    console.log('3. Check the console output for specific errors');
    console.log('4. Review the LOCALITIES_SETUP.md file for more help');
  }
  
  rl.close();
}

main().catch(console.error); 