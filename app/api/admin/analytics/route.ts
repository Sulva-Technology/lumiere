import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { getAnalyticsReport, type AnalyticsRange } from '@/lib/data/analytics';

const RANGES: AnalyticsRange[] = ['today', '7', '30', '90'];

export async function GET(request: NextRequest) {
  try {
    await requireAdminApiUser();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }

  const requested = request.nextUrl.searchParams.get('range') as AnalyticsRange | null;
  const range = requested && RANGES.includes(requested) ? requested : '30';

  try {
    const report = await getAnalyticsReport(range);
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load analytics.' }, { status: 500 });
  }
}
