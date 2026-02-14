import React, { useState } from 'react';
import { Search, Loader, ChefHat } from 'lucide-react';
import { searchRecipesByTitle, filterValidRecipes } from '../api/recipeDB';
import RecipeDetailModal from '../components/hud/RecipeDetailModal';

const SearchDish = () => {
    // Changing PAGE_SIZE to 10 to force fresh data fetch and verification
    const PAGE_SIZE = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
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
                                            onClick={() => setSelectedRecipeId(recipe.Recipe_id)}
                                            className="card-3d card-hover"
                                            style={{
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                animation: `slideUp 0.5s ease forwards ${index * 0.05}s`,
                                                opacity: 0, // Initial state for animation
                                                border: '1px solid rgba(255,255,255,0.6)',
                                                background: '#fff',
                                                padding: 0
                                            }}
                                        >
                                            <div style={{ height: '180px', background: '#ccc', position: 'relative', overflow: 'hidden' }}>
                                                <img
                                                    src={recipe.image_url}
                                                    alt={recipe.Recipe_title || recipe.Recipe_title}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/400x300/e0e0e0/333?text=Dish';
                                                    }}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    left: 0,
                                                    right: 0,
                                                    background: 'linear-gradient(0deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
                                                    height: '60%'
                                                }} />
                                            </div>
                                            <div style={{ padding: '16px' }}>
                                                <h3 style={{
                                                    margin: '0 0 8px 0',
                                                    fontSize: '1.2rem',
                                                    color: 'var(--text-primary)',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {recipe.Recipe_title || recipe.Recipe_title || 'Unknown Dish'}
                                                </h3>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        color: '#fff',
                                                        background: 'var(--color-neon-cyan)',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {Math.floor(Math.random() * 300 + 100)} kcal
                                                    </span>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        Click to view
                                                    </span>
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
                        <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
                            <ChefHat size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                            <p>Enter a dish name to search the recipe database</p>
                            <p style={{ fontSize: '0.9rem' }}>Example: chocolate cake, pasta carbonara</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Recipe Detail Modal */}
            {selectedRecipeId && (
                <RecipeDetailModal
                    recipeId={selectedRecipeId}
                    onClose={() => setSelectedRecipeId(null)}
                />
            )}
        </div>
    );
};

export default SearchDish;
