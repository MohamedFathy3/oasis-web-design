import { Phone } from "lucide-react";
import type { FormEvent } from "react";
import type { Language } from "./types";
import { useCMS, usePageTranslate } from "@/lib/cms";

export function ShowcaseContact({ language }: { language: Language }) {
  const { config } = useCMS();
  const contactPhone = config.contact.phone || "01064621943";
  const t = usePageTranslate(language);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="section-inner contact-layout">
        <aside className="contact-info-card" aria-label={t("Contact details", "بيانات التواصل")}>
          <img
            className="contact-world-map"
            src={config.pageAssets["contactWorldMap"]}
            alt=""
            aria-hidden="true"
          />
          <div className="contact-phone-icon">
            <Phone aria-hidden="true" />
          </div>
          <a className="contact-phone" href={`tel:${contactPhone}`}>
            {contactPhone}
          </a>
          <div className="contact-info-copy">
            <h3>{config.contact.address[language] || t("Let's connect", "خلّينا نتواصل")}</h3>
            <p>
              {t(
                "Have a project in mind? Tell us what you are looking to create.",
                "عندك مشروع في بالك؟ احكيلنا نفسك تعمل إيه.",
              )}
            </p>
          </div>
          <div className="contact-info-note">
            {config.contact.email ? (
              <a href={`mailto:${config.contact.email}`}>{config.contact.email}</a>
            ) : (
              t("Call us to talk through your next idea.", "اتصل بينا واحكيلنا عن فكرتك الجديدة.")
            )}
            {config.contact.whatsapp && (
              <>
                {" "}
                ·{" "}
                <a href={config.contact.whatsapp} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
              </>
            )}
          </div>
        </aside>

        <div className="contact-form-panel">
          <div className="contact-eyebrow">{t("LET'S CHAT", "يلا نتكلم")}</div>
          <h2 id="contact-title">{t("SEND A MESSAGE", "ابعتلنا رسالة")}</h2>
          <form className="contact-form" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="contact-name">
              {t("Name", "الاسم")}
            </label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              placeholder={t("Name", "الاسم")}
            />

            <label className="sr-only" htmlFor="contact-email">
              {t("Email", "البريد الإلكتروني")}
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={t("Email", "البريد الإلكتروني")}
            />

            <label className="sr-only" htmlFor="contact-subject">
              {t("Subject", "الموضوع")}
            </label>
            <input
              className="contact-field-wide"
              id="contact-subject"
              name="subject"
              placeholder={t("Subject", "الموضوع")}
            />

            <label className="sr-only" htmlFor="contact-message">
              {t("Message", "الرسالة")}
            </label>
            <textarea
              className="contact-field-wide"
              id="contact-message"
              name="message"
              placeholder={t("Message", "اكتب رسالتك")}
              rows={5}
            />

            <button className="contact-submit contact-field-wide" type="submit" disabled>
              {t("Let's Talk", "يلا نتكلم")}
            </button>
            <p className="contact-form-note contact-field-wide">
              {t("Message sending will be available soon.", "إرسال الرسائل هيكون متاح قريبًا.")}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
