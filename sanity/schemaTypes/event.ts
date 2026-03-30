export default {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Event Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'date',
      title: 'Event Date',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'location',
      title: 'Location (e.g., Shotokan Karate, USA)',
      type: 'string',
    },
    {
      name: 'link',
      title: 'Registration Link',
      type: 'url',
    },
  ],
};