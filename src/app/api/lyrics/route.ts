import { NextRequest, NextResponse } from "next/server";

export interface ParsedLyricLine {
  timeMs: number;
  timeSec: number;
  text: string;
}

function parseLrc(lrcText: string): ParsedLyricLine[] {
  const lines = lrcText.split("\n");
  const parsed: ParsedLyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match;
    const timestamps: number[] = [];
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = match[3] ? (match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10)) : 0;
      const totalMs = minutes * 60000 + seconds * 1000 + ms;
      timestamps.push(totalMs);
    }

    const cleanText = trimmed.replace(/\[\d{2}:\d{2}\.?\d{2,3}?\]/g, "").trim();

    if (timestamps.length > 0) {
      for (const t of timestamps) {
        parsed.push({
          timeMs: t,
          timeSec: t / 1000,
          text: cleanText || "♪",
        });
      }
    }
  }

  return parsed.sort((a, b) => a.timeMs - b.timeMs);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const track = searchParams.get("track");
  const artist = searchParams.get("artist");
  const duration = searchParams.get("duration");

  if (!track) {
    return NextResponse.json({ error: "Missing track name" }, { status: 400 });
  }

  try {
    // 1. Try exact match first
    let queryParams = new URLSearchParams({
      track_name: track,
      artist_name: artist || "",
    });
    if (duration) queryParams.set("duration", duration);

    let res = await fetch(`https://lrclib.net/api/get?${queryParams.toString()}`, {
      headers: { "User-Agent": "EchoMusic/1.0" },
      next: { revalidate: 3600 },
    });

    let data = null;
    if (res.ok) {
      data = await res.json();
    } else {
      // 2. Fallback to search
      const searchRes = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${track} ${artist || ""}`)}`,
        {
          headers: { "User-Agent": "EchoMusic/1.0" },
          next: { revalidate: 3600 },
        }
      );
      if (searchRes.ok) {
        const searchList = await searchRes.json();
        if (Array.isArray(searchList) && searchList.length > 0) {
          data = searchList[0];
        }
      }
    }

    if (!data) {
      return NextResponse.json({
        synced: false,
        lines: [],
        plain: "No lyrics found for this song.",
      });
    }

    const hasSynced = !!data.syncedLyrics;
    const lines = hasSynced ? parseLrc(data.syncedLyrics) : [];

    return NextResponse.json({
      synced: hasSynced,
      lines,
      plain: data.plainLyrics || "No plain lyrics available.",
      instrumental: data.instrumental || false,
    });
  } catch (err: any) {
    console.error("Lyrics fetch error:", err);
    return NextResponse.json({
      synced: false,
      lines: [],
      plain: "Failed to load lyrics.",
    });
  }
}
