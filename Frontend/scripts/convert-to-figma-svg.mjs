/**
 * Clean & Accurate Web-to-SVG Exporter for Figma (1440x900 Fixed Canvas Version)
 * 
 * Reverted to the clean 1440x900 layout preferred by user:
 * 1. Fixed 1440x900 viewport so Sidebar & Content align 100% in Figma.
 * 2. Solid color fallbacks for headers (clean look).
 * 3. Painter's Algorithm Z-index sorting (modals properly cover background content).
 * 4. Canvas getImageData pixel RGBA color normalization.
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PAGES = [
  { route: '/login', output: '01_Auth/Login Page.svg' },
  { route: '/admin/dashboard', output: '02_Admin/Admin_Dashboard.svg' },
  { route: '/admin/users', output: '02_Admin/Admin_User Management.svg' },
  { route: '/admin/assignments', output: '02_Admin/Admin_Daftar Tugas.svg' },
  { route: '/admin/reports', output: '02_Admin/Admin_Laporan.svg' },
  { route: '/admin/courses', output: '02_Admin/Admin_Monitoring Kelas.svg' },
  { route: '/admin/settings', output: '02_Admin/Admin_Settings.svg' },
  { route: '/guru/dashboard', output: '03_Guru/Guru_Dashboard.svg' },
  { route: '/guru/courses', output: '03_Guru/Guru_Courses.svg' },
  { route: '/guru/materi', output: '03_Guru/Guru_Materi.svg' },
  { route: '/guru/tugas', output: '03_Guru/Guru_Tugas.svg' },
  { route: '/guru/absensi', output: '03_Guru/Guru_Absensi.svg' },
  { route: '/guru/profile', output: '03_Guru/Guru_Profile.svg' },
  { route: '/guru/reports', output: '03_Guru/Guru_Reports.svg' },
  { route: '/siswa/dashboard', output: '04_Siswa/Siswa_Dashboard.svg' },
  { route: '/siswa/courses', output: '04_Siswa/Siswa_Courses.svg' },
  { route: '/siswa/materi', output: '04_Siswa/Siswa_Materi.svg' },
  { route: '/siswa/tugas', output: '04_Siswa/Siswa_Tugas.svg' },
  { route: '/siswa/absensi', output: '04_Siswa/Siswa_Absensi.svg' },
  { route: '/siswa/profile', output: '04_Siswa/Siswa_Profile.svg' },
  { route: '/siswa/reports', output: '04_Siswa/Siswa_Reports.svg' },
];

const MODALS = [
  { route: '/admin/users', buttonText: 'Tambah User', output: '05_Modals_and_Popups/Admin_Add User.svg' },
  { route: '/admin/users', buttonText: 'Edit', output: '05_Modals_and_Popups/Admin_Edit User.svg' },
  { route: '/admin/users', buttonText: 'Sandi', output: '05_Modals_and_Popups/Admin_Reset Password.svg' },
  { route: '/admin/users', buttonText: 'Import', output: '05_Modals_and_Popups/Admin_Import Users.svg' },
  { route: '/guru/courses', buttonText: 'Buat Kelas', output: '05_Modals_and_Popups/Guru_Tambah Kelas Baru.svg' },
  { route: '/guru/materi', buttonText: 'Unggah', output: '05_Modals_and_Popups/Guru_Unggah Materi.svg' },
  { route: '/guru/tugas', buttonText: 'Buat Tugas', output: '05_Modals_and_Popups/Guru_Buat Tugas.svg' },
  { route: '/siswa/tugas', buttonText: 'Kerjakan', output: '05_Modals_and_Popups/Siswa_Submit Tugas.svg' },
];

const VIEWPORT = { width: 1440, height: 900 };
const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(ROOT, 'svg figma-clean');

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function extractPageVisuals(page) {
  return page.evaluate((viewportWidth, viewportHeight) => {
    // Remove dev elements
    const devOverlayTags = document.querySelectorAll('next-route-announcer, [data-nextjs-toast], #__next-build-watcher, [data-next-badge]');
    devOverlayTags.forEach(el => el.remove());

    const elements = [];

    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function normalizeColor(colorStr) {
      if (!colorStr || colorStr === 'transparent' || colorStr === 'rgba(0, 0, 0, 0)') return null;
      try {
        ctx.clearRect(0, 0, 1, 1);
        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        if (a === 0) return null;
        if (a < 255) return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(2)})`;
        return `rgb(${r}, ${g}, ${b})`;
      } catch (e) {
        return null;
      }
    }

    function isElementVisible(el, style) {
      if (!style) style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (rect.right < 0 || rect.bottom < 0 || rect.left > viewportWidth || rect.top > viewportHeight) return false;
      return true;
    }

    function getStackOrder(el) {
      let node = el;
      let order = 0;
      let depth = 0;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        const zIndex = parseInt(style.zIndex);
        if (!isNaN(zIndex)) order += zIndex * 1000;
        const pos = style.position;
        if (pos === 'fixed' || pos === 'absolute') order += 500;
        depth++;
        node = node.parentElement;
      }
      return order + depth;
    }

    function processNode(el) {
      const tagName = el.tagName ? el.tagName.toLowerCase() : '';

      if (['script', 'style', 'noscript', 'head', 'meta', 'link'].includes(tagName)) return;

      const style = window.getComputedStyle(el);
      if (!isElementVisible(el, style)) return;

      const rect = el.getBoundingClientRect();
      const stackOrder = getStackOrder(el);

      if (tagName === 'svg') {
        const parentStyle = window.getComputedStyle(el.parentElement || el);
        const strokeCol = normalizeColor(style.stroke) || normalizeColor(parentStyle.color) || 'rgb(37, 99, 235)';

        const clone = el.cloneNode(true);
        clone.setAttribute('x', Math.round(rect.left * 10) / 10);
        clone.setAttribute('y', Math.round(rect.top * 10) / 10);
        clone.setAttribute('width', Math.round(rect.width * 10) / 10);
        clone.setAttribute('height', Math.round(rect.height * 10) / 10);

        const paths = clone.querySelectorAll('path, circle, line, polyline, rect, polygon');
        paths.forEach((p) => {
          const pStroke = p.getAttribute('stroke');
          const pFill = p.getAttribute('fill');
          if (!pStroke || pStroke === 'currentColor') {
            p.setAttribute('stroke', strokeCol);
          } else {
            const normPStroke = normalizeColor(pStroke);
            if (normPStroke) p.setAttribute('stroke', normPStroke);
          }
          if (!pFill || pFill === 'none') {
            p.setAttribute('fill', 'none');
          } else if (pFill === 'currentColor') {
            p.setAttribute('fill', strokeCol);
          } else {
            const normPFill = normalizeColor(pFill);
            if (normPFill) p.setAttribute('fill', normPFill);
          }
        });

        let svgHtml = clone.outerHTML;
        svgHtml = svgHtml.replace(/currentColor/g, strokeCol);

        elements.push({
          type: 'icon',
          stackOrder,
          html: svgHtml
        });
        return;
      }

      const bgColor = normalizeColor(style.backgroundColor);
      const borderColor = normalizeColor(style.borderColor);
      const borderWidth = parseFloat(style.borderWidth) || 0;
      const hasBorder = borderWidth > 0 && borderColor !== null;
      const boxShadow = style.boxShadow;
      const hasBoxShadow = boxShadow && boxShadow !== 'none';
      const bgImage = style.backgroundImage;
      const hasGradient = bgImage && bgImage !== 'none' && bgImage.includes('gradient') && !bgImage.includes('px');
      const borderRadius = parseFloat(style.borderRadius) || 0;

      let finalFill = bgColor;
      if (!finalFill && hasGradient) {
        finalFill = 'rgb(15, 23, 46)'; // Clean dark navy header fallback
      }

      if (finalFill || hasBorder || hasBoxShadow) {
        elements.push({
          type: 'rect',
          stackOrder,
          x: Math.round(rect.left * 10) / 10,
          y: Math.round(rect.top * 10) / 10,
          w: Math.round(rect.width * 10) / 10,
          h: Math.round(rect.height * 10) / 10,
          bg: finalFill,
          borderColor: hasBorder ? borderColor : null,
          borderWidth: hasBorder ? borderWidth : 0,
          borderRadius,
          opacity: parseFloat(style.opacity) || 1,
        });
      }

      for (const childNode of el.childNodes) {
        if (childNode.nodeType === Node.TEXT_NODE) {
          const content = childNode.textContent.replace(/\s+/g, ' ').trim();
          if (!content) continue;

          const range = document.createRange();
          range.selectNodeContents(childNode);
          const rects = range.getClientRects();
          if (rects.length === 0) continue;

          const fontSize = parseFloat(style.fontSize) || 14;
          const fontWeight = style.fontWeight || '400';
          const color = normalizeColor(style.color) || 'rgb(15, 23, 42)';
          const fontFamily = style.fontFamily || 'Inter, sans-serif';
          const textTransform = style.textTransform;

          let formattedText = content;
          if (textTransform === 'uppercase') formattedText = formattedText.toUpperCase();
          else if (textTransform === 'lowercase') formattedText = formattedText.toLowerCase();

          if (rects.length === 1) {
            const r = rects[0];
            elements.push({
              type: 'text',
              stackOrder: stackOrder + 1,
              text: formattedText,
              x: Math.round(r.left * 10) / 10,
              y: Math.round(r.top * 10) / 10,
              w: Math.round(r.width * 10) / 10,
              h: Math.round(r.height * 10) / 10,
              fontSize,
              fontWeight,
              color,
              fontFamily,
            });
          } else {
            const lines = [];
            let currentLine = null;

            for (let i = 0; i < rects.length; i++) {
              const r = rects[i];
              if (!currentLine || Math.abs(r.top - currentLine.top) > 5) {
                currentLine = { top: r.top, left: r.left, width: r.width, height: r.height };
                lines.push(currentLine);
              } else {
                currentLine.width = (r.left + r.width) - currentLine.left;
              }
            }

            const words = formattedText.split(' ');
            let wordIdx = 0;
            const totalWords = words.length;

            lines.forEach((line) => {
              const wordsForLine = Math.ceil(totalWords / lines.length);
              const lineWords = words.slice(wordIdx, wordIdx + wordsForLine).join(' ');
              wordIdx += wordsForLine;

              if (lineWords) {
                elements.push({
                  type: 'text',
                  stackOrder: stackOrder + 1,
                  text: lineWords,
                  x: Math.round(line.left * 10) / 10,
                  y: Math.round(line.top * 10) / 10,
                  w: Math.round(line.width * 10) / 10,
                  h: Math.round(line.height * 10) / 10,
                  fontSize,
                  fontWeight,
                  color,
                  fontFamily,
                });
              }
            });
          }
        }
      }

      for (const childEl of el.children) {
        processNode(childEl);
      }
    }

    processNode(document.body);

    elements.sort((a, b) => a.stackOrder - b.stackOrder);

    return elements;
  }, VIEWPORT.width, VIEWPORT.height);
}

function buildSvg(elements, title) {
  const svgOutput = [];

  elements.forEach((el) => {
    if (el.type === 'rect') {
      const rx = el.borderRadius ? ` rx="${Math.min(el.borderRadius, el.w / 2, el.h / 2)}"` : '';
      const fill = el.bg || 'none';

      let stroke = '';
      if (el.borderColor && el.borderWidth) {
        stroke = ` stroke="${escapeXml(el.borderColor)}" stroke-width="${el.borderWidth}"`;
      }

      const opacity = el.opacity < 1 ? ` opacity="${el.opacity}"` : '';

      svgOutput.push(
        `  <rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${escapeXml(fill)}"${rx}${stroke}${opacity}/>`
      );
    } else if (el.type === 'text') {
      const baselineY = Math.round((el.y + el.fontSize * 0.8) * 10) / 10;
      const fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      svgOutput.push(
        `  <text x="${el.x}" y="${baselineY}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" fill="${escapeXml(el.color)}" font-family="${escapeXml(fontFamily)}">${escapeXml(el.text)}</text>`
      );
    } else if (el.type === 'icon') {
      svgOutput.push(`  ${el.html}`);
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     width="${VIEWPORT.width}" height="${VIEWPORT.height}" 
     viewBox="0 0 ${VIEWPORT.width} ${VIEWPORT.height}">
  <title>${escapeXml(title)}</title>
  
  <!-- Canvas Background -->
  <rect width="${VIEWPORT.width}" height="${VIEWPORT.height}" fill="#F8FAFC"/>

  <!-- Page & Modal Elements in Strict Painter's Order -->
${svgOutput.join('\n')}
</svg>`;
}

async function main() {
  console.log('🚀 Reverting to Clean 1440x900 Fixed Canvas SVG Exporter...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
    defaultViewport: VIEWPORT,
  });

  // 1. Process Main Pages
  for (const pageInfo of PAGES) {
    const url = `${BASE_URL}${pageInfo.route}`;
    const outputPath = path.join(OUTPUT_DIR, pageInfo.output);
    const pageName = path.basename(pageInfo.output, '.svg');

    console.log(`📄 Processing Page: ${pageInfo.route} → ${pageInfo.output}`);

    try {
      const page = await browser.newPage();
      await page.setViewport(VIEWPORT);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1000));

      const elements = await extractPageVisuals(page);
      const svg = buildSvg(elements, pageName);

      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, svg, 'utf-8');

      console.log(`   ✅ Saved Clean 1440x900 SVG: ${outputPath}`);
      await page.close();
    } catch (err) {
      console.error(`   ❌ Error on ${pageInfo.route}:`, err.message);
    }
  }

  // 2. Process Modals & Popups
  for (const modalInfo of MODALS) {
    const url = `${BASE_URL}${modalInfo.route}`;
    const outputPath = path.join(OUTPUT_DIR, modalInfo.output);
    const modalName = path.basename(modalInfo.output, '.svg');

    console.log(`💬 Processing Modal: ${modalInfo.route} ("${modalInfo.buttonText}") → ${modalInfo.output}`);

    try {
      const page = await browser.newPage();
      await page.setViewport(VIEWPORT);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 800));

      const clicked = await page.evaluate((btnText) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.textContent.includes(btnText));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      }, modalInfo.buttonText);

      if (clicked) {
        await new Promise(r => setTimeout(r, 1000));

        const elements = await extractPageVisuals(page);
        const svg = buildSvg(elements, modalName);

        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
        fs.writeFileSync(outputPath, svg, 'utf-8');

        console.log(`   ✅ Saved Clean Modal SVG: ${outputPath}`);
      }

      await page.close();
    } catch (err) {
      console.error(`   ❌ Error on modal ${modalInfo.output}:`, err.message);
    }
  }

  await browser.close();
  console.log('\n✨ All Clean 1440x900 SVGs generated successfully!');
}

main();
