-- KidsBite Food Database Seed
-- 70+ Indian foods with nutritional data and ingredients

-- ===========================
-- GRAINS
-- ===========================
insert into foods (name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg) values
('Roti / Chapati', array['chapati','phulka','roti','wheat roti'], 'grain', 30, '1 roti (30g)', 80, 2.5, 15, 1.5, 2, 0.9, 10, 0),
('Rice (Cooked)', array['chawal','boiled rice','steamed rice','white rice'], 'grain', 150, '1 cup cooked (150g)', 195, 4, 43, 0.5, 0.5, 0.5, 10, 0),
('Idli', array['idly','steamed idli'], 'grain', 80, '2 idlis (80g)', 78, 2.5, 16, 0.5, 1, 0.4, 12, 0),
('Dosa', array['plain dosa','rice dosa','fermented dosa'], 'grain', 80, '1 medium dosa (80g)', 133, 3.5, 24, 2.5, 0.8, 0.5, 15, 0),
('Paratha (Plain)', array['plain paratha','wheat paratha'], 'grain', 60, '1 paratha (60g)', 188, 4, 28, 7, 2.5, 1.2, 15, 0),
('Aloo Paratha', array['potato paratha','stuffed paratha'], 'grain', 100, '1 paratha (100g)', 260, 5, 40, 9, 3, 1.5, 20, 8),
('Poha', array['flattened rice','beaten rice','flattened poha','aval'], 'grain', 100, '1 bowl (100g)', 180, 3, 38, 2, 1.5, 1.2, 14, 0),
('Upma', array['suji upma','semolina upma','rava upma'], 'grain', 150, '1 bowl (150g)', 190, 5, 33, 4, 2, 1.5, 20, 0),
('Dal Khichdi', array['khichdi','rice khichdi','dal khichri'], 'grain', 200, '1 bowl (200g)', 220, 9, 38, 3, 3.5, 2, 40, 0),
('Bread (Whole Wheat)', array['whole wheat bread','brown bread','wheat bread'], 'grain', 60, '2 slices (60g)', 140, 5, 26, 2, 3, 1.5, 50, 0),
('Puri', array['poori','deep fried puri','wheat puri'], 'grain', 40, '2 puris (40g)', 160, 3, 22, 7, 1.5, 0.8, 10, 0),
('Oats Porridge', array['oatmeal','oats','rolled oats porridge'], 'grain', 150, '1 bowl (150g)', 150, 5, 27, 3, 4, 2, 80, 0),
('Uttapam', array['oothappam','uthappam'], 'grain', 100, '1 medium (100g)', 140, 4, 25, 3, 1.5, 0.8, 30, 5),
('Vermicelli (Semiya)', array['semiya upma','vermicelli kheer','seviyan'], 'grain', 100, '1 bowl (100g)', 200, 5, 38, 4, 1, 1, 15, 0),
('Rava / Semolina (Suji)', array['semolina','rava','suji'], 'grain', 100, '1 bowl cooked (100g)', 220, 6, 45, 2, 2, 1.5, 20, 0);

-- ===========================
-- LEGUMES / DALS
-- ===========================
insert into foods (name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg) values
('Moong Dal (Yellow)', array['yellow moong','mung dal','moong daal'], 'legume', 150, '1 bowl (150g)', 145, 11, 25, 1, 4, 2, 30, 2),
('Masoor Dal (Red Lentil)', array['red lentil','masoor daal','pink dal'], 'legume', 150, '1 bowl (150g)', 140, 10, 24, 1, 4.5, 3.5, 20, 2),
('Toor Dal (Arhar)', array['toor dal','arhar dal','pigeon pea dal'], 'legume', 150, '1 bowl (150g)', 150, 10, 26, 1, 4, 2.5, 30, 2),
('Rajma (Kidney Beans)', array['kidney beans','rajma curry','red kidney beans'], 'legume', 150, '1 bowl (150g)', 185, 12, 30, 1.5, 7, 3.5, 50, 3),
('Chole (Chickpeas)', array['chana masala','chickpea curry','kabuli chana'], 'legume', 150, '1 bowl (150g)', 195, 13, 32, 3, 8, 4, 60, 4),
('Sambar', array['sambhar','south indian sambar','vegetable sambar'], 'legume', 200, '1 bowl (200g)', 120, 6, 20, 2, 4, 1.5, 40, 15),
('Kadhi', array['kadhi pakora','yogurt curry','besan kadhi'], 'legume', 150, '1 bowl (150g)', 130, 5, 16, 6, 1, 0.8, 80, 2),
('Chana Dal', array['split chickpea','bengal gram dal','channa dal'], 'legume', 150, '1 bowl (150g)', 180, 11, 30, 2, 6, 3, 40, 2),
('Urad Dal (Black Gram)', array['black dal','whole urad','dhuli urad'], 'legume', 150, '1 bowl (150g)', 160, 12, 26, 1.5, 5, 3, 35, 2),
('Dal Makhani', array['black dal makhani','creamy dal','dal makhni'], 'legume', 150, '1 bowl (150g)', 230, 10, 25, 10, 5, 3, 80, 2);

