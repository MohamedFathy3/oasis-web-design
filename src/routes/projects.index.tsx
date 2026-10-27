import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import hero from "@/assets/hero.mp4.asset.json";
import heroWebm from "@/assets/hero.webm.asset.json";
import poster from "@/assets/poster.jpg.asset.json";
import { ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import type { Language, SectionId } from "@/components/showcase/types";
import {
  filterProjectsByCategory,
  isVideoMediaUrl,
  projectCategories,
  projectHasCategory,
  projects,
  shuffleVideoFeed,
  type ProjectCategoryId,
  type VideoProjectType,
} from "@/lib/projects";
import { getPageCopy, projectItemsFromConfig, useCMS } from "@/lib/cms";
import { canonicalUrl } from "@/lib/seo";
import { loadSiteConfig } from "@/lib/cms-loader";
import { resolveVideoEmbed } from "@/lib/video";

function isExternalProjectLink(link: string | undefined): link is string {
  if (!link) return false;
  try {
    const url = new URL(link);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/projects/")({
  component: ProjectsPage,
  loader: async () => ({ siteConfig: await loadSiteConfig() }),
  head: ({ loaderData }) => ({
    links: [{ rel: "canonical", href: canonicalUrl("/projects") }],
    meta: [
      { title: loaderData?.siteConfig.content.pages.projects.seoTitle.en },
      {
        name: "description",
        content: loaderData?.siteConfig.content.pages.projects.seoDescription.ar,
      },
      { property: "og:title", content: loaderData?.siteConfig.content.pages.projects.seoTitle.ar },
      {
        property: "og:description",
        content: loaderData?.siteConfig.content.pages.projects.seoDescription.ar,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl("/projects") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: loaderData?.siteConfig.content.pages.projects.seoTitle.ar },
      {
        name: "twitter:description",
        content: loaderData?.siteConfig.content.pages.projects.seoDescription.ar,
      },
    ],
  }),
});

function ProjectsPage() {
  const { config, ready } = useCMS();
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const [activeCategory, setActiveCategory] = useState<ProjectCategoryId | "all">("all");
  const [activeVideoType, setActiveVideoType] = useState<VideoProjectType>("reels");
  const [reelsShuffleSeed, setReelsShuffleSeed] = useState(() => Math.random());
  const navigate = useNavigate();
  const ar = language === "ar";
  const copy = (key: string) => getPageCopy(config, "projects", key, language);
  const categoryLabels: Record<string, string> = {
    all: copy("categoryAll"),
    "social-media": copy("categorySocialMedia"),
    video: ar ? "إنتاج الفيديو" : "Video Production",
    websites: copy("categoryWebsites"),
    "mobile-apps": copy("categoryMobileApps"),
    branding: copy("categoryBranding"),
    "platforms-apps": copy("categoryMobileApps"),
    "ui-ux": copy("categoryBranding"),
  };
  const allProjects = useMemo(
    () =>
      ready ? projectItemsFromConfig(config.portfolio.filter((item) => item.enabled)) : projects,
    [config.portfolio, ready],
  );
  const visibleProjects = useMemo(
    () => filterProjectsByCategory(allProjects, activeCategory),
    [activeCategory, allProjects],
  );
  const videoFeed = useMemo(
    () =>
      visibleProjects.flatMap(
        (project) =>
          (activeVideoType === "reels" ? project.reelsVideos : project.promoVideos)
            ?.filter(Boolean)
            .map((src, index) => ({ project, src, index })) ?? [],
      ),
    [activeVideoType, visibleProjects],
  );
  const orderedVideoFeed = useMemo(
    () => (activeVideoType === "reels" ? shuffleVideoFeed(videoFeed, reelsShuffleSeed) : videoFeed),
    [activeVideoType, reelsShuffleSeed, videoFeed],
  );
  const showVideoFeed = activeCategory === "video" && activeVideoType === "reels";
  const showVideoGrid = activeCategory === "video" && activeVideoType === "promo-video";
  const featuredProjects = filterProjectsByCategory(allProjects, "all")
    .filter((project) => !isVideoMediaUrl(project.image))
    .slice(0, 3);
  const availableCategories = projectCategories.filter(
    (category) =>
      category.id === "all" ||
      allProjects.some((project) => projectHasCategory(project, category.id)),
  );

  useEffect(() => {
    try {
      setDarkMode(localStorage.getItem("viral-zoom-theme") !== "light");
      setLanguage(localStorage.getItem("viral-zoom-language") === "ar" ? "ar" : "en");
    } catch {
      // Keep the default language and dark mode when storage is unavailable.
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
          style={{ backgroundImage: `url("${config.hero.poster || poster.url}")` }}
        >
          <video
            className="projects-hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster={config.hero.poster || poster.url}
            aria-hidden="true"
            tabIndex={-1}
          >
            {config.hero.video === hero.url && <source src={heroWebm.url} type="video/webm" />}
            <source src={config.hero.video || hero.url} type="video/mp4" />
          </video>
          <div className="projects-hero-overlay" aria-hidden="true" />
          <div className="section-inner projects-hero-inner">
            <div className="projects-hero-copy">
              <p className="section-eyebrow">{copy("heroEyebrow")}</p>
              <h1 id="projects-title">{copy("heroTitle")}</h1>
              <p className="projects-intro-copy">{copy("heroDescription")}</p>
            </div>
            <div className="projects-hero-art" aria-label={copy("featuredLabel")}>
              {featuredProjects.map((project, index) => (
                <div
                  className={`projects-hero-image projects-hero-image-${index + 1}`}
                  key={project.slug}
                >
                  <img src={project.image} alt={project.name} />
                  <span>{project.name}</span>
                </div>
              ))}
              <span className="projects-hero-stamp" aria-hidden="true">
                VZ / WORKS
              </span>
            </div>
          </div>
        </section>

        <section className="projects-gallery section" aria-label={copy("galleryLabel")}>
          <div className="section-inner">
            <div className="projects-filters" role="group" aria-label={copy("filterLabel")}>
              {availableCategories.map((category) => {
                const count =
                  category.id === "all"
                    ? filterProjectsByCategory(allProjects, "all").length
                    : allProjects.filter((project) => projectHasCategory(project, category.id))
                        .length;
                const selected = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    className={`projects-filter${selected ? " active" : ""}`}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setActiveCategory(category.id);
                      if (category.id === "video") {
                        setActiveVideoType("reels");
                        setReelsShuffleSeed(Math.random());
                      }
                    }}
                  >
                    {categoryLabels[category.id] ?? category.id}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>

            {activeCategory === "video" && (
              <div
                className="projects-filters projects-video-filters"
                role="group"
                aria-label={ar ? "نوع الفيديو" : "Video type"}
              >
                {(
                  [
                    ["reels", ar ? "ريلز" : "REELS"],
                    ["promo-video", ar ? "فيديو ترويجي" : "PROMO VIDEO"],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    className={`projects-filter${activeVideoType === type ? " active" : ""}`}
                    type="button"
                    aria-pressed={activeVideoType === type}
                    onClick={() => {
                      setActiveVideoType(type);
                      if (type === "reels") setReelsShuffleSeed(Math.random());
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {showVideoFeed ? (
              videoFeed.length ? (
                <div className="projects-reels-feed" aria-label={ar ? "ريلز" : "Reels"}>
                  {orderedVideoFeed.map(({ project, src, index }) => (
                    <article
                      className="projects-reel"
                      key={`${project.slug}-${index}`}
                      aria-label={`${project.localizedName?.[language] ?? project.name} ${index + 1}`}
                    >
                      {isExternalProjectLink(
                        project.kind === "external" ? project.url : project.link,
                      ) ? (
                        <a
                          className="projects-reel-project-link"
                          href={project.kind === "external" ? project.url : project.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {copy("openProject")}
                          <ArrowUpRight aria-hidden="true" />
                        </a>
                      ) : (
                        <Link
                          className="projects-reel-project-link"
                          to="/projects/$slug"
                          params={{ slug: project.slug }}
                        >
                          {copy("openProject")}
                          <ArrowUpRight aria-hidden="true" />
                        </Link>
                      )}
                      {resolveVideoEmbed(src) ? (
                        <iframe
                          src={resolveVideoEmbed(src) ?? undefined}
                          title={`${project.localizedName?.[language] ?? project.name} ${index + 1}`}
                          loading="lazy"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <video src={src} controls muted loop playsInline preload="metadata" />
                      )}
                      <div className="projects-reel-caption">
                        <h2>{project.localizedName?.[language] ?? project.name}</h2>
                        <p>{project.description[language]}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="projects-video-empty">
                  {ar
                    ? "لا توجد فيديوهات Reels مضافة حتى الآن."
                    : "No Reels videos have been added yet."}
                </p>
              )
            ) : showVideoGrid ? (
              <div className="projects-video-grid">
                {videoFeed.map(({ project, src, index }) => {
                  const title = (project.localizedName?.[language] ?? project.name).trim();
                  const description = project.description[language].trim();
                  const projectLink = project.kind === "external" ? project.url : project.link;

                  return (
                    <article className="projects-video-card" key={`${project.slug}-${index}`}>
                      <div className="projects-video-frame">
                        {resolveVideoEmbed(src) ? (
                          <iframe
                            src={resolveVideoEmbed(src) ?? undefined}
                            title={`${title || "Project video"} ${index + 1}`}
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          <video src={src} controls playsInline preload="metadata" />
                        )}
                        {isExternalProjectLink(projectLink) ? (
                          <a
                            className="projects-reel-project-link"
                            href={projectLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {copy("openProject")}
                            <ArrowUpRight aria-hidden="true" />
                          </a>
                        ) : (
                          <Link
                            className="projects-reel-project-link"
                            to="/projects/$slug"
                            params={{ slug: project.slug }}
                          >
                            {copy("openProject")}
                            <ArrowUpRight aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                      {(title || description) && (
                        <div className="projects-video-copy">
                          {title && <h2>{title}</h2>}
                          {description && <p>{description}</p>}
                        </div>
                      )}
                    </article>
                  );
                })}
                {!videoFeed.length && (
                  <p className="projects-video-empty">
                    {ar
                      ? "لا توجد فيديوهات Promo مضافة حتى الآن."
                      : "No Promo videos have been added yet."}
                  </p>
                )}
              </div>
            ) : (
              <div className="projects-grid">
                {visibleProjects.map((project) => {
                  const cardCategoryId =
                    activeCategory !== "all"
                      ? activeCategory
                      : project.category === "platforms-apps"
                        ? "mobile-apps"
                        : project.category === "ui-ux"
                          ? "branding"
                          : project.category;
                  const cardContent = (
                    <>
                      <div className="projects-card-image-wrap">
                        <img src={project.image} alt={project.name} loading="lazy" />
                        <span className="projects-card-category">
                          {categoryLabels[cardCategoryId] ?? cardCategoryId}
                        </span>
                        {project.kind === "external" && (
                          <ArrowUpRight className="projects-card-external" aria-hidden="true" />
                        )}
                      </div>
                      <div className="projects-card-copy">
                        <h2>{project.localizedName?.[language] ?? project.name}</h2>
                        <p>{project.description[language]}</p>
                        <span className="projects-card-action">
                          {project.kind === "external" ? copy("visitProject") : copy("openProject")}
                          <ArrowRight aria-hidden="true" />
                        </span>
                      </div>
                    </>
                  );

                  return project.kind === "external" ? (
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
            )}
          </div>
        </section>
      </main>
      <ShowcaseFooter
        language={language}
        logo={darkMode ? config.brand.whiteLogo : config.brand.logo}
        onBackToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </div>
  );
}
