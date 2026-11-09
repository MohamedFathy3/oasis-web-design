import { useState } from "react";
import { Globe2, Menu, Moon, Sun, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getPageCopy, useCMS } from "@/lib/cms";
import type { Language, SectionId } from "./types";
import { translate } from "./types";

type Props = {
  language: Language;
  darkMode: boolean;
  activeSection: SectionId | "about" | "contact";
  onNavigate: (id: SectionId) => void;
  onToggleTheme: () => void;
  onLanguageChange: () => void;
};

const navigation: { id: SectionId | "about"; key: string }[] = [
  { id: "home", key: "navHome" },
  { id: "about", key: "navAbout" },
  { id: "contact", key: "navContact" },
  { id: "services", key: "navServices" },
  { id: "portfolio", key: "navProjects" },
  { id: "clients", key: "navClients" },
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
  const t = (english: string, arabic: string) => translate(language, english, arabic);

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
          aria-label="Viral Zoom home"
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
                {getPageCopy(config, "common", item.key, language)}
              </Link>
            ) : (
              <Button
                variant="ghost"
                key={item.id}
                className={`nav-item px-0 ${activeSection === item.id ? "active" : ""}`}
                onClick={() => navigate(item.id as SectionId)}
              >
                {getPageCopy(config, "common", item.key, language)}
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
                {getPageCopy(config, "common", item.key, language)}
              </Link>
            ) : (
              <Button key={item.id} variant="ghost" onClick={() => navigate(item.id as SectionId)}>
                {getPageCopy(config, "common", item.key, language)}
              </Button>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
