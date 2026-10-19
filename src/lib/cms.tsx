import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { services as baseServices } from "@/lib/showcase-data";
import generatedPageCopy from "@/lib/page-copy.generated.json";
import {
  projects as baseProjects,
  type Project,
  type ProjectCategoryId,
  type SocialMediaShowcase,
} from "@/lib/projects";
import c0 from "@/assets/client-0.jpg.asset.json";
import c1 from "@/assets/client-1.jpg.asset.json";
import c2 from "@/assets/client-2.jpg.asset.json";
import c3 from "@/assets/client-3.jpg.asset.json";
import c4 from "@/assets/client-4.jpg.asset.json";
import c5 from "@/assets/client-5.jpg.asset.json";
import c6 from "@/assets/client-6.jpg.asset.json";
import c7 from "@/assets/client-7.jpg.asset.json";
import c8 from "@/assets/client-8.jpg.asset.json";
import c9 from "@/assets/client-9.jpg.asset.json";
import hero from "@/assets/hero.mp4.asset.json";
import logo from "@/assets/logo.png.asset.json";
import whiteLogo from "@/assets/logo-white.png.asset.json";

export type Bilingual = { en: string; ar: string };
export type EditableItem = {
  id: string;
  name: Bilingual;
  description: Bilingual;
  image: string;
  link?: string;
  enabled: boolean;
  projectCategory?: ProjectCategoryId;
  additionalCategories?: ProjectCategoryId[];
  projectKind?: "case-study" | "external";
  projectUrl?: string;
  imageGallery?: string[];
  socialMediaShowcase?: SocialMediaShowcase;
};
export type PageSeo = {
  title: Bilingual;
  description: Bilingual;
  ogTitle: Bilingual;
  ogDescription: Bilingual;
};
export type SiteConfig = {
  pageMeta: Record<string, PageSeo>;
  pageCopy: Record<string, Bilingual>;
  pageAssets: Record<string, string>;
  brand: { name: string; accent: string; logo: string; whiteLogo: string };
  hero: { title: Bilingual; subtitle: Bilingual; video: string; poster: string };
  sections: Record<
    "services" | "portfolio" | "clients" | "process" | "banner" | "contact",
    boolean
  >;
  services: EditableItem[];
  portfolio: EditableItem[];
  clients: EditableItem[];
  contact: { email: string; phone: string; whatsapp: string; address: Bilingual };
};

