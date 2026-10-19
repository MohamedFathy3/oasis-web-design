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
import { loadSiteConfig } from "@/lib/cms-loader";
import { useCMS, usePageTranslate } from "@/lib/cms";
import { canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/about/")({
  loader: async () => {
    const config = await loadSiteConfig();
    return { seo: config.pageMeta["about"] };
  },
  component: AboutPage,
  head: ({ loaderData }) => {
    const seo = loaderData?.seo;
    const pageUrl = canonicalUrl("/about");
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

const values = [
  {
    icon: Search,
    title: { en: "Start with insight", ar: "نبدأ بالفهم" },
    text: {
      en: "We learn about your brand, your audience and your goals before shaping the right direction.",
      ar: "نفهم علامتك وجمهورك وأهدافك قبل ما نحدد الاتجاه المناسب.",
    },
  },
  {
    icon: Lightbulb,
    title: { en: "Make ideas matter", ar: "نحوّل الأفكار لتأثير" },
    text: {
      en: "We bring creative thinking and practical strategy together to make every touchpoint count.",
      ar: "نجمع بين الإبداع والاستراتيجية العملية عشان كل نقطة تواصل يكون ليها أثر.",
    },
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: { en: "Build for progress", ar: "نبني للتطور" },
    text: {
      en: "We test, learn and refine the work, keeping the focus on meaningful progress for your brand.",
      ar: "نختبر ونتعلم ونطوّر شغلنا، مع تركيزنا على تقدم حقيقي لعلامتك التجارية.",
    },
  },
];

function AboutPage() {
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
              <p className="section-eyebrow">{t("ABOUT VIRAL ZOOM", "عن فايرال زوم")}</p>
              <h1 id="about-title">
                {t("We turn bold ideas", "نحوّل الأفكار")}
                <br />
                <span>{t("into real impact.", "الجريئة لتأثير حقيقي.")}</span>
              </h1>
              <p>
                {t(
                  "We are a creative and digital agency bringing strategy, design and technology together to help brands move forward.",
                  "إحنا وكالة إبداعية ورقمية بنجمع الاستراتيجية والتصميم والتكنولوجيا عشان نساعد العلامات التجارية تتقدم.",
                )}
              </p>
              <a className="about-hero-cta" href="#about-story">
                {t("Get to know us", "اعرفنا أكتر")}
                <ArrowDown aria-hidden="true" />
              </a>
            </div>
            <div className="about-hero-art">
              <img
                src={config.pageAssets["aboutHero"]}
                alt={t(
                  "A creative digital project by Viral Zoom",
                  "مشروع رقمي إبداعي من فايرال زوم",
                )}
              />
              <span className="about-hero-art-caption">
                {t("Ideas made visible", "أفكار تتحول لواقع")}
              </span>
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
              <span className="section-eyebrow">{t("WHO WE ARE", "مين إحنا")}</span>
              <span className="about-story-index">01 / VZ</span>
            </div>
            <div className="about-story-copy">
              <h2 id="about-story-title">
                {t(
                  "A creative partner for brands ready to grow.",
                  "شريك إبداعي للعلامات اللي مستعدة تكبر.",
                )}
              </h2>
              <p>
                {t(
                  "At Viral Zoom, we bring creative services and digital solutions together under one roof. From brand identity and content to websites, campaigns and production, we help shape consistent experiences that connect with people.",
                  "في فايرال زوم، بنجمع الخدمات الإبداعية والحلول الرقمية في مكان واحد. من الهوية والمحتوى للمواقع والحملات والإنتاج، بنساعد في بناء تجارب متناسقة تقرّب علامتك من جمهورها.",
                )}
              </p>
              <p>
                {t(
                  "Every project starts with understanding what makes your business different. Then we turn that understanding into clear ideas, thoughtful design and work made to support your next step.",
                  "كل مشروع بيبدأ بفهم اللي بيميّز شغلك. بعدها نحوّل الفهم لأفكار واضحة وتصميم مدروس وشغل يساعدك تاخد خطوتك الجاية.",
                )}
              </p>
              <Link className="about-inline-link" to="/projects">
                {t("Explore selected projects", "شوف مشاريعنا")}
                {ar ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
              </Link>
            </div>
          </div>
        </section>

        <section className="about-values section" aria-labelledby="about-values-title">
          <div className="section-inner">
            <div className="about-values-heading">
              <div>
                <p className="section-eyebrow">{t("HOW WE THINK", "طريقة تفكيرنا")}</p>
                <h2 id="about-values-title">{t("Creative with purpose.", "إبداع له هدف.")}</h2>
              </div>
              <p>
                {t(
                  "Good work is more than a good-looking idea. It should make sense for your brand and move you toward a goal.",
                  "الشغل الحلو مش مجرد شكل جذاب؛ لازم يناسب علامتك ويقرّبك من هدفك.",
                )}
              </p>
            </div>
            <div className="about-values-grid">
              {values.map(({ icon: Icon, title, text }, index) => (
                <article className="about-value-card" key={title.en}>
                  <span className="about-value-number">0{index + 1}</span>
                  <span className="about-value-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{t(title.en, title.ar)}</h3>
                  <p>{t(text.en, text.ar)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-approach section" aria-labelledby="about-approach-title">
          <div className="section-inner about-approach-inner">
            <div>
              <p className="section-eyebrow">{t("OUR APPROACH", "منهجيتنا")}</p>
              <h2 id="about-approach-title">
                {t(
                  "Think clearly. Create boldly. Keep growing.",
                  "فكّر بوضوح. ابتكر بجرأة. واستمر في التطور.",
                )}
              </h2>
              <p>
                {t(
                  "We work through a clear cycle: understand the opportunity, create and test ideas, learn from what happens, then build on what works.",
                  "بنتبع خطوات واضحة: نفهم الفرصة، نبتكر ونختبر الأفكار، نتعلم من النتائج، وبعدها نطوّر اللي أثبت نجاحه.",
                )}
              </p>
            </div>
            <div className="about-approach-mark" aria-hidden="true">
              <TrendingUp />
              <span>
                IDEAS
                <br />
                IN MOTION
              </span>
            </div>
          </div>
        </section>

        <section className="about-cta section">
          <div className="section-inner about-cta-inner">
            <div>
              <p className="section-eyebrow">
                {t("LET'S BUILD WHAT'S NEXT", "يلا نبدأ خطوتك الجاية")}
              </p>
              <h2>{t("Have an idea in mind?", "عندك فكرة في بالك؟")}</h2>
              <p>
                {t(
                  "Tell us what you are working toward. We would love to hear about it.",
                  "احكيلنا عن هدفك، ويسعدنا نسمع فكرتك.",
                )}
              </p>
            </div>
            <Link to="/" hash="contact" className="about-cta-link">
              {t("Start a conversation", "ابدأ كلامنا")}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <ShowcaseFooter language={language} onBackToTop={backToTop} />
    </div>
  );
}
