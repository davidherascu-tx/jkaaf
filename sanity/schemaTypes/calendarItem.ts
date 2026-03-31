import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'calendarItem',
  title: 'Calendar Entries',
  type: 'document',
  fields: [
    defineField({ 
      name: 'title', 
      title: 'Entry Title', 
      type: 'string' 
    }),
    defineField({ 
      name: 'type', 
      title: 'Entry Type', 
      type: 'string',
      options: {
        list: [
          { title: 'Seminar', value: 'Seminar' },
          { title: 'Championship', value: 'Championship' },
          { title: 'Holiday / closed', value: 'Holiday / closed' },
          { title: 'Local event', value: 'Local event' }
        ]
      }
    }),
    defineField({ 
      name: 'startDate', 
      title: 'Start Date', 
      type: 'date', 
      validation: (Rule) => Rule.required() 
    }),
    defineField({ 
      name: 'endDate', 
      title: 'End Date', 
      type: 'date', 
      description: 'Optional for multi-day events' 
    })
  ]
})