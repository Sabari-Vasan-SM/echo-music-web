"use client";

import React from "react";
import { Sliders, X, Check, Activity } from "lucide-react";
import { usePlayer, EQ_PRESETS } from "@/context/PlayerContext";

export function EqualizerModal() {
  const {
    isEqualizerOpen,
    setIsEqualizerOpen,
    equalizerBands,
    equalizerPreset,
    setEqualizerBandGain,
    applyEqualizerPreset,
  } = usePlayer();

  if (!isEqualizerOpen) return null;

  const presetLabels: Record<string, string> = {
    flat: "Flat / Neutral",
    "bass-boost": "Bass Boost",
    "vocal-boost": "Vocal Clarity",
    electronic: "Electronic",
    rock: "Rock & Metal",
    pop: "Pop & Dance",
    acoustic: "Acoustic",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={() => setIsEqualizerOpen(false)}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "540px",
          borderRadius: "var(--radius-xl)",
          padding: "28px",
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
            marginBottom: "24px",
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
              <Activity size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
                Echo Audio DSP
              </h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                5-Band Dynamic Equalizer & Spatial Acoustics
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEqualizerOpen(false)}
            className="btn-icon"
            style={{ width: "36px", height: "36px" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Preset Chips */}
        <div style={{ marginBottom: "28px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              fontWeight: 700,
              marginBottom: "10px",
            }}
          >
            Acoustic Presets
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {Object.keys(EQ_PRESETS).map((pKey) => {
              const isActive = equalizerPreset === pKey;
              return (
                <button
                  key={pKey}
                  onClick={() => applyEqualizerPreset(pKey)}
                  className={`glass-pill ${isActive ? "active" : ""}`}
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {isActive && <Check size={12} />}
                  <span>{presetLabels[pKey] || pKey}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Band Interactive Faders */}
        <div
          className="glass-card"
          style={{
            padding: "24px 16px",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            height: "220px",
            marginBottom: "20px",
          }}
        >
          {equalizerBands.map((band) => (
            <div
              key={band.frequency}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                height: "100%",
                width: "48px",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: band.gain > 0 ? "var(--primary-accent)" : "var(--text-dim)",
                }}
              >
                {band.gain > 0 ? `+${band.gain}` : band.gain}dB
              </span>

              {/* Vertical slider wrapper */}
              <div
                style={{
                  height: "120px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={band.gain}
                  onChange={(e) => setEqualizerBandGain(band.frequency, Number(e.target.value))}
                  style={{
                    transform: "rotate(-90deg)",
                    width: "110px",
                    height: "6px",
                  }}
                />
              </div>

              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                {band.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          Hardware Acceleration & ReplayGain Loudness Normalization enabled
        </div>
      </div>
    </div>
  );
}
