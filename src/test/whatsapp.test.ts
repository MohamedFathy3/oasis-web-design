import { describe, expect, it } from "vitest";

import { getWhatsAppHref } from "@/lib/whatsapp";

describe("getWhatsAppHref", () => {
  it("creates a WhatsApp chat link from a phone number", () => {
    expect(getWhatsAppHref("+20 (100) 123-4567")).toBe("https://wa.me/201001234567");
  });

  it("accepts WhatsApp chat links with a destination", () => {
    expect(getWhatsAppHref("https://wa.me/201001234567")).toBe("https://wa.me/201001234567");
    expect(getWhatsAppHref("https://api.whatsapp.com/send?phone=201001234567")).toContain(
      "api.whatsapp.com/send?phone=201001234567",
    );
  });

  it("does not expose a button for empty, generic, or unsafe values", () => {
    expect(getWhatsAppHref("")).toBeNull();
    expect(getWhatsAppHref("https://web.whatsapp.com/")).toBeNull();
    expect(getWhatsAppHref("javascript:alert(1)")).toBeNull();
    expect(getWhatsAppHref("https://example.com/201001234567")).toBeNull();
  });
});
