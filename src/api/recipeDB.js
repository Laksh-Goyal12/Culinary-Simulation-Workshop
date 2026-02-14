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

    const performFetch = async (retryCount = 0) => {
        try {
            console.log(`[API] Searching recipes containing: "${query}" (Attempt ${retryCount + 1})`);

            // Step 1: Search for recipes
            const searchUrl = `/recipe2-api/recipebyingredient/by-ingredients-categories-title?includeIngredients=${query}&page=1&limit=5`;

            const searchRes = await fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                },
            });

            if (!searchRes.ok) {
                if (searchRes.status >= 500 && retryCount < 1) {
                    console.warn(`[API] Search 500 error, retrying...`);
                    return performFetch(retryCount + 1);
                }
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
            if (retryCount < 1) {
                console.warn(`[API] Fatal Error, retrying...`, error);
                return performFetch(retryCount + 1);
            }
            console.error('[API] Fatal Error in searchIngredientsInRecipes:', error);
            return [];
        }
    };

    return performFetch();
};

/**
 * Fetches full details for a specific recipe ID.
 */
// Static details for fallback recipes (IDs 1000-1004) to prevent AIP errors
const STATIC_RECIPE_DETAILS = {
    '1000': {
        Recipe_id: '1000',
        title: 'Classic Masala Chai',
        category: 'Beverage',
        nutrition: { calories: 120 },
        ingredients: [
            { name: 'Water', quantity: 1, unit: 'cup' },
            { name: 'Milk', quantity: 0.5, unit: 'cup' },
            { name: 'Black Tea Leaves', quantity: 1, unit: 'tsp' },
            { name: 'Ginger', quantity: 1, unit: 'inch' },
            { name: 'Cardamom', quantity: 2, unit: 'pods' },
            { name: 'Sugar', quantity: 2, unit: 'tsp' }
        ],
        instructions: "1. Boil water with ginger and cardamom.\n2. Add tea leaves and simmer for 2 mins.\n3. Add milk and sugar, bring to a boil.\n4. Strain and serve hot."
    },
    '1001': {
        Recipe_id: '1001',
        title: 'Spicy Chicken Momos',
        category: 'Appetizer',
        nutrition: { calories: 350 },
        ingredients: [
            { name: 'All Purpose Flour', quantity: 2, unit: 'cups' },
            { name: 'Minced Chicken', quantity: 250, unit: 'g' },
            { name: 'Onion', quantity: 1, unit: 'pc' },
            { name: 'Ginger Garlic Paste', quantity: 1, unit: 'tbsp' },
            { name: 'Soy Sauce', quantity: 1, unit: 'tsp' }
        ],
        instructions: "1. Prepare dough with flour and water.\n2. Mix chicken with spices and sauces.\n3. Roll dough, stuff with filling, and shape momos.\n4. Steam for 10-12 minutes until cooked."
    },
    '1002': {
        Recipe_id: '1002',
        title: 'Vegetable Biryani',
        category: 'Main Course',
        nutrition: { calories: 450 },
        ingredients: [
            { name: 'Basmati Rice', quantity: 1, unit: 'cup' },
            { name: 'Mixed Vegetables', quantity: 1, unit: 'cup' },
            { name: 'Yogurt', quantity: 0.5, unit: 'cup' },
            { name: 'Biryani Masala', quantity: 1, unit: 'tbsp' },
            { name: 'Saffron Milk', quantity: 2, unit: 'tbsp' }
        ],
        instructions: "1. Cook rice until 70% done.\n2. Sauté vegetables with spices and yogurt.\n3. Layer rice over vegetables, add saffron milk.\n4. Cook on low heat (dum) for 20 minutes."
    },
    '1003': {
        Recipe_id: '1003',
        title: 'Butter Chicken',
        category: 'Main Course',
        nutrition: { calories: 600 },
        ingredients: [
            { name: 'Chicken', quantity: 500, unit: 'g' },
            { name: 'Butter', quantity: 50, unit: 'g' },
            { name: 'Tomato Puree', quantity: 1, unit: 'cup' },
            { name: 'Cream', quantity: 0.5, unit: 'cup' },
            { name: 'Kasuri Methi', quantity: 1, unit: 'tsp' }
        ],
        instructions: "1. Marinate and grill chicken pieces.\n2. Prepare tomato gravy with butter and spices.\n3. Add chicken and simmer.\n4. Finish with cream and crushed kasuri methi."
    },
    '1004': {
        Recipe_id: '1004',
        title: 'Paneer Tikka',
        category: 'Appetizer',
        nutrition: { calories: 300 },
        ingredients: [
            { name: 'Paneer', quantity: 250, unit: 'g' },
            { name: 'Yogurt', quantity: 0.5, unit: 'cup' },
            { name: 'Besan', quantity: 1, unit: 'tbsp' },
            { name: 'Bell Peppers', quantity: 1, unit: 'cup' },
            { name: 'Chaat Masala', quantity: 1, unit: 'tsp' }
        ],
        instructions: "1. Marinate paneer and veggies in spiced yogurt.\n2. Skewer them alternately.\n3. Grill or roast in oven until charred.\n4. Serve with mint chutney."
    }
};

