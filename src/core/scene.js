// Gerenciamento de cena e câmera
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Scene {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.controls = null;
    this.setupLights();
    this.setupCamera();
  }

  setupCamera() {
    // Configuração padrão da câmera
    this.camera = new THREE.PerspectiveCamera(
      60, // FOV
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1, // Near plane
      200 // Far plane
    );
    this.camera.position.set(0, 1.5, 8);

    // Listener para redimensionamento
    window.addEventListener('renderer-resize', (e) => {
      this.camera.aspect = e.detail.width / e.detail.height;
      this.camera.updateProjectionMatrix();
    });
  }

  setupControls(domElement) {
    this.controls = new OrbitControls(this.camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 50;
    this.controls.maxPolarAngle = Math.PI / 1.8;
    return this.controls;
  }

  setupLights() {
    // Luz ambiente
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Luz direcional principal (sol)
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(5, 10, 8);
    dirLight.castShadow = true;
    
    // Configurações de sombra de alta qualidade
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -10;
    dirLight.shadow.bias = -0.0001;
    
    this.scene.add(dirLight);
    this.dirLight = dirLight;

    // Luz de preenchimento
    const fillLight = new THREE.DirectionalLight(0x8088ff, 0.7);
    fillLight.position.set(-5, 2, -8);
    this.scene.add(fillLight);
  }

  // Métodos para manipulação da cena
  add(...objects) {
    objects.forEach(object => this.scene.add(object));
  }

  remove(...objects) {
    objects.forEach(object => this.scene.remove(object));
  }

  // Configuração de fundo
  setBackground(color) {
    this.scene.background = new THREE.Color(color);
  }

  setEnvironment(envMap) {
    this.scene.environment = envMap;
    this.scene.background = envMap;
  }

  // Métodos de acesso
  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  update() {
    if (this.controls) {
      this.controls.update();
    }
  }
}

export default Scene;
