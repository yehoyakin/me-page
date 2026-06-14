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

    backgroundBlur: z.number().optional().default(0),
    backgroundOpacity: z.number().optional().default(1),

    scenes: z
      .array(
        z.object({
          image: z.string(),
          start: z.number(),
          end: z.number(),
        })
      )
      .optional(),

    cards: z
      .array(
        z
          .object({
            href: z.string().optional(),
            tag: z.string(),
            title: z.string(),
            description: z.string(),
            actionText: z.string(),
            variant: z.enum(["primary", "secondary"]).optional(),
            backgroundImage: z.string().optional(),
            links: z
              .array(
                z.object({
                  href: z.string(),
                  text: z.string().optional(),
                  image: z.string().optional(),
                })
              )
              .optional(),
          })
          .refine((item) => !!item.href || (Array.isArray(item.links) && item.links.length > 0), {
            message: "card must have either `href` or non-empty `links` array",
          })
      )
      .optional(),
  }),
});

export const collections = { blog };