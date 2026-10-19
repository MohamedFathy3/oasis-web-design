import { useEffect, useState } from "react";
import { ArrowDown, ArrowDownLeft } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShowcaseContact, ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import type { Language, SectionId } from "@/components/showcase/types";
import { loadSiteConfig } from "@/lib/cms-loader";
import { useCMS, usePageTranslate } from "@/lib/cms";
import { canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/contact/")({
  loader: async () => {
    const config = await loadSiteConfig();
    return { seo: config.pageMeta["contact"] };
  },
  component: ContactPage,
  head: ({ loaderData }) => {
    const seo = loaderData?.seo;
    const pageUrl = canonicalUrl("/contact");
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

function ContactPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const ar = language === "ar";
  const t = usePageTranslate(language);
  const { config } = useCMS();

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
            src={config.pageAssets["aboutHero"]}
            alt={t("Creative digital work by Viral Zoom", "أعمال رقمية إبداعية من فايرال زوم")}
          />
          <div className="contact-page-hero-shade" />
          <div className="contact-page-hero-content">
            <p className="section-eyebrow">
              {t("LET'S MAKE SOMETHING GREAT", "يلا نعمل حاجة مميزة")}
            </p>
            <h1 id="contact-page-title">
              {t("Let's talk", "خلّينا")}
              <br />
              <span>{t("about your next idea.", "نتكلم عن فكرتك الجاية.")}</span>
            </h1>
            <p>
              {t(
                "A new project, a big idea or just a question — we're ready to listen.",
                "مشروع جديد، فكرة كبيرة أو حتى استفسار — إحنا جاهزين نسمعك.",
              )}
            </p>
            <a className="contact-page-hero-cta" href="#contact">
              {t("Get in touch", "تواصل معنا")}
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
          <img
            className="contact-map-image"
            src={config.pageAssets["contactWorldMap"]}
            alt=""
            aria-hidden="true"
          />
          <div className="contact-map-shade" />
          <div className="section-inner contact-map-content">
            <div>
              <p className="contact-map-eyebrow">
                {t("GOOD IDEAS TRAVEL", "الأفكار الحلوة بتوصل")}
              </p>
              <h2 id="contact-map-title">{t("One connected world.", "عالم واحد يجمعنا.")}</h2>
              <p>
                {t(
                  "Wherever you are, let's make something meaningful together.",
                  "أينما كنت، يلا نعمل حاجة ليها معنى سوا.",
                )}
              </p>
            </div>
            <span className="contact-map-mark" aria-hidden="true">
              VZ
              <ArrowDownLeft />
            </span>
            <span className="contact-map-coordinate" aria-hidden="true">
              CREATIVE CONNECTIONS — EVERYWHERE
            </span>
          </div>
        </section>
      </main>
      <ShowcaseFooter language={language} onBackToTop={backToTop} />
    </div>
  );
}
