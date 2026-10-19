import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShowcaseFooter, ShowcaseHeader } from "@/components/showcase";
import type { Language, SectionId } from "@/components/showcase/types";
import { useCMS, usePageTranslate } from "@/lib/cms";
import { absoluteSiteAsset, canonicalUrl } from "@/lib/seo";
import { loadSiteConfig } from "@/lib/cms-loader";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    const config = await loadSiteConfig();
    const services = config.services.map((item) => ({
      slug: item.id,
      title: item.name,
      description: item.description,
      image: item.image,
    }));
    const service = services.find((item) => item.slug === params.slug) ?? null;
    return { slug: params.slug, service, services };
  },
  head: ({ loaderData }) => {
    const data = loaderData ?? { slug: "service", service: null };
    const title = data.service?.title.ar ?? data.slug;
    const descriptionEn = data.service?.description.en ?? "Viral Zoom digital services.";
    const descriptionAr = data.service?.description.ar ?? "خدمات فايرال زوم الرقمية.";
    const pageUrl = canonicalUrl(`/services/${encodeURIComponent(data.slug)}`);
    return {
      links: [{ rel: "canonical", href: pageUrl }],
      meta: [
        { title: `${title} | Viral Zoom` },
        { name: "description", content: `${descriptionAr} ${descriptionEn}`.slice(0, 160) },
        { property: "og:title", content: `${title} | Viral Zoom` },
        { property: "og:url", content: pageUrl },
        { property: "og:description", content: descriptionEn.slice(0, 160) },
        ...(data.service
          ? [{ property: "og:image", content: absoluteSiteAsset(data.service.image) }]
          : []),
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${title} | Viral Zoom` },
        { name: "twitter:description", content: descriptionAr.slice(0, 160) },
        ...(data.service
          ? [{ name: "twitter:image", content: absoluteSiteAsset(data.service.image) }]
          : []),
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            url: pageUrl,
            name: data.service?.title.en ?? data.slug,
            description: descriptionEn,
            ...(data.service ? { image: data.service.image } : {}),
            provider: { "@type": "Organization", name: "Viral Zoom" },
          }),
        },
      ],
    };
  },
  component: ShowServicePage,
});

function ShowServicePage() {
  const routeData = Route.useLoaderData();
  const { config, ready } = useCMS();
  const liveService = ready
    ? config.services.find((item) => item.id === routeData.slug && item.enabled)
    : undefined;
  const service = liveService
    ? {
        slug: liveService.id,
        title: liveService.name,
        description: liveService.description,
        image: liveService.image,
      }
    : ((!ready ? routeData.service : null) ?? {
        slug: routeData.slug,
        title: { en: routeData.slug, ar: routeData.slug },
        description: { en: "", ar: "" },
        image: "",
      });
  const serviceExists = ready ? Boolean(liveService) : Boolean(routeData.service);
  const [language, setLanguage] = useState<Language>("en");
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();
  const ar = language === "ar";
  const t = usePageTranslate(language);

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
    document.title = `${service.title.ar} | Viral Zoom`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", service.description.ar.slice(0, 160));
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", `${service.title.ar} | Viral Zoom`);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", service.description.ar.slice(0, 160));
  }, [service.title, service.description]);

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

  const currentServices = ready
    ? config.services
        .filter((item) => item.enabled)
        .map((item) => ({
          slug: item.id,
          title: item.name,
          description: item.description,
          image: item.image,
        }))
    : routeData.services;
  const serviceIndex = currentServices.findIndex((item) => item.slug === service.slug);
  const relatedServices = currentServices.filter((item) => item.slug !== service.slug).slice(0, 3);
  const serviceIntro = truncateServiceCopy(service.description[language], 190);

  if (ready && !serviceExists) {
    return (
      <main className="section-inner" style={{ paddingBlock: 120 }}>
        <h1>{t("Service not found", "الخدمة غير موجودة")}</h1>
        <Link to="/services">{t("Browse services", "تصفح الخدمات")}</Link>
      </main>
    );
  }

  return (
    <div className="site service-detail-page" dir={ar ? "rtl" : "ltr"}>
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
        <section className="service-detail-hero" aria-labelledby="service-detail-title">
          <img className="service-detail-hero-image" src={service.image} alt="" />
          <div className="service-detail-hero-shade" />
          <div className="section-inner service-detail-hero-content">
            <Link to="/services" className="service-detail-back">
              {ar ? <ArrowRight aria-hidden="true" /> : <ArrowLeft aria-hidden="true" />}
              {t("All services", "كل الخدمات")}
            </Link>
            <p className="service-detail-eyebrow">
              {t("VIRAL ZOOM / SERVICE", "فايرال زوم / خدماتنا")}{" "}
              <span>{String(serviceIndex + 1).padStart(2, "0")}</span>
            </p>
            <h1 id="service-detail-title">{service.title[language]}</h1>
            <p className="service-detail-lead">{serviceIntro}</p>
            <Link to="/" hash="contact" className="service-detail-cta">
              {t("Start a project", "ابدأ مشروعك")}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section
          className="service-detail-content section"
          aria-labelledby="service-overview-title"
        >
          <div className="section-inner service-detail-content-grid">
            <div className="service-detail-overview">
              <p className="section-eyebrow">
                {t("THE RIGHT MOVE FOR YOUR BRAND", "الخطوة الصح لعلامتك")}
              </p>
              <h2 id="service-overview-title">
                {t("Make your next move count.", "خلّي خطوتك الجاية تفرق.")}
              </h2>
            </div>
            <div className="service-detail-description">
              <h3>{t("How we help", "إزاي بنساعدك")}</h3>
              <p>{service.description[language]}</p>
              <p>
                {t(
                  "We shape every project around your goals, your audience and the way your brand needs to grow. Our team brings the right creative and strategic thinking together to deliver work that feels distinctive and works hard for your business.",
                  "بنصمم كل مشروع على حسب أهدافك وجمهورك وطريقة نمو علامتك التجارية. فريقنا بيجمع الإبداع والتفكير الاستراتيجي عشان نقدم شغل مميز ويدعم نجاح أعمالك.",
                )}
              </p>
              <Link to="/" hash="contact" className="service-detail-text-link">
                {t("Talk to our team", "اتكلم مع فريقنا")}
                {ar ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
              </Link>
            </div>
          </div>
        </section>

        <section
          className="service-detail-related section"
          aria-labelledby="related-services-title"
        >
          <div className="section-inner">
            <div className="section-heading">
              <div>
                <p className="section-eyebrow">
                  {t("MORE WAYS TO GROW", "خدمات تانية لتنمية شغلك")}
                </p>
                <h2 id="related-services-title">{t("Explore our services", "اكتشف خدماتنا")}</h2>
              </div>
              <Link to="/services" className="service-detail-text-link">
                {t("All services", "كل الخدمات")}
                {ar ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
              </Link>
            </div>
            <div className="service-detail-related-grid">
              {relatedServices.map((item) => (
                <Link
                  to="/services/$slug"
                  params={{ slug: item.slug }}
                  className="service-detail-related-card"
                  key={item.slug}
                >
                  <img src={item.image} alt="" loading="lazy" />
                  <span>{item.title[language]}</span>
                  {ar ? <ArrowLeft aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <ShowcaseFooter
        language={language}
        onBackToTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </div>
  );
}

function truncateServiceCopy(copy: string, limit: number) {
  if (copy.length <= limit) return copy;
  const lastWordBoundary = copy.lastIndexOf(" ", limit);
  return `${copy.slice(0, lastWordBoundary > 0 ? lastWordBoundary : limit).trimEnd()}…`;
}