export const initialConfig: SiteConfig = {
  pageMeta: {
    home: {
      title: {
        en: "Viral Zoom — Creative & Digital Agency",
        ar: "فايرال زوم — وكالة إبداعية ورقمية",
      },
      description: {
        en: "Creative ideas, digital marketing and production that help ambitious brands grow.",
        ar: "أفكار إبداعية وتسويق رقمي وإنتاج يساعد العلامات التجارية الطموحة على النمو.",
      },
      ogTitle: {
        en: "Viral Zoom | Creative Digital Agency",
        ar: "فايرال زوم | وكالة إبداعية رقمية",
      },
      ogDescription: {
        en: "Strategy, design, marketing and production for brands ready to grow.",
        ar: "استراتيجية وتصميم وتسويق وإنتاج للعلامات التجارية المستعدة للنمو.",
      },
    },
    about: {
      title: { en: "About Viral Zoom — Creative Agency", ar: "من نحن — فايرال زوم" },
      description: {
        en: "Meet Viral Zoom, a creative and digital agency bringing strategy, design and technology together.",
        ar: "تعرف على فايرال زوم، وكالة إبداعية ورقمية تجمع الاستراتيجية والتصميم والتكنولوجيا.",
      },
      ogTitle: { en: "About Viral Zoom", ar: "عن فايرال زوم" },
      ogDescription: {
        en: "A creative partner for brands ready to grow.",
        ar: "شريك إبداعي للعلامات التجارية المستعدة للنمو.",
      },
    },
    contact: {
      title: { en: "Contact Viral Zoom — Let's Talk", ar: "تواصل مع فايرال زوم" },
      description: {
        en: "Have a project in mind? Get in touch with the Viral Zoom creative team.",
        ar: "عندك مشروع في بالك؟ تواصل مع فريق فايرال زوم الإبداعي.",
      },
      ogTitle: { en: "Contact Viral Zoom", ar: "تواصل مع فايرال زوم" },
      ogDescription: {
        en: "Tell us what you are looking to create and let's start a conversation.",
        ar: "احكيلنا عما تريد تنفيذه ولنبدأ الحوار.",
      },
    },
    services: {
      title: { en: "Our Services — Viral Zoom", ar: "خدمات فايرال زوم" },
      description: {
        en: "Explore the creative, digital marketing and production services offered by Viral Zoom.",
        ar: "اكتشف خدمات فايرال زوم الإبداعية والتسويقية والإنتاجية.",
      },
      ogTitle: {
        en: "Viral Zoom Digital Marketing and Creative Services",
        ar: "خدمات التسويق الرقمي والإبداع من فايرال زوم",
      },
      ogDescription: {
        en: "Web design, digital marketing, social media and creative production.",
        ar: "تصميم مواقع وتسويق رقمي وإدارة سوشيال ميديا وإنتاج إبداعي.",
      },
    },
    projects: {
      title: { en: "Our Projects — Viral Zoom", ar: "أعمال فايرال زوم" },
      description: {
        en: "Explore Viral Zoom projects in social media, web design, apps and brand identity.",
        ar: "تصفح مشاريع فايرال زوم في السوشيال ميديا وتصميم المواقع والتطبيقات والهوية البصرية.",
      },
      ogTitle: {
        en: "Viral Zoom Creative and Marketing Projects",
        ar: "أعمال فايرال زوم في التسويق والتصميم",
      },
      ogDescription: {
        en: "Selected social media, website, app and brand identity projects.",
        ar: "مشاريع مختارة في السوشيال ميديا والمواقع والتطبيقات والهوية البصرية.",
      },
    },
  },
  pageCopy: generatedPageCopy as Record<string, Bilingual>,
  pageAssets: {
    aboutHero: "/media/campaign/social-02.webp",
    showcaseBanner: "/media/site/showcase-banner.png",
    contactWorldMap: "/media/site/world-map.png",
    heroPoster: "/media/video/social-campaign-poster.jpg",
    heroVideoWebm: "/media/video/social-campaign-reel.webm",
    projectsVideoMp4: "/media/video/social-campaign-reel.mp4",
    projectsVideoWebm: "/media/video/social-campaign-reel.webm",
    projectsVideoPoster: "/media/video/social-campaign-poster.jpg",
    serviceFallback: "/media/campaign/social-02.webp",
  },
  brand: { name: "Viral Zoom", accent: "#69499e", logo: logo.url, whiteLogo: whiteLogo.url },
  hero: {
    title: { en: "Creative & Digital Marketing", ar: "الإبداع والتسويق الرقمي" },
    subtitle: {
      en: "Ideas that make your brand impossible to ignore.",
      ar: "أفكار تجعل علامتك التجارية مستحيلة التجاهل.",
    },
    video: hero.url,
    poster: "",
  },
  sections: {
    services: false,
    portfolio: true,
    clients: true,
    process: true,
    banner: true,
    contact: true,
  },
  services: baseServices.map((item) => ({
    id: item.slug,
    name: item.title,
    description: item.description,
    image: item.image,
    link: `/services/${item.slug}`,
    enabled: true,
  })),
  portfolio: baseProjects.map((item) => ({
    id: item.slug,
    name: { en: item.localizedName?.en ?? item.name, ar: item.localizedName?.ar ?? item.name },
    description: item.description,
    image: item.image,
    link: item.kind === "external" ? item.url : `/projects/${item.slug}`,
    enabled: true,
    projectCategory: item.category,
    ...(item.additionalCategories ? { additionalCategories: item.additionalCategories } : {}),
    projectKind: item.kind,
    ...(item.kind === "external" ? { projectUrl: item.url } : {}),
    ...(item.kind === "case-study" && item.imageGallery ? { imageGallery: item.imageGallery } : {}),
    ...(item.kind === "case-study" && item.socialMediaShowcase
      ? { socialMediaShowcase: item.socialMediaShowcase }
      : {}),
  })),
  clients: [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9].map((item, i) => ({
    id: `client-${i + 1}`,
    name: { en: `Client ${i + 1}`, ar: `عميل ${i + 1}` },
    description: { en: "", ar: "" },
    image: item.url,
    enabled: true,
  })),
  contact: {
    email: "info@viralzoom.com",
    phone: "",
    whatsapp: "",
    address: { en: "Cairo, Egypt", ar: "القاهرة، مصر" },
  },
};

