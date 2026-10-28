"use client";

import React, { useEffect, useState } from "react";
import { Play, Sparkles, TrendingUp, Music2, RefreshCw } from "lucide-react";
import { Song, HomeSection, SectionItem } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";
import { SongRow } from "@/components/SongRow";
import { CardItem } from "@/components/CardItem";

export default function HomePage() {
  const { playSong } = usePlayer();
  const [quickPicks, setQuickPicks] = useState<Song[]>([]);
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [moodChips, setMoodChips] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial home feed
  const loadHomeData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/yt/home");
      if (res.ok) {
        const data = await res.json();
        setQuickPicks(data.quickPicks || []);
        setSections(data.sections || []);
        setMoodChips(data.moodChips || []);
      }
    } catch (err) {
      console.error("Home feed fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
      {/* Top Hero Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "32px",
          position: "relative",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(237, 85, 100, 0.15)",
              border: "1px solid rgba(237, 85, 100, 0.3)",
              color: "var(--primary-accent)",
              fontSize: "0.8rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            <Sparkles size={14} />
            <span>Echo Music Experience</span>
          </div>
          <h1
            className="brand-title"
            style={{
              fontSize: "2.6rem",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.15,
            }}
          >
            {getGreeting()}
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1rem", marginTop: "6px" }}>
            Ad-free high fidelity streaming with synced lyrics and Music DNA
          </p>
        </div>

        <button
          onClick={loadHomeData}
          className="glass-pill"
          style={{
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-main)",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
          title="Refresh Feed"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Mood Chips Selector */}
      {moodChips.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "36px",
          }}
        >
          <button
            onClick={() => setSelectedMood(null)}
            className={`glass-pill ${selectedMood === null ? "active" : ""}`}
            style={{ padding: "8px 20px", fontSize: "0.85rem", cursor: "pointer", flexShrink: 0 }}
          >
            All
          </button>
          {moodChips.map((chip) => {
            const isActive = selectedMood === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedMood(isActive ? null : chip)}
                className={`glass-pill ${isActive ? "active" : ""}`}
                style={{
                  padding: "8px 20px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {chip}
              </button>
            );
          })}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
          <div className="spinner" />
          Connecting to Echo Music Network...
        </div>
      )}

      {/* Section 1: Quick Picks Grid */}
      {!loading && quickPicks.length > 0 && (
        <section style={{ marginBottom: "48px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingUp size={20} color="var(--primary-accent)" />
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>
                Quick Picks
              </h2>
            </div>
            <button
              onClick={() => playSong(quickPicks[0], quickPicks)}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              <Play size={16} fill="#fff" />
              <span>Play All</span>
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "12px",
            }}
          >
            {quickPicks.slice(0, 8).map((song, idx) => (
              <SongRow key={song.id} song={song} index={idx} playlistContext={quickPicks} />
            ))}
          </div>
        </section>
      )}

      {/* Section 2+: Carousels for Home Sections */}
      {!loading &&
        sections.map((section, idx) => (
          <section key={`${section.title}-${idx}`} style={{ marginBottom: "48px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>
                {section.title}
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                paddingBottom: "16px",
              }}
            >
              {section.items.map((item, itemIdx) => (
                <CardItem key={`${item.id || item.title}-${itemIdx}`} item={item} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
