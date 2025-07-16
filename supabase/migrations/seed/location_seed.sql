-- Comprehensive location seed data
-- Countries, states, and cities for all supported countries

-- =============================
-- UNITED STATES (All 50 States + DC + Territories)
-- =============================
WITH us_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('US', 'United States', 'USD', 'North America', 331002651, 69287.54) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Alabama', 'AL', 5024279, 135767.0, 'Montgomery' FROM us_country UNION ALL
SELECT id, 'Alaska', 'AK', 731545, 1723337.0, 'Juneau' FROM us_country UNION ALL
SELECT id, 'Arizona', 'AZ', 7278717, 295234.0, 'Phoenix' FROM us_country UNION ALL
SELECT id, 'Arkansas', 'AR', 3011524, 137732.0, 'Little Rock' FROM us_country UNION ALL
SELECT id, 'California', 'CA', 39538223, 423967.0, 'Sacramento' FROM us_country UNION ALL
SELECT id, 'Colorado', 'CO', 5773714, 269601.0, 'Denver' FROM us_country UNION ALL
SELECT id, 'Connecticut', 'CT', 3605944, 14357.0, 'Hartford' FROM us_country UNION ALL
SELECT id, 'Delaware', 'DE', 989948, 6446.0, 'Dover' FROM us_country UNION ALL
SELECT id, 'Florida', 'FL', 21538187, 170312.0, 'Tallahassee' FROM us_country UNION ALL
SELECT id, 'Georgia', 'GA', 10711908, 153910.0, 'Atlanta' FROM us_country UNION ALL
SELECT id, 'Hawaii', 'HI', 1455271, 28313.0, 'Honolulu' FROM us_country UNION ALL
SELECT id, 'Idaho', 'ID', 1839106, 216443.0, 'Boise' FROM us_country UNION ALL
SELECT id, 'Illinois', 'IL', 12812508, 149995.0, 'Springfield' FROM us_country UNION ALL
SELECT id, 'Indiana', 'IN', 6785528, 94326.0, 'Indianapolis' FROM us_country UNION ALL
SELECT id, 'Iowa', 'IA', 3190369, 145746.0, 'Des Moines' FROM us_country UNION ALL
SELECT id, 'Kansas', 'KS', 2937880, 213100.0, 'Topeka' FROM us_country UNION ALL
SELECT id, 'Kentucky', 'KY', 4505836, 104656.0, 'Frankfort' FROM us_country UNION ALL
SELECT id, 'Louisiana', 'LA', 4657757, 135382.0, 'Baton Rouge' FROM us_country UNION ALL
SELECT id, 'Maine', 'ME', 1362359, 91633.0, 'Augusta' FROM us_country UNION ALL
SELECT id, 'Maryland', 'MD', 6177224, 32131.0, 'Annapolis' FROM us_country UNION ALL
SELECT id, 'Massachusetts', 'MA', 7029917, 27336.0, 'Boston' FROM us_country UNION ALL
SELECT id, 'Michigan', 'MI', 10077331, 250487.0, 'Lansing' FROM us_country UNION ALL
SELECT id, 'Minnesota', 'MN', 5706494, 225163.0, 'Saint Paul' FROM us_country UNION ALL
SELECT id, 'Mississippi', 'MS', 2976149, 125438.0, 'Jackson' FROM us_country UNION ALL
SELECT id, 'Missouri', 'MO', 6154913, 180540.0, 'Jefferson City' FROM us_country UNION ALL
SELECT id, 'Montana', 'MT', 1084225, 380831.0, 'Helena' FROM us_country UNION ALL
SELECT id, 'Nebraska', 'NE', 1961504, 200330.0, 'Lincoln' FROM us_country UNION ALL
SELECT id, 'Nevada', 'NV', 3104614, 286380.0, 'Carson City' FROM us_country UNION ALL
SELECT id, 'New Hampshire', 'NH', 1371246, 24214.0, 'Concord' FROM us_country UNION ALL
SELECT id, 'New Jersey', 'NJ', 9288994, 22591.0, 'Trenton' FROM us_country UNION ALL
SELECT id, 'New Mexico', 'NM', 2117522, 314917.0, 'Santa Fe' FROM us_country UNION ALL
SELECT id, 'New York', 'NY', 20201249, 141297.0, 'Albany' FROM us_country UNION ALL
SELECT id, 'North Carolina', 'NC', 10439388, 139391.0, 'Raleigh' FROM us_country UNION ALL
SELECT id, 'North Dakota', 'ND', 779094, 183108.0, 'Bismarck' FROM us_country UNION ALL
SELECT id, 'Ohio', 'OH', 11799448, 116098.0, 'Columbus' FROM us_country UNION ALL
SELECT id, 'Oklahoma', 'OK', 3959353, 181037.0, 'Oklahoma City' FROM us_country UNION ALL
SELECT id, 'Oregon', 'OR', 4237256, 254799.0, 'Salem' FROM us_country UNION ALL
SELECT id, 'Pennsylvania', 'PA', 13002700, 119280.0, 'Harrisburg' FROM us_country UNION ALL
SELECT id, 'Rhode Island', 'RI', 1097379, 4001.0, 'Providence' FROM us_country UNION ALL
SELECT id, 'South Carolina', 'SC', 5148714, 82932.0, 'Columbia' FROM us_country UNION ALL
SELECT id, 'South Dakota', 'SD', 886667, 199729.0, 'Pierre' FROM us_country UNION ALL
SELECT id, 'Tennessee', 'TN', 6910840, 109153.0, 'Nashville' FROM us_country UNION ALL
SELECT id, 'Texas', 'TX', 29145505, 695662.0, 'Austin' FROM us_country UNION ALL
SELECT id, 'Utah', 'UT', 3271616, 219882.0, 'Salt Lake City' FROM us_country UNION ALL
SELECT id, 'Vermont', 'VT', 643077, 24906.0, 'Montpelier' FROM us_country UNION ALL
SELECT id, 'Virginia', 'VA', 8631393, 110787.0, 'Richmond' FROM us_country UNION ALL
SELECT id, 'Washington', 'WA', 7705281, 184661.0, 'Olympia' FROM us_country UNION ALL
SELECT id, 'West Virginia', 'WV', 1793716, 62755.0, 'Charleston' FROM us_country UNION ALL
SELECT id, 'Wisconsin', 'WI', 5893718, 169635.0, 'Madison' FROM us_country UNION ALL
SELECT id, 'Wyoming', 'WY', 576851, 253335.0, 'Cheyenne' FROM us_country UNION ALL
SELECT id, 'District of Columbia', 'DC', 689545, 177.0, 'Washington' FROM us_country UNION ALL
SELECT id, 'Puerto Rico', 'PR', 3285874, 9104.0, 'San Juan' FROM us_country UNION ALL
SELECT id, 'Guam', 'GU', 168783, 549.0, 'Hagåtña' FROM us_country UNION ALL
SELECT id, 'U.S. Virgin Islands', 'VI', 104578, 346.0, 'Charlotte Amalie' FROM us_country UNION ALL
SELECT id, 'American Samoa', 'AS', 55191, 199.0, 'Pago Pago' FROM us_country UNION ALL
SELECT id, 'Northern Mariana Islands', 'MP', 57559, 464.0, 'Saipan' FROM us_country;

