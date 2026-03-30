import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

const eventSchema = {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    { name: 'title', title: 'Event Title', type: 'string' },
    { name: 'startDate', title: 'Start Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
    { name: 'endDate', title: 'End Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
    { name: 'location', title: 'Location', type: 'string' },
    { name: 'details', title: 'Detail Information', type: 'text' },
    { name: 'registrationLink', title: 'Registration Link', type: 'url' },
    { name: 'eventImage', title: 'Event Cover Image', type: 'image', options: { hotspot: true } },
    { name: 'infoPdf', title: 'Information PDF', type: 'file', options: { accept: '.pdf' } },
  ],
};

export default defineConfig({
  basePath: '/admin', 
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  title: 'JKA/AF CMS',
  plugins: [structureTool()],
  schema: {
    types: [eventSchema],
  },
});