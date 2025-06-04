function verifyEmail(email) {
    return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

// --- CÓDIGO DA TELA INICIAL ---
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        // const comunicationLevel = 0;
        if (!nome || !verifyEmail(email) || !senha) {
            alert('Preencha todos os campos corretamente!');
            return;
        }
        const usuario = {
            username: nome.trim(),
            email: email.trim(),
            password: senha,
            communication_level: 5 // Nível de comunicação padrão
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
                alert('Erro ao salvar usuário: ' + (data && data.message ? data.message : JSON.stringify(data)));
                throw new Error('Erro ao salvar usuário: ' + (data && data.message ? data.message : JSON.stringify(data)));
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
}
