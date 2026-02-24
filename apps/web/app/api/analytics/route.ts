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

export async function GET(req: Request) {
    try {
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: Missing or Invalid Token' }, { status: 401 });
        }

        // Get all projects for the organization
        const projects = await prisma.project.findMany({
            where: { organizationId: user.organizationId },
            include: {
                themes: true
            }
        });

        const themeIds = projects.flatMap(p => p.themes.map(t => t.id));

        // Get telemetry events for those themes
        const events = await prisma.telemetryEvent.findMany({
            where: {
                themeId: { in: themeIds.length > 0 ? themeIds : [] }
            },
            orderBy: { createdAt: 'desc' }
        });

        const totalImpressions = events.filter(e => e.eventType === 'IMPRESSION').length;
        const totalClicks = events.filter(e => e.eventType === 'CLICK').length;

        // CTR Calculation
        let ctr = 0;
        if (totalImpressions > 0) {
            ctr = Number(((totalClicks / totalImpressions) * 100).toFixed(1));
        }

        // Limit to 10 most recent
        const recentEvents = events.slice(0, 10);

        return NextResponse.json({
            totalImpressions,
            totalClicks,
            ctr,
            recentEvents
        });

    } catch (err: any) {
        console.error('[Analytics] Unexpected error:', err);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
