import { useEffect, useState } from "react";
import { ArrowDown, ArrowDownLeft } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import worldMap from "@/assets/bg-2-e496b57f-842e-4cf1-8733-ba70e093aea4.png";
import contactHeroImage from "@/assets/viralzoom-contact-us-realistic.png";
import { ShowcaseContact, ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import type { Language, SectionId } from "@/components/showcase/types";
import { canonicalUrl } from "@/lib/seo";
import { loadSiteConfig } from "@/lib/cms-loader";
import { getPageCopy, useCMS } from "@/lib/cms";

export const Route = createFileRoute("/contact/")({
  component: ContactPage,
  loader: async () => ({ siteConfig: await loadSiteConfig() }),
  head: ({ loaderData }) => ({
    links: [{ rel: "canonical", href: canonicalUrl("/contact") }],
    meta: [
      { title: loaderData?.siteConfig.content.pages.contact.seoTitle.en },
      {
        name: "description",
        content: loaderData?.siteConfig.content.pages.contact.seoDescription.en,
      },
      { property: "og:title", content: loaderData?.siteConfig.content.pages.contact.seoTitle.ar },
      { property: "og:url", content: canonicalUrl("/contact") },
      {
        property: "og:description",
        content: loaderData?.siteConfig.content.pages.contact.seoDescription.ar,
      },
    ],
  }),
});

function ContactPage() {
  const { config } = useCMS();
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const ar = language === "ar";
  const copy = (key: string) => getPageCopy(config, "contact", key, language);

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

  const navigateToSection = (id: SectionId) => {
    void navigate({ to: "/", hash: id });
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    try {
      localStorage.setItem("viral-zoom-theme", next ? "dark" : "light");
    } catch {
      // The switch still works without storage.
    }
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

  const backToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <div className="site contact-page" dir={ar ? "rtl" : "ltr"}>
      <ShowcaseHeader
        language={language}
        darkMode={darkMode}
        activeSection="contact"
        onNavigate={navigateToSection}
        onToggleTheme={toggleTheme}
        onLanguageChange={changeLanguage}
      />
      <main>
        <section className="contact-page-hero" aria-labelledby="contact-page-title">
          <img
            className="contact-page-hero-image"
            src={contactHeroImage}
            alt={copy("heroAlt")}
          />
          <div className="contact-page-hero-shade" />
          <div className="contact-page-hero-content">
            <p className="section-eyebrow">{copy("heroEyebrow")}</p>
            <h1 id="contact-page-title">
              {copy("heroTitle")}
              <br />
              <span>{copy("heroTitleAccent")}</span>
            </h1>
            <p>{copy("heroDescription")}</p>
            <a className="contact-page-hero-cta" href="#contact">
              {copy("heroCta")}
              <ArrowDown aria-hidden="true" />
            </a>
          </div>
          <span className="contact-page-hero-index" aria-hidden="true">
            VZ — 01
          </span>
        </section>

        <div className="contact-page-form">
          <ShowcaseContact language={language} />
        </div>

        <section className="contact-map-section" aria-labelledby="contact-map-title">
          <img className="contact-map-image" src={worldMap} alt="" aria-hidden="true" />
          <div className="contact-map-shade" />
          <div className="section-inner contact-map-content">
            <div>
              <p className="contact-map-eyebrow">{copy("mapEyebrow")}</p>
              <h2 id="contact-map-title">{copy("mapTitle")}</h2>
              <p>{copy("mapDescription")}</p>
            </div>
            <span className="contact-map-mark" aria-hidden="true">
              VZ
              <ArrowDownLeft />
            </span>
            <span className="contact-map-coordinate" aria-hidden="true">
              {copy("mapCoordinate")}
            </span>
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
