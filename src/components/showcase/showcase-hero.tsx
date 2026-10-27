import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.mp4.asset.json";
import heroWebm from "@/assets/hero.webm.asset.json";
import type { Language } from "./types";
import { getPageCopy, useCMS } from "@/lib/cms";

export function ShowcaseHero({ language }: { language: Language }) {
  const { config } = useCMS();
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleVideo = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
      } catch {
        setPlaying(false);
      }
    } else {
      video.pause();
    }
  };

  return (
    <section
      className="video-section"
      aria-label={getPageCopy(config, "home", "heroLabel", language)}
    >
      <h1 className="sr-only">
        {config.brand.name} — {config.hero.title[language]}
      </h1>
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        preload="auto"
        muted={muted}
        loop
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {config.hero.video === hero.url ? <source src={heroWebm.url} type="video/webm" /> : null}
        <source src={config.hero.video || hero.url} type="video/mp4" />
      </video>
      <svg
        className="video-waves"
        viewBox="0 0 1440 180"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          className="video-wave-soft"
          d="M0 20 C300 60 460 150 720 120 C1020 95 1190 30 1440 10 L1440 180 L0 180 Z"
        />
        <path
          className="video-wave-brand"
          d="M0 42 C310 82 470 166 740 145 C1030 125 1200 48 1440 32 L1440 180 L0 180 Z"
        />
        <path
          className="video-wave-base"
          d="M0 60 C320 100 480 180 750 156 C1040 133 1210 65 1440 58 L1440 180 L0 180 Z"
        />
      </svg>
      <div className="hero-copy-overlay">
        <strong>{config.hero.title[language]}</strong>
        <span>{config.hero.subtitle[language]}</span>
      </div>
    </section>
  );
}
