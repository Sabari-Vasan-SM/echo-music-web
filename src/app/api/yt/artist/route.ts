import { NextRequest, NextResponse } from "next/server";
import { getArtistDetails } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing artist id" }, { status: 400 });
  }

  try {
    const artist = await getArtistDetails(id);
    return NextResponse.json(artist);
  } catch (err: any) {
    console.error("Artist API error:", err);
    return NextResponse.json({ error: "Failed to fetch artist details" }, { status: 500 });
  }
}
