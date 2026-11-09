export type Language = "en" | "ar";
export type SectionId = "home" | "services" | "portfolio" | "clients" | "contact";
export type Detail = { title: string; image?: string; description?: string };

export function translate(language: Language, english: string, arabic: string) {
  return language === "ar" ? arabic : english;
}
