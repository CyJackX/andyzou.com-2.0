import { CASES } from "../data/cases";
import type { Case, Media } from "../data/cases";

export type WorkVideo = Case & {
  slug: string;
  seriesId?: string;
  videoOrder: number;
  sourceHref?: string;
};

export type WorkTileData = {
  type: "video";
  id: string;
  title: string;
  subtitle?: string;
  roles?: string;
  copy?: string;
  media: Media;
  href: string;
  vertical?: boolean;
};

const VIDEOS: WorkVideo[] = CASES.map((entry, index) => ({
  ...entry,
  slug: entry.id,
  videoOrder: entry.videoOrder ?? index,
  sourceHref: entry.sourceHref ?? entry.href,
}));

const SERIES_IDS = Array.from(
  new Set(
    VIDEOS.flatMap((video) => (video.seriesId ? [video.seriesId] : [])),
  ),
);

export function getSeriesIds(): string[] {
  return [...SERIES_IDS];
}

export function getVideoById(id: string): WorkVideo | undefined {
  return VIDEOS.find((video) => video.id === id);
}

export function getVideoBySlug(slug: string): WorkVideo | undefined {
  return VIDEOS.find((video) => video.slug === slug);
}

export function getVideosBySeries(seriesId: string): WorkVideo[] {
  return VIDEOS.filter((video) => video.seriesId === seriesId).sort(
    (a, b) => a.videoOrder - b.videoOrder,
  );
}

function getVideoHref(video: WorkVideo): string {
  return video.sourceHref ?? video.href ?? `/video/${video.slug}/`;
}

export function getSeriesTitle(seriesId: string): string {
  return seriesId
    .split("-")
    .filter(Boolean)
    .map((part) => part.replace(/_/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getVideoTileData(
  video: WorkVideo,
  hrefOverride?: string,
): WorkTileData {
  return {
    type: "video",
    id: video.id,
    title: video.title,
    subtitle: video.subtitle,
    roles: video.roles,
    copy: video.copy,
    media: video.media,
    href: hrefOverride ?? getVideoHref(video),
    vertical: video.vertical,
  };
}

export function getWorkTileDataById(
  id: string,
  hrefOverride?: string,
): WorkTileData | undefined {
  const video = getVideoById(id);
  return video ? getVideoTileData(video, hrefOverride) : undefined;
}

export function getSeriesTiles(seriesId: string): WorkTileData[] {
  return getVideosBySeries(seriesId).map((video) => getVideoTileData(video));
}

export function hasSeries(seriesId: string): boolean {
  return SERIES_IDS.includes(seriesId);
}
