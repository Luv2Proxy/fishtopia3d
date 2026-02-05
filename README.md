# Fishtopia 3D

A cozy, low-pressure multiplayer 3D fishing and exploration prototype built as a fully static site. The experience runs directly in a browser using Babylon.js for rendering, Ammo.js for physics, and PeerJS for lightweight peer-to-peer networking.

## Features

- **Stylized island chain** with multiple biomes and unlockable regions.
- **Relaxed fishing loop** with visible fish schools, rarity tiers, and satisfying currency rewards.
- **Knowledge quiz boosts** that reward streaks and increase catching efficiency.
- **Upgradeable progression** for movement, luck, and depth access.
- **PeerJS P2P scaffolding** for syncing player state in small co-op sessions.

## Running Locally

Because this is a static project, you can open `index.html` directly or serve the folder with any static file server.

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173` to explore the scene. Use **WASD** or arrow keys to move. Press **Q** to answer a quiz question for a boost.

## Project Structure

- `index.html`: Static entry point with CDN scripts.
- `styles.css`: UI styling.
- `app.js`: Babylon.js scene setup, systems, and gameplay loop.

## Next Steps

- Replace placeholder meshes with stylized low-poly assets.
- Add boat physics, net fishing, diving, and trawling mechanics.
- Expand multiplayer state sync and implement lobby-based matchmaking.
- Implement world events, rare fish migrations, and endgame loops.
