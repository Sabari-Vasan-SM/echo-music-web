"use client";

import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { SectionItem } from "@/types/music";
import { usePlayer } from "@/context/PlayerContext";

interface CardItemProps {
  item: SectionItem;
}

export function CardItem({ item }: CardItemProps) {
  const { playSong } = usePlayer();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.type === "song" && item.id) {
      playSong({
        id: item.id,
        title: item.title,
        artist: item.artist || item.subtitle || "Unknown Artist",
        thumbnail: item.thumbnail,
      });
    }
  };

  const getHref = () => {
    if (!item.id) return "#";
    if (item.type === "album") return `/album/${item.id}`;
    if (item.type === "artist") return `/artist/${item.id}`;
    if (item.type === "playlist") return `/playlist/${item.id}`;
    return "#";
  };

  const isSong = item.type === "song";

  return (
    <Link
      href={getHref()}
      onClick={(e) => {
        if (isSong) {
          handlePlayClick(e);
        }
      }}
      className="glass-card"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "12px",
        borderRadius: "var(--radius-lg)",
        textDecoration: "none",
        width: "180px",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Artwork container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "100%",
          borderRadius: item.type === "artist" ? "50%" : "var(--radius-md)",
          overflow: "hidden",
          marginBottom: "12px",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.4)",
        }}
      >
        <img
          src={item.thumbnail}
          alt={item.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Hover play button overlay */}
        <div
          onClick={handlePlayClick}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.2s ease",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "var(--primary-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px var(--primary-glow)",
              transform: "scale(0.9)",
              transition: "transform 0.15s ease",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.85)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Play size={20} color="#fff" fill="#fff" style={{ marginLeft: "2px" }} />
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "0.92rem",
          fontWeight: 700,
          color: "#ffffff",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          marginBottom: "4px",
        }}
      >
        {item.title}
      </div>

      {/* Subtitle / Type */}
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--text-dim)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textTransform: item.type === "artist" ? "capitalize" : "none",
        }}
      >
        {item.subtitle || item.type}
      </div>
    </Link>
  );
}
