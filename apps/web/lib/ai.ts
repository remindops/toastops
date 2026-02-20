/**
 * Explicit DIY AI fetching architecture.
 * Removes the implicit 'magic' of the generic Vercel AI SDK to explicitly define exactly what we send 
 * to the LLM and completely handle the raw stream/response explicitly for our theme generator.
 */

// Define standard JSON schema format for the AI models
const GENERATION_SYSTEM_PROMPT = `
You are an expert Frontend design architect generating strict Toast Notification JSON Configurations and valid CSS stylesheets.
You MUST output ONLY valid JSON containing a 'customCss' string and a 'configJson' string. No markdown formatting.
{
  "customCss": ".toastops-toast { background: linear-gradient(to right, #DA22FF, #9733EE); color: white; border-radius: 12px; }",
  "configJson": "{\"variant\": \"A\", \"icon\": \"success\"}"
}
`.trim();

export interface AiGenerationResult {
  customCss: string;
  configJson: string;
}

export async function generateOpenAiTheme(apiKey: string, prompt: string, modelId = 'gpt-4o-mini'): Promise<AiGenerationResult> {
  const result = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      response_format: { type: "json_object" }, // explicitly enforce JSON
      messages: [
        { role: 'system', content: GENERATION_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!result.ok) {
    const errData = await result.text();
    throw new Error(`OpenAI API Error: ${errData}`);
  }

  const data = await result.json() as any;
  const rawContent = data.choices[0].message.content;

  try {
    return JSON.parse(rawContent) as AiGenerationResult;
  } catch (e) {
    throw new Error(`Failed to parse AI output into strict JSON schema: ${rawContent}`);
  }
}

export async function generateAnthropicTheme(apiKey: string, prompt: string, modelId = 'claude-3-haiku-20240307'): Promise<AiGenerationResult> {
  const result = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: 1500,
      system: GENERATION_SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: prompt } // Anthropic expects clean turn-based, JSON object explicitly requested in prompt
      ]
    })
  });

  if (!result.ok) {
    const errData = await result.text();
    throw new Error(`Anthropic API Error: ${errData}`);
  }

  const data = await result.json() as any;
  const rawContent = data.content?.[0]?.text;

  try {
    return JSON.parse(rawContent) as AiGenerationResult;
  } catch (e) {
    throw new Error(`Failed to parse AI output into strict JSON schema: ${rawContent}`);
  }
}

export async function generateGeminiTheme(apiKey: string, prompt: string, modelId = 'gemini-1.5-flash'): Promise<AiGenerationResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  
  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: GENERATION_SYSTEM_PROMPT }] },
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ]
    })
  });

  if (!result.ok) {
    const errData = await result.text();
    throw new Error(`Gemini API Error: ${errData}`);
  }

  const data = await result.json() as any;
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  // Gemini sometimes wraps JSON in markdown block ```json
  const cleanedContent = rawContent.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleanedContent) as AiGenerationResult;
  } catch (e) {
    throw new Error(`Failed to parse AI output into strict JSON schema: ${cleanedContent}`);
  }
}

/**
 * Universal dispatcher orchestrating the selected provider seamlessly
 */
export async function generateThemeGeneric(provider: string, apiKey: string, prompt: string, modelId: string): Promise<AiGenerationResult> {
  switch (provider.toUpperCase()) {
    case 'OPENAI':
      return generateOpenAiTheme(apiKey, prompt, modelId);
    case 'ANTHROPIC':
      return generateAnthropicTheme(apiKey, prompt, modelId);
    case 'GEMINI':
      return generateGeminiTheme(apiKey, prompt, modelId);
    default:
      throw new Error(`Unsupported AI Provider explicitly: ${provider}`);
  }
}
