// Configuração e inicialização da física com Rapier
import * as THREE from 'three';

export class PhysicsSystem {
  constructor() {
    this.world = null;
    this.RAPIER = null;
    this.bodies = new Map(); // Mapa de objetos THREE para corpos físicos
    this.initialized = false;
    this.gravity = { x: 0, y: -9.81, z: 0 };
  }

  async init() {
    if (this.initialized) return this.RAPIER;

    try {
      // Importar Rapier dinamicamente
      const RAPIER = await import('https://cdn.skypack.dev/@dimforge/rapier3d-compat');
      await RAPIER.init();
      
      this.RAPIER = RAPIER;
      this.world = new RAPIER.World(this.gravity);
      this.initialized = true;
      
      console.log('🔷 Rapier physics initialized');
      return RAPIER;
    } catch (error) {
      console.error('Failed to initialize Rapier physics:', error);
      throw error;
    }
  }

  // Adicionar corpo rígido a um objeto 3D
  addRigidBody(mesh, options = {}) {
    if (!this.initialized) {
      console.warn('Physics not initialized yet');
      return null;
    }

    const {
      type = 'dynamic', // dynamic, static, kinematic
      position = mesh.position,
      rotation = mesh.quaternion,
      mass = 1,
      restitution = 0.2,
      friction = 0.5,
      colliderType = 'trimesh', // trimesh, cuboid, ball, capsule, etc.
      colliderParams = {}
    } = options;

    // Criar descrição do corpo rígido
    let rigidBodyDesc;
    
    switch (type) {
      case 'static':
        rigidBodyDesc = this.RAPIER.RigidBodyDesc.fixed();
        break;
      case 'kinematic':
        rigidBodyDesc = this.RAPIER.RigidBodyDesc.kinematicPositionBased();
        break;
      case 'dynamic':
      default:
        rigidBodyDesc = this.RAPIER.RigidBodyDesc.dynamic();
        break;
    }

    // Configurar posição e rotação
    rigidBodyDesc.setTranslation(position.x, position.y, position.z);
    rigidBodyDesc.setRotation({
      x: rotation.x,
      y: rotation.y,
      z: rotation.z,
      w: rotation.w
    });

    // Criar corpo rígido
    const rigidBody = this.world.createRigidBody(rigidBodyDesc);

    // Criar colisor apropriado
    let colliderDesc;
    
    switch (colliderType) {
      case 'cuboid':
        const size = colliderParams.size || new THREE.Vector3(1, 1, 1);
        colliderDesc = this.RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2);
        break;
      case 'ball':
        const radius = colliderParams.radius || 0.5;
        colliderDesc = this.RAPIER.ColliderDesc.ball(radius);
        break;
      case 'capsule':
        const capsuleRadius = colliderParams.radius || 0.5;
        const halfHeight = colliderParams.halfHeight || 0.5;
        colliderDesc = this.RAPIER.ColliderDesc.capsule(halfHeight, capsuleRadius);
        break;
      case 'trimesh':
      default:
        if (mesh.geometry) {
          // Extrair vértices e índices da geometria
          const vertices = mesh.geometry.attributes.position.array;
          const indices = mesh.geometry.index ? mesh.geometry.index.array : null;
          
          if (indices) {
            colliderDesc = this.RAPIER.ColliderDesc.trimesh(vertices, indices);
          } else {
            // Criar índices se não existirem
            const generatedIndices = new Uint32Array(vertices.length / 3);
            for (let i = 0; i < generatedIndices.length; i++) {
              generatedIndices[i] = i;
            }
            colliderDesc = this.RAPIER.ColliderDesc.trimesh(vertices, generatedIndices);
          }
        } else {
          console.warn('Mesh has no geometry, using default cuboid collider');
          colliderDesc = this.RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
        }
        break;
    }

    // Configurar propriedades físicas
    colliderDesc.setRestitution(restitution);
    colliderDesc.setFriction(friction);
    
    if (mass !== 1 && type === 'dynamic') {
      colliderDesc.setDensity(mass);
    }

    // Criar colisor
    const collider = this.world.createCollider(colliderDesc, rigidBody);
    
    // Armazenar referência
    this.bodies.set(mesh.uuid, {
      rigidBody,
      collider,
      mesh
    });

    // Adicionar referência ao objeto 3D
    mesh.userData.physics = {
      rigidBody,
      collider
    };

    return {
      rigidBody,
      collider
    };
  }

  // Remover corpo físico
  removeRigidBody(mesh) {
    if (!this.initialized) return;

    const physicsObj = this.bodies.get(mesh.uuid);
    if (physicsObj) {
      this.world.removeRigidBody(physicsObj.rigidBody);
      this.bodies.delete(mesh.uuid);
      delete mesh.userData.physics;
    }
  }

  // Atualizar a física
  update(deltaTime = 1/60) {
    if (!this.initialized) return;

    // Avançar a simulação
    this.world.step();

    // Atualizar posições dos objetos 3D
    this.bodies.forEach(({ rigidBody, mesh }) => {
      if (rigidBody.isFixed() || rigidBody.isSleeping()) return;

      const position = rigidBody.translation();
      const rotation = rigidBody.rotation();

      mesh.position.set(position.x, position.y, position.z);
      mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
    });
  }

  // Aplicar força a um corpo
  applyForce(mesh, force) {
    if (!this.initialized) return;

    const physicsObj = this.bodies.get(mesh.uuid);
    if (physicsObj && physicsObj.rigidBody) {
      physicsObj.rigidBody.applyForce(force, true);
    }
  }

  // Aplicar impulso a um corpo
  applyImpulse(mesh, impulse) {
    if (!this.initialized) return;

    const physicsObj = this.bodies.get(mesh.uuid);
    if (physicsObj && physicsObj.rigidBody) {
      physicsObj.rigidBody.applyImpulse(impulse, true);
    }
  }

  // Configurar gravidade
  setGravity(x, y, z) {
    if (!this.initialized) return;
    
    this.gravity = { x, y, z };
    this.world.setGravity({ x, y, z });
  }

  // Limpar todos os corpos
  clear() {
    if (!this.initialized) return;
    
    this.bodies.forEach(({ rigidBody }) => {
      this.world.removeRigidBody(rigidBody);
    });
    
    this.bodies.clear();
  }

  // Liberar recursos
  dispose() {
    if (!this.initialized) return;
    
    this.clear();
    this.world = null;
    this.initialized = false;
  }
}

export default PhysicsSystem;
