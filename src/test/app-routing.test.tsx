import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { projectHasCategory, projectHasExternalLink, projects } from "@/lib/projects";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
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
    expect(existingBrandProject && projectHasCategory(existingBrandProject, "social-media")).toBe(false);
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

  it("uses a project's URL as its external website link", () => {
    const project = projects.find((item) => item.slug === "bio-derma-group");

    expect(project).toBeDefined();
    if (!project) throw new Error("Expected the Bio Derma project to exist");

    expect(projectHasExternalLink(project)).toBe(false);
    expect(projectHasExternalLink({ ...project, url: "https://example.com" })).toBe(true);
  });
});