-- =============================
-- CANADA (All 10 Provinces + 3 Territories)
-- =============================
WITH ca_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('CA', 'Canada', 'CAD', 'North America', 38005238, 51989.96) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Ontario', 'ON', 14711827, 1076395.0, 'Toronto' FROM ca_country UNION ALL
SELECT id, 'Quebec', 'QC', 8537674, 1667000.0, 'Quebec City' FROM ca_country UNION ALL
SELECT id, 'British Columbia', 'BC', 5147712, 944735.0, 'Victoria' FROM ca_country UNION ALL
SELECT id, 'Alberta', 'AB', 4413146, 661848.0, 'Edmonton' FROM ca_country UNION ALL
SELECT id, 'Manitoba', 'MB', 1377517, 647797.0, 'Winnipeg' FROM ca_country UNION ALL
SELECT id, 'Saskatchewan', 'SK', 1177884, 651036.0, 'Regina' FROM ca_country UNION ALL
SELECT id, 'Nova Scotia', 'NS', 979449, 55284.0, 'Halifax' FROM ca_country UNION ALL
SELECT id, 'New Brunswick', 'NB', 781476, 72908.0, 'Fredericton' FROM ca_country UNION ALL
SELECT id, 'Newfoundland and Labrador', 'NL', 521365, 405212.0, 'St. John''s' FROM ca_country UNION ALL
SELECT id, 'Prince Edward Island', 'PE', 159625, 5660.0, 'Charlottetown' FROM ca_country UNION ALL
SELECT id, 'Northwest Territories', 'NT', 44904, 1346106.0, 'Yellowknife' FROM ca_country UNION ALL
SELECT id, 'Nunavut', 'NU', 39097, 2093190.0, 'Iqaluit' FROM ca_country UNION ALL
SELECT id, 'Yukon', 'YT', 42152, 482443.0, 'Whitehorse' FROM ca_country;

