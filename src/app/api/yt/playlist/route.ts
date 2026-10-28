import { NextRequest, NextResponse } from "next/server";
import { getPlaylistDetails } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing playlist id" }, { status: 400 });
  }

  try {
    const playlist = await getPlaylistDetails(id);
    return NextResponse.json(playlist);
  } catch (err: any) {
    console.error("Playlist API error:", err);
    return NextResponse.json({ error: "Failed to fetch playlist details" }, { status: 500 });
  }
}
