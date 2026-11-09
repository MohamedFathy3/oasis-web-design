import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import { services } from "@/lib/showcase-data";
import type { Language, SectionId } from "@/components/showcase/types";
import { canonicalUrl } from "@/lib/seo";
import { getPageCopy, useCMS } from "@/lib/cms";
import { loadSiteConfig } from "@/lib/cms-loader";
import serviceHeroImage from "@/assets/service.png";

export const Route = createFileRoute("/services/")({
  component: ServicesPage,
  loader: async () => ({ siteConfig: await loadSiteConfig() }),
  head: ({ loaderData }) => ({
    links: [{ rel: "canonical", href: canonicalUrl("/services") }],
    meta: [
      { title: loaderData?.siteConfig.content.pages.services.seoTitle.en },
      {
        name: "description",
        content: loaderData?.siteConfig.content.pages.services.seoDescription.en,
      },
      { property: "og:title", content: loaderData?.siteConfig.content.pages.services.seoTitle.ar },
      {
        property: "og:description",
        content: loaderData?.siteConfig.content.pages.services.seoDescription.ar,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl("/services") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: loaderData?.siteConfig.content.pages.services.seoTitle.ar },
      {
        name: "twitter:description",
        content: loaderData?.siteConfig.content.pages.services.seoDescription.ar,
      },
    ],
  }),
});

function ServicesPage() {
  const { config, ready } = useCMS();
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const copy = (key: string) => getPageCopy(config, "services", key, language);
  const navigate = useNavigate();
  const ar = language === "ar";
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
            src={serviceHeroImage}
            alt={copy("heroAlt")}
          />
          <div className="services-page-hero-shade" />
          <div className="services-page-hero-content">
            <p className="services-page-hero-eyebrow">{copy("heroEyebrow")}</p>
            <h1 id="services-page-title">
              {copy("heroTitle")}
              <br />
              <span>{copy("heroTitleAccent")}</span>
            </h1>
            <p>{copy("heroDescription")}</p>
            <a className="services-page-hero-cta" href="#services-list">
              {copy("heroCta")}
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
                <p className="section-eyebrow">{copy("listEyebrow")}</p>
                <h2 id="services-list-title">{copy("listHeading")}</h2>
                <p className="services-page-list-intro">{copy("listDescription")}</p>
              </div>
              <span className="services-page-total">
                {String(serviceItems.length).padStart(2, "0")} {copy("listCount")}
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
                      aria-label={`${copy("viewDetails")} ${service.title[language]}`}
                    >
                      {copy("viewService")}
                      {ar ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ShowcaseFooter
        language={language}
        logo={darkMode ? config.brand.whiteLogo : config.brand.logo}
        onBackToTop={backToTop}
      />
    </div>
  );
}
