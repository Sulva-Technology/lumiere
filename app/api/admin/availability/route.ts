import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('booking_availability')
      .select(`
        id,
        starts_at,
        ends_at,
        is_available,
        stylists(name),
        booking_services(name)
      `)
      .order('starts_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ availability: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await request.json();
    const { stylistId, serviceId, startsAt, durationMinutes } = body;

    const startsAtDate = new Date(startsAt);
    const endsAtDate = new Date(startsAtDate.getTime() + durationMinutes * 60000);

    const { data, error } = await supabase
      .from('booking_availability')
      .insert({
        stylist_id: stylistId,
        service_id: serviceId,
        starts_at: startsAtDate.toISOString(),
        ends_at: endsAtDate.toISOString(),
        is_available: true
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ slot: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create slot' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) throw new Error('ID is required');

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from('booking_availability').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete slot' }, { status: 500 });
  }
}