-- =============================
-- UNITED KINGDOM (All 4 Nations + Overseas Territories)
-- =============================
WITH uk_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('UK', 'United Kingdom', 'GBP', 'Europe', 67215293, 42328.93) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'England', 'ENG', 56286961, 130279.0, 'London' FROM uk_country UNION ALL
SELECT id, 'Scotland', 'SCT', 5463300, 78772.0, 'Edinburgh' FROM uk_country UNION ALL
SELECT id, 'Wales', 'WLS', 3152879, 20779.0, 'Cardiff' FROM uk_country UNION ALL
SELECT id, 'Northern Ireland', 'NIR', 1893667, 14130.0, 'Belfast' FROM uk_country UNION ALL
SELECT id, 'Gibraltar', 'GIB', 33691, 6.8, 'Gibraltar' FROM uk_country UNION ALL
SELECT id, 'Bermuda', 'BMU', 62278, 53.2, 'Hamilton' FROM uk_country UNION ALL
SELECT id, 'Cayman Islands', 'CYM', 65722, 264.0, 'George Town' FROM uk_country UNION ALL
SELECT id, 'British Virgin Islands', 'VGB', 30231, 151.0, 'Road Town' FROM uk_country UNION ALL
SELECT id, 'Anguilla', 'AIA', 15003, 91.0, 'The Valley' FROM uk_country UNION ALL
SELECT id, 'Montserrat', 'MSR', 4999, 102.0, 'Plymouth' FROM uk_country UNION ALL
SELECT id, 'Turks and Caicos Islands', 'TCA', 38717, 948.0, 'Cockburn Town' FROM uk_country UNION ALL
SELECT id, 'Falkland Islands', 'FLK', 3480, 12173.0, 'Stanley' FROM uk_country UNION ALL
SELECT id, 'Saint Helena', 'SHN', 5633, 122.0, 'Jamestown' FROM uk_country UNION ALL
SELECT id, 'Pitcairn Islands', 'PCN', 50, 47.0, 'Adamstown' FROM uk_country;

-- =============================
-- GERMANY (All 16 Federal States)
-- =============================
WITH de_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('DE', 'Germany', 'EUR', 'Europe', 83190556, 46468.64) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Baden-Württemberg', 'BW', 11069533, 35751.0, 'Stuttgart' FROM de_country UNION ALL
SELECT id, 'Bavaria', 'BY', 13124737, 70551.0, 'Munich' FROM de_country UNION ALL
SELECT id, 'Berlin', 'BE', 3669491, 891.0, 'Berlin' FROM de_country UNION ALL
SELECT id, 'Brandenburg', 'BB', 2521893, 29479.0, 'Potsdam' FROM de_country UNION ALL
SELECT id, 'Bremen', 'HB', 681202, 419.0, 'Bremen' FROM de_country UNION ALL
SELECT id, 'Hamburg', 'HH', 1841179, 755.0, 'Hamburg' FROM de_country UNION ALL
SELECT id, 'Hesse', 'HE', 6288080, 21115.0, 'Wiesbaden' FROM de_country UNION ALL
SELECT id, 'Lower Saxony', 'NI', 7982448, 47618.0, 'Hanover' FROM de_country UNION ALL
SELECT id, 'Mecklenburg-Vorpommern', 'MV', 1612362, 23174.0, 'Schwerin' FROM de_country UNION ALL
SELECT id, 'North Rhine-Westphalia', 'NW', 17932651, 34085.0, 'Düsseldorf' FROM de_country UNION ALL
SELECT id, 'Rhineland-Palatinate', 'RP', 4093903, 19853.0, 'Mainz' FROM de_country UNION ALL
SELECT id, 'Saarland', 'SL', 986887, 2569.0, 'Saarbrücken' FROM de_country UNION ALL
SELECT id, 'Saxony', 'SN', 4071971, 18416.0, 'Dresden' FROM de_country UNION ALL
SELECT id, 'Saxony-Anhalt', 'ST', 2194782, 20445.0, 'Magdeburg' FROM de_country UNION ALL
SELECT id, 'Schleswig-Holstein', 'SH', 2903773, 15763.0, 'Kiel' FROM de_country UNION ALL
SELECT id, 'Thuringia', 'TH', 2133378, 16172.0, 'Erfurt' FROM de_country;

