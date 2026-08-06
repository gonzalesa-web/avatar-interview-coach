import { describe, it, expect, beforeEach } from 'vitest'
import { navegar, renderizarVista } from '../src/app.js'

function estaVisible(id) {
    return !document.getElementById(id).classList.contains('hidden')
}

beforeEach(() => {
    document.body.innerHTML = `
        <div id="home-view" class="view"></div>
        <div id="chat-view" class="view hidden">
            <textarea id="message-input"></textarea>
            <button id="send-btn"></button>
        </div>
        <div id="about-view" class="view hidden"></div>
    `
    window.chatInicializado = false
    window.history.pushState({}, '', '/')
})

describe('renderizarVista', () => {
    it('muestra home y oculta el resto en la ruta /home', () => {
        renderizarVista('/home')
        expect(estaVisible('home-view')).toBe(true)
        expect(estaVisible('chat-view')).toBe(false)
        expect(estaVisible('about-view')).toBe(false)
    })

    it('muestra la vista de chat en la ruta /chat', () => {
        renderizarVista('/chat')
        expect(estaVisible('chat-view')).toBe(true)
        expect(estaVisible('home-view')).toBe(false)
    })

    it('muestra la vista de about en la ruta /about', () => {
        renderizarVista('/about')
        expect(estaVisible('about-view')).toBe(true)
        expect(estaVisible('home-view')).toBe(false)
    })

    it('redirige a /home ante una ruta desconocida', () => {
        renderizarVista('/ruta-que-no-existe')
        expect(window.location.pathname).toBe('/home')
        expect(estaVisible('home-view')).toBe(true)
    })
})

describe('navegar', () => {
    it('actualiza la URL con History API y renderiza la vista correspondiente', () => {
        navegar('/chat')
        expect(window.location.pathname).toBe('/chat')
        expect(estaVisible('chat-view')).toBe(true)
    })

    it('permite ir y volver entre vistas sin recargar la página', () => {
        navegar('/chat')
        navegar('/about')
        expect(window.location.pathname).toBe('/about')
        expect(estaVisible('about-view')).toBe(true)
        expect(estaVisible('chat-view')).toBe(false)
    })
})
