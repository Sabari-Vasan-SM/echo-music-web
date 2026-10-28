"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ListMusic, History, Download, Play, Plus, Trash2 } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { SongRow } from "@/components/SongRow";
import { CreatePlaylistModal } from "@/components/CreatePlaylistModal";

export default function LibraryPage() {
  const { favorites, playlists, history, clearHistory, deletePlaylist } = useLibrary();
  const { playSong } = usePlayer();
  const [activeTab, setActiveTab] = useState<"favorites" | "playlists" | "history">("favorites");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            className="brand-title"
            style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff", marginBottom: "6px" }}
          >
            Your Library
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
            Liked tracks, custom collections, and playback history
          </p>
        </div>

        {activeTab === "playlists" && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: "0.85rem" }}
          >
            <Plus size={16} />
            <span>New Playlist</span>
          </button>
        )}

        {activeTab === "history" && history.length > 0 && (
          <button
            onClick={clearHistory}
            className="glass-pill"
            style={{ padding: "8px 16px", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-dim)" }}
          >
            Clear History
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "32px", overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`glass-pill ${activeTab === "favorites" ? "active" : ""}`}
          style={{ padding: "8px 20px", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Heart size={15} />
          <span>Liked Songs ({favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("playlists")}
          className={`glass-pill ${activeTab === "playlists" ? "active" : ""}`}
          style={{ padding: "8px 20px", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <ListMusic size={15} />
          <span>Playlists ({playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`glass-pill ${activeTab === "history" ? "active" : ""}`}
          style={{ padding: "8px 20px", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <History size={15} />
          <span>History ({history.length})</span>
        </button>
      </div>

      {/* Tab 1: Liked Songs */}
      {activeTab === "favorites" && (
        <div>
          {favorites.length > 0 ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <button
                  onClick={() => playSong(favorites[0], favorites)}
                  className="btn-primary"
                  style={{ padding: "8px 18px", fontSize: "0.9rem" }}
                >
                  <Play size={16} fill="#fff" />
                  <span>Play Liked Songs</span>
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {favorites.map((song, idx) => (
                  <SongRow key={song.id} song={song} index={idx} playlistContext={favorites} />
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
              <Heart size={44} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <p style={{ fontSize: "1.1rem", color: "#fff", fontWeight: 600 }}>No liked tracks yet</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginTop: "4px" }}>
                Tap the heart on any song to save it to your library!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Custom Playlists */}
      {activeTab === "playlists" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {playlists.map((pl) => (
            <div
              key={pl.id}
              className="glass-card"
              style={{
                borderRadius: "var(--radius-xl)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <Link
                href={`/playlist/${pl.id}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "18px",
                    background: pl.coverUrl
                      ? `url(${pl.coverUrl}) center/cover`
                      : "rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {!pl.coverUrl && <ListMusic size={40} color="var(--text-muted)" />}
                </div>

                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                  {pl.name}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                  {pl.songs.length} tracks
                </div>
              </Link>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid var(--border-glass)",
                }}
              >
                {pl.songs.length > 0 ? (
                  <button
                    onClick={() => playSong(pl.songs[0], pl.songs)}
                    className="btn-primary"
                    style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                  >
                    <Play size={14} fill="#fff" />
                    <span>Play</span>
                  </button>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Empty</span>
                )}

                <button
                  onClick={() => deletePlaylist(pl.id)}
                  className="btn-icon"
                  style={{ padding: "6px" }}
                  title="Delete Playlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === "history" && (
        <div>
          {history.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {history.map((song, idx) => (
                <SongRow key={`${song.id}-${idx}`} song={song} index={idx} playlistContext={history} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
              <History size={44} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <p style={{ fontSize: "1.1rem", color: "#fff", fontWeight: 600 }}>No playback history yet</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-dim)", marginTop: "4px" }}>
                Tracks you play will be recorded here for easy listening!
              </p>
            </div>
          )}
        </div>
      )}

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
