import { defineMiddleware } from "astro:middleware";
import { SITE_URL } from "../site.config.js";

const canonicalSite = new URL(SITE_URL);
const fileExtensionPattern = /\.[^/]+$/;

export const onRequest = defineMiddleware(async ({ request }, next) => {
  const url = new URL(request.url);
  const shouldNormalizePath =
    url.pathname.length > 1 &&
    url.pathname.endsWith("/") &&
    !fileExtensionPattern.test(url.pathname);

  const canonicalOrigin =
    url.protocol === canonicalSite.protocol &&
    url.host === canonicalSite.host;

  if (!canonicalOrigin || shouldNormalizePath) {
    const redirectURL = new URL(url);

    redirectURL.protocol = canonicalSite.protocol;
    redirectURL.host = canonicalSite.host;

    if (shouldNormalizePath) {
      redirectURL.pathname = url.pathname.slice(0, -1);
    }

    return Response.redirect(redirectURL, 301);
  }

  return next();
});
