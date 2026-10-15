import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib';
import {
  AGREEMENT_CLAUSES,
  AGREEMENT_INTRO,
  CERTIFY_CLAUSES,
  CERTIFY_INTRO,
  DOJO_SECTIONS,
  FINAL_FIELDS,
  isVisible,
  type FormField,
} from '@/lib/dojoForm';
import type { DojoApplication } from '@/lib/shop';

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;
const GAP = 18;
const COL_W = (CONTENT_W - GAP) / 2;
const TOP = PAGE_H - 40;
const BOTTOM = 56;

const RED = rgb(0.83, 0.16, 0.11);
const INK = rgb(0.07, 0.09, 0.15);
const MUTED = rgb(0.42, 0.45, 0.5);
const LINE = rgb(0.88, 0.89, 0.91);
const SOFT = rgb(0.97, 0.97, 0.96);

// The built-in PDF fonts only cover Latin-1, so swap common typographic characters and drop the rest.
const clean = (s: string) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[\r\t]/g, ' ')
    .replace(/[^\n\x20-\x7E\xA0-\xFF]/g, '?');

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];
  for (const para of clean(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= width) {
        line = test;
      } else {
        if (line) lines.push(line);
        let w = word;
        while (font.widthOfTextAtSize(w, size) > width) {
          let n = w.length;
          while (n > 1 && font.widthOfTextAtSize(w.slice(0, n), size) > width) n--;
          lines.push(w.slice(0, n));
          w = w.slice(n);
        }
        line = w;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Builds the Dojo Membership application as a PDF (letter size) and returns the file bytes. */
export async function buildApplicationPdf(app: DojoApplication): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let logo: PDFImage | null = null;
  try {
    logo = await pdf.embedPng(await readFile(path.join(process.cwd(), 'public', 'jkaaf_logo_email.png')));
  } catch {
    logo = null;
  }

  let page!: PDFPage;
  let y = 0;
  const newPage = (first = false) => {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = TOP;
    page.drawRectangle({ x: 0, y: PAGE_H - 8, width: PAGE_W, height: 8, color: RED });
    if (!first) y -= 4;
  };
  const ensure = (h: number) => {
    if (y - h < BOTTOM) newPage();
  };

  const lineH = (size: number) => size * 1.4;

  // ---------- Header ----------
  newPage(true);
  y -= 6;
  const logoSize = 54;
  if (logo) page.drawImage(logo, { x: MARGIN, y: y - logoSize, width: logoSize, height: logoSize * (logo.height / logo.width) });
  const tx = MARGIN + (logo ? logoSize + 14 : 0);
  page.drawText('JKA/AF', { x: tx, y: y - 22, size: 22, font: bold, color: RED });
  page.drawText('Japan Karate Association / American Federation', { x: tx, y: y - 38, size: 9.5, font, color: MUTED });
  const submitted = new Date(app.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
  const rightText = (t: string, size: number, f: PDFFont, yy: number, color = INK) => {
    const s = clean(t);
    page.drawText(s, { x: PAGE_W - MARGIN - f.widthOfTextAtSize(s, size), y: yy, size, font: f, color });
  };
  rightText(`Application #${app.id}`, 12, bold, y - 18);
  rightText(submitted, 9, font, y - 33, MUTED);
  y -= logoSize + 14;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 1, color: LINE });
  y -= 30;
  page.drawText('Dojo Membership Application', { x: MARGIN, y, size: 20, font: bold, color: INK });
  y -= 18;
  const sub = [app.dojo_name, app.chief_instructor && `Chief instructor: ${app.chief_instructor}`, app.applicant_email && `Account: ${app.applicant_email}`].filter(Boolean).join('   |   ');
  for (const l of wrap(sub, font, 9.5, CONTENT_W)) {
    page.drawText(l, { x: MARGIN, y, size: 9.5, font, color: MUTED });
    y -= lineH(9.5);
  }
  y -= 8;

  // ---------- Building blocks ----------
  const heading = (text: string) => {
    ensure(46);
    y -= 14;
    page.drawRectangle({ x: MARGIN, y: y - 8, width: CONTENT_W, height: 24, color: SOFT });
    page.drawRectangle({ x: MARGIN, y: y - 8, width: 4, height: 24, color: RED });
    page.drawText(clean(text).toUpperCase(), { x: MARGIN + 14, y: y, size: 10.5, font: bold, color: INK });
    y -= 22;
  };

  // A label/value cell: returns its height and a function that draws it at (x, top).
  const cell = (f: FormField, v: Record<string, string>, width: number) => {
    const label = wrap(f.label, bold, 7.5, width);
    const value = wrap(v[f.name]?.trim() || '-', font, 10, width);
    const h = label.length * lineH(7.5) + value.length * lineH(10) + 9;
    const draw = (x: number, top: number) => {
      let yy = top;
      for (const l of label) {
        yy -= lineH(7.5);
        page.drawText(l, { x, y: yy, size: 7.5, font: bold, color: MUTED });
      }
      for (const l of value) {
        yy -= lineH(10);
        page.drawText(l, { x, y: yy, size: 10, font, color: INK });
      }
      page.drawLine({ start: { x, y: top - h + 4 }, end: { x: x + width, y: top - h + 4 }, thickness: 0.4, color: LINE });
    };
    return { h, draw };
  };
  const isWide = (f: FormField, v: Record<string, string>) => f.type === 'textarea' || f.label.length > 52 || (v[f.name] ?? '').length > 34;

  const fields = (list: FormField[], v: Record<string, string>) => {
    let pending: FormField | null = null;
    const flush = (second: FormField | null) => {
      const a = cell(pending!, v, COL_W);
      const b = second ? cell(second, v, COL_W) : null;
      const h = Math.max(a.h, b?.h ?? 0);
      ensure(h);
      a.draw(MARGIN, y);
      b?.draw(MARGIN + COL_W + GAP, y);
      y -= h + 3;
      pending = null;
    };
    for (const f of list) {
      if (!isVisible(f, v)) continue;
      if (isWide(f, v)) {
        if (pending) flush(null);
        const c = cell(f, v, CONTENT_W);
        ensure(c.h);
        c.draw(MARGIN, y);
        y -= c.h + 3;
      } else if (pending) {
        flush(f);
      } else {
        pending = f;
      }
    }
    if (pending) flush(null);
  };

  const checkItem = (text: string) => {
    const lines = wrap(text, font, 8.5, CONTENT_W - 22);
    const h = lines.length * lineH(8.5) + 6;
    ensure(h);
    // checked box
    const bx = MARGIN + 2;
    const by = y - 10;
    page.drawRectangle({ x: bx, y: by, width: 9, height: 9, borderColor: RED, borderWidth: 1 });
    page.drawLine({ start: { x: bx + 2, y: by + 4 }, end: { x: bx + 4, y: by + 2 }, thickness: 1.4, color: RED });
    page.drawLine({ start: { x: bx + 4, y: by + 2 }, end: { x: bx + 8, y: by + 8 }, thickness: 1.4, color: RED });
    let yy = y;
    for (const l of lines) {
      yy -= lineH(8.5);
      page.drawText(l, { x: MARGIN + 22, y: yy, size: 8.5, font, color: INK });
    }
    y -= h;
  };
  const intro = (text: string) => {
    for (const l of wrap(text, font, 8.5, CONTENT_W)) {
      ensure(lineH(8.5));
      y -= lineH(8.5);
      page.drawText(l, { x: MARGIN, y, size: 8.5, font, color: MUTED });
    }
    y -= 6;
  };

  // ---------- Content ----------
  for (const s of DOJO_SECTIONS) {
    heading(s.title);
    fields(s.fields, app.data);
  }

  heading('Agreement');
  intro(AGREEMENT_INTRO);
  for (const c of AGREEMENT_CLAUSES) checkItem(c.text);

  heading('Certification');
  intro(CERTIFY_INTRO);
  for (const c of CERTIFY_CLAUSES) checkItem(c.text);

  ensure(280); // keep the whole signature block together on one page
  heading('Signature');
  fields(FINAL_FIELDS.slice(0, 2), app.data);

  // Signature box
  const boxH = 120;
  ensure(boxH + 30);
  y -= 6;
  page.drawText('DOJO CHIEF INSTRUCTOR ESIGNATURE', { x: MARGIN, y: y - 8, size: 7.5, font: bold, color: MUTED });
  y -= 14;
  page.drawRectangle({ x: MARGIN, y: y - boxH, width: CONTENT_W * 0.62, height: boxH, borderColor: LINE, borderWidth: 1, color: rgb(1, 1, 1) });
  const m = /^data:image\/png;base64,(.+)$/.exec(app.signature);
  if (m) {
    try {
      const img = await pdf.embedPng(Buffer.from(m[1], 'base64'));
      const maxW = CONTENT_W * 0.62 - 24;
      const maxH = boxH - 30;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      page.drawImage(img, { x: MARGIN + 12, y: y - 12 - img.height * scale, width: img.width * scale, height: img.height * scale });
    } catch {
      page.drawText('(signature image could not be embedded)', { x: MARGIN + 12, y: y - 40, size: 9, font, color: MUTED });
    }
  } else if (app.signature.startsWith('typed:')) {
    page.drawText(clean(app.signature.slice(6)), { x: MARGIN + 12, y: y - 50, size: 18, font: bold, color: INK });
  }
  page.drawLine({ start: { x: MARGIN + 12, y: y - boxH + 22 }, end: { x: MARGIN + CONTENT_W * 0.62 - 12, y: y - boxH + 22 }, thickness: 0.6, color: MUTED });
  page.drawText(clean(app.data.chief_instructor || app.chief_instructor || ''), { x: MARGIN + 12, y: y - boxH + 9, size: 8.5, font, color: MUTED });
  const dateX = MARGIN + CONTENT_W * 0.62 + 24;
  const dc = cell(FINAL_FIELDS[2], app.data, CONTENT_W * 0.38 - 24);
  dc.draw(dateX, y);
  y -= boxH + 12;

  // ---------- Footer on every page ----------
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: MARGIN, y: 38 }, end: { x: PAGE_W - MARGIN, y: 38 }, thickness: 0.5, color: LINE });
    p.drawText(`JKA/AF - Dojo Membership Application #${app.id}`, { x: MARGIN, y: 24, size: 8, font, color: MUTED });
    const label = `Page ${i + 1} of ${pages.length}`;
    p.drawText(label, { x: PAGE_W - MARGIN - font.widthOfTextAtSize(label, 8), y: 24, size: 8, font, color: MUTED });
  });

  pdf.setTitle(`Dojo Membership Application #${app.id}`);
  pdf.setAuthor('JKA/AF');
  pdf.setSubject(clean(app.dojo_name));
  return pdf.save();
}
