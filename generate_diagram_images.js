const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const diagramsFile = path.join(__dirname, 'DIAGRAMS_DOKUMENTASI.md');
const outDir = path.join(__dirname, 'docs', 'diagrams');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Clean old files
const oldFiles = fs.readdirSync(outDir);
oldFiles.forEach(f => {
  if (f.endsWith('.svg') || f.endsWith('.png')) {
    try { fs.unlinkSync(path.join(outDir, f)); } catch (_) {}
  }
});

const content = fs.readFileSync(diagramsFile, 'utf8');

const parts = content.split('```mermaid');
const diagrams = [];

const slugMap = [
  '01_use_case_terpadu',
  '02_erd_database_terpadu',
  '03_flowchart_sistem_terpadu'
];

for (let i = 1; i < parts.length; i++) {
  const prevText = parts[i - 1];
  const currentPart = parts[i];
  
  const code = currentPart.split('```')[0].trim();
  
  const headerMatches = [...prevText.matchAll(/#{1,4}\s+([^\n#]+)/g)];
  let title = `Diagram ${i}`;
  if (headerMatches.length > 0) {
    title = headerMatches[headerMatches.length - 1][1].trim();
  }
  
  const slug = slugMap[i - 1] || `diagram_${i}`;
  
  diagrams.push({
    title: title,
    slug: slug,
    code: code
  });
}

console.log(`Ditemukan ${diagrams.length} master diagram di DIAGRAMS_DOKUMENTASI.md`);

function encodeMermaid(code) {
  const json = JSON.stringify({
    code: code,
    mermaid: {
      theme: 'default'
    }
  });
  const deflated = zlib.deflateSync(Buffer.from(json, 'utf8'));
  return 'pako:' + deflated.toString('base64url');
}

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download (HTTP ${res.statusCode})`));
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
  console.log('Sedang memproses dan mengunduh gambar diagram resolusi tinggi (SVG & PNG)...');

  for (let i = 0; i < diagrams.length; i++) {
    const d = diagrams[i];
    const filenameSvg = `${d.slug}.svg`;
    const filenamePng = `${d.slug}.png`;
    const destSvg = path.join(outDir, filenameSvg);
    const destPng = path.join(outDir, filenamePng);

    const encoded = encodeMermaid(d.code);

    // 1. Download SVG
    try {
      const urlSvg = `https://mermaid.ink/svg/${encoded}`;
      await downloadUrl(urlSvg, destSvg);
      console.log(`✔ [SVG] Sukses render: ${filenameSvg}`);
    } catch (err) {
      console.error(`✖ [SVG] Gagal render ${d.title}:`, err.message);
    }

    // 2. Download PNG
    try {
      const urlPng = `https://mermaid.ink/img/${encoded}`;
      await downloadUrl(urlPng, destPng);
      console.log(`✔ [PNG] Sukses render: ${filenamePng}`);
    } catch (err) {
      console.error(`✖ [PNG] Gagal render ${d.title}:`, err.message);
    }
  }

  // Create an interactive HTML Viewer for the 3 master diagrams
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3 Diagram Master Terpadu - Sistem E-Learning (EduSchool LMS)</title>
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
          📊 3 Diagram Utama Terpadu Sistem E-Learning
        </h1>
        <p class="text-blue-100 text-sm mt-0.5">EduSchool LMS · Unified Use Case · Unified ERD · Unified Flowchart</p>
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
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Pilihan Diagram Utama</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        ${diagrams.map((d, idx) => `
          <a href="#diagram-${idx + 1}" class="p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-800 rounded-xl border border-slate-200 transition-all flex items-center gap-3">
            <span class="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">${idx + 1}</span>
            <span class="font-semibold text-sm leading-snug">${d.title.replace(/^[0-9\.]+\s+/, '')}</span>
          </a>
        `).join('')}
      </div>
    </div>
  </nav>

  <!-- Diagrams Content -->
  <main class="max-w-7xl mx-auto px-6 pb-20 space-y-12">
    ${diagrams.map((d, idx) => {
      const filenameSvg = `${d.slug}.svg`;
      const filenamePng = `${d.slug}.png`;
      return `
      <section id="diagram-${idx + 1}" class="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden page-break">
        <div class="bg-slate-100/80 px-8 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs font-black px-2.5 py-1 bg-blue-600 text-white rounded-md tracking-wider">DIAGRAM UTAMA ${idx + 1}</span>
            <h2 class="text-xl font-bold text-slate-900 mt-2">${d.title}</h2>
          </div>
          <div class="flex items-center gap-2 no-print">
            <a href="${filenameSvg}" download="${filenameSvg}" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5">
              ⬇ Download Vektor (SVG)
            </a>
            <button onclick="downloadAsPng('diagram-${idx + 1}', '${d.slug}.png')" class="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer">
              ⬇ Download Gambar (PNG)
            </button>
          </div>
        </div>
        <div class="p-8 flex justify-center items-center overflow-x-auto bg-white min-h-[350px]">
          <div class="mermaid w-full max-w-full flex justify-center">
${d.code}
          </div>
        </div>
      </section>
      `;
    }).join('')}
  </main>

  <script>
    function downloadAsPng(sectionId, filename) {
      const section = document.getElementById(sectionId);
      const svg = section.querySelector('svg');
      if (!svg) {
        alert('Diagram sedang diproses, silakan coba 1 detik lagi.');
        return;
      }
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      img.onload = function() {
        const scale = 2.5; // High resolution 2.5x
        const rect = svg.getBoundingClientRect();
        canvas.width = Math.max(rect.width || 1200, 1200) * scale;
        canvas.height = Math.max(rect.height || 800, 800) * scale;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const a = document.createElement('a');
        a.download = filename;
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
      img.src = url;
    }
  </script>

  <footer class="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
    <p>Dokumentasi Visual 3 Diagram Master Terpadu EduSchool LMS · Dibuat secara otomatis</p>
  </footer>
</body>
</html>`;

  fs.writeFileSync(path.join(outDir, 'index.html'), htmlContent, 'utf8');
  console.log(`\n🎉 Selesai! Semua file SVG, PNG & Galeri HTML siap di folder: docs/diagrams/`);
}

main();
