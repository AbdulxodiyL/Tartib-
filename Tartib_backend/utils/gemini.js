const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
}

export async function generateGemini({ system, messages = [], json = false, maxTokens = 1000, temperature = 0.4 }) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY mavjud emas.');
    error.code = 'missing_api_key';
    throw error;
  }

  const contents = messages.map(message => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(message.content || '') }],
  }));
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: Math.max(64, maxTokens || 1000),
        ...(json ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Gemini API xatosi.');
    error.status = response.status;
    error.code = data?.error?.status || 'gemini_api_error';
    throw error;
  }
  const text = data?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('')?.trim();
  if (!text) {
    const error = new Error('Gemini bo‘sh javob qaytardi.');
    error.code = 'empty_ai_response';
    throw error;
  }
  return text;
}
