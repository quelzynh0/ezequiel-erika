// Configurações
const CONFIG = {
  IMAGES: Array.from({ length: 5 }, (_, i) => `img/foto${i + 1}.jpg`),
  INITIAL_DATE: new Date(2024, 4, 10, 19, 38, 0),
  EMOTICONS: ['❤️', '💖', '💕', '💘', '💞'],
  AUTO_SWAP_INTERVAL: 3000,
  DOUBLE_TAP_THRESHOLD: 500,
  HEART_ANIMATION_DURATION: 5000,
  HEART_SPAWN_INTERVAL: 200,
  BACKGROUND_HEART_INTERVAL: 300,
  INITIAL_COMMENTS: [
        {
      username: 'ezequielsmarinho',
      text: 'Você é o amor da minha vida! ❤️❤️',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Cada dia com você é um sonho. 🌙✨',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Te amo mais que ontem e menos que amanhã. 💞📅',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Prometo te amar para sempre. 💍💖',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Você é minha linda princesa. 👑💕',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Seu sorriso é a coisa mais linda desse mundo. 😊😊',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Com você, cada momento é perfeito. ⏳❤️',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Você trouxe cor para minha vida. 🎨🌈',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Você faz meu coração bater mais forte. 🔥',
      profilePic: 'img/fotoperfil.jpg'
    },
    {
      username: 'ezequielsmarinho',
      text: 'Você, eu e Deus para sempre. 🙏💑❤️',
      profilePic: 'img/fotoperfil.jpg'
    }
  ]
};

// Elementos do DOM
const DOM = {
  currentPhoto: document.getElementById('foto-aleatoria'),
  nextPhoto: document.getElementById('foto-proxima'),
  audio: document.getElementById('background-music'),
  speakerBtn: document.getElementById('speaker-btn'),
  photoContainer: document.querySelector('.foto'),
  heartsContainer: document.getElementById('hearts-container'),
  photoHeartsContainer: document.getElementById('photo-hearts-container'),
  timeDisplay: document.getElementById('tempo'),
  likeBtn: document.getElementById('like-btn'),
  commentBtn: document.getElementById('comment-btn'),
  shareBtn: document.getElementById('share-btn'),
  commentModal: document.getElementById('comment-modal'),
  commentsList: document.getElementById('comments-list'),
  closeModalBtn: document.getElementById('close-modal-btn')
};

// Estado
const state = {
  sequence: [],
  currentIndex: 0,
  history: ['img/foto1.jpg'],
  historyIndex: 0,
  swapInterval: null,
  touchStartX: 0,
  touchEndX: 0,
  lastTap: 0,
  isSwiping: false,
  isLiked: true,
  isPausedByHold: false,
  isTransitioning: false
};

// Utilitários
const utils = {
  preloadImages(images) {
    images.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onerror = () => console.warn(`Falha ao preload: ${src}`);
    });
  },

  shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  formatTimeUnit(value, singular, plural) {
    return value === 1 ? singular : plural;
  },

  debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }
};

// Manipulação de imagens
const photoManager = {
  createSequence() {
    const restImages = CONFIG.IMAGES.slice(1);
    state.sequence = ['img/foto1.jpg', ...utils.shuffle(restImages)];
    // Pré-carregar apenas as 3 primeiras imagens
    utils.preloadImages(state.sequence.slice(0, 3));
    // Pré-carregar as demais após 10 segundos
    setTimeout(() => utils.preloadImages(state.sequence.slice(3)), 10000);
  },

  loadNext() {
    if (state.isTransitioning) {
      console.log('Transição em andamento, ignorando loadNext');
      return;
    }
    state.currentIndex = (state.currentIndex + 1) % state.sequence.length;
    const image = state.sequence[state.currentIndex];
    console.log(`Carregando próxima imagem: ${image}, índice: ${state.currentIndex}`);
    this.transitionImage(image);
  },

  loadFromHistory(index) {
    if (state.isTransitioning) {
      console.log('Transição em andamento, ignorando loadFromHistory');
      return;
    }
    if (index >= 0 && index < state.history.length) {
      const image = state.history[index];
      console.log(`Carregando imagem do histórico: ${image}, índice: ${index}`);
      this.transitionImage(image);
      state.historyIndex = index;
      state.currentIndex = state.sequence.indexOf(image);
    }
  },

  transitionImage(image) {
    if (state.isTransitioning) {
      console.log('Transição já em andamento, ignorando');
      return;
    }
    state.isTransitioning = true;
    console.log(`Iniciando transição para: ${image}`);
    DOM.nextPhoto.src = image;
    DOM.nextPhoto.style.display = 'block';
    DOM.nextPhoto.classList.add('fade');
    DOM.currentPhoto.classList.add('fade');
    setTimeout(() => {
      DOM.currentPhoto.src = image;
      DOM.currentPhoto.classList.remove('fade');
      DOM.nextPhoto.style.display = 'none';
      DOM.nextPhoto.classList.remove('fade');
      state.history.push(image);
      state.historyIndex = state.history.length - 1;
      state.isTransitioning = false;
      console.log(`Transição concluída para: ${image}`);
    }, 300);
  },

  startAutoSwap() {
    clearInterval(state.swapInterval);
    if (!state.isPausedByHold) {
      state.swapInterval = setInterval(() => this.loadNext(), CONFIG.AUTO_SWAP_INTERVAL);
    }
  }
};

