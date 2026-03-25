export type SeriesMeta = {
  title: string;
  copy?: string;
  homeSectionId?: string;
};

export const SERIES_META: Record<string, SeriesMeta> = {
  "apocalypse-problems": {
    title: "Apocalypse Problems",
    copy: "A comedic webseries for SpoiledNYC.",
    homeSectionId: "scripted-digital-series",
  },
  "asian-afterlife": {
    title: "Andy's Asian Afterlife",
    copy: "Grand prize winner of Rizzle's Asian Comedy Fest.",
    homeSectionId: "scripted-digital-series",
  },
  "comedy-central-originals": {
    title: "Comedy Central Originals",
    copy: "At Comedy Central's Webby-winning Digital team, Andy directed and produced multiple series, music videos, and other collaborations with notable influencers like Anwar, Adam Waheed, Sven Johnson, Rose Kelso, & more.",
    homeSectionId: "scripted-digital-series",
  },
  "death-becomes-her": {
    title: "Death Becomes Her",
    copy: "A series of BTS social promos for Broadway's Death Becomes Her.",
    homeSectionId: "branded-content",
  },
  "making-it": {
    title: "Making It",
    copy: "An original vertical series for Snapchat's Snap Originals.",
    homeSectionId: "scripted-digital-series",
  },
  series: {
    title: "Scripted Digital Series",
    copy: "Narrative comedy series directed and produced for digital platforms, publishers, and original creators.",
    homeSectionId: "scripted-digital-series",
  },
  "the-honest-waitress": {
    title: "The Honest Waitress",
    copy: "A comedic webseries for PitTV.",
    homeSectionId: "scripted-digital-series",
  },
};
