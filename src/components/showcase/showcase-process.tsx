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
import { usePageTranslate } from "@/lib/cms";

const steps: {
  icon: LucideIcon;
  en: string;
  ar: string;
  descriptionEn: string;
  descriptionAr: string;
}[] = [
  {
    icon: Search,
    en: "Measure",
    ar: "حلّل",
    descriptionEn: "Find the opportunity.",
    descriptionAr: "نكتشف الفرص المناسبة.",
  },
  {
    icon: Lightbulb,
    en: "Ideate",
    ar: "ابتكر",
    descriptionEn: "Turn insight into ideas.",
    descriptionAr: "نحوّل الرؤى إلى أفكار.",
  },
  {
    icon: FlaskConical,
    en: "Experiment",
    ar: "جرّب",
    descriptionEn: "Create. Test. Iterate.",
    descriptionAr: "نبتكر، نختبر، ونطوّر.",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    en: "Read",
    ar: "حلّل النتائج",
    descriptionEn: "Learn what works.",
    descriptionAr: "نتعلّم مما يحقق النتائج.",
  },
  {
    icon: TrendingUp,
    en: "Scale",
    ar: "وسّع",
    descriptionEn: "Do more of what works.",
    descriptionAr: "نوسّع أثر ما ينجح.",
  },
];

export function ShowcaseProcess({ language }: { language: Language }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const t = usePageTranslate(language);

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
        <div className="section-eyebrow">{t("THE VIRAL ZOOM METHOD", "منهجية فايرال زوم")}</div>
        <h2 className="process-title" id="process-title">
          {t("Measure. Ideate. Experiment. Read. Scale.", "حلّل. ابتكر. جرّب. قيّم. وسّع.")}
        </h2>
        <p className="process-intro">
          {t(
            "A clear, repeatable process for meaningful results.",
            "خطوات واضحة ومتكررة لتحقيق نتائج مؤثرة.",
          )}
        </p>
        <ol className="process-timeline" dir="ltr">
          {steps.map(({ icon: Icon, en, ar, descriptionEn, descriptionAr }, index) => (
            <li className="process-step" key={en}>
              <div className="process-marker">
                <span className="process-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="process-icon">
                  <Icon aria-hidden="true" />
                </span>
              </div>
              {index < steps.length - 1 && (
                <span className="process-connector" aria-hidden="true" />
              )}
              <div className="process-copy" dir={language === "ar" ? "rtl" : "ltr"}>
                <h3>{t(en, ar)}</h3>
                <p>{t(descriptionEn, descriptionAr)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