-- ===========================
-- VEGETABLES
-- ===========================
insert into foods (name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg) values
('Palak Sabzi (Spinach)', array['spinach sabzi','palak curry','saag'], 'vegetable', 100, '1 small bowl (100g)', 80, 4, 8, 4, 3, 3.5, 120, 28),
('Aloo Gobi', array['potato cauliflower','aloo gobhi','potato curry'], 'vegetable', 150, '1 bowl (150g)', 160, 4, 25, 6, 4, 1.5, 40, 45),
('Matar Paneer', array['peas paneer','peas cottage cheese','mutter paneer'], 'vegetable', 150, '1 bowl (150g)', 250, 12, 18, 15, 4, 1.5, 200, 20),
('Bhindi (Okra)', array['lady finger','okra sabzi','bhindi masala'], 'vegetable', 100, '1 small bowl (100g)', 95, 3, 12, 4, 5, 0.8, 80, 23),
('Gajar (Carrot)', array['carrot sabzi','gajjar','carrot curry','raw carrot'], 'vegetable', 100, '1 medium carrot (100g)', 41, 0.9, 9.6, 0.2, 2.8, 0.3, 33, 5.9),
('Beetroot (Boiled)', array['beet','chukandar','boiled beet'], 'vegetable', 100, '1 small beet (100g)', 44, 1.7, 10, 0.2, 2, 0.8, 16, 3.6),
('Lauki (Bottle Gourd)', array['ghiya','bottle gourd sabzi','dudhi'], 'vegetable', 100, '1 small bowl (100g)', 55, 2, 8, 2, 2, 0.5, 30, 10),
('Tinda Sabzi', array['tinde','round gourd','apple gourd'], 'vegetable', 100, '1 small bowl (100g)', 62, 2, 10, 2, 2, 0.5, 30, 5),
('Pumpkin Sabzi (Kaddu)', array['kaddu','pumpkin curry','lal kaddu'], 'vegetable', 150, '1 bowl (150g)', 90, 2.5, 15, 3, 3, 0.8, 30, 15),
('Aloo Sabzi (Potato)', array['alu sabzi','potato curry','jeera aloo'], 'vegetable', 150, '1 bowl (150g)', 175, 3, 30, 6, 3, 1.2, 15, 18),
('Baingan Bharta', array['brinjal','eggplant bharta','roasted brinjal'], 'vegetable', 150, '1 bowl (150g)', 130, 3, 15, 7, 4.5, 0.5, 25, 10),
('Mixed Vegetable Curry', array['mix veg','sabzi mix','veg curry'], 'vegetable', 150, '1 bowl (150g)', 140, 4, 18, 7, 4, 1.2, 60, 25),
('Methi Sabzi (Fenugreek)', array['fenugreek leaves','methi curry','methi bhaji'], 'vegetable', 100, '1 small bowl (100g)', 72, 4.5, 8, 2.5, 3.7, 1.9, 160, 14);

