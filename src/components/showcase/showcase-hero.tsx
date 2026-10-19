import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import whiteLogo from "@/assets/logo-white.png.asset.json";
import type { Language } from "./types";
import { useCMS, usePageTranslate } from "@/lib/cms";

export function ShowcaseHero({ language }: { language: Language }) {
  const { config } = useCMS();
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = usePageTranslate(language);

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
    <section className="video-section" aria-label={t("Viral Zoom showreel", "فيديو فايرال زوم")}>
      <h1 className="sr-only">
        {config.brand.name} — {config.hero.title[language]}
      </h1>
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted={muted}
        loop
        playsInline
        poster={config.hero.poster || config.pageAssets["heroPoster"]}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {config.hero.video === "/media/video/social-campaign-reel.mp4" ? (
          <source src={config.pageAssets["heroVideoWebm"]} type="video/webm" />
        ) : null}
        <source src={config.hero.video} type="video/mp4" />
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
      <img
        src={config.brand.whiteLogo || whiteLogo.url}
        className="video-brand"
        alt={config.brand.name}
      />
    </section>
  );
}
