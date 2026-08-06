let historial = [];

export function inicializarChat() {
    const input = document.getElementById('message-input');
    const btnEnviar = document.getElementById('send-btn');

    btnEnviar?.addEventListener('click', enviarMensaje);

    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    });

    input?.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });
}

export async function enviarMensaje() {
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
            mostrarMensaje(datos.error || 'Hmm, parece que los espíritus están bloqueando la conexión. Intenta de nuevo 🙏', 'mentor', true);
        }
    } catch (error) {
        quitarEscribiendo();
        mostrarMensaje('Error de conexión. Los vientos del aire no soplan a nuestro favor 🌪️', 'mentor', true);
    }
}

function mostrarMensaje(texto, rol, esError = false) {
    const contenedor = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${rol}${esError ? ' error' : ''}`;

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
