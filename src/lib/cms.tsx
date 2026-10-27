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
import website from "@/assets/website.jpg.asset.json";

export type Bilingual = { en: string; ar: string };
export type AboutValue = { title: Bilingual; text: Bilingual };
export type ProcessStep = { name: Bilingual; description: Bilingual };
export type PageCopy = Record<string, Bilingual>;
type SeoPageCopy = PageCopy & { seoTitle: Bilingual; seoDescription: Bilingual };
export type PageContent = {
  common: PageCopy;
  home: SeoPageCopy;
  about: SeoPageCopy;
  services: SeoPageCopy;
  projects: SeoPageCopy;
  contact: SeoPageCopy;
  serviceDetail: PageCopy;
  projectDetail: PageCopy;
};
export type SiteContent = {
  about: {
    seoTitle: Bilingual;
    seoDescription: Bilingual;
    heroEyebrow: Bilingual;
    heroTitle: Bilingual;
    heroTitleAccent: Bilingual;
    heroDescription: Bilingual;
    heroCta: Bilingual;
    heroImageAlt: Bilingual;
    heroCaption: Bilingual;
    storyEyebrow: Bilingual;
    storyTitle: Bilingual;
    storyParagraphs: Bilingual[];
    storyCta: Bilingual;
    valuesEyebrow: Bilingual;
    valuesTitle: Bilingual;
    valuesDescription: Bilingual;
    values: AboutValue[];
    approachEyebrow: Bilingual;
    approachTitle: Bilingual;
    approachDescription: Bilingual;
    ctaEyebrow: Bilingual;
    ctaTitle: Bilingual;
    ctaDescription: Bilingual;
    ctaButton: Bilingual;
  };
  process: {
    eyebrow: Bilingual;
    title: Bilingual;
    intro: Bilingual;
    steps: ProcessStep[];
  };
  seo: {
    siteTitle: Bilingual;
    siteDescription: Bilingual;
    homeTitle: Bilingual;
    homeDescription: Bilingual;
    servicesTitle: Bilingual;
    projectsTitle: Bilingual;
    contactTitle: Bilingual;
  };
  pages: PageContent;
};
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
  reelsVideos?: string[];
  promoVideos?: string[];
  socialMediaShowcase?: SocialMediaShowcase;
};
export type SiteConfig = {
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
  content: SiteContent;
};

