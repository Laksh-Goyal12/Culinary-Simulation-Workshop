/**
 * FlavorDB Integration for Robust Flavor Profiles
 * Maps ingredients to flavor compounds and calculates enhanced flavor profiles
 */

import { getCachedData, setCachedData } from '../utils/cacheUtils.js';

// FlavorDB ingredient name to entity ID mapping (sample - can be expanded)
const FLAVORDB_ENTITY_MAP = {
    // Common ingredients
    'chicken': 200,
    'beef': 201,
    'pork': 202,
    'lamb': 203,
    'rice': 391,
    'wheat': 421,
    'corn': 105,
    'potato': 378,
    'tomato': 413,
    'onion': 343,
    'garlic': 178,
    'ginger': 182,
    'lemon': 266,
    'lime': 271,
    'apple': 18,
    'banana': 35,
    'strawberry': 403,
    'orange': 346,
    'milk': 301,
    'cheese': 80,
    'butter': 67,
    'egg': 147,
    'coffee': 96,
    'chocolate': 84,
    'vanilla': 424,
    'cinnamon': 90,
    'pepper': 360,
    'salt': 395, // Note: Salt might not have flavor compounds
    'sugar': 405,
    'honey': 226,
    'basil': 38,
    'mint': 304,
    'thyme': 410,
    'rosemary': 388,
    'carrot': 74,
    'celery': 77,
    'mushroom': 310,
    'peanut': 355,
    'almond': 11,
    'walnut': 429,
    'soy sauce': 399,
    'fish': 165,
    'shrimp': 398,
    'salmon': 393,
    'tuna': 418,
    'wine': 433,
    'beer': 44,
    'tea': 408,
    'oil': 340,
    'vinegar': 427,
    'yogurt': 438
};

/**
 * Fetch flavor compounds from FlavorDB for a given ingredient
 */
export const fetchFlavorCompounds = async (ingredientName) => {
    const normalizedName = ingredientName.toLowerCase().trim();
    const cacheKey = `flavordb_${normalizedName}`;

    // Check cache first
    const cached = getCachedData(cacheKey);
    if (cached) {
        console.log(`[FlavorDB] Cache HIT: ${normalizedName}`);
        return cached;
    }

    try {
        // Map ingredient name to FlavorDB entity ID
        const entityId = FLAVORDB_ENTITY_MAP[normalizedName];

        if (!entityId) {
            console.log(`[FlavorDB] No mapping for: ${normalizedName}`);
            return null;
        }

        const url = `https://cosylab.iiitd.edu.in/flavordb/entities_json?id=${entityId}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`[FlavorDB] API error for ${ingredientName}: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // Extract flavor profiles from molecules
        const flavorProfiles = [];
        if (data.molecules && Array.isArray(data.molecules)) {
            data.molecules.forEach(molecule => {
                if (molecule.flavor_profile) {
                    // Split "@" delimited flavor tags
                    const tags = molecule.flavor_profile.split('@').map(t => t.trim()).filter(t => t);
                    flavorProfiles.push(...tags);
                }
            });
        }

        const result = {
            entityId,
            category: data.category_readable,
            compoundCount: data.molecules?.length || 0,
            flavorTags: [...new Set(flavorProfiles)] // Unique tags
        };

        // Cache for 7 days (flavor data doesn't change)
        setCachedData(cacheKey, result, 7 * 24 * 60 * 60 * 1000);

        console.log(`[FlavorDB] Fetched ${result.compoundCount} compounds for ${ingredientName}`);
        return result;

    } catch (error) {
        console.error(`[FlavorDB] Error fetching ${ingredientName}:`, error);
        return null;
    }
};

/**
 * Map FlavorDB tags to our 5-taste radar chart
 * Returns enhanced flavor profile with weighted scores
 */
export const mapFlavorTagsToProfile = (flavorTags) => {
    if (!flavorTags || flavorTags.length === 0) {
        return { sweet: 0, sour: 0, spicy: 0, bitter: 0, savory: 0 };
    }

    const profile = {
        sweet: 0,
        sour: 0,
        spicy: 0,
        bitter: 0,
        savory: 0
    };

    // Keyword mapping from FlavorDB tags to taste categories
    const TASTE_KEYWORDS = {
        sweet: ['sweet', 'sugar', 'honey', 'caramel', 'vanilla', 'fruity', 'berry', 'candy', 'syrup'],
        sour: ['sour', 'acid', 'acidic', 'tart', 'tangy', 'citrus', 'lemon', 'vinegar', 'fermented'],
        spicy: ['spicy', 'hot', 'pungent', 'pepper', 'chili', 'ginger', 'heat', 'sharp', 'warm'],
        bitter: ['bitter', 'astringent', 'burnt', 'charred', 'roasted', 'tobacco', 'coffee', 'dark chocolate'],
        savory: ['savory', 'umami', 'meaty', 'meat', 'beef', 'broth', 'roast', 'chicken', 'fish',
            'cheese', 'soy', 'mushroom', 'earthy', 'rich', 'nutty', 'toasted']
    };

    // Count keyword matches
    const tagLower = flavorTags.map(t => t.toLowerCase());

    for (const [taste, keywords] of Object.entries(TASTE_KEYWORDS)) {
        let matchCount = 0;
        keywords.forEach(keyword => {
            matchCount += tagLower.filter(tag => tag.includes(keyword)).length;
        });
        profile[taste] = Math.min(100, matchCount * 10); // Cap at 100
    }

    return profile;
};

/**
 * Get enhanced flavor profile for a list of ingredients
 * Combines static data with FlavorDB chemical analysis
 */
export const getEnhancedFlavorProfile = async (ingredients) => {
    const profiles = await Promise.all(
        ingredients.map(async (ing) => {
            // Try FlavorDB first
            const flavorData = await fetchFlavorCompounds(ing.name);

            if (flavorData && flavorData.flavorTags.length > 0) {
                return mapFlavorTagsToProfile(flavorData.flavorTags);
            }

            // Fallback to static  flavor profile if exists
            return ing.flavorProfile || { sweet: 0, sour: 0, spicy: 0, bitter: 0, savory: 0 };
        })
    );

    // Average all profiles
    const totalProfile = {
        sweet: 0,
        sour: 0,
        spicy: 0,
        bitter: 0,
        savory: 0
    };

    profiles.forEach(p => {
        totalProfile.sweet += p.sweet;
        totalProfile.sour += p.sour;
        totalProfile.spicy += p.spicy;
        totalProfile.bitter += p.bitter;
        totalProfile.savory += p.savory;
    });

    const count = profiles.length || 1;

    return {
        sweet: Math.round(totalProfile.sweet / count),
        sour: Math.round(totalProfile.sour / count),
        spicy: Math.round(totalProfile.spicy / count),
        bitter: Math.round(totalProfile.bitter / count),
        savory: Math.round(totalProfile.savory / count)
    };
};
