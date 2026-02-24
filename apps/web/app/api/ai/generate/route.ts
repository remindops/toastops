import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateThemeGeneric } from '@/lib/ai';
import { decryptApiKey } from '@/lib/kms';
import { verifySessionToken } from '@/lib/auth';

async function requireAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Missing or Invalid Token' }, { status: 401 });
    }

    const { prompt, modelId, projectId } = await req.json();

    const MODEL_TO_PROVIDER: Record<string, string> = {
      // GPT-5 Series (Latest)
      'gpt-5.2': 'OPENAI',
      'gpt-5.2-pro': 'OPENAI',
      'gpt-5-mini': 'OPENAI',
      'gpt-5.3-codex': 'OPENAI', // New agentic coding model

      // o-Series (Reasoning)
      'o4-mini': 'OPENAI',
      'o3-mini': 'OPENAI',
      'o1': 'OPENAI',
      'o1-mini': 'OPENAI',

      // Legacy Models (Deprecated in ChatGPT, active in API)
      'gpt-4o': 'OPENAI',
      'gpt-4o-mini': 'OPENAI',
      'gpt-4-turbo': 'OPENAI',
      'gpt-4': 'OPENAI',
      'gpt-3.5-turbo': 'OPENAI',

      // Claude 4.x Series
      'claude-sonnet-4.6': 'ANTHROPIC',
      'claude-opus-4.6': 'ANTHROPIC',
      'claude-haiku-4.5': 'ANTHROPIC',

      // Claude 3.7 Series (Hybrid Reasoning)
      'claude-3-7-sonnet': 'ANTHROPIC',

      // Claude 3.5 Series (Legacy)
      'claude-3-5-sonnet-20241022': 'ANTHROPIC',
      'claude-3-5-sonnet-20240620': 'ANTHROPIC',
      'claude-3-5-haiku-20241022': 'ANTHROPIC',

      // Claude 3.0 Series (Legacy)
      'claude-3-opus-20240229': 'ANTHROPIC',
      'claude-3-sonnet-20240229': 'ANTHROPIC',
      'claude-3-haiku-20240307': 'ANTHROPIC',

      // Gemini 3.x Series (Latest Agentic)
      'gemini-3.1-pro': 'GEMINI',
      'gemini-3.0-pro': 'GEMINI',

      // Gemini 2.x Series
      'gemini-2.5-pro': 'GEMINI',
      'gemini-2.5-flash': 'GEMINI',
      'gemini-2.0-flash': 'GEMINI',
      'gemini-2.0-flash-lite': 'GEMINI',
      'gemini-2.0-pro-exp': 'GEMINI',

      // Gemini 1.5 Series (Legacy)
      'gemini-1.5-pro': 'GEMINI',
      'gemini-1.5-flash': 'GEMINI',
      'gemini-1.5-flash-8b': 'GEMINI',

      // Grok 4.x Series
      'grok-4.1': 'GROK',
      'grok-4.1-thinking': 'GROK',
      'grok-4.1-fast': 'GROK',
      'grok-4': 'GROK',
      'grok-4-fast': 'GROK',
      'grok-code-fast-1': 'GROK',

      // Grok 3.x Series
      'grok-3': 'GROK',
      'grok-3-mini': 'GROK',
      'grok-3-mini-fast': 'GROK',

      // Anthropic via OpenRouter
      'anthropic/claude-sonnet-4.6': 'OPENROUTER',
      'anthropic/claude-3.7-sonnet': 'OPENROUTER',
      'anthropic/claude-3.5-sonnet': 'OPENROUTER',
      'anthropic/claude-3-opus': 'OPENROUTER',

      // OpenAI via OpenRouter
      'openai/gpt-5.2': 'OPENROUTER',
      'openai/o4-mini': 'OPENROUTER',
      'openai/o3-mini': 'OPENROUTER',
      'openai/gpt-4o': 'OPENROUTER',

      // Google via OpenRouter
      'google/gemini-3.1-pro': 'OPENROUTER',
      'google/gemini-2.5-pro': 'OPENROUTER',
      'google/gemini-2.0-flash': 'OPENROUTER',

      // xAI via OpenRouter
      'x-ai/grok-4.1': 'OPENROUTER',
      'x-ai/grok-3': 'OPENROUTER',

      // Meta Llama Series
      'meta-llama/llama-3.3-70b-instruct': 'OPENROUTER',
      'meta-llama/llama-3.1-405b-instruct': 'OPENROUTER',
      'meta-llama/llama-3.1-70b-instruct': 'OPENROUTER',
      'meta-llama/llama-3.1-8b-instruct': 'OPENROUTER',

      // DeepSeek Series
      'deepseek/deepseek-r1': 'OPENROUTER',
      'deepseek/deepseek-coder': 'OPENROUTER',
      'deepseek/deepseek-chat': 'OPENROUTER',

      // Qwen Series (Latest 2026 Architecture)
      'qwen/qwen-3.5-plus': 'OPENROUTER',
      'qwen/qwen-3.5-397b': 'OPENROUTER',
      'qwen/qwen-3-max-thinking': 'OPENROUTER',
      'qwen/qwen-2.5-coder-32b-instruct': 'OPENROUTER',

      // Mistral Series
      'mistralai/mistral-large-2411': 'OPENROUTER',
      'mistralai/mixtral-8x22b-instruct': 'OPENROUTER',
      'mistralai/mixtral-8x7b-instruct': 'OPENROUTER',

      // Other Leading Foundation Models
      'minimax/minimax-m2.5': 'OPENROUTER',
      'z-ai/glm-5': 'OPENROUTER',
      'cohere/command-r-plus-08-2024': 'OPENROUTER',
      'nousresearch/hermes-3-llama-3.1-405b': 'OPENROUTER',
      'nvidia/nemotron-4-340b-instruct': 'OPENROUTER',
      'microsoft/phi-4': 'OPENROUTER',

      // Free Models Requested
      'arcee-ai/trinity-large-preview:free': 'OPENROUTER',
      'stepfun/step-3.5-flash:free': 'OPENROUTER',
      'z-ai/glm-4.5-air:free': 'OPENROUTER',
      'nvidia/nemotron-3-nano-30b-a3b:free': 'OPENROUTER',
      'arcee-ai/trinity-mini:free': 'OPENROUTER',
      'openai/gpt-oss-120b:free': 'OPENROUTER',
      'meta-llama/llama-3.3-70b-instruct:free': 'OPENROUTER',
      'google/gemma-3-27b-it:free': 'OPENROUTER',
      'liquid/lfm-2.5-1.2b-thinking:free': 'OPENROUTER',
      'qwen/qwen3-coder:free': 'OPENROUTER',
    };
    const provider = MODEL_TO_PROVIDER[modelId];

    if (!provider) {
      return NextResponse.json({ error: 'Unsupported or Invalid AI Model explicitly rejected.' }, { status: 400 });
    }

    const integration = await prisma.userAiIntegration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: user.organizationId,
          provider
        }
      }
    });

    if (!integration) {
      return NextResponse.json({ error: `No Key Management System integration found for ${provider}. Please save your API key in the BYOK Settings tab.` }, { status: 400 });
    }

    const rawApiKey = decryptApiKey(integration);

    const generatedResult = await generateThemeGeneric(
      provider,
      rawApiKey,
      prompt,
      modelId
    );

    const theme = await prisma.toastTheme.create({
      data: {
        projectId,
        customCss: generatedResult.customCss,
        configJson: generatedResult.configJson,
        variantName: 'Generated: ' + prompt.substring(0, 20)
      }
    });

    return NextResponse.json({ theme });
  } catch (err: any) {
    console.error('[generateTheme] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong while generating the theme. Please try again. ' + err.message },
      { status: 500 }
    );
  }
}
