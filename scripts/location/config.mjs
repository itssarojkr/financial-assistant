export default {
  // API Configuration
  api: {
    osm: {
      timeout: 25000, // milliseconds
      retryAttempts: 3,
      delayBetweenRequests: 1000 // milliseconds
    },
    google: {
      enabled: !!process.env.GOOGLE_API_KEY,
      requestsPerSecond: 10,
      delayBetweenRequests: 100 // milliseconds
    }
  },

  // Country-specific configurations
  countries: {
    US: {
      priority: 'high',
      maxCities: 50,
      minPopulation: 100000,
      sources: ['osm', 'google']
    },
    CA: {
      priority: 'high',
      maxCities: 30,
      minPopulation: 50000,
      sources: ['osm', 'google']
    },
    UK: {
      priority: 'high',
      maxCities: 40,
      minPopulation: 50000,
      sources: ['osm', 'google']
    },
    DE: {
      priority: 'high',
      maxCities: 35,
      minPopulation: 50000,
      sources: ['osm', 'google']
    },
    IN: {
      priority: 'high',
      maxCities: 60,
      minPopulation: 100000,
      sources: ['osm', 'google']
    },
    AU: {
      priority: 'medium',
      maxCities: 25,
      minPopulation: 50000,
      sources: ['osm', 'google']
    },
    BR: {
      priority: 'medium',
      maxCities: 40,
      minPopulation: 100000,
      sources: ['osm', 'google']
    },
    ZA: {
      priority: 'medium',
      maxCities: 20,
      minPopulation: 50000,
      sources: ['osm', 'google']
    },
    FR: {
      priority: 'medium',
      maxCities: 30,
      minPopulation: 50000,
      sources: ['osm', 'google']
    }
  },

  // Locality types to fetch from OSM
  localityTypes: [
    'suburb',
    'neighbourhood',
    'quarter',
    'district',
    'residential',
    'commercial'
  ],

  // Cache settings
  cache: {
    enabled: true,
    directory: './cache',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  },

  // Database settings
  database: {
    batchSize: 100,
    retryAttempts: 3
  }
}; 