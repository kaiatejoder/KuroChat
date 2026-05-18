const PASSWORD = 'Kayla';
const HINT = '¿Quién soy?';
const MAX_ATTEMPTS = 3;
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api/messages'
    : '/api/messages';

let attempts = MAX_ATTEMPTS;
let isLoggedIn = false;
let currentUser = 'yo';
let pollInterval = null;
let localMessages = [];

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

// Refresh button (if it exists)
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshMessages);
}

// FUNCIONES DE LOGIN
function handleLogin() {
    const input = passwordInput.value.trim();

    if (input === PASSWORD) {
        isLoggedIn = true;
        loginContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
        loadLocalMessages();
        loadMessages();
        startPolling();
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
    stopPolling();
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
            localMessages.push(message);
            saveLocalMessages();
            renderMessage(message);
            messageInput.value = '';
            messageInput.focus();
            scrollToBottom();

            if (!document.hasFocus()) {
                showNotification('Kurochat', {
                    body: 'Mensaje enviado',
                    tag: 'kurochat-message'
                });
            }
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

// Load messages from localStorage or server
function loadLocalMessages() {
    try {
        const saved = localStorage.getItem('kurochat_messages');
        if (saved) {
            localMessages = JSON.parse(saved);
        }
    } catch (error) {
        localMessages = [];
    }
}

// Save messages to localStorage
function saveLocalMessages() {
    try {
        localStorage.setItem('kurochat_messages', JSON.stringify(localMessages));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

async function loadMessages() {
    try {
        const response = await fetch(API_URL);
        const messages = await response.json();

        // Merge server messages with local messages
        localMessages = messages.length > 0 ? messages : localMessages;
        saveLocalMessages();

        renderAllMessages();
    } catch (error) {
        console.error('Error cargando mensajes:', error);
        // If server fails, use local messages
        renderAllMessages();
    }
}

// Refresh function to check for new messages
async function refreshMessages() {
    try {
        const response = await fetch(API_URL);
        if (response.ok) {
            const messages = await response.json();

            // Check if there are new messages
            if (messages.length > localMessages.length) {
                localMessages = messages;
                saveLocalMessages();
                renderAllMessages();

                // Notify about new message
                if (messages.length > 0) {
                    const lastMessage = messages[messages.length - 1];
                    if (lastMessage.user !== currentUser && isLoggedIn) {
                        showNotification('Kurochat', {
                            body: lastMessage.text,
                            tag: 'kurochat-message'
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error refreshing messages:', error);
    }
}

// Render all messages from local storage
function renderAllMessages() {
    messagesArea.innerHTML = '';
    localMessages.forEach((msg) => renderMessage(msg));
    scrollToBottom();
}

// Start auto-polling for new messages every 3 seconds
function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(() => {
        if (isLoggedIn) {
            refreshMessages();
        }
    }, 3000);
}

// Stop auto-polling
function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

function scrollToBottom() {
    setTimeout(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 0);
}

// NOTIFICACIONES
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const defaultOptions = {
            icon: 'src/KuroChat.svg',
            badge: 'src/KuroChat.svg',
            ...options
        };
        new Notification(title, defaultOptions);
    }
}

// SERVICE WORKER
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .catch((error) => console.log('SW registration failed:', error));
    });
}

// INICIALIZACIÓN
window.addEventListener('load', () => {
    passwordInput.focus();
    requestNotificationPermission();
});