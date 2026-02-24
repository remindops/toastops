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

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Missing or Invalid Token' }, { status: 401 });
    }

    const { name, domainUrl } = await req.json();

    const project = await prisma.project.create({
      data: {
        name,
        domainUrl,
        organizationId: user.organizationId
      }
    });

    return NextResponse.json({ project });
  } catch (err: any) {
    console.error('[createProject] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong while creating the project. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Missing or Invalid Token' }, { status: 401 });
    }

    let project = await prisma.project.findFirst({
      where: { organizationId: user.organizationId }
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: 'Default Project',
          domainUrl: 'http://localhost:3000',
          organizationId: user.organizationId
        }
      });
    }

    return NextResponse.json({ project });
  } catch (err: any) {
    console.error('[getProject] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong while fetching the project.' },
      { status: 500 }
    );
  }
}
