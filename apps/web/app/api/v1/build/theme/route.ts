import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing Project Build API Key' }, { status: 401 });
    }

    const apiKey = authHeader.split(' ')[1];

    const project = await prisma.project.findUnique({
      where: { buildApiKey: apiKey },
      include: {
        themes: {
          where: { isActive: true }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Project Build API Key' }, { status: 401 });
    }

    const activeTheme = project.themes[0];

    if (!activeTheme) {
      return NextResponse.json({
        customCss: '',
        configJson: '{}'
      });
    }

    return NextResponse.json({
      customCss: activeTheme.customCss,
      configJson: activeTheme.configJson
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
