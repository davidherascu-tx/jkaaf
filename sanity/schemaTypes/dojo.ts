export default {
  name: 'dojo',
  title: 'Dojos',
  type: 'document',
  fields: [
    { name: 'name', title: 'Dojo Name', type: 'string' },
    { name: 'instructor', title: 'Instructor', type: 'string' },
    { name: 'isPrimary', title: 'Primary Dojo', type: 'boolean' },
    { 
      name: 'isCollegiateClub', 
      title: 'Collegiate Club', 
      type: 'boolean', 
      description: 'Check this box if this is a Collegiate Club' 
    },
    { name: 'address', title: 'Dojo Address (Physical Location)', type: 'string' },
    { name: 'contactAddress', title: 'Contact Address (Mailing)', type: 'string' },
    { name: 'city', title: 'City', type: 'string' },
    { name: 'state', title: 'State (Abbreviation, e.g. TX)', type: 'string' },
    { name: 'zip', title: 'Zip Code', type: 'string' },
    { name: 'phone', title: 'Phone', type: 'string' },
    { name: 'email', title: 'Email', type: 'string' },
    { name: 'website', title: 'Website URL', type: 'url' },
  ]
}