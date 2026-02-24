import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter your email and password.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Incorrect email or password. Please try again.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({ userId: user.id, organizationId: user.organizationId });

    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    console.error('[login] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
