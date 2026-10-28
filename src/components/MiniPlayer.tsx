"use client";

import React from "react";
import {
  Heart,
  ListMusic,
  Maximize2,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { useLibrary } from "@/context/LibraryContext";

export function MiniPlayer() {
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
    togglePlayPause,
    seekTo,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setIsFullscreenPlayerOpen,
    setIsQueueDrawerOpen,
    setIsDnaModalOpen,
    setActiveTabInPlayer,
  } = usePlayer();

  const { isFavorite, toggleFavorite } = useLibrary();

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLiked = isFavorite(currentSong.id);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekRatio = Math.max(0, Math.min(1, clickX / width));
    seekTo(seekRatio * duration);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "16px",
        left: "calc(var(--sidebar-width) + 16px)",
        right: "16px",
        height: "var(--player-height)",
        zIndex: 50,
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      }}
      className="glass-panel"
    >
      {/* Top 3px Clickable Progress Bar */}
      <div
        onClick={handleProgressBarClick}
        style={{
          width: "100%",
          height: "4px",
          background: "rgba(255, 255, 255, 0.1)",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progressPercent}%`,
            background: "var(--primary-gradient)",
            boxShadow: "0 0 8px var(--primary-glow)",
            transition: "width 0.1s linear",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "calc(100% - 4px)",
          padding: "0 20px",
        }}
      >
        {/* Left: Track Information */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: "220px",
            maxWidth: "320px",
          }}
        >
          <div
            onClick={() => setIsFullscreenPlayerOpen(true)}
            style={{
              position: "relative",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              overflow: "hidden",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
              flexShrink: 0,
            }}
          >
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {/* Ambient backlight glow */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.2)",
                opacity: 0,
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
            />
          </div>

          <div style={{ overflow: "hidden" }}>
            <div
              onClick={() => setIsFullscreenPlayerOpen(true)}
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#ffffff",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
              }}
            >
              {currentSong.title}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-dim)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>{currentSong.artist}</span>
              {currentSong.album && (
                <>
                  <span>•</span>
                  <span>{currentSong.album}</span>
                </>
              )}
            </div>
          </div>

          {/* Like Button */}
          <button
            onClick={() => toggleFavorite(currentSong)}
            className="btn-icon"
            title={isLiked ? "Remove from Liked" : "Like song"}
          >
            <Heart
              size={18}
              color={isLiked ? "var(--primary-accent)" : "currentColor"}
              fill={isLiked ? "var(--primary-accent)" : "none"}
            />
          </button>
        </div>

        {/* Center: Controls & Playback Slider */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            flex: 1,
            maxWidth: "520px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={toggleShuffle}
              className="btn-icon"
              title="Shuffle"
              style={{ color: isShuffled ? "var(--primary-accent)" : "var(--text-dim)" }}
            >
              <Shuffle size={17} />
            </button>

            <button onClick={previousTrack} className="btn-icon" title="Previous">
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlayPause}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "var(--primary-gradient)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 14px var(--primary-glow)",
                transition: "var(--transition-smooth)",
              }}
            >
              {isPlaying ? (
                <Pause size={20} color="#fff" fill="#fff" />
              ) : (
                <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: "2px" }} />
              )}
            </button>

            <button onClick={nextTrack} className="btn-icon" title="Next">
              <SkipForward size={20} />
            </button>

            <button
              onClick={cycleRepeatMode}
              className="btn-icon"
              title={`Repeat: ${repeatMode}`}
              style={{
                color: repeatMode !== "off" ? "var(--primary-accent)" : "var(--text-dim)",
                position: "relative",
              }}
            >
              <RotateCcw size={17} />
              {repeatMode === "one" && (
                <span
                  style={{
                    position: "absolute",
                    fontSize: "9px",
                    fontWeight: 800,
                    top: "3px",
                    right: "3px",
                  }}
                >
                  1
                </span>
              )}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              style={{ flex: 1, height: "4px" }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Auxiliary Actions & Volume */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: "220px",
            justifyContent: "flex-end",
          }}
        >
          {/* Music DNA Quick Button */}
          <button
            onClick={() => setIsDnaModalOpen(true)}
            className="btn-icon"
            title="Music DNA (Genius & Wikipedia insights)"
          >
            <Sparkles size={18} color="var(--primary-accent)" />
          </button>

          {/* Synced Lyrics Fullscreen Toggle */}
          <button
            onClick={() => {
              setActiveTabInPlayer("lyrics");
              setIsFullscreenPlayerOpen(true);
            }}
            className="btn-icon"
            title="Synced Lyrics"
          >
            <Mic2 size={18} />
          </button>

          {/* Queue Drawer Button */}
          <button
            onClick={() => setIsQueueDrawerOpen(true)}
            className="btn-icon"
            title="Up Next Queue"
            style={{ position: "relative" }}
          >
            <ListMusic size={18} />
            {queue.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  background: "var(--primary-accent)",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 800,
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {queue.length}
              </span>
            )}
          </button>

          {/* Volume Control */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={toggleMute} className="btn-icon" title={isMuted ? "Unmute" : "Mute"}>
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ width: "70px", height: "4px" }}
            />
          </div>

          {/* Fullscreen Expand */}
          <button
            onClick={() => setIsFullscreenPlayerOpen(true)}
            className="btn-icon"
            title="Expand Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
