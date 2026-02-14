const API_KEY = '57LRqGATNP5FezXIhdlmMRDilHujHD8_QujEeBqy3_yAA6i3';

/**
 * Fetches a list of recipes from the default recipesinfo endpoint.
 */
export const fetchRecipes = async (page = 1, limit = 5) => {
    try {
        // This endpoint IS under the /recipe/ prefix
        const response = await fetch(`/recipe2-api/recipe/recipesinfo?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('RecipeDB Fetch Error:', error);
        return null;
    }
};

/**
 * Chained search logic:
 * 1. Find UP TO 5 recipes with the ingredient.
 * 2. Get the full ingredient list for those recipes (Up to 3 in parallel).
 * 3. Extract matching ingredients from ANY of them.
 * 4. Return unique list.
 */
export const searchIngredientsInRecipes = async (query) => {
    try {
        console.log(`[API] Searching recipes containing: "${query}"`);

        // Step 1: Search for recipes (Limit increased to 5)
        const searchUrl = `/recipe2-api/recipebyingredient/by-ingredients-categories-title?includeIngredients=${query}&page=1&limit=5`;

        const searchRes = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!searchRes.ok) {
            console.error(`[API] Search Failed: ${searchRes.status} for URL: ${searchUrl}`);
            return [];
        }

        const searchData = await searchRes.json();
        const payload = searchData.payload || searchData;

        if (!payload.data || payload.data.length === 0) {
            console.warn(`[API] No recipes found containing "${query}"`);
            return [];
        }

        // Take top 3 recipes to avoid too many requests
        const recipes = payload.data.slice(0, 3);
        console.log(`[API] Found ${recipes.length} potential recipes. Fetching details...`);

        // Step 2: Fetch details in parallel
        const detailPromises = recipes.map(recipe =>
            fetch(`/recipe2-api/search-recipe/${recipe.Recipe_id}`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            }).then(res => res.ok ? res.json() : null)
        );

        const details = await Promise.all(detailPromises);

        // Step 3: Extract & Flatten
        let allMatches = [];
        const seenNames = new Set(); // For deduplication

        details.forEach(detailData => {
            if (!detailData) return;
            const detailPayload = detailData.payload || detailData;
            const ingredients = detailPayload.ingredients || detailPayload.Ingredients || [];

            // Find ALL matches in this recipe, not just one
            const matches = ingredients.filter(i => {
                const name = i.ingredient || '';
                const phrase = i.ingredient_Phrase || '';
                return name.toLowerCase().includes(query.toLowerCase()) ||
                    phrase.toLowerCase().includes(query.toLowerCase());
            });

            matches.forEach(match => {
                const name = match.ingredient;
                // Simple deduplication by name
                if (!seenNames.has(name.toLowerCase())) {
                    seenNames.add(name.toLowerCase());
                    allMatches.push({
                        id: `api_${match.ing_id || Math.random().toString(36).substr(2, 9)}`,
                        name: match.ingredient,
                        scientific: match.ingredient_Phrase || match.ingredient,
                        category: 'IMPORTED',
                        tags: ['API_SOURCED', 'LIVE_DATA'],
                        icon: '🌐',
                        color: '#00e5ff',
                        unit: match.unit || 'piece', // Default to 'piece' if no unit (usually means 1 whole)
                        flavorProfile: { neutral: 50, savory: 50 },
                        nutrition: { calories: 50, protein: 0, fat: 0, carbs: 0 },
                        chemicals: ['Unknown Compound'],
                        interactionAlerts: []
                    });
                }
            });
        });

        console.log(`[API] Found ${allMatches.length} unique ingredients.`);
        return allMatches;

    } catch (error) {
        console.error('[API] Fatal Error in searchIngredientsInRecipes:', error);
        return [];
    }
};

/**
 * Fetches full details for a specific recipe ID.
 */
export const fetchRecipeDetails = async (recipeId) => {
    try {
        const response = await fetch(`/recipe2-api/search-recipe/${recipeId}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!response.ok) throw new Error('Failed to fetch details');

        const data = await response.json();
        const payload = data.payload || data;

        // Normalize ingredients
        const rawIngredients = payload.ingredients || payload.Ingredients || [];
        const normalizedIngredients = rawIngredients.map(match => ({
            id: `api_${match.ing_id || Math.random().toString(36).substr(2, 9)}`,
            name: match.ingredient,
            scientific: match.ingredient_Phrase || match.ingredient,
            category: 'IMPORTED',
            tags: ['API_SOURCED', 'RECIPE_IMPORT'],
            icon: '🍲',
            color: '#00e5ff',
            quantity: parseFloat(match.quantity) || 0,
            unit: match.unit || 'piece',
            flavorProfile: { neutral: 50, savory: 50 },
            nutrition: { calories: 50, protein: 0, fat: 0, carbs: 0 },
            chemicals: ['Unknown Compound'],
            interactionAlerts: []
        }));

        return {
            ...payload,
            normalizedIngredients
        };

    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
};

/**
 * Identifies a recipe based on a list of ingredients.
 * Returns the title of the best match, or null.
 */
export const identifyRecipe = async (ingredients) => {
    try {
        if (!ingredients || ingredients.length === 0) return null;

        // Create a comma-separated list of ingredient names
        // Filter out very common/generic items if list is long? For now, just send top 5 unique names
        const names = [...new Set(ingredients.map(i => i.name))].slice(0, 5).join(',');

        console.log(`[API] Identifying recipe with: ${names}`);

        const searchUrl = `/recipe2-api/recipebyingredient/by-ingredients-categories-title?includeIngredients=${encodeURIComponent(names)}&page=1&limit=1`;

        const response = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!response.ok) {
            console.error(`[API] Identification Failed: ${response.status} for URL: ${searchUrl}`);
            return null;
        }

        const data = await response.json();
        const payload = data.payload || data;
        const recipes = payload.data || [];

        if (recipes.length > 0) {
            // Return the title of the first match
            return recipes[0].Recipe_title;
        }

        return null;

    } catch (error) {
        console.error('Error identifying recipe:', error);
        return null;
    }
};
