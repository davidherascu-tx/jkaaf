import event from './event'

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

export const schemaTypes = [event, calendarItem]