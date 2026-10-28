import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeMusic } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const filter = searchParams.get("filter") || undefined;

  if (!query) {
    return NextResponse.json({ songs: [], sections: {} });
  }

  try {
    const results = await searchYouTubeMusic(query, filter);
    return NextResponse.json(results);
  } catch (err: any) {
    console.error("Search API error:", err);
    return NextResponse.json(
      { error: "Search failed", details: err?.message },
      { status: 500 }
    );
  }
}
