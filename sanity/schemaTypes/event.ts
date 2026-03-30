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
      name: 'startDate', // Changed from 'date' to 'startDate'
      title: 'Start Date',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'endDate', // Added for range support
      title: 'End Date',
      type: 'datetime',
    },
    {
      name: 'location',
      title: 'Location (e.g., Shotokan Karate, USA)',
      type: 'string',
    },
    {
      name: 'category', // Added so it shows the badge on the main page
      title: 'Category',
      type: 'string',
    },
    {
      name: 'link',
      title: 'Registration Link',
      type: 'url',
    },
  ],
};