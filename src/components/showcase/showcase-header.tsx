import { useState } from "react";
import { Globe2, Menu, Moon, Sun, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCMS, usePageTranslate } from "@/lib/cms";
import type { Language, SectionId } from "./types";

type Props = {
  language: Language;
  darkMode: boolean;
  activeSection: SectionId | "about" | "contact";
  onNavigate: (id: SectionId) => void;
  onToggleTheme: () => void;
  onLanguageChange: () => void;
};

const navigation: { id: SectionId | "about"; en: string; ar: string }[] = [
  { id: "home", en: "HOME", ar: "الرئيسية" },
  { id: "about", en: "ABOUT", ar: "من نحن" },
  { id: "contact", en: "CONTACT", ar: "تواصل معنا" },
  { id: "services", en: "SERVICES", ar: "خدماتنا" },
  { id: "portfolio", en: "PROJECTS", ar: "مشاريعنا" },
  { id: "clients", en: "OUR CLIENTS", ar: "عملاؤنا" },
];

export function ShowcaseHeader({
  language,
  darkMode,
  activeSection,
  onNavigate,
  onToggleTheme,
  onLanguageChange,
}: Props) {
  const { config } = useCMS();
  const [menuOpen, setMenuOpen] = useState(false);
  const ar = language === "ar";
  const t = usePageTranslate(language);

  const navigate = (id: SectionId) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <header className="site-header" id="home">
      <div className="header-inner">
        <Button
          variant="ghost"
          className="h-auto justify-start p-0"
          aria-label={t("Viral Zoom home", "الصفحة الرئيسية — فايرال زوم")}
          onClick={() => navigate("home")}
        >
          <img
            className="brand-logo"
            src={darkMode ? config.brand.whiteLogo : config.brand.logo}
            alt={config.brand.name}
          />
        </Button>
        <nav className="desktop-nav" aria-label={t("Main navigation", "القائمة الرئيسية")}>
          {navigation.map((item) =>
            item.id === "about" ||
            item.id === "contact" ||
            item.id === "services" ||
            item.id === "portfolio" ? (
              <Link
                to={
                  item.id === "about"
                    ? "/about"
                    : item.id === "contact"
                      ? "/contact"
                      : item.id === "services"
                        ? "/services"
                        : "/projects"
                }
                key={item.id}
                className={`nav-item px-0 ${activeSection === item.id ? "active" : ""}`}
              >
                {t(item.en, item.ar)}
              </Link>
            ) : (
              <Button
                variant="ghost"
                key={item.id}
                className={`nav-item px-0 ${activeSection === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id as SectionId)}
              >
                {t(item.en, item.ar)}
              </Button>
            ),
          )}
        </nav>
        <div className="header-actions">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onToggleTheme}
            aria-label={
              darkMode
                ? t("Switch to light mode", "تفعيل الوضع الفاتح")
                : t("Switch to dark mode", "تفعيل الوضع الداكن")
            }
            title={darkMode ? t("Light mode", "الوضع الفاتح") : t("Dark mode", "الوضع الداكن")}
            aria-pressed={darkMode}
          >
            {darkMode ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="ghost"
            className="language-button"
            aria-label={ar ? "Switch to English" : "التبديل إلى العربية"}
            onClick={onLanguageChange}
          >
            <Globe2 className="text-primary" />
            {ar ? "English" : "العربية"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu-toggle"
            aria-label={t("Open menu", "فتح القائمة")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <nav className="mobile-nav">
          {navigation.map((item) =>
            item.id === "about" ||
            item.id === "contact" ||
            item.id === "services" ||
            item.id === "portfolio" ? (
              <Link
                to={
                  item.id === "about"
                    ? "/about"
                    : item.id === "contact"
                      ? "/contact"
                      : item.id === "services"
                        ? "/services"
                        : "/projects"
                }
                key={item.id}
                className="mobile-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {t(item.en, item.ar)}
              </Link>
            ) : (
              <Button key={item.id} variant="ghost" onClick={() => navigate(item.id as SectionId)}>
                {t(item.en, item.ar)}
              </Button>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
