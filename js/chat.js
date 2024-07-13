const usernameInput = document.getElementById('usernameInput');
const $chatElement = document.getElementById('chat');
const $messageInput = document.getElementById('messageInput');
const $disconnectBtn = document.getElementById('disconnect-btn');
const $chatStatus = document.getElementById('chat-status');
const $onlineStatus = document.getElementById('status-online');
const $offlineStatus = document.getElementById('status-offline');

let username = '';
let socket;

function connectToChat() {
    username = usernameInput.value.trim();
    if (username) {
        localStorage.setItem('name', username);
        document.getElementById('usernameForm').style.display = 'none';
        document.getElementById('chat').style.display = 'flex';
        document.getElementById('message').style.display = 'flex';
        $disconnectBtn.style.display = 'block';
        $chatStatus.classList.remove('hidden');

        socket = io('https://cinexunidos-production.up.railway.app', {
            auth: { name: username }
        });

        socket.on('connect', () => {
            console.log('Conectado');
            updateStatus(true);
        });

        socket.on('disconnect', () => {
            console.log('Desconectado');
            updateStatus(false);
        });

        socket.on('new-message', renderMessage);
    } else {
        alert('Por favor, introduce un nombre de usuario válido.');
    }
}

function sendMessage() {
    const message = $messageInput.value.trim();
    if (message) {
        socket.emit('send-message', message);
        $messageInput.value = '';
    }
}

function renderMessage(payload) {
    const { message, name } = payload;
    const $divElement = document.createElement('div');
    $divElement.classList.add('message');
    $divElement.classList.add(name === username ? 'outgoing' : 'incoming');
    $divElement.innerHTML = `<small><strong>${name}</strong></small><p>${message}</p>`;
    $chatElement.appendChild($divElement);
    $chatElement.scrollTop = $chatElement.scrollHeight;
}

function updateStatus(isOnline) {
    if (isOnline) {
        $onlineStatus.classList.remove('hidden');
        $offlineStatus.classList.add('hidden');
    } else {
        $onlineStatus.classList.add('hidden');
        $offlineStatus.classList.remove('hidden');
    }
}

$messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

$disconnectBtn.addEventListener('click', (evt) => {
    evt.preventDefault();
    localStorage.removeItem('name');
    socket.close();
    window.location.reload();
    $disconnectBtn.style.display = 'none';
});
