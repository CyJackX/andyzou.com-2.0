import rss from "@astrojs/rss";
import { getPublishedBlogPosts } from "../lib/blog";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
	const posts = await getPublishedBlogPosts();
	const site = context.site;
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site,
		trailingSlash: false,
		items: posts.map((post) => ({
			...post.data,
			link: new URL(`/blog/${post.id}`, site).toString(),
		})),
	});
}