-- =============================
-- INDIA (All 28 States + 8 Union Territories)
-- =============================
WITH in_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('IN', 'India', 'INR', 'Asia-Pacific', 1380004385, 1968.0) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Andhra Pradesh', 'AP', 49577103, 162975.0, 'Amaravati' FROM in_country UNION ALL
SELECT id, 'Arunachal Pradesh', 'AR', 1383727, 83743.0, 'Itanagar' FROM in_country UNION ALL
SELECT id, 'Assam', 'AS', 31205576, 78438.0, 'Dispur' FROM in_country UNION ALL
SELECT id, 'Bihar', 'BR', 104099452, 94163.0, 'Patna' FROM in_country UNION ALL
SELECT id, 'Chhattisgarh', 'CG', 29436231, 135192.0, 'Raipur' FROM in_country UNION ALL
SELECT id, 'Goa', 'GA', 1458545, 3702.0, 'Panaji' FROM in_country UNION ALL
SELECT id, 'Gujarat', 'GJ', 60439692, 196024.0, 'Gandhinagar' FROM in_country UNION ALL
SELECT id, 'Haryana', 'HR', 25351462, 44212.0, 'Chandigarh' FROM in_country UNION ALL
SELECT id, 'Himachal Pradesh', 'HP', 6864602, 55673.0, 'Shimla' FROM in_country UNION ALL
SELECT id, 'Jharkhand', 'JH', 32988134, 79714.0, 'Ranchi' FROM in_country UNION ALL
SELECT id, 'Karnataka', 'KA', 61130704, 191791.0, 'Bengaluru' FROM in_country UNION ALL
SELECT id, 'Kerala', 'KL', 33406061, 38863.0, 'Thiruvananthapuram' FROM in_country UNION ALL
SELECT id, 'Madhya Pradesh', 'MP', 72626809, 308245.0, 'Bhopal' FROM in_country UNION ALL
SELECT id, 'Maharashtra', 'MH', 112374333, 307713.0, 'Mumbai' FROM in_country UNION ALL
SELECT id, 'Manipur', 'MN', 2570390, 22327.0, 'Imphal' FROM in_country UNION ALL
SELECT id, 'Meghalaya', 'ML', 2966889, 22429.0, 'Shillong' FROM in_country UNION ALL
SELECT id, 'Mizoram', 'MZ', 1097206, 21081.0, 'Aizawl' FROM in_country UNION ALL
SELECT id, 'Nagaland', 'NL', 1978502, 16579.0, 'Kohima' FROM in_country UNION ALL
SELECT id, 'Odisha', 'OD', 41974218, 155707.0, 'Bhubaneswar' FROM in_country UNION ALL
SELECT id, 'Punjab', 'PB', 27743338, 50362.0, 'Chandigarh' FROM in_country UNION ALL
SELECT id, 'Rajasthan', 'RJ', 68548437, 342239.0, 'Jaipur' FROM in_country UNION ALL
SELECT id, 'Sikkim', 'SK', 610577, 7096.0, 'Gangtok' FROM in_country UNION ALL
SELECT id, 'Tamil Nadu', 'TN', 72147030, 130058.0, 'Chennai' FROM in_country UNION ALL
SELECT id, 'Telangana', 'TS', 35193978, 112077.0, 'Hyderabad' FROM in_country UNION ALL
SELECT id, 'Tripura', 'TR', 3673917, 10486.0, 'Agartala' FROM in_country UNION ALL
SELECT id, 'Uttar Pradesh', 'UP', 199812341, 243286.0, 'Lucknow' FROM in_country UNION ALL
SELECT id, 'Uttarakhand', 'UT', 10086292, 53483.0, 'Dehradun' FROM in_country UNION ALL
SELECT id, 'West Bengal', 'WB', 91276115, 88752.0, 'Kolkata' FROM in_country UNION ALL
SELECT id, 'Delhi', 'DL', 16787941, 1484.0, 'New Delhi' FROM in_country UNION ALL
SELECT id, 'Jammu and Kashmir', 'JK', 12267032, 222236.0, 'Srinagar' FROM in_country UNION ALL
SELECT id, 'Ladakh', 'LA', 274289, 59146.0, 'Leh' FROM in_country UNION ALL
SELECT id, 'Chandigarh', 'CH', 1055450, 114.0, 'Chandigarh' FROM in_country UNION ALL
SELECT id, 'Dadra and Nagar Haveli and Daman and Diu', 'DN', 585764, 603.0, 'Daman' FROM in_country UNION ALL
SELECT id, 'Lakshadweep', 'LD', 64473, 32.0, 'Kavaratti' FROM in_country UNION ALL
SELECT id, 'Puducherry', 'PY', 1247953, 479.0, 'Puducherry' FROM in_country UNION ALL
SELECT id, 'Andaman and Nicobar Islands', 'AN', 380581, 8249.0, 'Port Blair' FROM in_country;