-- ===========================
-- DAIRY
-- ===========================
insert into foods (name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg) values
('Milk (Full Fat)', array['whole milk','doodh','cow milk','buffalo milk'], 'dairy', 200, '1 glass (200ml)', 124, 6.4, 9.6, 6.8, 0, 0.1, 240, 0),
('Dahi / Curd (Plain)', array['yogurt','curd','homemade dahi','plain yogurt'], 'dairy', 150, '1 cup (150g)', 90, 5.5, 7.5, 4.5, 0, 0.1, 175, 0),
('Paneer (Cottage Cheese)', array['cottage cheese','homemade paneer','fresh paneer'], 'dairy', 50, '50g (2 pieces)', 135, 8, 1.5, 10, 0, 0.3, 200, 0),
('Ghee', array['clarified butter','desi ghee'], 'dairy', 5, '1 tsp (5g)', 45, 0, 0, 5, 0, 0, 0, 0),
('Butter', array['amul butter','white butter','makkhan'], 'dairy', 10, '1 tsp (10g)', 72, 0.1, 0, 8, 0, 0, 2, 0),
('Cheddar Cheese', array['cheese slice','processed cheese','amul cheese'], 'dairy', 25, '1 slice (25g)', 101, 6, 0.5, 8.5, 0, 0.1, 185, 0),
('Kheer (Rice Pudding)', array['rice kheer','chawal ki kheer','payasam'], 'dairy', 150, '1 bowl (150g)', 200, 5, 32, 6, 0.5, 0.5, 160, 0),
('Lassi (Sweet)', array['sweet lassi','mango lassi','punjabi lassi'], 'dairy', 200, '1 glass (200ml)', 180, 5, 28, 5, 0, 0.1, 200, 0),
('Buttermilk (Chaas)', array['chaas','masala chaas','thin buttermilk'], 'dairy', 200, '1 glass (200ml)', 60, 3, 5, 2, 0, 0.1, 100, 0);

-- ===========================
-- FRUITS
-- ===========================
insert into foods (name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg) values
('Banana', array['kela','ripe banana','yellow banana'], 'fruit', 100, '1 medium banana (100g)', 89, 1.1, 23, 0.3, 2.6, 0.3, 5, 8.7),
('Apple', array['seb','red apple','green apple'], 'fruit', 100, '1 small apple (100g)', 52, 0.3, 14, 0.2, 2.4, 0.1, 6, 4.6),
('Mango', array['aam','alphonso','kesar mango','raw mango'], 'fruit', 100, '1/2 mango (100g)', 60, 0.8, 15, 0.4, 1.6, 0.2, 11, 36),
('Orange', array['narangi','mosambi','sweet lime','orange juice'], 'fruit', 130, '1 medium orange (130g)', 62, 1.2, 15.5, 0.2, 3.1, 0.1, 52, 70),
('Papaya', array['papita','ripe papaya'], 'fruit', 100, '1 cup papaya (100g)', 43, 0.5, 11, 0.3, 1.7, 0.3, 20, 62),
('Chiku (Sapodilla)', array['sapota','sapodilla','chickoo'], 'fruit', 100, '1 medium chiku (100g)', 83, 0.4, 20, 1.1, 5.3, 0.8, 21, 14.7),
('Amla (Indian Gooseberry)', array['gooseberry','indian gooseberry','awla'], 'fruit', 50, '2-3 amla (50g)', 22, 0.5, 5, 0.1, 1.5, 0.3, 12.5, 300),
('Pomegranate', array['anar','pomegranate seeds','anaar'], 'fruit', 100, '1/2 cup seeds (100g)', 83, 1.7, 18.7, 1.2, 4, 0.3, 10, 10.2),
('Guava', array['amrood','peru','pink guava'], 'fruit', 100, '1 medium guava (100g)', 68, 2.6, 14.3, 1, 5.4, 0.3, 18, 228),
('Watermelon', array['tarbuj','tarbooz'], 'fruit', 150, '1 cup (150g)', 46, 0.9, 11.5, 0.2, 0.6, 0.3, 7.5, 12.3);

-- ===========================
-- PROTEIN
-- ===========================
insert into foods (name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg) values
('Egg (Boiled)', array['boiled egg','anda','hard boiled egg','scrambled egg'], 'protein', 50, '1 egg (50g)', 78, 6, 0.6, 5.3, 0, 0.9, 25, 0),
('Chicken Curry', array['murgh curry','chicken masala','chicken sabzi'], 'protein', 150, '1 bowl (150g)', 280, 25, 8, 16, 0, 1.2, 20, 3),
('Fish Curry', array['machli curry','fish masala','rohu curry'], 'protein', 150, '1 bowl (150g)', 220, 22, 6, 12, 0, 1.5, 80, 5),
('Egg Bhurji', array['scrambled eggs','anda bhurji','egg scramble'], 'protein', 100, '1 serving (100g)', 155, 12, 3, 11, 0, 1.5, 50, 5),
('Chicken Tikka (Grilled)', array['grilled chicken','tandoori chicken','chicken pieces'], 'protein', 100, '2-3 pieces (100g)', 190, 28, 0, 8, 0, 1, 15, 0),
('Paneer Bhurji', array['scrambled paneer','paneer scramble'], 'protein', 100, '1 serving (100g)', 200, 14, 5, 14, 0.5, 0.5, 210, 5);

