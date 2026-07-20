import { NextResponse } from "next/server";
import { getBookingServices, getPublicStoreSettings } from "@/lib/data/public";

export async function GET() {
  try {
    const [services, store] = await Promise.all([
      getBookingServices(),
      getPublicStoreSettings(),
    ]);
    return NextResponse.json({ services, travelFee: store.travelFee });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load booking services.",
      },
      { status: 500 },
    );
  }
}
