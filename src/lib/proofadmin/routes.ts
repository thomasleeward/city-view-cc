import { z } from "zod";

export const routeKinds = [
  "system",
  "page",
  "media",
  "clean_link",
  "sermon_series",
  "campus",
  "legacy",
] as const;

export type RouteKind = (typeof routeKinds)[number];

const reservedPrefixes = [
  "/_next",
  "/admin",
  "/content-preview",
  "/api",
  "/auth",
  "/files",
  "/images",
  "/videos",
] as const;

const reservedExactPaths = new Set([
  "/",
  "/favicon.ico",
  "/favicon.svg",
  "/robots.txt",
  "/sitemap.xml",
]);

export class InvalidRoutePathError extends Error {}

export function normalizeRoutePath(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new InvalidRoutePathError("A public path is required.");
  }

  let pathname: string;

  try {
    pathname = new URL(trimmed).pathname;
  } catch {
    pathname = trimmed.split(/[?#]/, 1)[0] ?? "";
  }

  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    throw new InvalidRoutePathError("The path contains invalid URL encoding.");
  }

  if (pathname.includes("\\")) {
    throw new InvalidRoutePathError(
      "Backslashes are not allowed in public paths.",
    );
  }
  pathname = pathname.replace(/\/{2,}/g, "/");
  pathname = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (pathname !== "/") {
    pathname = pathname.replace(/\/+$/, "");
  }

  if (/\p{Cc}/u.test(pathname)) {
    throw new InvalidRoutePathError("The path contains control characters.");
  }

  const segments = pathname.split("/");
  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new InvalidRoutePathError("Relative path segments are not allowed.");
  }

  return pathname || "/";
}

export function routePathKey(input: string): string {
  return normalizeRoutePath(input).toLocaleLowerCase("en-US");
}

export function isReservedRoutePath(input: string): boolean {
  const key = routePathKey(input);

  if (reservedExactPaths.has(key)) {
    return true;
  }

  return reservedPrefixes.some(
    (prefix) => key === prefix || key.startsWith(`${prefix}/`),
  );
}

export function assertRoutePathAvailableForKind(
  input: string,
  kind: RouteKind,
): string {
  const normalized = normalizeRoutePath(input);
  const key = routePathKey(normalized);
  const ownsReservedNamespace =
    (kind === "media" && /^\/(files|images|videos)\//.test(key)) ||
    (kind === "sermon_series" && key.startsWith("/sermons/")) ||
    (kind === "campus" && key.startsWith("/campus/")) ||
    (kind === "page" && key.startsWith("/missionary/"));

  if (
    kind !== "system" &&
    !ownsReservedNamespace &&
    isReservedRoutePath(normalized)
  ) {
    throw new InvalidRoutePathError(
      `${normalized} is reserved for a website system route.`,
    );
  }

  if (kind === "media" && !/^\/(files|images|videos)\//i.test(normalized)) {
    throw new InvalidRoutePathError(
      "Media paths must begin with /files/, /images/, or /videos/.",
    );
  }

  return normalized;
}

export const routeInputSchema = z.object({
  path: z.string().transform(normalizeRoutePath),
  kind: z.enum(routeKinds),
});

export const redirectDestinationSchema = z
  .url()
  .trim()
  .refine((value) => new URL(value).protocol === "https:", {
    message: "Clean Link destinations must use HTTPS.",
  });
