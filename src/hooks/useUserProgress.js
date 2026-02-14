import { useMemo } from 'react';

const RANKS = [
    { level: 1, title: 'Kitchen Porter', color: '#95a5a6' },
    { level: 2, title: 'Scullery Apprentice', color: '#7f8c8d' },
    { level: 3, title: 'Commis Chef', color: '#2ecc71' },
    { level: 4, title: 'Chef de Partie', color: '#27ae60' },
    { level: 5, title: 'Tournant', color: '#3498db' },
    { level: 6, title: 'Sous Chef', color: '#2980b9' },
    { level: 7, title: 'Executive Chef', color: '#9b59b6' },
    { level: 8, title: 'Chef de Cuisine', color: '#8e44ad' },
    { level: 9, title: 'Gastronomic Alchemist', color: '#e67e22' },
    { level: 10, title: 'Culinary Legend', color: '#f1c40f' }
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

        // Level Calculation (Grand Mastery Scaling for 10,000 Recipes)
        // Level 10 starts at ~1.62M XP. Discovery of 9,500 recipes (95%) gives 1.9M XP.
        let level = 1;
        let cumulativeXPThreshold = 0;
        let currentGap = 20000; // Level 1 -> 2: 20,000 XP
        let gapIncrement = 40000; // Each level adds 40k to the requirement

        while (level < 10 && totalXP >= cumulativeXPThreshold + currentGap) {
            cumulativeXPThreshold += currentGap;
            level++;
            currentGap += gapIncrement;
        }

        // Mastery Tracking (Discovery Goal: 10,000 recipes)
        const MASTERY_GOAL = 10000;
        const masteryPercentage = Math.min(100, (successfulExperiments / MASTERY_GOAL) * 100);

        // Next Level Progress
        const xpInCurrentLevel = totalXP - cumulativeXPThreshold;
        const xpNeededForNextLevel = level >= 10 ? 0 : currentGap;
        const progressPercent = level >= 10 ? 100 : Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNextLevel) * 100));

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
            masteryGoal: MASTERY_GOAL,
            masteryPercentage,
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