-- =============================
-- AUSTRALIA (All 6 States + 2 Territories)
-- =============================
WITH au_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('AU', 'Australia', 'AUD', 'Asia-Pacific', 25499884, 52373.0) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'New South Wales', 'NSW', 8166000, 809444.0, 'Sydney' FROM au_country UNION ALL
SELECT id, 'Victoria', 'VIC', 6681000, 227416.0, 'Melbourne' FROM au_country UNION ALL
SELECT id, 'Queensland', 'QLD', 5185000, 1851736.0, 'Brisbane' FROM au_country UNION ALL
SELECT id, 'Western Australia', 'WA', 2682000, 2642753.0, 'Perth' FROM au_country UNION ALL
SELECT id, 'South Australia', 'SA', 1770000, 1044353.0, 'Adelaide' FROM au_country UNION ALL
SELECT id, 'Tasmania', 'TAS', 541000, 90758.0, 'Hobart' FROM au_country UNION ALL
SELECT id, 'Australian Capital Territory', 'ACT', 431000, 2358.0, 'Canberra' FROM au_country UNION ALL
SELECT id, 'Northern Territory', 'NT', 245000, 1419630.0, 'Darwin' FROM au_country;

-- =============================
-- FRANCE (All 13 Regions)
-- =============================
WITH fr_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('FR', 'France', 'EUR', 'Europe', 67391582, 40494.0) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Auvergne-Rhône-Alpes', 'ARA', 7990000, 69711.0, 'Lyon' FROM fr_country UNION ALL
SELECT id, 'Bourgogne-Franche-Comté', 'BFC', 2800000, 47784.0, 'Dijon' FROM fr_country UNION ALL
SELECT id, 'Bretagne', 'BRE', 3330000, 27208.0, 'Rennes' FROM fr_country UNION ALL
SELECT id, 'Centre-Val de Loire', 'CVL', 2570000, 39151.0, 'Orléans' FROM fr_country UNION ALL
SELECT id, 'Corse', 'COR', 340000, 8680.0, 'Ajaccio' FROM fr_country UNION ALL
SELECT id, 'Grand Est', 'GES', 5550000, 57441.0, 'Strasbourg' FROM fr_country UNION ALL
SELECT id, 'Hauts-de-France', 'HDF', 6000000, 31813.0, 'Lille' FROM fr_country UNION ALL
SELECT id, 'Île-de-France', 'IDF', 12200000, 12011.0, 'Paris' FROM fr_country UNION ALL
SELECT id, 'Normandie', 'NOR', 3330000, 29907.0, 'Rouen' FROM fr_country UNION ALL
SELECT id, 'Nouvelle-Aquitaine', 'NAQ', 6000000, 84036.0, 'Bordeaux' FROM fr_country UNION ALL
SELECT id, 'Occitanie', 'OCC', 5900000, 72724.0, 'Toulouse' FROM fr_country UNION ALL
SELECT id, 'Pays de la Loire', 'PDL', 3800000, 32082.0, 'Nantes' FROM fr_country UNION ALL
SELECT id, 'Provence-Alpes-Côte d''Azur', 'PAC', 5000000, 31400.0, 'Marseille' FROM fr_country;

