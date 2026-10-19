import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import { loadSiteConfig } from "@/lib/cms-loader";
import { services } from "@/lib/showcase-data";
import type { Language, SectionId } from "@/components/showcase/types";
import { canonicalUrl } from "@/lib/seo";
import { useCMS, usePageTranslate } from "@/lib/cms";

export const Route = createFileRoute("/services/")({
  loader: async () => {
    const config = await loadSiteConfig();
    return { seo: config.pageMeta["services"] };
  },
  component: ServicesPage,
  head: ({ loaderData }) => {
    const seo = loaderData?.seo;
    const pageUrl = canonicalUrl("/services");
    return {
      links: [{ rel: "canonical", href: pageUrl }],
      meta: [
        { title: seo ? `${seo.title.en} | ${seo.title.ar}` : "" },
        {
          name: "description",
          content: seo ? `${seo.description.en} ${seo.description.ar}`.slice(0, 300) : "",
        },
        { property: "og:title", content: seo ? `${seo.ogTitle.en} | ${seo.ogTitle.ar}` : "" },
        { property: "og:url", content: pageUrl },
        {
          property: "og:description",
          content: seo ? `${seo.ogDescription.en} ${seo.ogDescription.ar}`.slice(0, 300) : "",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seo ? `${seo.ogTitle.en} | ${seo.ogTitle.ar}` : "" },
        {
          name: "twitter:description",
          content: seo ? `${seo.ogDescription.en} ${seo.ogDescription.ar}`.slice(0, 300) : "",
        },
      ],
    };
  },
});

function ServicesPage() {
  const { config, ready } = useCMS();
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const ar = language === "ar";
  const t = usePageTranslate(language);
  const serviceItems = ready
    ? config.services
        .filter((item) => item.enabled)
        .map((item) => ({
          slug: item.id,
          title: item.name,
          description: item.description,
          image: item.image,
        }))
    : services;

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

  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <div className="site services-page" dir={ar ? "rtl" : "ltr"}>
      <ShowcaseHeader
        language={language}
        darkMode={darkMode}
        activeSection="services"
        onNavigate={navigateToSection}
        onToggleTheme={toggleTheme}
        onLanguageChange={() => {
          const next = ar ? "en" : "ar";
          setLanguage(next);
          try {
            localStorage.setItem("viral-zoom-language", next);
          } catch {
            // The switch still works without storage.
          }
        }}
      />
      <main>
        <section className="services-page-hero" aria-labelledby="services-page-title">
          <img
            className="services-page-hero-image"
            src={config.pageAssets["serviceFallback"]}
            alt={t("A creative digital project by Viral Zoom", "مشروع رقمي إبداعي من فايرال زوم")}
          />
          <div className="services-page-hero-shade" />
          <div className="services-page-hero-content">
            <p className="services-page-hero-eyebrow">
              {t("IDEAS INTO IMPACT", "من الفكرة للتأثير")}
            </p>
            <h1 id="services-page-title">
              {t("Services that", "خدمات")}
              <br />
              <span>{t("move you forward.", "تحرّكك لقدّام.")}</span>
            </h1>
            <p>
              {t(
                "Creative thinking, smart strategy and standout execution — all working together for your brand.",
                "إبداع واستراتيجية وتنفيذ مميز — كلهم مع بعض عشان علامتك التجارية.",
              )}
            </p>
            <a className="services-page-hero-cta" href="#services-list">
              {t("Explore services", "اكتشف خدماتنا")}
              <ArrowDown aria-hidden="true" />
            </a>
          </div>
          <div className="services-page-hero-index" aria-hidden="true">
            01 — {String(serviceItems.length).padStart(2, "0")}
          </div>
        </section>

        <section
          className="services-page-list section"
          id="services-list"
          aria-labelledby="services-list-title"
        >
          <div className="section-inner">
            <div className="section-heading services-page-list-heading">
              <div>
                <p className="section-eyebrow">{t("HOW WE HELP", "إزاي نساعدك")}</p>
                <h2 id="services-list-title">{t("What we do best", "خدماتنا")}</h2>
                <p className="services-page-list-intro">
                  {t(
                    "Everything your brand needs to get noticed, connect and grow.",
                    "كل اللي علامتك محتاجاه عشان تتميز وتتواصل وتكبر.",
                  )}
                </p>
              </div>
              <span className="services-page-total">
                {String(serviceItems.length).padStart(2, "0")} {t("SERVICES", "خدمة")}
              </span>
            </div>
            <div className="services-page-grid">
              {serviceItems.map((service, index) => (
                <article className="services-page-card" key={service.slug}>
                  <div className="services-page-card-image-wrap">
                    <img
                      className="services-page-card-image"
                      src={service.image}
                      alt={service.title[language]}
                      loading="lazy"
                    />
                    <span className="services-page-card-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="services-page-card-copy">
                    <h3>
                      <Link to="/services/$slug" params={{ slug: service.slug }}>
                        {service.title[language]}
                      </Link>
                    </h3>
                    <p>{service.description[language]}</p>
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      aria-label={`${t("View details for", "تفاصيل خدمة")} ${service.title[language]}`}
                    >
                      {t("View service", "تفاصيل الخدمة")}
                      {ar ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ShowcaseFooter language={language} onBackToTop={backToTop} />
    </div>
  );
}
