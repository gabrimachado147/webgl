// Interface de usuário básica para controles e feedback
export class UserInterface {
  constructor() {
    this.container = null;
    this.loadingScreen = null;
    this.controlPanel = null;
    this.initialized = false;
    this.callbacks = {};
  }

  init() {
    if (this.initialized) return;

    // Criar container principal
    this.container = document.createElement('div');
    this.container.className = 'enigma-ui-container';
    document.body.appendChild(this.container);

    // Criar tela de carregamento
    this.createLoadingScreen();
    
    // Criar painel de controles
    this.createControlPanel();

    // Adicionar estilos CSS
    this.addStyles();

    // Configurar listeners de eventos
    this.setupEventListeners();

    this.initialized = true;
  }

  createLoadingScreen() {
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.className = 'enigma-loading-screen';
    
    const logo = document.createElement('div');
    logo.className = 'enigma-logo';
    logo.innerHTML = '<span>ENIGMA</span><span>LABS</span>';
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'enigma-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'enigma-progress-bar';
    
    const progressText = document.createElement('div');
    progressText.className = 'enigma-progress-text';
    progressText.textContent = 'Carregando experiência...';
    
    progressContainer.appendChild(progressBar);
    this.loadingScreen.appendChild(logo);
    this.loadingScreen.appendChild(progressContainer);
    this.loadingScreen.appendChild(progressText);
    
    this.container.appendChild(this.loadingScreen);
    
    // Salvar referências para atualização
    this.progressBar = progressBar;
    this.progressText = progressText;
  }

  createControlPanel() {
    this.controlPanel = document.createElement('div');
    this.controlPanel.className = 'enigma-control-panel';
    
    // Botão de qualidade
    const qualitySelector = document.createElement('div');
    qualitySelector.className = 'enigma-quality-selector';
    
    const qualityLabel = document.createElement('span');
    qualityLabel.textContent = 'Qualidade:';
    
    const qualitySelect = document.createElement('select');
    qualitySelect.innerHTML = `
      <option value="low">Baixa</option>
      <option value="medium" selected>Média</option>
      <option value="high">Alta</option>
      <option value="ultra">Ultra</option>
    `;
    
    qualitySelector.appendChild(qualityLabel);
    qualitySelector.appendChild(qualitySelect);
    
    // Botão de fullscreen
    const fullscreenButton = document.createElement('button');
    fullscreenButton.className = 'enigma-fullscreen-button';
    fullscreenButton.textContent = 'Tela Cheia';
    
    // Botão de áudio
    const audioButton = document.createElement('button');
    audioButton.className = 'enigma-audio-button';
    audioButton.textContent = '🔊';
    
    // Adicionar elementos ao painel
    this.controlPanel.appendChild(qualitySelector);
    this.controlPanel.appendChild(fullscreenButton);
    this.controlPanel.appendChild(audioButton);
    
    // Inicialmente oculto
    this.controlPanel.style.display = 'none';
    
    this.container.appendChild(this.controlPanel);
    
    // Salvar referências
    this.qualitySelect = qualitySelect;
    this.fullscreenButton = fullscreenButton;
    this.audioButton = audioButton;
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .enigma-ui-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
      }
      
      .enigma-loading-screen {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a0a14;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        pointer-events: all;
        transition: opacity 0.5s ease-in-out;
      }
      
      .enigma-logo {
        font-family: 'Arial', sans-serif;
        font-size: 2.5rem;
        font-weight: bold;
        color: #fff;
        margin-bottom: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      
      .enigma-logo span:first-child {
        color: #8b00ff;
      }
      
      .enigma-progress-container {
        width: 80%;
        max-width: 400px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 1rem;
      }
      
      .enigma-progress-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #8b00ff, #ff00e6);
        transition: width 0.3s ease-out;
      }
      
      .enigma-progress-text {
        font-family: 'Arial', sans-serif;
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.7);
      }
      
      .enigma-control-panel {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        gap: 0.5rem;
        pointer-events: all;
        background: rgba(10, 10, 20, 0.7);
        backdrop-filter: blur(10px);
        padding: 0.5rem;
        border-radius: 4px;
      }
      
      .enigma-quality-selector {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: white;
        font-family: 'Arial', sans-serif;
        font-size: 0.8rem;
      }
      
      .enigma-quality-selector select {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 2px;
      }
      
      .enigma-fullscreen-button, .enigma-audio-button {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 2px;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .enigma-fullscreen-button:hover, .enigma-audio-button:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `;
    
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // Listener para qualidade
    this.qualitySelect.addEventListener('change', (e) => {
      const quality = e.target.value;
      if (this.callbacks.onQualityChange) {
        this.callbacks.onQualityChange(quality);
      }
    });
    
    // Listener para fullscreen
    this.fullscreenButton.addEventListener('click', () => {
      if (this.callbacks.onFullscreenToggle) {
        this.callbacks.onFullscreenToggle();
      } else {
        this.toggleFullscreen();
      }
    });
    
    // Listener para áudio
    this.audioButton.addEventListener('click', () => {
      if (this.callbacks.onAudioToggle) {
        this.callbacks.onAudioToggle();
      }
    });
    
    // Listener para progresso de assets
    window.addEventListener('asset-progress', (e) => {
      this.updateProgress(e.detail.progress, `Carregando: ${e.detail.url}`);
    });
    
    // Listener para erro de assets
    window.addEventListener('asset-error', (e) => {
      this.updateProgress(100, `Erro ao carregar: ${e.detail.url}`);
    });
  }

  // Atualizar barra de progresso
  updateProgress(percent, text = null) {
    if (!this.initialized) return;
    
    this.progressBar.style.width = `${percent}%`;
    
    if (text) {
      this.progressText.textContent = text;
    }
    
    // Se completou, esconder após delay
    if (percent >= 100) {
      setTimeout(() => {
        this.hideLoadingScreen();
      }, 500);
    }
  }

  // Esconder tela de carregamento e mostrar controles
  hideLoadingScreen() {
    if (!this.initialized) return;
    
    this.loadingScreen.style.opacity = '0';
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
      this.controlPanel.style.display = 'flex';
    }, 500);
    
    if (this.callbacks.onLoadingComplete) {
      this.callbacks.onLoadingComplete();
    }
  }

  // Mostrar tela de carregamento
  showLoadingScreen() {
    if (!this.initialized) return;
    
    this.loadingScreen.style.display = 'flex';
    setTimeout(() => {
      this.loadingScreen.style.opacity = '1';
    }, 10);
    this.controlPanel.style.display = 'none';
  }

  // Alternar fullscreen
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erro ao entrar em fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  // Registrar callbacks
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  // Mostrar mensagem temporária
  showMessage(message, duration = 3000) {
    if (!this.initialized) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'enigma-message';
    messageElement.textContent = message;
    messageElement.style.cssText = `
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 10, 20, 0.7);
      backdrop-filter: blur(10px);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-family: 'Arial', sans-serif;
      pointer-events: all;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    
    this.container.appendChild(messageElement);
    
    // Animar entrada
    setTimeout(() => {
      messageElement.style.opacity = '1';
    }, 10);
    
    // Remover após duração
    setTimeout(() => {
      messageElement.style.opacity = '0';
      setTimeout(() => {
        this.container.removeChild(messageElement);
      }, 300);
    }, duration);
  }

  // Limpar e remover UI
  dispose() {
    if (!this.initialized) return;
    
    document.body.removeChild(this.container);
    this.initialized = false;
  }
}

export default UserInterface;
