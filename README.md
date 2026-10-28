# Echo Music Web

<div align="center">
  <p><b>A modern web music app with ad-free streaming, synchronized lyrics, audio DSP equalizer, and Music DNA intelligence.</b></p>
</div>

---

## ✨ Features

- **Ad-Free Streaming**: Seamless, uninterrupted audio playback powered by YouTube Music integration.
- **Synchronized Lyrics**: Real-time karaoke-style synced lyrics via LRCLIB with auto-scrolling and millisecond precision.
- **Music DNA**: Uncovers the story and meaning behind any track using Genius track annotations and Wikipedia intelligence.
- **Audio DSP Equalizer**: 5-band interactive faders with acoustic presets (Flat, Bass Boost, Vocal Boost, Electronic, Rock, Pop, Acoustic).
- **Liquid Glass Aesthetic**: Glassmorphism surfaces, dynamic artwork-derived backlight blur, and Nothing OS inspired minimalist design.
- **Instant Search & Autocomplete**: Search across Songs, Videos, Albums, Artists, and Playlists with instant suggestions.
- **Curated Moods & Explore**: Explore categories like Chill & Relax, Workout, Deep Focus, Party, Sleep, and Road Trip.
- **MediaSession API**: Hardware and lockscreen media keys control (play, pause, seek, next, prev).
- **Library & Custom Playlists**: Liked songs, custom collections, and playback history persisted locally.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on v22)
- npm or pnpm / yarn

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS (Liquid Glass Design System)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Lyrics Provider**: [LRCLIB](https://lrclib.net/)
- **Annotations**: Genius API & Wikipedia Extracts API

---

## 📄 License

MIT