-- ===========================
-- SNACKS
-- ===========================
insert into foods (name, aliases, category, serving_size_g, serving_label, calories, protein_g, carbs_g, fat_g, fiber_g, iron_mg, calcium_mg, vitamin_c_mg) values
('Makhana (Fox Nuts)', array['lotus seeds','phool makhana','fox nuts'], 'snack', 30, '1 cup (30g)', 106, 3.5, 20, 0.5, 0.8, 1.3, 60, 0),
('Chikki (Peanut)', array['peanut chikki','groundnut chikki','til chikki'], 'snack', 30, '2 pieces (30g)', 148, 4.5, 20, 6, 1.2, 0.8, 20, 0),
('Mixed Dry Fruits', array['dry fruits','nuts and dry fruits','kaju badam pista'], 'snack', 30, '1 small handful (30g)', 165, 4, 10, 13, 1.5, 0.7, 25, 0),
('Sprouts (Mixed)', array['bean sprouts','mixed sprouts','moong sprouts'], 'snack', 100, '1 bowl (100g)', 97, 6, 18, 0.5, 4, 1.5, 25, 15),
('Dhokla', array['khaman dhokla','steamed dhokla','gujarati dhokla'], 'snack', 100, '2-3 pieces (100g)', 160, 6.5, 25, 4, 2, 1, 40, 5),
('Idli (Mini)', array['mini idli','small idli','bite size idli'], 'snack', 60, '4 mini idlis (60g)', 78, 2.5, 16, 0.5, 1, 0.4, 12, 0),
('Murmura (Puffed Rice)', array['puffed rice','bhel','murmure'], 'snack', 30, '1 cup (30g)', 110, 2, 24, 0.5, 0.5, 0.5, 5, 0),
('Banana Chips', array['plantain chips','kela chips','raw banana chips'], 'snack', 30, '15-20 chips (30g)', 163, 0.8, 17, 10, 2, 0.6, 10, 6),
('Ragi Cookies', array['finger millet cookies','nachni cookies'], 'snack', 30, '3 cookies (30g)', 130, 2.5, 22, 4, 1.5, 1.5, 80, 0),
('Peanut Butter Toast', array['peanut butter bread','groundnut toast'], 'snack', 60, '1 slice with PB (60g)', 200, 8, 20, 11, 2.5, 1.2, 30, 0),
('Steamed Sweet Corn', array['boiled corn','sweet corn','corn cob'], 'snack', 100, '1 small cob (100g)', 96, 3.4, 21, 1.5, 2.7, 0.5, 2, 7);

-- ===========================
-- FOOD INGREDIENTS
-- ===========================

-- Roti
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Atta / Whole wheat flour', 30, 'g' from foods where name = 'Roti / Chapati';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Water', 15, 'ml' from foods where name = 'Roti / Chapati';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Ghee (optional)', 1, 'tsp' from foods where name = 'Roti / Chapati';

-- Idli
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Idli rice / Parboiled rice', 40, 'g' from foods where name = 'Idli';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Urad dal (split)', 15, 'g' from foods where name = 'Idli';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Salt', 0.5, 'tsp' from foods where name = 'Idli';

-- Dosa
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Rice', 40, 'g' from foods where name = 'Dosa';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Urad dal', 15, 'g' from foods where name = 'Dosa';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tsp' from foods where name = 'Dosa';

-- Aloo Paratha
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Atta / Whole wheat flour', 50, 'g' from foods where name = 'Aloo Paratha';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Potato', 60, 'g' from foods where name = 'Aloo Paratha';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil / Ghee', 1, 'tbsp' from foods where name = 'Aloo Paratha';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Cumin seeds', 0.5, 'tsp' from foods where name = 'Aloo Paratha';

-- Poha
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Flattened rice / Poha', 50, 'g' from foods where name = 'Poha';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 20, 'g' from foods where name = 'Poha';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tsp' from foods where name = 'Poha';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Mustard seeds', 0.25, 'tsp' from foods where name = 'Poha';

