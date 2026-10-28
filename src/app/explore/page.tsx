"use client";

import React, { useState } from "react";
import { Compass, Flame, Headphones, Zap, Heart, Moon, Coffee, Dumbbell, Car, Sparkles } from "lucide-react";
import { Song } from "@/types/music";
import { SongRow } from "@/components/SongRow";

interface MoodCategory {
  name: string;
  query: string;
  color: string;
  icon: any;
}

export default function ExplorePage() {
  const [activeMood, setActiveMood] = useState<string>("Trending");
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  const moodCategories: MoodCategory[] = [
    { name: "Trending", query: "Top Hits 2026", color: "linear-gradient(135deg, #f857a6, #ff5858)", icon: Flame },
    { name: "Chill & Relax", query: "Lo-Fi Beats Chill", color: "linear-gradient(135deg, #4facfe, #00f2fe)", icon: Coffee },
    { name: "Workout", query: "Workout Motivation EDM", color: "linear-gradient(135deg, #fa709a, #fee140)", icon: Dumbbell },
    { name: "Focus & Study", query: "Deep Focus Ambient Study", color: "linear-gradient(135deg, #667eea, #764ba2)", icon: Headphones },
    { name: "Party & Dance", query: "Party Club Bangers", color: "linear-gradient(135deg, #ff0844, #ffb199)", icon: Zap },
    { name: "Romance", query: "Romantic Acoustic Love", color: "linear-gradient(135deg, #b224ef, #7579ff)", icon: Heart },
    { name: "Sleep & Calm", query: "Sleep Ambient Delta Waves", color: "linear-gradient(135deg, #2b5876, #4e4376)", icon: Moon },
    { name: "Road Trip", query: "Road Trip Singalongs", color: "linear-gradient(135deg, #f12711, #f5af19)", icon: Car },
  ];

  const handleSelectMood = async (mood: MoodCategory) => {
    setActiveMood(mood.name);
    setLoading(true);

    try {
      const res = await fetch(`/api/yt/search?q=${encodeURIComponent(mood.query)}&filter=songs`);
      if (res.ok) {
        const data = await res.json();
        setSongs(data.songs || []);
      }
    } catch (err) {
      console.error("Failed to load mood tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load default on first render if empty
  React.useEffect(() => {
    handleSelectMood(moodCategories[0]);
  }, []);

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
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
          <Compass size={14} />
          <span>Curated Moods & Channels</span>
        </div>
        <h1
          className="brand-title"
          style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff", lineHeight: 1.15 }}
        >
          Explore & Moods
        </h1>
        <p style={{ color: "var(--text-dim)", fontSize: "1rem", marginTop: "6px" }}>
          Soundtracks crafted for every feeling, moment, and vibe
        </p>
      </div>

      {/* Mood Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "44px",
        }}
      >
        {moodCategories.map((mood) => {
          const Icon = mood.icon;
          const isActive = activeMood === mood.name;

          return (
            <div
              key={mood.name}
              onClick={() => handleSelectMood(mood)}
              className="glass-card"
              style={{
                height: "120px",
                borderRadius: "var(--radius-xl)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                cursor: "pointer",
                background: isActive ? mood.color : "rgba(255, 255, 255, 0.04)",
                borderColor: isActive ? "rgba(255, 255, 255, 0.3)" : undefined,
                boxShadow: isActive ? "0 12px 30px rgba(0, 0, 0, 0.5)" : undefined,
                transition: "var(--transition-smooth)",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: isActive ? "rgba(255, 255, 255, 0.25)" : mood.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} color="#fff" />
              </div>

              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {mood.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mood Songs Section */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={20} color="var(--primary-accent)" />
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>
              {activeMood} Mix ({songs.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            Tuning into {activeMood}...
          </div>
        ) : songs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {songs.map((song, idx) => (
              <SongRow key={song.id} song={song} index={idx} playlistContext={songs} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)" }}>
            No tracks found for this mood.
          </div>
        )}
      </div>
    </div>
  );
}
