import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'news',
  title: 'News & Announcements',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Article Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug (URL)', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'publishedAt', title: 'Publish Date', type: 'datetime', initialValue: () => new Date().toISOString() }),
    defineField({ name: 'mainImage', title: 'Cover Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'excerpt', title: 'Short Excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'body', title: 'Article Body', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'pdfDocument', title: 'PDF Attachment', type: 'file', options: { accept: 'application/pdf' } }),
  ],
})