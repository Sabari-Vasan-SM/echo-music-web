"use client";

import React, { useState } from "react";
import { LibraryProvider } from "@/context/LibraryContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { Sidebar } from "./Sidebar";
import { MiniPlayer } from "./MiniPlayer";
import { FullscreenPlayer } from "./FullscreenPlayer";
import { EqualizerModal } from "./EqualizerModal";
import { MusicDnaModal } from "./MusicDnaModal";
import { QueueDrawer } from "./QueueDrawer";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  return (
    <LibraryProvider>
      <PlayerProvider>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* Persistent Sidebar */}
          <Sidebar onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)} />

          {/* Main Content Area */}
          <div
            style={{
              marginLeft: "var(--sidebar-width)",
              flex: 1,
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              paddingBottom: "120px",
              position: "relative",
            }}
          >
            {children}
          </div>

          {/* Persistent Players & Modals */}
          <MiniPlayer />
          <FullscreenPlayer />
          <EqualizerModal />
          <MusicDnaModal />
          <QueueDrawer />
          <CreatePlaylistModal
            isOpen={isCreatePlaylistOpen}
            onClose={() => setIsCreatePlaylistOpen(false)}
          />
        </div>
      </PlayerProvider>
    </LibraryProvider>
  );
}
