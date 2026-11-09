import banner from "@/assets/Untitled-3.webp";
import type { Language } from "./types";
import { getPageCopy, useCMS } from "@/lib/cms";

export function ShowcaseBanner({ language }: { language: Language }) {
  const { config } = useCMS();
  return (
    <section
      className="showcase-banner"
      aria-label={getPageCopy(config, "home", "bannerLabel", language)}
    >
      <img
        className="showcase-banner-image"
        src={banner}
        alt={getPageCopy(config, "home", "bannerAlt", language)}
        decoding="async"
      />
    </section>
  );
}