-- Upma
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Rava / Semolina', 50, 'g' from foods where name = 'Upma';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 30, 'g' from foods where name = 'Upma';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tsp' from foods where name = 'Upma';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Mixed vegetables', 30, 'g' from foods where name = 'Upma';

-- Dal Khichdi
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Rice', 60, 'g' from foods where name = 'Dal Khichdi';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Moong dal', 30, 'g' from foods where name = 'Dal Khichdi';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Ghee', 1, 'tsp' from foods where name = 'Dal Khichdi';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Turmeric', 0.25, 'tsp' from foods where name = 'Dal Khichdi';

-- Moong Dal
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Yellow moong dal', 50, 'g' from foods where name = 'Moong Dal (Yellow)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 20, 'g' from foods where name = 'Moong Dal (Yellow)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Tomato', 20, 'g' from foods where name = 'Moong Dal (Yellow)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tsp' from foods where name = 'Moong Dal (Yellow)';

-- Masoor Dal
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Red lentils / Masoor dal', 50, 'g' from foods where name = 'Masoor Dal (Red Lentil)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Tomato', 30, 'g' from foods where name = 'Masoor Dal (Red Lentil)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 20, 'g' from foods where name = 'Masoor Dal (Red Lentil)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tsp' from foods where name = 'Masoor Dal (Red Lentil)';

-- Rajma
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Kidney beans / Rajma', 60, 'g' from foods where name = 'Rajma (Kidney Beans)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 30, 'g' from foods where name = 'Rajma (Kidney Beans)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Tomato', 30, 'g' from foods where name = 'Rajma (Kidney Beans)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tbsp' from foods where name = 'Rajma (Kidney Beans)';

-- Chole
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Chickpeas / Kabuli chana', 60, 'g' from foods where name = 'Chole (Chickpeas)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 30, 'g' from foods where name = 'Chole (Chickpeas)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Tomato', 30, 'g' from foods where name = 'Chole (Chickpeas)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tbsp' from foods where name = 'Chole (Chickpeas)';

-- Sambar
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Toor dal / Pigeon peas', 40, 'g' from foods where name = 'Sambar';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Mixed vegetables (drumstick, brinjal)', 50, 'g' from foods where name = 'Sambar';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Sambar powder', 1, 'tsp' from foods where name = 'Sambar';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Tamarind', 5, 'g' from foods where name = 'Sambar';

-- Palak Sabzi
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Spinach leaves / Palak', 80, 'g' from foods where name = 'Palak Sabzi (Spinach)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 15, 'g' from foods where name = 'Palak Sabzi (Spinach)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tsp' from foods where name = 'Palak Sabzi (Spinach)';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Garlic', 3, 'g' from foods where name = 'Palak Sabzi (Spinach)';

-- Matar Paneer
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Paneer / Cottage cheese', 50, 'g' from foods where name = 'Matar Paneer';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Green peas / Matar', 40, 'g' from foods where name = 'Matar Paneer';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 20, 'g' from foods where name = 'Matar Paneer';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Tomato', 30, 'g' from foods where name = 'Matar Paneer';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tbsp' from foods where name = 'Matar Paneer';

-- Milk
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Full fat milk', 200, 'ml' from foods where name = 'Milk (Full Fat)';

-- Egg Boiled
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Egg', 1, 'piece' from foods where name = 'Egg (Boiled)';

-- Chicken Curry
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Chicken (bone-in)', 120, 'g' from foods where name = 'Chicken Curry';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Onion', 30, 'g' from foods where name = 'Chicken Curry';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Tomato', 30, 'g' from foods where name = 'Chicken Curry';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tbsp' from foods where name = 'Chicken Curry';

-- Fish Curry
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Fish (rohu / pomfret)', 100, 'g' from foods where name = 'Fish Curry';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Coconut milk / Onion-tomato gravy', 50, 'ml' from foods where name = 'Fish Curry';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tbsp' from foods where name = 'Fish Curry';

-- Sprouts
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Mixed beans (moong, moth, chana)', 30, 'g' from foods where name = 'Sprouts (Mixed)';

-- Dhokla
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Besan / Chickpea flour', 50, 'g' from foods where name = 'Dhokla';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Yogurt / Curd', 30, 'g' from foods where name = 'Dhokla';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Eno / Baking soda', 0.5, 'tsp' from foods where name = 'Dhokla';
insert into food_ingredients (food_id, ingredient_name, quantity, unit)
select id, 'Oil', 1, 'tsp' from foods where name = 'Dhokla';
