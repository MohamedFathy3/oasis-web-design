import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCMS, usePageTranslate } from "@/lib/cms";
import type { Language } from "./types";

export function ShowcasePortfolio({ language }: { language: Language }) {
  const { config } = useCMS();
  const projects = config.portfolio.filter((project) => project.enabled);
  const t = usePageTranslate(language);

  return (
    <section className="section portfolio-section" id="portfolio" aria-labelledby="portfolio-title">
      <div className="section-inner">
        <div className="section-eyebrow">{t("SELECTED WORK", "أعمال مختارة")}</div>
        <div className="section-heading">
          <h2 id="portfolio-title">{t("Projects", "مشاريعنا")}</h2>
          <Link className="portfolio-all-link" to="/projects">
            {t("View all projects", "عرض كل المشاريع")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="portfolio-grid">
          {projects.slice(0, 3).map((project) => (
            <a
              className="portfolio-item"
              href={project.link || `/projects/${project.id}`}
              key={project.id}
              aria-label={t(`View ${project.name.en}`, `عرض ${project.name.ar}`)}
            >
              <img src={project.image} alt={project.name[language]} loading="lazy" />
              <span className="portfolio-label">{project.name[language]}</span>
              {project.link?.startsWith("http") && (
                <ArrowUpRight className="portfolio-external-icon" aria-hidden="true" />
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
