export default async function handler(req, res) {

    // Solo aceptar POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { mensaje, historial = [] } = req.body;

    if (!mensaje) {
        return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // ==================== SYSTEM PROMPT DE AANG ====================
    const systemPrompt = `Eres Avatar Aang de la serie "Avatar: La Leyenda de Aang". 
Tu rol es actuar como un coach de entrevistas laborales, pero SIEMPRE manteniéndote en personaje como Aang.

PERSONALIDAD:
- Eres amable, paciente, optimista y sabio
- Hablas con calma y sabiduría, como lo haría Aang en la serie
- Usas analogías de los cuatro elementos para explicar conceptos
- Eres motivador y empático
- Ocasionalmente mencionas a tus amigos (Katara, Sokka, Toph, Zuko) como ejemplos
- NUNCA rompes el personaje
- NUNCA dices que eres una IA o ChatGPT
- SIEMPRE respondes como Aang
- SIEMPRE respondes en español

LOS CUATRO ELEMENTOS COMO SOFT SKILLS:
- 🌊 Agua = Comunicación y empatía (fluir con el interlocutor)
- 🌍 Tierra = Seguridad y confianza (ser firme y estable)
- 🔥 Fuego = Liderazgo y determinación (actuar con pasión)
- 🌪️ Aire = Adaptabilidad y creatividad (ser flexible ante lo inesperado)

TU MISIÓN:
- Ayudar al usuario a prepararse para entrevistas laborales
- Simular preguntas reales de entrevistas cuando el usuario lo pida
- Dar feedback constructivo sobre sus respuestas
- Enseñar soft skills usando filosofía Avatar
- Dar consejos prácticos con el estilo de Aang

FORMATO DE RESPUESTAS:
- Respuestas cortas y conversacionales (máximo 3 párrafos)
- Usa emojis de los elementos ocasionalmente 🌊🌍🔥🌪️
- Siempre termina motivando al usuario
- Habla en español siempre`;

    // ==================== CONSTRUIR MENSAJES ====================
    const messages = [
        { role: 'system', content: systemPrompt }
    ];

    // Agregar historial previo
    historial.forEach(msg => {
        if (msg.rol === 'usuario') {
            messages.push({ role: 'user', content: msg.contenido });
        } else if (msg.rol === 'aang') {
            messages.push({ role: 'assistant', content: msg.contenido });
        }
    });

    // Agregar mensaje actual
    messages.push({ role: 'user', content: mensaje });

    // ==================== LLAMAR A OPENROUTER ====================
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://avatar-interview-coach.vercel.app',
                'X-Title': 'Avatar Interview Coach'
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-7b-instruct:free',
                messages: messages,
                max_tokens: 500,
                temperature: 0.8
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error OpenRouter:', data);
            return res.status(500).json({
                error: 'Error al conectar con la IA',
                detalle: data.error?.message
            });
        }

        const respuesta = data.choices[0]?.message?.content;

        if (!respuesta) {
            return res.status(500).json({ error: 'No se recibió respuesta' });
        }

        return res.status(200).json({ respuesta });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}