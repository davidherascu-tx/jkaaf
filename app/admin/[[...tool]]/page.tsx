'use client';

import { NextStudio } from 'next-sanity/studio';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

// 1. Existing Event Schema
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

// 2. NEW Lightweight Calendar Schema (For simple dates)
const calendarSchema = {
  name: 'calendarItem',
  title: 'Calendar Entries',
  type: 'document',
  fields: [
    { name: 'title', title: 'Entry Title', type: 'string', description: 'e.g., Dojo Closed, Local Testing' },
    { name: 'date', title: 'Date', type: 'date', options: { dateFormat: 'YYYY-MM-DD' } },
    { 
      name: 'type', 
      title: 'Entry Type', 
      type: 'string',
      options: {
        list: ['Holiday / Closed', 'Local Event', 'Deadline', 'Other'],
        layout: 'radio'
      },
      initialValue: 'Local Event'
    }
  ],
};

// 3. Existing Dojo Schema
const dojoSchema = {
  name: 'dojo',
  title: 'Registered Dojos',
  type: 'document',
  fields: [
    { name: 'isPrimary', title: 'Primary State Dojo', type: 'boolean', initialValue: false },
    { name: 'name', title: 'Dojo Name', type: 'string' },
    { name: 'instructor', title: 'Chief Instructor', type: 'string' },
    { name: 'address', title: 'Street Address', type: 'string' },
    { name: 'city', title: 'City', type: 'string' },
    { name: 'state', title: 'State (Abbreviation)', type: 'string' },
    { name: 'zip', title: 'Zip Code', type: 'string' },
    { name: 'phone', title: 'Phone Number', type: 'string' },
    { name: 'email', title: 'Email Address', type: 'string' },
    { name: 'website', title: 'Website URL', type: 'url' },
  ],
};

// 4. Update the Custom Structure
const customStructure = (S: any, context: any) => {
  return S.list()
    .title('JKA/AF Content')
    .items([
      
      S.documentTypeListItem('event').title('Major Events').icon(() => '🏆'),
      // Add the new Calendar link to the menu!
      S.documentTypeListItem('calendarItem').title('Calendar Entries').icon(() => '📅'),
      
      S.divider(), 

      S.listItem()
        .title('Dojos by State')
        .icon(() => '🗺️')
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
                  )
              )
            );
        }),

      S.documentTypeListItem('dojo').title('All Dojos (Master List)').icon(() => '📋'),
    ]);
};

// 5. Update Config
const config = defineConfig({
  basePath: '/admin', 
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET as string,
  title: 'JKA/AF CMS',
  plugins: [structureTool({ structure: customStructure })],
  schema: {
    // Make sure to add calendarSchema here!
    types: [eventSchema, dojoSchema, calendarSchema], 
  },
});

export default function AdminPage() {
  return <NextStudio config={config} />;
}