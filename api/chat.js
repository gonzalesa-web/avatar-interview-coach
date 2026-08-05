const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const MODEL = 'openai/gpt-oss-20b:free'
const MAX_HISTORY_MESSAGES = 20
const REQUEST_TIMEOUT_MS = 25000

const AANG_SYSTEM_PROMPT = `Eres Aang, el Avatar y último maestro aire, de "Avatar: La Leyenda de Aang". Estás entrenando a una persona para entrevistas de trabajo, usando la sabiduría de los cuatro elementos (agua, tierra, fuego, aire) como metáforas de soft skills.

Reglas de personalidad:
- Hablas con calidez, humor ligero y sabiduría, como un monje de 12 años con la experiencia de varias vidas pasadas.
- Usas ocasionalmente metáforas de los elementos o del mundo de Avatar, sin exagerar.
- Das consejos concretos sobre entrevistas laborales: cómo responder preguntas típicas, manejar los nervios, comunicar logros, etc.
- Tus respuestas son CORTAS (2 a 4 oraciones), apropiadas para un chat. Nunca escribes ensayos largos.
- Si te preguntan algo fuera de tema, respondes brevemente con humor y redirigís la charla al entrenamiento de entrevistas.
- Nunca rompes el personaje ni decís que sos una IA.`

function construirMensajes(mensaje, historial) {
    const historialValido = Array.isArray(historial)
        ? historial
            .filter((m) => m && typeof m.contenido === 'string' && m.contenido.trim())
            .slice(-MAX_HISTORY_MESSAGES)
            .map((m) => ({
                role: m.rol === 'usuario' ? 'user' : 'assistant',
                content: m.contenido
            }))
        : []

    const ultimoMensajeYaIncluido =
        historialValido.length > 0 &&
        historialValido[historialValido.length - 1].role === 'user' &&
        historialValido[historialValido.length - 1].content === mensaje

    return [
        { role: 'system', content: AANG_SYSTEM_PROMPT },
        ...historialValido,
        ...(ultimoMensajeYaIncluido ? [] : [{ role: 'user', content: mensaje }])
    ]
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' })
    }

    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
        console.error('Falta configurar la variable de entorno OPENROUTER_API_KEY')
        return res.status(500).json({ error: 'El servicio de chat no está configurado correctamente' })
    }

    const { mensaje, historial } = req.body || {}

    if (!mensaje || typeof mensaje !== 'string' || !mensaje.trim()) {
        return res.status(400).json({ error: 'El mensaje no puede estar vacío' })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
        const response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173',
                'X-Title': 'Avatar Interview Coach'
            },
            body: JSON.stringify({
                model: MODEL,
                messages: construirMensajes(mensaje, historial),
                max_tokens: 250,
                temperature: 0.8
            }),
            signal: controller.signal
        })

        if (!response.ok) {
            const errorBody = await response.text()
            console.error('Error de OpenRouter:', response.status, errorBody)
            return res.status(502).json({ error: 'El personaje no pudo responder en este momento. Intenta de nuevo.' })
        }

        const data = await response.json()
        const respuestaTexto = data?.choices?.[0]?.message?.content?.trim()

        if (!respuestaTexto) {
            return res.status(502).json({ error: 'El personaje no pudo responder en este momento. Intenta de nuevo.' })
        }

        return res.status(200).json({ respuesta: respuestaTexto })
    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).json({ error: 'El servicio de IA tardó demasiado en responder. Intenta de nuevo.' })
        }
        console.error('Error al conectar con OpenRouter:', error)
        return res.status(500).json({ error: 'Error de conexión con el servicio de IA' })
    } finally {
        clearTimeout(timeoutId)
    }
}
