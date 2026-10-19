import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "./types";
import { useCMS, usePageTranslate } from "@/lib/cms";

export function ShowcaseClients({ language }: { language: Language }) {
  const { config } = useCMS();
  const clients = config.clients.filter((client) => client.enabled);
  const [showAllClients, setShowAllClients] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const clientsRef = useRef<HTMLDivElement>(null);
  const autoNextRef = useRef(true);
  const ar = language === "ar";
  const t = usePageTranslate(language);

  const scroll = (next: boolean) => {
    clientsRef.current?.scrollBy({
      left: (next ? 1 : -1) * (ar ? -1 : 1) * 326,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (showAllClients || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      const track = clientsRef.current;
      if (!track || isPaused || document.hidden) return;

      const firstClient = track.children.item(0);
      const lastClient = track.children.item(track.children.length - 1);
      if (!firstClient || !lastClient) return;

      const trackBounds = track.getBoundingClientRect();
      const canMoveNext = autoNextRef.current
        ? (ar ? firstClient : lastClient).getBoundingClientRect().right > trackBounds.right + 1
        : (ar ? lastClient : firstClient).getBoundingClientRect().left < trackBounds.left - 1;

      if (!canMoveNext) autoNextRef.current = !autoNextRef.current;
      track.scrollBy({
        left: (autoNextRef.current !== ar ? 1 : -1) * (ar ? -1 : 1) * 163,
        behavior: "smooth",
      });
    }, 2500);

    return () => window.clearInterval(interval);
  }, [ar, isPaused, showAllClients]);

  return (
    <section className="section" id="clients">
      <div className="section-inner">
        <div className="section-heading">
          <h2>{t("Our Clients", "عملاؤنا")}</h2>
          <Button
            variant="link"
            className="gap-3 text-xs"
            onClick={() => setShowAllClients(!showAllClients)}
          >
            {showAllClients
              ? t("Show carousel", "عرض متحرك")
              : t("View all Clients", "عرض كل العملاء")}
            <ArrowUpRight />
          </Button>
        </div>
        {showAllClients ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {clients.map((client, index) => (
              <img
                key={client.id}
                src={client.image}
                className="w-full rounded-sm"
                alt={
                  client.name[language] ||
                  t(`Client brand ${index + 1}`, `العلامة التجارية ${index + 1}`)
                }
                loading="lazy"
              />
            ))}
          </div>
        ) : (
          <div
            className="client-row"
            dir="ltr"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Clients previous", "العملاء السابقون")}
              title={t("Previous", "السابق")}
              onClick={() => scroll(ar)}
            >
              <ChevronLeft />
            </Button>
            <div className="client-track" ref={clientsRef} dir={ar ? "rtl" : "ltr"}>
              {clients.map((client, index) => (
                <img
                  key={client.id}
                  className="client-logo"
                  src={client.image}
                  alt={
                    client.name[language] ||
                    t(`Client brand ${index + 1}`, `العلامة التجارية ${index + 1}`)
                  }
                  loading="lazy"
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("Clients next", "العملاء التاليون")}
              title={t("Next", "التالي")}
              onClick={() => scroll(!ar)}
            >
              <ChevronRight />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
