export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message, history = [] } = req.body;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Vercel lo inyectará

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Falta la clave de Gemini' });
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: `Eres un asistente virtual amable en una experiencia de realidad aumentada. Habla en español, sé breve (1-2 oraciones), útil y amigable. No digas que eres una IA.` }]
    },
    {
      role: 'model',
      parts: [{ text: '¡Hola! ¿En qué puedo ayudarte hoy?' }]
    },
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Lo siento, no entendí.";

    // Limpiar respuesta (quitar asteriscos, etc.)
    const cleanReply = reply.replace(/[*_~`]/g, '');

    res.status(200).json({ reply: cleanReply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'No pude responder ahora.' });
  }
}
