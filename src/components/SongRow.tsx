"use client";

import React, { useState } from "react";
import { Play, Pause, Heart, MoreVertical, Plus, Sparkles, ListPlus } from "lucide-react";
import { Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { useLibrary } from "@/context/LibraryContext";

interface SongRowProps {
  song: Song;
  index?: number;
  playlistContext?: Song[];
}

export function SongRow({ song, index, playlistContext }: SongRowProps) {
  const { currentSong, isPlaying, playSong, togglePlayPause, addToQueue, setIsDnaModalOpen } =
    usePlayer();
  const { isFavorite, toggleFavorite, playlists, addSongToPlaylist } = useLibrary();
  const [showMenu, setShowMenu] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const isLiked = isFavorite(song.id);

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "8px 14px",
        borderRadius: "var(--radius-md)",
        position: "relative",
        background: isCurrent ? "rgba(237, 85, 100, 0.12)" : undefined,
        borderColor: isCurrent ? "var(--primary-accent)" : undefined,
      }}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Index or Play icon */}
      <div
        onClick={handlePlayClick}
        style={{
          width: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {isCurrent && isPlaying ? (
          <div className="playing-indicator" style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "16px" }}>
            <span style={{ width: "2px" }} />
            <span style={{ width: "2px" }} />
            <span style={{ width: "2px" }} />
          </div>
        ) : (
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: isCurrent ? "var(--primary-accent)" : "var(--text-muted)",
            }}
          >
            {index !== undefined ? index + 1 : <Play size={16} />}
          </span>
        )}
      </div>

      {/* Artwork */}
      <div
        onClick={handlePlayClick}
        style={{
          position: "relative",
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          overflow: "hidden",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <img
          src={song.thumbnail}
          alt={song.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* Title & Artist */}
      <div
        onClick={handlePlayClick}
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
      >
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: isCurrent ? "var(--primary-accent)" : "#ffffff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.title}
        </div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--text-dim)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.artist}
        </div>
      </div>

      {/* Album name if wide */}
      {song.album && (
        <div
          style={{
            flex: 0.8,
            minWidth: 0,
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "none",
          }}
          className="desktop-only"
        >
          {song.album}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          onClick={() => toggleFavorite(song)}
          className="btn-icon"
          title={isLiked ? "Unlike" : "Like"}
          style={{ padding: "6px" }}
        >
          <Heart
            size={17}
            color={isLiked ? "var(--primary-accent)" : "var(--text-muted)"}
            fill={isLiked ? "var(--primary-accent)" : "none"}
          />
        </button>

        {song.durationText && (
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", minWidth: "40px", textAlign: "right" }}>
            {song.durationText}
          </span>
        )}

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="btn-icon"
          style={{ padding: "6px" }}
          title="More options"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* Context Menu Dropdown */}
      {showMenu && (
        <div
          className="glass-panel"
          style={{
            position: "absolute",
            right: "12px",
            top: "42px",
            zIndex: 60,
            borderRadius: "var(--radius-md)",
            padding: "6px",
            minWidth: "180px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.7)",
          }}
        >
          <button
            onClick={() => {
              addToQueue(song);
              setShowMenu(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "0.85rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ListPlus size={16} />
            <span>Add to Queue</span>
          </button>

          {/* Add to Playlist sub-options */}
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => {
                addSongToPlaylist(pl.id, song);
                setShowMenu(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "0.85rem",
                borderRadius: "6px",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Plus size={16} />
              <span>Add to {pl.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
