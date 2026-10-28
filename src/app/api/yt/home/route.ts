import { NextResponse } from "next/server";
import { getHomePage } from "@/lib/innertube";

export async function GET() {
  try {
    const data = await getHomePage();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Home API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch home page", details: err?.message },
      { status: 500 }
    );
  }
}
