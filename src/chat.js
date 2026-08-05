module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
        return res.status(500).json({ error: 'API key no encontrada', env: Object.keys(process.env) })
    }

    const { mensaje } = req.body

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-7b-instruct:free',
                messages: [
                    { role: 'user', content: mensaje || 'hola' }
                ],
                max_tokens: 100
            })
        })

        const data = await response.json()
        return res.status(200).json({ respuesta: data.choices?.[0]?.message?.content || JSON.stringify(data) })

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}