import { DEFAULT_CATEGORIES } from './settings.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

function keywordFallback(categories, text) {
  const hay = text.toLowerCase();
  for (const c of categories) {
    if (c.key === 'OTHER') continue;
    if ((c.keywords || []).some((k) => k && hay.includes(k))) return c.key;
  }
  return categories.some((c) => c.key === 'OTHER') ? 'OTHER' : categories[categories.length - 1].key;
}

function buildSystemPrompt(categories, custom) {
  if (custom && custom.trim()) return custom.trim();
  const keys = categories.map((c) => c.key).join(' ');
  const lines = categories
    .map((c) => `${c.key}: ${c.description}${c.keywords?.length ? ` (e.g. ${c.keywords.slice(0, 6).join(', ')})` : ''}`)
    .join('\n');
  return `Classify the email into exactly ONE of these categories. Reply with ONE WORD only, the category key.\n\nCategories:\n${keys}\n\n${lines}`;
}

// Returns a category key. Uses Groq when GROQ_API_KEY is set, otherwise a
// keyword match — so the demo works even without an API key.
export async function classifyEmail(settings, { from = '', subject = '', body = '' }) {
  const categories = settings?.categories?.length ? settings.categories : DEFAULT_CATEGORIES;
  const validKeys = categories.map((c) => c.key.toUpperCase());
  const text = `Subject: ${subject}\nBody: ${body}`;

  if (!process.env.GROQ_API_KEY) {
    return keywordFallback(categories, `${subject} ${body}`);
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 20,
        temperature: 0,
        messages: [
          { role: 'system', content: buildSystemPrompt(categories, settings?.prompt) },
          { role: 'user', content: text }
        ]
      })
    });
    if (!res.ok) throw new Error(`groq ${res.status}`);
    const data = await res.json();
    const raw = (data.choices?.[0]?.message?.content || '').toUpperCase();
    return validKeys.find((k) => raw.includes(k)) || keywordFallback(categories, `${subject} ${body}`);
  } catch {
    return keywordFallback(categories, `${subject} ${body}`);
  }
}
