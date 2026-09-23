import { NextResponse } from "next/server";
import { requireAdminApiUser } from "@/lib/auth";
import {
  adminAvailabilityCreateSchema,
  adminAvailabilityDeleteSchema,
} from "@/lib/schemas";
import {
  createAvailabilitySlot,
  deleteAvailabilitySlot,
  getScheduleDays,
} from "@/lib/data/availability";
import { getErrorMessage } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    await requireAdminApiUser();
    const stylistId = new URL(request.url).searchParams.get("stylistId");
    const days = stylistId ? await getScheduleDays(stylistId) : [];
    return NextResponse.json({
      data: { days },
      error: null,
      meta: null,
    });
  } catch {
    return NextResponse.json(
      { data: null, error: "Unable to load availability.", meta: null },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminAvailabilityCreateSchema.parse(await request.json());
    const slot = await createAvailabilitySlot(body);
    return NextResponse.json({ data: { slot }, error: null, meta: null });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: getErrorMessage(
          error,
          "Unable to create the availability slot.",
        ),
        meta: null,
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminApiUser();
    const { searchParams } = new URL(request.url);
    const body = adminAvailabilityDeleteSchema.parse({
      id: searchParams.get("id"),
    });
    await deleteAvailabilitySlot(body.id);
    return NextResponse.json({
      data: { success: true },
      error: null,
      meta: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: getErrorMessage(error, "Unable to remove that slot."),
        meta: null,
      },
      { status: 400 },
    );
  }
}
