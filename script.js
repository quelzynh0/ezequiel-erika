// Elementos do DOM
const fotoElement = document.getElementById('foto-aleatoria');
const audio = document.getElementById('background-music');
const toggleBtn = document.getElementById('toggle-btn');
const soundWaves = document.getElementById('sound-waves');
const fotoContainer = document.querySelector('.foto');
const heartsContainer = document.getElementById('hearts-container');
const photoHeartsContainer = document.getElementById('photo-hearts-container');
const tempoElement = document.getElementById('tempo');

// Configurações
const imagens = Array.from({ length: 50 }, (_, i) => `img/foto${i + 1}.jpg`);
const dataInicial = new Date(2024, 4, 10, 19, 38, 0);
const emoticons = ['❤️', '💖', '💕', '💘', '💞'];
let imagensSequencia = [];
let indiceImagemAtual = 0;
let historicoImagens = ['img/foto1.jpg'];
let indiceHistorico = 0;
let intervaloTroca = null;
let touchStartX = 0;
let touchEndX = 0;
let lastTap = 0;

// Preload de imagens
function preloadImagens(imagens) {
  imagens.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onerror = () => console.warn(`Falha ao preload: ${src}`);
  });
}

// Embaralhar array (Fisher-Yates)
function embaralhar(array) {
  const novoArray = [...array];
  for (let i = novoArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
  }
  return novoArray;
}

// Criar sequência de imagens
function criarSequenciaImagens() {
  const imagensRestantes = imagens.slice(1);
  imagensSequencia = ['img/foto1.jpg', ...embaralhar(imagensRestantes)];
  preloadImagens(imagensSequencia);
}

// Carregar próxima imagem
function carregarProximaImagem() {
  indiceImagemAtual = (indiceImagemAtual + 1) % imagensSequencia.length;
  const imagem = imagensSequencia[indiceImagemAtual];
  fotoElement.classList.add('fade');
  setTimeout(() => {
    fotoElement.src = imagem;
    fotoElement.classList.remove('fade');
    historicoImagens.push(imagem);
    indiceHistorico = historicoImagens.length - 1;
  }, 500);
}

// Carregar imagem do histórico
function carregarImagemHistorico(indice) {
  if (indice >= 0 && indice < historicoImagens.length) {
    fotoElement.classList.add('fade');
    setTimeout(() => {
      fotoElement.src = historicoImagens[indice];
      fotoElement.classList.remove('fade');
      indiceHistorico = indice;
      indiceImagemAtual = imagensSequencia.indexOf(historicoImagens[indice]);
    }, 500);
  }
}

// Iniciar troca automática
function iniciarTrocaAutomatica() {
  clearInterval(intervaloTroca);
  intervaloTroca = setInterval(carregarProximaImagem, 2500);
}

// Navegação por gestos
fotoContainer.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

fotoContainer.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const currentTime = Date.now();
  const tapInterval = currentTime - lastTap;

  if (tapInterval < 300 && tapInterval > 0) {
    iniciarEfeitoFoto();
  } else {
    handleSwipe();
  }

  lastTap = currentTime;
});

function handleSwipe() {
  clearInterval(intervaloTroca);
  const swipeDistance = touchEndX - touchStartX;
  if (swipeDistance > 50 && indiceHistorico > 0) {
    carregarImagemHistorico(indiceHistorico - 1);
  } else if (swipeDistance < -50) {
    carregarProximaImagem();
  }
  iniciarTrocaAutomatica();
}

// Controle de áudio
function updateButtonState() {
  toggleBtn.innerHTML = audio.paused ? '▶' : '⏸';
  soundWaves.style.display = audio.paused ? 'none' : 'flex';
}

toggleBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().catch(error => console.error('Erro ao tocar áudio:', error));
  } else {
    audio.pause();
  }
  updateButtonState();
});

audio.addEventListener('play', updateButtonState);
audio.addEventListener('pause', updateButtonState);
audio.addEventListener('ended', updateButtonState);

