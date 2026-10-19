import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Detail, Language } from "./types";
import { usePageTranslate } from "@/lib/cms";

type Props = {
  language: Language;
  detail: Detail | null;
  onClose: () => void;
};

export function ShowcaseDetailDialog({ language, detail, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const t = usePageTranslate(language);

  useEffect(() => {
    if (detail) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [detail]);

  return (
    <dialog
      ref={dialogRef}
      className="detail-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="dialog-close"
        aria-label={t("Close details", "إغلاق التفاصيل")}
        onClick={onClose}
      >
        <X />
      </Button>
      {detail?.image && <img className="detail-image" src={detail.image} alt={detail.title} />}
      <div className="detail-copy">
        <h3>{detail?.title}</h3>
        {detail?.description && <p>{detail.description}</p>}
      </div>
    </dialog>
  );
}
