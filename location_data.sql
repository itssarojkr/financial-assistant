-- Location Data Schema and Inserts (First-Time Setup)

-- 1. Table Creation
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  code VARCHAR(4) NOT NULL,
  name VARCHAR(64) NOT NULL,
  currency VARCHAR(8) NOT NULL,
  region VARCHAR(32) NOT NULL
);

CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL
);

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL
);

CREATE TABLE localities (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(64) NOT NULL
);

-- Add unique constraints for idempotency
ALTER TABLE states ADD CONSTRAINT unique_country_state UNIQUE (country_id, name);
ALTER TABLE cities ADD CONSTRAINT unique_state_city UNIQUE (state_id, name);

-- =============================
-- UNITED STATES
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('US', 'United States', 'USD', 'North America') RETURNING id
),
california AS (
  INSERT INTO states (country_id, name) SELECT id, 'California' FROM ins_country RETURNING id
),
new_york AS (
  INSERT INTO states (country_id, name) SELECT id, 'New York' FROM ins_country RETURNING id
),
texas AS (
  INSERT INTO states (country_id, name) SELECT id, 'Texas' FROM ins_country RETURNING id
),
florida AS (
  INSERT INTO states (country_id, name) SELECT id, 'Florida' FROM ins_country RETURNING id
),
illinois AS (
  INSERT INTO states (country_id, name) SELECT id, 'Illinois' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'San Francisco' FROM california UNION ALL
SELECT id, 'Los Angeles' FROM california UNION ALL
SELECT id, 'San Diego' FROM california UNION ALL
SELECT id, 'Sacramento' FROM california UNION ALL
SELECT id, 'San Jose' FROM california UNION ALL
SELECT id, 'New York City' FROM new_york UNION ALL
SELECT id, 'Buffalo' FROM new_york UNION ALL
SELECT id, 'Rochester' FROM new_york UNION ALL
SELECT id, 'Syracuse' FROM new_york UNION ALL
SELECT id, 'Albany' FROM new_york UNION ALL
SELECT id, 'Houston' FROM texas UNION ALL
SELECT id, 'Dallas' FROM texas UNION ALL
SELECT id, 'Austin' FROM texas UNION ALL
SELECT id, 'San Antonio' FROM texas UNION ALL
SELECT id, 'Fort Worth' FROM texas UNION ALL
SELECT id, 'Miami' FROM florida UNION ALL
SELECT id, 'Orlando' FROM florida UNION ALL
SELECT id, 'Tampa' FROM florida UNION ALL
SELECT id, 'Jacksonville' FROM florida UNION ALL
SELECT id, 'Fort Lauderdale' FROM florida UNION ALL
SELECT id, 'Chicago' FROM illinois UNION ALL
SELECT id, 'Aurora' FROM illinois UNION ALL
SELECT id, 'Rockford' FROM illinois UNION ALL
SELECT id, 'Joliet' FROM illinois UNION ALL
SELECT id, 'Naperville' FROM illinois;

-- Localities for San Francisco
WITH city_sf AS (
  SELECT id FROM cities WHERE name = 'San Francisco' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Mission District' FROM city_sf UNION ALL
SELECT id, 'SOMA' FROM city_sf UNION ALL
SELECT id, 'Chinatown' FROM city_sf;

-- =============================
-- CANADA
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('CA', 'Canada', 'CAD', 'North America') RETURNING id
),
ontario AS (
  INSERT INTO states (country_id, name) SELECT id, 'Ontario' FROM ins_country RETURNING id
),
british_columbia AS (
  INSERT INTO states (country_id, name) SELECT id, 'British Columbia' FROM ins_country RETURNING id
),
alberta AS (
  INSERT INTO states (country_id, name) SELECT id, 'Alberta' FROM ins_country RETURNING id
),
quebec AS (
  INSERT INTO states (country_id, name) SELECT id, 'Quebec' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'Toronto' FROM ontario UNION ALL
SELECT id, 'Ottawa' FROM ontario UNION ALL
SELECT id, 'Hamilton' FROM ontario UNION ALL
SELECT id, 'London' FROM ontario UNION ALL
SELECT id, 'Kitchener' FROM ontario UNION ALL
SELECT id, 'Vancouver' FROM british_columbia UNION ALL
SELECT id, 'Victoria' FROM british_columbia UNION ALL
SELECT id, 'Burnaby' FROM british_columbia UNION ALL
SELECT id, 'Richmond' FROM british_columbia UNION ALL
SELECT id, 'Surrey' FROM british_columbia UNION ALL
SELECT id, 'Calgary' FROM alberta UNION ALL
SELECT id, 'Edmonton' FROM alberta UNION ALL
SELECT id, 'Red Deer' FROM alberta UNION ALL
SELECT id, 'Lethbridge' FROM alberta UNION ALL
SELECT id, 'Medicine Hat' FROM alberta UNION ALL
SELECT id, 'Montreal' FROM quebec UNION ALL
SELECT id, 'Quebec City' FROM quebec UNION ALL
SELECT id, 'Laval' FROM quebec UNION ALL
SELECT id, 'Gatineau' FROM quebec UNION ALL
SELECT id, 'Longueuil' FROM quebec;

-- =============================
-- UNITED KINGDOM
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('UK', 'United Kingdom', 'GBP', 'Europe') RETURNING id
),
england AS (
  INSERT INTO states (country_id, name) SELECT id, 'England' FROM ins_country RETURNING id
),
scotland AS (
  INSERT INTO states (country_id, name) SELECT id, 'Scotland' FROM ins_country RETURNING id
),
wales AS (
  INSERT INTO states (country_id, name) SELECT id, 'Wales' FROM ins_country RETURNING id
),
northern_ireland AS (
  INSERT INTO states (country_id, name) SELECT id, 'Northern Ireland' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'London' FROM england UNION ALL
SELECT id, 'Manchester' FROM england UNION ALL
SELECT id, 'Birmingham' FROM england UNION ALL
SELECT id, 'Leeds' FROM england UNION ALL
SELECT id, 'Liverpool' FROM england UNION ALL
SELECT id, 'Edinburgh' FROM scotland UNION ALL
SELECT id, 'Glasgow' FROM scotland UNION ALL
SELECT id, 'Aberdeen' FROM scotland UNION ALL
SELECT id, 'Dundee' FROM scotland UNION ALL
SELECT id, 'Stirling' FROM scotland UNION ALL
SELECT id, 'Cardiff' FROM wales UNION ALL
SELECT id, 'Swansea' FROM wales UNION ALL
SELECT id, 'Newport' FROM wales UNION ALL
SELECT id, 'Wrexham' FROM wales UNION ALL
SELECT id, 'Barry' FROM wales UNION ALL
SELECT id, 'Belfast' FROM northern_ireland UNION ALL
SELECT id, 'Derry' FROM northern_ireland UNION ALL
SELECT id, 'Lisburn' FROM northern_ireland UNION ALL
SELECT id, 'Newtownabbey' FROM northern_ireland UNION ALL
SELECT id, 'Bangor' FROM northern_ireland;

-- =============================
-- GERMANY
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('DE', 'Germany', 'EUR', 'Europe') RETURNING id
),
bavaria AS (
  INSERT INTO states (country_id, name) SELECT id, 'Bavaria' FROM ins_country RETURNING id
),
nrw AS (
  INSERT INTO states (country_id, name) SELECT id, 'North Rhine-Westphalia' FROM ins_country RETURNING id
),
bw AS (
  INSERT INTO states (country_id, name) SELECT id, 'Baden-Württemberg' FROM ins_country RETURNING id
),
berlin AS (
  INSERT INTO states (country_id, name) SELECT id, 'Berlin' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'Munich' FROM bavaria UNION ALL
SELECT id, 'Nuremberg' FROM bavaria UNION ALL
SELECT id, 'Augsburg' FROM bavaria UNION ALL
SELECT id, 'Würzburg' FROM bavaria UNION ALL
SELECT id, 'Regensburg' FROM bavaria UNION ALL
SELECT id, 'Cologne' FROM nrw UNION ALL
SELECT id, 'Düsseldorf' FROM nrw UNION ALL
SELECT id, 'Dortmund' FROM nrw UNION ALL
SELECT id, 'Essen' FROM nrw UNION ALL
SELECT id, 'Duisburg' FROM nrw UNION ALL
SELECT id, 'Stuttgart' FROM bw UNION ALL
SELECT id, 'Mannheim' FROM bw UNION ALL
SELECT id, 'Karlsruhe' FROM bw UNION ALL
SELECT id, 'Freiburg' FROM bw UNION ALL
SELECT id, 'Heidelberg' FROM bw UNION ALL
SELECT id, 'Berlin' FROM berlin;

-- =============================
-- INDIA (All 28 States + 8 Union Territories)
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('IN', 'India', 'INR', 'Asia-Pacific') RETURNING id
),
maharashtra AS (
  INSERT INTO states (country_id, name) SELECT id, 'Maharashtra' FROM ins_country RETURNING id
),
karnataka AS (
  INSERT INTO states (country_id, name) SELECT id, 'Karnataka' FROM ins_country RETURNING id
),
delhi AS (
  INSERT INTO states (country_id, name) SELECT id, 'Delhi' FROM ins_country RETURNING id
),
tamil_nadu AS (
  INSERT INTO states (country_id, name) SELECT id, 'Tamil Nadu' FROM ins_country RETURNING id
),
gujarat AS (
  INSERT INTO states (country_id, name) SELECT id, 'Gujarat' FROM ins_country RETURNING id
),
west_bengal AS (
  INSERT INTO states (country_id, name) SELECT id, 'West Bengal' FROM ins_country RETURNING id
),
andhra_pradesh AS (
  INSERT INTO states (country_id, name) SELECT id, 'Andhra Pradesh' FROM ins_country RETURNING id
),
arunachal_pradesh AS (
  INSERT INTO states (country_id, name) SELECT id, 'Arunachal Pradesh' FROM ins_country RETURNING id
),
assam AS (
  INSERT INTO states (country_id, name) SELECT id, 'Assam' FROM ins_country RETURNING id
),
bihar AS (
  INSERT INTO states (country_id, name) SELECT id, 'Bihar' FROM ins_country RETURNING id
),
chhattisgarh AS (
  INSERT INTO states (country_id, name) SELECT id, 'Chhattisgarh' FROM ins_country RETURNING id
),
go AS (
  INSERT INTO states (country_id, name) SELECT id, 'Goa' FROM ins_country RETURNING id
),
haryana AS (
  INSERT INTO states (country_id, name) SELECT id, 'Haryana' FROM ins_country RETURNING id
),
himachal_pradesh AS (
  INSERT INTO states (country_id, name) SELECT id, 'Himachal Pradesh' FROM ins_country RETURNING id
),
jharkhand AS (
  INSERT INTO states (country_id, name) SELECT id, 'Jharkhand' FROM ins_country RETURNING id
),
kerala AS (
  INSERT INTO states (country_id, name) SELECT id, 'Kerala' FROM ins_country RETURNING id
),
madhya_pradesh AS (
  INSERT INTO states (country_id, name) SELECT id, 'Madhya Pradesh' FROM ins_country RETURNING id
),
manipur AS (
  INSERT INTO states (country_id, name) SELECT id, 'Manipur' FROM ins_country RETURNING id
),
meghalaya AS (
  INSERT INTO states (country_id, name) SELECT id, 'Meghalaya' FROM ins_country RETURNING id
),
mizoram AS (
  INSERT INTO states (country_id, name) SELECT id, 'Mizoram' FROM ins_country RETURNING id
),
nagaland AS (
  INSERT INTO states (country_id, name) SELECT id, 'Nagaland' FROM ins_country RETURNING id
),
odisha AS (
  INSERT INTO states (country_id, name) SELECT id, 'Odisha' FROM ins_country RETURNING id
),
punjab AS (
  INSERT INTO states (country_id, name) SELECT id, 'Punjab' FROM ins_country RETURNING id
),
rajasthan AS (
  INSERT INTO states (country_id, name) SELECT id, 'Rajasthan' FROM ins_country RETURNING id
),
sikkim AS (
  INSERT INTO states (country_id, name) SELECT id, 'Sikkim' FROM ins_country RETURNING id
),
telangana AS (
  INSERT INTO states (country_id, name) SELECT id, 'Telangana' FROM ins_country RETURNING id
),
tripura AS (
  INSERT INTO states (country_id, name) SELECT id, 'Tripura' FROM ins_country RETURNING id
),
uttrakhand AS (
  INSERT INTO states (country_id, name) SELECT id, 'Uttarakhand' FROM ins_country RETURNING id
),
utttar_pradesh AS (
  INSERT INTO states (country_id, name) SELECT id, 'Uttar Pradesh' FROM ins_country RETURNING id
),
union_andaman AS (
  INSERT INTO states (country_id, name) SELECT id, 'Andaman and Nicobar Islands' FROM ins_country RETURNING id
),
union_chandigarh AS (
  INSERT INTO states (country_id, name) SELECT id, 'Chandigarh' FROM ins_country RETURNING id
),
union_dadra AS (
  INSERT INTO states (country_id, name) SELECT id, 'Dadra and Nagar Haveli and Daman and Diu' FROM ins_country RETURNING id
),
union_lakshadweep AS (
  INSERT INTO states (country_id, name) SELECT id, 'Lakshadweep' FROM ins_country RETURNING id
),
union_delhi_ut AS (
  INSERT INTO states (country_id, name) SELECT id, 'Delhi (UT)' FROM ins_country RETURNING id
),
union_puducherry AS (
  INSERT INTO states (country_id, name) SELECT id, 'Puducherry' FROM ins_country RETURNING id
),
union_ladakh AS (
  INSERT INTO states (country_id, name) SELECT id, 'Ladakh' FROM ins_country RETURNING id
),
union_jk AS (
  INSERT INTO states (country_id, name) SELECT id, 'Jammu and Kashmir' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'Mumbai' FROM maharashtra UNION ALL
SELECT id, 'Pune' FROM maharashtra UNION ALL
SELECT id, 'Nagpur' FROM maharashtra UNION ALL
SELECT id, 'Nashik' FROM maharashtra UNION ALL
SELECT id, 'Aurangabad' FROM maharashtra UNION ALL
SELECT id, 'Bangalore' FROM karnataka UNION ALL
SELECT id, 'Mysore' FROM karnataka UNION ALL
SELECT id, 'Hubli' FROM karnataka UNION ALL
SELECT id, 'Mangalore' FROM karnataka UNION ALL
SELECT id, 'Belgaum' FROM karnataka UNION ALL
SELECT id, 'New Delhi' FROM delhi UNION ALL
SELECT id, 'Delhi' FROM delhi UNION ALL
SELECT id, 'Gurgaon' FROM delhi UNION ALL
SELECT id, 'Noida' FROM delhi UNION ALL
SELECT id, 'Faridabad' FROM delhi UNION ALL
SELECT id, 'Chennai' FROM tamil_nadu UNION ALL
SELECT id, 'Coimbatore' FROM tamil_nadu UNION ALL
SELECT id, 'Madurai' FROM tamil_nadu UNION ALL
SELECT id, 'Tiruchirappalli' FROM tamil_nadu UNION ALL
SELECT id, 'Salem' FROM tamil_nadu UNION ALL
SELECT id, 'Ahmedabad' FROM gujarat UNION ALL
SELECT id, 'Surat' FROM gujarat UNION ALL
SELECT id, 'Vadodara' FROM gujarat UNION ALL
SELECT id, 'Rajkot' FROM gujarat UNION ALL
SELECT id, 'Bhavnagar' FROM gujarat UNION ALL
SELECT id, 'Kolkata' FROM west_bengal UNION ALL
SELECT id, 'Howrah' FROM west_bengal UNION ALL
SELECT id, 'Durgapur' FROM west_bengal UNION ALL
SELECT id, 'Asansol' FROM west_bengal UNION ALL
SELECT id, 'Siliguri' FROM west_bengal;

-- Localities for Mumbai
WITH city_mumbai AS (
  SELECT id FROM cities WHERE name = 'Mumbai' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Andheri' FROM city_mumbai UNION ALL
SELECT id, 'Bandra' FROM city_mumbai UNION ALL
SELECT id, 'Colaba' FROM city_mumbai;

-- =============================
-- AUSTRALIA
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('AU', 'Australia', 'AUD', 'Asia-Pacific') RETURNING id
),
nsw AS (
  INSERT INTO states (country_id, name) SELECT id, 'New South Wales' FROM ins_country RETURNING id
),
vic AS (
  INSERT INTO states (country_id, name) SELECT id, 'Victoria' FROM ins_country RETURNING id
),
qld AS (
  INSERT INTO states (country_id, name) SELECT id, 'Queensland' FROM ins_country RETURNING id
),
wa AS (
  INSERT INTO states (country_id, name) SELECT id, 'Western Australia' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'Sydney' FROM nsw UNION ALL
SELECT id, 'Newcastle' FROM nsw UNION ALL
SELECT id, 'Wollongong' FROM nsw UNION ALL
SELECT id, 'Melbourne' FROM vic UNION ALL
SELECT id, 'Geelong' FROM vic UNION ALL
SELECT id, 'Ballarat' FROM vic UNION ALL
SELECT id, 'Brisbane' FROM qld UNION ALL
SELECT id, 'Gold Coast' FROM qld UNION ALL
SELECT id, 'Cairns' FROM qld UNION ALL
SELECT id, 'Perth' FROM wa UNION ALL
SELECT id, 'Fremantle' FROM wa;

-- Localities for Sydney
WITH city_sydney AS (
  SELECT id FROM cities WHERE name = 'Sydney' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Bondi' FROM city_sydney UNION ALL
SELECT id, 'Parramatta' FROM city_sydney UNION ALL
SELECT id, 'Manly' FROM city_sydney;
-- Localities for Melbourne
WITH city_melbourne AS (
  SELECT id FROM cities WHERE name = 'Melbourne' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'St Kilda' FROM city_melbourne UNION ALL
SELECT id, 'Fitzroy' FROM city_melbourne UNION ALL
SELECT id, 'Docklands' FROM city_melbourne;

-- =============================
-- BRAZIL
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('BR', 'Brazil', 'BRL', 'Latin America') RETURNING id
),
sp AS (
  INSERT INTO states (country_id, name) SELECT id, 'São Paulo' FROM ins_country RETURNING id
),
rj AS (
  INSERT INTO states (country_id, name) SELECT id, 'Rio de Janeiro' FROM ins_country RETURNING id
),
mg AS (
  INSERT INTO states (country_id, name) SELECT id, 'Minas Gerais' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'São Paulo' FROM sp UNION ALL
SELECT id, 'Campinas' FROM sp UNION ALL
SELECT id, 'Santos' FROM sp UNION ALL
SELECT id, 'Rio de Janeiro' FROM rj UNION ALL
SELECT id, 'Niterói' FROM rj UNION ALL
SELECT id, 'Belo Horizonte' FROM mg UNION ALL
SELECT id, 'Uberlândia' FROM mg;

-- Localities for São Paulo
WITH city_sp AS (
  SELECT id FROM cities WHERE name = 'São Paulo' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Pinheiros' FROM city_sp UNION ALL
SELECT id, 'Moema' FROM city_sp UNION ALL
SELECT id, 'Itaim Bibi' FROM city_sp;
-- Localities for Rio de Janeiro
WITH city_rio AS (
  SELECT id FROM cities WHERE name = 'Rio de Janeiro' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Copacabana' FROM city_rio UNION ALL
SELECT id, 'Ipanema' FROM city_rio UNION ALL
SELECT id, 'Barra da Tijuca' FROM city_rio;

-- =============================
-- SOUTH AFRICA
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('ZA', 'South Africa', 'ZAR', 'Africa') RETURNING id
),
gauteng AS (
  INSERT INTO states (country_id, name) SELECT id, 'Gauteng' FROM ins_country RETURNING id
),
wcape AS (
  INSERT INTO states (country_id, name) SELECT id, 'Western Cape' FROM ins_country RETURNING id
),
kwazulu AS (
  INSERT INTO states (country_id, name) SELECT id, 'KwaZulu-Natal' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'Johannesburg' FROM gauteng UNION ALL
SELECT id, 'Pretoria' FROM gauteng UNION ALL
SELECT id, 'Cape Town' FROM wcape UNION ALL
SELECT id, 'Stellenbosch' FROM wcape UNION ALL
SELECT id, 'Durban' FROM kwazulu UNION ALL
SELECT id, 'Pietermaritzburg' FROM kwazulu;

-- Localities for Cape Town
WITH city_cpt AS (
  SELECT id FROM cities WHERE name = 'Cape Town' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Sea Point' FROM city_cpt UNION ALL
SELECT id, 'Clifton' FROM city_cpt UNION ALL
SELECT id, 'Observatory' FROM city_cpt;
-- Localities for Johannesburg
WITH city_jhb AS (
  SELECT id FROM cities WHERE name = 'Johannesburg' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Sandton' FROM city_jhb UNION ALL
SELECT id, 'Soweto' FROM city_jhb UNION ALL
SELECT id, 'Rosebank' FROM city_jhb;

-- =============================
-- FRANCE
WITH ins_country AS (
  INSERT INTO countries (code, name, currency, region) VALUES ('FR', 'France', 'EUR', 'Europe') RETURNING id
),
iledefrance AS (
  INSERT INTO states (country_id, name) SELECT id, 'Île-de-France' FROM ins_country RETURNING id
),
paca AS (
  INSERT INTO states (country_id, name) SELECT id, 'Provence-Alpes-Côte d''Azur' FROM ins_country RETURNING id
),
nouvelle AS (
  INSERT INTO states (country_id, name) SELECT id, 'Nouvelle-Aquitaine' FROM ins_country RETURNING id
)
INSERT INTO cities (state_id, name)
SELECT id, 'Paris' FROM iledefrance UNION ALL
SELECT id, 'Boulogne-Billancourt' FROM iledefrance UNION ALL
SELECT id, 'Marseille' FROM paca UNION ALL
SELECT id, 'Nice' FROM paca UNION ALL
SELECT id, 'Bordeaux' FROM nouvelle UNION ALL
SELECT id, 'Limoges' FROM nouvelle;

-- Localities for Paris
WITH city_paris AS (
  SELECT id FROM cities WHERE name = 'Paris' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Montmartre' FROM city_paris UNION ALL
SELECT id, 'Le Marais' FROM city_paris UNION ALL
SELECT id, 'Latin Quarter' FROM city_paris;
-- Localities for Marseille
WITH city_marseille AS (
  SELECT id FROM cities WHERE name = 'Marseille' LIMIT 1
)
INSERT INTO localities (city_id, name)
SELECT id, 'Le Panier' FROM city_marseille UNION ALL
SELECT id, 'La Joliette' FROM city_marseille UNION ALL
SELECT id, 'Vieux-Port' FROM city_marseille;

-- =============================
-- END ADDITIONAL COUNTRIES
-- ============================= 