export const initialConfig: SiteConfig = {
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
    ...(item.kind === "case-study" && item.reelsVideos ? { reelsVideos: item.reelsVideos } : {}),
    ...(item.kind === "case-study" && item.promoVideos ? { promoVideos: item.promoVideos } : {}),
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
    email: "info@viralzoom.agency",
    phone: "01222291024",
    whatsapp: "",
    address: { en: "Cairo, Egypt", ar: "القاهرة، مصر" },
  },
  content: {
    about: {
      seoTitle: {
        en: "About Viral Zoom — Creative & Digital Agency",
        ar: "عن فايرال زوم — وكالة إبداعية ورقمية",
      },
      seoDescription: {
        en: "Meet Viral Zoom, a creative and digital agency combining strategy, design and technology to help brands grow.",
        ar: "تعرف على فايرال زوم، وكالة إبداعية ورقمية تجمع الاستراتيجية والتصميم والتكنولوجيا لتنمية العلامات التجارية.",
      },
      heroEyebrow: { en: "ABOUT VIRAL ZOOM", ar: "عن فايرال زوم" },
      heroTitle: { en: "We turn bold ideas", ar: "نحوّل الأفكار" },
      heroTitleAccent: { en: "into real impact.", ar: "الجريئة لتأثير حقيقي." },
      heroDescription: {
        en: "We are a creative and digital agency bringing strategy, design and technology together to help brands move forward.",
        ar: "إحنا وكالة إبداعية ورقمية بنجمع الاستراتيجية والتصميم والتكنولوجيا عشان نساعد العلامات التجارية تتقدم.",
      },
      heroCta: { en: "Get to know us", ar: "اعرفنا أكتر" },
      heroImageAlt: {
        en: "A creative digital project by Viral Zoom",
        ar: "مشروع رقمي إبداعي من فايرال زوم",
      },
      heroCaption: { en: "Ideas made visible", ar: "أفكار تتحول لواقع" },
      storyEyebrow: { en: "WHO WE ARE", ar: "مين إحنا" },
      storyTitle: {
        en: "A creative partner for brands ready to grow.",
        ar: "شريك إبداعي للعلامات اللي مستعدة تكبر.",
      },
      storyParagraphs: [
        {
          en: "At Viral Zoom, we bring creative services and digital solutions together under one roof. From brand identity and content to websites, campaigns and production, we help shape consistent experiences that connect with people.",
          ar: "في فايرال زوم، بنجمع الخدمات الإبداعية والحلول الرقمية في مكان واحد. من الهوية والمحتوى للمواقع والحملات والإنتاج، بنساعد في بناء تجارب متناسقة تقرّب علامتك من جمهورها.",
        },
        {
          en: "Every project starts with understanding what makes your business different. Then we turn that understanding into clear ideas, thoughtful design and work made to support your next step.",
          ar: "كل مشروع بيبدأ بفهم اللي بيميّز شغلك. بعدها نحوّل الفهم لأفكار واضحة وتصميم مدروس وشغل يساعدك تاخد خطوتك الجاية.",
        },
      ],
      storyCta: { en: "Explore selected projects", ar: "شوف مشاريعنا" },
      valuesEyebrow: { en: "HOW WE THINK", ar: "طريقة تفكيرنا" },
      valuesTitle: { en: "Creative with purpose.", ar: "إبداع له هدف." },
      valuesDescription: {
        en: "Good work is more than a good-looking idea. It should make sense for your brand and move you toward a goal.",
        ar: "الشغل الحلو مش مجرد شكل جذاب؛ لازم يناسب علامتك ويقرّبك من هدفك.",
      },
      values: [
        {
          title: { en: "Start with insight", ar: "نبدأ بالفهم" },
          text: {
            en: "We learn about your brand, your audience and your goals before shaping the right direction.",
            ar: "نفهم علامتك وجمهورك وأهدافك قبل ما نحدد الاتجاه المناسب.",
          },
        },
        {
          title: { en: "Make ideas matter", ar: "نحوّل الأفكار لتأثير" },
          text: {
            en: "We bring creative thinking and practical strategy together to make every touchpoint count.",
            ar: "نجمع بين الإبداع والاستراتيجية العملية عشان كل نقطة تواصل يكون ليها أثر.",
          },
        },
        {
          title: { en: "Build for progress", ar: "نبني للتطور" },
          text: {
            en: "We test, learn and refine the work, keeping the focus on meaningful progress for your brand.",
            ar: "نختبر ونتعلم ونطوّر شغلنا، مع تركيزنا على تقدم حقيقي لعلامتك التجارية.",
          },
        },
      ],
      approachEyebrow: { en: "OUR APPROACH", ar: "منهجيتنا" },
      approachTitle: {
        en: "Think clearly. Create boldly. Keep growing.",
        ar: "فكّر بوضوح. ابتكر بجرأة. واستمر في التطور.",
      },
      approachDescription: {
        en: "We work through a clear cycle: understand the opportunity, create and test ideas, learn from what happens, then build on what works.",
        ar: "بنتبع خطوات واضحة: نفهم الفرصة، نبتكر ونختبر الأفكار، نتعلم من النتائج، وبعدها نطوّر اللي أثبت نجاحه.",
      },
      ctaEyebrow: { en: "LET'S BUILD WHAT'S NEXT", ar: "يلا نبدأ خطوتك الجاية" },
      ctaTitle: { en: "Have an idea in mind?", ar: "عندك فكرة في بالك؟" },
      ctaDescription: {
        en: "Tell us what you are working toward. We would love to hear about it.",
        ar: "احكيلنا عن هدفك، ويسعدنا نسمع فكرتك.",
      },
      ctaButton: { en: "Start a conversation", ar: "ابدأ كلامنا" },
    },
    process: {
      eyebrow: { en: "THE VIRAL ZOOM METHOD", ar: "منهجية فايرال زوم" },
      title: {
        en: "Measure. Ideate. Experiment. Read. Scale.",
        ar: "حلّل. ابتكر. جرّب. قيّم. وسّع.",
      },
      intro: {
        en: "A clear, repeatable process for meaningful results.",
        ar: "خطوات واضحة ومتكررة لتحقيق نتائج مؤثرة.",
      },
      steps: [
        {
          name: { en: "Measure", ar: "حلّل" },
          description: { en: "Find the opportunity.", ar: "نكتشف الفرص المناسبة." },
        },
        {
          name: { en: "Ideate", ar: "ابتكر" },
          description: { en: "Turn insight into ideas.", ar: "نحوّل الرؤى إلى أفكار." },
        },
        {
          name: { en: "Experiment", ar: "جرّب" },
          description: { en: "Create. Test. Iterate.", ar: "نبتكر، نختبر، ونطوّر." },
        },
        {
          name: { en: "Read", ar: "حلّل النتائج" },
          description: { en: "Learn what works.", ar: "نتعلّم مما يحقق النتائج." },
        },
        {
          name: { en: "Scale", ar: "وسّع" },
          description: { en: "Do more of what works.", ar: "نوسّع أثر ما ينجح." },
        },
      ],
    },
    seo: {
      siteTitle: { en: "ViralZoom Agency", ar: "ViralZoom Agency" },
      siteDescription: {
        en: "Creative and digital marketing agency.",
        ar: "وكالة إبداعية ورقمية للتسويق والتصميم.",
      },
      homeTitle: {
        en: "ViralZoom Agency",
        ar: "ViralZoom Agency",
      },
      homeDescription: {
        en: "Ideas that make your brand impossible to ignore.",
        ar: "أفكار تجعل علامتك التجارية مستحيلة التجاهل.",
      },
      servicesTitle: { en: "Our Services | Viral Zoom", ar: "خدماتنا | فايرال زوم" },
      projectsTitle: { en: "Our Projects | Viral Zoom", ar: "أعمالنا | فايرال زوم" },
      contactTitle: { en: "Contact Viral Zoom", ar: "تواصل مع فايرال زوم" },
    },
    pages: {
      common: {
        navHome: { en: "HOME", ar: "الرئيسية" },
        navAbout: { en: "ABOUT", ar: "من نحن" },
        navContact: { en: "CONTACT", ar: "تواصل معنا" },
        navServices: { en: "SERVICES", ar: "خدماتنا" },
        navProjects: { en: "PROJECTS", ar: "مشاريعنا" },
        navClients: { en: "OUR CLIENTS", ar: "عملاؤنا" },
        footerCopyright: { en: "All rights reserved.", ar: "جميع الحقوق محفوظة." },
        footerBackToTop: { en: "Back to top", ar: "إلى أعلى" },
        contactHeading: { en: "SEND A MESSAGE", ar: "ابعتلنا رسالة" },
        contactEyebrow: { en: "LET'S CHAT", ar: "يلا نتكلم" },
        contactIntro: {
          en: "Have a project in mind? Tell us what you are looking to create.",
          ar: "عندك مشروع في بالك؟ احكيلنا نفسك تعمل إيه.",
        },
        contactFallback: {
          en: "Call us to talk through your next idea.",
          ar: "اتصل بينا واحكيلنا عن فكرتك الجديدة.",
        },
        contactFormNote: {
          en: "Send us a message and we’ll get back to you soon.",
          ar: "ابعتلنا رسالتك وهنرد عليك في أقرب وقت.",
        },
        contactFormSending: { en: "Sending your message…", ar: "جارٍ إرسال رسالتك…" },
        contactFormSuccess: { en: "Your message was sent successfully.", ar: "تم إرسال رسالتك بنجاح." },
        contactFormError: {
          en: "We couldn’t send your message. Please try again or email us directly.",
          ar: "ما قدرناش نبعت رسالتك. حاول تاني أو ابعتلنا على الإيميل مباشرة.",
        },
        contactName: { en: "Name", ar: "الاسم" },
        contactEmail: { en: "Email", ar: "البريد الإلكتروني" },
        contactSubject: { en: "Subject", ar: "الموضوع" },
        contactMessage: { en: "Message", ar: "اكتب رسالتك" },
        contactSubmit: { en: "Let's Talk", ar: "يلا نتكلم" },
      },
      home: {
        seoTitle: {
          en: "ViralZoom Agency",
          ar: "ViralZoom Agency",
        },
        seoDescription: {
          en: "Ideas that make your brand impossible to ignore.",
          ar: "أفكار تجعل علامتك التجارية مستحيلة التجاهل.",
        },
        heroLabel: { en: "Viral Zoom showreel", ar: "فيديو فايرال زوم" },
        serviceIntroEyebrow: {
          en: "Creative services, made for growth",
          ar: "خدمات إبداعية تنمّي شغلك",
        },
        serviceIntroTitle: { en: "Big ideas.", ar: "أفكار كبيرة." },
        serviceIntroAccent: { en: "Real impact.", ar: "وتأثير حقيقي." },
        serviceIntroDescription: {
          en: "From the first spark to the final detail, we bring strategy, creativity and technology together to move your brand forward.",
          ar: "من أول فكرة لآخر تفصيلة، بنجمع بين الاستراتيجية والإبداع والتكنولوجيا عشان نحرّك علامتك التجارية لقدّام.",
        },
        serviceIntroCta: { en: "Explore our services", ar: "اكتشف خدماتنا" },
        serviceIntroCount: { en: "ways to grow your brand", ar: "خدمات لتنمية علامتك" },
        serviceImageAlt: {
          en: "Creative digital experience designed by Viral Zoom",
          ar: "تجربة رقمية إبداعية من فايرال زوم",
        },
        serviceImageCaption: { en: "Strategy meets creativity", ar: "الاستراتيجية تلتقي بالإبداع" },
        serviceAll: { en: "View all services", ar: "شوف كل خدماتنا" },
        servicePrevious: { en: "Previous", ar: "السابق" },
        serviceNext: { en: "Next", ar: "التالي" },
        serviceReadMore: { en: "Read More", ar: "اقرأ المزيد" },
        serviceSectionLabel: { en: "Services", ar: "الخدمات" },
        servicesEyebrow: { en: "WHAT WE DO", ar: "ماذا نقدم" },
        servicesHeading: { en: "Our Services", ar: "خدماتنا" },
        portfolioEyebrow: { en: "SELECTED WORK", ar: "أعمال مختارة" },
        portfolioHeading: { en: "Projects", ar: "مشاريعنا" },
        portfolioAll: { en: "View all projects", ar: "عرض كل المشاريع" },
        portfolioProjectLabel: { en: "View project", ar: "عرض المشروع" },
        clientsHeading: { en: "Our Clients", ar: "عملاؤنا" },
        clientsAll: { en: "View all Clients", ar: "عرض كل العملاء" },
        clientsCarousel: { en: "Show carousel", ar: "عرض متحرك" },
        clientsPrevious: { en: "Clients previous", ar: "العملاء السابقون" },
        clientsNext: { en: "Clients next", ar: "العملاء التاليون" },
        clientsPreviousTitle: { en: "Previous", ar: "السابق" },
        clientsNextTitle: { en: "Next", ar: "التالي" },
        processEyebrow: { en: "THE VIRAL ZOOM METHOD", ar: "منهجية فايرال زوم" },
        processTitle: {
          en: "Measure. Ideate. Experiment. Read. Scale.",
          ar: "حلّل. ابتكر. جرّب. قيّم. وسّع.",
        },
        processIntro: {
          en: "A clear, repeatable process for meaningful results.",
          ar: "خطوات واضحة ومتكررة لتحقيق نتائج مؤثرة.",
        },
        processStep1Title: { en: "Measure", ar: "حلّل" },
        processStep1Description: { en: "Find the opportunity.", ar: "نكتشف الفرص المناسبة." },
        processStep2Title: { en: "Ideate", ar: "ابتكر" },
        processStep2Description: { en: "Turn insight into ideas.", ar: "نحوّل الرؤى إلى أفكار." },
        processStep3Title: { en: "Experiment", ar: "جرّب" },
        processStep3Description: { en: "Create. Test. Iterate.", ar: "نبتكر، نختبر، ونطوّر." },
        processStep4Title: { en: "Read", ar: "حلّل النتائج" },
        processStep4Description: { en: "Learn what works.", ar: "نتعلّم مما يحقق النتائج." },
        processStep5Title: { en: "Scale", ar: "وسّع" },
        processStep5Description: { en: "Do more of what works.", ar: "نوسّع أثر ما ينجح." },
        bannerAlt: {
          en: "Viral Zoom: creative ideas, powerful results, your brand amplified.",
          ar: "فايرال زوم: أفكار إبداعية ونتائج قوية تعزز علامتك التجارية.",
        },
        bannerLabel: { en: "Viral Zoom creative agency", ar: "وكالة فايرال زوم الإبداعية" },
        serviceImage: { en: website.url, ar: website.url },
      },
      about: {
        seoTitle: {
          en: "About Viral Zoom — Creative & Digital Agency",
          ar: "عن فايرال زوم — وكالة إبداعية ورقمية",
        },
        seoDescription: {
          en: "Meet Viral Zoom, a creative and digital agency combining strategy, design and technology to help brands grow.",
          ar: "تعرف على فايرال زوم، وكالة إبداعية ورقمية تجمع الاستراتيجية والتصميم والتكنولوجيا لتنمية العلامات التجارية.",
        },
        heroImage: { en: website.url, ar: website.url },
        heroEyebrow: { en: "ABOUT VIRAL ZOOM", ar: "عن فايرال زوم" },
        heroTitle: { en: "We turn bold ideas", ar: "نحوّل الأفكار" },
        heroTitleAccent: { en: "into real impact.", ar: "الجريئة لتأثير حقيقي." },
        heroDescription: {
          en: "We are a creative and digital agency bringing strategy, design and technology together to help brands move forward.",
          ar: "إحنا وكالة إبداعية ورقمية بنجمع الاستراتيجية والتصميم والتكنولوجيا عشان نساعد العلامات التجارية تتقدم.",
        },
        heroCta: { en: "Get to know us", ar: "اعرفنا أكتر" },
        heroImageAlt: {
          en: "A creative digital project by Viral Zoom",
          ar: "مشروع رقمي إبداعي من فايرال زوم",
        },
        heroCaption: { en: "Ideas made visible", ar: "أفكار تتحول لواقع" },
        storyEyebrow: { en: "WHO WE ARE", ar: "مين إحنا" },
        storyTitle: {
          en: "A creative partner for brands ready to grow.",
          ar: "شريك إبداعي للعلامات اللي مستعدة تكبر.",
        },
        storyParagraph1: {
          en: "At Viral Zoom, we bring creative services and digital solutions together under one roof. From brand identity and content to websites, campaigns and production, we help shape consistent experiences that connect with people.",
          ar: "في فايرال زوم، بنجمع الخدمات الإبداعية والحلول الرقمية في مكان واحد. من الهوية والمحتوى للمواقع والحملات والإنتاج، بنساعد في بناء تجارب متناسقة تقرّب علامتك من جمهورها.",
        },
        storyParagraph2: {
          en: "Every project starts with understanding what makes your business different. Then we turn that understanding into clear ideas, thoughtful design and work made to support your next step.",
          ar: "كل مشروع بيبدأ بفهم اللي بيميّز شغلك. بعدها نحوّل الفهم لأفكار واضحة وتصميم مدروس وشغل يساعدك تاخد خطوتك الجاية.",
        },
        storyCta: { en: "Explore selected projects", ar: "شوف مشاريعنا" },
        valuesEyebrow: { en: "HOW WE THINK", ar: "طريقة تفكيرنا" },
        valuesTitle: { en: "Creative with purpose.", ar: "إبداع له هدف." },
        valuesDescription: {
          en: "Good work is more than a good-looking idea. It should make sense for your brand and move you toward a goal.",
          ar: "الشغل الحلو مش مجرد شكل جذاب؛ لازم يناسب علامتك ويقرّبك من هدفك.",
        },
        value1Title: { en: "Start with insight", ar: "نبدأ بالفهم" },
        value1Text: {
          en: "We learn about your brand, your audience and your goals before shaping the right direction.",
          ar: "نفهم علامتك وجمهورك وأهدافك قبل ما نحدد الاتجاه المناسب.",
        },
        value2Title: { en: "Make ideas matter", ar: "نحوّل الأفكار لتأثير" },
        value2Text: {
          en: "We bring creative thinking and practical strategy together to make every touchpoint count.",
          ar: "نجمع بين الإبداع والاستراتيجية العملية عشان كل نقطة تواصل يكون ليها أثر.",
        },
        value3Title: { en: "Build for progress", ar: "نبني للتطور" },
        value3Text: {
          en: "We test, learn and refine the work, keeping the focus on meaningful progress for your brand.",
          ar: "نختبر ونتعلم ونطوّر شغلنا، مع تركيزنا على تقدم حقيقي لعلامتك التجارية.",
        },
        approachEyebrow: { en: "OUR APPROACH", ar: "منهجيتنا" },
        approachTitle: {
          en: "Think clearly. Create boldly. Keep growing.",
          ar: "فكّر بوضوح. ابتكر بجرأة. واستمر في التطور.",
        },
        approachDescription: {
          en: "We work through a clear cycle: understand the opportunity, create and test ideas, learn from what happens, then build on what works.",
          ar: "بنتبع خطوات واضحة: نفهم الفرصة، نبتكر ونختبر الأفكار، نتعلم من النتائج، وبعدها نطوّر اللي أثبت نجاحه.",
        },
        ctaEyebrow: { en: "LET'S BUILD WHAT'S NEXT", ar: "يلا نبدأ خطوتك الجاية" },
        ctaTitle: { en: "Have an idea in mind?", ar: "عندك فكرة في بالك؟" },
        ctaDescription: {
          en: "Tell us what you are working toward. We would love to hear about it.",
          ar: "احكيلنا عن هدفك، ويسعدنا نسمع فكرتك.",
        },
        ctaButton: { en: "Start a conversation", ar: "ابدأ كلامنا" },
        approachMarkFirst: { en: "IDEAS", ar: "أفكار" },
        approachMarkSecond: { en: "IN MOTION", ar: "في حركة" },
      },
      services: {
        heroImage: { en: website.url, ar: website.url },
        seoTitle: { en: "Our Services | Viral Zoom", ar: "خدماتنا | فايرال زوم" },
        seoDescription: {
          en: "Discover creative and digital services from Viral Zoom.",
          ar: "اكتشف الخدمات الإبداعية والرقمية من فايرال زوم.",
        },
        heroAlt: {
          en: "A creative digital project by Viral Zoom",
          ar: "مشروع رقمي إبداعي من فايرال زوم",
        },
        heroEyebrow: { en: "IDEAS INTO IMPACT", ar: "من الفكرة للتأثير" },
        heroTitle: { en: "Services that", ar: "خدمات" },
        heroTitleAccent: { en: "move you forward.", ar: "تحرّكك لقدّام." },
        heroDescription: {
          en: "Creative thinking, smart strategy and standout execution — all working together for your brand.",
          ar: "إبداع واستراتيجية وتنفيذ مميز — كلهم مع بعض عشان علامتك التجارية.",
        },
        heroCta: { en: "Explore services", ar: "اكتشف خدماتنا" },
        listEyebrow: { en: "HOW WE HELP", ar: "إزاي نساعدك" },
        listHeading: { en: "What we do best", ar: "خدماتنا" },
        listDescription: {
          en: "Everything your brand needs to get noticed, connect and grow.",
          ar: "كل اللي علامتك محتاجاه عشان تتميز وتتواصل وتكبر.",
        },
        listCount: { en: "SERVICES", ar: "خدمة" },
        viewDetails: { en: "View details for", ar: "تفاصيل خدمة" },
        viewService: { en: "View service", ar: "تفاصيل الخدمة" },
      },
      projects: {
        seoTitle: { en: "Our Projects | Viral Zoom", ar: "أعمالنا | فايرال زوم" },
        seoDescription: {
          en: "Explore creative projects by Viral Zoom.",
          ar: "اكتشف المشاريع الإبداعية من فايرال زوم.",
        },
        heroEyebrow: { en: "SELECTED WORK", ar: "أعمال مختارة" },
        heroTitle: {
          en: "Every piece in our creative portfolio.",
          ar: "كل مشروع في محفظتنا الإبداعية.",
        },
        heroDescription: {
          en: "A selection of brands and ideas brought to life by Viral Zoom.",
          ar: "مجموعة من العلامات والأفكار اللي حولناها لتجارب إبداعية في فايرال زوم.",
        },
        featuredLabel: { en: "Featured projects", ar: "مشاريع مختارة" },
        allFilter: { en: "All", ar: "الكل" },
        openProject: { en: "View project", ar: "عرض المشروع" },
        visitProject: { en: "Visit project", ar: "زيارة المشروع" },
        galleryLabel: { en: "Project gallery", ar: "معرض المشاريع" },
        filterLabel: { en: "Filter projects by category", ar: "تصفية المشاريع حسب الفئة" },
        categoryAll: { en: "All", ar: "الكل" },
        categorySocialMedia: { en: "Social media", ar: "السوشيال ميديا" },
        categoryWebsites: { en: "Websites", ar: "المواقع" },
        categoryMobileApps: { en: "Apps & platforms", ar: "التطبيقات والمنصات" },
        categoryBranding: { en: "Branding & UI/UX", ar: "الهوية وتصميم UI/UX" },
        empty: {
          en: "No projects in this category yet.",
          ar: "لا توجد مشاريع في هذا التصنيف بعد.",
        },
      },
      contact: {
        heroImage: { en: website.url, ar: website.url },
        seoTitle: { en: "Contact Viral Zoom", ar: "تواصل مع فايرال زوم" },
        seoDescription: {
          en: "Tell us what you are looking to create and let's start a conversation.",
          ar: "احكيلنا عن فكرتك ويلا نبدأ نتكلم.",
        },
        heroAlt: {
          en: "Creative digital work by Viral Zoom",
          ar: "أعمال رقمية إبداعية من فايرال زوم",
        },
        heroEyebrow: { en: "LET'S MAKE SOMETHING GREAT", ar: "يلا نعمل حاجة مميزة" },
        heroTitle: { en: "Let's talk", ar: "خلّينا" },
        heroTitleAccent: { en: "about your next idea.", ar: "نتكلم عن فكرتك الجاية." },
        heroDescription: {
          en: "A new project, a big idea or just a question — we're ready to listen.",
          ar: "مشروع جديد، فكرة كبيرة أو حتى استفسار — إحنا جاهزين نسمعك.",
        },
        heroCta: { en: "Get in touch", ar: "تواصل معنا" },
        mapEyebrow: { en: "GOOD IDEAS TRAVEL", ar: "الأفكار الحلوة بتوصل" },
        mapTitle: { en: "One connected world.", ar: "عالم واحد يجمعنا." },
        mapDescription: {
          en: "Wherever you are, let's make something meaningful together.",
          ar: "أينما كنت، يلا نعمل حاجة ليها معنى سوا.",
        },
        mapCoordinate: { en: "CREATIVE CONNECTIONS — EVERYWHERE", ar: "تواصل إبداعي — في كل مكان" },
        contactSectionLabel: { en: "Contact details", ar: "بيانات التواصل" },
        connectFallback: { en: "Let's connect", ar: "خلّينا نتواصل" },
        phoneFallback: { en: "01222291024", ar: "01222291024" },
        whatsapp: { en: "WhatsApp", ar: "واتساب" },
      },
      serviceDetail: {
        notFound: { en: "Service not found", ar: "الخدمة غير موجودة" },
        browse: { en: "Browse services", ar: "تصفح الخدمات" },
        all: { en: "All services", ar: "كل الخدمات" },
        eyebrow: { en: "VIRAL ZOOM / SERVICE", ar: "فايرال زوم / خدماتنا" },
        cta: { en: "Start a project", ar: "ابدأ مشروعك" },
        benefitsEyebrow: { en: "THE RIGHT MOVE FOR YOUR BRAND", ar: "الخطوة الصح لعلامتك" },
        benefitsTitle: { en: "Make your next move count.", ar: "خلّي خطوتك الجاية تفرق." },
        overviewTitle: { en: "How we help", ar: "إزاي بنساعدك" },
        overviewDescription: {
          en: "We shape every project around your goals, your audience and the way your brand needs to grow. Our team brings the right creative and strategic thinking together to deliver work that feels distinctive and works hard for your business.",
          ar: "بنصمم كل مشروع على حسب أهدافك وجمهورك وطريقة نمو علامتك التجارية. فريقنا بيجمع الإبداع والتفكير الاستراتيجي عشان نقدم شغل مميز ويدعم نجاح أعمالك.",
        },
        relatedEyebrow: { en: "MORE WAYS TO GROW", ar: "خدمات تانية لتنمية شغلك" },
        relatedTitle: { en: "Explore our services", ar: "اكتشف خدماتنا" },
        contact: { en: "Talk to our team", ar: "اتكلم مع فريقنا" },
      },
      projectDetail: {
        notFound: { en: "Project not found", ar: "المشروع غير موجود" },
        browse: { en: "Browse projects", ar: "تصفح الأعمال" },
        all: { en: "All projects", ar: "كل المشاريع" },
        selected: { en: "SELECTED WORK", ar: "أعمال مختارة" },
        artwork: { en: "Project artwork", ar: "تصميم المشروع" },
        enlargePost: { en: "Enlarge", ar: "تكبير" },
        socialEyebrow: { en: "CONTENT THAT CONNECTS", ar: "محتوى يقرّب علامتك من جمهورها" },
        socialTitle: { en: "Our social media creative", ar: "بصمتنا على السوشيال ميديا" },
        metricsNote: {
          en: "Concept preview · sample metrics",
          ar: "معاينة تجريبية · أرقام افتراضية",
        },
        campaignEyebrow: { en: "CAMPAIGN SNAPSHOT", ar: "ملخص أداء الحملة" },
        campaignTitle: {
          en: "Creative work, measurable growth.",
          ar: "إبداع يصنع فرقًا قابلًا للقياس.",
        },
        campaignDescription: {
          en: "A sample view of reach and audience growth across the campaign.",
          ar: "نظرة تجريبية على الوصول ونمو الجمهور عبر الحملة.",
        },
        growthEyebrow: { en: "COMMUNITY GROWTH", ar: "نمو المجتمع" },
        growthTitle: { en: "One idea. Every platform.", ar: "فكرة واحدة.. وحضور على كل منصة." },
        filmEyebrow: { en: "CAMPAIGN FILM", ar: "فيديو الحملة" },
        filmTitle: { en: "The story, in motion.", ar: "الحكاية وهي بتتحرك." },
        galleryEyebrow: { en: "CAMPAIGN GALLERY", ar: "معرض الحملة" },
        galleryLabel: { en: "Social media image gallery", ar: "معرض صور السوشيال ميديا" },
        galleryTitle: {
          en: "Eight creative pieces. One visual identity.",
          ar: "8 تصميمات إبداعية.. بهوية واحدة.",
        },
        galleryDescription: {
          en: "Select any image to view it larger.",
          ar: "اضغط على أي صورة لمشاهدتها بحجم أكبر.",
        },
        campaignImage: { en: "Campaign image", ar: "صورة الحملة" },
        campaignDesign: { en: "Campaign design", ar: "تصميم الحملة" },
        campaignVideo: { en: "Campaign video", ar: "فيديو الحملة" },
        expandedDialog: { en: "Expanded project image", ar: "الصورة المكبرة للمشروع" },
        overviewEyebrow: { en: "PROJECT OVERVIEW", ar: "نبذة عن المشروع" },
        ctaEyebrow: { en: "HAVE A PROJECT IN MIND?", ar: "عندك مشروع في بالك؟" },
        ctaTitle: {
          en: "Let's create something worth remembering.",
          ar: "يلا نعمل حاجة تفضل في الذاكرة.",
        },
        cta: { en: "Start a project", ar: "ابدأ مشروعك" },
        closeImage: { en: "Close image", ar: "إغلاق الصورة" },
        expandedImage: { en: "Expanded project artwork", ar: "تصميم المشروع بحجم مكبر" },
        platformCreative: { en: "Platform-specific creative", ar: "محتوى مناسب لكل منصة" },
        visualIdentity: { en: "Consistent visual identity", ar: "هوية بصرية متناسقة" },
        performanceOptimization: {
          en: "Performance-led optimization",
          ar: "تحسين مستمر حسب الأداء",
        },
      },
    },
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
      const reelsVideos = item.reelsVideos ?? originalCase?.reelsVideos;
      const promoVideos = item.promoVideos ?? originalCase?.promoVideos;
      const showcase = item.socialMediaShowcase ?? originalCase?.socialMediaShowcase;
      return {
        ...(originalCase ?? {}),
        slug: item.id,
        name: item.name.en,
        localizedName: item.name,
        category,
        ...(extra ? { additionalCategories: extra } : {}),
        kind: "case-study" as const,
        ...(item.link ? { link: item.link } : {}),
        image: item.image,
        description: item.description,
        ...(gallery ? { imageGallery: gallery } : {}),
        ...(reelsVideos ? { reelsVideos } : {}),
        ...(promoVideos ? { promoVideos } : {}),
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
    !!config.content &&
    !!config.content.about &&
    !!config.content.process &&
    !!config.content.seo &&
    Array.isArray(config.services) &&
    Array.isArray(config.portfolio) &&
    Array.isArray(config.clients)
  );
}

