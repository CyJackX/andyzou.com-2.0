import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z
			.string()
			.min(50)
			.max(200)
			.refine((value) => !/^(todo|tktk|lorem ipsum)/i.test(value.trim()), {
				message: "description must be production-ready copy",
			}),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		heroImageAlt: z.string().min(8),
		excerpt: z.string().min(20).max(220).optional(),
		tags: z.array(z.string().min(1)).optional(),
		draft: z.boolean().optional().default(false),
	}),
});

export const collections = { blog };
