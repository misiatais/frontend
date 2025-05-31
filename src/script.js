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

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const userMsg = chatInput.value.trim();
  if (!userMsg) return;

  addMessage(userMsg, 'user'); 
  chatInput.value = '';

 
  setTimeout(() => {
    const botReply = `Você disse: "${userMsg}". Isso aí é com o Mikael!`;
    addMessage(botReply, 'bot');
  }, 1000);
});


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
    const response = await fetch('http://localhost:3000/characters', {
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

  if (!email || !password) {
    alert('Preencha todos os campos!');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert('Login realizado com sucesso!');
      telaLogin.style.display = 'none';

     
      console.log(data.user);
    } else {
      alert(data.message || 'Erro no login');
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao conectar com o servidor');
  }
});
