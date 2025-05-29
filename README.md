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

1. Run `npm install` to fetch dependencies.
2. Install a static server if you don't have one (`npm i -g serve`).
3. Run `serve .` and open [http://localhost:3000](http://localhost:3000).
4. The site uses an import map in `index.html` so modules load without a bundler.

## Usage

The entry point is `src/main.js`, which instantiates `EnigmaWebGL`. This class
creates a `Renderer`, builds the `Scene`, loads assets via `AssetManager`,
initializes physics with `PhysicsSystem` and shows a basic interface from
`UserInterface`.

When you are done with the experience call `EnigmaWebGL.dispose()` to stop the
render loop, remove event listeners and release GPU resources.

## TODO

- Replace `PATH/*.glb` with your DRACO‑compressed GLB models
- Add an HDRI to `src/env.hdr` and implement PMREM
- Integrate fluid simulation shader in `src/shaders/fluidSim.frag.glsl`
- Expand physics integration beyond placeholder

---
