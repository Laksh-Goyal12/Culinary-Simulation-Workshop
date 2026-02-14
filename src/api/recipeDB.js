import { getCachedData, setCachedData } from '../utils/cacheUtils';

const API_KEY = 'uHGtgPo6qtX39lVa2UUnLDCtpeNAzN-DyDJTLc0M6wUbGWM3';

/**
 * Fetches a list of recipes from the default recipesinfo endpoint.
 */
export const fetchRecipes = async (page = 1, limit = 5) => {
    const cacheKey = `recipe_list_page_${page}_limit_${limit}`;

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
        // This endpoint IS under the /recipe/ prefix
        const response = await fetch(`/recipe2-api/recipe/recipesinfo?page=${page}&limit=${limit}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        // Cache the result
        setCachedData(cacheKey, data);

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
    const cacheKey = `ingredient_search_${query.toLowerCase()}`;

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

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

        // Cache the result
        setCachedData(cacheKey, allMatches);

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
    const cacheKey = `recipe_details_${recipeId}`;

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
        // Validation: If cached data has "Unknown" ingredients, treat it as stale/invalid
        // because we might have improved the mapping logic since it was cached.
        const hasUnknown = cached.ingredients && cached.ingredients.some(i => i.name === 'Unknown');
        if (!hasUnknown) {
            console.log(`[Cache] Recipe details loaded from cache: ${recipeId}`);
            return cached;
        }
        console.warn(`[Cache] Cached data for ${recipeId} has 'Unknown' ingredients. Invalidating and re-fetching.`);
        localStorage.removeItem(cacheKey); // Explicitly remove
    }

    try {
        const response = await fetch(`/recipe2-api/search-recipe/${recipeId}`, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!response.ok) throw new Error('Failed to fetch details');

        const data = await response.json();
        const payload = data.payload || data;

        // DEBUG: Explicitly log all keys to find the title field
        console.log(`[API] Payload keys for ${recipeId}:`, Object.keys(payload));

        console.log(`[API] Raw details for ${recipeId}:`, payload);

        // Normalize ingredients (handle various API casings)
        const rawIngredients = payload.Ingredients || payload.ingredients || [];

        if (rawIngredients.length > 0) {
            console.log('[API] First ingredient keys:', Object.keys(rawIngredients[0]));
        }

        const ingredients = rawIngredients.map(ing => ({
            name: ing.ingredient_name || ing.Ingredient_name || ing.ingredient || ing.Ingredient || ing.name || ing.food || ing.text || ing.original || 'Unknown',
            quantity: ing.quantity || ing.Quantity || 0,
            unit: ing.unit || ing.Unit || ''
        }));

        const recipeData = {
            id: payload.Recipe_id || payload.recipe_id,
            // Capture raw payload for debug if title is missing
            _debugPayload: payload,
            title: payload.Recipe_title || payload.recipe_title || payload.title || payload.name || payload.header || 'Untitled Recipe',
            ingredients,
            instructions: payload.Instructions || payload.instructions || '',
            image: payload.image_url || payload.Image_url || '',
            nutrition: payload.nutrition || {},
            category: payload.Recipe_category || payload.recipe_category || payload.category || 'General'
        };

        // Save to cache
        setCachedData(cacheKey, recipeData);
        console.log(`[Cache] Recipe details saved to cache: ${recipeId}`);

        return recipeData;
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        return null;
    }
};

/**
 * Search recipes by title
 * @param {string} title - Recipe title to search for
 * @param {number} limit - Number of results to return
 * @param {number} page - Page number for pagination
 * @returns {Promise} - Recipe search results
 */
export const searchRecipesByTitle = async (title, limit = 10, page = 1) => {
    try {
        if (!title || !title.trim()) {
            return { payload: { data: [] } };
        }

        console.log(`[API] Searching recipes by title: "${title}" (page ${page})`);

        const searchUrl = `/recipe2-api/recipebyingredient/by-ingredients-categories-title?title=${encodeURIComponent(title)}&page=${page}&limit=${limit}`;

        const response = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!response.ok) {
            console.error(`[API] Title search failed: ${response.status}`);
            return { payload: { data: [] } };
        }

        const data = await response.json();

        // Save search results to localStorage
        if (data && data.payload && data.payload.data) {
            try {
                const cacheKey = `search_results_${title.toLowerCase().trim()}_page${page}`;
                localStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    query: title,
                    page: page,
                    results: data.payload.data
                }));
                console.log(`[Cache] Saved search results for "${title}" page ${page}`);
            } catch (error) {
                console.warn('[Cache] Failed to save search results:', error);
            }
        }

        return data;

    } catch (error) {
        console.error('Error searching recipes by title:', error);
        return { payload: { data: [] } };
    }
};

/**
 * Get top 5 recipe matches based on ingredients
 * Returns array of recipes sorted by relevance
 */
export const getTopRecipeMatches = async (ingredients) => {
    try {
        if (!ingredients || ingredients.length === 0) {
            // If no ingredients, return default recipes
            return fetchRecipes(1, 5);
        }

        // Create comma-separated list of ingredient names
        const names = [...new Set(ingredients.map(i => i.name))].slice(0, 5).join(',');

        console.log(`[API] Fetching top matches for: ${names}`);

        const searchUrl = `/recipe2-api/recipebyingredient/by-ingredients-categories-title?includeIngredients=${encodeURIComponent(names)}&page=1&limit=5`;

        const response = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });

        if (!response.ok) {
            console.error(`[API] Top matches failed: ${response.status}`);
            // Fallback to default recipes
            return fetchRecipes(1, 5);
        }

        const data = await response.json();
        const payload = data.payload || data;
        const recipes = payload.data || [];

        // Return in same format as fetchRecipes
        return {
            payload: {
                data: recipes
            }
        };

    } catch (error) {
        console.error('Error fetching top recipe matches:', error);
        // Fallback to default recipes
        return fetchRecipes(1, 5);
    }
};

/**
 * Filter out recipes that have no ingredients or invalid data.
 * This performs a parallel check on details if needed.
 */
export const filterValidRecipes = async (recipes) => {
    if (!recipes || recipes.length === 0) return [];

    console.log(`[Validation] Checking ${recipes.length} recipes for validity...`);

    const validations = await Promise.all(recipes.map(async (recipe) => {
        // We need to fetch details to know if it has ingredients
        // Using fetchRecipeDetails which caches, so it's efficient for repeats
        try {
            const details = await fetchRecipeDetails(recipe.Recipe_id);

            // Check 1: Must have ingredients array
            if (!details || !details.ingredients || details.ingredients.length === 0) {
                console.warn(`[Validation] Dropping empty recipe: ${recipe.Recipe_id}`);
                return null;
            }

            // Check 2: Must have valid ingredient names (reject if >50% are Unknown)
            // AND check if name is empty string
            const invalidIngredients = details.ingredients.filter(i =>
                i.name === 'Unknown' || !i.name || i.name.trim() === ''
            ).length;

            if (invalidIngredients > details.ingredients.length / 2) {
                console.warn(`[Validation] Dropping malformed recipe (mostly unknown/empty ingredients): ${recipe.Recipe_id}`);
                return null;
            }

            // Check 3: Check for missing title (Removing strict check to avoid dropping valid recipes with bad metadata)
            // if (!details.title || details.title === 'Untitled Recipe' || details.title.trim() === '') {
            //     console.warn(`[Validation] Dropping untitled recipe: ${recipe.Recipe_id}`);
            //     // RETURN NULL REMOVED - Let them pass but maybe warn?
            // }

            // Merge detailed info into the returned recipe object so the UI can use it
            return {
                ...recipe,
                // Ensure consistent naming - Fallback to existing title if details.title is missing
                Recipe_title: details.title || recipe.Recipe_title || recipe.title || 'Untitled Dish',
                image_url: details.image || recipe.image_url || recipe.Image_url,
                calories: details.nutrition?.calories || 0,
                ingredientCount: details.ingredients ? details.ingredients.length : 0,
                category: details.category || 'General'
            };
        } catch (e) {
            console.warn(`[Validation] Error checking recipe ${recipe.Recipe_id}`, e);
            return null;
        }
    }));

    const valid = validations.filter(r => r !== null);
    console.log(`[Validation] ${valid.length}/${recipes.length} recipes represent valid dishes.`);
    return valid;
};

/**
 * Identifies a recipe based on a list of ingredients.
 * Returns an object with the recipe title and ID, or null.
 */
export const identifyRecipe = async (ingredients) => {
    try {
        if (!ingredients || ingredients.length === 0) return null;

        // Create a comma-separated list of ingredient names
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
            // Return both title and ID for fetching full details
            return {
                title: recipes[0].Recipe_title,
                id: recipes[0].Recipe_id
            };
        }

        return null;

    } catch (error) {
        console.error('Error identifying recipe:', error);
        return null;
    }
};
