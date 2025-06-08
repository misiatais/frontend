// Variáveis Globais (para controlar o estado do chat)
const baseURL = 'http://localhost:3000';
let currentChatId = null;
let currentChatTitle = '';

// --- Funções Utilitárias ---
function verifyEmail(email) {
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

function addMessageToUI(text, sender, timestamp = null) {
  const messagesContainer = document.getElementById('messages');
  if (!messagesContainer) {
    console.error("Container de mensagens (#messages) não encontrado.");
    return;
  }
  const div = document.createElement('div');

  div.classList.add('message', sender);
  div.textContent = text;

  // Adiciona a data/hora de envio
  const p = document.createElement('p');
  p.className = 'message-timestamp';
  // Se não for passado timestamp, usa o horário atual
  const date = timestamp ? new Date(timestamp) : new Date();
  p.textContent = date.toLocaleString();
  p.style.fontSize = '0.8em';
  p.style.margin = '4px 0 0 0';
  p.style.color = '#888';
  if (sender === 'user') {
    p.style.color = '#00000070'; // Cor diferente para mensagens do usuário
  }
  div.appendChild(p);

  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function checkAuthAndLoadData() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const usernameElement = document.getElementsByClassName('txt-link')[0]; // Elemento onde o nome de usuário é exibido
  const btnLogin = document.getElementById('btn-login');
  const telaLogin = document.getElementById('tela-login');

  // Se não há token ou userId, o usuário não está logado.
  if (!token || !userId) {
    if (usernameElement) usernameElement.textContent = 'Login';
    if (btnLogin) btnLogin.style.display = 'block';
    if (telaLogin) telaLogin.style.display = 'flex';
    console.log("Nenhum token ou userId encontrado. Exibindo tela de login.");
    return; // Sai da função, pois não há login para verificar
  }

  try {
    // Tenta buscar o histórico para validar o token.
    // Se este endpoint exigir autenticação, ele servirá como uma validação do token.
    const response = await fetch(`${baseURL}/api/users/${userId}/historical`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      const apiResponse = await response.json();
      let historicoChats = [];
      if (apiResponse && Array.isArray(apiResponse.historical)) {
        historicoChats = apiResponse.historical;
        localStorage.setItem('historico', JSON.stringify(historicoChats)); // Atualiza o histórico no localStorage
      } else {
        localStorage.setItem('historico', JSON.stringify([]));
      }

      /**
       * Se o token é válido, busca o nome de usuário.
       * O ideal é ter um endpoint /api/me que retorna os dados do user_id.
       * Exemplo de uso:
       *   const userResponse = await fetch(`http://localhost:3000/api/users/${userId}`, { ... });
       *   const userData = await userResponse.json();
       *   if (usernameElement && userData && userData.username) usernameElement.textContent = userData.username;
       *
       * Se o username já está salvo no localStorage no login, pode-se usar:
       *   const savedUsername = localStorage.getItem('username');
       *   if (usernameElement) usernameElement.textContent = savedUsername || 'Usuário Logado';
       */

      const savedUsername = localStorage.getItem('username');
      if (usernameElement) usernameElement.textContent = savedUsername || 'Usuário Logado';

      if (telaLogin) {
        telaLogin.style.display = 'none'; // Esconde o modal de login se estiver aberto
        usernameElement.textContent = savedUsername; // Atualiza o texto do nome de usuário na sidebar
      }

      console.log("Token válido. Usuário logado automaticamente.");

      loadAndDisplayHistory(); // O histórico aparece assim que o usuário loga
    } else if (response.status === 401 || response.status === 403) {
      // Token expirado ou inválido
      console.warn("Token expirado ou inválido. Realizando logout.");
      localStorage.clear(); // Limpa tudo
      if (usernameElement) usernameElement.textContent = 'Login';
      if (btnLogin) btnLogin.style.display = 'block';
      if (telaLogin) telaLogin.style.display = 'flex';
      alert('Sua sessão expirou. Por favor, faça login novamente.');
    } else {
      // Outro erro de rede ou do servidor
      console.error(`Erro ao verificar login: ${response.status} - ${response.statusText}`);
      localStorage.clear(); // Limpa para evitar problemas futuros
      if (usernameElement) usernameElement.textContent = 'Login';
      if (btnLogin) btnLogin.style.display = 'block';
      if (telaLogin) telaLogin.style.display = 'flex';
      alert('Erro ao verificar sessão. Por favor, faça login novamente.');
    }
  } catch (error) {
    console.error('Erro na requisição de validação de token:', error);
    localStorage.clear(); // Limpa em caso de erro de rede ou inesperado
    if (usernameElement) usernameElement.textContent = 'Login';
    if (btnLogin) btnLogin.style.display = 'block';
    if (telaLogin) telaLogin.style.display = 'flex';
    alert('Não foi possível conectar ao servidor para verificar sua sessão. Por favor, faça login novamente.');
  }
}

// --- 1. Inicialização da Interface do Chat ---
function initializeChatUI() {
  checkAuthAndLoadData();
  const btnExpandir = document.querySelector('.btn-expandir');
  const menuLateral = document.querySelector('.menu-lateral');

  if (btnExpandir && menuLateral) {
    btnExpandir.addEventListener('click', () => {
      menuLateral.classList.toggle('expandir');
    });
  }

  addMessageToUI('Olá! Seja bem-vindo(a) ao AutisMind. Como posso ajudar?', 'bot');

  handleLogin();
  handleNewChat();
  handleChatMessaging();
  handleChatHistory();
  handleSettings();
  handleLogout();

  // // Carrega o tema salvo ao iniciar
  // const tema = localStorage.getItem('config-tema');
  // if (tema === 'escuro') {
  //   document.body.classList.add('tema-escuro');
  // }
}

// --- 2. Funcionalidade de Login ---
function handleLogin() {
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
        const response = await fetch(`${baseURL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
          alert('Login realizado com sucesso!');
          telaLogin.style.display = 'none';
          document.getElementsByClassName('txt-link')[0].textContent = `${data.user.username}`;
          localStorage.setItem('username', data.user.username);
          localStorage.setItem('token', data.user.jwt_token);
          localStorage.setItem('userId', data.user.id);

          // Carrega o histórico após o login bem-sucedido
          await fetch(`${baseURL}/api/users/${data.user.id}/historical`, {
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
            })
            .catch(error => {
              console.error("Erro ao carregar histórico após login:", error);
              localStorage.setItem('historico', JSON.stringify([])); // Garante que é um array
            });

          // Carrega personagens para o modal de novo chat
          await loadCharactersForNewChat();

        } else {
          alert(data.message || 'Erro no login');
        }
      } catch (err) {
        console.error(err.message || err);
        alert('Erro ao conectar com o servidor');
      }
    });
  }
}

// --- 3. Funcionalidade de Novo Chat ---
function handleNewChat() {
  const btnNovoChat = document.getElementById('btn-novo-chat');
  const telaNovoChat = document.getElementById('novo-chat');
  const btnFecharChat = document.getElementById('fechar-chat');
  const formNovoChat = document.getElementById('form-novo-chat');

  if (btnNovoChat && telaNovoChat && btnFecharChat && formNovoChat) {
    btnNovoChat.addEventListener('click', async (e) => {
      e.preventDefault();
      telaNovoChat.style.display = 'flex';
      await loadCharactersForNewChat(); // Carrega personagens ao abrir o modal

      const messagesContainer = document.getElementById('messages');
      if (messagesContainer) {
        messagesContainer.innerHTML = '';
        addMessageToUI('Olá! Crie seu novo chat. Como posso ajudar?', 'bot');
      }
      currentChatId = null; // Reinicia o chat ID, indicando que é um novo chat
      currentChatTitle = ''; // Reinicia o título
    });

    btnFecharChat.addEventListener('click', () => {
      telaNovoChat.style.display = 'none';
    });

    formNovoChat.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tituloChat = document.getElementById('titulo-chat').value.trim();
      const personagemId = document.getElementById('personagens').value;

      if (!tituloChat) {
        alert('Por favor, insira um título para o chat.');
        return;
      }
      if (!personagemId) {
        alert('Por favor, selecione um personagem.');
        return;
      }

      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) {
          alert('Você precisa estar logado para criar um chat.');
          return;
        }

        const response = await fetch(`${baseURL}/api/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: userId,
            title: tituloChat,
            character_id: personagemId
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao criar novo chat:", errorData);
          alert('Erro ao criar novo chat: ' + (errorData.message || 'Erro desconhecido'));
          return;
        }

        const newChatData = await response.json();
        currentChatId = newChatData.id;
        currentChatTitle = newChatData.title;

        alert('Chat criado com sucesso!');
        telaNovoChat.style.display = 'none';
        document.getElementById('messages').innerHTML = ''; // Limpa antes de adicionar a mensagem inicial
        addMessageToUI(`Chat "${currentChatTitle}" iniciado! Como posso ajudar?`, 'bot');

      } catch (error) {
        alert('Erro ao criar novo chat. Tente novamente mais tarde.');
        console.error('Erro ao criar novo chat (catch):', error.message || error);
      }
    });
  }
}


