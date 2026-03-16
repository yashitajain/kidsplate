insert into nutrition_knowledge_docs (id, title, source, source_url, summary, tags, chunk)
values
  (
    'nih-iron-children',
    'Iron Needs for Children 1 to 13 Years',
    'NIH Office of Dietary Supplements',
    'https://ods.od.nih.gov/factsheets/Iron-Consumer/',
    'Reference intake levels for iron by age and practical food sources.',
    array['iron', 'toddlers', 'children', 'anemia'],
    'Children age 1 to 3 need about 7 mg of iron per day and children age 4 to 8 need about 10 mg. Useful kid-friendly iron foods include fortified cereals, beans, lentils, eggs, poultry, tofu, and spinach. Pair plant-based iron foods with vitamin C foods to improve absorption.'
  ),
  (
    'nih-calcium-children',
    'Calcium Needs for Children',
    'NIH Office of Dietary Supplements',
    'https://ods.od.nih.gov/factsheets/Calcium-Consumer/',
    'Age-specific calcium needs and common food sources for children.',
    array['calcium', 'bones', 'growth', 'dairy'],
    'Children age 1 to 3 need about 700 mg of calcium per day, children age 4 to 8 need about 1,000 mg, and children age 9 to 18 need about 1,300 mg. Calcium can come from milk, yogurt, cheese, calcium-set tofu, fortified soy milk, and some leafy greens.'
  ),
  (
    'cdc-growth-basics',
    'Child Growth Basics',
    'CDC',
    'https://www.cdc.gov/growth-chart-training/hcp/using-growth-charts/index.html',
    'Growth should be tracked over time using age, sex, height, and weight trends.',
    array['growth', 'height', 'weight', 'tracking'],
    'Children should be assessed over time rather than from a single measurement alone. Age, sex, height, and weight trends matter. Sudden flattening in weight gain, drop in height velocity, or major percentile shifts should be reviewed by a clinician rather than treated as a nutrition diagnosis from an app alone.'
  ),
  (
    'aap-picky-eating',
    'Picky Eating Guidance',
    'American Academy of Pediatrics',
    'https://www.healthychildren.org',
    'Repeated exposure and balanced offerings help with picky eaters.',
    array['picky eating', 'preschool', 'behavior'],
    'For picky eaters, repeated low-pressure exposure works better than forcing bites. Offer one familiar food with one newer food, keep portions small, and focus on variety across the week instead of perfection at one meal.'
  ),
  (
    'usda-myplate-kids',
    'MyPlate Preschool Guidance',
    'USDA MyPlate',
    'https://www.myplate.gov/life-stages/kids',
    'Balanced meal patterns for children with practical food group guidance.',
    array['balanced meals', 'preschool', 'meal planning'],
    'Balanced meals for kids should usually combine a carbohydrate source, a protein-rich food, produce, and a source of healthy fat or dairy when appropriate. Rotating colors, textures, and formats can improve acceptance without relying on sweets or packaged snacks.'
  ),
  (
    'who-complementary-feeding',
    'Complementary Feeding and Diet Diversity',
    'WHO',
    'https://www.who.int/tools/child-growth-standards',
    'Diet diversity supports better nutrient coverage in young children.',
    array['diet diversity', 'meal planning', 'young children'],
    'Young children benefit from dietary diversity across grains, legumes, dairy, fruits, vegetables, and animal-source foods or well-planned alternatives. Weekly variety matters because a single day rarely captures the full nutrient picture.'
  ),
  (
    'nih-fiber-children',
    'Fiber Intake in Children',
    'NIDDK',
    'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation-children/eating-diet-nutrition',
    'Fiber and fluid support bowel regularity and satiety in children.',
    array['fiber', 'digestion', 'constipation'],
    'Fiber-rich foods such as fruits, vegetables, beans, oats, and whole grains can support digestion in children. Increasing fiber works best alongside enough fluids, and abrupt large increases may backfire in children who already eat very little.'
  ),
  (
    'fda-allergen-basics',
    'Food Allergy Basics',
    'FDA',
    'https://www.fda.gov/food/food-labeling-nutrition/food-allergies',
    'Avoidance of confirmed allergens requires ingredient-level review.',
    array['allergy', 'gluten free', 'dietary constraints'],
    'When a child has a confirmed allergy or medically necessary dietary restriction, ingredient-level verification matters. Gluten-free, dairy-free, vegetarian, and halal labels affect food selection differently, so meal suggestions should state assumptions and encourage label checking when packaged foods are involved.'
  )
on conflict (id) do update
set
  title = excluded.title,
  source = excluded.source,
  source_url = excluded.source_url,
  summary = excluded.summary,
  tags = excluded.tags,
  chunk = excluded.chunk;
