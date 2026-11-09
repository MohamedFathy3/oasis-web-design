import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "./types";
import { getPageCopy, useCMS } from "@/lib/cms";

type Props = {
  language: Language;
  logo: string;
  onBackToTop: () => void;
};

export function ShowcaseFooter({ language, logo, onBackToTop }: Props) {
  const { config } = useCMS();

  return (
    <footer className="site-footer">
      <div className="section-inner footer-inner">
        <img className="footer-logo" src={logo} alt="Viral Zoom" />
        <span>
          © 2026 {config.brand.name}. {getPageCopy(config, "common", "footerCopyright", language)}
        </span>
        <Button variant="link" className="gap-3 text-xs" onClick={onBackToTop}>
          {getPageCopy(config, "common", "footerBackToTop", language)}
          <ArrowUpRight />
        </Button>
      </div>
    </footer>
  );
}
