"use client";

import React from "react";
import { ListMusic, Trash2, X, Play } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";

export function QueueDrawer() {
  const {
    queue,
    queueIndex,
    isQueueDrawerOpen,
    setIsQueueDrawerOpen,
    playSong,
    removeFromQueue,
    clearQueue,
  } = usePlayer();

  if (!isQueueDrawerOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={() => setIsQueueDrawerOpen(false)}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          borderLeft: "1px solid var(--border-glass)",
          boxShadow: "-16px 0 40px rgba(0, 0, 0, 0.7)",
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
            <ListMusic size={22} color="var(--primary-accent)" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
              Up Next ({queue.length})
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {queue.length > 1 && (
              <button
                onClick={clearQueue}
                className="btn-icon"
                title="Clear upcoming queue"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={() => setIsQueueDrawerOpen(false)}
              className="btn-icon"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Queue List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            paddingRight: "4px",
          }}
        >
          {queue.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-muted)",
                paddingTop: "60px",
                fontSize: "0.9rem",
              }}
            >
              Queue is empty. Play any song to get started!
            </div>
          ) : (
            queue.map((song, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${song.id}-${idx}`}
                  className="glass-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 12px",
                    background: isCurrent ? "rgba(237, 85, 100, 0.16)" : undefined,
                    borderColor: isCurrent ? "var(--primary-accent)" : undefined,
                    position: "relative",
                  }}
                >
                  <div
                    onClick={() => playSong(song)}
                    style={{
                      position: "relative",
                      width: "44px",
                      height: "44px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {isCurrent && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0, 0, 0, 0.5)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Play size={16} color="#fff" fill="#fff" />
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => playSong(song)}
                    style={{ flex: 1, overflow: "hidden", cursor: "pointer" }}
                  >
                    <div
                      style={{
                        fontSize: "0.9rem",
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
                        fontSize: "0.78rem",
                        color: "var(--text-dim)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {song.artist}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {song.durationText && (
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {song.durationText}
                      </span>
                    )}
                    <button
                      onClick={() => removeFromQueue(idx)}
                      className="btn-icon"
                      style={{ padding: "4px" }}
                      title="Remove from queue"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
