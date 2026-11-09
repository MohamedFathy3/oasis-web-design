import p0 from "@/assets/portfolio-0.jpg.asset.json";
import p1 from "@/assets/portfolio-1.jpg.asset.json";
import p2 from "@/assets/portfolio-2.jpg.asset.json";
import p3 from "@/assets/portfolio-3.jpg.asset.json";
import p4 from "@/assets/portfolio-4.jpg.asset.json";
import p5 from "@/assets/portfolio-5.jpg.asset.json";
import socialImage from "@/assets/social.jpg.asset.json";
import eventsImage from "@/assets/events.jpg.asset.json";
import { starPlusProjects } from "@/lib/starplus-projects";

export type ProjectCategoryId =
  | "social-media"
  | "email-marketing"
  | "video"
  | "websites"
  | "mobile-apps"
  | "ui-ux"
  | "platforms-apps"
  | "branding";

type ProjectContent = {
  slug: string;
  name: string;
  localizedName?: { en: string; ar: string };
  category: ProjectCategoryId;
  additionalCategories?: ProjectCategoryId[];
  image: string;
  url?: string;
  description: { en: string; ar: string };
};

type SocialPlatform = "Instagram" | "TikTok" | "Facebook" | "Snapchat";

export type SocialMediaShowcase = {
  posts: {
    platform: SocialPlatform;
    title: { en: string; ar: string };
    reach: string;
    image: string;
  }[];
  performanceImages: string[];
  communityGrowth: {
    platform: SocialPlatform;
    followers: string;
    label: { en: string; ar: string };
  }[];
};

export type CaseStudyProject = ProjectContent & {
  kind: "case-study";
  socialMediaShowcase?: SocialMediaShowcase;
  imageGallery?: string[];
};

export type ExternalProject = ProjectContent & {
  kind: "external";
  projectType: "website" | "software";
  url: string;
};

export type Project = CaseStudyProject | ExternalProject;

