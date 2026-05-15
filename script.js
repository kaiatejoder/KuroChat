const PASSWORD = 'Kayla';
const HINT = '¿Quién soy?';
const MAX_ATTEMPTS = 3;
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api/messages'
    : '/api/messages';

let attempts = MAX_ATTEMPTS;
let isLoggedIn = false;
let currentUser = 'yo';

// ELEMENTOS DOM
const loginContainer = document.getElementById('loginContainer');
const chatContainer = document.getElementById('chatContainer');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesArea = document.getElementById('messagesArea');
const attemptCounter = document.getElementById('attemptCounter');
const hint = document.getElementById('hint');

// EVENT LISTENERS
loginBtn.addEventListener('click', handleLogin);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

logoutBtn.addEventListener('click', handleLogout);
sendBtn.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

// FUNCIONES DE LOGIN
function handleLogin() {
    const input = passwordInput.value.trim();

    if (input === PASSWORD) {
        isLoggedIn = true;
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        loadMessages();
        messageInput.focus();
    } else {
        attempts--;
        passwordInput.value = '';

        if (attempts > 0) {
            attemptCounter.textContent = `Intentos restantes: ${attempts}`;
            attemptCounter.style.color = '#ff6b6b';
            passwordInput.style.borderColor = '#ff6b6b';
        } else {
            attemptCounter.style.display = 'none';
            hint.textContent = HINT;
            hint.style.display = 'block';
            loginBtn.disabled = true;
            passwordInput.disabled = true;
        }
    }
}

function handleLogout() {
    isLoggedIn = false;
    attempts = MAX_ATTEMPTS;
    passwordInput.value = '';
    passwordInput.style.borderColor = '#333';
    passwordInput.disabled = false;
    loginBtn.disabled = false;
    attemptCounter.style.display = 'block';
    attemptCounter.textContent = `Intentos restantes: ${attempts}`;
    hint.style.display = 'none';
    messagesArea.innerHTML = '';
    loginContainer.style.display = 'flex';
    chatContainer.style.display = 'none';
    passwordInput.focus();
}

// FUNCIONES DE CHAT
async function handleSendMessage() {
    const text = messageInput.value.trim();

    if (text === '') return;

    const messageData = {
        user: currentUser,
        text: text
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });

        if (response.ok) {
            const message = await response.json();
            renderMessage(message);
            messageInput.value = '';
            messageInput.focus();
            scrollToBottom();
        }
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        alert('Error al enviar el mensaje. Verifica que el servidor esté corriendo.');
    }
}

function renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.user === 'yo' ? 'own' : 'other'}`;

    const time = new Date(message.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'message-bubble';
    bubbleEl.innerHTML = `
        ${message.text}
        <span class="message-time">${time}</span>
    `;

    messageEl.appendChild(bubbleEl);
    messagesArea.appendChild(messageEl);
}

async function loadMessages() {
    try {
        const response = await fetch(API_URL);
        const messages = await response.json();
        messagesArea.innerHTML = '';
        messages.forEach((msg) => renderMessage(msg));
        scrollToBottom();
    } catch (error) {
        console.error('Error cargando mensajes:', error);
        alert('Error al cargar los mensajes. Verifica que el servidor esté corriendo.');
    }
}

function scrollToBottom() {
    setTimeout(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 0);
}

// INICIALIZACIÓN
window.addEventListener('load', () => {
    passwordInput.focus();
});