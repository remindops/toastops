import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

async function requireAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Missing or Invalid Token' }, { status: 401 });
    }

    const { url } = await req.json();
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    const project = await prisma.project.findFirst({
      where: { id: projectId, organizationId: user.organizationId }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const webhook = await prisma.webhookEndpoint.create({
      data: { projectId, url }
    });

    return NextResponse.json({ webhook });
  } catch (err: any) {
    console.error('[Webhooks] Unexpected error:', err);
    return NextResponse.json({ error: 'Something went wrong while managing webhooks.' }, { status: 500 });
  }
}
