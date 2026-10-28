"use client";

import React, { useState } from "react";
import { ListPlus, X } from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePlaylistModal({ isOpen, onClose }: CreatePlaylistModalProps) {
  const { createPlaylist } = useLibrary();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createPlaylist(name, description);
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 130,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "var(--radius-xl)",
          padding: "28px",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ListPlus size={22} color="var(--primary-accent)" />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
              New Playlist
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "var(--text-dim)",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Playlist Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Late Night Vibes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-glass)",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.8rem",
                color: "var(--text-dim)",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Description (Optional)
            </label>
            <textarea
              placeholder="Give your playlist a vibe description..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-glass)",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              className="glass-pill"
              style={{ padding: "10px 18px", color: "var(--text-dim)", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
