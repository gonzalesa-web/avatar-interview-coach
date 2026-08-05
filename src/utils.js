export function formatearMensaje(texto) {
    if (!texto || typeof texto !== 'string') return '';
    return texto.trim();
}

export function validarMensaje(texto) {
    if (!texto || typeof texto !== 'string') return false;
    return texto.trim().length > 0;
}

export function transformarHistorial(historial) {
    if (!Array.isArray(historial)) return [];
    
    return historial.map(msg => ({
        rol: msg.rol || 'usuario',
        contenido: msg.contenido || ''
    }));
}

export function obtenerHora() {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function truncarTexto(texto, limite = 100) {
    if (!texto || typeof texto !== 'string') return '';
    if (texto.length <= limite) return texto;
    return texto.slice(0, limite) + '...';
}

export function parsearRespuesta(datos) {
    if (!datos || typeof datos !== 'object') return null;
    if (!datos.respuesta) return null;
    return datos.respuesta;
}