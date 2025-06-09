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