export function mergeSiteConfig(saved: SiteConfig): SiteConfig {
  const savedPages = saved.content?.pages;
  return {
    ...initialConfig,
    ...saved,
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
    content: {
      ...initialConfig.content,
      ...saved.content,
      about: { ...initialConfig.content.about, ...saved.content?.about },
      process: { ...initialConfig.content.process, ...saved.content?.process },
      seo: { ...initialConfig.content.seo, ...saved.content?.seo },
      pages: {
        common: { ...initialConfig.content.pages.common, ...savedPages?.common },
        home: { ...initialConfig.content.pages.home, ...savedPages?.home },
        about: { ...initialConfig.content.pages.about, ...savedPages?.about },
        services: { ...initialConfig.content.pages.services, ...savedPages?.services },
        projects: { ...initialConfig.content.pages.projects, ...savedPages?.projects },
        contact: { ...initialConfig.content.pages.contact, ...savedPages?.contact },
        serviceDetail: {
          ...initialConfig.content.pages.serviceDetail,
          ...savedPages?.serviceDetail,
        },
        projectDetail: {
          ...initialConfig.content.pages.projectDetail,
          ...savedPages?.projectDetail,
        },
      },
    },
    services: Array.isArray(saved.services) ? saved.services : initialConfig.services,
    portfolio: Array.isArray(saved.portfolio) ? saved.portfolio : initialConfig.portfolio,
    clients: Array.isArray(saved.clients) ? saved.clients : initialConfig.clients,
  };
}

export function getPageCopy(
  config: SiteConfig,
  page: keyof PageContent,
  key: string,
  language: "en" | "ar",
) {
  return config.content.pages[page][key]?.[language] ?? "";
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
    serverConfig ? mergeSiteConfig(serverConfig) : initialConfig,
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
      setConfigState(mergeSiteConfig(saved));
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
        setConfigState(mergeSiteConfig(next));
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
