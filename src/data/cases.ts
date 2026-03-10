export type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster?: string }
  | { kind: "strip"; sources: string[] };

export type Case = {
  id: string;
  title: string;
  subtitle?: string;
  roles: string;
  copy?: string;
  tags: string[];
  youtubeId?: string;
  href?: string;
  seriesId?: string;
  sourceHref?: string;
  show?: boolean;
  showOnHome?: boolean;
  homeOrder?: number;
  videoOrder?: number;
  publishedAt?: string;
  vertical?: boolean;
  media: Media;
};

export { CASES } from "./cases.generated";
