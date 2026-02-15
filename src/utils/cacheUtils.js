/**
 * Cache utility for managing localStorage with expiration
 */

const CACHE_PREFIX = 'culinary_sim_';
const DEFAULT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days (Optimization)

/**
 * Get cached data if it exists and is valid
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found/expired
 */
export const getCachedData = (key) => {
    try {
        const fullKey = CACHE_PREFIX + key;
        const cached = localStorage.getItem(fullKey);

        if (!cached) return null;

        const entry = JSON.parse(cached);

        // Check for expiration
        if (entry.timestamp && (Date.now() - entry.timestamp > DEFAULT_TTL)) {
            console.log(`[Cache] Expired: ${key}`);
            localStorage.removeItem(fullKey);
            return null;
        }

        console.log(`[Cache] HIT: ${key}`);
        return entry.data;
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

        // Safety: If storage is full, clear old entries
        try {
            localStorage.setItem(fullKey, JSON.stringify(cacheEntry));
        } catch (e) {
            if (e.name === 'QuotaExceededError') {
                console.warn('[Cache] Storage full, clearing old entries...');
                clearAllCache(); // Radical cleanup to save current request
                localStorage.setItem(fullKey, JSON.stringify(cacheEntry));
            }
        }

        console.log(`[Cache] SET: ${key}`);
    } catch (error) {
        console.warn('[Cache] Write error:', error);
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
