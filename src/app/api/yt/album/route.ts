import { NextRequest, NextResponse } from "next/server";
import { getAlbumDetails } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing album id" }, { status: 400 });
  }

  try {
    const album = await getAlbumDetails(id);
    return NextResponse.json(album);
  } catch (err: any) {
    console.error("Album API error:", err);
    return NextResponse.json({ error: "Failed to fetch album details" }, { status: 500 });
  }
}
