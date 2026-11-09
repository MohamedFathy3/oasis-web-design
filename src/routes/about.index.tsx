import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesColumnIncreasing,
  Lightbulb,
  Search,
  TrendingUp,
} from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { Language, SectionId } from "@/components/showcase/types";
import { ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import { canonicalUrl } from "@/lib/seo";
import { getPageCopy, useCMS } from "@/lib/cms";
import { loadSiteConfig } from "@/lib/cms-loader";
import aboutHeroImage from "@/assets/about.png";
export const Route = createFileRoute("/about/")({
  component: AboutPage,
  loader: async () => ({ siteConfig: await loadSiteConfig() }),
  head: ({ loaderData }) => ({
    links: [{ rel: "canonical", href: canonicalUrl("/about") }],
    meta: [
      { title: loaderData?.siteConfig.content.pages.about.seoTitle.en },
      {
        name: "description",
        content: loaderData?.siteConfig.content.pages.about.seoDescription.en,
      },
      { property: "og:title", content: loaderData?.siteConfig.content.pages.about.seoTitle.en },
      { property: "og:url", content: canonicalUrl("/about") },
      {
        property: "og:description",
        content: loaderData?.siteConfig.content.pages.about.seoDescription.en,
      },
    ],
  }),
});

function AboutPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const { config } = useCMS();
  const copy = (key: string) => getPageCopy(config, "about", key, language);
  const ar = language === "ar";

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
    <div className="site about-page" dir={ar ? "rtl" : "ltr"}>
      <ShowcaseHeader
        language={language}
        darkMode={darkMode}
        activeSection="about"
        onNavigate={navigateToSection}
        onToggleTheme={toggleTheme}
        onLanguageChange={changeLanguage}
      />
      <main>
        <section className="about-hero" aria-labelledby="about-title">
          <div className="section-inner about-hero-inner">
            <div className="about-hero-copy">
              <p className="section-eyebrow">{copy("heroEyebrow")}</p>
              <h1 id="about-title">
                {copy("heroTitle")}
                <br />
                <span>{copy("heroTitleAccent")}</span>
              </h1>
              <p>{copy("heroDescription")}</p>
              <a className="about-hero-cta" href="#about-story">
                {copy("heroCta")}
                <ArrowDown aria-hidden="true" />
              </a>
            </div>
            <div className="about-hero-art">
              <img src={aboutHeroImage} alt={copy("heroImageAlt")} />
              <span className="about-hero-art-caption">{copy("heroCaption")}</span>
              <span className="about-hero-art-stamp" aria-hidden="true">
                VZ
                <br />
                STUDIO
              </span>
            </div>
          </div>
        </section>

        <section
          className="about-story section"
          id="about-story"
          aria-labelledby="about-story-title"
        >
          <div className="section-inner about-story-inner">
            <div className="about-story-label">
              <span className="section-eyebrow">{copy("storyEyebrow")}</span>
              <span className="about-story-index">01 / VZ</span>
            </div>
            <div className="about-story-copy">
              <h2 id="about-story-title">{copy("storyTitle")}</h2>
              <p>{copy("storyParagraph1")}</p>
              <p>{copy("storyParagraph2")}</p>
              <Link className="about-inline-link" to="/projects">
                {copy("storyCta")}
                {ar ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
              </Link>
            </div>
          </div>
        </section>

        <section className="about-values section" aria-labelledby="about-values-title">
          <div className="section-inner">
            <div className="about-values-heading">
              <div>
                <p className="section-eyebrow">{copy("valuesEyebrow")}</p>
                <h2 id="about-values-title">{copy("valuesTitle")}</h2>
              </div>
              <p>{copy("valuesDescription")}</p>
            </div>
            <div className="about-values-grid">
              {[0, 1, 2].map((index) => {
                const Icon = [Search, Lightbulb, ChartNoAxesColumnIncreasing][index] ?? Search;
                return (
                  <article className="about-value-card" key={index}>
                    <span className="about-value-number">0{index + 1}</span>
                    <span className="about-value-icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <h3>{copy(`value${index + 1}Title`)}</h3>
                    <p>{copy(`value${index + 1}Text`)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="about-approach section" aria-labelledby="about-approach-title">
          <div className="section-inner about-approach-inner">
            <div>
              <p className="section-eyebrow">{copy("approachEyebrow")}</p>
              <h2 id="about-approach-title">{copy("approachTitle")}</h2>
              <p>{copy("approachDescription")}</p>
            </div>
            <div className="about-approach-mark" aria-hidden="true">
              <TrendingUp />
              <span>
                {copy("approachMarkFirst")}
                <br />
                {copy("approachMarkSecond")}
              </span>
            </div>
          </div>
        </section>

        <section className="about-cta section">
          <div className="section-inner about-cta-inner">
            <div>
              <p className="section-eyebrow">{copy("ctaEyebrow")}</p>
              <h2>{copy("ctaTitle")}</h2>
              <p>{copy("ctaDescription")}</p>
            </div>
            <Link to="/" hash="contact" className="about-cta-link">
              {copy("ctaButton")}
              <ArrowUpRight aria-hidden="true" />
            </Link>
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
