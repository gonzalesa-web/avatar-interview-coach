// ==================== ESTADO GLOBAL ====================
let historial = [];

// ==================== NAVEGACIÓN ====================

function navegar(ruta) {
    window.history.pushState({}, '', ruta);
    renderizarVista(ruta);
}

function renderizarVista(ruta) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));

    if (ruta === '/' || ruta === '/home' || ruta === '/inicio') {
        document.getElementById('home-view')?.classList.remove('hidden');
    } else if (ruta === '/chat') {
        document.getElementById('chat-view')?.classList.remove('hidden');
        if (!window.chatInicializado) {
            inicializarChat();
            window.chatInicializado = true;
        }
    } else if (ruta === '/about' || ruta === '/acerca-de') {
        document.getElementById('about-view')?.classList.remove('hidden');
    } else {
        navegar('/home');
    }
}

window.addEventListener('popstate', () => {
    renderizarVista(window.location.pathname);
});

// ==================== EVENTOS ====================

function configurarEventos() {
    // HOME → CHAT
    document.getElementById('start-chat-btn')?.addEventListener('click', () => {
        navegar('/chat');
    });

    // HOME → ABOUT (link del nav)
    document.getElementById('nav-about')?.addEventListener('click', (e) => {
        e.preventDefault();
        navegar('/about');
    });

    // CHAT → HOME
    document.getElementById('back-btn')?.addEventListener('click', () => {
        navegar('/home');
    });

    // CHAT → ABOUT
    document.getElementById('about-btn')?.addEventListener('click', () => {
        navegar('/about');
    });

    // ABOUT → HOME
    document.getElementById('back-from-about-btn')?.addEventListener('click', () => {
        navegar('/home');
    });

    // ABOUT → CHAT
    document.getElementById('back-to-chat-btn')?.addEventListener('click', () => {
        navegar('/chat');
    });

    // SUGERENCIAS de preguntas
    document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const texto = btn.getAttribute('data-text');
            const input = document.getElementById('message-input');
            if (input) {
                input.value = texto;
                input.focus();
            }
        });
    });
}

// ==================== CHAT ====================

function inicializarChat() {
    const input = document.getElementById('message-input');
    const btnEnviar = document.getElementById('send-btn');

    btnEnviar?.addEventListener('click', enviarMensaje);

    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    });

    // Auto-resize del textarea
    input?.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
}

async function enviarMensaje() {
    const input = document.getElementById('message-input');
    const texto = input?.value.trim();
    if (!texto) return;

    input.value = '';
    input.style.height = 'auto';

    historial.push({ rol: 'usuario', contenido: texto });
    mostrarMensaje(texto, 'user');
    mostrarEscribiendo();

    try {
        const respuesta = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mensaje: texto,
                historial: historial
            })
        });

        const datos = await respuesta.json();

        if (respuesta.ok) {
            const mensajeAang = datos.respuesta;
            historial.push({ rol: 'aang', contenido: mensajeAang });
            quitarEscribiendo();
            mostrarMensaje(mensajeAang, 'mentor');
        } else {
            quitarEscribiendo();
            mostrarMensaje('Hmm, parece que los espíritus están bloqueando la conexión. Intenta de nuevo 🙏', 'mentor');
        }
    } catch (error) {
        quitarEscribiendo();
        mostrarMensaje('Error de conexión. Los vientos del aire no soplan a nuestro favor 🌪️', 'mentor');
    }
}

function mostrarMensaje(texto, rol) {
    const contenedor = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${rol}`;

    if (rol === 'mentor') {
        div.innerHTML = `
            <div class="message-avatar">🌪️</div>
            <div class="message-content">${texto}</div>
        `;
    } else {
        div.innerHTML = `
            <div class="message-content">${texto}</div>
        `;
    }

    contenedor?.appendChild(div);
    contenedor.scrollTop = contenedor.scrollHeight;
}

function mostrarEscribiendo() {
    const contenedor = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'message mentor';
    div.id = 'typing-indicator';
    div.innerHTML = `
        <div class="message-avatar">🌪️</div>
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    contenedor?.appendChild(div);
    contenedor.scrollTop = contenedor.scrollHeight;
}

function quitarEscribiendo() {
    document.getElementById('typing-indicator')?.remove();
}

// ==================== INICIO ====================

document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    const ruta = window.location.pathname;
    renderizarVista(ruta === '/' ? '/home' : ruta);
});