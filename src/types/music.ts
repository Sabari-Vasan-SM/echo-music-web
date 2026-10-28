export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  duration?: number;
  durationText?: string;
  thumbnail: string;
  explicit?: boolean;
}

export interface SectionItem {
  id?: string;
  title: string;
  subtitle?: string;
  thumbnail: string;
  type: "song" | "album" | "playlist" | "artist";
  artist?: string;
}

export interface HomeSection {
  title: string;
  items: SectionItem[];
}

export interface LyricLine {
  timeMs: number;
  timeSec: number;
  text: string;
}

export interface LyricsData {
  synced: boolean;
  lines: LyricLine[];
  plain?: string;
  instrumental?: boolean;
}

export interface MusicDNA {
  track: string;
  artist: string;
  album: string;
  releaseDate?: string;
  meaning: string;
  bio: string;
}

export type RepeatMode = "off" | "all" | "one";

export interface CustomPlaylist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdAt: number;
  songs: Song[];
}

export interface EqualizerBand {
  frequency: number;
  label: string;
  gain: number; // -12 to +12 dB
}
