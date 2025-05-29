# Enigma Labs • Mega Scaffold

> Generated on 2025-05-29T03:04:52.174286Z

A next‑gen immersive WebGPU/WebGL site scaffold featuring:
- WebGPU renderer with automatic WebGL fallback
- Rapier WASM physics engine ready (async init)
- Post‑processing pipeline (UnrealBloomPass)
- Progressive Web App (manifest + service worker)
- Directory structure for shaders and assets
- Modular ES‑module codebase suited for Vite or any modern bundler

## Quick Start

1. Install a local dev server (e.g. `npm i -g serve`)  
2. Run `serve .` in this folder.  
3. Open [http://localhost:5173](http://localhost:5173) in a modern browser with WebGPU (Chrome Canary or Edge).

## TODO

- Replace `PATH/*.glb` with your DRACO‑compressed GLB models
- Add an HDRI to `src/env.hdr` and implement PMREM
- Integrate fluid simulation shader in `src/shaders/fluidSim.frag.glsl`
- Expand physics integration beyond placeholder

---
