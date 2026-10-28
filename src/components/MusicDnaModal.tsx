"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, X, BookOpen, User, Disc } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

export function MusicDnaModal() {
  const { isDnaModalOpen, setIsDnaModalOpen, currentSong } = usePlayer();
  const [dnaData, setDnaData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isDnaModalOpen && currentSong) {
      setLoading(true);
      fetch(
        `/api/dna?track=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(
          currentSong.artist
        )}`
      )
        .then((res) => res.json())
        .then((data) => setDnaData(data))
        .catch((err) => console.warn("DNA load error:", err))
        .finally(() => setLoading(false));
    }
  }, [isDnaModalOpen, currentSong]);

  if (!isDnaModalOpen || !currentSong) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={() => setIsDnaModalOpen(false)}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "600px",
          maxHeight: "85vh",
          borderRadius: "var(--radius-xl)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--primary-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                Music DNA Insights
              </h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                Genius Annotations & Wikipedia Intelligence
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDnaModalOpen(false)}
            className="btn-icon"
            style={{ width: "36px", height: "36px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            paddingRight: "6px",
          }}
        >
          {/* Track Summary Bar */}
          <div
            className="glass-card"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px",
            }}
          >
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover" }}
            />
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                {currentSong.title}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                {currentSong.artist} {dnaData?.album ? `• ${dnaData.album}` : ""}
              </div>
              {dnaData?.releaseDate && (
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Released: {dnaData.releaseDate}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)" }}>
              Analyzing track meaning & artist history...
            </div>
          ) : (
            <>
              {/* Section 1: Song Meaning / Annotations */}
              <div className="glass-card" style={{ padding: "18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <BookOpen size={18} color="var(--primary-accent)" />
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                    Meaning & Background
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  {dnaData?.meaning || "No meaning annotations available."}
                </p>
              </div>

              {/* Section 2: Artist Biography */}
              <div className="glass-card" style={{ padding: "18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <User size={18} color="var(--primary-accent)" />
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                    About {currentSong.artist}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
                    color: "rgba(255, 255, 255, 0.85)",
                  }}
                >
                  {dnaData?.bio || "No biography available."}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
