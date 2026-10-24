import { describe, expect, it, vi } from "vitest";
import { handleApiRequest } from "@/lib/server-api";

const { sendMailMock } = vi.hoisted(() => ({ sendMailMock: vi.fn() }));

vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
}));

const contactUrl = "https://viralzoom.agency/api/contact";

function contactRequest(payload: unknown, origin = "https://viralzoom.agency") {
  return new Request(contactUrl, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

describe("Contact API", () => {
  it("rejects requests from another origin", async () => {
    const response = await handleApiRequest(
      contactRequest({ name: "Visitor" }, "https://attacker.example"),
    );

    expect(response?.status).toBe(403);
  });

  it("accepts the honeypot response without sending email", async () => {
    const response = await handleApiRequest(contactRequest({ website: "bot-filled-this" }));

    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toEqual({ sent: true });
  });

  it("rejects invalid email addresses", async () => {
    const response = await handleApiRequest(
      contactRequest({
        name: "Visitor",
        email: "not-an-email",
        subject: "",
        message: "Hello",
      }),
    );

    expect(response?.status).toBe(422);
  });

  it("reports missing SMTP credentials instead of claiming delivery", async () => {
    vi.stubEnv("SMTP_USER", "info@viralzoom.agency");
    vi.stubEnv("SMTP_PASSWORD", "");
    try {
      const response = await handleApiRequest(
        contactRequest({
          name: "Visitor",
          email: "visitor@example.com",
          subject: "Project",
          message: "Hello",
        }),
      );

      expect(response?.status).toBe(503);
      await expect(response?.json()).resolves.toEqual({
        error: "Contact email is not configured on the server.",
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("reports success only when SMTP accepts the configured recipient", async () => {
    vi.stubEnv("SMTP_USER", "info@viralzoom.agency");
    vi.stubEnv("SMTP_PASSWORD", "test-password");
    sendMailMock.mockResolvedValueOnce({
      accepted: ["info@viralzoom.agency"],
      rejected: [],
      messageId: "test-message",
      response: "250 Message accepted",
    });

    try {
      const response = await handleApiRequest(
        contactRequest({
          name: "Visitor",
          email: "visitor@example.com",
          subject: "Project",
          message: "Hello",
        }),
      );

      expect(response?.status).toBe(200);
      await expect(response?.json()).resolves.toEqual({ sent: true });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("reports an SMTP rejection as a delivery error", async () => {
    vi.stubEnv("SMTP_USER", "info@viralzoom.agency");
    vi.stubEnv("SMTP_PASSWORD", "test-password");
    sendMailMock.mockResolvedValueOnce({
      accepted: [],
      rejected: ["info@viralzoom.agency"],
      messageId: "test-message",
      response: "550 Recipient rejected",
    });

    try {
      const response = await handleApiRequest(
        contactRequest({
          name: "Visitor",
          email: "visitor@example.com",
          subject: "Project",
          message: "Hello",
        }),
      );

      expect(response?.status).toBe(502);
      await expect(response?.json()).resolves.toEqual({
        error: "Your message could not be delivered. Please try again later.",
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
