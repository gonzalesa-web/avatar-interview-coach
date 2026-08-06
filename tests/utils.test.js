import { describe, it, expect } from 'vitest'
import {
    formatearMensaje,
    validarMensaje,
    transformarHistorial,
    obtenerHora,
    truncarTexto,
    parsearRespuesta
} from '../src/utils.js'

describe('formatearMensaje', () => {
    it('recorta espacios al inicio y al final', () => {
        expect(formatearMensaje('  hola Aang  ')).toBe('hola Aang')
    })

    it('devuelve string vacío para valores inválidos', () => {
        expect(formatearMensaje(null)).toBe('')
        expect(formatearMensaje(undefined)).toBe('')
        expect(formatearMensaje(123)).toBe('')
    })
})

describe('validarMensaje', () => {
    it('acepta un mensaje con contenido real', () => {
        expect(validarMensaje('hola')).toBe(true)
    })

    it('rechaza mensajes vacíos, solo espacios o de tipo inválido', () => {
        expect(validarMensaje('')).toBe(false)
        expect(validarMensaje('   ')).toBe(false)
        expect(validarMensaje(null)).toBe(false)
        expect(validarMensaje(42)).toBe(false)
    })
})

describe('transformarHistorial', () => {
    it('normaliza cada entrada del historial', () => {
        const entrada = [
            { rol: 'usuario', contenido: 'hola' },
            { rol: 'aang', contenido: 'saludos' }
        ]
        expect(transformarHistorial(entrada)).toEqual([
            { rol: 'usuario', contenido: 'hola' },
            { rol: 'aang', contenido: 'saludos' }
        ])
    })

    it('rellena valores por defecto cuando faltan campos', () => {
        expect(transformarHistorial([{}])).toEqual([{ rol: 'usuario', contenido: '' }])
    })

    it('devuelve un array vacío si no recibe un array', () => {
        expect(transformarHistorial(null)).toEqual([])
        expect(transformarHistorial('no es un array')).toEqual([])
    })
})

describe('obtenerHora', () => {
    it('devuelve un string no vacío con formato de hora', () => {
        const hora = obtenerHora()
        expect(typeof hora).toBe('string')
        expect(hora.length).toBeGreaterThan(0)
    })
})

describe('truncarTexto', () => {
    it('no modifica textos dentro del límite', () => {
        expect(truncarTexto('hola', 10)).toBe('hola')
    })

    it('trunca y agrega "..." cuando el texto excede el límite', () => {
        expect(truncarTexto('0123456789ABC', 10)).toBe('0123456789...')
    })

    it('devuelve string vacío para valores inválidos', () => {
        expect(truncarTexto(null)).toBe('')
    })
})

describe('parsearRespuesta', () => {
    it('extrae el campo "respuesta" de los datos', () => {
        expect(parsearRespuesta({ respuesta: 'Hola, viajero' })).toBe('Hola, viajero')
    })

    it('devuelve null si faltan datos o el campo "respuesta"', () => {
        expect(parsearRespuesta(null)).toBeNull()
        expect(parsearRespuesta({})).toBeNull()
        expect(parsearRespuesta('texto plano')).toBeNull()
    })
})
