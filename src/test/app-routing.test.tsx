import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import {
  filterProjectsByCategory,
  isVideoMediaUrl,
  projectCategories,
  projectHasCategory,
  projects,
} from "@/lib/projects";
import { getPageCopy, initialConfig, mergeSiteConfig, projectItemsFromConfig } from "@/lib/cms";
import { canonicalUrl } from "@/lib/seo";
import { resolveVideoEmbed } from "@/lib/video";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("converts supported video URLs into safe YouTube and Vimeo embeds", () => {
    expect(resolveVideoEmbed("https://www.youtube.com/embed/3UlrYeR3WJo?si=oOanQEjTr7_5n0Ze")).toBe(
      "https://www.youtube-nocookie.com/embed/3UlrYeR3WJo",
    );
    expect(resolveVideoEmbed("https://youtu.be/3UlrYeR3WJo")).toBe(
      "https://www.youtube-nocookie.com/embed/3UlrYeR3WJo",
    );
    expect(resolveVideoEmbed("https://youtu.be/3UlrYeR3WJo?si=campaign-share")).toBe(
      "https://www.youtube-nocookie.com/embed/3UlrYeR3WJo",
    );
    expect(resolveVideoEmbed("https://music.youtube.com/watch?v=3UlrYeR3WJo")).toBe(
      "https://www.youtube-nocookie.com/embed/3UlrYeR3WJo",
    );
    expect(resolveVideoEmbed("https://evil.example/embed/3UlrYeR3WJo")).toBeNull();
    expect(resolveVideoEmbed("javascript:alert(1)")).toBeNull();
  });

  it("provides bilingual CMS copy for each public page", () => {
    const config = mergeSiteConfig(initialConfig);

    expect(config.content.pages.home.seoTitle).toEqual({ en: "ViralZoom", ar: "ViralZoom" });
    expect(config.contact.email).toBe("info@viralzoom.agency");
    expect(config.contact.phone).toBe("01222291024");
    expect(getPageCopy(config, "about", "heroTitle", "en")).toBe("We turn bold ideas");
    expect(getPageCopy(config, "about", "heroTitle", "ar")).toBe("نحوّل الأفكار");
    expect(getPageCopy(config, "services", "heroTitle", "en")).toBe("Services that");
    expect(getPageCopy(config, "projects", "heroTitle", "ar")).toBe(
      "كل مشروع في محفظتنا الإبداعية.",
    );
    expect(getPageCopy(config, "contact", "heroTitle", "en")).toBe("Let's talk");
  });

  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the administrator dashboard route", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/admin").at(-1)?.routeId).toBe("/admin");
  });

  it("matches the about, contact, services and projects indexes and their server-renderable detail routes", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    expect(router.matchRoutes("/about").at(-1)?.routeId).toBe("/about/");
    expect(router.matchRoutes("/contact").at(-1)?.routeId).toBe("/contact/");
    expect(router.matchRoutes("/services").at(-1)?.routeId).toBe("/services/");
    expect(router.matchRoutes("/services/seo").at(-1)?.routeId).toBe("/services/$slug");
    expect(router.matchRoutes("/projects").at(-1)?.routeId).toBe("/projects/");
    expect(router.matchRoutes("/projects/bio-derma-group").at(-1)?.routeId).toBe("/projects/$slug");
  });

  it("lists the social campaign concept under both social media and branding", () => {
    const concept = projects.find((project) => project.slug === "social-media-growth-concept");
    const existingBrandProject = projects.find((project) => project.slug === "bio-derma-group");

    expect(concept).toBeDefined();
    if (!concept) throw new Error("Expected the social campaign concept to exist");
    expect(projectHasCategory(concept, "social-media")).toBe(true);
    expect(projectHasCategory(concept, "branding")).toBe(true);
    expect(existingBrandProject && projectHasCategory(existingBrandProject, "social-media")).toBe(
      false,
    );
  });

  it("excludes video production projects from the all projects filter", () => {
    const videoProject = projectItemsFromConfig([
      {
        ...initialConfig.portfolio[0]!,
        id: "video-all-filter-test",
        projectCategory: "video",
      },
    ])[0];
    if (!videoProject) throw new Error("Expected a video project for the all-projects filter");

    const allProjects = [...projectItemsFromConfig(initialConfig.portfolio), videoProject];
    const allCategoryProjects = filterProjectsByCategory(allProjects, "all");
    const videoCategoryProjects = filterProjectsByCategory(allProjects, "video");

    expect(allCategoryProjects.some((project) => projectHasCategory(project, "video"))).toBe(false);
    expect(videoCategoryProjects.length).toBeGreaterThan(0);
    expect(videoCategoryProjects.every((project) => projectHasCategory(project, "video"))).toBe(
      true,
    );
    expect(allCategoryProjects.length + videoCategoryProjects.length).toBe(allProjects.length);
  });

  it("identifies video media URLs without excluding image URLs", () => {
    expect(isVideoMediaUrl("/media/video/reel.mp4")).toBe(true);
    expect(isVideoMediaUrl("https://cdn.example.com/reel.webm?token=123")).toBe(true);
    expect(isVideoMediaUrl("blob:https://viralzoom.agency/video-id")).toBe(true);
    expect(isVideoMediaUrl("/media/portfolio/project.webp")).toBe(false);
    expect(isVideoMediaUrl("https://cdn.example.com/client-logo.svg")).toBe(false);
  });

  it("supports multiple Reels and Promo videos per video-production project", () => {
    const item = {
      ...initialConfig.portfolio[0]!,
      id: "video-showcase-test",
      link: "https://example.com/project",
      projectCategory: "video" as const,
      reelsVideos: ["https://cdn.example.com/reel-one.mp4", "https://cdn.example.com/reel-two.mp4"],
      promoVideos: ["https://cdn.example.com/promo-one.mp4"],
    };
    const project = projectItemsFromConfig([item])[0];

    expect(projectCategories.some((category) => category.id === "video")).toBe(true);
    expect(project?.category).toBe("video");
    expect(project?.link).toBe("https://example.com/project");
    expect(project && projectHasCategory(project, "video")).toBe(true);
    expect(project?.reelsVideos).toHaveLength(2);
    expect(project?.promoVideos).toHaveLength(1);
  });

  it("provides a second social project with exactly eight gallery images", () => {
    const project = projects.find((item) => item.slug === "social-media-eight-posts");

    expect(project?.kind).toBe("case-study");
    if (!project || project.kind !== "case-study") {
      throw new Error("Expected the eight-image social project to exist");
    }
    expect(project.imageGallery).toHaveLength(8);
    expect(projectHasCategory(project, "social-media")).toBe(true);
  });

  it("keeps the social case study editable with eight posts, three Meta images and an ending video", () => {
    const project = projects.find((item) => item.slug === "social-media-growth-concept");

    expect(project?.kind).toBe("case-study");
    if (!project || project.kind !== "case-study" || !project.socialMediaShowcase) {
      throw new Error("Expected the social campaign case study to exist");
    }
    expect(project.socialMediaShowcase.posts).toHaveLength(8);
    expect(project.socialMediaShowcase.performanceImages).toHaveLength(3);
    expect(project.socialMediaShowcase.video).toBeTruthy();
    expect(project.socialMediaShowcase.communityGrowth.length).toBeGreaterThan(0);
  });

  it("uses the verified viralzoom.agency origin for canonical URLs", () => {
    expect(canonicalUrl("/services/website-design")).toBe(
      "https://viralzoom.agency/services/website-design",
    );
  });

  it("does not publish dashboard duplicate-copy records in the public project list", () => {
    const original = initialConfig.portfolio[0];
    if (!original) throw new Error("Expected an initial portfolio project");
    const copy = {
      ...original,
      id: "duplicate-copy-test",
      name: { en: "Brand project (Copy) (Copy)", ar: "نسخة مكررة" },
    };

    expect(projectItemsFromConfig([copy])).toHaveLength(0);
  });
});
