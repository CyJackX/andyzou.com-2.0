import { getCollection, type CollectionEntry } from "astro:content";

export type BlogEntry = CollectionEntry<"blog">;

export async function getPublishedBlogPosts(): Promise<BlogEntry[]> {
  const posts = await getCollection("blog");

  return posts
    .filter((post: BlogEntry) => post.data.draft !== true)
    .sort(
      (a: BlogEntry, b: BlogEntry) =>
        b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
    );
}
