import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateThemeGeneric } from '@/lib/ai';
import { decryptApiKey } from '@/lib/kms';
import { verifySessionToken } from '@/lib/auth';

const prisma = new PrismaClient();

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

    const modelConfig = await prisma.aiModelConfig.findFirst({
      where: { modelId, isActive: true }
    });

    if (!modelConfig) {
      return NextResponse.json({ error: 'Invalid or inactive AI Model explicitly rejected.' }, { status: 400 });
    }

    const integration = await prisma.userAiIntegration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: user.organizationId,
          provider: modelConfig.provider
        }
      }
    });

    if (!integration) {
      return NextResponse.json({ error: `No Key Management System integration found for ${modelConfig.provider}` }, { status: 400 });
    }

    const rawApiKey = decryptApiKey(integration);

    const generatedResult = await generateThemeGeneric(
      modelConfig.provider, 
      rawApiKey, 
      prompt, 
      modelConfig.modelId
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
    return NextResponse.json({ error: `AI Generation failed explicitly: ${err.message}` }, { status: 500 });
  }
}
