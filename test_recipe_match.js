import fetch from 'node-fetch';

const API_KEY = '57LRqGATNP5FezXIhdlmMRDilHujHD8_QujEeBqy3_yAA6i3';

async function testMultiIngredientSearch() {
    try {
        // Test Case: Ingredients for "Sponge Cake" or similar simple recipe
        // Let's try "egg,sugar,flour"
        const ingredients = "egg,sugar,flour";
        console.log(`Searching for recipes with: "${ingredients}"`);

        const searchUrl = `https://api.foodoscope.com/recipe2-api/recipebyingredient/by-ingredients-categories-title?includeIngredients=${encodeURIComponent(ingredients)}&page=1&limit=3`;

        const response = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!response.ok) {
            console.error('API Error:', response.status);
            return;
        }

        const data = await response.json();
        const payload = data.payload || data;
        const recipes = payload.data || [];

        console.log(`Found ${recipes.length} recipes.`);
        recipes.forEach(r => {
            console.log(`- ${r.Recipe_title} (ID: ${r.Recipe_id})`);
            console.log(`  Target: ${r.Target}`); // Sometimes API returns relevance score
        });

    } catch (e) {
        console.error(e);
    }
}

testMultiIngredientSearch();