// --- 4. Carregar Personagens no Select ---
async function loadCharactersForNewChat() {
  var personagensSelect = document.getElementById('personagens');
  if (!personagensSelect) {
    console.error('Elemento <select id="personagens"> não encontrado.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      personagensSelect.innerHTML = '<option value="">Faça login para ver os personagens</option>';
      return;
    }

    const response = await fetch(`${baseURL}/api/characters`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Erro ao carregar personagens: ${response.status} - ${errorData.message}`);
      personagensSelect.innerHTML = '<option value="">Erro ao carregar personagens</option>';
      return;
    }

    const responsePersonagens = await response.json();
    personagensSelect.innerHTML = '<option value="">Selecione um personagem</option>';

    let lista = [];
    if (responsePersonagens && Array.isArray(responsePersonagens.characters)) {
      lista = responsePersonagens.characters;
    } else if (Array.isArray(responsePersonagens)) {
      lista = responsePersonagens;
    } else if (responsePersonagens && Array.isArray(responsePersonagens.data)) {
      lista = responsePersonagens.data;
    }

    if (lista.length === 0) {
      personagensSelect.innerHTML += '<option disabled>Nenhum personagem encontrado</option>';
    } else {
      lista.forEach(personagem => {
        var option = document.createElement('option');
        option.value = personagem.id;
        option.textContent = `${personagem.name} - (${personagem.personality})`;
        personagensSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar personagens (catch):', error.message || error);
    alert('Erro ao carregar personagens. Tente novamente mais tarde.');
  }
}

// --- 5. Funcionalidade de Envio de Mensagens (Chat Principal) ---
function handleChatMessaging() {
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const userMsg = chatInput.value.trim();

      if (!userMsg) return;
      if (!currentChatId) {
        alert('Por favor, crie ou selecione um chat para começar a conversar.');
        return;
      }

      addMessageToUI(userMsg, 'user');
      chatInput.value = '';

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Você não está logado.');
          return;
        }

        // 1. Salva a mensagem do usuário no backend
        const userMessageSaveResponse = await fetch(`${baseURL}/api/messages/chat/${currentChatId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            user_id: localStorage.getItem('userId'),
            content: userMsg,
            sent_by: 'user'
          })
        });

        if (!userMessageSaveResponse.ok) {
          console.error('Erro ao salvar mensagem do usuário.');
        }

        // 2. Simula a resposta do bot (Integre sua lógica de IA aqui)
        const botReply = `Você disse: "${userMsg}"? Isso aí é com o Mikael!`;
        addMessageToUI(botReply, 'bot', new Date().toISOString());

        // 3. Salva a resposta do bot no backend
        const botMessageSaveResponse = await fetch(`${baseURL}/api/messages/chat/${currentChatId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            user_id: localStorage.getItem('userId'),
            content: botReply,
            sent_by: 'bot'
          })
        });

        if (!botMessageSaveResponse.ok) {
          console.error('Erro ao salvar mensagem do bot.');
          alert('Erro ao salvar mensagem do bot. Tente novamente.');
        }

      } catch (error) {
        console.error('Erro ao enviar/salvar mensagem:', error);
        alert('Erro ao enviar mensagem. Tente novamente.');
      }
    });
  }
}

// --- 6. Funcionalidade de Histórico ---
function handleChatHistory() {
  const btnHistorico = document.getElementById('btn-historico');
  const telaHistorico = document.getElementById('historico');
  const fecharHistorico = document.getElementById('fechar-historico');
  const historicoLista = document.getElementById('historico-lista');

  if (btnHistorico && telaHistorico && fecharHistorico && historicoLista) {
    btnHistorico.addEventListener('click', async function (e) {
      e.preventDefault();
      telaHistorico.style.display = 'block';
      await loadAndDisplayHistory(); // Carrega e mostra o histórico
    });

    fecharHistorico.addEventListener('click', function () {
      telaHistorico.style.display = 'none';
    });
  }
}

async function loadAndDisplayHistory() {
  const historicoLista = document.getElementById('historico-lista');
  historicoLista.innerHTML = ''; // Limpa a lista atual

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    historicoLista.innerHTML = '<p>Faça login para ver seu histórico.</p>';
    return;
  }

  try {
    const response = await fetch(`${baseURL}/api/users/${userId}/historical`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Erro ao carregar histórico: ${response.status} - ${errorData.message}`);
      historicoLista.innerHTML = '<p>Erro ao carregar histórico.</p>';
      return;
    }

    const apiResponse = await response.json();
    let historicoChats = [];

    if (apiResponse && Array.isArray(apiResponse.historical)) {
      historicoChats = apiResponse.historical;
      localStorage.setItem('historico', JSON.stringify(historicoChats));
    } else {
      historicoLista.innerHTML = '<p>Nenhuma conversa salva.</p>';
      return;
    }

    if (historicoChats.length === 0) {
      historicoLista.innerHTML = '<p>Nenhuma conversa salva.</p>';
    } else {
      historicoChats.forEach(chatItem => {
        const div = document.createElement('div');
        div.className = 'historico-item';
        div.dataset.chatId = chatItem.id; // Armazena o ID do chat
        div.innerHTML = `<strong>${chatItem.chat_title || 'Chat sem título'}</strong><br><small>${new Date(chatItem.date).toLocaleString()}</small>`;

        div.addEventListener('click', () => {
          loadSpecificChat(chatItem.id); // Carrega o chat ao clicar no item
          document.getElementById('historico').style.display = 'none';
        });
        historicoLista.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar histórico (catch):', error.message || error);
    historicoLista.innerHTML = '<p>Erro ao carregar histórico.</p>';
    alert('Erro ao carregar histórico. Tente novamente mais tarde.');
  }
}

// --- 7. Carregar um Chat Específico do Histórico ---
async function loadSpecificChat(chatId) {
  currentChatId = chatId; // Define o chat selecionado como o chat ativo
  const messagesContainer = document.getElementById('messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = ''; // Limpa a área de chat atual
  }

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('Você não está logado para carregar o histórico.');
    return;
  }
  if (!token) {
    alert('Você não está logado para carregar o histórico.');
    return;
  }

  try {
    const response = await fetch(`${baseURL}/api/chat/${chatId}/messages/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`Erro ao carregar mensagens do chat ${chatId}: ${response.status} - ${errorData.message}`);
      addMessageToUI('Erro ao carregar chat. Tente novamente.', 'bot');
      return;
    }

    const apiResponse = await response.json();
    let messagesData = [];

    if (apiResponse && Array.isArray(apiResponse.messages)) {
      messagesData = apiResponse.messages;
    } else {
      console.warn(`Resposta de mensagens para chat ${chatId} não contém um array 'messages':`, apiResponse);
      // Se o formato for inesperado, tratamos como um chat sem mensagens
      messagesData = [];
    }

    if (messagesData.length === 0) {
      addMessageToUI('Este chat ainda não tem mensagens. Comece a conversar!', 'bot');
    } else {
      messagesData.forEach(msg => {
        addMessageToUI(msg.content, msg.sent_by);
      });
    }
    document.getElementById('historico').style.display = 'none';

  } catch (error) {
    console.error('Erro ao carregar chat:', error);
    alert('Erro ao carregar chat. Tente novamente mais tarde.');
  }
}

// --- 8. Funcionalidade de Configurações ---
function handleSettings() {
  const configButton = document.querySelector('.item-menu .bi-gear');
  const configuracoesModal = document.getElementById('configuracoes');
  const fecharConfigButton = document.getElementById('fechar-config');
  const formConfig = document.getElementById('form-config');

  if (configButton && configuracoesModal && fecharConfigButton && formConfig) {
    configButton.closest('a').addEventListener('click', function (e) {
      e.preventDefault();
      configuracoesModal.style.display = 'block';

      // Carrega as configurações salvas
      const savedTema = localStorage.getItem('config-tema');
      const savedNotificacoes = localStorage.getItem('config-notificacoes') === 'true';

      if (savedTema) {
        document.getElementById('tema').value = savedTema;
      }
      document.getElementById('notificacoes').checked = savedNotificacoes;
    });

    fecharConfigButton.addEventListener('click', function () {
      configuracoesModal.style.display = 'none';
    });

    formConfig.addEventListener('submit', function (e) {
      e.preventDefault();
      const tema = document.getElementById('tema').value;
      const notificacoes = document.getElementById('notificacoes').checked;

      localStorage.setItem('config-tema', tema);
      localStorage.setItem('config-notificacoes', notificacoes);
      alert('Configurações salvas!');
      configuracoesModal.style.display = 'none';

      // Aplica o tema imediatamente
      if (tema === 'escuro') {
        document.body.classList.add('tema-escuro');
      } else {
        document.body.classList.remove('tema-escuro');
      }
    });
  }
}

// --- 9. Funcionalidade de Logout ---
function handleLogout() {
  const logoutButton = document.querySelector('.item-menu .bi-box-arrow-right');

  if (logoutButton) {
    logoutButton.closest('a').addEventListener('click', function (e) {
      e.preventDefault();
      if (confirm('Quer mesmo nos deixar? :(')) {
        localStorage.clear(); // Limpa todo o localStorage (token, userId, histórico, etc.)
        window.location.href = './index.html'; // Redireciona para a página inicial
      }
    });
  }
}

// --- Execução Principal (Chamada das Funções) ---
document.addEventListener('DOMContentLoaded', initializeChatUI);