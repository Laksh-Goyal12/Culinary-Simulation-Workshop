import fetch from 'node-fetch';

const API_KEY = '57LRqGATNP5FezXIhdlmMRDilHujHD8_QujEeBqy3_yAA6i3';

async function inspect() {
    try {
        // 1. Search for a recipe with "Milk"
        console.log('Searching for recipes with "Milk"...');
        const searchUrl = `https://api.foodoscope.com/recipe2-api/recipebyingredient/by-ingredients-categories-title?includeIngredients=Milk&page=1&limit=1`;

        const searchRes = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const searchData = await searchRes.json();
        const recipeId = searchData.payload.data[0].Recipe_id;
        console.log(`Found Recipe ID: ${recipeId}`);

        // 2. Get details
        console.log(`Fetching details for ${recipeId}...`);
        const detailUrl = `https://api.foodoscope.com/recipe2-api/search-recipe/${recipeId}`;
        const detailRes = await fetch(detailUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const detailData = await detailRes.json();
        console.log('Detail Data:', JSON.stringify(detailData, null, 2));

        // 3. Log ingredients
        const ingredients = detailData.payload.ingredients || detailData.payload.Ingredients;
        console.log('Ingredients found:');
        ingredients.forEach(i => {
            if (i.ingredient.toLowerCase().includes('milk')) {
                console.log(JSON.stringify(i, null, 2));
            }
        });

    } catch (e) {
        console.error(e);
    }
}

inspect();
