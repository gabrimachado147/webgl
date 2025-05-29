// Configuração do renderer WebGPU/WebGL
import * as THREE from 'three';
import { WebGPURenderer } from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.initRenderer();
    this.setupResizeListener();
  }

  async initRenderer() {
    // Tentar WebGPU primeiro, com fallback para WebGL
    if (navigator.gpu) {
      try {
        this.renderer = new WebGPURenderer({ 
          canvas: this.canvas, 
          antialias: true, 
          alpha: true 
        });
        console.log('🟣 WebGPU renderer enabled');
      } catch (error) {
        console.warn('WebGPU initialization failed, falling back to WebGL', error);
        this.initWebGLRenderer();
      }
    } else {
      this.initWebGLRenderer();
    }

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    
    return this.renderer;
  }

  initWebGLRenderer() {
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas, 
      antialias: true, 
      alpha: true 
    });
    console.log('⚪️ WebGL fallback');
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.renderer.setSize(this.width, this.height);
      
      // Emitir evento para que a câmera e o composer possam ser atualizados
      window.dispatchEvent(new CustomEvent('renderer-resize', { 
        detail: { width: this.width, height: this.height } 
      }));
    });
  }

  // Métodos para acesso ao renderer
  get domElement() {
    return this.renderer.domElement;
  }

  render(scene, camera) {
    this.renderer.render(scene, camera);
  }

  // Configurações adicionais
  enableShadows(enabled = true) {
    this.renderer.shadowMap.enabled = enabled;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setPixelRatio(ratio) {
    this.renderer.setPixelRatio(ratio);
  }

  dispose() {
    this.renderer.dispose();
    window.removeEventListener('resize', this.handleResize);
  }
}

export default Renderer;
