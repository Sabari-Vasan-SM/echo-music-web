"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Song, CustomPlaylist } from "@/types/music";

interface LibraryContextType {
  favorites: Song[];
  toggleFavorite: (song: Song) => void;
  isFavorite: (songId: string) => boolean;

  playlists: CustomPlaylist[];
  createPlaylist: (name: string, description?: string) => string;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;

  history: Song[];
  addToHistory: (song: Song) => void;
  clearHistory: () => void;

  offlineSongs: Song[];
  toggleDownload: (song: Song) => void;
  isDownloaded: (songId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const FAVORITES_KEY = "echo_favorites";
const PLAYLISTS_KEY = "echo_playlists";
const HISTORY_KEY = "echo_history";
const OFFLINE_KEY = "echo_offline";

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<CustomPlaylist[]>([]);
  const [history, setHistory] = useState<Song[]>([]);
  const [offlineSongs, setOfflineSongs] = useState<Song[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem(FAVORITES_KEY);
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedPlaylists = localStorage.getItem(PLAYLISTS_KEY);
      if (savedPlaylists) {
        setPlaylists(JSON.parse(savedPlaylists));
      } else {
        // Initial sample playlist
        const defaultPlaylist: CustomPlaylist = {
          id: "echo-favorites-mix",
          name: "My Daily Mix",
          description: "Curated favorites & high rotation picks",
          createdAt: Date.now(),
          songs: [],
        };
        setPlaylists([defaultPlaylist]);
      }

      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedOffline = localStorage.getItem(OFFLINE_KEY);
      if (savedOffline) setOfflineSongs(JSON.parse(savedOffline));
    } catch (e) {
      console.error("Failed to load library state:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever states change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn("Could not save favorites:", e);
    }
  }, [favorites, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    } catch (e) {
      console.warn("Could not save playlists:", e);
    }
  }, [playlists, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Could not save history:", e);
    }
  }, [history, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(offlineSongs));
    } catch (e) {
      console.warn("Could not save offline songs:", e);
    }
  }, [offlineSongs, isInitialized]);

  const toggleFavorite = (song: Song) => {
    setFavorites((prev) => {
      const exists = prev.some((s) => s.id === song.id);
      if (exists) {
        return prev.filter((s) => s.id !== song.id);
      } else {
        return [song, ...prev];
      }
    });
  };

  const isFavorite = (songId: string) => {
    return favorites.some((s) => s.id === songId);
  };

  const createPlaylist = (name: string, description?: string) => {
    const id = "pl_" + Math.random().toString(36).substring(2, 9);
    const newPl: CustomPlaylist = {
      id,
      name: name.trim() || "Untitled Playlist",
      description: description?.trim(),
      createdAt: Date.now(),
      songs: [],
    };
    setPlaylists((prev) => [newPl, ...prev]);
    return id;
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        if (pl.songs.some((s) => s.id === song.id)) return pl;
        return {
          ...pl,
          songs: [...pl.songs, song],
          coverUrl: pl.coverUrl || song.thumbnail,
        };
      })
    );
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        return {
          ...pl,
          songs: pl.songs.filter((s) => s.id !== songId),
        };
      })
    );
  };

  const addToHistory = (song: Song) => {
    setHistory((prev) => {
      const filtered = prev.filter((s) => s.id !== song.id);
      return [song, ...filtered].slice(0, 100);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const toggleDownload = (song: Song) => {
    setOfflineSongs((prev) => {
      const exists = prev.some((s) => s.id === song.id);
      if (exists) {
        return prev.filter((s) => s.id !== song.id);
      } else {
        return [song, ...prev];
      }
    });
  };

  const isDownloaded = (songId: string) => {
    return offlineSongs.some((s) => s.id === songId);
  };

  return (
    <LibraryContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        playlists,
        createPlaylist,
        deletePlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        history,
        addToHistory,
        clearHistory,
        offlineSongs,
        toggleDownload,
        isDownloaded,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}
