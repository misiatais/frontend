function verifyEmail(email) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

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
        document.getElementsByClassName('txt-link')[0].textContent = `${data.user.username}`;
        localStorage.setItem('token', data.user.jwt_token);
        localStorage.setItem('userId', data.user.id);
        await fetch(`http://localhost:3000/api/users/${data.user.id}/historical`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${data.user.jwt_token}` }
        })
          .then(res => res.json())
          .then(apiResponse => {
            if (apiResponse && Array.isArray(apiResponse.historical)) {
              localStorage.setItem('historico', JSON.stringify(apiResponse.historical));
            } else {
              localStorage.setItem('historico', JSON.stringify([]));
            }
          });
        carregarPersonagensNoSelect();
      } else {
        alert(data.message || 'Erro no login');
      }
    } catch (err) {
      console.error(err.message || err);
      alert('Erro ao conectar com o servidor');
    }
  });
}

// Carrega personagens no select do modal Novo Chat
async function carregarPersonagensNoSelect() {
  var personagens = document.getElementById('personagens');
  if (!personagens) {
    console.error('Elemento <select id="personagens"> não encontrado.');
    return;
  }
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      personagens.innerHTML = '<option value="">Faça login para ver os personagens</option>';
      return;
    }
    const response = await fetch('http://localhost:3000/api/characters', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      personagens.innerHTML = '<option value="">Erro ao carregar personagens</option>';
      return;
    }
    const responsePersonagens = await response.json();
    personagens.innerHTML = '<option value="">Selecione um personagem</option>';
    let lista = [];
    if (responsePersonagens && Array.isArray(responsePersonagens.characters)) {
      lista = responsePersonagens.characters;
    } else if (Array.isArray(responsePersonagens)) {
      lista = responsePersonagens;
    } else if (responsePersonagens && Array.isArray(responsePersonagens.data)) {
      lista = responsePersonagens.data;
    }
    if (lista.length === 0) {
      personagens.innerHTML += '<option disabled>Nenhum personagem encontrado</option>';
    } else {
      lista.forEach(personagem => {
        var option = document.createElement('option');
        option.value = personagem.id;
        option.textContent = `${personagem.name} - (${personagem.personality})`;
        personagens.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar personagens (catch):', error.message || error);
    alert('Erro ao carregar personagens. Tente novamente mais tarde.');
  }
}

const btnNovoChat = document.getElementById('btn-novo-chat');
const telaNovoChat = document.getElementById('novo-chat');
const btnFecharChat = document.getElementById('fechar-chat');
if (btnNovoChat && telaNovoChat && btnFecharChat) {
  btnNovoChat.addEventListener('click', async function (e) {
    e.preventDefault();
    telaNovoChat.style.display = 'flex';
    await carregarPersonagensNoSelect();
    if (messages) {
      messages.innerHTML = '';
      addMessage('Olá! Seja bem-vindo(a) ao AutisMind. Como posso ajudar?', 'bot');
    }
  });
  btnFecharChat.addEventListener('click', function () {
    telaNovoChat.style.display = 'none';
  });
}

function mostrarHistorico() {
  const lista = document.getElementById('historico-lista');
  lista.innerHTML = '';
  let historico = [];
  try {
    const raw = localStorage.getItem('historico');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        historico = parsed;
      } else if (parsed && Array.isArray(parsed.historical)) {
        historico = parsed.historical;
      } else if (parsed && Array.isArray(parsed.data)) {
        historico = parsed.data;
      } else if (typeof parsed === 'object' && parsed !== null) {
        historico = [parsed];
      }
    }
  } catch (e) {
    historico = [];
  }
  if (historico.length === 0) {
    lista.innerHTML = '<p>Nenhuma conversa salva.</p>';
    return;
  }
  historico.forEach(item => {
    const div = document.createElement('div');
    div.className = 'historico-item';
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
  let historico;
  try {
    historico = JSON.parse(localStorage.getItem('historico'));
  } catch (e) {
    historico = [];
  }
  if (!Array.isArray(historico)) {
    historico = [];
  }
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
    if (confirm('Quer mesmo nos deixar? :(')) {
      localStorage.clear();
      window.location.href = '../index/index.html';
    }
  });
}
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
