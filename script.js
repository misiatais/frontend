function verifyEmail(email) {
    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

const btnExpandir = document.querySelector('.btn-expandir');
const menuLateral = document.querySelector('.menu-lateral');

btnExpandir.addEventListener('click', () => {
  menuLateral.classList.toggle('expandir');
});


const messages = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

function addMessage(text, sender) {
  const div = document.createElement('div');
  div.classList.add('message', sender);
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight; // rolar pro final
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


const btnPersonagem = document.getElementById('btn-personagem');
const telaPersonagem = document.getElementById('criar-personagem');
const btnFecharPersonagem = document.getElementById('fechar-personagem');

btnPersonagem.addEventListener('click', (e) => {
  e.preventDefault();
  telaPersonagem.style.display = 'flex';
});

btnFecharPersonagem.addEventListener('click', () => {
  telaPersonagem.style.display = 'none';
});
const formPersonagem = document.getElementById('form-personagem');
const inputNome = document.getElementById('personagem-nome');
const inputPersonalidade = document.getElementById('personagem-personalidade');

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
      document.getElementById('criar-personagem').style.display = 'none'; // Fecha a tela
    } else {
      alert('Erro ao criar personagem: ' + (data.message || 'Erro desconhecido'));
    }
  } catch (err) {
    console.error(err);
    alert('Erro de conexão com o servidor');
  }
});
// Elementos da tela de login
const btnLogin = document.getElementById('btn-login');
const telaLogin = document.getElementById('tela-login');
const btnFecharLogin = document.getElementById('fechar-login');
const formLogin = document.getElementById('form-login');


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

    } else {
      alert(data.message || 'Erro no login');
    }
  } catch (err) {
    console.error(err.message || err);
    alert('Erro ao conectar com o servidor');
  }
});

const formCadastro = document.getElementById('form-cadastro');
console.log('form-cadastro encontrado?', !!formCadastro);
if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const comunicationLevel = 0;
    if (!nome || !verifyEmail(email) || !senha) {
      alert('Preencha todos os campos corretamente!');
      return;
    }
    const usuario = {
      username: nome,
      email: email,
      password: senha,
      communication_level: comunicationLevel
    };
    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      });
      let data = null;
      try {
        data = await response.json();
      } catch (jsonErr) {
        const text = await response.text();
        alert('Erro ao salvar usuário: ' + response.status + ' - ' + text);
        throw new Error('Erro ao salvar usuário: ' + response.status + ' - ' + text);
      }
      if (!response.ok) {
        alert('Erro ao salvar usuário: ' + (data.message || JSON.stringify(data)));
        throw new Error('Erro ao salvar usuário: ' + (data.message || JSON.stringify(data)));
      }
    } catch (e) {
      alert('Erro ao salvar usuário: ' + (e.message || e));
      console.error('Erro ao salvar usuário:', e);
      return;
    }
    alert('Cadastro realizado com sucesso!');
    console.log('Usuário cadastrado:', usuario);
    formCadastro.reset();
    document.querySelector('#cadastroModal .btn-close').click();
  });
} else {
  // Apenas loga no console, não mostra alert
  console.log('formulário de cadastro não encontrado no DOM (isso é esperado em algumas páginas)');
}

function mostrarHistorico() {
  const lista = document.getElementById('historico-lista');
  let historico = JSON.parse(localStorage.getItem('historico')) || [];
  lista.innerHTML = '';
  if (historico.length === 0) {
    lista.innerHTML = '<p>Nenhuma conversa salva.</p>';
    return;
  }
  historico.reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'historico-item';
    div.innerHTML = `<strong>${item.data}:</strong> ${item.texto}`;
    lista.appendChild(div);
  });
}

document.getElementById('btn-historico').addEventListener('click', function (e) {
  e.preventDefault();
  mostrarHistorico();
  document.getElementById('historico').style.display = 'block';
});

document.getElementById('fechar-historico').addEventListener('click', function () {
  document.getElementById('historico').style.display = 'none';
});

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
document.querySelector('.item-menu .bi-signal').closest('a').addEventListener('click', function (e) {
  e.preventDefault();
  salvarConversa();

  document.getElementById('messages').innerHTML = '';
});

document.querySelector('.item-menu .bi-box-arrow-right').closest('a').addEventListener('click', function (e) {
  e.preventDefault();
  if (confirm('Quer mesmo nos deixar?:(')) {
    localStorage.removeItem('usuario');
    window.location.href = 'index.html';
  }
});

// Abrir configurações
document.querySelector('.item-menu .bi-gear').closest('a').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('configuracoes').style.display = 'block';
});

// Fechar configurações
document.getElementById('fechar-config').addEventListener('click', function () {
  document.getElementById('configuracoes').style.display = 'none';
});

// Salvar configurações
document.getElementById('form-config').addEventListener('submit', function (e) {
  e.preventDefault();
  const tema = document.getElementById('tema').value;
  const notificacoes = document.getElementById('notificacoes').checked;
  localStorage.setItem('config-tema', tema);
  localStorage.setItem('config-notificacoes', notificacoes);
  alert('Configurações salvas!');
  document.getElementById('configuracoes').style.display = 'none';
  // Aqui você pode aplicar o tema dinamicamente se quiser
});

window.addEventListener('DOMContentLoaded', function () {
  const tema = localStorage.getItem('config-tema');
  if (tema === 'escuro') {
    document.body.classList.add('tema-escuro');
  }
});
