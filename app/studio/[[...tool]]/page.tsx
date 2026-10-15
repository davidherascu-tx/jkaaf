'use client';

import { NextStudio } from 'next-sanity/studio';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

const eventSchema = {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'published',
      title: 'Published',
      type: 'boolean',
      description: 'On = visible on the website. Off = draft (hidden from the website, calendar and home page).',
      options: { layout: 'switch' },
      initialValue: false,
    },
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
  preview: {
    select: { title: 'title', category: 'category', startDate: 'startDate', published: 'published' },
    prepare: ({ title, category, startDate, published }: any) => ({
      title,
      subtitle: [published === false ? '📝 DRAFT' : '✅ Published', category, startDate].filter(Boolean).join(' · '),
    }),
  },
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
    },
    {
      name: 'shortInfo',
      title: 'Short Info',
      type: 'text',
      rows: 2,
      description: 'A short note shown with this entry on the calendar (max 200 characters).',
      validation: (Rule: any) => Rule.max(200)
    },
    {
      name: 'schedule',
      title: 'Time Schedule',
      type: 'array',
      description: 'Add one or more times. Use the Add item button for more.',
      of: [
        {
          type: 'object',
          name: 'timeSlot',
          title: 'Time',
          fields: [
            { name: 'label', title: 'Label (optional)', type: 'string', description: 'e.g., Registration, Kata, Kumite' },
            {
              name: 'startTime',
              title: 'Start Time',
              type: 'string',
              description: 'e.g., 9:00 AM',
              validation: (Rule: any) => Rule.required().regex(/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)?$/, { name: 'time' }).error('Use a time like 9:00 AM or 14:30')
            },
            {
              name: 'endTime',
              title: 'End Time (optional)',
              type: 'string',
              description: 'e.g., 11:30 AM',
              validation: (Rule: any) => Rule.regex(/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)?$/, { name: 'time' }).error('Use a time like 11:30 AM or 16:00')
            }
          ],
          preview: {
            select: { label: 'label', start: 'startTime', end: 'endTime' },
            prepare: ({ label, start, end }: any) => ({ title: [start, end].filter(Boolean).join(' – '), subtitle: label })
          }
        }
      ]
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
  basePath: '/studio', 
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  title: 'Studio',
  plugins: [structureTool({ structure: customStructure })],
  schema: {
    types: [eventSchema, dojoSchema, calendarSchema, newsSchema], 
  },
});

export default function StudioPage() {
  return <NextStudio config={config} />;
}