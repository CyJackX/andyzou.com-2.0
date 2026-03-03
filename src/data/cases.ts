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
  media: Media;
};

export { CASES } from "./cases.generated";
