import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection(
    
    {
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/blog",
  }),

  schema: z.object({
    title: z.string(),
    theme: z.string(),
    description: z.string(),
    date: z.coerce.date(), // IMPORTANT FIX
    cardBackground: z.string().optional(),

    background: z.string().optional(),

    backgroundBlur: z.number().optional().default(0),
    backgroundOpacity: z.number().optional().default(1),
    backgroundParallax: z.number().optional().default(0.2),

    scenes: z
    .array(
        z.object({
        image: z.string(),
        align: z.enum(["left", "right", "center"]).optional(),
        })
    )
    .optional(),

    backgrounds: z
      .array(
        z.object({
          percent: z.number(),
          image: z.string(),
        })
      )
      .optional(),

    widgetPosition: z
      .object({
        top: z.string().optional(),
        right: z.string().optional(),
        bottom: z.string().optional(),
        left: z.string().optional(),
      })
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

const projects = defineCollection({

  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/projects",
  }),

  schema: z.object({
    title: z.string(),
    tag: z.string(),

    shortDescription: z.string(),

    roles: z.array(
      z.enum([
        "lead_programmer",
        "ui",
        "game_design",
        "art",
        "audio",
        "tech_art",
        "systems",
        "tools",
        "developer",
      ])
    ),

    variant: z.enum(["primary", "secondary"]),

    backgroundImage: z.string(),

    order: z.number(),

    links: z.array(
      z.object({
        text: z.string(),
        href: z.string(),
      })
    ),
  }),
});

export const collections = {
  projects,blog
};