const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const diagramsFile = path.join(__dirname, 'DIAGRAMS_DOKUMENTASI.md');
const outDir = path.join(__dirname, 'docs', 'diagrams');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const content = fs.readFileSync(diagramsFile, 'utf8');

const parts = content.split('```mermaid');
const diagrams = [];

for (let i = 1; i < parts.length; i++) {
  const prevText = parts[i - 1];
  const currentPart = parts[i];
  
  const code = currentPart.split('```')[0].trim();
  
  const headerMatches = [...prevText.matchAll(/#{1,4}\s+([^\n#]+)/g)];
  let title = `Diagram ${i}`;
  if (headerMatches.length > 0) {
    title = headerMatches[headerMatches.length - 1][1].trim();
  }
  
  const cleanTitle = title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_').toLowerCase();
  
  diagrams.push({
    title: title,
    slug: cleanTitle || `diagram_${i}`,
    code: code
  });
}

console.log(`Ditemukan ${diagrams.length} diagram di DIAGRAMS_DOKUMENTASI.md`);

function encodeMermaid(code) {
  const json = JSON.stringify({
    code: code,
    mermaid: {
      theme: 'default'
    }
  });
  return Buffer.from(json).toString('base64url');
}

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(dest);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Sedang memproses dan mengunduh gambar diagram resolusi tinggi (SVG)...');

  for (let i = 0; i < diagrams.length; i++) {
    const d = diagrams[i];
    const num = String(i + 1).padStart(2, '0');
    const filenameSvg = `${num}_${d.slug}.svg`;
    const destSvg = path.join(outDir, filenameSvg);

    try {
      const encoded = encodeMermaid(d.code);
      const urlSvg = `https://mermaid.ink/svg/${encoded}`;
      await downloadUrl(urlSvg, destSvg);
      console.log(`✔ [${num}/${diagrams.length}] Sukses render: ${filenameSvg}`);
    } catch (err) {
      console.error(`✖ Gagal render ${d.title}:`, err.message);
    }
  }

  // Create an interactive HTML Viewer for all diagrams
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galeri Diagram Lengkap Terpadu - Sistem E-Learning (EduSchool LMS)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'default' });</script>
  <style>
    @media print {
      .no-print { display: none !important; }
      .page-break { page-break-after: always; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen">
  <!-- Header -->
  <header class="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white shadow-lg sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black tracking-tight flex items-center gap-2">
          📊 Galeri Diagram Terpadu Sistem E-Learning
        </h1>
        <p class="text-blue-100 text-sm mt-0.5">EduSchool LMS · Unified Use Case, Unified ERD, Unified Flowchart & Sequences</p>
      </div>
      <div class="flex items-center gap-3 no-print">
        <button onclick="window.print()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/20 transition-all shadow-sm">
          🖨 Cetak / Simpan PDF
        </button>
      </div>
    </div>
  </header>

  <!-- Navigation / TOC -->
  <nav class="max-w-7xl mx-auto px-6 py-6 no-print">
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Daftar Pintas Diagram Terpadu</h2>
      <div class="flex flex-wrap gap-2">
        ${diagrams.map((d, idx) => `
          <a href="#diagram-${idx + 1}" class="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-all">
            ${idx + 1}. ${d.title.replace(/^[0-9\.]+\s+/, '')}
          </a>
        `).join('')}
      </div>
    </div>
  </nav>

  <!-- Diagrams Content -->
  <main class="max-w-7xl mx-auto px-6 pb-20 space-y-12">
    ${diagrams.map((d, idx) => {
      const num = String(idx + 1).padStart(2, '0');
      const filenameSvg = `${num}_${d.slug}.svg`;
      return `
      <section id="diagram-${idx + 1}" class="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden page-break">
        <div class="bg-slate-100/80 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span class="text-xs font-black px-2.5 py-1 bg-blue-600 text-white rounded-md tracking-wider">DIAGRAM ${num}</span>
            <h2 class="text-xl font-bold text-slate-900 mt-2">${d.title}</h2>
          </div>
          <div class="flex items-center gap-2 no-print">
            <a href="${filenameSvg}" download="${filenameSvg}" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5">
              ⬇ Download SVG Gambar
            </a>
          </div>
        </div>
        <div class="p-8 flex justify-center items-center overflow-x-auto bg-white min-h-[300px]">
          <div class="mermaid w-full max-w-full flex justify-center">
${d.code}
          </div>
        </div>
      </section>
      `;
    }).join('')}
  </main>

  <footer class="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
    <p>Dokumentasi Visual Diagram Terpadu Sistem E-Learning EduSchool LMS · Dibuat secara otomatis</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync(path.join(outDir, 'index.html'), htmlContent, 'utf8');
  console.log(`\n🎉 Semua gambar SVG & Galeri HTML siap di folder: docs/diagrams/`);
  console.log(`Buka file "docs/diagrams/index.html" di browser untuk melihat semua diagram secara interaktif!`);
}

main();