-- =============================
-- JAPAN (All 47 Prefectures)
-- =============================
WITH jp_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('JP', 'Japan', 'JPY', 'Asia-Pacific', 125836021, 39312.0) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Hokkaido', '01', 5220000, 83424.0, 'Sapporo' FROM jp_country UNION ALL
SELECT id, 'Aomori', '02', 1240000, 9646.0, 'Aomori' FROM jp_country UNION ALL
SELECT id, 'Iwate', '03', 1220000, 15275.0, 'Morioka' FROM jp_country UNION ALL
SELECT id, 'Miyagi', '04', 2300000, 7282.0, 'Sendai' FROM jp_country UNION ALL
SELECT id, 'Akita', '05', 960000, 11637.0, 'Akita' FROM jp_country UNION ALL
SELECT id, 'Yamagata', '06', 1080000, 9323.0, 'Yamagata' FROM jp_country UNION ALL
SELECT id, 'Fukushima', '07', 1830000, 13784.0, 'Fukushima' FROM jp_country UNION ALL
SELECT id, 'Ibaraki', '08', 2870000, 6097.0, 'Mito' FROM jp_country UNION ALL
SELECT id, 'Tochigi', '09', 1930000, 6408.0, 'Utsunomiya' FROM jp_country UNION ALL
SELECT id, 'Gunma', '10', 1940000, 6362.0, 'Maebashi' FROM jp_country UNION ALL
SELECT id, 'Saitama', '11', 7350000, 3798.0, 'Saitama' FROM jp_country UNION ALL
SELECT id, 'Chiba', '12', 6260000, 5156.0, 'Chiba' FROM jp_country UNION ALL
SELECT id, 'Tokyo', '13', 14000000, 2194.0, 'Tokyo' FROM jp_country UNION ALL
SELECT id, 'Kanagawa', '14', 9230000, 2416.0, 'Yokohama' FROM jp_country UNION ALL
SELECT id, 'Niigata', '15', 2200000, 12584.0, 'Niigata' FROM jp_country UNION ALL
SELECT id, 'Toyama', '16', 1040000, 4247.0, 'Toyama' FROM jp_country UNION ALL
SELECT id, 'Ishikawa', '17', 1130000, 4186.0, 'Kanazawa' FROM jp_country UNION ALL
SELECT id, 'Fukui', '18', 768000, 4190.0, 'Fukui' FROM jp_country UNION ALL
SELECT id, 'Yamanashi', '19', 810000, 4465.0, 'Kofu' FROM jp_country UNION ALL
SELECT id, 'Nagano', '20', 2040000, 13562.0, 'Nagano' FROM jp_country UNION ALL
SELECT id, 'Gifu', '21', 1980000, 10621.0, 'Gifu' FROM jp_country UNION ALL
SELECT id, 'Shizuoka', '22', 3630000, 7777.0, 'Shizuoka' FROM jp_country UNION ALL
SELECT id, 'Aichi', '23', 7540000, 5173.0, 'Nagoya' FROM jp_country UNION ALL
SELECT id, 'Mie', '24', 1790000, 5774.0, 'Tsu' FROM jp_country UNION ALL
SELECT id, 'Shiga', '25', 1410000, 4017.0, 'Otsu' FROM jp_country UNION ALL
SELECT id, 'Kyoto', '26', 2580000, 4612.0, 'Kyoto' FROM jp_country UNION ALL
SELECT id, 'Osaka', '27', 8800000, 1905.0, 'Osaka' FROM jp_country UNION ALL
SELECT id, 'Hyogo', '28', 5460000, 8401.0, 'Kobe' FROM jp_country UNION ALL
SELECT id, 'Nara', '29', 1330000, 3691.0, 'Nara' FROM jp_country UNION ALL
SELECT id, 'Wakayama', '30', 924000, 4724.0, 'Wakayama' FROM jp_country UNION ALL
SELECT id, 'Tottori', '31', 553000, 3507.0, 'Tottori' FROM jp_country UNION ALL
SELECT id, 'Shimane', '32', 671000, 6708.0, 'Matsue' FROM jp_country UNION ALL
SELECT id, 'Okayama', '33', 1880000, 7114.0, 'Okayama' FROM jp_country UNION ALL
SELECT id, 'Hiroshima', '34', 2800000, 8479.0, 'Hiroshima' FROM jp_country UNION ALL
SELECT id, 'Yamaguchi', '35', 1340000, 6112.0, 'Yamaguchi' FROM jp_country UNION ALL
SELECT id, 'Tokushima', '36', 728000, 4146.0, 'Tokushima' FROM jp_country UNION ALL
SELECT id, 'Kagawa', '37', 956000, 1876.0, 'Takamatsu' FROM jp_country UNION ALL
SELECT id, 'Ehime', '38', 1330000, 5676.0, 'Matsuyama' FROM jp_country UNION ALL
SELECT id, 'Kochi', '39', 692000, 7105.0, 'Kochi' FROM jp_country UNION ALL
SELECT id, 'Fukuoka', '40', 5130000, 4976.0, 'Fukuoka' FROM jp_country UNION ALL
SELECT id, 'Saga', '41', 810000, 2440.0, 'Saga' FROM jp_country UNION ALL
SELECT id, 'Nagasaki', '42', 1310000, 4131.0, 'Nagasaki' FROM jp_country UNION ALL
SELECT id, 'Kumamoto', '43', 1740000, 7409.0, 'Kumamoto' FROM jp_country UNION ALL
SELECT id, 'Oita', '44', 1120000, 6341.0, 'Oita' FROM jp_country UNION ALL
SELECT id, 'Miyazaki', '45', 1070000, 7735.0, 'Miyazaki' FROM jp_country UNION ALL
SELECT id, 'Kagoshima', '46', 1600000, 9187.0, 'Kagoshima' FROM jp_country UNION ALL
SELECT id, 'Okinawa', '47', 1440000, 2281.0, 'Naha' FROM jp_country;

