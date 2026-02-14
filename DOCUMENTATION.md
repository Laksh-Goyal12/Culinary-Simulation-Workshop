# 📖 Technical Documentation

This document provides a deep dive into the architecture, logic, and problem-solving strategies implemented in the Culinary Simulation Workshop.

---

## 🏗 Architecture Overview

The project is built as a **Three-Column Reactive Dashboard** using React and Vite. Each column manages its own internal state while synchronized via a central `App.jsx` orchestrator.

### 1. Centralized State Manager (`App.jsx`)
- **Vessel Content**: Array of active ingredients.
- **Simulation Status**: Manages the lifecycle of the simulation (`idle`, `simulating`, `complete`).
- **Data Persistence**: Analytics (Flavor, Nutrition) are computed once and persisted until the next simulation run.

### 2. Live API Integration (`src/api/recipeDB.js`)
One of the core challenges was the lack of a direct "Ingredient Search" endpoint in the provided API. We solved this using a **Chained Request Pattern**:
- **Problem**: The API endpoints for "Search" often returned recipes, but not the detailed molecular structure of ingredients.
- **Solution**:
    1.  **Step 1**: Search for recipes containing the user's query (`/recipebyingredient`).
    2.  **Step 2**: If successful, grab the first Recipe ID.
    3.  **Step 3**: Query a different endpoint for the full details of that specific recipe (`/search-recipe/{id}`).
    4.  **Step 4**: Parse the full ingredient list from the recipe details and extract the molecular data for the matching ingredient.

### 3. Proxy Configuration (`vite.config.js`)
To handle **CORS** issues without a dedicated backend, we utilized Vite's development proxy:
```javascript
proxy: {
  '/api': {
    target: 'https://api.foodoscope.com/recipe2-api',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  }
}
```
*Note: This maps local `/api` requests directly to the root of the remote API, allowing us to access different sub-folders (`/recipe`, `/search-recipe`, etc.) through a single entry point.*

---

## 🧪 Simulation Logic

### "Blind Simulation" Reveal
To enhance the user experience and create a sense of "Scientific Processing," the HUD is hidden during the simulation phase:
- **Delay**: 8 seconds (Simulated processing time).
- **Execution**: A local state `status` tracks the phase. When `status === 'simulating'`, the HUD renders a "System Standby" view.
- **Data Computation**: Analytics are calculated *only* when the simulation completes, preventing UI flickering during ingredient selection.

### Sensor Dynamics
The **Vessel Temperature** and **Viscosity** readouts are not static. They are governed by the number of ingredients and their metadata:
- **Temperature**: Base 20°C + (Ingredient Count * 3.5).
- **Viscosity**: Derived from the average flavor profile and category weights.

---

## 🔧 Problem Solving Log

| Problem | Method | Result |
| :--- | :--- | :--- |
| **CORS Blockage** | Vite Proxy Implementation | Successfully bypassed browser security on dev. |
| **Limited Search API** | Chained API Fetching | Enabled search for ingredients not in local DB. |
| **HUD Clutter** | Compact Nutrient Gauges | Improved readability while expanding Recipe feed. |
| **Vault Scrolling** | `minHeight: 0` Flex Fix | Resolved persistent scrolling bug in Chrome/Safari. |
| **API Path 404s** | Path Normalization | Fixed divergent paths (some under `/recipe`, some not). |

---

## 📂 Project Structure
- `/src/api/`: Service layer for external APIs.
- `/src/components/`: Modular UI components split by column.
- `/src/data/`: Local ingredient database and mock configurations.
- `/src/styles/`: CSS variables and global layout system.
