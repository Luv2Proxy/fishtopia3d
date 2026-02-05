# Fishtopia 3D

A cozy, low-pressure multiplayer 3D fishing and exploration prototype built with Babylon.js, Ammo.js physics, and WebRTC-style peer networking.

## Features

- **Stylized island chain** with multiple biomes and unlockable regions.
- **Relaxed fishing loop** with visible fish schools, rarity tiers, and satisfying currency rewards.
- **Knowledge quiz boosts** that reward streaks and increase catching efficiency.
- **Upgradeable progression** for movement, luck, and depth access.
- **Modular architecture** for world generation, fish spawning, progression, quiz logic, and networking.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:4173` to explore the scene. Use **WASD** or arrow keys to move. Press **Q** to answer a quiz question for a boost.

## Project Structure

- `src/engine`: Babylon.js bootstrapping, physics, and player controller.
- `src/world`: Biome layout, islands, and travel hubs.
- `src/fishing`: Fish spawning, rarity, and catch handling.
- `src/progression`: Upgrade and economy balancing logic.
- `src/quiz`: Knowledge quiz and temporary boosts.
- `src/network`: PeerJS-based peer-to-peer sync scaffolding.
- `src/ui`: Minimal HUD overlay.

## Next Steps

- Replace placeholder meshes with stylized low-poly assets.
- Add boat physics, net fishing, diving, and trawling mechanics.
- Expand multiplayer state sync and implement lobby-based matchmaking.
- Implement world events, rare fish migrations, and endgame loops.
