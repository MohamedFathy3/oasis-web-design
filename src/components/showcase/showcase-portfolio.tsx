import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { projectHasExternalLink, projects } from "@/lib/projects";
import type { Language } from "./types";
import { translate } from "./types";

export function ShowcasePortfolio({ language }: { language: Language }) {
  const t = (english: string, arabic: string) => translate(language, english, arabic);

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
          {projects.slice(0, 3).map((project) => {
            const projectContent = (
              <>
                <img src={project.image} alt={project.name} loading="lazy" />
                <span className="portfolio-label">{project.name}</span>
                {projectHasExternalLink(project) && (
                  <ArrowUpRight className="portfolio-external-icon" aria-hidden="true" />
                )}
              </>
            );

            return projectHasExternalLink(project) ? (
              <a
                className="portfolio-item"
                href={project.url}
                key={project.slug}
                target="_blank"
                rel="noreferrer"
                aria-label={t(`Visit ${project.name}`, `زيارة ${project.name}`)}
              >
                {projectContent}
              </a>
            ) : (
              <Link
                className="portfolio-item"
                to="/projects/$slug"
                params={{ slug: project.slug }}
                key={project.slug}
                aria-label={t(`View ${project.name}`, `عرض ${project.name}`)}
              >
                {projectContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
