import { useEffect, useRef, useState } from "react";
import {
  ChartNoAxesColumnIncreasing,
  FlaskConical,
  Lightbulb,
  Search,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Language } from "./types";
import { getPageCopy, useCMS } from "@/lib/cms";

const stepIcons: LucideIcon[] = [
  Search,
  Lightbulb,
  FlaskConical,
  ChartNoAxesColumnIncreasing,
  TrendingUp,
];

export function ShowcaseProcess({ language }: { language: Language }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { config } = useCMS();
  const copy = (key: string) => getPageCopy(config, "home", key, language);

  useEffect(() => {
    const firstStep = sectionRef.current?.querySelector(".process-step");
    if (!firstStep || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(firstStep);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`process-section${isVisible ? " is-visible" : ""}`}
      ref={sectionRef}
      aria-labelledby="process-title"
    >
      <div className="section-inner">
        <div className="section-eyebrow">{copy("processEyebrow")}</div>
        <h2 className="process-title" id="process-title">
          {copy("processTitle")}
        </h2>
        <p className="process-intro">{copy("processIntro")}</p>
        <ol className="process-timeline" dir="ltr">
          {stepIcons.map((_, index) => {
            const Icon = stepIcons[index % stepIcons.length] ?? Search;
            return (
              <li className="process-step" key={index}>
                <div className="process-marker">
                  <span className="process-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="process-icon">
                    <Icon aria-hidden="true" />
                  </span>
                </div>
                {index < stepIcons.length - 1 && (
                  <span className="process-connector" aria-hidden="true" />
                )}
                <div className="process-copy" dir={language === "ar" ? "rtl" : "ltr"}>
                  <h3>{copy(`processStep${index + 1}Title`)}</h3>
                  <p>{copy(`processStep${index + 1}Description`)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
