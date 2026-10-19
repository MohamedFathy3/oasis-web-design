import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Facebook,
  Instagram,
  Music2,
  TrendingUp,
  X,
} from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import type { Language, SectionId } from "@/components/showcase/types";
import { projectCategories, projects, type CaseStudyProject } from "@/lib/projects";
import { projectItemsFromConfig, useCMS } from "@/lib/cms";
import { absoluteSiteAsset, canonicalUrl } from "@/lib/seo";
import { loadSiteConfig } from "@/lib/cms-loader";
import { usePageTranslate } from "@/lib/cms";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const config = await loadSiteConfig();
    const project = projectItemsFromConfig(config.portfolio).find(
      (item) => item.slug === params.slug,
    );
    return { slug: params.slug, project: project?.kind === "case-study" ? project : null };
  },
  head: ({ loaderData }) => {
    const data = loaderData ?? { slug: "project", project: null };
    const title = data.project?.name ?? data.slug.replaceAll("-", " ");
    const descriptionEn =
      data.project?.description.en ?? "Creative and digital marketing project by Viral Zoom.";
    const descriptionAr = data.project?.description.ar ?? "مشروع إبداعي وتسويقي من فايرال زوم.";
    const pageUrl = canonicalUrl(`/projects/${encodeURIComponent(data.slug)}`);
    return {
      links: [{ rel: "canonical", href: pageUrl }],
      meta: [
        { title: `${title} — Viral Zoom Projects` },
        { name: "description", content: descriptionAr.slice(0, 160) },
        { property: "og:title", content: `${title} — Viral Zoom` },
        { property: "og:url", content: pageUrl },
        { property: "og:description", content: descriptionEn.slice(0, 160) },
        ...(data.project
          ? [{ property: "og:image", content: absoluteSiteAsset(data.project.image) }]
          : []),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${title} — Viral Zoom` },
        { name: "twitter:description", content: descriptionEn.slice(0, 160) },
        ...(data.project
          ? [{ name: "twitter:image", content: absoluteSiteAsset(data.project.image) }]
          : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            url: pageUrl,
            name: title,
            description: descriptionEn,
            ...(data.project ? { image: data.project.image } : {}),
            creator: { "@type": "Organization", name: "Viral Zoom" },
          }),
        },
      ],
    };
  },
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const routeData = Route.useLoaderData();
  const { config, ready } = useCMS();
  const liveProject = ready
    ? projectItemsFromConfig(config.portfolio).find(
        (item): item is CaseStudyProject =>
          item.slug === routeData.slug && item.kind === "case-study",
      )
    : undefined;
  const project: CaseStudyProject = liveProject ??
    routeData.project ?? {
      slug: routeData.slug,
      name: routeData.slug.replaceAll("-", " "),
      kind: "case-study",
      category: "branding",
      image: "",
      description: { en: "", ar: "" },
    };
  const projectExists = ready ? Boolean(liveProject) : Boolean(routeData.project);
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const [animateCommunityGrowth, setAnimateCommunityGrowth] = useState(false);
  const [animatePerformance, setAnimatePerformance] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const socialCreativeRef = useRef<HTMLDivElement>(null);
  const socialGrowthRef = useRef<HTMLDivElement>(null);
  const socialPerformanceRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const ar = language === "ar";
  const t = usePageTranslate(language);
  const projectName = project.localizedName?.[language] ?? project.name;
  const visibleCategoryId =
    project.category === "platforms-apps"
      ? "mobile-apps"
      : project.category === "ui-ux"
        ? "branding"
        : project.category;
  const categoryLabel = projectCategories.find((category) => category.id === visibleCategoryId)?.[
    language
  ];

  useEffect(() => {
    const section = socialCreativeRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-in-view", entry.isIntersecting);
        });
      },
      { threshold: 0.2 },
    );
    section
      .querySelectorAll(".social-case-study-heading, .social-post-card")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dialog = lightboxRef.current;
    if (!dialog) return;
    if (lightboxImage && !dialog.open) dialog.showModal();
    if (!lightboxImage && dialog.open) dialog.close();
  }, [lightboxImage]);

  useEffect(() => {
    const section = socialGrowthRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setAnimateCommunityGrowth(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setAnimateCommunityGrowth(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = socialPerformanceRef.current;
    if (!section) return;
    if (!("IntersectionObserver" in window)) {
      setAnimatePerformance(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setAnimatePerformance(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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

  useEffect(() => {
    document.title = `${projectName} — Viral Zoom Projects`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", project.description[language].slice(0, 160));
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", `${projectName} — Viral Zoom`);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", project.description[language].slice(0, 160));
  }, [projectName, project.description, language]);

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

  if (ready && !projectExists) {
    return (
      <main className="section-inner" style={{ paddingBlock: 120 }}>
        <h1>{t("Project not found", "المشروع غير موجود")}</h1>
        <Link to="/projects">{t("Browse projects", "تصفح الأعمال")}</Link>
      </main>
    );
  }

  return (
    <div className="site project-detail-page" dir={ar ? "rtl" : "ltr"}>
      <ShowcaseHeader
        language={language}
        darkMode={darkMode}
        activeSection="portfolio"
        onNavigate={navigateToSection}
        onToggleTheme={toggleTheme}
        onLanguageChange={changeLanguage}
      />
      <main>
        <section className="project-detail-hero" aria-labelledby="project-detail-title">
          <img className="project-detail-hero-image" src={project.image} alt="" />
          <div className="project-detail-hero-shade" />
          <div className="section-inner project-detail-hero-inner">
            <Link to="/projects" className="project-detail-back">
              {ar ? <ArrowRight aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
              {t("All projects", "كل المشاريع")}
            </Link>
            <p className="section-eyebrow">
              {t("SELECTED WORK", "أعمال مختارة")} / {categoryLabel}
            </p>
            <h1 id="project-detail-title">{projectName}</h1>
            <p>{project.description[language]}</p>
          </div>
        </section>

        <section
          className="project-detail-showcase section"
          aria-label={t("Project artwork", "تصميم المشروع")}
        >
          <div className="section-inner">
            {project.socialMediaShowcase ? (
              <div className="social-case-study" ref={socialCreativeRef}>
                <div className="social-case-study-heading">
                  <div>
                    <span className="section-eyebrow">
                      {t("CONTENT THAT CONNECTS", "محتوى يقرّب علامتك من جمهورها")}
                    </span>
                    <h2>{t("Our social media creative", "بصمتنا على السوشيال ميديا")}</h2>
                  </div>
                  <span className="social-sample-note">
                    {t("Concept preview · sample metrics", "معاينة تجريبية · أرقام افتراضية")}
                  </span>
                </div>

                <div className="social-post-grid">
                  {project.socialMediaShowcase.posts.map((post, index) => (
                    <article className="social-post-card" key={`${post.platform}-${post.title.en}`}>
                      <button
                        className="social-post-image"
                        type="button"
                        aria-label={t(`Enlarge ${post.title.en}`, `تكبير ${post.title.ar}`)}
                        onClick={() => setLightboxImage(post.image)}
                      >
                        <img src={post.image} alt="" loading="lazy" />
                        <span className="social-post-platform">
                          {post.platform === "Instagram" && <Instagram aria-hidden="true" />}
                          {post.platform === "TikTok" && <Music2 aria-hidden="true" />}
                          {post.platform === "Facebook" && <Facebook aria-hidden="true" />}
                          {post.platform === "Snapchat" && <Camera aria-hidden="true" />}
                          {post.platform}
                        </span>
                        <span className="social-post-reach">
                          <TrendingUp aria-hidden="true" />
                          {post.reach}
                        </span>
                      </button>
                      <div className="social-post-caption">
                        <span>0{index + 1}</span>
                        <h3>{post.title[language]}</h3>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="social-performance">
                  <div className="social-performance-copy">
                    <span className="section-eyebrow">
                      {t("CAMPAIGN SNAPSHOT", "ملخص أداء الحملة")}
                    </span>
                    <h2>
                      {t("Creative work, measurable growth.", "إبداع يصنع فرقًا قابلًا للقياس.")}
                    </h2>
                    <p>
                      {t(
                        "A sample view of reach and audience growth across the campaign.",
                        "نظرة تجريبية على الوصول ونمو الجمهور عبر الحملة.",
                      )}
                    </p>
                    <ul>
                      <li>{t("Platform-specific creative", "محتوى مناسب لكل منصة")}</li>
                      <li>{t("Consistent visual identity", "هوية بصرية متناسقة")}</li>
                      <li>{t("Performance-led optimization", "تحسين مستمر حسب الأداء")}</li>
                    </ul>
                  </div>
                  <div
                    className={`social-performance-list${animatePerformance ? " is-visible" : ""}`}
                    ref={socialPerformanceRef}
                  >
                    {project.socialMediaShowcase.performanceImages.map((image, index) => (
                      <button
                        className="social-performance-card"
                        key={image}
                        type="button"
                        aria-label={t(
                          `Enlarge campaign image ${index + 1}`,
                          `تكبير صورة الحملة ${index + 1}`,
                        )}
                        onClick={() => setLightboxImage(image)}
                      >
                        <img src={image} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="social-growth" ref={socialGrowthRef}>
                  <div className="social-growth-heading">
                    <span className="section-eyebrow">{t("COMMUNITY GROWTH", "نمو المجتمع")}</span>
                    <h2>{t("One idea. Every platform.", "فكرة واحدة.. وحضور على كل منصة.")}</h2>
                  </div>
                  <div className="social-growth-grid">
                    {project.socialMediaShowcase.communityGrowth.map((item) => (
                      <div className="social-growth-item" key={item.platform}>
                        <span className="social-growth-platform">
                          {item.platform === "Instagram" && <Instagram aria-hidden="true" />}
                          {item.platform === "TikTok" && <Music2 aria-hidden="true" />}
                          {item.platform === "Facebook" && <Facebook aria-hidden="true" />}
                          {item.platform === "Snapchat" && <Camera aria-hidden="true" />}
                          {item.platform}
                        </span>
                        <AnimatedFollowerCount
                          value={item.followers}
                          start={animateCommunityGrowth}
                        />
                        <span>{item.label[language]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {project.socialMediaShowcase.video && (
                  <section
                    className="social-case-study-video"
                    aria-label={t("Campaign video", "فيديو الحملة")}
                  >
                    <div>
                      <span className="section-eyebrow">{t("CAMPAIGN FILM", "فيديو الحملة")}</span>
                      <h2>{t("The story, in motion.", "الحكاية وهي بتتحرك.")}</h2>
                    </div>
                    {resolveVideoEmbed(project.socialMediaShowcase.video) ? (
                      <iframe
                        src={resolveVideoEmbed(project.socialMediaShowcase.video) ?? undefined}
                        title={projectName}
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        controls
                        playsInline
                        preload="metadata"
                        poster={project.socialMediaShowcase.videoPoster}
                      >
                        <source src={project.socialMediaShowcase.video} />
                      </video>
                    )}
                  </section>
                )}
              </div>
            ) : project.imageGallery ? (
              <div
                className="social-image-gallery"
                aria-label={t("Social media image gallery", "معرض صور السوشيال ميديا")}
              >
                <div className="social-image-gallery-heading">
                  <span className="section-eyebrow">{t("CAMPAIGN GALLERY", "معرض الحملة")}</span>
                  <h2>
                    {t(
                      "Eight creative pieces. One visual identity.",
                      "8 تصميمات إبداعية.. بهوية واحدة.",
                    )}
                  </h2>
                  <p>
                    {t(
                      "Select any image to view it larger.",
                      "اضغط على أي صورة لمشاهدتها بحجم أكبر.",
                    )}
                  </p>
                </div>
                <div className="social-image-gallery-grid">
                  {project.imageGallery.map((image, index) => (
                    <button
                      className="social-image-gallery-item"
                      key={`${image}-${index}`}
                      type="button"
                      aria-label={t(
                        `Enlarge campaign image ${index + 1}`,
                        `تكبير صورة الحملة ${index + 1}`,
                      )}
                      onClick={() => setLightboxImage(image)}
                    >
                      <img
                        src={image}
                        alt={t(`Campaign design ${index + 1}`, `تصميم الحملة ${index + 1}`)}
                        loading="lazy"
                      />
                      <span>0{index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <img className="project-detail-image" src={project.image} alt={projectName} />
            )}
            <div className="project-detail-caption">
              <div>
                <span className="section-eyebrow">{t("PROJECT OVERVIEW", "نبذة عن المشروع")}</span>
                <h2>{projectName}</h2>
              </div>
              <p>{project.description[language]}</p>
            </div>
          </div>
        </section>

        <section className="project-detail-contact section">
          <div className="section-inner project-detail-contact-inner">
            <div>
              <p className="section-eyebrow">
                {t("HAVE A PROJECT IN MIND?", "عندك مشروع في بالك؟")}
              </p>
              <h2>
                {t("Let's create something worth remembering.", "يلا نعمل حاجة تفضل في الذاكرة.")}
              </h2>
            </div>
            <Link to="/" hash="contact" className="project-detail-contact-link">
              {t("Start a project", "ابدأ مشروعك")}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <ShowcaseFooter
        language={language}
        onBackToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
      <dialog
        className="social-lightbox"
        ref={lightboxRef}
        aria-label={t("Expanded project image", "الصورة المكبرة للمشروع")}
        onClose={() => setLightboxImage(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setLightboxImage(null);
        }}
      >
        <button
          className="social-lightbox-close"
          type="button"
          aria-label={t("Close image", "إغلاق الصورة")}
          onClick={() => setLightboxImage(null)}
        >
          <X aria-hidden="true" />
        </button>
        {lightboxImage && (
          <img src={lightboxImage} alt={t("Expanded project artwork", "تصميم المشروع بحجم مكبر")} />
        )}
      </dialog>
    </div>
  );
}

function resolveVideoEmbed(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.replace(/^www\./, "");
    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const id = url.pathname.startsWith("/embed/")
        ? url.pathname.split("/")[2]
        : url.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
    }
    if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

function AnimatedFollowerCount({
  value,
  start,
  className,
}: {
  value: string;
  start: boolean;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const match = /^([+]?)([\d,.]+)([KkMm]?)$/.exec(value);
  const prefix = match?.[1] ?? "";
  const suffix = match?.[3] ?? "";
  const multiplier = suffix.toLowerCase() === "m" ? 1_000_000 : suffix ? 1_000 : 1;
  const target = Number((match?.[2] ?? "0").replaceAll(",", "")) * multiplier;

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCount(target);
      return;
    }
    if (!start) return;

    const duration = 1600;
    let frame = 0;
    let startTime: number | undefined;
    const tick = (time: number) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 4;
      setCount(Math.floor(target * easedProgress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);

  const formattedCount =
    count >= target
      ? value
      : `${prefix}${Math.floor(count / multiplier).toLocaleString("en-US")}${suffix}`;

  return <strong className={className ?? "social-growth-count"}>{formattedCount}</strong>;
}
