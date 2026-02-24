/**
 * Explicit DIY AI fetching architecture.
 * Removes the implicit 'magic' of the generic Vercel AI SDK to explicitly define exactly what we send 
 * to the LLM and completely handle the raw stream/response explicitly for our theme generator.
 */

// Define standard JSON schema format for the AI models
const GENERATION_SYSTEM_PROMPT = `
You are a world-class UI/UX designer and CSS architect specializing in toast notification design systems.
Your job is to translate a user's design description into PRODUCTION-READY, visually stunning CSS for toast notifications.

CRITICAL RULES:
1. You MUST output ONLY a raw JSON object. No markdown, no code fences, no explanation text.
2. The JSON must have exactly 2 keys: "customCss" and "configJson".
3. The CSS MUST target the class ".toastops-toast" and its child elements.
4. You MUST change the STRUCTURE and LAYOUT, not just colors. This is a design system, not a color picker.

CSS YOU MUST ALWAYS CONSIDER MODIFYING:
- Shape & Geometry: border-radius (pill, square, sharp, asymmetric), clip-path, skew for unique shapes
- Spacing: padding (compact, airy, spacious), margin adjustments
- Typography: font-family, font-size, font-weight, letter-spacing, text-transform
- Layout: display (flex/grid), flex-direction (horizontal/vertical), align-items, gap, min-width, max-width
- Borders: border-width, border-style (solid/dashed/dotted/double), border-color, outline
- Visual Depth: box-shadow (flat, elevated, neon glow, inset), backdrop-filter (blur for glassmorphism)
- Color & Backgrounds: gradients (linear, radial, conic), solid colors, transparent/frosted glass
- Motion: animation keyframes for entrance, pulse, shimmer, shake, float effects using @keyframes
- Icon & Progress bar styling via .toastops-icon, .toastops-progress selectors
- Dark/light mode readability

DESIGN PHILOSOPHY:
- Be BOLD and CREATIVE. Avoid generic white cards.
- Design like a top-tier product designer (think Vercel, Linear, Stripe, Notion aesthetics adapted to the user's request).
- Every property should serve the requested design feeling.
- For "cyberpunk" use neon, monospace, hard edges, scan-line effects.
- For "minimal" use vast whitespace, hairline borders, muted palettes.
- For "playful" use bouncy animations, rounded shapes, vibrant gradients.
- Include at least one CSS @keyframes animation.

OUTPUT FORMAT (strict JSON, no other text):
{"customCss":".toastops-toast { ... } @keyframes ... { ... } .toastops-toast .toastops-icon { ... }","configJson":"{\"variant\":\"A\",\"icon\":\"success\",\"position\":\"bottom-right\",\"duration\":4000}"}

Now generate CSS for the toast described by the user.
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

export async function generateGrokTheme(apiKey: string, prompt: string, modelId = 'grok-beta'): Promise<AiGenerationResult> {
  const result = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: GENERATION_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!result.ok) {
    const errData = await result.text();
    throw new Error(`Grok API Error: ${errData}`);
  }

  const data = await result.json() as any;
  const rawContent = data.choices[0].message.content;

  try {
    return JSON.parse(rawContent) as AiGenerationResult;
  } catch (e) {
    throw new Error(`Failed to parse AI output into strict JSON schema: ${rawContent}`);
  }
}

export async function generateOpenRouterTheme(apiKey: string, prompt: string, modelId: string): Promise<AiGenerationResult> {
  const result = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'ToastOps',
    },
    body: JSON.stringify({
      model: modelId,
      response_format: { type: "json_object" },
      max_tokens: 1000,
      messages: [
        { role: 'system', content: GENERATION_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!result.ok) {
    const errData = await result.text();
    throw new Error(`OpenRouter API Error: ${errData}`);
  }

  const data = await result.json() as any;
  const rawContent = data.choices[0].message.content;

  try {
    return JSON.parse(rawContent) as AiGenerationResult;
  } catch (e) {
    throw new Error(`Failed to parse AI output into strict JSON schema: ${rawContent}`);
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
    case 'GROK':
      return generateGrokTheme(apiKey, prompt, modelId);
    case 'OPENROUTER':
      return generateOpenRouterTheme(apiKey, prompt, modelId);
    default:
      throw new Error(`Unsupported AI Provider explicitly: ${provider}`);
  }
}
