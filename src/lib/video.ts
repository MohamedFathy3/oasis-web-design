export function resolveVideoEmbed(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return null;

    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    if (
      hostname === "youtu.be" ||
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com" ||
      hostname === "music.youtube.com"
    ) {
      const pathParts = url.pathname.split("/").filter(Boolean);
      const id =
        hostname === "youtu.be"
          ? pathParts[0]
          : pathParts[0] === "embed" || pathParts[0] === "shorts" || pathParts[0] === "live"
            ? pathParts[1]
            : url.searchParams.get("v");
      return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }

    if (hostname === "vimeo.com" || hostname === "player.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}
