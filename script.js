const PASSWORD = 'Kayla';
const HINT = '¿Quién soy?';
const MAX_ATTEMPTS = 3;
const STORAGE_KEY = 'chatMessages';

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
function handleSendMessage() {
    const text = messageInput.value.trim();

    if (text === '') return;

    const message = {
        id: Date.now(),
        user: currentUser,
        text: text,
        timestamp: new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    let messages = loadMessagesArray();
    messages.push(message);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));

    renderMessage(message);
    messageInput.value = '';
    messageInput.focus();
    scrollToBottom();
}

function renderMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.user === 'yo' ? 'own' : 'other'}`;

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'message-bubble';
    bubbleEl.innerHTML = `
        ${message.text}
        <span class="message-time">${message.timestamp}</span>
    `;

    messageEl.appendChild(bubbleEl);
    messagesArea.appendChild(messageEl);
}

function loadMessages() {
    const messages = loadMessagesArray();
    messagesArea.innerHTML = '';
    messages.forEach((msg) => renderMessage(msg));
    scrollToBottom();
}

function loadMessagesArray() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
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