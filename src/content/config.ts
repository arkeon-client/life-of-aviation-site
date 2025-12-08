// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const programsCollection = defineCollection({
  type: 'content', 
  schema: z.object({
    title: z.string(),
    description: z.string(),
    duration: z.string().optional(),
    level: z.string().optional(),
    image: z.string().optional(),
    order: z.number().default(0),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Allow date to be optional or string to avoid parsing errors
    publishDate: z.any(), 
    description: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  'programs': programsCollection,
  'blog': blogCollection,
};