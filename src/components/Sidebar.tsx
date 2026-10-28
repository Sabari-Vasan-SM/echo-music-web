"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  Home,
  ListMusic,
  Plus,
  Radio,
  Search,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useLibrary } from "@/context/LibraryContext";
import { usePlayer } from "@/context/PlayerContext";

interface SidebarProps {
  onOpenCreatePlaylist: () => void;
}

export function Sidebar({ onOpenCreatePlaylist }: SidebarProps) {
  const pathname = usePathname();
  const { playlists, favorites } = useLibrary();
  const { setIsEqualizerOpen } = usePlayer();

  const mainNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Explore & Moods", href: "/explore", icon: Compass },
    { label: "Library", href: "/library", icon: ListMusic },
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        width: "var(--sidebar-width)",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border-glass)",
        padding: "24px 16px",
      }}
    >
      {/* Brand Header */}
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          textDecoration: "none",
          padding: "8px 12px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "var(--primary-gradient)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px var(--primary-glow)",
          }}
        >
          <Radio size={20} color="#fff" />
        </div>
        <div>
          <h1
            className="brand-title"
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.1,
            }}
          >
            ECHO
          </h1>
          <span
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              color: "var(--primary-accent)",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Music Player
          </span>
        </div>
      </Link>

      {/* Main Nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: "0.92rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "var(--text-dim)",
                background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                border: isActive
                  ? "1px solid rgba(255, 255, 255, 0.12)"
                  : "1px solid transparent",
                transition: "var(--transition-smooth)",
              }}
            >
              <Icon
                size={20}
                color={isActive ? "var(--primary-accent)" : "currentColor"}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Audio DSP / Equalizer trigger */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setIsEqualizerOpen(true)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-main)",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            transition: "var(--transition-smooth)",
          }}
          className="glass-pill"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sliders size={18} color="var(--primary-accent)" />
            <span>Equalizer & DSP</span>
          </div>
          <Sparkles size={14} color="var(--text-muted)" />
        </button>
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "var(--border-glass)",
          margin: "20px 0 16px 0",
        }}
      />

      {/* Playlists & Favorites Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px 8px 10px",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--text-muted)",
            fontWeight: 700,
          }}
        >
          My Playlists
        </span>
        <button
          onClick={onOpenCreatePlaylist}
          title="Create Playlist"
          className="btn-icon"
          style={{ padding: "4px" }}
        >
          <Plus size={16} />
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          paddingRight: "4px",
        }}
      >
        {/* Liked Songs Entry */}
        <Link
          href="/library?tab=favorites"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            textDecoration: "none",
            color: "var(--text-dim)",
            fontSize: "0.88rem",
            transition: "var(--transition-smooth)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #450af5, #c4efd9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heart size={14} color="#fff" fill="#fff" />
          </div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <div style={{ color: "#fff", fontWeight: 600 }}>Liked Songs</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {favorites.length} songs
            </div>
          </div>
        </Link>

        {playlists.map((pl) => (
          <Link
            key={pl.id}
            href={`/playlist/${pl.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              color: "var(--text-dim)",
              fontSize: "0.88rem",
              transition: "var(--transition-smooth)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                background: pl.coverUrl
                  ? `url(${pl.coverUrl}) center/cover`
                  : "rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!pl.coverUrl && <ListMusic size={14} color="var(--text-muted)" />}
            </div>
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <div style={{ color: "var(--text-main)", fontWeight: 500 }}>{pl.name}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {pl.songs.length} songs
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Info */}
      <div
        style={{
          paddingTop: "16px",
          borderTop: "1px solid var(--border-glass)",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Echo Music v2.4</span>
        <span style={{ color: "var(--primary-accent)" }}>Online</span>
      </div>
    </aside>
  );
}
