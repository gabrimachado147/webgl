// Arquivo principal que integra todos os módulos
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { Renderer } from './core/renderer.js';
import { Scene } from './core/scene.js';
import { AssetManager } from './core/assets.js';
import { PhysicsSystem } from './physics/physics.js';
import { UserInterface } from './ui/ui.js';

class EnigmaWebGL {
  constructor(canvasId = 'c') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = canvasId;
      document.body.appendChild(this.canvas);
    }
    
    this.clock = new THREE.Clock();
    this.isRunning = false;
    this.quality = 'medium';
    
    // Inicializar módulos
    this.initModules();
  }
  
  async initModules() {
    try {
      // Inicializar UI primeiro para mostrar tela de carregamento
      this.ui = new UserInterface();
      this.ui.init();
      this.ui.showLoadingScreen();
      
      // Configurar callbacks da UI
      this.setupUICallbacks();
      
      // Inicializar renderer
      this.ui.updateProgress(10, 'Inicializando renderer...');
      this.renderer = new Renderer(this.canvas);
      await this.renderer.initRenderer();
      
      // Inicializar cena e câmera
      this.ui.updateProgress(20, 'Configurando cena...');
      this.scene = new Scene();
      this.scene.setupControls(this.renderer.domElement);
      
      // Inicializar gerenciador de assets
      this.ui.updateProgress(30, 'Preparando carregamento de assets...');
      this.assets = new AssetManager(this.renderer.renderer);
      
      // Inicializar física
      this.ui.updateProgress(40, 'Inicializando física...');
      this.physics = new PhysicsSystem();
      await this.physics.init();
      
      // Configurar post-processing
      this.ui.updateProgress(50, 'Configurando efeitos visuais...');
      this.setupPostProcessing();
      
      // Carregar assets iniciais
      this.ui.updateProgress(60, 'Carregando assets...');
      await this.loadInitialAssets();
      
      // Configurar cena inicial
      this.ui.updateProgress(80, 'Configurando cena inicial...');
      this.setupInitialScene();
      
      // Configurar eventos de redimensionamento
      this.setupResizeHandling();
      
      // Iniciar loop de renderização
      this.ui.updateProgress(100, 'Pronto!');
      this.start();
      
    } catch (error) {
      console.error('Erro ao inicializar EnigmaWebGL:', error);
      this.ui.showMessage('Erro ao inicializar a experiência. Tente recarregar a página.', 5000);
    }
  }
  
  setupUICallbacks() {
    // Callback para mudança de qualidade
    this.ui.on('onQualityChange', (quality) => {
      this.setQuality(quality);
    });
    
    // Callback para toggle de fullscreen
    this.ui.on('onFullscreenToggle', () => {
      this.ui.toggleFullscreen();
    });
    
    // Callback para toggle de áudio
    this.ui.on('onAudioToggle', () => {
      // Implementar controle de áudio quando necessário
      this.ui.showMessage('Áudio alternado');
    });
    
    // Callback para conclusão do carregamento
    this.ui.on('onLoadingComplete', () => {
      // Ativar controles após carregamento
      if (this.scene && this.scene.controls) {
        this.scene.controls.enabled = true;
      }
    });
  }
  
  setupPostProcessing() {
    const size = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    this.composer = new EffectComposer(this.renderer.renderer);
    this.composer.addPass(new RenderPass(this.scene.getScene(), this.scene.getCamera()));
    
    // Adicionar bloom
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.7,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(this.bloomPass);
    
    // Aplicar configurações de qualidade
    this.setQuality(this.quality);
    
    // Listener para redimensionamento
    window.addEventListener('renderer-resize', (e) => {
      this.composer.setSize(e.detail.width, e.detail.height);
    });
  }
  
  async loadInitialAssets() {
    // Carregar modelo de exemplo
    try {
      // Exemplo de carregamento de modelo (substituir por URL real)
      // await this.assets.loadModel('example', 'assets/models/example.glb');
      
      // Exemplo de carregamento de textura (substituir por URL real)
      // await this.assets.loadTexture('example', 'assets/textures/example.jpg');
      
      // Exemplo de carregamento de ambiente (substituir por URL real)
      // await this.assets.loadEnvironment('example', 'assets/environments/example.hdr');
      
      // Por enquanto, apenas simular carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Erro ao carregar assets iniciais:', error);
      this.ui.showMessage('Alguns assets não puderam ser carregados', 3000);
    }
  }
  
  setupInitialScene() {
    // Configurar fundo
    this.scene.setBackground(0x0a0a14);
    
    // Adicionar geometria de exemplo (substituir por modelo carregado)
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 120, 12);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x8b00ff, 
      emissive: 0x440088, 
      metalness: 0.7, 
      roughness: 0.2 
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Adicionar à cena
    this.scene.add(mesh);
    
    // Adicionar física ao objeto
    this.physics.addRigidBody(mesh, {
      type: 'dynamic',
      mass: 1,
      colliderType: 'trimesh'
    });
    
    // Salvar referência
    this.exampleMesh = mesh;
  }
  
  setupResizeHandling() {
    window.addEventListener('resize', () => {
      // O evento é propagado para os módulos através do evento 'renderer-resize'
    });
  }
  
  setQuality(quality) {
    this.quality = quality;
    
    // Ajustar configurações com base na qualidade
    switch (quality) {
      case 'low':
        this.renderer.setPixelRatio(1);
        this.bloomPass.strength = 0.5;
        this.bloomPass.radius = 0.3;
        break;
      case 'medium':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.bloomPass.strength = 0.7;
        this.bloomPass.radius = 0.4;
        break;
      case 'high':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.bloomPass.strength = 0.9;
        this.bloomPass.radius = 0.5;
        break;
      case 'ultra':
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.bloomPass.strength = 1.1;
        this.bloomPass.radius = 0.6;
        break;
    }
    
    this.ui.showMessage(`Qualidade alterada para: ${quality}`);
  }
  
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }
  
  stop() {
    this.isRunning = false;
    this.clock.stop();
  }
  
  animate() {
    if (!this.isRunning) return;
    
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    
    // Atualizar física
    this.physics.update(deltaTime);
    
    // Atualizar controles da câmera
    this.scene.update();
    
    // Animar objeto de exemplo
    if (this.exampleMesh) {
      // Aplicar rotação apenas se não estiver sob controle da física
      if (!this.exampleMesh.userData.physics) {
        this.exampleMesh.rotation.y = elapsedTime * 0.4;
      }
    }
    
    // Renderizar com post-processing
    this.composer.render();
  }
  
  dispose() {
    // Parar animação
    this.stop();
    
    // Liberar recursos
    this.physics.dispose();
    this.assets.dispose();
    this.ui.dispose();
    
    // Limpar cena
    this.scene.getScene().traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    // Liberar renderer
    this.renderer.dispose();
    this.composer.dispose();
  }
}

// Exportar classe principal
export default EnigmaWebGL;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.enigmaWebGL = new EnigmaWebGL('c');
});
