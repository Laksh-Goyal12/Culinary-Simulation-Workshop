# 🍽️ Culinary Arcade

Culinary Arcade is a high-performance, gamified molecular gastronomy simulator. It allows chefs and food enthusiasts to experiment with ingredients, discover recipes through a "sci-fi" lab interface, and track their culinary achievements.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-1.2.0_BETA-green.svg)

## 🌟 Key Features

### 🧪 Molecular Simulation
- **Ingredient Vault**: Browse a vast database of ingredients with real-world nutritional and flavor data.
- **Mixing Vessel**: Combine ingredients throughout a physically simulated environment with temperature and viscosity controls.
- **Recipe Identification**: Automatically identifies known recipes from your unique combinations using the Foodoscope API.

### 🎮 Gamification
- **XP & Leveling System**: Earn experience points for every experiment and recipe discovery. Rank up from *Sous Chef* to *Executive Chef*.
- **Achievements**: Track mastered recipes and total experiments cooked.
- **Interactive UI**: Tactile 3D buttons, glassmorphism aesthetics, and smooth animations.

### 📊 Advanced Analytics
- **Flavor Radar**: Visual breakdown of taste profiles (Sweet, Sour, Salty, Bitter, Savory, Spicy).
- **Nutrient Gauge**: Real-time calculation of calories, proteins, fats, and carbs.
- **Interaction Alerts**: Detects unique chemical synergies between specific ingredients.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/culinary-arcade.git
    cd culinary-arcade
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser at `http://localhost:5173`.

## 🏗 Project Structure

-   `src/components/vault`: Ingredient selection and vault management.
-   `src/components/mixing`: Core simulation logic and mixing vessel interface.
-   `src/components/hud`: Visualization tools (Radar, Gauges) and results display.
-   `src/pages`: Main application views (Dashboard, Inventory, Search, Lab Results).
-   `src/utils`: Helper functions for caching and local storage management.

## 🎨 Design Philosophy
The UI follows a **"Warm Tactical"** aesthetic (Apricot Pop), combining inviting colors with precision-instrument styling. It uses a robust flex-grid layout to ensure responsiveness across devices.

## 🤝 Contributing
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
