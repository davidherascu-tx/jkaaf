'use client';

import { NextStudio } from 'next-sanity/studio';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

const eventSchema = {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    { name: 'title', title: 'Event Title', type: 'string' },
    { 
      name: 'category', 
      title: 'Event Category', 
      type: 'string',
      options: {
        list: [
          { title: 'Seminar', value: 'Seminar' },
          { title: 'Championship', value: 'Championship' },
          { title: 'Training Camp', value: 'Training Camp' },
          { title: 'Exam / Grading', value: 'Exam / Grading' }
        ],
        layout: 'radio'
      },
      initialValue: 'Seminar'
    },
    { name: 'startDate', title: 'Start Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
    { name: 'endDate', title: 'End Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
    { name: 'location', title: 'Location', type: 'string' },
    { name: 'details', title: 'Detail Information', type: 'text' },
    { name: 'registrationLink', title: 'Registration Link', type: 'url' },
    { name: 'eventImage', title: 'Event Cover Image', type: 'image', options: { hotspot: true } },
    { name: 'infoPdf', title: 'Information PDF', type: 'file', options: { accept: '.pdf' } },
  ],
};

const calendarSchema = {
  name: 'calendarItem',
  title: 'Calendar Entries',
  type: 'document',
  fields: [
    { name: 'title', title: 'Entry Title', type: 'string', description: 'e.g., Dojo Closed, Local Testing' },
    { 
      name: 'type', 
      title: 'Entry Type', 
      type: 'string',
      options: {
        list: [
          { title: 'Seminar', value: 'Seminar' },
          { title: 'Championship', value: 'Championship' },
          { title: 'Holiday / closed', value: 'Holiday / closed' },
          { title: 'Local event', value: 'Local event' }
        ],
        layout: 'radio'
      },
      initialValue: 'Local event'
    },
    { 
      name: 'startDate', 
      title: 'Start Date', 
      type: 'date', 
      options: { dateFormat: 'YYYY-MM-DD' },
      validation: (Rule: any) => Rule.required()
    },
    { 
      name: 'endDate', 
      title: 'End Date', 
      type: 'date', 
      options: { dateFormat: 'YYYY-MM-DD' },
      description: 'Leave blank if it is a single-day event.'
    }
  ],
};

const dojoSchema = {
  name: 'dojo',
  title: 'Registered Dojos',
  type: 'document',
  fields: [
    { name: 'isPrimary', title: 'Primary State Dojo', type: 'boolean', initialValue: false },
    { name: 'isCollegiateClub', title: 'Collegiate Club', type: 'boolean', initialValue: false, description: 'Check this box to flag this dojo as a Collegiate Club' },
    { name: 'name', title: 'Dojo Name', type: 'string' },
    { name: 'instructor', title: 'Chief Instructor', type: 'string' },
    
    // PHYSICAL DOJO ADDRESS
    { name: 'address', title: 'Dojo Street Address', type: 'string' },
    { name: 'city', title: 'Dojo City', type: 'string' },
    { name: 'state', title: 'Dojo State (Abbreviation, e.g. TX)', type: 'string' },
    { name: 'zip', title: 'Dojo Zip Code', type: 'string' },

    // CONTACT / MAILING ADDRESS
    { name: 'contactAddress', title: 'Contact Street Address', type: 'string' },
    { name: 'contactCity', title: 'Contact City', type: 'string' },
    { name: 'contactState', title: 'Contact State (Abbreviation)', type: 'string' },
    { name: 'contactZip', title: 'Contact Zip Code', type: 'string' },

    { name: 'phone', title: 'Phone Number', type: 'string' },
    { name: 'email', title: 'Email Address', type: 'string' },
    { name: 'website', title: 'Website URL', type: 'url' },
  ],
};

const newsSchema = {
  name: 'news',
  title: 'News & Announcements',
  type: 'document',
  fields: [
    { name: 'title', title: 'Article Title', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'slug', title: 'Slug (URL)', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule: any) => Rule.required() },
    { name: 'publishedAt', title: 'Publish Date', type: 'datetime', initialValue: () => new Date().toISOString() },
    { name: 'mainImage', title: 'Cover Image', type: 'image', options: { hotspot: true } },
    { 
      name: 'gallery', 
      title: 'Additional Pictures (Drag & Drop)', 
      type: 'array', 
      of: [{ type: 'image' }],
      options: { layout: 'grid' }
    },
    { name: 'excerpt', title: 'Short Excerpt', type: 'text', rows: 3 },
    { name: 'body', title: 'Article Body', type: 'array', of: [{ type: 'block' }] },
    { name: 'pdfDocument', title: 'PDF Attachment', type: 'file', options: { accept: 'application/pdf' } },
  ],
};

const customStructure = (S: any, context: any) => {
  return S.list()
    .title('JKA/AF Content')
    .items([
      S.documentTypeListItem('news').title('News & Announcements').icon(() => '📰'),
      S.documentTypeListItem('event').title('Major Events').icon(() => '🥋'),
      S.documentTypeListItem('calendarItem').title('Calendar Entries').icon(() => '📅'),
      S.divider(), 
      S.listItem()
        .title('Dojos by State')
        .icon(() => '📍')
        .child(async () => {
          const client = context.getClient({ apiVersion: '2024-01-01' });
          const states = await client.fetch(`array::unique(*[_type == "dojo" && defined(state)].state)`);
          
          return S.list()
            .title('Select a State')
            .items(
              states.sort().map((state: string) => 
                S.listItem()
                  .title(`${state} Dojos`)
                  .child(
                    S.documentList()
                      .title(`Dojos in ${state}`)
                      .filter('_type == "dojo" && state == $state')
                      .params({ state })
                      .apiVersion('2024-01-01') 
                  )
              )
            );
        }),
      S.documentTypeListItem('dojo').title('All Dojos (Master List)').icon(() => '📋'),
    ]);
};

const config = defineConfig({
  basePath: '/admin', 
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  title: 'JKA/AF CMS',
  plugins: [structureTool({ structure: customStructure })],
  schema: {
    types: [eventSchema, dojoSchema, calendarSchema, newsSchema], 
  },
});

export default function AdminPage() {
  return <NextStudio config={config} />;
}