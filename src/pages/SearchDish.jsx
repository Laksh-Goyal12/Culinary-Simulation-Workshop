import React, { useState } from 'react';
import { Search, Loader, ChefHat, BookOpen, Utensils } from 'lucide-react';
import { searchRecipesByTitle, filterValidRecipes, fetchRecipeDetails } from '../api/recipeDB';
// Local modal removed to use global one from App.jsx

const SearchDish = ({ onImport, onViewRecipe }) => {
    // Changing PAGE_SIZE to 10 to force fresh data fetch and verification
    const PAGE_SIZE = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [importingId, setImportingId] = useState(null); // ID of recipe being fetched for import


    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

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

    const handleMoveToStation = async (recipe) => {
        if (importingId) return;

        setImportingId(recipe.Recipe_id);
        try {
            // Search results only have summary data, we need full details for ingredients
            const details = await fetchRecipeDetails(recipe.Recipe_id);
            if (details && details.ingredients) {
                onImport(details.ingredients, details.title);
            } else {
                console.error('[SearchDish] Failed to fetch ingredients for import');
                // Optional: show a small toast or alert here
            }
        } catch (error) {
            console.error('[SearchDish] Import failed:', error);
        } finally {
            setImportingId(null);
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
                    padding: '10px 20px',
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
                            placeholder="Search for a dish (e.g., Momos, Pizza)..."
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
                    overflowY: 'auto',
                    padding: '0 24px 24px 24px',
                    zIndex: 1
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
                                            onClick={() => handleMoveToStation(recipe)}
                                            className="card-3d card-hover"
                                            style={{
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                animation: `slideUp 0.5s ease forwards ${index * 0.05}s`,
                                                opacity: 0,
                                                border: 'none',
                                                background: '#fff',
                                                borderRadius: '16px',
                                                padding: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                minHeight: '160px',
                                                justifyContent: 'space-between',
                                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '';
                                            }}
                                        >
                                            {/* Decorative Top Gradient Line based on title hash */}
                                            <div style={{
                                                height: '6px',
                                                width: '100%',
                                                background: (() => {
                                                    const colors = [
                                                        'linear-gradient(90deg, #FF9A9E 0%, #FECFEF 100%)',
                                                        'linear-gradient(90deg, #84fab0 0%, #8fd3f4 100%)',
                                                        'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
                                                        'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                                                        'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                                                    ];
                                                    const index = (recipe.Recipe_title || 'Dish').length % colors.length;
                                                    return colors[index];
                                                })()
                                            }} />

                                            <div style={{ padding: '24px 24px 0 24px', flex: 1 }}>
                                                {/* Category Label */}
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px',
                                                    color: 'var(--text-secondary)',
                                                    marginBottom: '8px',
                                                    fontWeight: '600'
                                                }}>
                                                    {recipe.category || 'Culinary Archive'}
                                                </div>

                                                <h3 style={{
                                                    margin: '0 0 16px 0',
                                                    fontSize: '1.4rem',
                                                    color: 'var(--text-primary)',
                                                    lineHeight: '1.3',
                                                    fontWeight: '700',
                                                    fontFamily: 'var(--font-header)'
                                                }}>
                                                    {recipe.Recipe_title || 'Unknown Dish'}
                                                </h3>
                                            </div>

                                            <div style={{
                                                padding: '0 24px 24px 24px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginTop: 'auto'
                                            }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {/* Data Pills - Minimalist */}
                                                    <span style={{
                                                        fontSize: '0.85rem',
                                                        color: 'var(--text-secondary)',
                                                        background: '#f5f5f5',
                                                        padding: '4px 10px',
                                                        borderRadius: '8px',
                                                        fontWeight: '500'
                                                    }}>
                                                        🔥 {recipe.calories || '?'} kcal
                                                    </span>
                                                    {recipe.ingredientCount > 0 && (
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            color: 'var(--text-secondary)',
                                                            background: '#f5f5f5',
                                                            padding: '4px 10px',
                                                            borderRadius: '8px',
                                                            fontWeight: '500'
                                                        }}>
                                                            🥣 {recipe.ingredientCount}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMoveToStation(recipe);
                                                    }}
                                                    disabled={importingId === recipe.Recipe_id}
                                                    style={{
                                                        background: 'var(--color-neon-cyan)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '6px 14px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        boxShadow: '0 4px 12px rgba(41, 128, 185, 0.2)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    className="btn-hover-glow"
                                                >
                                                    {importingId === recipe.Recipe_id ? (
                                                        <Loader size={16} className="animate-spin" />
                                                    ) : (
                                                        <Utensils size={16} />
                                                    )}
                                                    MOVE TO MIXING TABLE
                                                </button>
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
                        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
                            <ChefHat size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                            <p>Enter a dish name to search the recipe database</p>
                            <p style={{ fontSize: '0.9rem' }}>Example: chocolate cake, pasta carbonara</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchDish;
