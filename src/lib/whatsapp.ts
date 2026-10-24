const whatsappHosts = new Set([
  "wa.me",
  "api.whatsapp.com",
  "web.whatsapp.com",
  "www.whatsapp.com",
]);

export function getWhatsAppHref(value: string): string | null {
  const input = value.trim();
  if (!input) return null;

  if (/^[+\d\s()-]+$/.test(input)) {
    const phone = input.replace(/\D/g, "");
    return phone.length >= 5 && phone.length <= 15 ? `https://wa.me/${phone}` : null;
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    !whatsappHosts.has(url.hostname)
  ) {
    return null;
  }

  const phone =
    url.hostname === "wa.me"
      ? url.pathname.replace(/\D/g, "")
      : url.pathname === "/send"
        ? (url.searchParams.get("phone") ?? "").replace(/\D/g, "")
        : "";

  return phone.length >= 5 && phone.length <= 15 ? url.href : null;
}
