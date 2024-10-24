// Configurações da API Jellyfin
const JELLYFIN_URL = 'http://upfilmes.ddns.net:8096';
const API_KEY = '4648b5a5f46141cda17e30e95510a816';

// Funções auxiliares
function generateUsername() {
    return `usuario_${Math.floor(Math.random() * 9000) + 1000}`;
}


function generatePassword(length = 8) {
    // Gera uma senha com o padrão "senha_1234"
    return `senha_${Math.floor(Math.random() * 9000) + 1000}`;
}

async function createJellyfinUser(username, password) {
    const url = `${JELLYFIN_URL}/Users/New`;
    const user_data = {
        "Name": username,
        "Password": password,
        "IsAdministrator": false,
        "EnableMediaPlayback": true
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Emby-Token': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user_data)
        });
        if (!response.ok) {
            throw new Error(`Erro ao criar usuário Jellyfin: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao criar usuário Jellyfin:', error);
        return null;
    }
}

// Função para deletar o usuário
async function deleteJellyfinUser(userId) {
    const url = `${JELLYFIN_URL}/Users/${userId}`;
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'X-Emby-Token': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error(`Erro ao excluir usuário Jellyfin: ${response.status}`);
        }
    } catch (error) {
        console.error('Erro ao excluir usuário Jellyfin:', error);
    }
}

// Funções para o Modal Usuário Teste
let lastTrialTime = 0; // Armazena o tempo do último teste

// Carrega o tempo do último teste do localStorage
$(document).ready(function () {
    // Verifica se há tempo no localStorage
    const storedLastTrialTime = localStorage.getItem('lastTrialTime');
    if (storedLastTrialTime) {
        lastTrialTime = parseInt(storedLastTrialTime);
    }

    updateTrialButton();
    setInterval(updateTrialButton, 1000); // Atualiza o contador a cada segundo

    // Botão para Limpar o Tempo
    $('#reset-trial-time').click(function () {
        localStorage.removeItem('lastTrialTime'); // Remove o tempo do localStorage
        lastTrialTime = 0; // Define lastTrialTime como 0 para redefinir o tempo
        updateTrialButton(); // Atualiza o botão para mostrar que o tempo está limpo
    });
});

$('#trialModal').on('show.bs.modal', async function () {
    $('.loader').show();
    $('#trial-credentials').hide();

    // Verificar se já passou 24 horas desde o último teste
    const now = Date.now();
    if (now - lastTrialTime < 86400000) { // 86400000 milissegundos = 24 horas
        alert("Você já fez um teste gratuito nas últimas 24 horas. Tente novamente mais tarde.");
        $('.loader').hide();
        return; // Sai da função
    }

    const username = generateUsername();
    const password = generatePassword();

    const user_data = await createJellyfinUser(username, password);

    if (user_data) {
        $('#trial-username').text(username);
        $('#trial-password').text(password);
        $('.loader').hide();
        $('#trial-credentials').show();
        lastTrialTime = now; // Atualiza o tempo do último teste

        // Salva o tempo do último teste no localStorage
        localStorage.setItem('lastTrialTime', lastTrialTime);

        // Copiar Credenciais
        $('#copy-credentials').click(function () {
            const credentials = `Usuário: ${username}\nSenha: ${password}\nEndereço Servidor: http://upfilmes.ddns.net:8096`;
            navigator.clipboard.writeText(credentials)
                .then(() => {
                    // Exibir mensagem de sucesso, se desejar
                    alert('Credenciais copiadas para a área de transferência!');
                })
                .catch(err => {
                    console.error('Erro ao copiar credenciais:', err);
                });
        });
    } else {
        // Tratar o caso em que a criação do usuário falhou
        alert('Erro ao criar usuário. Tente novamente mais tarde.');
        $('.loader').hide();
    }
});

// Inicialização do contador
$(document).ready(function () {
    updateTrialButton();
    setInterval(updateTrialButton, 1000); // Atualiza o contador a cada segundo

    // Botão para Limpar o Tempo
    $('#reset-trial-time').click(function () {
        localStorage.removeItem('lastTrialTime'); // Remove o tempo do localStorage
        lastTrialTime = 0; // Define lastTrialTime como 0 para redefinir o tempo
        updateTrialButton(); // Atualiza o botão para mostrar que o tempo está limpo
    });
});

function updateTrialButton() {
    const now = Date.now();
    const remainingTime = lastTrialTime + 86400000 - now; // Tempo restante em milissegundos

    if (remainingTime > 0) {
        const hours = Math.floor(remainingTime / (1000 * 60 * 60) % 24);
        const minutes = Math.floor(remainingTime / (1000 * 60) % 60);
        const seconds = Math.floor(remainingTime / 1000 % 60);

        $('#trial-button').prop('disabled', true); // Desabilita o botão
        $('#trial-button').html(`<i class="fas fa-user-plus"></i> Teste disponível em ${hours}h ${minutes}m ${seconds}s`);
    } else {
        $('#trial-button').prop('disabled', false); // Habilita o botão
        $('#trial-button').html(`<i class="fas fa-user-plus"></i> Experimente Grátis`);
    }
}
