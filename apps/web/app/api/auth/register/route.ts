import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, createSessionToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, name, organizationName } = await req.json();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
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
      return NextResponse.json({ error: 'Failed to create user explicitly' }, { status: 500 });
    }

    const token = await createSessionToken({ userId: user.id, organizationId: org.id });

    return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
