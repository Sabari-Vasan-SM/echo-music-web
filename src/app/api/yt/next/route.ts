import { NextRequest, NextResponse } from "next/server";
import { getUpNextTracks } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ songs: [] });
  }

  try {
    const songs = await getUpNextTracks(videoId);
    return NextResponse.json({ songs });
  } catch (err: any) {
    console.error("Next API error:", err);
    return NextResponse.json({ songs: [] });
  }
}
