import React, { useState, useEffect } from 'react';
import { Search, Loader, ChefHat, BookOpen, Utensils, Star, Clock } from 'lucide-react';
import { searchRecipesByTitle, filterValidRecipes, fetchRecipeDetails, fetchRecipeOfTheDay } from '../api/recipeDB';
// Local modal removed to use global one from App.jsx

const SearchDish = ({ onImport, onViewRecipe }) => {
    const PAGE_SIZE = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [dailyRecipe, setDailyRecipe] = useState(null);
    const [loadingDaily, setLoadingDaily] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        const loadDaily = async () => {
            setLoadingDaily(true);
            try {
                const recipe = await fetchRecipeOfTheDay();
                if (recipe) {
                    console.log('[SearchDish] Loaded Recipe of the Day:', recipe.Recipe_title);
                    setDailyRecipe(recipe);
                }
            } catch (err) {
                console.error("Failed to load daily recipe", err);
            } finally {
                setLoadingDaily(false);
            }
        };
        loadDaily();

        // Timer for countdown display
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const diff = tomorrow - now;

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTimeRemaining(
                `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
            );
        };

        const timerInterval = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call

        // Timer for data refresh at midnight
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow - now;

        console.log(`[SearchDish] Next refresh in ${Math.round(msUntilMidnight / 1000 / 60)} minutes (at midnight)`);

        const refreshTimer = setTimeout(() => {
            console.log('[SearchDish] Midnight reached! Refreshing Recipe of the Day...');
            loadDaily();
            // Set up a recurring 24h timer for subsequent days
            setInterval(loadDaily, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);

        return () => {
            clearInterval(timerInterval);
            clearTimeout(refreshTimer);
        };
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setCurrentPage(1);
        setRecipes([]); // Clear previous results immediately

        try {
            const data = await searchRecipesByTitle(searchQuery, PAGE_SIZE);

            if (data && data.payload && data.payload.data) {
                console.log(`[SearchDish] Initial search got ${data.payload.data.length} results. Validating...`);

                // Filter out broken recipes
                const validRecipes = await filterValidRecipes(data.payload.data);
                setRecipes(validRecipes);

                // Show "See More" if we got a full page from API (regardless of how many we filtered out)
                // This ensures we can still reach the next page
                const shouldShowMore = data.payload.data.length === PAGE_SIZE;
                setHasMore(shouldShowMore);
            } else {
                setRecipes([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Search failed:', error);
            setRecipes([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = async () => {
        if (loadingMore) return;

        setLoadingMore(true);
        const nextPage = currentPage + 1;

        try {
            const data = await searchRecipesByTitle(searchQuery, PAGE_SIZE, nextPage);

            if (data && data.payload && data.payload.data && data.payload.data.length > 0) {
                console.log(`[SearchDish] Loaded ${data.payload.data.length} more. Validating...`);
                const validRecipes = await filterValidRecipes(data.payload.data);

                setRecipes(prev => [...prev, ...validRecipes]);
                setCurrentPage(nextPage);
                setHasMore(data.payload.data.length === PAGE_SIZE);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Load more failed:', error);
            setHasMore(false);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };



    return (
        <div style={{
            padding: 'var(--spacing-lg)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Content Wrapper to restore background and layout */}
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                {/* Background elements for atmosphere */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    left: '-10%',
                    width: '50%',
                    height: '50%',
                    background: 'radial-gradient(circle, rgba(0,240,255,0.05) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                {/* Hero Search Section */}
                <div style={{
                    padding: '10px 20px 0 20px',
                    textAlign: 'center',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: !hasSearched ? 'center' : 'flex-start',
                    height: !hasSearched ? '40vh' : 'auto', /* Reduced from 60vh to decrease gap */
                    transition: 'all 0.5s ease'
                }}>
                    <h2 className="hero-text" style={{
                        fontSize: hasSearched ? '2rem' : '3.5rem',
                        marginBottom: '1rem',
                        marginTop: !hasSearched ? '0' : '20px',
                        transition: 'all 0.5s ease'
                    }}>
                        {!hasSearched ? 'Find Your Next Meal' : 'Culinary Database'}
                    </h2>

                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '600px',
                        transform: loading ? 'scale(0.98)' : 'scale(1)',
                        transition: 'transform 0.2s',
                        zIndex: 10
                    }}>
                        <input
                            type="text"
                            placeholder={dailyRecipe ? `Try the Recipe of the Day: ${dailyRecipe.Recipe_title || dailyRecipe.title}` : "Search for a dish (e.g., Momos, Pizza)..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{
                                width: '100%',
                                padding: '16px 24px',
                                paddingRight: '50px',
                                borderRadius: '50px',
                                border: 'none',
                                background: '#f0f0f0',
                                color: 'var(--text-primary)',
                                fontSize: '1.1rem',
                                outline: 'none',
                                boxShadow: 'inset 6px 6px 12px rgba(0,0,0,0.1), inset -6px -6px 12px rgba(255,255,255,0.8)', /* Recessed 3D */
                                transition: 'all 0.3s ease'
                            }}
                            className="box-shadow-hover"
                        />
                        <div
                            onClick={handleSearch}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#fff',
                                background: 'var(--color-neon-cyan)',
                                padding: '10px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            {loading && !loadingMore ? (
                                <Loader size={20} className="animate-spin" />
                            ) : (
                                <Search size={20} strokeWidth={2.5} />
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div style={{
                    flex: 1,
                    overflowY: hasSearched ? 'auto' : 'hidden', /* Disable scroll when showing Daily Recipe */
                    padding: '0 24px 24px 24px',
                    zIndex: 1,
                    display: 'flex',            /* Center content vertically when not searching */
                    flexDirection: 'column',
                    justifyContent: hasSearched ? 'flex-start' : 'center',
                    paddingBottom: hasSearched ? '24px' : '100px' /* Offset for optical balance */
                }}>
                    {loading && !loadingMore ? (
                        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
                            <div style={{ color: 'var(--text-secondary)' }}>Searching the culinary archives...</div>
                        </div>
                    ) : hasSearched ? (
                        recipes.length > 0 ? (
                            <>
                                <div style={{ padding: '0 4px 12px 4px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                    Found <span style={{ color: 'var(--color-neon-cyan)', fontWeight: 'bold' }}>{recipes.length}</span> delicious matches
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                                    {recipes.map((recipe, index) => (
                                        <div
                                            key={recipe.Recipe_id}
                                            onClick={() => onViewRecipe(recipe.Recipe_id, {
                                                title: recipe.Recipe_title,
                                                category: recipe.category,
                                                calories: recipe.calories
                                            })}
                                            style={{
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                animation: `slideUp 0.5s ease forwards ${index * 0.05}s`,
                                                opacity: 0,
                                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                                background: 'rgba(255, 255, 255, 0.7)',
                                                backdropFilter: 'blur(12px)',
                                                WebkitBackdropFilter: 'blur(12px)',
                                                borderRadius: '20px',
                                                padding: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                minHeight: '180px',
                                                justifyContent: 'space-between',
                                                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.07), inset 0 0 0 1px rgba(255, 255, 255, 0.2)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.4)';
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(31, 38, 135, 0.07), inset 0 0 0 1px rgba(255, 255, 255, 0.2)';
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                                            }}
                                        >
                                            {/* Top Accent Bar - Sleeker & Glowing */}
                                            <div style={{
                                                height: '4px',
                                                width: '100%',
                                                background: (() => {
                                                    const colors = [
                                                        'linear-gradient(90deg, #FF9A9E, #FECFEF)',
                                                        'linear-gradient(90deg, #84fab0, #8fd3f4)',
                                                        'linear-gradient(90deg, #f093fb, #f5576c)',
                                                        'linear-gradient(90deg, #4facfe, #00f2fe)',
                                                        'linear-gradient(90deg, #43e97b, #38f9d7)'
                                                    ];
                                                    return colors[(recipe.Recipe_title || 'D').length % colors.length];
                                                })(),
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                            }} />



                                            <div style={{ padding: '24px', flex: 1 }}>
                                                {/* Header Info */}
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    marginBottom: '12px'
                                                }}>
                                                    <div style={{
                                                        fontSize: '0.7rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '2px',
                                                        color: 'var(--text-muted)',
                                                        fontWeight: '800',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        <ChefHat size={12} opacity={0.6} />
                                                        {recipe.category || 'Archive'}
                                                    </div>
                                                </div>

                                                <h3 style={{
                                                    margin: 0,
                                                    fontSize: '1.4rem',
                                                    color: 'var(--text-primary)',
                                                    lineHeight: '1.3',
                                                    fontWeight: '800',
                                                    fontFamily: "'Outfit', sans-serif",
                                                    letterSpacing: '-0.5px'
                                                }}>
                                                    {recipe.Recipe_title || 'Unknown Dish'}
                                                </h3>
                                            </div>

                                            {/* Footer Stats - Clean & Tactile */}
                                            <div style={{
                                                padding: '0 24px 24px 24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--text-secondary)',
                                                    background: 'rgba(255, 185, 115, 0.1)', /* Light Apricot tint */
                                                    padding: '6px 14px',
                                                    borderRadius: '12px',
                                                    fontWeight: '800',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(255, 185, 115, 0.2)'
                                                }}>
                                                    <span style={{ fontSize: '1rem' }}>🔥</span> <span style={{ color: 'var(--text-primary)' }}>{(recipe.calories !== undefined && recipe.calories !== null) ? recipe.calories : '?'}</span> kcal
                                                </div>
                                                {recipe.ingredientCount > 0 && (
                                                    <div style={{
                                                        fontSize: '0.75rem',
                                                        color: 'var(--text-secondary)',
                                                        background: 'rgba(41, 128, 185, 0.05)', /* Light Cyan tint */
                                                        padding: '6px 14px',
                                                        borderRadius: '12px',
                                                        fontWeight: '800',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(41, 128, 185, 0.1)'
                                                    }}>
                                                        <span style={{ fontSize: '1rem' }}>🥣</span> <span style={{ color: 'var(--text-primary)' }}>{recipe.ingredientCount}</span> items
                                                    </div>
                                                )}

                                                <div style={{
                                                    marginLeft: 'auto',
                                                    opacity: 0.2,
                                                    background: 'var(--bg-app)',
                                                    padding: '8px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff'
                                                }}>
                                                    <Utensils size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {hasMore && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '20px' }}>
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="btn-gamified"
                                            style={{ minWidth: '200px' }}
                                        >
                                            {loadingMore ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Loader size={18} className="animate-spin" /> Loading...
                                                </div>
                                            ) : 'Discover More'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)' }}>
                                <ChefHat size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                                <p>No recipes found matching "{searchQuery}"</p>
                                <p style={{ fontSize: '0.9rem' }}>Try searching for generic ingredients like "Chicken", "Rice", or "Pasta"</p>
                            </div>
                        )
                    ) : (
                        loadingDaily ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
                                <Loader size={40} className="animate-spin" style={{ color: 'var(--color-neon-cyan)', marginBottom: '20px' }} />
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', letterSpacing: '1px' }}>
                                    CONNECTING TO CHEF'S KITCHEN...
                                </div>
                            </div>
                        ) : dailyRecipe ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                marginTop: '40px',
                                animation: 'fadeIn 0.8s ease'
                            }}>
                                <div style={{
                                    textTransform: 'uppercase',
                                    letterSpacing: '3px',
                                    fontSize: '0.8rem',
                                    color: 'var(--color-neon-cyan)',
                                    fontWeight: 'bold',
                                    marginBottom: '16px',
                                    textShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <Star size={14} fill="currentColor" /> RECIPE OF THE DAY <span style={{ opacity: 0.4, margin: '0 8px' }}>|</span> <Clock size={14} /> {timeRemaining}
                                </div>

                                <div
                                    onClick={() => onViewRecipe(dailyRecipe.Recipe_id || dailyRecipe.id, {
                                        title: dailyRecipe.Recipe_title || dailyRecipe.title,
                                        category: dailyRecipe.category,
                                        calories: dailyRecipe.calories
                                    })}
                                    style={{
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        width: '100%',
                                        maxWidth: '340px',
                                        border: '1px solid rgba(255, 255, 255, 0.6)',
                                        background: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(16px)',
                                        WebkitBackdropFilter: 'blur(16px)',
                                        borderRadius: '24px',
                                        padding: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        boxShadow: '0 15px 35px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                        e.currentTarget.style.boxShadow = '0 25px 50px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.6)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5)';
                                    }}
                                >
                                    {/* Hero Gradient accent */}
                                    <div style={{
                                        height: '6px',
                                        width: '100%',
                                        background: 'linear-gradient(90deg, #FF9A9E, #FECFEF, #f093fb, #4facfe)',
                                        backgroundSize: '200% 200%',
                                        animation: 'gradientMove 3s ease infinite'
                                    }} />

                                    <div style={{ padding: '30px', flex: 1, textAlign: 'center' }}>
                                        <div style={{
                                            fontSize: '2rem',
                                            margin: '0 0 12px 0',
                                            color: 'var(--text-primary)',
                                            fontWeight: '800',
                                            fontFamily: "'Outfit', sans-serif",
                                            letterSpacing: '-1px',
                                            lineHeight: '1.2'
                                        }}>
                                            {dailyRecipe.Recipe_title || dailyRecipe.title || 'Featured Dish'}
                                        </div>

                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            background: 'rgba(0,0,0,0.04)',
                                            borderRadius: '20px',
                                            marginBottom: '20px'
                                        }}>
                                            <ChefHat size={16} style={{ color: 'var(--color-neon-cyan)' }} />
                                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {dailyRecipe.category || 'Chef\'s Special'}
                                            </span>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '16px',
                                            marginTop: '8px'
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                                    {(dailyRecipe.calories !== undefined && dailyRecipe.calories !== null) ? dailyRecipe.calories : 350}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>kcal</span>
                                            </div>
                                            <div style={{ width: '1px', height: '30px', background: 'rgba(0,0,0,0.1)' }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                                                    {dailyRecipe.ingredientCount || 5}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>Items</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '16px',
                                        background: 'rgba(255,255,255,0.5)',
                                        borderTop: '1px solid rgba(0,0,0,0.05)',
                                        color: 'var(--color-neon-cyan)',
                                        fontWeight: '800',
                                        fontSize: '0.9rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}>
                                        Tap to View Recipe <BookOpen size={16} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
                                <ChefHat size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                                <p>Enter a dish name to search the recipe database</p>
                                <p style={{ fontSize: '0.9rem' }}>Example: chocolate cake, pasta carbonara</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchDish;
