import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-29', // Use today's date
  useCdn: false, // Set to false if you want immediate updates, true for faster cached edge delivery
});

// Helper function to generate image URLs from Sanity
const builder = imageUrlBuilder(client);
export function urlFor(source: any) {
  return builder.image(source);
}