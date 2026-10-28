"use client";

import React, { use, useEffect, useState } from "react";
import { Play, ListMusic, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { Song } from "@/types/music";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";
import { SongRow } from "@/components/SongRow";

export default function PlaylistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { playlists } = useLibrary();
  const { playSong } = usePlayer();

  const customPlaylist = playlists.find((p) => p.id === id);

  const [ytPlaylist, setYtPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(!customPlaylist);

  useEffect(() => {
    if (!customPlaylist && id) {
      setLoading(true);
      fetch(`/api/yt/playlist?id=${encodeURIComponent(id)}`)
        .then((res) => res.json())
        .then((data) => setYtPlaylist(data))
        .catch((err) => console.warn("Failed to fetch YT playlist:", err))
        .finally(() => setLoading(false));
    }
  }, [id, customPlaylist]);

  const playlistTitle = customPlaylist?.name || ytPlaylist?.title || "Playlist";
  const playlistSubtitle = customPlaylist
    ? `${customPlaylist.songs.length} tracks • Custom Playlist`
    : ytPlaylist
    ? `${ytPlaylist.author || "YouTube Music"} • ${ytPlaylist.tracks?.length || 0} tracks`
    : "";
  const playlistThumbnail = customPlaylist?.coverUrl || ytPlaylist?.thumbnail;
  const tracks: Song[] = customPlaylist?.songs || ytPlaylist?.tracks || [];

  if (loading) {
    return (
      <div style={{ padding: "80px 48px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading playlist...
      </div>
    );
  }

  if (!customPlaylist && (!ytPlaylist || tracks.length === 0)) {
    return (
      <div style={{ padding: "80px 48px", textAlign: "center", color: "var(--text-muted)" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "8px" }}>Playlist not found</h2>
        <p style={{ color: "var(--text-dim)", marginBottom: "20px" }}>The requested playlist could not be loaded.</p>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Back button */}
      <Link
        href="/"
        className="glass-pill"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          fontSize: "0.85rem",
          textDecoration: "none",
          color: "var(--text-dim)",
          marginBottom: "24px",
        }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </Link>

      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "28px",
          marginBottom: "36px",
        }}
      >
        <div
          style={{
            width: "180px",
            height: "180px",
            borderRadius: "24px",
            background: playlistThumbnail
              ? `url(${playlistThumbnail}) center/cover`
              : "rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {!playlistThumbnail && <ListMusic size={64} color="var(--text-muted)" />}
        </div>

        <div>
          <span
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--primary-accent)",
              fontWeight: 700,
            }}
          >
            PLAYLIST
          </span>
          <h1
            className="brand-title"
            style={{ fontSize: "2.8rem", fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "6px 0" }}
          >
            {playlistTitle}
          </h1>
          <div style={{ fontSize: "0.95rem", color: "var(--text-dim)", marginBottom: "8px" }}>
            {playlistSubtitle}
          </div>
          {ytPlaylist?.description && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "12px", maxWidth: "600px" }}>
              {ytPlaylist.description}
            </p>
          )}

          {tracks.length > 0 && (
            <button
              onClick={() => playSong(tracks[0], tracks)}
              className="btn-primary"
              style={{ padding: "10px 24px", fontSize: "0.95rem", marginTop: "10px" }}
            >
              <Play size={18} fill="#fff" />
              <span>Play All</span>
            </button>
          )}
        </div>
      </div>

      {/* Tracks */}
      {tracks.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {tracks.map((song, idx) => (
            <SongRow
              key={`${song.id}-${idx}`}
              song={song}
              index={idx}
              playlistContext={tracks}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          This playlist has no songs yet.
        </div>
      )}
    </div>
  );
}
