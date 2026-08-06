import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import handler, { construirMensajes } from '../api/chat.js'

function crearResMock() {
    const res = {}
    res.status = vi.fn().mockReturnValue(res)
    res.json = vi.fn().mockReturnValue(res)
    return res
}

describe('construirMensajes', () => {
    it('incluye el system prompt y el mensaje del usuario cuando no hay historial', () => {
        const mensajes = construirMensajes('hola', [])
        expect(mensajes[0].role).toBe('system')
        expect(mensajes.at(-1)).toEqual({ role: 'user', content: 'hola' })
    })

    it('mapea el historial a roles user/assistant manteniendo el orden', () => {
        const historial = [
            { rol: 'usuario', contenido: 'hola' },
            { rol: 'aang', contenido: 'saludos, viajero' }
        ]
        const mensajes = construirMensajes('¿cómo estás?', historial)

        expect(mensajes).toEqual([
            { role: 'system', content: expect.any(String) },
            { role: 'user', content: 'hola' },
            { role: 'assistant', content: 'saludos, viajero' },
            { role: 'user', content: '¿cómo estás?' }
        ])
    })

    it('no duplica el mensaje actual si ya viene incluido al final del historial', () => {
        const historial = [
            { rol: 'usuario', contenido: 'hola' },
            { rol: 'aang', contenido: 'saludos' },
            { rol: 'usuario', contenido: 'mensaje actual' }
        ]
        const mensajes = construirMensajes('mensaje actual', historial)

        const vecesRepetido = mensajes.filter(
            (m) => m.role === 'user' && m.content === 'mensaje actual'
        ).length
        expect(vecesRepetido).toBe(1)
    })
})

describe('handler /api/chat', () => {
    beforeEach(() => {
        process.env.OPENROUTER_API_KEY = 'test-key'
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('rechaza métodos que no sean POST', async () => {
        const res = crearResMock()
        await handler({ method: 'GET' }, res)
        expect(res.status).toHaveBeenCalledWith(405)
    })

    it('rechaza un mensaje vacío', async () => {
        const res = crearResMock()
        await handler({ method: 'POST', body: { mensaje: '   ' } }, res)
        expect(res.status).toHaveBeenCalledWith(400)
    })

    it('responde 500 si falta la API key configurada', async () => {
        delete process.env.OPENROUTER_API_KEY
        const res = crearResMock()
        await handler({ method: 'POST', body: { mensaje: 'hola' } }, res)
        expect(res.status).toHaveBeenCalledWith(500)
    })

    it('devuelve la respuesta de la IA cuando OpenRouter responde OK (fetch mockeado)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ choices: [{ message: { content: 'Saludos, viajero.' } }] })
        }))

        const res = crearResMock()
        await handler({ method: 'POST', body: { mensaje: 'hola', historial: [] } }, res)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({ respuesta: 'Saludos, viajero.' })
    })

    it('devuelve 502 si OpenRouter responde con error (fetch mockeado)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 404,
            text: async () => 'No endpoints found'
        }))

        const res = crearResMock()
        await handler({ method: 'POST', body: { mensaje: 'hola', historial: [] } }, res)

        expect(res.status).toHaveBeenCalledWith(502)
    })

    it('devuelve 500 si la conexión con OpenRouter falla (fetch mockeado)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

        const res = crearResMock()
        await handler({ method: 'POST', body: { mensaje: 'hola', historial: [] } }, res)

        expect(res.status).toHaveBeenCalledWith(500)
    })
})
