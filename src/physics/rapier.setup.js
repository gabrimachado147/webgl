// Rapier WASM initialization helper
import RAPIERInit from 'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.12.0/dist/rapier3d.wasm.js';
let rapier;
export async function initPhysics(){
  rapier = await RAPIERInit();
  return rapier;
}
export { rapier };
