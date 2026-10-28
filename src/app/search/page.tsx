"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon, X, Music, Disc, User, ListMusic, Sparkles } from "lucide-react";
import { Song, SectionItem } from "@/types/music";
import { SongRow } from "@/components/SongRow";
import { CardItem } from "@/components/CardItem";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [songs, setSongs] = useState<Song[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Trending default suggestions
  const defaultTrending = [
    "The Weeknd",
    "Taylor Swift",
    "Billie Eilish",
    "Kendrick Lamar",
    "Dua Lipa",
    "Drake",
    "Post Malone",
    "Coldplay",
  ];

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (!query.trim() || !showSuggestions) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yt/suggestions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (e) {
        console.warn("Failed to fetch suggestions:", e);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, showSuggestions]);

  // Execute Search
  const executeSearch = async (searchTerm: string, currentFilter = filter) => {
    if (!searchTerm.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);

    try {
      const fParam = currentFilter !== "all" ? `&filter=${currentFilter}` : "";
      const res = await fetch(`/api/yt/search?q=${encodeURIComponent(searchTerm)}${fParam}`);
      if (res.ok) {
        const data = await res.json();
        setSongs(data.songs || []);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeSearch(query);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowSuggestions(false);
    setSuggestions([]);
    setQuery(term);
    executeSearch(term);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    if (query.trim()) {
      executeSearch(query, newFilter);
    }
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Search Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          className="brand-title"
          style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff", marginBottom: "8px" }}
        >
          Search
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
          Find your favorite tracks, artists, albums, or explore fresh sounds
        </p>
      </div>

      {/* Search Bar & Auto-suggestions */}
      <div ref={searchContainerRef} style={{ position: "relative", marginBottom: "24px" }}>
        <div
          className="glass-panel"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 20px",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border-glass-light)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
          }}
        >
          <SearchIcon size={22} color="var(--primary-accent)" style={{ marginRight: "14px" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => {
              if (query.trim()) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tracks, artists, or paste a link..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "1.1rem",
              outline: "none",
              padding: "10px 0",
            }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSongs([]);
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="btn-icon"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            className="glass-panel"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 30,
              marginTop: "8px",
              borderRadius: "var(--radius-lg)",
              padding: "8px",
              boxShadow: "0 16px 40px rgba(0, 0, 0, 0.7)",
            }}
          >
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => selectSuggestion(item)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: "0.95rem",
                  transition: "var(--transition-smooth)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <SearchIcon size={16} color="var(--text-muted)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "32px", overflowX: "auto" }}>
        {[
          { key: "all", label: "All" },
          { key: "songs", label: "Songs" },
          { key: "albums", label: "Albums" },
          { key: "artists", label: "Artists" },
          { key: "playlists", label: "Playlists" },
        ].map((item) => {
          const isActive = filter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleFilterChange(item.key)}
              className={`glass-pill ${isActive ? "active" : ""}`}
              style={{
                padding: "8px 20px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* If No Query: Show Trending Artists */}
      {!query && songs.length === 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <Sparkles size={18} color="var(--primary-accent)" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
              Trending Searches
            </h3>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {defaultTrending.map((term) => (
              <button
                key={term}
                onClick={() => selectSuggestion(term)}
                className="glass-pill"
                style={{
                  padding: "8px 18px",
                  fontSize: "0.9rem",
                  color: "var(--text-main)",
                  cursor: "pointer",
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          Searching YouTube Music...
        </div>
      )}

      {/* Search Results List */}
      {!loading && songs.length > 0 && (
        <div>
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "16px",
            }}
          >
            Top Results ({songs.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {songs.map((song, idx) => (
              <SongRow key={song.id} song={song} index={idx} playlistContext={songs} />
            ))}
          </div>
        </div>
      )}

      {!loading && query && songs.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-dim)" }}>
          No results found for "{query}". Try a different search term.
        </div>
      )}
    </div>
  );
}
