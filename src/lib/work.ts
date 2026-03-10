import { CASES } from "../data/cases";
import type { Case, Media } from "../data/cases";
import { SERIES } from "../data/series";
import type { Series } from "../data/series";

export type WorkVideo = Case & {
  slug: string;
  seriesId?: string;
  showOnHome: boolean;
  homeOrder: number;
  videoOrder: number;
  sourceHref?: string;
};

export type WorkSeries = Series & {
  slug: string;
  showOnHome: boolean;
  homeOrder: number;
};

export type HomeFeedItem = {
  type: "series" | "video";
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  roles: string;
  copy?: string;
  tags: string[];
  media: Media;
  href: string;
  homeOrder: number;
  vertical?: boolean;
};

const DEFAULT_PLACEHOLDER_MEDIA: Media = {
  kind: "image",
  src: "https://placehold.co/640x360",
  alt: "Placeholder thumbnail",
};

function isVisible(show?: boolean) {
  return show !== false;
}

const VIDEOS: WorkVideo[] = CASES.map((entry, index) => ({
  ...entry,
  slug: entry.id,
  showOnHome: entry.showOnHome ?? true,
  homeOrder: entry.homeOrder ?? 1000 + index,
  videoOrder: entry.videoOrder ?? index,
  sourceHref: entry.sourceHref ?? entry.href,
})).filter((video) => isVisible(video.show));

const SERIES_NORMALIZED: WorkSeries[] = SERIES.filter((series) =>
  isVisible(series.show),
)
  .map((series, index) => ({
    ...series,
    slug: series.id,
    showOnHome: series.showOnHome ?? true,
    homeOrder: series.homeOrder ?? index,
  }))
  .filter((series) => VIDEOS.some((video) => video.seriesId === series.id))
  .sort((a, b) => a.homeOrder - b.homeOrder);

const SERIES_WITH_VIDEOS = SERIES_NORMALIZED.filter((series) =>
  VIDEOS.some((video) => video.seriesId === series.id),
).sort((a, b) => a.homeOrder - b.homeOrder);

export function getSeries(): WorkSeries[] {
  return SERIES_WITH_VIDEOS;
}

export function getVideos(): WorkVideo[] {
  return [...VIDEOS].sort((a, b) => a.homeOrder - b.homeOrder);
}

export function getSeriesBySlug(slug: string): WorkSeries | undefined {
  return SERIES_WITH_VIDEOS.find((series) => series.slug === slug);
}

export function getSeriesById(id: string): WorkSeries | undefined {
  return SERIES_WITH_VIDEOS.find((series) => series.id === id);
}

export function getVideoBySlug(slug: string): WorkVideo | undefined {
  return VIDEOS.find((video) => video.slug === slug);
}

export function getVideosBySeries(seriesId: string): WorkVideo[] {
  return VIDEOS.filter((video) => video.seriesId === seriesId).sort(
    (a, b) => a.videoOrder - b.videoOrder,
  );
}

function getSeriesCoverMedia(series: WorkSeries): Media {
  const seriesVideos = getVideosBySeries(series.id);
  const preferred = series.coverCaseId
    ? VIDEOS.find((video) => video.id === series.coverCaseId)
    : undefined;
  return preferred?.media ?? seriesVideos[0]?.media ?? DEFAULT_PLACEHOLDER_MEDIA;
}

function getSeriesHomeItem(series: WorkSeries): HomeFeedItem {
  const videos = getVideosBySeries(series.id);
  const countLabel = `${videos.length} video${videos.length === 1 ? "" : "s"}`;
  return {
    type: "series",
    id: series.id,
    slug: series.slug,
    title: series.title,
    subtitle: "Series",
    roles: countLabel,
    copy: series.description || "",
    tags: series.tags,
    media: getSeriesCoverMedia(series),
    href: `/series/${series.slug}/`,
    homeOrder: series.homeOrder,
  };
}

function getVideoHomeItem(video: WorkVideo): HomeFeedItem {
  const directHref = video.sourceHref ?? video.href ?? `/video/${video.slug}/`;
  return {
    type: "video",
    id: video.id,
    slug: video.slug,
    title: video.title,
    subtitle: video.subtitle,
    roles: video.roles,
    copy: video.copy,
    tags: video.tags,
    media: video.media,
    href: directHref,
    homeOrder: video.homeOrder,
    vertical: video.vertical,
  };
}

export function getHomeFeed(): HomeFeedItem[] {
  const seriesItems = getSeries()
    .filter((series) => series.showOnHome)
    .map(getSeriesHomeItem);
  const videoItems = getVideos()
    .filter((video) => video.showOnHome)
    .map(getVideoHomeItem);
  return [...seriesItems, ...videoItems].sort((a, b) => a.homeOrder - b.homeOrder);
}

export function getHomeTags(): string[] {
  return [...new Set(getHomeFeed().flatMap((item) => item.tags))].sort();
}
