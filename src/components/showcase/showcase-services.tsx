import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCMS, usePageTranslate } from "@/lib/cms";
import type { Language } from "./types";

export function ShowcaseServices({ language }: { language: Language }) {
  const { config } = useCMS();
  const services = config.services.filter((service) => service.enabled);
  const servicesRef = useRef<HTMLDivElement>(null);
  const autoNextRef = useRef(true);
  const pointerStartRef = useRef<{
    x: number;
    y: number;
    scrollLeft: number;
    pointerId: number;
  } | null>(null);
  const isDraggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ar = language === "ar";
  const t = usePageTranslate(language);

  const getStep = (track: HTMLDivElement) => {
    const firstCard = track.children.item(0);
    const secondCard = track.children.item(1);
    if (!firstCard || !secondCard) return 364;
    return Math.abs(
      secondCard.getBoundingClientRect().left - firstCard.getBoundingClientRect().left,
    );
  };

  const scroll = (next: boolean) => {
    const track = servicesRef.current;
    if (!track) return;
    track.scrollBy({
      left: (next ? 1 : -1) * (ar ? -1 : 1) * getStep(track),
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      pointerId: event.pointerId,
    };
    isDraggingRef.current = false;
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (!isDraggingRef.current && Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isDraggingRef.current = true;
      suppressClickRef.current = true;
      setIsDragging(true);
      setIsPaused(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    if (!isDraggingRef.current) return;
    event.preventDefault();
    event.currentTarget.scrollLeft = start.scrollLeft + deltaX * (ar ? 1 : -1);
  };

  const endPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pointerStartRef.current = null;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (event.pointerType !== "mouse") setIsPaused(false);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      const track = servicesRef.current;
      if (!track || isPaused || document.hidden) return;

      const firstCard = track.children.item(0);
      const lastCard = track.children.item(track.children.length - 1);
      if (!firstCard || !lastCard) return;

      const trackBounds = track.getBoundingClientRect();
      const canMoveNext = autoNextRef.current
        ? (ar ? firstCard : lastCard).getBoundingClientRect().right > trackBounds.right + 1
        : (ar ? lastCard : firstCard).getBoundingClientRect().left < trackBounds.left - 1;

      if (!canMoveNext) autoNextRef.current = !autoNextRef.current;
      scroll(autoNextRef.current !== ar);
    }, 3500);

    return () => window.clearInterval(interval);
  }, [ar, isPaused]);

  return (
    <section className="section services-section" id="services" aria-labelledby="services-title">
      <div className="section-inner">
        <div className="services-intro">
          <div className="services-intro-copy">
            <p className="services-intro-eyebrow">
              <span className="services-intro-dot" aria-hidden="true" />
              {t("Creative services, made for growth", "خدمات إبداعية تنمّي شغلك")}
            </p>
            <h2>
              {t("Big ideas.", "أفكار كبيرة.")}
              <br />
              <span>{t("Real impact.", "وتأثير حقيقي.")}</span>
            </h2>
            <p className="services-intro-description">
              {t(
                "From the first spark to the final detail, we bring strategy, creativity and technology together to move your brand forward.",
                "من أول فكرة لآخر تفصيلة، بنجمع بين الاستراتيجية والإبداع والتكنولوجيا عشان نحرّك علامتك التجارية لقدّام.",
              )}
            </p>
            <div className="services-intro-actions">
              <a className="services-intro-cta" href="#service-cards">
                {t("Explore our services", "اكتشف خدماتنا")}
                <ArrowDown aria-hidden="true" />
              </a>
              <span className="services-intro-count">
                <strong>{String(services.length).padStart(2, "0")}</strong>
                {t("ways to grow your brand", "خدمات لتنمية علامتك")}
              </span>
            </div>
          </div>
          <div className="services-intro-visual">
            <div className="services-intro-image-wrap">
              <img
                className="services-intro-image"
                src={config.pageAssets["serviceFallback"]}
                alt={t(
                  "Creative digital experience designed by Viral Zoom",
                  "تجربة رقمية إبداعية من فايرال زوم",
                )}
              />
              <span className="services-image-caption">
                {t("Strategy meets creativity", "الاستراتيجية تلتقي بالإبداع")}
              </span>
            </div>
            <div className="services-image-stamp" aria-hidden="true">
              <span>VZ</span>
              <span>
                CREATIVE
                <br />
                STUDIO
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="section-inner">
        <div className="section-heading">
          <div>
            <p className="section-eyebrow">{t("WHAT WE DO", "ماذا نقدم")}</p>
            <h2 id="services-title">{t("Our Services", "خدماتنا")}</h2>
            <Link className="services-full-page-link" to="/services">
              {t("View all services", "شوف كل خدماتنا")}
              {ar ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
            </Link>
          </div>
          <div className="carousel-actions" dir="ltr">
            <Button
              variant="ghost"
              className="arrow-control"
              title={t("Previous", "السابق")}
              aria-label={`services ${t("previous", "السابق")}`}
              onClick={() => scroll(ar)}
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="ghost"
              className="arrow-control"
              title={t("Next", "التالي")}
              aria-label={`services ${t("next", "التالي")}`}
              onClick={() => scroll(!ar)}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
      <div
        className={`service-track${isDragging ? " is-dragging" : ""}`}
        id="service-cards"
        ref={servicesRef}
        aria-label={t("Services", "الخدمات")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        onClickCapture={(event) => {
          if (!suppressClickRef.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
        }}
      >
        {services.map((service, index) => (
          <article className="service-card" key={service.id}>
            <img
              className="service-image"
              src={service.image}
              alt={service.name[language]}
              loading="lazy"
            />
            <div className="service-number">{String(index + 1).padStart(2, "0")} / VIRAL ZOOM</div>
            <h3>{service.name[language]}</h3>
            <p>{service.description[language]}</p>
            <Button variant="link" className="service-more" asChild>
              <Link to="/services/$slug" params={{ slug: service.id }}>
                {t("Read More", "اقرأ المزيد")}
                <ArrowUpRight />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
