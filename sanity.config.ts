import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

// Import your properly combined schemas!
import { schemaTypes } from './sanity/schemaTypes';

export default defineConfig({
  basePath: '/admin', 
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  title: 'JKA/AF CMS',
  plugins: [structureTool()],
  schema: {
    // Tell Sanity to use your exported array (which includes News)
    types: schemaTypes,
  },
});