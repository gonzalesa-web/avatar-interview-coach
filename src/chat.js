const https = require('https')

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' })
    }

    const { mensaje, historial = [] } = req.body

    if (!mensaje) {
        return res.status(400).json({ error: 'Mensaje requerido' })
    }

    const systemPrompt = `Eres Avatar Aang de la serie "Avatar: La Leyenda de Aang". 
Tu rol es actuar como un coach de entrevistas laborales, pero SIEMPRE manteniéndote en personaje como Aang.

PERSONALIDAD:
- Eres amable, paciente, optimista y sabio
- Hablas con calma y sabiduría, como lo haría Aang en la serie
- Usas analogías de los cuatro elementos para explicar conceptos
- Eres motivador y empático
- NUNCA rompes el personaje
- NUNCA dices que eres una IA o ChatGPT
- SIEMPRE respondes como Aang
- SIEMPRE respondes en español

LOS CUATRO ELEMENTOS COMO SOFT SKILLS:
- 🌊 Agua = Comunicación y empatía
- 🌍 Tierra = Seguridad y confianza
- 🔥 Fuego = Liderazgo y determinación
- 🌪️ Aire = Adaptabilidad y creatividad

TU MISIÓN:
- Ayudar al usuario a prepararse para entrevistas laborales
- Simular preguntas reales de entrevistas cuando el usuario lo pida
- Dar feedback constructivo sobre sus respuestas
- Enseñar soft skills usando filosofía Avatar
- Dar consejos prácticos con el estilo de Aang

FORMATO:
- Respuestas cortas y conversacionales (máximo 3 párrafos)
- Usa emojis de los elementos ocasionalmente 🌊🌍🔥🌪️
- Siempre termina motivando al usuario
- Habla en español siempre`

    const messages = [
        { role: 'system', content: systemPrompt }
    ]

    historial.forEach(msg => {
        if (msg.rol === 'usuario') {
            messages.push({ role: 'user', content: msg.contenido })
        } else if (msg.rol === 'aang') {
            messages.push({ role: 'assistant', content: msg.contenido })
        }
    })

    messages.push({ role: 'user', content: mensaje })

    const body = JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: messages,
        max_tokens: 500,
        temperature: 0.8
    })

    try {
        const respuesta = await new Promise((resolve, reject) => {
            const options = {
                hostname: 'openrouter.ai',
                path: '/api/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://avatar-interview-coach.vercel.app',
                    'X-Title': 'Avatar Interview Coach',
                    'Content-Length': Buffer.byteLength(body)
                }
            }

            const reqHttp = https.request(options, (res) => {
                let data = ''
                res.on('data', chunk => data += chunk)
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data))
                    } catch (e) {
                        reject(new Error('Error parsing response'))
                    }
                })
            })

            reqHttp.on('error', reject)
            reqHttp.write(body)
            reqHttp.end()
        })

        const texto = respuesta.choices?.[0]?.message?.content

        if (!texto) {
            return res.status(500).json({ error: 'No se recibió respuesta' })
        }

        return res.status(200).json({ respuesta: texto })

    } catch (error) {
        console.error('Error:', error.message)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
}