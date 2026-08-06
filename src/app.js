import { inicializarChat } from './chat.js';



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



function configurarEventos() {
   
    document.getElementById('start-chat-btn')?.addEventListener('click', () => {
        navegar('/chat');
    });

    
    document.getElementById('nav-about')?.addEventListener('click', (e) => {
        e.preventDefault();
        navegar('/about');
    });

    
    document.getElementById('back-btn')?.addEventListener('click', () => {
        navegar('/home');
    });

    
    document.getElementById('about-btn')?.addEventListener('click', () => {
        navegar('/about');
    });

    
    document.getElementById('back-from-about-btn')?.addEventListener('click', () => {
        navegar('/home');
    });

   
    document.getElementById('back-to-chat-btn')?.addEventListener('click', () => {
        navegar('/chat');
    });

    
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



document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    const ruta = window.location.pathname;
    renderizarVista(ruta === '/' ? '/home' : ruta);
});