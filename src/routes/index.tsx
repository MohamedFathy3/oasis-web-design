import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShowcaseClients,
  ShowcaseBanner,
  ShowcaseContact,
  ShowcaseFooter,
  ShowcaseHeader,
  ShowcaseHero,
  ShowcasePortfolio,
  ShowcaseProcess,
  ShowcaseServices,
} from "@/components/showcase";
import type { Language, SectionId } from "@/components/showcase/types";
import { useCMS } from "@/lib/cms";
import { absoluteSiteAsset, canonicalUrl } from "@/lib/seo";
import { loadSiteConfig } from "@/lib/cms-loader";

const HOME_PAGE_TITLE = "ViralZoom Agency";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async () => ({ siteConfig: await loadSiteConfig() }),
  head: ({ loaderData }) => ({
    links: [{ rel: "canonical", href: canonicalUrl("/") }],
    meta: [
      { title: HOME_PAGE_TITLE },
      {
        name: "description",
        content: loaderData?.siteConfig.content.pages.home.seoDescription.en,
      },
      { property: "og:title", content: HOME_PAGE_TITLE },
      {
        property: "og:description",
        content: loaderData?.siteConfig.content.pages.home.seoDescription.en,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl("/") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: HOME_PAGE_TITLE },
      {
        name: "twitter:description",
        content: loaderData?.siteConfig.content.pages.home.seoDescription.en,
      },
      {
        name: "twitter:image",
        content: absoluteSiteAsset(loaderData?.siteConfig.brand.logo ?? ""),
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: HOME_PAGE_TITLE,
          alternateName: "ViralZoom",
          url: canonicalUrl("/"),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: HOME_PAGE_TITLE,
          alternateName: "ViralZoom",
          url: canonicalUrl("/"),
          email: loaderData?.siteConfig.contact.email,
          logo: loaderData?.siteConfig.brand.logo,
          description: loaderData?.siteConfig.content.pages.home.seoDescription.en,
        }),
      },
    ],
  }),
});

function Index() {
  const { config, ready } = useCMS();
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const ar = language === "ar";

  useEffect(() => {
    let nextDarkMode = true;
    let nextLanguage: Language = "en";
    try {
      nextDarkMode = localStorage.getItem("viral-zoom-theme") !== "light";
      nextLanguage = localStorage.getItem("viral-zoom-language") === "ar" ? "ar" : "en";
    } catch {
      // Continue with English and light mode if browser storage is unavailable.
    }
    document.documentElement.classList.toggle("dark", nextDarkMode);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
    setDarkMode(nextDarkMode);
    setLanguage(nextLanguage);
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

  const goTo = (id: SectionId) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    setActiveSection(id);
  };

  if (!ready)
    return (
      <div className="cms-load-gate" role="status">
        <strong className="cms-load-brand">VZ</strong>
        <span className="cms-load-spinner" aria-hidden="true" />
      </div>
    );

  return (
    <div className="site" dir={ar ? "rtl" : "ltr"}>
      <ShowcaseHeader
        language={language}
        darkMode={darkMode}
        activeSection={activeSection}
        onNavigate={goTo}
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
        <ShowcaseHero language={language} />
        {ready && config.sections.services && <ShowcaseServices language={language} />}
        {ready && config.sections.portfolio && <ShowcasePortfolio language={language} />}
        {ready && config.sections.clients && <ShowcaseClients language={language} />}
        {ready && config.sections.process && <ShowcaseProcess language={language} />}
        {ready && config.sections.banner && <ShowcaseBanner language={language} />}
        {ready && config.sections.contact && <ShowcaseContact language={language} />}
      </main>
      <ShowcaseFooter
        language={language}
        logo={darkMode ? config.brand.whiteLogo : config.brand.logo}
        onBackToTop={() => goTo("home")}
      />
    </div>
  );
}