export function projectItemsFromConfig(items: EditableItem[]): Project[] {
  return items
    .filter((item) => !/(?:\s+\(copy\))+$/i.test(item.name.en))
    .map((item) => {
      const original = baseProjects.find((project) => project.slug === item.id);
      const category = item.projectCategory ?? original?.category ?? "branding";
      const extra = item.additionalCategories ?? original?.additionalCategories;
      if (item.projectKind === "external" || original?.kind === "external") {
        const originalExternal = original?.kind === "external" ? original : undefined;
        return {
          ...(originalExternal ?? {}),
          slug: item.id,
          name: item.name.en,
          localizedName: item.name,
          category,
          ...(extra ? { additionalCategories: extra } : {}),
          kind: "external" as const,
          projectType: originalExternal?.projectType ?? ("website" as const),
          url: item.projectUrl ?? item.link ?? originalExternal?.url ?? "/",
          image: item.image,
          description: item.description,
        };
      }
      const originalCase = original?.kind === "case-study" ? original : undefined;
      const gallery = item.imageGallery ?? originalCase?.imageGallery;
      const showcase = item.socialMediaShowcase ?? originalCase?.socialMediaShowcase;
      return {
        ...(originalCase ?? {}),
        slug: item.id,
        name: item.name.en,
        localizedName: item.name,
        category,
        ...(extra ? { additionalCategories: extra } : {}),
        kind: "case-study" as const,
        image: item.image,
        description: item.description,
        ...(gallery ? { imageGallery: gallery } : {}),
        ...(showcase ? { socialMediaShowcase: showcase } : {}),
      };
    });
}

type CMSContextValue = {
  config: SiteConfig;
  ready: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
  setConfig: (next: SiteConfig) => Promise<void>;
  reset: () => Promise<void>;
};
const CMSContext = createContext<CMSContextValue | null>(null);

function isBilingual(value: unknown): value is Bilingual {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>)["en"] === "string" &&
    typeof (value as Record<string, unknown>)["ar"] === "string"
  );
}

export function isSiteConfig(value: unknown): value is SiteConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<SiteConfig>;
  return (
    !!config.pageMeta &&
    typeof config.pageMeta === "object" &&
    Object.values(config.pageMeta).every(
      (seo) =>
        isBilingual(seo.title) &&
        isBilingual(seo.description) &&
        isBilingual(seo.ogTitle) &&
        isBilingual(seo.ogDescription),
    ) &&
    !!config.pageCopy &&
    typeof config.pageCopy === "object" &&
    !!config.pageAssets &&
    typeof config.pageAssets === "object" &&
    Object.values(config.pageAssets).every((url) => typeof url === "string") &&
    Object.values(config.pageCopy).every(isBilingual) &&
    !!config.brand &&
    typeof config.brand.name === "string" &&
    typeof config.brand.accent === "string" &&
    typeof config.brand.logo === "string" &&
    typeof config.brand.whiteLogo === "string" &&
    !!config.hero &&
    isBilingual(config.hero.title) &&
    isBilingual(config.hero.subtitle) &&
    typeof config.hero.video === "string" &&
    typeof config.hero.poster === "string" &&
    !!config.sections &&
    ["services", "portfolio", "clients", "process", "banner", "contact"].every(
      (key) => typeof config.sections?.[key as keyof SiteConfig["sections"]] === "boolean",
    ) &&
    !!config.contact &&
    typeof config.contact.email === "string" &&
    typeof config.contact.phone === "string" &&
    typeof config.contact.whatsapp === "string" &&
    isBilingual(config.contact.address) &&
    Array.isArray(config.services) &&
    Array.isArray(config.portfolio) &&
    Array.isArray(config.clients)
  );
}

