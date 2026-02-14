const API_KEY = 'uHGtgPo6qtX39lVa2UUnLDCtpeNAzN-DyDJTLc0M6wUbGWM3';
const BASE_URL = 'http://cosylab.iiitd.edu.in:6969';

async function tryFetch(url) {
    console.log(`\n--- Trying: ${url} ---`);
    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            const payload = data.payload || data;
            const items = payload.data || [payload];
            console.log('Sample Data Structure (keys):', Object.keys(items[0] || {}));
            if (items[0]) {
                console.log('Full Sample (limited):', JSON.stringify(items[0], null, 2).substring(0, 500));
                return items[0];
            }
        } else {
            console.log(`Body: ${await res.text()}`);
        }
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
    return null;
}

async function debug() {
    // 1. Try recipesinfo (List)
    await tryFetch(`${BASE_URL}/recipe/recipesinfo?page=1&limit=2`);

    // 2. Try the search endpoint with different prefixes
    await tryFetch(`${BASE_URL}/recipebyingredient/by-ingredients-categories-title?title=chicken&page=1&limit=1`);
    await tryFetch(`${BASE_URL}/recipe/recipebyingredient/by-ingredients-categories-title?title=chicken&page=1&limit=1`);

    // 3. Try a known detail endpoint if we had an ID
    // await tryFetch(`${BASE_URL}/search-recipe/1`);
}

debug();
