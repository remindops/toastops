import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { encryptApiKey } from '@/lib/kms';
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

    const { provider, rawApiKey } = await req.json();

    const encryptedData = encryptApiKey(rawApiKey);

    await prisma.userAiIntegration.upsert({
      where: {
        organizationId_provider: {
          organizationId: user.organizationId,
          provider: provider.toUpperCase()
        }
      },
      update: encryptedData,
      create: {
        ...encryptedData,
        organizationId: user.organizationId,
        provider: provider.toUpperCase()
      }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