function mergeConfig(saved: SiteConfig): SiteConfig {
  return {
    ...initialConfig,
    ...saved,
    pageMeta: { ...initialConfig.pageMeta, ...saved.pageMeta },
    pageCopy: { ...initialConfig.pageCopy, ...saved.pageCopy },
    pageAssets: { ...initialConfig.pageAssets, ...saved.pageAssets },
    brand: { ...initialConfig.brand, ...saved.brand },
    hero: {
      ...initialConfig.hero,
      ...saved.hero,
      title: { ...initialConfig.hero.title, ...saved.hero?.title },
      subtitle: { ...initialConfig.hero.subtitle, ...saved.hero?.subtitle },
    },
    sections: { ...initialConfig.sections, ...saved.sections },
    contact: {
      ...initialConfig.contact,
      ...saved.contact,
      address: { ...initialConfig.contact.address, ...saved.contact?.address },
    },
    services: Array.isArray(saved.services) ? saved.services : initialConfig.services,
    portfolio: Array.isArray(saved.portfolio) ? saved.portfolio : initialConfig.portfolio,
    clients: Array.isArray(saved.clients) ? saved.clients : initialConfig.clients,
  };
}

async function persistConfig(config: SiteConfig) {
  const response = await fetch("/api/site", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(result.error || "Could not save site content.");
  }
}

export function CMSProvider({
  children,
  serverConfig,
}: {
  children: ReactNode;
  serverConfig?: SiteConfig;
}) {
  const [config, setConfigState] = useState<SiteConfig>(() =>
    serverConfig ? mergeConfig(serverConfig) : initialConfig,
  );
  const [ready, setReady] = useState(Boolean(serverConfig));
  const [loadError, setLoadError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await fetch("/api/site", { credentials: "same-origin" });
      if (!response.ok) throw new Error(`Content API returned ${response.status}`);
      const saved: unknown = await response.json();
      if (!isSiteConfig(saved))
        throw new Error("The content API returned an invalid site configuration.");
      setConfigState(mergeConfig(saved));
      setReady(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load site content.";
      setLoadError(message);
      throw error;
    }
  }, []);
  useEffect(() => {
    if (serverConfig) return;
    refresh().catch((error) => {
      console.error("Could not load content from the Node API.", error);
    });
  }, [refresh, serverConfig]);
  useEffect(() => {
    const syncPublishedContent = (event: StorageEvent) => {
      if (event.key !== "viral-zoom-cms-revision") return;
      void refresh().catch((error) => console.error("Could not sync published content.", error));
    };
    window.addEventListener("storage", syncPublishedContent);
    return () => window.removeEventListener("storage", syncPublishedContent);
  }, [refresh]);
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", config.brand.accent);
  }, [config.brand.accent]);
  const value = useMemo<CMSContextValue>(
    () => ({
      config,
      ready,
      loadError,
      refresh,
      async setConfig(next) {
        await persistConfig(next);
        setConfigState(mergeConfig(next));
        setLoadError(null);
        setReady(true);
        try {
          localStorage.setItem("viral-zoom-cms-revision", String(Date.now()));
        } catch {
          // Cross-tab refresh is optional when browser storage is unavailable.
        }
      },
      async reset() {
        await persistConfig(initialConfig);
        setConfigState(initialConfig);
        setLoadError(null);
        setReady(true);
        try {
          localStorage.setItem("viral-zoom-cms-revision", String(Date.now()));
        } catch {
          // Cross-tab refresh is optional when browser storage is unavailable.
        }
      },
    }),
    [config, ready, loadError, refresh],
  );
  return (
    <CMSContext.Provider value={value}>
      {!ready ? (
        <div className="cms-load-gate" role={loadError ? "alert" : "status"}>
          {loadError ? (
            <>
              <p>Could not load the website content from the server.</p>
              <small>{loadError}</small>
              <button onClick={() => refresh().catch((error) => console.error(error))}>
                Try again
              </button>
            </>
          ) : (
            <>
              <strong className="cms-load-brand">VZ</strong>
              <span className="cms-load-spinner" aria-hidden="true" />
            </>
          )}
        </div>
      ) : (
        children
      )}
    </CMSContext.Provider>
  );
}

export function useCMS() {
  const value = useContext(CMSContext);
  if (!value) throw new Error("useCMS must be used within CMSProvider");
  return value;
}

export function usePageTranslate(language: "en" | "ar") {
  const { config } = useCMS();
  return useCallback(
    (english: string, arabic: string) =>
      config.pageCopy[english]?.[language] ?? (language === "ar" ? arabic : english),
    [config.pageCopy, language],
  );
}