-- =============================
-- SINGAPORE (Single City-State)
-- =============================
WITH sg_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('SG', 'Singapore', 'SGD', 'Asia-Pacific', 5850342, 72794.0) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Singapore', 'SG', 5850342, 728.0, 'Singapore' FROM sg_country;

-- =============================
-- BRAZIL (All 26 States + Federal District)
-- =============================
WITH br_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('BR', 'Brazil', 'BRL', 'South America', 212559417, 8717.0) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Acre', 'AC', 881935, 164123.0, 'Rio Branco' FROM br_country UNION ALL
SELECT id, 'Alagoas', 'AL', 3337357, 27768.0, 'Maceio' FROM br_country UNION ALL
SELECT id, 'Amapa', 'AP', 845731, 142815.0, 'Macapa' FROM br_country UNION ALL
SELECT id, 'Amazonas', 'AM', 4144597, 1570745.0, 'Manaus' FROM br_country UNION ALL
SELECT id, 'Bahia', 'BA', 14873064, 567295.0, 'Salvador' FROM br_country UNION ALL
SELECT id, 'Ceara', 'CE', 9132078, 148826.0, 'Fortaleza' FROM br_country UNION ALL
SELECT id, 'Distrito Federal', 'DF', 3055149, 5802.0, 'Brasilia' FROM br_country UNION ALL
SELECT id, 'Espirito Santo', 'ES', 4018650, 46077.0, 'Vitoria' FROM br_country UNION ALL
SELECT id, 'Goias', 'GO', 7018354, 340086.0, 'Goiania' FROM br_country UNION ALL
SELECT id, 'Maranhao', 'MA', 7075181, 331983.0, 'Sao Luis' FROM br_country UNION ALL
SELECT id, 'Mato Grosso', 'MT', 3484466, 903358.0, 'Cuiaba' FROM br_country UNION ALL
SELECT id, 'Mato Grosso do Sul', 'MS', 2778986, 357125.0, 'Campo Grande' FROM br_country UNION ALL
SELECT id, 'Minas Gerais', 'MG', 21168791, 586528.0, 'Belo Horizonte' FROM br_country UNION ALL
SELECT id, 'Para', 'PA', 8602865, 1247689.0, 'Belem' FROM br_country UNION ALL
SELECT id, 'Paraiba', 'PB', 4018127, 56439.0, 'Joao Pessoa' FROM br_country UNION ALL
SELECT id, 'Parana', 'PR', 11433957, 199315.0, 'Curitiba' FROM br_country UNION ALL
SELECT id, 'Pernambuco', 'PE', 9557071, 98311.0, 'Recife' FROM br_country UNION ALL
SELECT id, 'Piaui', 'PI', 3273227, 251529.0, 'Teresina' FROM br_country UNION ALL
SELECT id, 'Rio de Janeiro', 'RJ', 17264943, 43696.0, 'Rio de Janeiro' FROM br_country UNION ALL
SELECT id, 'Rio Grande do Norte', 'RN', 3506853, 52797.0, 'Natal' FROM br_country UNION ALL
SELECT id, 'Rio Grande do Sul', 'RS', 11377239, 281748.0, 'Porto Alegre' FROM br_country UNION ALL
SELECT id, 'Rondonia', 'RO', 1777225, 237576.0, 'Porto Velho' FROM br_country UNION ALL
SELECT id, 'Roraima', 'RR', 605761, 224299.0, 'Boa Vista' FROM br_country UNION ALL
SELECT id, 'Santa Catarina', 'SC', 7164788, 95346.0, 'Florianopolis' FROM br_country UNION ALL
SELECT id, 'Sao Paulo', 'SP', 45919049, 248209.0, 'Sao Paulo' FROM br_country UNION ALL
SELECT id, 'Sergipe', 'SE', 2298696, 21910.0, 'Aracaju' FROM br_country UNION ALL
SELECT id, 'Tocantins', 'TO', 1572866, 277621.0, 'Palmas' FROM br_country;

