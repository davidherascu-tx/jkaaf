import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false, // Set to false if statically generating pages, using ISR or tag-based revalidation
  apiVersion: '2024-03-31', // <-- Add this line to fix the warning!
})