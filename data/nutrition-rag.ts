export type NutritionKnowledgeDoc = {
  id: string
  title: string
  source: string
  sourceUrl: string
  summary: string
  tags: string[]
  chunk: string
}

export const NUTRITION_KNOWLEDGE_DOCS: NutritionKnowledgeDoc[] = [
  {
    id: 'nih-iron-children',
    title: 'Iron Needs for Children 1 to 13 Years',
    source: 'NIH Office of Dietary Supplements',
    sourceUrl: 'https://ods.od.nih.gov/factsheets/Iron-Consumer/',
    summary: 'Reference intake levels for iron by age and practical food sources.',
    tags: ['iron', 'toddlers', 'children', 'anemia'],
    chunk:
      'Children age 1 to 3 need about 7 mg of iron per day and children age 4 to 8 need about 10 mg. Useful kid-friendly iron foods include fortified cereals, beans, lentils, eggs, poultry, tofu, and spinach. Pair plant-based iron foods with vitamin C foods to improve absorption.',
  },
  {
    id: 'nih-calcium-children',
    title: 'Calcium Needs for Children',
    source: 'NIH Office of Dietary Supplements',
    sourceUrl: 'https://ods.od.nih.gov/factsheets/Calcium-Consumer/',
    summary: 'Age-specific calcium needs and common food sources for children.',
    tags: ['calcium', 'bones', 'growth', 'dairy'],
    chunk:
      'Children age 1 to 3 need about 700 mg of calcium per day, children age 4 to 8 need about 1,000 mg, and children age 9 to 18 need about 1,300 mg. Calcium can come from milk, yogurt, cheese, calcium-set tofu, fortified soy milk, and some leafy greens.',
  },
  {
    id: 'cdc-growth-basics',
    title: 'Child Growth Basics',
    source: 'CDC',
    sourceUrl: 'https://www.cdc.gov/growth-chart-training/hcp/using-growth-charts/index.html',
    summary: 'Growth should be tracked over time using age, sex, height, and weight trends.',
    tags: ['growth', 'height', 'weight', 'tracking'],
    chunk:
      'Children should be assessed over time rather than from a single measurement alone. Age, sex, height, and weight trends matter. Sudden flattening in weight gain, drop in height velocity, or major percentile shifts should be reviewed by a clinician rather than treated as a nutrition diagnosis from an app alone.',
  },
  {
    id: 'aap-picky-eating',
    title: 'Picky Eating Guidance',
    source: 'American Academy of Pediatrics',
    sourceUrl: 'https://www.healthychildren.org',
    summary: 'Repeated exposure and balanced offerings help with picky eaters.',
    tags: ['picky eating', 'preschool', 'behavior'],
    chunk:
      'For picky eaters, repeated low-pressure exposure works better than forcing bites. Offer one familiar food with one newer food, keep portions small, and focus on variety across the week instead of perfection at one meal.',
  },
  {
    id: 'usda-myplate-kids',
    title: 'MyPlate Preschool Guidance',
    source: 'USDA MyPlate',
    sourceUrl: 'https://www.myplate.gov/life-stages/kids',
    summary: 'Balanced meal patterns for children with practical food group guidance.',
    tags: ['balanced meals', 'preschool', 'meal planning'],
    chunk:
      'Balanced meals for kids should usually combine a carbohydrate source, a protein-rich food, produce, and a source of healthy fat or dairy when appropriate. Rotating colors, textures, and formats can improve acceptance without relying on sweets or packaged snacks.',
  },
  {
    id: 'who-complementary-feeding',
    title: 'Complementary Feeding and Diet Diversity',
    source: 'WHO',
    sourceUrl: 'https://www.who.int/tools/child-growth-standards',
    summary: 'Diet diversity supports better nutrient coverage in young children.',
    tags: ['diet diversity', 'meal planning', 'young children'],
    chunk:
      'Young children benefit from dietary diversity across grains, legumes, dairy, fruits, vegetables, and animal-source foods or well-planned alternatives. Weekly variety matters because a single day rarely captures the full nutrient picture.',
  },
  {
    id: 'nih-fiber-children',
    title: 'Fiber Intake in Children',
    source: 'NIDDK',
    sourceUrl: 'https://www.niddk.nih.gov/health-information/digestive-diseases/constipation-children/eating-diet-nutrition',
    summary: 'Fiber and fluid support bowel regularity and satiety in children.',
    tags: ['fiber', 'digestion', 'constipation'],
    chunk:
      'Fiber-rich foods such as fruits, vegetables, beans, oats, and whole grains can support digestion in children. Increasing fiber works best alongside enough fluids, and abrupt large increases may backfire in children who already eat very little.',
  },
  {
    id: 'fda-allergen-basics',
    title: 'Food Allergy Basics',
    source: 'FDA',
    sourceUrl: 'https://www.fda.gov/food/food-labeling-nutrition/food-allergies',
    summary: 'Avoidance of confirmed allergens requires ingredient-level review.',
    tags: ['allergy', 'gluten free', 'dietary constraints'],
    chunk:
      'When a child has a confirmed allergy or medically necessary dietary restriction, ingredient-level verification matters. Gluten-free, dairy-free, vegetarian, and halal labels affect food selection differently, so meal suggestions should state assumptions and encourage label checking when packaged foods are involved.',
  },
]
