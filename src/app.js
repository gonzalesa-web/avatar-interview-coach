import { inicializarChat } from './chat.js';

// ==================== NAVEGACIÓN ====================

export function navegar(ruta) {
    window.history.pushState({}, '', ruta);
    renderizarVista(ruta);
}

export function renderizarVista(ruta) {
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

// ==================== INICIO ====================

document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    const ruta = window.location.pathname;
    renderizarVista(ruta === '/' ? '/home' : ruta);
});