import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleApiRequest } from "@/lib/server-api";

const { sendMailMock, createMessageMock, findMessagesMock, updateMessageMock, deleteMessageMock } =
  vi.hoisted(() => ({
    sendMailMock: vi.fn(),
    createMessageMock: vi.fn(),
    findMessagesMock: vi.fn(),
    updateMessageMock: vi.fn(),
    deleteMessageMock: vi.fn(),
  }));

vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
}));
vi.mock("@prisma/adapter-mariadb", () => ({ PrismaMariaDb: class {} }));
vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    contactMessage = {
      create: createMessageMock,
      findMany: findMessagesMock,
      updateMany: updateMessageMock,
      deleteMany: deleteMessageMock,
    };
  },
}));

const contactUrl = "https://viralzoom.agency/api/contact";
let requestNumber = 0;

function contactRequest(payload: unknown, origin = "https://viralzoom.agency") {
  requestNumber += 1;
  return new Request(contactUrl, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      "x-forwarded-for": `192.0.2.${requestNumber}`,
    },
    body: JSON.stringify(payload),
  });
}

describe("Contact API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendMailMock.mockReset();
    createMessageMock.mockResolvedValue({});
    findMessagesMock.mockResolvedValue([]);
    updateMessageMock.mockResolvedValue({ count: 1 });
    deleteMessageMock.mockResolvedValue({ count: 1 });
  });

  it("rejects requests from another origin", async () => {
    const response = await handleApiRequest(
      contactRequest({ name: "Visitor" }, "https://attacker.example"),
    );

    expect(response?.status).toBe(403);
  });

  it("accepts the honeypot response without sending email", async () => {
    const response = await handleApiRequest(contactRequest({ website: "bot-filled-this" }));

    expect(response?.status).toBe(200);
    await expect(response?.json()).resolves.toEqual({ sent: true, saved: false });
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

  it("saves the message even when SMTP notifications are not configured", async () => {
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

      expect(response?.status).toBe(201);
      await expect(response?.json()).resolves.toEqual({
        sent: true,
        saved: true,
        emailSent: false,
      });
      expect(createMessageMock).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Visitor",
          email: "visitor@example.com",
          subject: "Project",
          message: "Hello",
        }),
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("returns a JSON database error instead of a successful response when saving fails", async () => {
    createMessageMock.mockRejectedValueOnce(new Error("Table does not exist"));

    const response = await handleApiRequest(
      contactRequest({
        name: "Visitor",
        email: "visitor@example.com",
        subject: "Project",
        message: "Hello",
      }),
    );

    expect(response?.status).toBe(503);
    await expect(response?.json()).resolves.toMatchObject({
      sent: false,
      saved: false,
      error: expect.stringContaining("contact_messages"),
    });
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

      expect(response?.status).toBe(201);
      await expect(response?.json()).resolves.toEqual({
        sent: true,
        saved: true,
        emailSent: true,
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("keeps the saved message available when SMTP rejects the notification", async () => {
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

      expect(response?.status).toBe(201);
      await expect(response?.json()).resolves.toEqual({
        sent: true,
        saved: true,
        emailSent: false,
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("protects the inbox and message actions behind the admin session", async () => {
    const response = await handleApiRequest(
      new Request(contactUrl, { headers: { origin: "https://viralzoom.agency" } }),
    );

    expect(response?.status).toBe(401);
  });

  it("returns a JSON setup error when the inbox table is unavailable", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "test-admin-password");
    findMessagesMock.mockRejectedValueOnce(new Error("Table does not exist"));

    try {
      const login = await handleApiRequest(
        new Request("https://viralzoom.agency/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "admin@admin.com", password: "test-admin-password" }),
        }),
      );
      const cookie = login?.headers.get("set-cookie")?.split(";")[0];
      expect(cookie).toBeTruthy();

      const response = await handleApiRequest(
        new Request(contactUrl, { headers: { cookie: cookie! } }),
      );

      expect(response?.status).toBe(503);
      await expect(response?.json()).resolves.toEqual({
        error: "Could not load messages. Verify the contact_messages table in the app database.",
      });
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("lists messages and supports authenticated read and delete actions", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "test-admin-password");
    findMessagesMock.mockResolvedValueOnce([
      {
        id: "f4322c9c-54be-4c3d-99f9-f0e38d76d3c0",
        name: "Visitor",
        email: "visitor@example.com",
        subject: "Project",
        message: "Hello",
        isRead: false,
        createdAt: new Date("2026-10-24T12:00:00.000Z"),
      },
    ]);

    try {
      const login = await handleApiRequest(
        new Request("https://viralzoom.agency/api/auth/login", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: "admin@admin.com", password: "test-admin-password" }),
        }),
      );
      const cookie = login?.headers.get("set-cookie")?.split(";")[0];
      expect(cookie).toBeTruthy();

      const inbox = await handleApiRequest(
        new Request(contactUrl, { headers: { cookie: cookie! } }),
      );
      expect(inbox?.status).toBe(200);
      await expect(inbox?.json()).resolves.toMatchObject({
        unreadCount: 1,
        messages: [{ name: "Visitor", isRead: false }],
      });

      const messageId = "f4322c9c-54be-4c3d-99f9-f0e38d76d3c0";
      const update = await handleApiRequest(
        new Request(`${contactUrl}/${messageId}`, {
          method: "PATCH",
          headers: { cookie: cookie!, "content-type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        }),
      );
      expect(update?.status).toBe(200);

      const deletion = await handleApiRequest(
        new Request(`${contactUrl}/${messageId}`, {
          method: "DELETE",
          headers: { cookie: cookie! },
        }),
      );
      expect(deletion?.status).toBe(200);
      expect(updateMessageMock).toHaveBeenCalledWith({
        where: { id: messageId },
        data: { isRead: true },
      });
      expect(deleteMessageMock).toHaveBeenCalledWith({ where: { id: messageId } });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
