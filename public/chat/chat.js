// Código JS exclusivo para a tela de chat

// Funções utilitárias
function verifyEmail(email) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

// --- CÓDIGO DA TELA DE CHAT ---
const btnExpandir = document.querySelector('.btn-expandir');
const menuLateral = document.querySelector('.menu-lateral');
if (btnExpandir && menuLateral) {
  btnExpandir.addEventListener('click', () => {
    menuLateral.classList.toggle('expandir');
  });
}

const messages = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.classList.add('message', sender);
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

if (chatForm) {
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMsg = chatInput.value.trim();
    if (!userMsg) return;
    addMessage(userMsg, 'user');
    chatInput.value = '';
    setTimeout(() => {
      const botReply = `Você disse: "${userMsg}"? Isso aí é com o Mikael!`;
      addMessage(botReply, 'bot');
    }, 1000);
  });
}
addMessage('Olá! Seja bem-vindo(a) ao AutisMind. Como posso ajudar?', 'bot');

// Personagem
const btnPersonagem = document.getElementById('btn-personagem');
const telaPersonagem = document.getElementById('criar-personagem');
const btnFecharPersonagem = document.getElementById('fechar-personagem');
if (btnPersonagem && telaPersonagem && btnFecharPersonagem) {
  btnPersonagem.addEventListener('click', (e) => {
    e.preventDefault();
    telaPersonagem.style.display = 'flex';
  });
  btnFecharPersonagem.addEventListener('click', () => {
    telaPersonagem.style.display = 'none';
  });
}
const formPersonagem = document.getElementById('form-personagem');
const inputNome = document.getElementById('personagem-nome');
const inputPersonalidade = document.getElementById('personagem-personalidade');
if (formPersonagem && inputNome && inputPersonalidade) {
  formPersonagem.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = inputNome.value.trim();
    const personalidade = inputPersonalidade.value.trim();
    if (!nome || !personalidade) {
      alert('Preencha todos os campos!');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nome, personality: personalidade })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Personagem criado com sucesso!');
        inputNome.value = '';
        inputPersonalidade.value = '';
        document.getElementById('criar-personagem').style.display = 'none';
      } else {
        alert('Erro ao criar personagem: ' + (data.message || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão com o servidor');
    }
  });
}

// Login
const btnLogin = document.getElementById('btn-login');
const telaLogin = document.getElementById('tela-login');
const btnFecharLogin = document.getElementById('fechar-login');
const formLogin = document.getElementById('form-login');
if (btnLogin && telaLogin && btnFecharLogin && formLogin) {
  btnLogin.addEventListener('click', (e) => {
    e.preventDefault();
    telaLogin.style.display = 'flex';
  });
  btnFecharLogin.addEventListener('click', () => {
    telaLogin.style.display = 'none';
  });
  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-senha').value.trim();
    if (!verifyEmail(email) || !password) {
      alert('Preencha todos os campos!');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Login realizado com sucesso!');
        telaLogin.style.display = 'none';
        console.log(data.user);
        document.getElementsByClassName('txt-link')[0].textContent = `${data.user.username}`;

        // adicionar o histórico de usuário na tela de histórico
        const dataHistorico = await fetch(`http://localhost:3000/api/users/${data.user.id}/historical`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.user.jwt_token}` }
        }).then(res => res.json()).then(historico => {
          localStorage.setItem('historico', JSON.stringify(historico));
          console.log(historico);
          // mostrarHistorico();
        });
        // console.log('Histórico carregado com sucesso');


      } else {
        alert(data.message || 'Erro no login');
      }
    } catch (err) {
      console.error(err.message || err);
      alert('Erro ao conectar com o servidor');
    }
  });
}

// Histórico
function mostrarHistorico() {
  const lista = document.getElementById('historico-lista');
  lista.innerHTML = '';
  let historico = JSON.parse(localStorage.getItem('historico')) || [];
  lista.innerHTML = '';
  if (historico.length === 0) {
    lista.innerHTML = '<p>Nenhuma conversa salva.</p>';
    return;
  }
  // Corrige: historico pode ser um array de conversas ou de objetos diferentes
  if (!Array.isArray(historico)) {
    // Se o histórico vier do backend, pode estar dentro de um objeto { historical: [...] }
    if (historico && Array.isArray(historico.historical)) {
      historico = historico.historical;
    } else {
      historico = [];
    }
  }
  historico.forEach(item => {
    const div = document.createElement('div');
    div.className = 'historico-item';
    // Suporte para diferentes formatos de histórico
    if (item.data && item.texto) {
      div.innerHTML = `<strong>${item.data}:</strong> ${item.texto}`;
    } else if (item.data && item.conversa) {
      div.innerHTML = `<strong>${item.data}:</strong><br>${item.conversa.map(m => `<span>${m.remetente}: ${m.texto}</span>`).join('<br>')}`;
    } else if (item.date && item.chat_title) {
      div.innerHTML = `<strong>${new Date(item.date).toLocaleString()}:</strong> ${item.chat_title}`;
    } else {
      div.textContent = JSON.stringify(item);
    }
    lista.appendChild(div);
  });
}
const btnHistorico = document.getElementById('btn-historico');
const fecharHistorico = document.getElementById('fechar-historico');
if (btnHistorico && fecharHistorico) {
  btnHistorico.addEventListener('click', function (e) {
    e.preventDefault();
    mostrarHistorico();
    document.getElementById('historico').style.display = 'block';
  });
  fecharHistorico.addEventListener('click', function () {
    document.getElementById('historico').style.display = 'none';
  });
}
function salvarConversa() {
  let historico = JSON.parse(localStorage.getItem('historico')) || [];
  const mensagens = Array.from(document.querySelectorAll('#messages .message')).map(div => ({
    texto: div.textContent,
    remetente: div.classList.contains('user') ? 'Usuário' : 'Bot'
  }));
  if (mensagens.length > 0) {
    historico.push({
      data: new Date().toLocaleString(),
      conversa: mensagens
    });
    localStorage.setItem('historico', JSON.stringify(historico));
  }
}
const novoChat = document.querySelector('.item-menu .bi-signal');
if (novoChat) {
  novoChat.closest('a').addEventListener('click', function (e) {
    e.preventDefault();
    salvarConversa();
    document.getElementById('messages').innerHTML = '';
  });
}
const sair = document.querySelector('.item-menu .bi-box-arrow-right');
if (sair) {
  sair.closest('a').addEventListener('click', function (e) {
    e.preventDefault();
    if (confirm('Quer mesmo nos deixar?:(')) {
      localStorage.removeItem('usuario');
      window.location.href = 'index.html';
    }
  });
}
// Configurações
const config = document.querySelector('.item-menu .bi-gear');
if (config) {
  config.closest('a').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('configuracoes').style.display = 'block';
  });
}
const fecharConfig = document.getElementById('fechar-config');
if (fecharConfig) {
  fecharConfig.addEventListener('click', function () {
    document.getElementById('configuracoes').style.display = 'none';
  });
}
const formConfig = document.getElementById('form-config');
if (formConfig) {
  formConfig.addEventListener('submit', function (e) {
    e.preventDefault();
    const tema = document.getElementById('tema').value;
    const notificacoes = document.getElementById('notificacoes').checked;
    localStorage.setItem('config-tema', tema);
    localStorage.setItem('config-notificacoes', notificacoes);
    alert('Configurações salvas!');
    document.getElementById('configuracoes').style.display = 'none';
  });
}
window.addEventListener('DOMContentLoaded', function () {
  const tema = localStorage.getItem('config-tema');
  if (tema === 'escuro') {
    document.body.classList.add('tema-escuro');
  }
});
