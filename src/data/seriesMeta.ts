import type { Media } from "./cases";

export type SeriesMeta = {
  title: string;
  copy?: string;
  homeSectionId?: string;
  homeTile?: {
    media: Media;
    subtitle?: string;
    roles?: string;
    copy?: string;
  };
};

export const SERIES_META: Record<string, SeriesMeta> = {
  "apocalypse-problems": {
    title: "Apocalypse Problems",
    copy: "A comedic webseries for SpoiledNYC.",
    homeSectionId: "scripted-digital-series",
    homeTile: {
      subtitle: "SpoiledNYC ft. Gianmarco Soresi & Megan Sass",
      roles: "Director | DP | Editor",
      media: {
        kind: "video",
        src: "/videos/apocalypse.mp4",
        poster: "/thumbposters/klRZB8Q87oY-hqdefault.jpg",
      },
    },
  },
  "asian-afterlife": {
    title: "Andy's Asian Afterlife",
    copy: "Grand prize winner of Rizzle's Asian Comedy Fest.",
    homeSectionId: "scripted-digital-series",
    homeTile: {
      subtitle: "Rizzle's Asian Comedy Fest",
      roles: "Creator",
      copy: "1000$ grand prize winner of Rizzle's Asian Comedy Fest.",
      media: {
        kind: "video",
        src: "/videos/rizzle.mp4",
        poster: "/thumbposters/rizzle.jpg",
      },
    },
  },
  "comedy-central-originals": {
    title: "Comedy Central Originals",
    copy: "At Comedy Central's Webby-winning Digital team, Andy directed and produced multiple series, music videos, and other collaborations with notable influencers like Anwar, Adam Waheed, Sven Johnson, Rose Kelso, & more.",
    homeSectionId: "scripted-digital-series",
    homeTile: {
      roles: "Director | Producer | Writer | Editor",
      copy: "At Comedy Central's Webby-winning Digital team, Andy directed, wrote, & produced Mini-Mocks, music videos, and content collabs with notable influencers.",
      media: {
        kind: "video",
        src: "/videos/comedycentral.mp4",
        poster: "/thumbposters/comedycentraloriginals.jpg",
      },
    },
  },
  "death-becomes-her": {
    title: "Death Becomes Her",
    copy: "Handling crew, equipment, and production design direction, Andy's production company helped put together this short series of behind-the-scenes interviews with the creators of Broadways's Death Becomes Her.",

    homeSectionId: "branded-content",
    homeTile: {
      subtitle: "RPM",
      copy: "A series of BTS social promos for Broadway's Death Becomes Her.",
      media: {
        kind: "video",
        src: "/videos/dbh.mp4",
        poster: "/thumbposters/dbh.jpg",
      },
    },
  },
  "making-it": {
    title: "Making It",
    copy: "An original vertical series for Snapchat's Snap Originals.",
    homeSectionId: "scripted-digital-series",
    homeTile: {
      subtitle: "Snap Originals ft. Dave Mizzoni",
      roles: "Director | DP | Editor",
      media: {
        kind: "video",
        src: "/videos/makingit.mp4",
        poster: "/thumbposters/makingit.jpg",
      },
    },
  },
  "the-honest-waitress": {
    title: "The Honest Waitress",
    copy: "A comedic webseries for PitTV.",
    homeSectionId: "scripted-digital-series",
    homeTile: {
      subtitle: "PitTV",
      roles: "Director",
      media: {
        kind: "video",
        src: "/videos/waitress.mp4",
        poster: "/thumbposters/0SX0n9FG_GY-hqdefault.jpg",
      },
    },
  },
};
