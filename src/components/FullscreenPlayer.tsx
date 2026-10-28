"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  ListMusic,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useLibrary } from "@/context/LibraryContext";

export function FullscreenPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    queue,
    queueIndex,
    lyricsData,
    lyricsLoading,
    currentLyricIndex,
    isFullscreenPlayerOpen,
    activeTabInPlayer,
    togglePlayPause,
    seekTo,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setIsFullscreenPlayerOpen,
    setIsEqualizerOpen,
    setIsDnaModalOpen,
    setActiveTabInPlayer,
    playSong,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useLibrary();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [dnaData, setDnaData] = useState<any>(null);
  const [dnaLoading, setDnaLoading] = useState<boolean>(false);

  // Auto-scroll active lyric line into center view
  useEffect(() => {
    if (activeTabInPlayer === "lyrics" && currentLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[currentLyricIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentLyricIndex, activeTabInPlayer]);

  // Fetch Music DNA when tab is activated or song changes
  useEffect(() => {
    if (activeTabInPlayer === "dna" && currentSong) {
      setDnaLoading(true);
      fetch(`/api/dna?track=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(currentSong.artist)}`)
        .then((res) => res.json())
        .then((data) => setDnaData(data))
        .catch((err) => console.warn("Failed to load DNA:", err))
        .finally(() => setDnaLoading(false));
    }
  }, [activeTabInPlayer, currentSong]);

  if (!isFullscreenPlayerOpen || !currentSong) return null;

  const isLiked = isFavorite(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "#08090c",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Dynamic blurred ambient background from album artwork */}
      <div
        style={{
          position: "absolute",
          inset: "-60px",
          backgroundImage: `url(${currentSong.thumbnail})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(90px) saturate(220%) brightness(0.28)",
          transform: "scale(1.2)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Dark overlay scrim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 30%, rgba(20, 20, 30, 0.4) 0%, rgba(8, 9, 12, 0.88) 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Top Bar Header */}
      <header
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 32px",
        }}
      >
        <button
          onClick={() => setIsFullscreenPlayerOpen(false)}
          className="btn-icon"
          style={{ width: "42px", height: "42px", background: "rgba(255, 255, 255, 0.08)" }}
          title="Minimize"
        >
          <ChevronDown size={24} />
        </button>

        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            PLAYING FROM ECHO QUEUE
          </span>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            <span>{currentSong.album || currentSong.artist}</span>
            <span
              style={{
                fontSize: "0.65rem",
                padding: "2px 8px",
                borderRadius: "999px",
                background: "rgba(237, 85, 100, 0.2)",
                color: "var(--primary-accent)",
                fontWeight: 700,
                border: "1px solid rgba(237, 85, 100, 0.3)",
              }}
            >
              LOSSLESS
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => setIsEqualizerOpen(true)}
            className="btn-icon"
            style={{ width: "42px", height: "42px", background: "rgba(255, 255, 255, 0.08)" }}
            title="DSP & Equalizer"
          >
            <Sliders size={20} />
          </button>
          <button
            onClick={() => setIsDnaModalOpen(true)}
            className="btn-icon"
            style={{ width: "42px", height: "42px", background: "rgba(255, 255, 255, 0.08)" }}
            title="Music DNA"
          >
            <Sparkles size={20} color="var(--primary-accent)" />
          </button>
        </div>
      </header>

      {/* View Mode Switcher Pills */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() => setActiveTabInPlayer("artwork")}
          className={`glass-pill ${activeTabInPlayer === "artwork" ? "active" : ""}`}
          style={{ padding: "8px 18px", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Canvas
        </button>
        <button
          onClick={() => setActiveTabInPlayer("lyrics")}
          className={`glass-pill ${activeTabInPlayer === "lyrics" ? "active" : ""}`}
          style={{ padding: "8px 18px", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Lyrics
        </button>
        <button
          onClick={() => setActiveTabInPlayer("dna")}
          className={`glass-pill ${activeTabInPlayer === "dna" ? "active" : ""}`}
          style={{ padding: "8px 18px", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Music DNA
        </button>
        <button
          onClick={() => setActiveTabInPlayer("queue")}
          className={`glass-pill ${activeTabInPlayer === "queue" ? "active" : ""}`}
          style={{ padding: "8px 18px", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Queue ({queue.length})
        </button>
      </div>

      {/* Main Content Area */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 32px",
          overflowY: "auto",
        }}
      >
        {/* Tab 1: Artwork & Dynamic Canvas */}
        {activeTabInPlayer === "artwork" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              maxWidth: "460px",
              width: "100%",
            }}
          >
            {/* Album Cover Art */}
            <div
              style={{
                position: "relative",
                width: "min(380px, 75vw)",
                height: "min(380px, 75vw)",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow:
                  "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.12)",
              }}
            >
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              {/* Dynamic subtle audio visualizer simulation on artwork hover */}
              {isPlaying && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "16px",
                    right: "16px",
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "3px",
                    height: "22px",
                    padding: "6px 10px",
                    borderRadius: "12px",
                    background: "rgba(0, 0, 0, 0.5)",
                    backdropFilter: "blur(8px)",
                  }}
                  className="playing-indicator"
                >
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            {/* Song Meta & Fast Actions */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 8px",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <h2
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentSong.title}
                </h2>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "rgba(255, 255, 255, 0.75)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {currentSong.artist}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => toggleFavorite(currentSong)}
                  className="btn-icon"
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.08)",
                  }}
                  title="Favorite"
                >
                  <Heart
                    size={24}
                    color={isLiked ? "var(--primary-accent)" : "#fff"}
                    fill={isLiked ? "var(--primary-accent)" : "none"}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Synchronized Lyrics */}
        {activeTabInPlayer === "lyrics" && (
          <div
            ref={lyricsContainerRef}
            style={{
              width: "100%",
              maxWidth: "760px",
              height: "100%",
              overflowY: "auto",
              padding: "40px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              textAlign: "left",
            }}
          >
            {lyricsLoading ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-dim)",
                }}
              >
                Loading lyrics...
              </div>
            ) : lyricsData?.synced && lyricsData.lines.length > 0 ? (
              lyricsData.lines.map((line, idx) => {
                const isActive = idx === currentLyricIndex;
                const isPast = idx < currentLyricIndex;

                return (
                  <div
                    key={idx}
                    onClick={() => seekTo(line.timeSec)}
                    style={{
                      cursor: "pointer",
                      fontSize: isActive ? "2.1rem" : "1.6rem",
                      fontWeight: isActive ? 800 : 600,
                      color: isActive
                        ? "#ffffff"
                        : isPast
                        ? "rgba(255, 255, 255, 0.45)"
                        : "rgba(255, 255, 255, 0.25)",
                      transform: isActive ? "scale(1.02) translateX(8px)" : "none",
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      textShadow: isActive
                        ? "0 4px 24px rgba(255, 255, 255, 0.4)"
                        : "none",
                      lineHeight: 1.35,
                    }}
                  >
                    {line.text}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: "1.2rem",
                  lineHeight: 1.8,
                  color: "rgba(255, 255, 255, 0.8)",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                {lyricsData?.plain || "No synchronized lyrics available for this track."}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Music DNA */}
        {activeTabInPlayer === "dna" && (
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              height: "100%",
              overflowY: "auto",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {dnaLoading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-dim)" }}>
                Uncovering Music DNA from Genius & Wikipedia...
              </div>
            ) : (
              <>
                <div
                  className="glass-card"
                  style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    <Sparkles size={20} color="var(--primary-accent)" />
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                      About the Song
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: 1.7,
                      color: "rgba(255, 255, 255, 0.85)",
                    }}
                  >
                    {dnaData?.meaning || "No deep track annotations available."}
                  </p>
                  {dnaData?.releaseDate && (
                    <div
                      style={{
                        marginTop: "16px",
                        fontSize: "0.85rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      Release Date: {dnaData.releaseDate}
                    </div>
                  )}
                </div>

                <div
                  className="glass-card"
                  style={{ padding: "24px", borderRadius: "var(--radius-xl)" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "14px",
                    }}
                  >
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                      Artist Biography: {currentSong.artist}
                    </h3>
                  </div>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: 1.7,
                      color: "rgba(255, 255, 255, 0.85)",
                    }}
                  >
                    {dnaData?.bio || "No biography found for this artist."}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 4: Queue */}
        {activeTabInPlayer === "queue" && (
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              height: "100%",
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {queue.map((song, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${song.id}-${idx}`}
                  onClick={() => playSong(song)}
                  className="glass-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "10px 14px",
                    cursor: "pointer",
                    background: isCurrent ? "rgba(237, 85, 100, 0.15)" : undefined,
                    borderColor: isCurrent ? "var(--primary-accent)" : undefined,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: isCurrent ? "var(--primary-accent)" : "var(--text-muted)",
                      width: "24px",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    style={{ width: "42px", height: "42px", borderRadius: "8px", objectFit: "cover" }}
                  />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: isCurrent ? "var(--primary-accent)" : "#fff",
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
                  {song.durationText && (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {song.durationText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Controls Section */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "20px 32px 36px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Scrubber slider */}
        <div>
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => seekTo(Number(e.target.value))}
            style={{ width: "100%", height: "6px" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              marginTop: "8px",
              fontWeight: 600,
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Button Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          <button
            onClick={toggleShuffle}
            className="btn-icon"
            style={{ color: isShuffled ? "var(--primary-accent)" : "rgba(255, 255, 255, 0.6)" }}
            title="Shuffle"
          >
            <Shuffle size={22} />
          </button>

          <button onClick={previousTrack} className="btn-icon" title="Previous Track">
            <SkipBack size={28} />
          </button>

          <button
            onClick={togglePlayPause}
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "var(--primary-gradient)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 8px 24px var(--primary-glow)",
              transition: "transform 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isPlaying ? (
              <Pause size={30} color="#fff" fill="#fff" />
            ) : (
              <Play size={30} color="#fff" fill="#fff" style={{ marginLeft: "3px" }} />
            )}
          </button>

          <button onClick={nextTrack} className="btn-icon" title="Next Track">
            <SkipForward size={28} />
          </button>

          <button
            onClick={cycleRepeatMode}
            className="btn-icon"
            style={{
              color: repeatMode !== "off" ? "var(--primary-accent)" : "rgba(255, 255, 255, 0.6)",
              position: "relative",
            }}
            title={`Repeat: ${repeatMode}`}
          >
            <RotateCcw size={22} />
            {repeatMode === "one" && (
              <span
                style={{
                  position: "absolute",
                  fontSize: "9px",
                  fontWeight: 800,
                  top: "2px",
                  right: "2px",
                }}
              >
                1
              </span>
            )}
          </button>
        </div>

        {/* Volume & Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginTop: "6px",
          }}
        >
          <button onClick={toggleMute} className="btn-icon">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: "160px", height: "4px" }}
          />
        </div>
      </footer>
    </div>
  );
}
