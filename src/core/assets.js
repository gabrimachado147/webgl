// Carregamento e gerenciamento de assets
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

export class AssetManager {
  constructor(renderer) {
    this.renderer = renderer;
    this.loadingManager = new THREE.LoadingManager();
    this.setupLoadingManager();
    this.setupLoaders();
    this.assets = {
      models: {},
      textures: {},
      environments: {}
    };
  }

  setupLoadingManager() {
    // Configurar callbacks de progresso global
    this.loadingManager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total) * 100;
      console.log(`Carregando: ${Math.round(progress)}% (${url})`);
      // Disparar evento de progresso para UI
      window.dispatchEvent(new CustomEvent('asset-progress', { 
        detail: { url, loaded, total, progress } 
      }));
    };

    this.loadingManager.onError = (url) => {
      console.error(`Erro ao carregar: ${url}`);
      window.dispatchEvent(new CustomEvent('asset-error', { 
        detail: { url } 
      }));
    };
  }

  setupLoaders() {
    // Configurar DRACO loader para modelos comprimidos
    this.dracoLoader = new DRACOLoader(this.loadingManager);
    this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    this.dracoLoader.setDecoderConfig({ type: 'js' });

    // Configurar GLTF loader com suporte a DRACO
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

    // Configurar KTX2 loader para texturas comprimidas
    this.ktx2Loader = new KTX2Loader(this.loadingManager);
    this.ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.154/examples/jsm/libs/basis/');
    this.ktx2Loader.detectSupport(this.renderer);

    // Configurar texture loader padrão
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);

    // Configurar environment loader para HDR/EXR
    this.envLoader = new THREE.TextureLoader(this.loadingManager);
  }

  // Carregar modelo GLTF/GLB
  async loadModel(name, url, onProgress) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          this.assets.models[name] = gltf;
          resolve(gltf);
        },
        (xhr) => {
          if (onProgress) onProgress(xhr.loaded / xhr.total);
        },
        (error) => {
          console.error(`Erro ao carregar modelo ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  // Carregar textura (suporte a KTX2 e formatos padrão)
  async loadTexture(name, url, isKTX2 = false) {
    return new Promise((resolve, reject) => {
      const loader = isKTX2 ? this.ktx2Loader : this.textureLoader;
      
      loader.load(
        url,
        (texture) => {
          texture.name = name;
          this.assets.textures[name] = texture;
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Erro ao carregar textura ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  // Carregar mapa de ambiente (HDR/EXR)
  async loadEnvironment(name, url) {
    return new Promise((resolve, reject) => {
      this.envLoader.load(
        url,
        (texture) => {
          const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
          pmremGenerator.compileEquirectangularShader();
          
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;
          pmremGenerator.dispose();
          texture.dispose();
          
          this.assets.environments[name] = envMap;
          resolve(envMap);
        },
        undefined,
        (error) => {
          console.error(`Erro ao carregar ambiente ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  // Obter asset carregado
  getModel(name) {
    return this.assets.models[name];
  }

  getTexture(name) {
    return this.assets.textures[name];
  }

  getEnvironment(name) {
    return this.assets.environments[name];
  }

  // Liberar memória
  dispose() {
    // Liberar texturas
    Object.values(this.assets.textures).forEach(texture => texture.dispose());
    
    // Liberar environments
    Object.values(this.assets.environments).forEach(envMap => envMap.dispose());
    
    // Liberar geometrias e materiais dos modelos
    Object.values(this.assets.models).forEach(gltf => {
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.isMaterial) {
            child.material.dispose();
          } else {
            // Array de materiais
            child.material.forEach(material => material.dispose());
          }
        }
      });
    });
    
    // Limpar referências
    this.assets = { models: {}, textures: {}, environments: {} };
  }
}

export default AssetManager;
