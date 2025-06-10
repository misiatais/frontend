// index.js

function verifyEmail(email) {
    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

function showModal(mensagem) {
    document.getElementById('mensagemTexto').textContent = mensagem;
    const modal = new bootstrap.Modal(document.getElementById('modalMensagem'));
    modal.show();
}

// Cadastro
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        if (!nome || !verifyEmail(email) || !senha) {
            showModal('Preencha todos os campos corretamente!');
            return;
        }

        const usuario = {
            username: nome.trim(),
            email: email.trim(),
            password: senha,
            communication_level: 5
        };

        try {
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(usuario)
            });

            const data = await response.json();
            if (!response.ok) {
                showModal(data.message || 'Erro ao cadastrar.');
                return;
            }

            showModal('Cadastro realizado com sucesso!');
            localStorage.setItem('token', data.jwt_token);
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);
            setTimeout(() => window.location.href = 'chat.html', 1500);

        } catch (err) {
            console.error(err);
            showModal('Erro ao salvar usuário.');
        }
    });
}

// Login
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-senha').value.trim();

        if (!verifyEmail(email) || !password) {
            showModal('Preencha todos os campos corretamente!');
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
                showModal('Login realizado com sucesso!');
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('token', data.user.jwt_token);
                localStorage.setItem('userId', data.user.id);
                setTimeout(() => window.location.href = 'chat.html', 1500);
            } else {
                showModal(data.message || 'Erro no login');
            }
        } catch (err) {
            console.error(err);
            showModal('Erro ao conectar com o servidor');
        }
    });
}

const slider = document.getElementById('nivel-comunicacao');
const output = document.getElementById('valor-nivel-comunicacao');
if(slider && output) {
  slider.oninput = function() {
    output.textContent = this.value;
  }
}

// Função para aplicar o tema salvo
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

// Função para alternar entre temas
function setTheme(theme) {
  document.body.classList.remove('tema-escuro', 'tema-claro');
  
  if (theme === 'dark') {
    document.body.classList.add('tema-escuro');
  } else {
    document.body.classList.add('tema-claro');
  }
  
  localStorage.setItem('theme', theme);
}

// Função para alternar o tema
function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

// Adicione no seu initialization
function init() {
  // ... outro código de inicialização ...
  
  applySavedTheme();
  
  // Adicione um botão para alternar temas (opcional)
  const themeToggleBtn = document.createElement('button');
  themeToggleBtn.id = 'theme-toggle';
  themeToggleBtn.innerHTML = '🌓';
  themeToggleBtn.style.position = 'fixed';
  themeToggleBtn.style.bottom = '20px';
  themeToggleBtn.style.right = '20px';
  themeToggleBtn.style.zIndex = '1000';
  themeToggleBtn.style.background = 'var(--primary-color)';
  themeToggleBtn.style.color = 'white';
  themeToggleBtn.style.border = 'none';
  themeToggleBtn.style.borderRadius = '50%';
  themeToggleBtn.style.width = '40px';
  themeToggleBtn.style.height = '40px';
  themeToggleBtn.style.cursor = 'pointer';
  themeToggleBtn.style.fontSize = '20px';
  
  themeToggleBtn.addEventListener('click', toggleTheme);
  document.body.appendChild(themeToggleBtn);
  
  // ... resto do código de inicialização ...
}