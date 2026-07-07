import { defineMiddleware } from "astro:middleware";
import { SITE_URL } from "../site.config.js";

const canonicalSite = new URL(SITE_URL);
const fileExtensionPattern = /\.[^/]+$/;
const localHostnames = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const redirectStatus = import.meta.env.DEV ? 307 : 301;

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  const isLocalRequest = localHostnames.has(url.hostname);
  const shouldNormalizePath =
    url.pathname.length > 1 &&
    url.pathname.endsWith("/") &&
    !fileExtensionPattern.test(url.pathname);

  const canonicalOrigin =
    url.protocol === canonicalSite.protocol &&
    url.host === canonicalSite.host;
  const shouldCanonicalizeOrigin = !isLocalRequest && !canonicalOrigin;

  if (shouldCanonicalizeOrigin || shouldNormalizePath) {
    const redirectURL = new URL(url);

    if (shouldCanonicalizeOrigin) {
      redirectURL.protocol = canonicalSite.protocol;
      redirectURL.host = canonicalSite.host;
    }

    if (shouldNormalizePath) {
      redirectURL.pathname = url.pathname.slice(0, -1);
    }

    return new Response(null, {
      status: redirectStatus,
      headers: {
        "Cache-Control": "no-store",
        Location: redirectURL.toString(),
      },
    });
  }

  return next();
});
