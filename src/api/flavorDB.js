/**
 * Smart Flavor Profile System (CORS-Free)
 * Uses intelligent keyword matching since FlavorDB API is CORS-blocked from client-side
 */

/**
 * Intelligent flavor profile generator based on ingredient name analysis
 * This uses culinary keywords to determine dominant tastes
 */
export const getIngredientFlavorProfile = (ingredientName) => {
    const name = ingredientName.toLowerCase().trim();

    // Keyword-based flavor mapping (inspired by FlavorDB categorizations)
    const flavorKeywords = {
        // SOUR ingredients
        sour: {
            keywords: ['lemon', 'lime', 'vinegar', 'citrus', 'orange', 'grapefruit', 'tamarind',
                'yogurt', 'sour cream', 'buttermilk', 'cranberry', 'pomegranate', 'kiwi',
                'green apple', 'sauerkraut', 'kimchi', 'pickle'],
            score: 85
        },
        // SWEET ingredients  
        sweet: {
            keywords: ['sugar', 'honey', 'maple syrup', 'agave', 'molasses', 'caramel', 'chocolate',
                'vanilla', 'banana', 'mango', 'strawberry', 'peach', 'pear', 'apple', 'grape',
                'cherry', 'melon', 'dates', 'raisins', 'fig', 'sweet potato', 'corn', 'carrot'],
            score: 80
        },
        // SPICY/HOT ingredients
        spicy: {
            keywords: ['chili', 'pepper', 'cayenne', 'jalapeño', 'habanero', 'tabasco', 'sriracha',
                'wasabi', 'horseradish', 'ginger', 'garlic', 'onion', 'mustard', 'radish'],
            score: 90
        },
        // BITTER ingredients
        bitter: {
            keywords: ['coffee', 'dark chocolate', 'kale', 'arugula', 'endive', 'radicchio',
                'grapefruit', 'beer', 'tonic', 'cocoa', 'tea', 'turmeric', 'fenugreek'],
            score: 75
        },
        // SAVORY/UMAMI ingredients
        savory: {
            keywords: ['salt', 'soy sauce', 'fish sauce', 'miso', 'parmesan', 'cheese', 'mushroom',
                'tomato', 'beef', 'chicken', 'pork', 'bacon', 'anchovy', 'seaweed', 'broth',
                'stock', 'meat', 'shrimp', 'crab', 'lobster', 'salmon', 'tuna'],
            score: 80
        }
    };

    const profile = {
        sweet: 0,
        sour: 0,
        spicy: 0,
        bitter: 0,
        savory: 0
    };

    // Check each taste category
    for (const [taste, data] of Object.entries(flavorKeywords)) {
        for (const keyword of data.keywords) {
            if (name.includes(keyword)) {
                profile[taste] = Math.max(profile[taste], data.score);
                // Partial match bonus (e.g., "lemon juice" matches "lemon")
                break; // Only count the first match per category
            }
        }
    }

    // Special cases and combinations
    if (name.includes('juice')) {
        // Juice enhances sour/sweet depending on base
        if (profile.sour > 0) profile.sour = Math.min(100, profile.sour + 10);
        if (profile.sweet > 0) profile.sweet = Math.min(100, profile.sweet + 10);
    }

    if (name.includes('water') || name.includes('ice')) {
        // Neutral - minimal flavor
        return { sweet: 0, sour: 0, spicy: 0, bitter: 0, savory: 0 };
    }

    // If no matches found, return empty profile
    return profile;
};

/**
 * Get enhanced flavor profile for a list of ingredients
 * Uses intelligent keyword matching for accurate flavor representation
 */
export const getEnhancedFlavorProfile = async (ingredients) => {
    console.log('[FlavorProfile] Analyzing ingredients with smart keyword system...');

    const profiles = ingredients.map((ing) => {
        // First try the smart keyword analysis
        const smartProfile = getIngredientFlavorProfile(ing.name);

        // Check if smart profile found anything
        const hasProfile = Object.values(smartProfile).some(v => v > 0);

        if (hasProfile) {
            console.log(`[FlavorProfile] Smart profile for "${ing.name}":`, smartProfile);
            return smartProfile;
        }

        // Fallback to ingredient's static flavor profile if exists
        if (ing.flavorProfile) {
            console.log(`[FlavorProfile] Using static profile for "${ing.name}"`);
            return ing.flavorProfile;
        }

        // Last resort: generic savory
        console.log(`[FlavorProfile] No profile found for "${ing.name}", using default`);
        return { sweet: 0, sour: 0, spicy: 0, bitter: 0, savory: 30 };
    });

    // Average all profiles
    const totalProfile = {
        sweet: 0,
        sour: 0,
        spicy: 0,
        bitter: 0,
        savory: 0
    };

    profiles.forEach(p => {
        totalProfile.sweet += p.sweet || 0;
        totalProfile.sour += p.sour || 0;
        totalProfile.spicy += p.spicy || 0;
        totalProfile.bitter += p.bitter || 0;
        totalProfile.savory += p.savory || 0;
    });

    const count = profiles.length || 1;

    const finalProfile = {
        sweet: Math.round(totalProfile.sweet / count),
        sour: Math.round(totalProfile.sour / count),
        spicy: Math.round(totalProfile.spicy / count),
        bitter: Math.round(totalProfile.bitter / count),
        savory: Math.round(totalProfile.savory / count)
    };

    console.log('[FlavorProfile] Final aggregated profile:', finalProfile);
    return finalProfile;
};
