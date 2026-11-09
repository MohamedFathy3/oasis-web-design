import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getPageCopy, useCMS } from "@/lib/cms";
import { isVideoMediaUrl } from "@/lib/projects";
import type { Language } from "./types";

export function ShowcasePortfolio({ language }: { language: Language }) {
  const { config } = useCMS();
  const projects = config.portfolio.filter(
    (project) =>
      project.enabled &&
      project.projectCategory !== "video" &&
      !project.additionalCategories?.includes("video") &&
      !isVideoMediaUrl(project.image),
  );
  const copy = (key: string) => getPageCopy(config, "home", key, language);

  return (
    <section className="section portfolio-section" id="portfolio" aria-labelledby="portfolio-title">
      <div className="section-inner">
        <div className="section-eyebrow">{copy("portfolioEyebrow")}</div>
        <div className="section-heading">
          <h2 id="portfolio-title">{copy("portfolioHeading")}</h2>
          <Link className="portfolio-all-link" to="/projects">
            {copy("portfolioAll")}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="portfolio-grid">
          {projects.slice(0, 3).map((project) => (
            <a
              className="portfolio-item"
              href={project.link || `/projects/${project.id}`}
              key={project.id}
              aria-label={`${copy("portfolioProjectLabel")} ${project.name[language]}`}
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
