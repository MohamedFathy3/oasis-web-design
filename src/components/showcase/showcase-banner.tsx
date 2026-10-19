import { useEffect, useRef } from "react";
import type { Language } from "./types";
import { useCMS, usePageTranslate } from "@/lib/cms";

export function ShowcaseBanner({ language }: { language: Language }) {
  const t = usePageTranslate(language);
  const { config } = useCMS();
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const frameElement = frameRef.current;
    const image = imageRef.current;
    if (
      !section ||
      !frameElement ||
      !image ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let animationFrame = 0;
    const updateParallax = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const process = document.querySelector(".process-section");
        const contact = document.querySelector(".contact-section");
        const processBottom = process
          ? process.getBoundingClientRect().bottom + window.scrollY
          : section.getBoundingClientRect().top + window.scrollY;
        const contactTop = contact
          ? contact.getBoundingClientRect().top + window.scrollY
          : processBottom + section.offsetHeight;
        const desiredTravel = Math.min(frameElement.clientHeight * 0.55, image.offsetHeight * 0.5);
        const zoom = Math.max(
          1,
          (frameElement.clientHeight + desiredTravel) / Math.max(1, image.offsetHeight),
        );
        image.style.setProperty("--banner-zoom", `${zoom}`);
        const imageTravel = Math.max(0, image.offsetHeight * zoom - frameElement.clientHeight);
        const scrollEnd = Math.min(
          contactTop,
          document.documentElement.scrollHeight - window.innerHeight,
        );
        const revealOffset = Math.max(0, processBottom - window.scrollY);
        const travelProgress = Math.max(
          0,
          Math.min(1, (window.scrollY - processBottom) / Math.max(1, scrollEnd - processBottom)),
        );
        const translateY = revealOffset - travelProgress * imageTravel;
        image.style.setProperty("--banner-parallax-translate", `${translateY}px`);
      });
    };

    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    image.addEventListener("load", updateParallax);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", updateParallax);
      window.removeEventListener("resize", updateParallax);
      image.removeEventListener("load", updateParallax);
      image.style.removeProperty("--banner-parallax-translate");
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="showcase-banner"
      aria-label={t("Viral Zoom creative agency", "وكالة فايرال زوم الإبداعية")}
    >
      <div className="showcase-banner-frame" ref={frameRef}>
        <img
          ref={imageRef}
          className="showcase-banner-image"
          src={config.pageAssets["showcaseBanner"]}
          alt={t(
            "Viral Zoom: creative ideas, powerful results, your brand amplified.",
            "فايرال زوم: أفكار إبداعية ونتائج قوية تعزز علامتك التجارية.",
          )}
          loading="lazy"
        />
      </div>
    </section>
  );
}
