const detailSections = Array.from(document.querySelectorAll("details"));
const SUMMARY_SCROLL_TOP_OFFSET_PX = 0;
const SUMMARY_SCROLL_EASE = 0.2;
const SUMMARY_SCROLL_SETTLE_PX = 1;
const SUMMARY_SCROLL_CHASE_MS = 500;

const pendingVideoHydration = new WeakMap<HTMLDetailsElement, number>();
const activeSummaryChase = new WeakMap<HTMLDetailsElement, number>();

function hydrateDetailVideos(detail: HTMLDetailsElement) {
  const videos = detail.querySelectorAll("video[data-src]");

  videos.forEach((video) => {
    if (!(video instanceof HTMLVideoElement)) return;

    const hiddenByClosedAncestor = video.closest("details:not([open])");
    if (hiddenByClosedAncestor) return;

    if (!video.currentSrc) {
      const src = video.dataset.src;
      if (!src) return;

      video.src = src;
      video.load();
    }

    void video.play().catch(() => {});
  });
}

function scheduleDetailVideoHydration(detail: HTMLDetailsElement) {
  const pendingFrame = pendingVideoHydration.get(detail);
  if (pendingFrame) {
    window.cancelAnimationFrame(pendingFrame);
  }

  const frameId = window.requestAnimationFrame(() => {
    pendingVideoHydration.delete(detail);

    if (!detail.open) return;
    hydrateDetailVideos(detail);
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
      const scrollDelta = Math.abs(delta) < 8 ? delta : delta * SUMMARY_SCROLL_EASE;
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
  detailSections.forEach((detail) => {
    if (!(detail instanceof HTMLDetailsElement)) return;

    if (detail.open) {
      scheduleDetailVideoHydration(detail);
    }
  });

  detailSections.forEach((detail) => {
    if (!(detail instanceof HTMLDetailsElement)) return;

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

      const summary = detail.querySelector(":scope > summary");
      if (!(summary instanceof HTMLElement)) return;

      chaseSummary(detail, summary);
    });
  });
}