export const projects: Project[] = [
  {
    slug: "bio-derma-group",
    name: "Bio Derma Group",
    category: "branding",
    kind: "case-study",
    image: p0.url,
    description: {
      en: "A visual identity project created to give Bio Derma Group a clear, consistent presence across its brand touchpoints.",
      ar: "مشروع هوية بصرية يمنح Bio Derma Group حضورًا واضحًا ومتناسقًا عبر مختلف نقاط التواصل مع الجمهور.",
    },
  },
  {
    slug: "sarhan-obesity-clinic",
    name: "DR. Mohamed Diaa Sarhan (Sarhan Obesity Clinic)",
    category: "branding",
    kind: "case-study",
    image: p1.url,
    description: {
      en: "A brand identity direction for Sarhan Obesity Clinic, designed to communicate a professional and recognizable healthcare brand.",
      ar: "تصميم هوية بصرية لعيادة د. محمد ضياء سرحان، تعكس صورة احترافية وسهلة التميّز للعلامة الطبية.",
    },
  },
  {
    slug: "egy-marks",
    name: "Egy Marks",
    category: "branding",
    kind: "case-study",
    image: p2.url,
    description: {
      en: "A brand identity project for Egy Marks, bringing its visual language together in a distinctive and consistent presentation.",
      ar: "مشروع هوية بصرية لـ Egy Marks يجمع عناصر العلامة في تقديم مميز ومتناسق.",
    },
  },
  {
    slug: "el-masia-pack",
    name: "El Masia Pack",
    category: "branding",
    kind: "case-study",
    image: p3.url,
    description: {
      en: "A visual identity project for El Masia Pack, built to help the brand present itself consistently across its materials.",
      ar: "مشروع هوية بصرية لـ El Masia Pack يساعد العلامة على الظهور بشكل متناسق عبر موادها المختلفة.",
    },
  },
  {
    slug: "feedmix",
    name: "Feedmix",
    category: "branding",
    kind: "case-study",
    image: p4.url,
    description: {
      en: "A brand identity project for Feedmix, with a cohesive visual direction for its brand communications.",
      ar: "مشروع هوية بصرية لـ Feedmix مع توجه بصري متناسق للتواصل مع جمهور العلامة.",
    },
  },
  {
    slug: "el-fayrouz",
    name: "El Fayrouz",
    category: "branding",
    kind: "case-study",
    image: p5.url,
    description: {
      en: "A visual identity project for El Fayrouz, presenting the brand through a clear and unified look.",
      ar: "مشروع هوية بصرية لـ El Fayrouz يقدم العلامة بشكل واضح وموحّد.",
    },
  },
  {
    slug: "social-media-growth-concept",
    name: "Social Media Growth Concept",
    localizedName: { en: "Social Media Growth Concept", ar: "نمو السوشيال ميديا" },
    category: "social-media",
    additionalCategories: ["branding"],
    kind: "case-study",
    image: p0.url,
    description: {
      en: "A concept campaign combining a cohesive brand identity with platform-native social content. Performance figures are illustrative placeholders for this design preview.",
      ar: "حملة تجريبية تجمع بين هوية بصرية متناسقة ومحتوى مناسب لكل منصة. أرقام الأداء المعروضة افتراضية لمعاينة التصميم فقط.",
    },
    socialMediaShowcase: {
      posts: [
        { platform: "Instagram", title: { en: "Signature moments", ar: "لحظات مميزة" }, reach: "12.4K", image: p0.url },
        { platform: "TikTok", title: { en: "Behind the scenes", ar: "من كواليس العمل" }, reach: "85K", image: p1.url },
        { platform: "Facebook", title: { en: "A fresh perspective", ar: "نظرة مختلفة" }, reach: "4.2K", image: p2.url },
        { platform: "Snapchat", title: { en: "New collection", ar: "تشكيلة جديدة" }, reach: "8.9K", image: p3.url },
        { platform: "Instagram", title: { en: "Brand essentials", ar: "تفاصيل العلامة" }, reach: "3.7K", image: p4.url },
        { platform: "TikTok", title: { en: "The daily edit", ar: "اختيارات اليوم" }, reach: "1.2M", image: p5.url },
      ],
      performanceImages: [p0.url, p1.url, p2.url],
      communityGrowth: [
        { platform: "TikTok", followers: "+125K", label: { en: "new followers", ar: "متابع جديد" } },
        { platform: "Instagram", followers: "+98K", label: { en: "new followers", ar: "متابع جديد" } },
        { platform: "Snapchat", followers: "+72K", label: { en: "new followers", ar: "متابع جديد" } },
      ],
    },
  },
  {
    slug: "social-media-eight-posts",
    name: "Social Media Creative Collection",
    localizedName: { en: "Social Media Creative Collection", ar: "مجموعة تصاميم السوشيال ميديا" },
    category: "social-media",
    additionalCategories: ["branding"],
    kind: "case-study",
    image: socialImage.url,
    description: {
      en: "An eight-image social media portfolio preview, arranged as a responsive visual gallery. Replace these sample images with the final campaign artwork.",
      ar: "معاينة لمعرض سوشيال ميديا مكوّن من 8 صور، مع ترتيب شبكي متجاوب. يمكن استبدال الصور التجريبية بتصميمات الحملة النهائية.",
    },
    imageGallery: [
      p0.url,
      p1.url,
      p2.url,
      p3.url,
      p4.url,
      p5.url,
      socialImage.url,
      eventsImage.url,
    ],
  },
  ...starPlusProjects,
];

export function projectHasCategory(project: Project, categoryId: ProjectCategoryId | "all") {
  return project.category === categoryId || project.additionalCategories?.includes(categoryId) === true;
}

export function projectHasExternalLink(project: Project): project is Project & { url: string } {
  return Boolean(project.url);
}

export const projectCategories = [
  { id: "all", en: "All", ar: "الكل" },
  { id: "social-media", en: "Social media", ar: "السوشيال ميديا" },
  { id: "email-marketing", en: "Email marketing", ar: "التسويق بالبريد" },
  { id: "video", en: "Video", ar: "الفيديو" },
  { id: "websites", en: "Websites", ar: "المواقع" },
  { id: "mobile-apps", en: "Mobile apps", ar: "تطبيقات الموبايل" },
  { id: "ui-ux", en: "UI/UX designs", ar: "تصميمات UI/UX" },
  { id: "platforms-apps", en: "Platforms & apps", ar: "المنصات والتطبيقات" },
  { id: "branding", en: "Branding", ar: "الهوية البصرية" },
] as const;
