import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const track = searchParams.get("track") || "";
  const artist = searchParams.get("artist") || "";

  if (!track) {
    return NextResponse.json({ error: "Missing track name" }, { status: 400 });
  }

  let albumName = "Unknown";
  let songMeaning = "Information not found.";
  let artistBio = "Biography not found.";
  let releaseDate = "";

  try {
    // 1. Search Genius API
    const query = encodeURIComponent(`${artist} ${track}`);
    const geniusSearch = await fetch(`https://genius.com/api/search/multi?q=${query}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 86400 },
    });

    if (geniusSearch.ok) {
      const searchData = await geniusSearch.json();
      const sections = searchData?.response?.sections || [];
      let songId = null;

      for (const sec of sections) {
        if (sec.type === "top_hit" || sec.type === "song") {
          const hits = sec.hits || [];
          if (hits.length > 0 && hits[0]?.result?.id) {
            songId = hits[0].result.id;
            break;
          }
        }
      }

      if (songId) {
        // Fetch song details
        const songRes = await fetch(
          `https://genius.com/api/songs/${songId}?text_format=plain`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );

        if (songRes.ok) {
          const songData = await songRes.json();
          const song = songData?.response?.song;

          if (song?.album?.name) {
            albumName = song.album.name;
          }
          if (song?.release_date_for_display) {
            releaseDate = song.release_date_for_display;
          }
          if (song?.description?.plain && song.description.plain !== "?") {
            songMeaning = song.description.plain;
          }

          // Artist details
          const primaryArtistId = song?.primary_artist?.id;
          if (primaryArtistId) {
            const artistRes = await fetch(
              `https://genius.com/api/artists/${primaryArtistId}?text_format=plain`,
              { headers: { "User-Agent": "Mozilla/5.0" } }
            );
            if (artistRes.ok) {
              const artistData = await artistRes.json();
              const artistObj = artistData?.response?.artist;
              if (artistObj?.description?.plain && artistObj.description.plain !== "?") {
                artistBio = artistObj.description.plain;
              }
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn("Genius query failed, falling back to Wikipedia:", e);
  }

  // 2. Wikipedia fallback for song meaning or if meaning was empty
  if (songMeaning === "Information not found." || songMeaning.length < 20) {
    try {
      const wpQuery = encodeURIComponent(`${track} song`);
      const wpSearchRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${wpQuery}&utf8=&format=json`,
        { headers: { "User-Agent": "EchoMusic/1.0" } }
      );
      if (wpSearchRes.ok) {
        const wpSearch = await wpSearchRes.json();
        const firstHit = wpSearch?.query?.search?.[0]?.title;
        if (firstHit) {
          const wpExtractRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=5&exlimit=1&titles=${encodeURIComponent(
              firstHit
            )}&explaintext=1&format=json`,
            { headers: { "User-Agent": "EchoMusic/1.0" } }
          );
          if (wpExtractRes.ok) {
            const wpExtract = await wpExtractRes.json();
            const pages = wpExtract?.query?.pages || {};
            const firstPageKey = Object.keys(pages)[0];
            const extract = pages[firstPageKey]?.extract;
            if (extract && !extract.includes("may refer to")) {
              songMeaning = extract;
            }
          }
        }
      }
    } catch (e) {
      console.warn("Wikipedia song extract failed:", e);
    }
  }

  // 3. Wikipedia fallback for artist bio
  if ((artistBio === "Biography not found." || artistBio.length < 20) && artist) {
    try {
      const wpArtistRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exsentences=4&exlimit=1&titles=${encodeURIComponent(
          artist
        )}&explaintext=1&format=json`,
        { headers: { "User-Agent": "EchoMusic/1.0" } }
      );
      if (wpArtistRes.ok) {
        const wpExtract = await wpArtistRes.json();
        const pages = wpExtract?.query?.pages || {};
        const firstPageKey = Object.keys(pages)[0];
        const extract = pages[firstPageKey]?.extract;
        if (extract && !extract.includes("may refer to")) {
          artistBio = extract;
        }
      }
    } catch (e) {
      console.warn("Wikipedia artist extract failed:", e);
    }
  }

  return NextResponse.json({
    track,
    artist,
    album: albumName,
    releaseDate,
    meaning: songMeaning,
    bio: artistBio,
  });
}
