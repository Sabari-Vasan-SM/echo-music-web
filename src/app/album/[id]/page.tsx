"use client";

import React, { use, useEffect, useState } from "react";
import { Disc, Play, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Song } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { SongRow } from "@/components/SongRow";

export default function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { playSong } = usePlayer();
  const [albumData, setAlbumData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/yt/album?id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => setAlbumData(data))
      .catch((err) => console.warn("Album fetch error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "80px 48px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading album information...
      </div>
    );
  }

  if (!albumData || !albumData.tracks || albumData.tracks.length === 0) {
    return (
      <div style={{ padding: "80px 48px", textAlign: "center", color: "var(--text-muted)" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "8px" }}>Album not found</h2>
        <Link href="/" className="btn-primary" style={{ marginTop: "16px", textDecoration: "none" }}>
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

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "32px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
            flexShrink: 0,
          }}
        >
          <img
            src={albumData.thumbnail}
            alt={albumData.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
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
            ALBUM
          </span>
          <h1
            className="brand-title"
            style={{ fontSize: "2.8rem", fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "6px 0" }}
          >
            {albumData.title}
          </h1>
          <div style={{ fontSize: "1.1rem", color: "var(--text-dim)", marginBottom: "8px" }}>
            {albumData.artist}
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "18px" }}>
            {albumData.tracks.length} tracks • Echo Music Master Quality
          </div>

          <button
            onClick={() => playSong(albumData.tracks[0], albumData.tracks)}
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: "0.95rem" }}
          >
            <Play size={18} fill="#fff" />
            <span>Play Album</span>
          </button>
        </div>
      </div>

      {/* Track List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {albumData.tracks.map((song: Song, idx: number) => (
          <SongRow
            key={`${song.id}-${idx}`}
            song={song}
            index={idx}
            playlistContext={albumData.tracks}
          />
        ))}
      </div>
    </div>
  );
}
