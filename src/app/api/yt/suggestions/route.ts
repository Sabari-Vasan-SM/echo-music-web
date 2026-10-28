import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/innertube";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await getSearchSuggestions(query);
    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error("Suggestions API error:", err);
    return NextResponse.json({ suggestions: [] });
  }
}
