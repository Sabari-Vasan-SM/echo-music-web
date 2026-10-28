"use client";

import React, { use, useEffect, useState } from "react";
import { User, Play, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Song, SectionItem } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { SongRow } from "@/components/SongRow";
import { CardItem } from "@/components/CardItem";

export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { playSong } = usePlayer();
  const [artistData, setArtistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/yt/artist?id=${encodeURIComponent(id)}`)
      .then((res) => res.json())
      .then((data) => setArtistData(data))
      .catch((err) => console.warn("Artist fetch error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "80px 48px", textAlign: "center", color: "var(--text-muted)" }}>
        Loading artist profile...
      </div>
    );
  }

  if (!artistData || !artistData.name) {
    return (
      <div style={{ padding: "80px 48px", textAlign: "center", color: "var(--text-muted)" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "8px" }}>Artist not found</h2>
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

      {/* Header Profile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
            flexShrink: 0,
            border: "2px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <img
            src={artistData.thumbnail}
            alt={artistData.name}
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
            VERIFIED ARTIST
          </span>
          <h1
            className="brand-title"
            style={{ fontSize: "3rem", fontWeight: 800, color: "#fff", lineHeight: 1.15, margin: "6px 0" }}
          >
            {artistData.name}
          </h1>

          {artistData.topSongs.length > 0 && (
            <button
              onClick={() => playSong(artistData.topSongs[0], artistData.topSongs)}
              className="btn-primary"
              style={{ padding: "10px 24px", fontSize: "0.95rem", marginTop: "12px" }}
            >
              <Play size={18} fill="#fff" />
              <span>Play Top Tracks</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Tracks */}
      {artistData.topSongs.length > 0 && (
        <section style={{ marginBottom: "48px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "18px" }}>
            Popular Tracks
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {artistData.topSongs.slice(0, 10).map((song: Song, idx: number) => (
              <SongRow
                key={`${song.id}-${idx}`}
                song={song}
                index={idx}
                playlistContext={artistData.topSongs}
              />
            ))}
          </div>
        </section>
      )}

      {/* Albums / Discography */}
      {artistData.albums && artistData.albums.length > 0 && (
        <section>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff", marginBottom: "18px" }}>
            Discography & Albums
          </h2>
          <div
            style={{
              display: "flex",
              gap: "16px",
              overflowX: "auto",
              paddingBottom: "16px",
            }}
          >
            {artistData.albums.map((album: SectionItem, idx: number) => (
              <CardItem key={`${album.id || album.title}-${idx}`} item={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
