import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    console.error('[Telemetry] Error logging event:', err);
    return NextResponse.json({ error: 'Failed to record telemetry' }, { status: 500 });
  }
}
