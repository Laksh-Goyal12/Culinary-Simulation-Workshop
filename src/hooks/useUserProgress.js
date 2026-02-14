import { useMemo } from 'react';

const RANKS = [
    { level: 1, title: 'Kitchen Porter', color: '#95a5a6' },
    { level: 3, title: 'Commis Chef', color: '#2ecc71' },
    { level: 5, title: 'Chef de Partie', color: '#3498db' },
    { level: 10, title: 'Sous Chef', color: '#9b59b6' },
    { level: 20, title: 'Head Chef', color: '#e67e22' },
    { level: 50, title: 'Culinary Alchemist', color: '#f1c40f' }
];

export const useUserProgress = (simulationHistory, ingredientVaultSize = 0) => {
    const stats = useMemo(() => {
        const totalExperiments = simulationHistory.length;
        const successfulExperiments = simulationHistory.filter(s => s.identifiedDish).length;

        // Calculate XP
        // Base XP per experiment: 50
        // Bonus XP per identified dish: 200
        // Bonus XP per ingredient in vault: 5
        const xpFromCooking = totalExperiments * 50;
        const xpFromDiscovery = successfulExperiments * 200;
        const xpFromCollection = ingredientVaultSize * 5;

        const totalXP = xpFromCooking + xpFromDiscovery + xpFromCollection;

        // Level Calculation
        // Level 1: 0-500
        // Level 2: 501-1500 (1000 gap)
        // Level 3: 1501-3000 (1500 gap)
        // Simple linear-ish progression for MVP: Level = floor(totalXP / 1000) + 1
        const level = Math.floor(totalXP / 1000) + 1;

        // Next Level Progress
        const currentLevelBaseXP = (level - 1) * 1000;
        const nextLevelThreshold = level * 1000;
        const xpInCurrentLevel = totalXP - currentLevelBaseXP;
        const xpNeededForNextLevel = 1000; // Fixed 1000 XP per level for simplicity in MVP
        const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

        // Determine Rank
        let currentRank = RANKS[0];
        for (let i = RANKS.length - 1; i >= 0; i--) {
            if (level >= RANKS[i].level) {
                currentRank = RANKS[i];
                break;
            }
        }

        return {
            totalXP,
            level,
            rank: currentRank,
            progressPercent,
            xpInCurrentLevel,
            xpNeededForNextLevel,
            stats: {
                totalExperiments,
                recipesMastered: successfulExperiments,
                ingredientsCollected: ingredientVaultSize
            }
        };
    }, [simulationHistory, ingredientVaultSize]);

    return stats;
};

export default useUserProgress;
