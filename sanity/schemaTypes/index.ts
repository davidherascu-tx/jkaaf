import event from './event'
import news from './news'
import dojo from './dojo' // <-- 1. Import the Dojo schema!

const calendarItem = {
  name: 'calendarItem',
  title: 'Calendar Entries',
  type: 'document',
  fields: [
    { name: 'title', title: 'Entry Title', type: 'string' },
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
        ]
      }
    },
    { name: 'startDate', title: 'Start Date', type: 'date', validation: (Rule: any) => Rule.required() },
    { name: 'endDate', title: 'End Date', type: 'date', description: 'Optional for multi-day events' }
  ]
}

// 2. Add 'dojo' to the export array so Sanity knows it exists!
export const schemaTypes = [event, calendarItem, news, dojo]