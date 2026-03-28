// Homepage section behavior:
// - Hash navigation opens the matching section immediately.
// - With no hash, the first section auto-opens as the default state.
// - That default auto-open should keep the URL clean until a section is explicitly chosen.
// - The default auto-open waits for deferred videos in the first section to load,
//   with a timeout fallback so the page does not stay collapsed indefinitely.
// - Once a section is opened, its deferred media hydrates and video playback resumes.
const detailSections = Array.from(document.querySelectorAll("details"));
const SUMMARY_SCROLL_TOP_OFFSET_PX = 10;
const SUMMARY_SCROLL_EASE = 0.1;
const SUMMARY_SCROLL_SETTLE_PX = 1;
const SUMMARY_SCROLL_CHASE_MS = 600;
const DETAIL_VIDEO_PRELOAD_TIMEOUT_MS = 1000;

const pendingVideoHydration = new WeakMap<HTMLDetailsElement, number>();
const activeSummaryChase = new WeakMap<HTMLDetailsElement, number>();
const suppressNextHashSync = new WeakSet<HTMLDetailsElement>();

function getHtmlDetailSections(): HTMLDetailsElement[] {
  return detailSections.filter(
    (detail): detail is HTMLDetailsElement => detail instanceof HTMLDetailsElement,
  );
}

function getHashTargetDetail(
  htmlDetailSections: HTMLDetailsElement[],
): HTMLDetailsElement | undefined {
  const targetId = window.location.hash.slice(1);
  if (!targetId) return undefined;

  return htmlDetailSections.find((detail) => detail.id === targetId);
}

function syncHashToDetail(detail: HTMLDetailsElement) {
  if (!detail.id) return;

  const nextHash = `#${detail.id}`;
  if (window.location.hash === nextHash) return;

  window.history.replaceState(null, "", nextHash);
}

function syncOpenDetailWithHash({
  htmlDetailSections,
  allowFallback,
}: {
  htmlDetailSections: HTMLDetailsElement[];
  allowFallback: boolean;
}): HTMLDetailsElement | undefined {
  if (htmlDetailSections.length === 0) return;

  const hashTargetDetail = getHashTargetDetail(htmlDetailSections);
  if (hashTargetDetail) {
    hashTargetDetail.open = true;
    return hashTargetDetail;
  }

  if (!allowFallback) return;

  const hasOpenDetail = htmlDetailSections.some((detail) => detail.open);
  if (hasOpenDetail) return;

  return htmlDetailSections[0];
}

function hydrateDetailImages(detail: HTMLDetailsElement) {
  const images = detail.querySelectorAll("img[data-src]");

  images.forEach((image) => {
    if (!(image instanceof HTMLImageElement)) return;

    if (!image.currentSrc) {
      const src = image.dataset.src;
      if (!src) return;

      image.src = src;
    }
  });
}

function hydrateDetailVideoSources(detail: HTMLDetailsElement) {
  const videos = detail.querySelectorAll("video[data-src]");

  videos.forEach((video) => {
    if (!(video instanceof HTMLVideoElement)) return;

    if (!video.currentSrc) {
      const src = video.dataset.src;
      if (!src) return;

      video.src = src;
      video.load();
    }
  });
}

function hydrateDetailMedia(detail: HTMLDetailsElement) {
  hydrateDetailImages(detail);
  hydrateDetailVideoSources(detail);

  const videos = detail.querySelectorAll("video[data-src]");

  videos.forEach((video) => {
    if (!(video instanceof HTMLVideoElement)) return;

    const hiddenByClosedAncestor = video.closest("details:not([open])");
    if (hiddenByClosedAncestor) return;

    void video.play().catch(() => {});
  });
}

function preloadDetailVideos(detail: HTMLDetailsElement): Promise<void> {
  hydrateDetailVideoSources(detail);

  const videos = Array.from(detail.querySelectorAll("video[data-src]")).filter(
    (video): video is HTMLVideoElement => video instanceof HTMLVideoElement,
  );

  if (videos.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(
    videos.map(
      (video) =>
        new Promise<void>((resolve) => {
          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            resolve();
            return;
          }

          const cleanup = () => {
            window.clearTimeout(timeoutId);
            video.removeEventListener("loadeddata", handleReady);
            video.removeEventListener("error", handleReady);
          };

          const handleReady = () => {
            cleanup();
            resolve();
          };

          const timeoutId = window.setTimeout(handleReady, DETAIL_VIDEO_PRELOAD_TIMEOUT_MS);

          video.addEventListener("loadeddata", handleReady, { once: true });
          video.addEventListener("error", handleReady, { once: true });
        }),
    ),
  ).then(() => undefined);
}

