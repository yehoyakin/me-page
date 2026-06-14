import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
  }),

  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(), // IMPORTANT FIX

    background: z.string().optional(),

    scenes: z
      .array(
        z.object({
          image: z.string(),
          start: z.number(),
          end: z.number(),
        })
      )
      .optional(),
  }),
});

export const collections = { blog };