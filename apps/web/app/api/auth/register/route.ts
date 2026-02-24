import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, name, organizationName } = await req.json();

    if (!email || !password || !name || !organizationName) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in instead.' },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const org = await prisma.organization.create({
      data: {
        name: organizationName,
        users: {
          create: {
            email,
            passwordHash,
            name
          }
        }
      },
      include: { users: true }
    });

    const user = org.users[0];
    if (!user) {
      console.error('[register] Organization created but user not found in result');
      return NextResponse.json(
        { error: 'Account setup failed. Please try signing up again.' },
        { status: 500 }
      );
    }

    const token = await createSessionToken({ userId: user.id, organizationId: org.id });

    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    console.error('[register] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