function scheduleDetailVideoHydration(detail: HTMLDetailsElement) {
  const pendingFrame = pendingVideoHydration.get(detail);
  if (pendingFrame) {
    window.cancelAnimationFrame(pendingFrame);
  }

  const frameId = window.requestAnimationFrame(() => {
    pendingVideoHydration.delete(detail);

    if (!detail.open) return;
    hydrateDetailMedia(detail);
  });

  pendingVideoHydration.set(detail, frameId);
}

function pauseDetailVideos(detail: HTMLDetailsElement) {
  const videos = detail.querySelectorAll("video");

  videos.forEach((video) => {
    if (!(video instanceof HTMLVideoElement)) return;
    video.pause();
  });
}

function stopSummaryChase(detail: HTMLDetailsElement) {
  const activeFrame = activeSummaryChase.get(detail);
  if (!activeFrame) return;

  window.cancelAnimationFrame(activeFrame);
  activeSummaryChase.delete(detail);
}

function chaseSummary(detail: HTMLDetailsElement, summary: HTMLElement) {
  stopSummaryChase(detail);

  const endAt = performance.now() + SUMMARY_SCROLL_CHASE_MS;

  const step = () => {
    if (!detail.open) {
      activeSummaryChase.delete(detail);
      return;
    }

    const delta = summary.getBoundingClientRect().top - SUMMARY_SCROLL_TOP_OFFSET_PX;
    if (Math.abs(delta) > SUMMARY_SCROLL_SETTLE_PX) {
      const scrollDelta = delta * SUMMARY_SCROLL_EASE;
      window.scrollBy(0, scrollDelta);
    }

    const shouldContinue = performance.now() < endAt;

    if (!shouldContinue) {
      activeSummaryChase.delete(detail);
      return;
    }

    activeSummaryChase.set(detail, window.requestAnimationFrame(step));
  };

  activeSummaryChase.set(detail, window.requestAnimationFrame(step));
}

export function initIndexPage() {
  const htmlDetailSections = getHtmlDetailSections();
  const initialHashTarget = getHashTargetDetail(htmlDetailSections);
  const hasInitiallyOpenDetail = htmlDetailSections.some((detail) => detail.open);

  const initiallyOpenedDetail = syncOpenDetailWithHash({
    htmlDetailSections,
    allowFallback: initialHashTarget ? true : false,
  });
  const suppressInitialSummaryChase = !initialHashTarget
    ? initiallyOpenedDetail
    : undefined;

  if (!initialHashTarget && !hasInitiallyOpenDetail && initiallyOpenedDetail) {
    suppressNextHashSync.add(initiallyOpenedDetail);
    hydrateDetailImages(initiallyOpenedDetail);

    void preloadDetailVideos(initiallyOpenedDetail).then(() => {
      const hasSinceOpenedDetail = htmlDetailSections.some((detail) => detail.open);
      if (hasSinceOpenedDetail || window.location.hash) return;

      initiallyOpenedDetail.open = true;
    });
  }

  htmlDetailSections.forEach((detail) => {
    if (detail.open) {
      scheduleDetailVideoHydration(detail);
    }
  });

  htmlDetailSections.forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) {
        const pendingFrame = pendingVideoHydration.get(detail);
        if (pendingFrame) {
          window.cancelAnimationFrame(pendingFrame);
          pendingVideoHydration.delete(detail);
        }

        stopSummaryChase(detail);
        pauseDetailVideos(detail);
        return;
      }

      scheduleDetailVideoHydration(detail);
      if (suppressNextHashSync.has(detail)) {
        suppressNextHashSync.delete(detail);
      } else {
        syncHashToDetail(detail);
      }

      const summary = detail.querySelector(":scope > summary");
      if (!(summary instanceof HTMLElement)) return;
      if (detail === suppressInitialSummaryChase) return;

      chaseSummary(detail, summary);
    });
  });

  window.addEventListener("hashchange", () => {
    syncOpenDetailWithHash({ htmlDetailSections, allowFallback: false });
  });
}
