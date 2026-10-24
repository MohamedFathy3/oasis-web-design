import { MessageCircle, Phone } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

import { useCMS } from "@/lib/cms";
import { getWhatsAppHref } from "@/lib/whatsapp";

export function WhatsAppFloatingButton() {
  const { config, ready } = useCMS();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const href = ready ? getWhatsAppHref(config.contact.whatsapp) : null;

  if (!href || pathname.startsWith("/admin")) return null;

  return (
    <a
      className="whatsapp-floating-button"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp | تواصل معنا عبر واتساب"
      title="WhatsApp"
    >
      <MessageCircle aria-hidden="true" className="whatsapp-floating-bubble" />
      <Phone aria-hidden="true" className="whatsapp-floating-phone" />
    </a>
  );
}