// Manipulação de gestos
const gestureHandler = {
  handleTouchStart(e) {
    state.touchStartX = e.changedTouches[0].screenX;
  },

  handleTouchEnd(e) {
    if (state.isSwiping) return;
    state.isSwiping = true;
    state.touchEndX = e.changedTouches[0].screenX;
    const currentTime = Date.now();
    const tapInterval = currentTime - state.lastTap;

    if (tapInterval < CONFIG.DOUBLE_TAP_THRESHOLD && tapInterval > 0) {
      e.preventDefault();
      heartEffect.start();
    } else {
      this.handleSwipe();
    }

    state.lastTap = currentTime;
    setTimeout(() => { state.isSwiping = false; }, 300);
  },

  handleDoubleClick(e) {
    e.preventDefault();
    heartEffect.start();
  },

  handleSwipe() {
    clearInterval(state.swapInterval);
    const swipeDistance = state.touchEndX - state.touchStartX;
    if (swipeDistance > 50 && state.historyIndex > 0) {
      photoManager.loadFromHistory(state.historyIndex - 1);
    } else if (swipeDistance < -50) {
      photoManager.loadNext();
    }
    photoManager.startAutoSwap();
  }
};

// Manipulação de áudio
const audioManager = {
  updateButtonState() {
    const isPaused = DOM.audio.paused;
    DOM.speakerBtn.innerHTML = isPaused ?
      `<svg class="speaker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M11 5L6 9H2v6h4l5 4V5z"/>
         <path d="M19 9l-4 4m0-4l4 4"/>
       </svg>` :
      `<svg class="speaker-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
       </svg>`;
  },

  toggle() {
    if (DOM.audio.paused) {
      DOM.audio.play().catch(error => console.error('Erro ao tocar áudio:', error));
    } else {
      DOM.audio.pause();
    }
    this.updateButtonState();
  }
};

// Contador de tempo
const timeCounter = {
  calculateDifference(start, now) {
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();
    let hours = now.getHours() - start.getHours();
    let minutes = now.getMinutes() - start.getMinutes();
    let seconds = now.getSeconds() - start.getSeconds();

    if (seconds < 0) { seconds += 60; minutes--; }
    if (minutes < 0) { minutes += 60; hours--; }
    if (hours < 0) { hours += 24; days--; }
    if (days < 0) {
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      days += lastMonth;
      months--;
    }
    if (months < 0) { months += 12; years--; }

    return { years, months, days, hours, minutes, seconds };
  },

  update() {
    const now = new Date();
    const { years, months, days, hours, minutes, seconds } = this.calculateDifference(CONFIG.INITIAL_DATE, now);

    const unitsUpper = [
      { value: years, name: utils.formatTimeUnit(years, 'ano', 'anos') },
      { value: months, name: utils.formatTimeUnit(months, 'mês', 'meses') },
      { value: days, name: utils.formatTimeUnit(days, 'dia', 'dias') }
    ].filter(unit => unit.value > 0);

    const unitsLower = [
      { value: hours, name: utils.formatTimeUnit(hours, 'hora', 'horas') },
      { value: minutes, name: utils.formatTimeUnit(minutes, 'minuto', 'minutos') },
      { value: seconds, name: utils.formatTimeUnit(seconds, 'segundo', 'segundos') }
    ].filter(unit => unit.value > 0);

    const formatUpper = units => units.length ? units.map(unit => `${unit.value} ${unit.name}`).join(', ') : '';
    const formatLower = units => {
      if (!units.length) return '';
      if (units.length === 1) return `${units[0].value} ${units[0].name}`;
      const last = units.slice(-1)[0];
      const others = units.slice(0, -1).map(unit => `${unit.value} ${unit.name}`).join(', ');
      return `${others} e ${last.value} ${last.name}`;
    };

    const upper = formatUpper(unitsUpper);
    const lower = formatLower(unitsLower);
    DOM.timeDisplay.innerText = upper && lower ? `${upper}\n${lower}` : upper || lower || 'Menos de um segundo';
  }
};

// Efeito de corações
const heartEffect = {
  createBackgroundHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${4 + Math.random() * 4}s`;
    DOM.heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 8000);
  },

  createPhotoHeart() {
    const heart = document.createElement('div');
    heart.className = 'photo-heart';
    heart.innerHTML = CONFIG.EMOTICONS[Math.floor(Math.random() * CONFIG.EMOTICONS.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${2 + Math.random() * 2}s`;
    DOM.photoHeartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 4000);
  },

  start() {
    const interval = setInterval(() => this.createPhotoHeart(), CONFIG.HEART_SPAWN_INTERVAL);
    setTimeout(() => clearInterval(interval), CONFIG.HEART_ANIMATION_DURATION);
  }
};

