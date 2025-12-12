import rss from '@astrojs/rss';
import { supabase } from '../lib/supabaseClient';

export async function GET(context) {
  // 1. Fetch posts from Supabase
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  // 2. Generate XML
  return rss({
    title: 'Life of Aviation Flight Log',
    description: 'Aviation tutoring, mentorship, and industry insights.',
    site: context.site, // This pulls your URL from astro.config or Netlify
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.created_at),
      description: post.description,
      link: `/blog/${post.slug}/`,
      // Optional: Add custom data for Mailchimp
      content: post.description, 
    })),
    customData: `<language>en-us</language>`,
  });
}