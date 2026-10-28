// Innertube API helper for Echo Music Web
// Interacts directly with YouTube Music's Innertube endpoints

const YTM_BASE = "https://music.youtube.com/youtubei/v1";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0";

const DEFAULT_CONTEXT = {
  client: {
    clientName: "WEB_REMIX",
    clientVersion: "1.20260213.01.00",
    gl: "US",
    hl: "en",
  },
};

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  duration?: number; // seconds
  durationText?: string;
  thumbnail: string;
  explicit?: boolean;
}

export interface SectionItem {
  title: string;
  subtitle?: string;
  thumbnail: string;
  id?: string;
  type: "song" | "album" | "playlist" | "artist";
  artist?: string;
}

export interface HomeSection {
  title: string;
  items: SectionItem[];
}

export async function innertubeRequest(endpoint: string, body: Record<string, any>) {
  const url = `${YTM_BASE}/${endpoint}?prettyPrint=false`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      "Referer": "https://music.youtube.com/",
      "Origin": "https://music.youtube.com",
    },
    body: JSON.stringify({
      context: DEFAULT_CONTEXT,
      ...body,
    }),
    next: { revalidate: 300 }, // Cache for 5 mins
  });

  if (!response.ok) {
    throw new Error(`Innertube request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Parse text from runs
function getRunsText(runs?: Array<{ text: string }>): string {
  if (!runs || !runs.length) return "";
  return runs.map((r) => r.text).join("");
}

// Clean title / artist text
export function cleanText(str?: string): string {
  if (!str) return "";
  return str.trim();
}

// Parse time string e.g. "3:45" or "1:02:15" to seconds
export function parseDuration(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

// Extract best thumbnail
export function getBestThumbnail(thumbnails?: Array<{ url: string; width?: number; height?: number }>): string {
  if (!thumbnails || !thumbnails.length) {
    return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60";
  }
  // Try to find the largest or highest quality thumbnail
  const sorted = [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
  let url = sorted[0].url;
  if (url.startsWith("//")) url = `https:${url}`;
  return url;
}

// Search Suggestions
export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const data = await innertubeRequest("music/get_search_suggestions", {
      input: query,
    });
    const contents =
      data?.contents?.[0]?.searchSuggestionsSectionRenderer?.contents || [];
    const suggestions: string[] = [];
    for (const item of contents) {
      const runs = item?.searchSuggestionRenderer?.suggestion?.runs;
      if (runs) {
        suggestions.push(getRunsText(runs));
      }
    }
    return suggestions;
  } catch (err) {
    console.error("Error fetching suggestions:", err);
    return [];
  }
}

// Search
export async function searchYouTubeMusic(query: string, filter?: string): Promise<{ songs: SongItem[]; sections: Record<string, any[]> }> {
  try {
    let params: string | undefined = undefined;
    if (filter === "songs") params = "EgWKAQIIAWoSEAQQAxAJEAUQChAVEBAQDhAR";
    else if (filter === "albums") params = "EgWKAQIYAWoSEAQQAxAJEAUQChAVEBAQDhAR";
    else if (filter === "artists") params = "EgWKAQIgAWoSEAQQAxAJEAUQChAVEBAQDhAR";
    else if (filter === "playlists") params = "EgeKAQQoAEABahIQBBADEAkQBRAKEBUQEBAOEBE%3D";

    const body: Record<string, any> = { query };
    if (params) body.params = params;

    const data = await innertubeRequest("search", body);
    const tabs = data?.contents?.tabbedSearchResultsRenderer?.tabs || [];
    const sectionList = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

    const songs: SongItem[] = [];
    const otherResults: Record<string, any[]> = {
      albums: [],
      artists: [],
      playlists: [],
    };

    for (const section of sectionList) {
      const shelf = section?.musicShelfRenderer;
      const cardShelf = section?.musicCardShelfRenderer;

      if (cardShelf) {
        // Top hit / card shelf
        const titleRuns = cardShelf?.title?.runs;
        const title = getRunsText(titleRuns);
        const videoId = cardShelf?.onTap?.watchEndpoint?.videoId;
        const thumb = getBestThumbnail(cardShelf?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails);
        const subRuns = cardShelf?.subtitle?.runs;
        const artist = subRuns?.[0]?.text || "";

        if (videoId && title) {
          songs.push({
            id: videoId,
            title,
            artist,
            thumbnail: thumb,
            duration: 0,
            durationText: "",
          });
        }
      }

      if (shelf) {
        const items = shelf?.contents || [];
        for (const it of items) {
          const renderer = it?.musicResponsiveListItemRenderer;
          if (!renderer) continue;

          const flexCols = renderer?.flexColumns || [];
          const col1 = flexCols[0]?.musicResponsiveListItemFlexColumnRenderer;
          const col2 = flexCols[1]?.musicResponsiveListItemFlexColumnRenderer;

          const titleRuns = col1?.text?.runs;
          const title = getRunsText(titleRuns);
          const col2Runs = col2?.text?.runs || [];

          // Video ID
          const videoId =
            renderer?.playlistItemData?.videoId ||
            renderer?.navigationEndpoint?.watchEndpoint?.videoId ||
            col1?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId ||
            renderer?.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId;

          const thumbnail = getBestThumbnail(
            renderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
          );

          // Subtitle breakdown: typically [Artist, ' • ', Album, ' • ', Duration]
          let artist = "";
          let artistId = "";
          let album = "";
          let albumId = "";
          let durationText = "";

          for (let i = 0; i < col2Runs.length; i++) {
            const run = col2Runs[i];
            const nav = run?.navigationEndpoint?.browseEndpoint;
            if (nav?.browseId?.startsWith("UC") || nav?.browseId?.startsWith("FEmusic_library_privately_owned_artist")) {
              artist = run.text;
              artistId = nav.browseId;
            } else if (nav?.browseId?.startsWith("MPRE")) {
              album = run.text;
              albumId = nav.browseId;
            } else if (run.text.includes(":") && !artist) {
              durationText = run.text;
            } else if (!artist && run.text !== " • ") {
              artist = run.text;
            } else if (artist && run.text.includes(":")) {
              durationText = run.text;
            }
          }

          if (videoId && title) {
            songs.push({
              id: videoId,
              title,
              artist: artist || "Unknown Artist",
              artistId,
              album,
              albumId,
              duration: parseDuration(durationText),
              durationText,
              thumbnail,
            });
          }
        }
      }
    }

    return { songs, sections: otherResults };
  } catch (err) {
    console.error("Search failed:", err);
    return { songs: [], sections: {} };
  }
}

// Browse Home Page
export async function getHomePage(): Promise<{
  quickPicks: SongItem[];
  sections: HomeSection[];
  moodChips: string[];
}> {
  try {
    const data = await innertubeRequest("browse", {
      browseId: "FEmusic_home",
    });

    const tab = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer;
    const sectionList = tab?.content?.sectionListRenderer?.contents || [];

    // Mood chips from header
    const chips = tab?.content?.sectionListRenderer?.header?.chipCloudRenderer?.chips || [];
    const moodChips: string[] = chips
      .map((c: any) => c?.chipCloudChipRenderer?.text?.runs?.[0]?.text)
      .filter(Boolean);

    const quickPicks: SongItem[] = [];
    const sections: HomeSection[] = [];

    for (const sec of sectionList) {
      const carousel = sec?.musicCarouselShelfRenderer;
      if (!carousel) continue;

      const headerTitle =
        carousel?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text || "Featured";
      const items = carousel?.contents || [];

      const parsedItems: SectionItem[] = [];

      for (const item of items) {
        const twoRow = item?.musicTwoRowItemRenderer;
        const responsive = item?.musicResponsiveListItemRenderer;

        if (twoRow) {
          const title = getRunsText(twoRow?.title?.runs);
          const subtitle = getRunsText(twoRow?.subtitle?.runs);
          const thumb = getBestThumbnail(twoRow?.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails);
          const nav = twoRow?.navigationEndpoint;
          const videoId = nav?.watchEndpoint?.videoId;
          const browseId = nav?.browseEndpoint?.browseId;

          let type: SectionItem["type"] = "playlist";
          if (videoId) type = "song";
          else if (browseId?.startsWith("MPRE")) type = "album";
          else if (browseId?.startsWith("UC")) type = "artist";

          if (videoId) {
            quickPicks.push({
              id: videoId,
              title,
              artist: subtitle,
              thumbnail: thumb,
            });
          }

          parsedItems.push({
            title,
            subtitle,
            thumbnail: thumb,
            id: videoId || browseId,
            type,
            artist: subtitle,
          });
        } else if (responsive) {
          const col1 = responsive?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer;
          const col2 = responsive?.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer;
          const title = getRunsText(col1?.text?.runs);
          const subtitle = getRunsText(col2?.text?.runs);
          const videoId = responsive?.playlistItemData?.videoId || responsive?.navigationEndpoint?.watchEndpoint?.videoId;
          const thumb = getBestThumbnail(responsive?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails);

          if (videoId && title) {
            quickPicks.push({
              id: videoId,
              title,
              artist: subtitle,
              thumbnail: thumb,
            });
            parsedItems.push({
              title,
              subtitle,
              thumbnail: thumb,
              id: videoId,
              type: "song",
              artist: subtitle,
            });
          }
        }
      }

      if (parsedItems.length > 0) {
        sections.push({
          title: headerTitle,
          items: parsedItems,
        });
      }
    }

    return { quickPicks: quickPicks.slice(0, 16), sections, moodChips };
  } catch (err) {
    console.error("Failed to fetch home page:", err);
    return { quickPicks: [], sections: [], moodChips: [] };
  }
}

// Next / Up Next Radio
export async function getUpNextTracks(videoId: string): Promise<SongItem[]> {
  try {
    const data = await innertubeRequest("next", {
      videoId,
      isAudioOnly: true,
    });

    const panel =
      data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer;

    const items = panel?.contents || [];
    const songs: SongItem[] = [];

    for (const it of items) {
      const v = it?.playlistPanelVideoRenderer;
      if (!v) continue;

      const title = getRunsText(v?.title?.runs);
      const longByline = v?.longBylineText?.runs || [];
      const artist = longByline?.[0]?.text || "Unknown";
      const id = v?.videoId;
      const thumb = getBestThumbnail(v?.thumbnail?.thumbnails);
      const durationText = v?.lengthText?.runs?.[0]?.text || "";

      if (id && title) {
        songs.push({
          id,
          title,
          artist,
          duration: parseDuration(durationText),
          durationText,
          thumbnail: thumb,
        });
      }
    }

    return songs;
  } catch (err) {
    console.error("Failed to get up next tracks:", err);
    return [];
  }
}

// Album details
export async function getAlbumDetails(albumBrowseId: string): Promise<{
  title: string;
  artist: string;
  year?: string;
  thumbnail: string;
  tracks: SongItem[];
}> {
  try {
    const data = await innertubeRequest("browse", {
      browseId: albumBrowseId,
    });

    const header =
      data?.header?.musicDetailHeaderRenderer ||
      data?.header?.musicResponsiveHeaderRenderer;

    const title = getRunsText(header?.title?.runs) || "Unknown Album";
    const artist = getRunsText(header?.subtitle?.runs) || "";
    const thumb = getBestThumbnail(header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails || header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails);

    const section =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer;

    const contents = section?.contents || [];
    const tracks: SongItem[] = [];

    for (const item of contents) {
      const r = item?.musicResponsiveListItemRenderer;
      if (!r) continue;

      const trackTitle = getRunsText(r?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs);
      const videoId = r?.playlistItemData?.videoId || r?.navigationEndpoint?.watchEndpoint?.videoId;
      const durationText = getRunsText(r?.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs);

      if (videoId && trackTitle) {
        tracks.push({
          id: videoId,
          title: trackTitle,
          artist,
          album: title,
          albumId: albumBrowseId,
          duration: parseDuration(durationText),
          durationText,
          thumbnail: thumb,
        });
      }
    }

    return { title, artist, thumbnail: thumb, tracks };
  } catch (err) {
    console.error("Failed to fetch album details:", err);
    return { title: "Album", artist: "", thumbnail: "", tracks: [] };
  }
}

// Artist details
export async function getArtistDetails(artistBrowseId: string): Promise<{
  name: string;
  description?: string;
  thumbnail: string;
  topSongs: SongItem[];
  albums: SectionItem[];
}> {
  try {
    const data = await innertubeRequest("browse", {
      browseId: artistBrowseId,
    });

    const header =
      data?.header?.musicImmersiveHeaderRenderer ||
      data?.header?.musicVisualHeaderRenderer;

    const name = getRunsText(header?.title?.runs) || "Unknown Artist";
    const description = getRunsText(header?.description?.runs);
    const thumbnail = getBestThumbnail(header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails);

    const tabs = data?.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
    const sections = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

    const topSongs: SongItem[] = [];
    const albums: SectionItem[] = [];

    for (const sec of sections) {
      const shelf = sec?.musicShelfRenderer;
      const carousel = sec?.musicCarouselShelfRenderer;

      if (shelf) {
        for (const item of shelf?.contents || []) {
          const r = item?.musicResponsiveListItemRenderer;
          if (!r) continue;
          const trackTitle = getRunsText(r?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs);
          const videoId = r?.playlistItemData?.videoId || r?.navigationEndpoint?.watchEndpoint?.videoId;
          const thumb = getBestThumbnail(r?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails);
          const durText = getRunsText(r?.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs);

          if (videoId && trackTitle) {
            topSongs.push({
              id: videoId,
              title: trackTitle,
              artist: name,
              artistId: artistBrowseId,
              thumbnail: thumb || thumbnail,
              duration: parseDuration(durText),
              durationText: durText,
            });
          }
        }
      }

      if (carousel) {
        for (const item of carousel?.contents || []) {
          const twoRow = item?.musicTwoRowItemRenderer;
          if (!twoRow) continue;
          const albumTitle = getRunsText(twoRow?.title?.runs);
          const albumBrowseId = twoRow?.navigationEndpoint?.browseEndpoint?.browseId;
          const thumb = getBestThumbnail(twoRow?.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails);

          if (albumBrowseId && albumTitle) {
            albums.push({
              title: albumTitle,
              subtitle: name,
              id: albumBrowseId,
              type: "album",
              thumbnail: thumb,
            });
          }
        }
      }
    }

    return { name, description, thumbnail, topSongs: topSongs.slice(0, 20), albums };
  } catch (err) {
    console.error("Failed to fetch artist:", err);
    return { name: "Artist", thumbnail: "", topSongs: [], albums: [] };
  }
}

// Playlist details
export async function getPlaylistDetails(browseId: string): Promise<{
  title: string;
  author: string;
  description?: string;
  thumbnail: string;
  tracks: SongItem[];
}> {
  try {
    const finalBrowseId = browseId.startsWith("VL") ? browseId : `VL${browseId}`;
    const data = await innertubeRequest("browse", {
      browseId: finalBrowseId,
    });

    const twoColumn = data?.contents?.twoColumnBrowseResultsRenderer;
    const singleColumn = data?.contents?.singleColumnBrowseResultsRenderer;

    const header =
      data?.header?.musicDetailHeaderRenderer ||
      data?.header?.musicResponsiveHeaderRenderer ||
      twoColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicResponsiveHeaderRenderer ||
      data?.header?.musicEditablePlaylistDetailHeaderRenderer?.header?.musicDetailHeaderRenderer;

    const title = getRunsText(header?.title?.runs) || "Playlist";
    const author = getRunsText(header?.subtitle?.runs) || "";
    const description = getRunsText(header?.description?.runs);
    const thumb = getBestThumbnail(
      header?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails ||
      header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
    );

    const playlistShelf =
      twoColumn?.secondaryContents?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer ||
      twoColumn?.secondaryContents?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer ||
      singleColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicPlaylistShelfRenderer ||
      singleColumn?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer;

    const contents = playlistShelf?.contents || [];
    const tracks: SongItem[] = [];

    for (const item of contents) {
      const r = item?.musicResponsiveListItemRenderer;
      if (!r) continue;

      const trackTitle = getRunsText(r?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs);
      const col2Runs = r?.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
      const artist = col2Runs?.[0]?.text || author || "Unknown Artist";
      const videoId = r?.playlistItemData?.videoId || r?.navigationEndpoint?.watchEndpoint?.videoId;
      const durationText = getRunsText(r?.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs);
      const trackThumb = getBestThumbnail(r?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails) || thumb;

      if (videoId && trackTitle) {
        tracks.push({
          id: videoId,
          title: trackTitle,
          artist,
          album: title,
          duration: parseDuration(durationText),
          durationText,
          thumbnail: trackThumb,
        });
      }
    }

    return { title, author, description, thumbnail: thumb, tracks };
  } catch (err) {
    console.error("Failed to fetch playlist details:", err);
    return { title: "Playlist", author: "", thumbnail: "", tracks: [] };
  }
}