// Contador de tempo
function calcularDiferenca(dataInicial, dataAtual) {
  let anos = dataAtual.getFullYear() - dataInicial.getFullYear();
  let meses = dataAtual.getMonth() - dataInicial.getMonth();
  let dias = dataAtual.getDate() - dataInicial.getDate();
  let horas = dataAtual.getHours() - dataInicial.getHours();
  let minutos = dataAtual.getMinutes() - dataInicial.getMinutes();
  let segundos = dataAtual.getSeconds() - dataInicial.getSeconds();

  if (segundos < 0) { segundos += 60; minutos--; }
  if (minutos < 0) { minutos += 60; horas--; }
  if (horas < 0) { horas += 24; dias--; }
  if (dias < 0) {
    const mesAnterior = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 0).getDate();
    dias += mesAnterior;
    meses--;
  }
  if (meses < 0) { meses += 12; anos--; }

  return { anos, meses, dias, horas, minutos, segundos };
}

function atualizarTempo() {
  const agora = new Date();
  const { anos, meses, dias, horas, minutos, segundos } = calcularDiferenca(dataInicial, agora);

  const formatarUnidade = (valor, singular, plural) => valor === 1 ? singular : plural;

  // Unidades divididas em duas linhas
  const unidadesSuperiores = [
    { valor: anos, nome: formatarUnidade(anos, 'ano', 'anos') },
    { valor: meses, nome: formatarUnidade(meses, 'mês', 'meses') },
    { valor: dias, nome: formatarUnidade(dias, 'dia', 'dias') }
  ].filter(unidade => unidade.valor > 0);

  const unidadesInferiores = [
    { valor: horas, nome: formatarUnidade(horas, 'hora', 'horas') },
    { valor: minutos, nome: formatarUnidade(minutos, 'minuto', 'minutos') },
    { valor: segundos, nome: formatarUnidade(segundos, 'segundo', 'segundos') }
  ].filter(unidade => unidade.valor > 0);

  // Função para formatar a linha superior (sem "e")
  const formatarLinhaSuperior = (unidades) => {
    if (unidades.length === 0) return '';
    return unidades.map(unidade => `${unidade.valor} ${unidade.nome}`).join(', ');
  };

  // Função para formatar a linha inferior (com "e" apenas antes dos segundos, sem vírgula)
  const formatarLinhaInferior = (unidades) => {
    if (unidades.length === 0) return '';
    if (unidades.length === 1) {
      return `${unidades[0].valor} ${unidades[0].nome}`;
    }
    const ultimasUnidades = unidades.slice(-1);
    const unidadesAnteriores = unidades.slice(0, -1);
    const textoAnteriores = unidadesAnteriores.map(unidade => `${unidade.valor} ${unidade.nome}`).join(', ');
    return `${textoAnteriores} e ${ultimasUnidades[0].valor} ${ultimasUnidades[0].nome}`;
  };

  // Formatar as duas linhas
  const linhaSuperior = formatarLinhaSuperior(unidadesSuperiores);
  const linhaInferior = formatarLinhaInferior(unidadesInferiores);

  // Combinar as linhas
  let textoFinal = '';
  if (linhaSuperior && linhaInferior) {
    textoFinal = `${linhaSuperior}\n${linhaInferior}`;
  } else if (linhaSuperior) {
    textoFinal = linhaSuperior;
  } else if (linhaInferior) {
    textoFinal = linhaInferior;
  } else {
    textoFinal = 'Menos de um segundo';
  }

  tempoElement.innerText = textoFinal;
}

// Corações animados no fundo
function criarCoracao() {
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDuration = `${4 + Math.random() * 4}s`;
  heartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), 8000);
}

// Emoticons de corações na foto
function criarCoracaoFoto() {
  const heart = document.createElement('div');
  heart.className = 'photo-heart';
  heart.innerHTML = emoticons[Math.floor(Math.random() * emoticons.length)];
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDuration = `${2 + Math.random() * 2}s`;
  photoHeartsContainer.appendChild(heart);
  setTimeout(() => heart.remove(), 4000);
}

function iniciarEfeitoFoto() {
  const intervalo = setInterval(criarCoracaoFoto, 200);
  setTimeout(() => clearInterval(intervalo), 5000);
}

// Inicialização
window.addEventListener('load', () => {
  criarSequenciaImagens();
  iniciarTrocaAutomatica();
  iniciarEfeitoFoto();
  soundWaves.style.display = 'none';
  atualizarTempo();
  setInterval(atualizarTempo, 1000);
  setInterval(criarCoracao, 300);
  audio.play().catch(updateButtonState);
});

// Tratamento de erro de imagem
fotoElement.onerror = () => {
  console.warn('Erro ao carregar imagem, revertendo para foto1.jpg');
  fotoElement.src = 'img/foto1.jpg';
};
