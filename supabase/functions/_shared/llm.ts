/* Provider-agnostic completion adapter.
   LLM_PROVIDER=openai (default) | anthropic - switching providers is a
   secrets change, not a code change. */

type Msg = { role: string; content: string };

const provider = () => Deno.env.get('LLM_PROVIDER') ?? 'openai';

function extractOpenAiText(data: Record<string, unknown>) {
  if (typeof data.output_text === 'string') return data.output_text.trim();
  const output = Array.isArray(data.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if ((part?.type === 'output_text' || part?.type === 'text') && typeof part.text === 'string') {
        return part.text.trim();
      }
    }
  }
  return '';
}

async function completeOpenAi(system: string, messages: Msg[], maxTokens: number) {
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) throw new Error('OPENAI_API_KEY is not configured');
  const model = Deno.env.get('LLM_MODEL') ?? 'gpt-5-mini';

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      instructions: system,
      input: messages,
      reasoning: { effort: 'low' },
      max_output_tokens: maxTokens,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI request failed with ${response.status}`);
  }
  const text = extractOpenAiText(data);
  if (!text) throw new Error('LLM returned an empty response');
  return text;
}

async function completeAnthropic(system: string, messages: Msg[], maxTokens: number) {
  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) throw new Error('ANTHROPIC_API_KEY is not configured');
  const model = Deno.env.get('LLM_MODEL') ?? 'claude-sonnet-5';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      system,
      max_tokens: maxTokens,
      messages: messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic request failed with ${response.status}`);
  }
  const text = (data?.content ?? [])
    .filter((p: { type?: string }) => p?.type === 'text')
    .map((p: { text?: string }) => p.text ?? '')
    .join('')
    .trim();
  if (!text) throw new Error('LLM returned an empty response');
  return text;
}

export function complete(system: string, messages: Msg[], maxTokens = 800) {
  return provider() === 'anthropic'
    ? completeAnthropic(system, messages, maxTokens)
    : completeOpenAi(system, messages, maxTokens);
}
