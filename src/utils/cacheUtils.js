/**
 * Cache utility for managing localStorage with expiration
 */

const CACHE_PREFIX = 'culinary_sim_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get cached data if it exists
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found
 */
export const getCachedData = (key) => {
    try {
        const fullKey = CACHE_PREFIX + key;
        const cached = localStorage.getItem(fullKey);

        if (!cached) return null;

        const { data } = JSON.parse(cached);

        console.log(`[Cache] HIT: ${key}`);
        return data;
    } catch (error) {
        console.warn('[Cache] Read error:', error);
        return null;
    }
};

/**
 * Store data in cache permanently
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export const setCachedData = (key, data) => {
    try {
        const fullKey = CACHE_PREFIX + key;
        const cacheEntry = {
            data,
            timestamp: Date.now()
        };

        localStorage.setItem(fullKey, JSON.stringify(cacheEntry));
        console.log(`[Cache] SET: ${key}`);
    } catch (error) {
        console.warn('[Cache] Write error:', error);
        // Don't throw - caching is optional
    }
};



/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
    try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                keys.push(key);
            }
        }

        keys.forEach(key => localStorage.removeItem(key));
        console.log(`[Cache] Cleared all cache (${keys.length} entries)`);
    } catch (error) {
        console.warn('[Cache] Clear all error:', error);
    }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
    try {
        let totalEntries = 0;
        let totalSize = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_PREFIX)) {
                totalEntries++;
                const value = localStorage.getItem(key);
                if (value) {
                    totalSize += value.length;
                }
            }
        }

        return {
            entries: totalEntries,
            sizeKB: (totalSize / 1024).toFixed(2)
        };
    } catch (error) {
        console.warn('[Cache] Stats error:', error);
        return { entries: 0, sizeKB: 0 };
    }
};
