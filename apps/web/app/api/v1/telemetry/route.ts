import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { themeId, eventType, userAgent } = await req.json();
    
    await prisma.telemetryEvent.create({
        data: {
            themeId,
            eventType, 
            userAgent: userAgent || 'Unknown'
        }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
