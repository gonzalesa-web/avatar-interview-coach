import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { enviarMensaje } from '../src/chat.js'

beforeEach(() => {
    document.body.innerHTML = `
        <textarea id="message-input"></textarea>
        <button id="send-btn"></button>
        <div id="chat-messages"></div>
    `
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
})

describe('enviarMensaje', () => {
    it('no hace nada si el input está vacío', async () => {
        document.getElementById('message-input').value = '   '
        await enviarMensaje()
        expect(document.getElementById('chat-messages').children.length).toBe(0)
    })

    it('muestra el mensaje del usuario y la respuesta del personaje (fetch mockeado)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ respuesta: 'Saludos, viajero.' })
        }))

        document.getElementById('message-input').value = 'hola Aang'
        await enviarMensaje()

        const mensajes = document.querySelectorAll('#chat-messages .message')
        expect(mensajes.length).toBe(2)
        expect(mensajes[0].classList.contains('user')).toBe(true)
        expect(mensajes[1].classList.contains('mentor')).toBe(true)
        expect(mensajes[1].classList.contains('error')).toBe(false)
        expect(mensajes[1].textContent).toContain('Saludos, viajero.')
    })

    it('marca el mensaje como error cuando la API responde con un error', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ error: 'El personaje no pudo responder' })
        }))

        document.getElementById('message-input').value = 'hola de nuevo'
        await enviarMensaje()

        const ultimoMensaje = document.querySelector('#chat-messages .message:last-child')
        expect(ultimoMensaje.classList.contains('error')).toBe(true)
    })

    it('marca el mensaje como error cuando falla la conexión', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')))

        document.getElementById('message-input').value = 'otro mensaje'
        await enviarMensaje()

        const ultimoMensaje = document.querySelector('#chat-messages .message:last-child')
        expect(ultimoMensaje.classList.contains('error')).toBe(true)
    })
})
