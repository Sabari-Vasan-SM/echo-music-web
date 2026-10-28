"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Song, RepeatMode, LyricLine, LyricsData, EqualizerBand } from "@/types/music";
import { useLibrary } from "./LibraryContext";

export const DEFAULT_EQ_BANDS: EqualizerBand[] = [
  { frequency: 60, label: "60Hz", gain: 0 },
  { frequency: 230, label: "230Hz", gain: 0 },
  { frequency: 910, label: "910Hz", gain: 0 },
  { frequency: 3600, label: "3.6kHz", gain: 0 },
  { frequency: 14000, label: "14kHz", gain: 0 },
];

export const EQ_PRESETS: Record<string, number[]> = {
  flat: [0, 0, 0, 0, 0],
  "bass-boost": [6, 4, 1, 0, 0],
  "vocal-boost": [-2, 1, 4, 3, 1],
  electronic: [5, 3, 0, 2, 4],
  rock: [4, 2, -1, 3, 4],
  pop: [2, 3, 4, 2, 1],
  acoustic: [3, 2, 2, 3, 3],
};

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Song[];
  queueIndex: number;

  lyricsData: LyricsData | null;
  lyricsLoading: boolean;
  currentLyricIndex: number;

  isFullscreenPlayerOpen: boolean;
  isQueueDrawerOpen: boolean;
  isEqualizerOpen: boolean;
  isDnaModalOpen: boolean;
  activeTabInPlayer: "artwork" | "lyrics" | "dna" | "queue";

  equalizerBands: EqualizerBand[];
  equalizerPreset: string;

  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;

  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  setEqualizerBandGain: (frequency: number, gain: number) => void;
  applyEqualizerPreset: (presetName: string) => void;

  setIsFullscreenPlayerOpen: (open: boolean) => void;
  setIsQueueDrawerOpen: (open: boolean) => void;
  setIsEqualizerOpen: (open: boolean) => void;
  setIsDnaModalOpen: (open: boolean) => void;
  setActiveTabInPlayer: (tab: "artwork" | "lyrics" | "dna" | "queue") => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { addToHistory } = useLibrary();

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  const [queue, setQueue] = useState<Song[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(0);

  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState<boolean>(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState<number>(-1);

  const [isFullscreenPlayerOpen, setIsFullscreenPlayerOpen] = useState<boolean>(false);
  const [isQueueDrawerOpen, setIsQueueDrawerOpen] = useState<boolean>(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState<boolean>(false);
  const [isDnaModalOpen, setIsDnaModalOpen] = useState<boolean>(false);
  const [activeTabInPlayer, setActiveTabInPlayer] = useState<"artwork" | "lyrics" | "dna" | "queue">("artwork");

  const [equalizerBands, setEqualizerBands] = useState<EqualizerBand[]>(DEFAULT_EQ_BANDS);
  const [equalizerPreset, setEqualizerPreset] = useState<string>("flat");

  const ytWrapperRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytReadyRef = useRef<boolean>(false);
  const timerRef = useRef<any>(null);

  // Initialize YouTube Iframe API
  useEffect(() => {
    if (typeof window === "undefined") return;

    function initPlayer() {
      if (ytPlayerRef.current || !ytWrapperRef.current) return;
      try {
        let playerSlot = document.getElementById("echo-yt-player-slot");
        if (!playerSlot && ytWrapperRef.current) {
          playerSlot = document.createElement("div");
          playerSlot.id = "echo-yt-player-slot";
          ytWrapperRef.current.appendChild(playerSlot);
        }

        ytPlayerRef.current = new window.YT.Player("echo-yt-player-slot", {
          height: "1",
          width: "1",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              ytReadyRef.current = true;
              event.target.setVolume(volume * 100);
            },
            onStateChange: (event: any) => {
              // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
              if (event.data === 1) {
                setIsPlaying(true);
                const dur = event.target.getDuration();
                if (dur && dur > 0) setDuration(dur);
              } else if (event.data === 2) {
                setIsPlaying(false);
              } else if (event.data === 0) {
                handleSongEnded();
              }
            },
            onError: (err: any) => {
              console.warn("YouTube player error:", err);
              nextTrack();
            },
          },
        });
      } catch (err) {
        console.error("Failed to initialize YouTube player:", err);
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };

      if (!document.getElementById("echo-yt-iframe-script")) {
        const tag = document.createElement("script");
        tag.id = "echo-yt-iframe-script";
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Sync timeline tick
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          const t = ytPlayerRef.current.getCurrentTime() || 0;
          setCurrentTime(t);
          const dur = ytPlayerRef.current.getDuration() || 0;
          if (dur > 0 && dur !== duration) setDuration(dur);
        }
      }, 250);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, duration]);

  // Update active lyric line based on currentTime
  useEffect(() => {
    if (!lyricsData || !lyricsData.lines.length) {
      setCurrentLyricIndex(-1);
      return;
    }

    const currentMs = currentTime * 1000;
    const lines = lyricsData.lines;

    let activeIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].timeMs <= currentMs) {
        activeIdx = i;
      } else {
        break;
      }
    }
    setCurrentLyricIndex(activeIdx);
  }, [currentTime, lyricsData]);

  // Update MediaSession
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator) || !currentSong) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || "Echo Music",
        artwork: [
          { src: currentSong.thumbnail, sizes: "512x512", type: "image/jpeg" },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("pause", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("previoustrack", () => previousTrack());
      navigator.mediaSession.setActionHandler("nexttrack", () => nextTrack());
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) seekTo(details.seekTime);
      });
    } catch (e) {
      console.warn("MediaSession error:", e);
    }
  }, [currentSong]);

  // Fetch lyrics whenever currentSong changes
  useEffect(() => {
    if (!currentSong) {
      setLyricsData(null);
      return;
    }

    let isCancelled = false;
    setLyricsLoading(true);

    const fetchLyrics = async () => {
      try {
        const params = new URLSearchParams({
          track: currentSong.title,
          artist: currentSong.artist,
        });
        if (currentSong.duration) {
          params.set("duration", currentSong.duration.toString());
        }

        const res = await fetch(`/api/lyrics?${params.toString()}`);
        if (!res.ok) throw new Error("Lyrics fetch failed");
        const data = await res.json();
        if (!isCancelled) {
          setLyricsData(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setLyricsData({ synced: false, lines: [], plain: "Lyrics unavailable" });
        }
      } finally {
        if (!isCancelled) setLyricsLoading(false);
      }
    };

    fetchLyrics();

    return () => {
      isCancelled = true;
    };
  }, [currentSong]);

  // Auto-fetch Up Next radio tracks when queue is short
  useEffect(() => {
    if (!currentSong) return;
    if (queue.length - queueIndex <= 2) {
      const fetchNext = async () => {
        try {
          const res = await fetch(`/api/yt/next?videoId=${currentSong.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.songs && data.songs.length > 0) {
              setQueue((prev) => {
                const existingIds = new Set(prev.map((s) => s.id));
                const newItems = data.songs.filter((s: Song) => !existingIds.has(s.id));
                return [...prev, ...newItems];
              });
            }
          }
        } catch (e) {
          console.warn("Failed to auto-fetch radio tracks:", e);
        }
      };
      fetchNext();
    }
  }, [currentSong, queueIndex, queue.length]);

  const loadAndPlayVideo = useCallback((videoId: string) => {
    if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
      ytPlayerRef.current.loadVideoById(videoId);
      setIsPlaying(true);
    } else {
      // Retry once player is ready
      const checkInterval = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
          ytPlayerRef.current.loadVideoById(videoId);
          setIsPlaying(true);
          clearInterval(checkInterval);
        }
      }, 200);
      setTimeout(() => clearInterval(checkInterval), 5000);
    }
  }, []);

  const playSong = useCallback(
    (song: Song, newQueue?: Song[]) => {
      setCurrentSong(song);
      setCurrentTime(0);
      addToHistory(song);

      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        const idx = newQueue.findIndex((s) => s.id === song.id);
        setQueueIndex(idx !== -1 ? idx : 0);
      } else {
        setQueue((prev) => {
          const idx = prev.findIndex((s) => s.id === song.id);
          if (idx !== -1) {
            setQueueIndex(idx);
            return prev;
          } else {
            const updated = [song, ...prev];
            setQueueIndex(0);
            return updated;
          }
        });
      }

      loadAndPlayVideo(song.id);
    },
    [addToHistory, loadAndPlayVideo]
  );

  const togglePlayPause = useCallback(() => {
    if (!currentSong) return;
    if (isPlaying) {
      ytPlayerRef.current?.pauseVideo();
      setIsPlaying(false);
    } else {
      ytPlayerRef.current?.playVideo();
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying]);

  const seekTo = useCallback((seconds: number) => {
    if (ytPlayerRef.current?.seekTo) {
      ytPlayerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (!queue.length) return;
    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === "all") {
        nextIndex = 0;
      } else {
        return; // reached end
      }
    }
    const nextSong = queue[nextIndex];
    if (nextSong) {
      setQueueIndex(nextIndex);
      setCurrentSong(nextSong);
      setCurrentTime(0);
      addToHistory(nextSong);
      loadAndPlayVideo(nextSong.id);
    }
  }, [queue, queueIndex, repeatMode, addToHistory, loadAndPlayVideo]);

  const previousTrack = useCallback(() => {
    if (!queue.length) return;
    if (currentTime > 3) {
      seekTo(0);
      return;
    }
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      const prevSong = queue[prevIndex];
      setQueueIndex(prevIndex);
      setCurrentSong(prevSong);
      setCurrentTime(0);
      addToHistory(prevSong);
      loadAndPlayVideo(prevSong.id);
    } else {
      seekTo(0);
    }
  }, [queue, queueIndex, currentTime, seekTo, addToHistory, loadAndPlayVideo]);

  const handleSongEnded = useCallback(() => {
    if (repeatMode === "one" && currentSong) {
      seekTo(0);
      ytPlayerRef.current?.playVideo();
    } else {
      nextTrack();
    }
  }, [repeatMode, currentSong, seekTo, nextTrack]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    ytPlayerRef.current?.setVolume(clamped * 100);
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      ytPlayerRef.current?.setVolume(volume * 100);
    } else {
      setIsMuted(true);
      ytPlayerRef.current?.setVolume(0);
    }
  }, [isMuted, volume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => {
      const next = !prev;
      if (next && queue.length > 1 && currentSong) {
        // Shuffle queue keeping current song first
        const others = queue.filter((s) => s.id !== currentSong.id);
        const shuffled = [...others].sort(() => Math.random() - 0.5);
        setQueue([currentSong, ...shuffled]);
        setQueueIndex(0);
      }
      return next;
    });
  }, [queue, currentSong]);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue((prev) => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    if (currentSong) {
      setQueue([currentSong]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
  }, [currentSong]);

  const setEqualizerBandGain = useCallback((frequency: number, gain: number) => {
    setEqualizerBands((prev) =>
      prev.map((b) => (b.frequency === frequency ? { ...b, gain } : b))
    );
  }, []);

  const applyEqualizerPreset = useCallback((presetName: string) => {
    const gains = EQ_PRESETS[presetName];
    if (!gains) return;
    setEqualizerPreset(presetName);
    setEqualizerBands((prev) =>
      prev.map((band, idx) => ({
        ...band,
        gain: gains[idx] ?? 0,
      }))
    );
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
        queue,
        queueIndex,
        lyricsData,
        lyricsLoading,
        currentLyricIndex,
        isFullscreenPlayerOpen,
        isQueueDrawerOpen,
        isEqualizerOpen,
        isDnaModalOpen,
        activeTabInPlayer,
        equalizerBands,
        equalizerPreset,
        playSong,
        togglePlayPause,
        seekTo,
        nextTrack,
        previousTrack,
        setVolume,
        toggleMute,
        toggleShuffle,
        cycleRepeatMode,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setEqualizerBandGain,
        applyEqualizerPreset,
        setIsFullscreenPlayerOpen,
        setIsQueueDrawerOpen,
        setIsEqualizerOpen,
        setIsDnaModalOpen,
        setActiveTabInPlayer,
      }}
    >
      {/* Hidden YouTube audio player frame container */}
      <div
        ref={ytWrapperRef}
        style={{
          position: "fixed",
          bottom: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
