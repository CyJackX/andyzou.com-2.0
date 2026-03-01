export type Media =
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster?: string }
  | { kind: "strip"; sources: string[] };

export type Case = {
  id: string;
  title: string;
  copy: string;
  tags: string[];
  href?: string;
  media: Media;
};

export const CASES: Case[] = [
  {
    id: "death-becomes-her",
    title: "Death Becomes Her — Broadway BTS Promos",
    copy: "Director | Producer | Editor",
    tags: ["broadway", "promo"],
    media: {
      kind: "image",
      src: "/images/dbh.jpg",
      alt: "Death Becomes Her",
    },
  },
  {
    id: "rizzle",
    title: "Rizzle Asian Comedy Fest",
    copy: "Creator | Grand Prize Winner",
    tags: ["comedy", "festival"],
    media: {
      kind: "strip",
      sources: [
        "/videos/rizzle1.mp4",
        "/videos/rizzle2.mp4",
        "/videos/rizzle3.mp4",
      ],
    },
  },
];
