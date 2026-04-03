import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { createAdminBookingService, deleteAdminBookingService, getAdminBookingServices, updateAdminBookingService } from '@/lib/data/admin';
import { adminBookingServiceSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/validation';

export async function GET() {
  try {
    await requireAdminApiUser();
    const services = await getAdminBookingServices();
    return NextResponse.json({ data: { services }, error: null, meta: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to load services.'), meta: null }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminBookingServiceSchema.parse(await request.json());
    const service = await createAdminBookingService(body);
    return NextResponse.json({ data: { service }, error: null, meta: null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to create service.'), meta: null }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminBookingServiceSchema.parse(await request.json());
    if (!body.id) {
      return NextResponse.json({ data: null, error: 'Service id is required.', meta: null }, { status: 400 });
    }
    const service = await updateAdminBookingService({ ...body, id: body.id, description: body.description || null });
    return NextResponse.json({ data: { service }, error: null, meta: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to update service.'), meta: null }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminApiUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ data: null, error: 'Service id is required.', meta: null }, { status: 400 });
    }
    const result = await deleteAdminBookingService(id);
    return NextResponse.json({ data: result, error: null, meta: null });
  } catch (error) {
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to remove service.'), meta: null }, { status: 400 });
  }
}