// Manipulação de comentários
const commentManager = {
  renderComments() {
    DOM.commentsList.innerHTML = '';
    CONFIG.INITIAL_COMMENTS.forEach(comment => {
      const commentElement = document.createElement('div');
      commentElement.className = 'comment';
      commentElement.innerHTML = `
        <img src="${comment.profilePic}" alt="${comment.username}'s profile picture" class="comment-profile-pic">
        <div class="comment-content">
          <div class="comment-username-container">
            <span class="comment-username">${comment.username}</span>
            <span class="verified-badge">✔</span>
          </div>
          <span class="comment-text">${comment.text}</span>
        </div>
      `;
      DOM.commentsList.appendChild(commentElement);
    });
  },

  openModal() {
    this.renderComments();
    DOM.commentModal.style.display = 'flex';
    setTimeout(() => DOM.commentModal.classList.remove('hidden'), 10);
  },

  closeModal() {
    DOM.commentModal.classList.add('hidden');
    setTimeout(() => DOM.commentModal.style.display = 'none', 300);
  }
};

// Ações dos botões
const actionButtons = {
  like() {
    state.isLiked = !state.isLiked;
    DOM.likeBtn.classList.toggle('liked', state.isLiked);
    if (state.isLiked) heartEffect.start();
  },

  comment() {
    commentManager.openModal();
  },

  share() {
    if (navigator.share) {
      navigator.share({
        title: 'Ezequiel & Érika',
        text: 'Confira nossa história de amor! ❤️',
        url: window.location.href
      }).catch(error => console.error('Erro ao compartilhar:', error));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copiado! 📋'))
        .catch(error => {
          console.error('Erro ao copiar link:', error);
          alert('Erro ao copiar link. 😕');
        });
    }
  }
};

// Inicialização
const init = () => {
  // Configurar imagens
  photoManager.createSequence();

  // Iniciar configurações
  photoManager.startAutoSwap();

  // Configurar gestos
  DOM.photoContainer.addEventListener('touchstart', e => {
    gestureHandler.handleTouchStart(e);
    state.isPausedByHold = true;
    clearInterval(state.swapInterval);
  });
  DOM.photoContainer.addEventListener('touchend', e => {
    gestureHandler.handleTouchEnd(e);
    state.isPausedByHold = false;
    photoManager.startAutoSwap();
  });
  DOM.photoContainer.addEventListener('touchcancel', () => {
    state.isPausedByHold = false;
    photoManager.startAutoSwap();
  });
  DOM.photoContainer.addEventListener('mousedown', () => {
    state.isPausedByHold = true;
    clearInterval(state.swapInterval);
  });
  DOM.photoContainer.addEventListener('mouseup', () => {
    state.isPausedByHold = false;
    photoManager.startAutoSwap();
  });
  DOM.photoContainer.addEventListener('mouseleave', () => {
    state.isPausedByHold = false;
    photoManager.startAutoSwap();
  });
  DOM.photoContainer.addEventListener('dblclick', e => gestureHandler.handleDoubleClick(e));

  // Configurar áudio
  DOM.speakerBtn.addEventListener('click', () => audioManager.toggle());
  DOM.audio.addEventListener('play', () => audioManager.updateButtonState());
  DOM.audio.addEventListener('pause', () => audioManager.updateButtonState());
  DOM.audio.addEventListener('ended', () => audioManager.updateButtonState());
  DOM.audio.play().catch(() => audioManager.updateButtonState());

  // Pausar áudio ao sair da página
  window.addEventListener('beforeunload', () => {
    DOM.audio.pause();
  });

  // Configurar botões
  DOM.likeBtn.addEventListener('click', actionButtons.like);
  DOM.commentBtn.addEventListener('click', actionButtons.comment);
  DOM.shareBtn.addEventListener('click', actionButtons.share);
  DOM.closeModalBtn.addEventListener('click', () => commentManager.closeModal());
  DOM.likeBtn.classList.add('liked');

  // Configurar contador de tempo
  timeCounter.update();
  setInterval(() => timeCounter.update(), 1000);

  // Configurar corações de fundo
  setInterval(() => heartEffect.createBackgroundHeart(), CONFIG.BACKGROUND_HEART_INTERVAL);

  // Configurar efeito inicial
  heartEffect.start();

  // Tratamento de erros de imagem
  DOM.currentPhoto.onerror = () => {
    console.warn('Erro ao carregar imagem, revertendo para foto1.jpg');
    DOM.currentPhoto.src = 'img/foto1.jpg';
  };
  DOM.nextPhoto.onerror = () => {
    console.warn('Erro ao carregar próxima imagem, revertendo para foto1.jpg');
    DOM.nextPhoto.src = 'img/foto1.jpg';
  };
};

// Executar inicialização
window.addEventListener('load', init);
