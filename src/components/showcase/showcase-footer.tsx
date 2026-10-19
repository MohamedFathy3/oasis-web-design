import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "./types";
import { useCMS, usePageTranslate } from "@/lib/cms";

type Props = {
  language: Language;
  onBackToTop: () => void;
};

export function ShowcaseFooter({ language, onBackToTop }: Props) {
  const t = usePageTranslate(language);
  const { config } = useCMS();

  return (
    <footer className="site-footer">
      <div className="section-inner footer-inner">
        <img className="footer-logo" src={config.brand.logo} alt={config.brand.name} />
        <span>© 2026 Viral Zoom. {t("All rights reserved.", "جميع الحقوق محفوظة.")}</span>
        <Button variant="link" className="gap-3 text-xs" onClick={onBackToTop}>
          {t("Back to top", "إلى أعلى")}
          <ArrowUpRight />
        </Button>
      </div>
    </footer>
  );
}
