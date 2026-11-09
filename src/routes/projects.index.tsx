import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import whiteLogo from "@/assets/logo-white.png.asset.json";
import hero from "@/assets/hero.mp4.asset.json";
import heroWebm from "@/assets/hero.webm.asset.json";
import poster from "@/assets/poster.jpg.asset.json";
import { ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import type { Language, SectionId } from "@/components/showcase/types";
import {
  projectCategories,
  projectHasCategory,
  projectHasExternalLink,
  projects,
  type ProjectCategoryId,
} from "@/lib/projects";
import { translate } from "@/components/showcase/types";

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Selected Projects — Viral Zoom | مشاريع فايرال زوم" },
      {
        name: "description",
        content:
          "Explore selected brand identity and creative projects by Viral Zoom. اكتشف مجموعة من مشاريع فايرال زوم الإبداعية والهويات البصرية.",
      },
      { property: "og:title", content: "Selected Projects — Viral Zoom" },
      {
        property: "og:description",
        content: "Selected brand identity and creative projects by Viral Zoom.",
      },
    ],
  }),
});

function ProjectsPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProjectCategoryId | "all">("all");
  const navigate = useNavigate();
  const ar = language === "ar";
  const t = (english: string, arabic: string) => translate(language, english, arabic);
  const visibleProjects = useMemo(
    () => projects.filter((project) => activeCategory === "all" || projectHasCategory(project, activeCategory)),
    [activeCategory],
  );
  const availableCategories = projectCategories.filter(
    (category) =>
      category.id === "all" || projects.some((project) => projectHasCategory(project, category.id)),
  );

  useEffect(() => {
    try {
      setDarkMode(localStorage.getItem("viral-zoom-theme") === "dark");
      setLanguage(localStorage.getItem("viral-zoom-language") === "ar" ? "ar" : "en");
    } catch {
      // Keep the default language and light mode when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    return () => document.documentElement.classList.remove("dark");
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = ar ? "rtl" : "ltr";
  }, [language, ar]);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    try {
      localStorage.setItem("viral-zoom-theme", next ? "dark" : "light");
    } catch {
      // The switch still works without storage.
    }
  };

  const navigateToSection = (id: SectionId) => {
    void navigate({ to: "/", hash: id });
  };

  const changeLanguage = () => {
    const next = ar ? "en" : "ar";
    setLanguage(next);
    try {
      localStorage.setItem("viral-zoom-language", next);
    } catch {
      // The switch still works without storage.
    }
  };

  return (
    <div className="site projects-page" dir={ar ? "rtl" : "ltr"}>
      <ShowcaseHeader
        language={language}
        darkMode={darkMode}
        activeSection="portfolio"
        onNavigate={navigateToSection}
        onToggleTheme={toggleTheme}
        onLanguageChange={changeLanguage}
      />
      <main>
        <section
          className="projects-hero"
          aria-labelledby="projects-title"
          style={{ backgroundImage: `url("${poster.url}")` }}
        >
          <video className="projects-hero-video" autoPlay muted loop playsInline poster={poster.url} aria-hidden="true" tabIndex={-1}>
            <source src={heroWebm.url} type="video/webm" />
            <source src={hero.url} type="video/mp4" />
          </video>
          <div className="projects-hero-overlay" aria-hidden="true" />
          <div className="section-inner projects-hero-inner">
            <div className="projects-hero-copy">
              <p className="section-eyebrow">{t("SELECTED WORK", "أعمال مختارة")}</p>
              <h1 id="projects-title">
                {t(
                  "Every piece in our creative portfolio.",
                  "كل مشروع في محفظتنا الإبداعية.",
                )}
              </h1>
              <p className="projects-intro-copy">
                {t(
                  "A selection of brands and ideas brought to life by Viral Zoom.",
                  "مجموعة من العلامات والأفكار اللي حولناها لتجارب إبداعية في فايرال زوم.",
                )}
              </p>
            </div>
            <div className="projects-hero-art" aria-label={t("Featured projects", "مشاريع مختارة")}>
              {projects.slice(0, 3).map((project, index) => (
                <div className={`projects-hero-image projects-hero-image-${index + 1}`} key={project.slug}>
                  <img src={project.image} alt={project.name} />
                  <span>{project.name}</span>
                </div>
              ))}
              <span className="projects-hero-stamp" aria-hidden="true">VZ / WORKS</span>
            </div>
          </div>
        </section>

        <section className="projects-gallery section" aria-label={t("Project gallery", "معرض المشاريع")}>
          <div className="section-inner">
            <div className="projects-filters" role="group" aria-label={t("Filter projects by category", "تصفية المشاريع حسب الفئة")}>
              {availableCategories.map((category) => {
                const count =
                  category.id === "all"
                    ? projects.length
                    : projects.filter((project) => projectHasCategory(project, category.id)).length;
                const selected = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    className={`projects-filter${selected ? " active" : ""}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category[language]}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="projects-grid">
              {visibleProjects.map((project) => {
                const cardCategoryId = activeCategory === "all" ? project.category : activeCategory;
                const cardContent = (
                  <>
                    <div className="projects-card-image-wrap">
                      <img src={project.image} alt={project.name} loading="lazy" />
                      <span className="projects-card-category">
                        {projectCategories.find((category) => category.id === cardCategoryId)?.[language]}
                      </span>
                      {projectHasExternalLink(project) && (
                        <ArrowUpRight className="projects-card-external" aria-hidden="true" />
                      )}
                    </div>
                    <div className="projects-card-copy">
                      <h2>{project.localizedName?.[language] ?? project.name}</h2>
                      <p>{project.description[language]}</p>
                      <span className="projects-card-action">
                        {projectHasExternalLink(project)
                          ? t("Visit", "زيارة")
                          : t("View project", "عرض المشروع")}
                        <ArrowRight aria-hidden="true" />
                      </span>
                    </div>
                  </>
                );

                return projectHasExternalLink(project) ? (
                  <a
                    className="projects-card"
                    href={project.url}
                    key={project.slug}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {cardContent}
                  </a>
                ) : (
                  <Link
                    className="projects-card"
                    to="/projects/$slug"
                    params={{ slug: project.slug }}
                    key={project.slug}
                  >
                    {cardContent}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <ShowcaseFooter
        language={language}
        logo={darkMode ? whiteLogo.url : logo.url}
        onBackToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </div>
  );
}