-- =============================
-- SOUTH AFRICA (All 9 Provinces)
-- =============================
WITH za_country AS (
  INSERT INTO countries (code, name, currency, region, population, gdp_per_capita) 
  VALUES ('ZA', 'South Africa', 'ZAR', 'Africa', 59308690, 6001.0) 
  RETURNING id
)
INSERT INTO states (country_id, name, code, population, area_km2, capital)
SELECT id, 'Eastern Cape', 'EC', 6562053, 168966.0, 'Bhisho' FROM za_country UNION ALL
SELECT id, 'Free State', 'FS', 2826401, 129825.0, 'Bloemfontein' FROM za_country UNION ALL
SELECT id, 'Gauteng', 'GP', 15181918, 18178.0, 'Johannesburg' FROM za_country UNION ALL
SELECT id, 'KwaZulu-Natal', 'KZN', 11430318, 94361.0, 'Pietermaritzburg' FROM za_country UNION ALL
SELECT id, 'Limpopo', 'LP', 5852688, 125754.0, 'Polokwane' FROM za_country UNION ALL
SELECT id, 'Mpumalanga', 'MP', 4467684, 76495.0, 'Nelspruit' FROM za_country UNION ALL
SELECT id, 'Northern Cape', 'NC', 1255973, 372889.0, 'Kimberley' FROM za_country UNION ALL
SELECT id, 'North West', 'NW', 4010026, 104882.0, 'Mahikeng' FROM za_country UNION ALL
SELECT id, 'Western Cape', 'WC', 7024800, 129462.0, 'Cape Town' FROM za_country; 