export const fetchRecipeDetails = async (recipeId) => {
    // Check for cached fallback request
    if (STATIC_RECIPE_DETAILS[recipeId]) {
        console.log(`[API] Serving static details for fallback recipe: ${recipeId}`);
        return STATIC_RECIPE_DETAILS[recipeId];
    }

    const cacheKey = `recipe_details_${recipeId}`;

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
        // Validation: If cached data has null calories, missing title, or 0-quantity ingredients, treat it as stale
        const hasBadTitle = !cached.title || cached.title === 'Untitled Recipe' || cached.title === 'Untitled Dish';
        const hasZeroQuantity = cached.ingredients && cached.ingredients.some(i => i.quantity === 0 || i.quantity === '0');
        const needsRefetch = (cached.nutrition?.calories === null || cached.nutrition?.calories === undefined) || hasBadTitle || hasZeroQuantity;
        const hasUnknown = cached.ingredients && cached.ingredients.some(i => i.name === 'Unknown');

        if (!needsRefetch && !hasUnknown) {
            console.log(`[Cache] Recipe details loaded from cache: ${recipeId}`);
            return cached;
        }
        console.warn(`[Cache] Cached data for ${recipeId} is stale (missing data or has 0-qty ingredients). Re-fetching.`);
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

        const ingredients = rawIngredients
            .map(ing => ({
                name: ing.ingredient_name || ing.Ingredient_name || ing.ingredient || ing.Ingredient || ing.name || ing.food || ing.text || ing.original || 'Unknown',
                quantity: ing.quantity || ing.Quantity || 0,
                unit: ing.unit || ing.Unit || ''
            }))
            .filter(ing => ing.quantity !== 0 && ing.quantity !== '0');

        // Normalize nutrition (handle various API locations for calories)
        const nutrition = payload.nutrition || payload.Nutrition || payload.totalNutrients || {};

        // Exhaustive title lookup
        const findTitleDeep = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            const keys = Object.keys(obj);
            const titleKeys = ['recipe_title', 'recipe_name', 'title', 'name', 'label', 'header'];

            for (const key of keys) {
                const lowKey = key.toLowerCase();
                if (titleKeys.some(tk => lowKey === tk || (lowKey.includes('recipe') && lowKey.includes('title')))) {
                    if (typeof obj[key] === 'string' && obj[key].trim() !== '' && obj[key].toLowerCase() !== 'untitled recipe') return obj[key];
                }
            }

            for (const key of keys) {
                if (typeof obj[key] === 'object' && key !== 'ingredients' && key !== 'Ingredients') {
                    const found = findTitleDeep(obj[key]);
                    if (found) return found;
                }
            }
            return null;
        };

        // Exhaustive calorie lookup
        const findCalorieDeep = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            const keys = Object.keys(obj);
            const calorieKeys = ['energy', 'calories', 'kcal', 'enerc_kcal', 'energy (kcal)', 'recipe_calories'];
            for (const key of keys) {
                const lowKey = key.toLowerCase();
                if (calorieKeys.some(ck => lowKey.includes(ck))) {
                    const value = obj[key];
                    if (value && typeof value === 'object' && value.quantity !== undefined) return value.quantity;
                    if (value !== undefined && value !== null && !isNaN(parseFloat(value))) return parseFloat(value);
                }
            }
            for (const key of keys) {
                if (typeof obj[key] === 'object' && key !== 'ingredients' && key !== 'Ingredients') {
                    const found = findCalorieDeep(obj[key]);
                    if (found !== null) return found;
                }
            }
            return null;
        };

        const discoveredTitle = findTitleDeep(payload);
        const calories = findCalorieDeep(payload);

        const recipeData = {
            id: payload.Recipe_id || payload.recipe_id,
            _debugPayload: payload,
            title: discoveredTitle || payload.Recipe_title || payload.recipe_title || payload.title || payload.name || payload.header || 'Untitled Recipe',
            ingredients,
            instructions: payload.Instructions || payload.instructions || '',
            image: payload.image_url || payload.Image_url || '',
            nutrition: {
                ...nutrition,
                calories: calories !== null ? Math.round(calories) : null
            },
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
 */
export const searchRecipesByTitle = async (title, limit = 10, page = 1) => {
    const performSearch = async (retryCount = 0) => {
        try {
            if (!title || !title.trim()) {
                return { payload: { data: [] } };
            }

            console.log(`[API] Searching recipes by title: "${title}" (page ${page}) (Attempt ${retryCount + 1})`);

            const searchUrl = `/recipe2-api/recipebyingredient/by-ingredients-categories-title?title=${encodeURIComponent(title)}&page=${page}&limit=${limit}`;

            const response = await fetch(searchUrl, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            if (!response.ok) {
                if (response.status >= 500 && retryCount < 1) {
                    console.warn(`[API] Title search 500 error, retrying...`);
                    return performSearch(retryCount + 1);
                }
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
            if (retryCount < 1) {
                console.warn(`[API] Title search fatal error, retrying...`, error);
                return performSearch(retryCount + 1);
            }
            console.error('Error searching recipes by title:', error);
            return { payload: { data: [] } };
        }
    };

    return performSearch();
};

/**
 * Get top 5 recipe matches based on ingredients
 * Returns array of recipes sorted by relevance
 */
export const getTopRecipeMatches = async (ingredients) => {
    const performMatches = async (retryCount = 0) => {
        try {
            if (!ingredients || ingredients.length === 0) {
                // If no ingredients, return default recipes
                return fetchRecipes(1, 5);
            }

            // Create comma-separated list of ingredient names for API search
            const vesselNames = [...new Set(ingredients.map(i => i.name.toLowerCase().trim()))];
            const namesQuery = vesselNames.slice(0, 5).join(',');

            console.log(`[API] Fetching candidates for coverage match: ${namesQuery} (Attempt ${retryCount + 1})`);

            const searchUrl = `/recipe2-api/recipebyingredient/by-ingredients-categories-title?includeIngredients=${encodeURIComponent(namesQuery)}&page=1&limit=8`;

            const response = await fetch(searchUrl, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            if (!response.ok) {
                if (response.status >= 500 && retryCount < 1) {
                    console.warn(`[API] Coverage matches 500 error, retrying...`);
                    return performMatches(retryCount + 1);
                }
                console.error(`[API] Coverage matches failed: ${response.status}`);
                return fetchRecipes(1, 5);
            }

            const data = await response.json();
            const payload = data.payload || data;
            const candidates = payload.data || [];

            if (candidates.length === 0) return { payload: { data: [] } };

            // Step 2: Fetch details for top 6 candidates to calculate real coverage
            // We fetch details because the list endpoint doesn't give us the full ingredient list needed for accurate scoring
            const detailPromises = candidates.slice(0, 6).map(async (candidate) => {
                const details = await fetchRecipeDetails(candidate.Recipe_id);
                if (!details || !details.ingredients) return null;

                // Calculate Match Count
                const recipeIngredientNames = details.ingredients.map(i => i.name.toLowerCase().trim());
                const matchCount = vesselNames.filter(name =>
                    recipeIngredientNames.some(rin => rin.includes(name) || name.includes(rin))
                ).length;

                return {
                    ...candidate,
                    matchCount,
                    matchTotal: vesselNames.length,
                    matchPercentage: Math.round((matchCount / vesselNames.length) * 100),
                    recipeTotal: details.ingredients.length,
                    purity: matchCount / details.ingredients.length, // Higher means fewer extra ingredients
                    fullDetails: details
                };
            });

            const scoredRecipes = (await Promise.all(detailPromises))
                .filter(r => r !== null)
                .sort((a, b) => {
                    // Primary Sort: Ingredient Coverage (Max Match)
                    if (b.matchCount !== a.matchCount) {
                        return b.matchCount - a.matchCount;
                    }
                    // Secondary Sort: Simplicity Purity (Tie-breaker)
                    return b.purity - a.purity;
                });

            return {
                payload: {
                    data: scoredRecipes
                }
            };

        } catch (error) {
            if (retryCount < 1) {
                console.warn(`[API] Coverage matches fatal error, retrying...`, error);
                return performMatches(retryCount + 1);
            }
            console.error('Error fetching coverage recipe matches:', error);
            return fetchRecipes(1, 5);
        }
    };

    return performMatches();
};

/**
 * Filter recipes
 */
export const filterValidRecipes = async (recipes) => {
    if (!recipes || recipes.length === 0) return [];

    console.log(`[Validation] Checking ${recipes.length} recipes for validity...`);

    const validations = await Promise.all(recipes.map(async (recipe) => {
        try {
            const details = await fetchRecipeDetails(recipe.Recipe_id);

            if (!details || !details.ingredients || details.ingredients.length === 0) {
                return null;
            }

            const invalidIngredients = details.ingredients.filter(i =>
                i.name === 'Unknown' || !i.name || i.name.trim() === ''
            ).length;

            if (invalidIngredients > details.ingredients.length / 2) {
                return null;
            }

            // Brute force discovery
            const fdTitle = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                const keys = Object.keys(obj);
                const titleKeys = ['recipe_title', 'recipe_name', 'title', 'name', 'label', 'header'];
                for (const key of keys) {
                    const lowKey = key.toLowerCase();
                    if (titleKeys.some(tk => lowKey === tk || (lowKey.includes('recipe') && lowKey.includes('title')))) {
                        if (typeof obj[key] === 'string' && obj[key].trim() !== '') return obj[key];
                    }
                }
                for (const key of keys) {
                    if (typeof obj[key] === 'object' && key !== 'ingredients') {
                        const found = fdTitle(obj[key]);
                        if (found) return found;
                    }
                }
                return null;
            };

            const fdCal = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                const keys = Object.keys(obj);
                const calorieKeys = ['energy', 'calories', 'kcal', 'enerc_kcal', 'energy (kcal)', 'recipe_calories'];
                for (const key of keys) {
                    const lowKey = key.toLowerCase();
                    if (calorieKeys.some(ck => lowKey.includes(ck))) {
                        const val = obj[key];
                        if (val && typeof val === 'object' && val.quantity !== undefined) return val.quantity;
                        if (val !== undefined && val !== null && !isNaN(parseFloat(val))) return parseFloat(val);
                    }
                }
                for (const key of keys) {
                    if (typeof obj[key] === 'object' && key !== 'ingredients') {
                        const found = fdCal(obj[key]);
                        if (found !== null) return found;
                    }
                }
                return null;
            };

            const searchResultCal = fdCal(recipe);
            const searchResultTitle = fdTitle(recipe);
            const detailCal = details.nutrition?.calories;
            const detailTitle = details.title;
            const finalTitle = searchResultTitle || detailTitle || recipe.Recipe_title || recipe.title || 'Untitled Dish';

            return {
                ...recipe,
                Recipe_title: finalTitle,
                image_url: details.image || recipe.image_url || recipe.Image_url,
                calories: (detailCal !== undefined && detailCal !== null) ? detailCal : (searchResultCal !== null ? Math.round(searchResultCal) : null),
                ingredientCount: details.ingredients ? details.ingredients.length : 0,
                category: details.category || 'General'
            };
        } catch (e) {
            return null;
        }
    }));

    return validations.filter(r => r !== null);
};

/**
 * Identifies a recipe
 */
export const identifyRecipe = async (ingredients) => {
    try {
        if (!ingredients || ingredients.length === 0) return null;
        const names = [...new Set(ingredients.map(i => i.name))].slice(0, 5).join(',');
        const searchUrl = `/recipe2-api/recipebyingredient/by-ingredients-categories-title?includeIngredients=${encodeURIComponent(names)}&page=1&limit=1`;
        const response = await fetch(searchUrl, {
            headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        if (!response.ok) return null;
        const data = await response.json();
        const payload = data.payload || data;
        const recipes = payload.data || [];
        if (recipes.length > 0) {
            return {
                title: recipes[0].Recipe_title,
                id: recipes[0].Recipe_id
            };
        }
        return null;
    } catch (error) {
        return null;
    }
};

/**
 * Fetches the Recipe of the Day
 */
// In-memory promise cache to prevent double-invocation (Strict Mode / Rapid Re-mounts)
let recipeOfTheDayPromise = null;

/**
 * Fetches the Recipe of the Day
 */
export const fetchRecipeOfTheDay = async () => {
    const cacheKey = `recipe_of_the_day_v2_${new Date().toDateString()}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    // If a request is already in flight, return that promise
    if (recipeOfTheDayPromise) return recipeOfTheDayPromise;

    // Start a new request and cache the promise
    recipeOfTheDayPromise = (async () => {
        try {
            console.log('[API] Fetching Recipe of the Day...');
            const response = await fetch('/recipe2-api/recipe/recipe-of-the-day', {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const recipe = data.payload || data;

            if (!recipe || (!recipe.Recipe_title && !recipe.title)) throw new Error('Invalid recipe data');

            setCachedData(cacheKey, recipe);
            return recipe;
        } catch (error) {
            console.warn('[API] Recipe of the Day failed, using fallback:', error);
            // Fallback: Use static list to ensure we ALWAYS show something, even if API is dead
            const STATIC_RECIPES = [
                { Recipe_title: 'Classic Masala Chai', Recipe_id: '1000' },
                { Recipe_title: 'Spicy Chicken Momos', Recipe_id: '1001' },
                { Recipe_title: 'Vegetable Biryani', Recipe_id: '1002' },
                { Recipe_title: 'Butter Chicken', Recipe_id: '1003' },
                { Recipe_title: 'Paneer Tikka', Recipe_id: '1004' }
            ];
            const randomFallback = STATIC_RECIPES[Math.floor(Math.random() * STATIC_RECIPES.length)];

            // STRICT CACHING: Save the fallback as "today's recipe" so we don't try the broken API again today
            setCachedData(cacheKey, randomFallback);

            return randomFallback;
        } finally {
            // Clear the promise so next day (or next manual call if failed) can try again if allowed
            // We keep it nulled only after completion. 
            // Actually for "Recipe of the Day", once cached, we don't need to clear it, 
            // but clearing it allows the function to check localStorage next time.
            recipeOfTheDayPromise = null;
        }
    })();

    return recipeOfTheDayPromise;
};
