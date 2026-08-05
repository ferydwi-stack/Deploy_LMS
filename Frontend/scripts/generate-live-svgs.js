const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, 'svg figma');

const pagesToCapture = [
  { url: '/login', name: 'Login Page.svg', category: '01_Auth' },
  { url: '/forgot-password', name: 'Forgot Password Page.svg', category: '01_Auth' },
  { url: '/admin/dashboard', name: 'Admin_Dashboard.svg', category: '02_Admin' },
  { url: '/admin/users', name: 'Admin_User Management.svg', category: '02_Admin' },
  { url: '/admin/courses', name: 'Admin_Courses.svg', category: '02_Admin' },
  { url: '/admin/assignments', name: 'Admin_Assignment.svg', category: '02_Admin' },
  { url: '/admin/reports', name: 'Admin_Reports.svg', category: '02_Admin' },
  { url: '/admin/settings', name: 'Admin_Settings.svg', category: '02_Admin' },
  { url: '/guru/dashboard', name: 'Guru_Dashboard.svg', category: '03_Guru' },
  { url: '/guru/courses', name: 'Guru_Courses.svg', category: '03_Guru' },
  { url: '/guru/materi', name: 'Guru_Materi.svg', category: '03_Guru' },
  { url: '/guru/tugas', name: 'Guru_Tugas.svg', category: '03_Guru' },
  { url: '/guru/absensi', name: 'Guru_Absensi.svg', category: '03_Guru' },
  { url: '/guru/reports', name: 'Guru_Reports.svg', category: '03_Guru' },
  { url: '/guru/profile', name: 'Guru_Profile.svg', category: '03_Guru' },
  { url: '/siswa/dashboard', name: 'Siswa_Dashboard.svg', category: '04_Siswa' },
  { url: '/siswa/courses', name: 'Siswa_Courses.svg', category: '04_Siswa' },
  { url: '/siswa/materi', name: 'Siswa_Materi.svg', category: '04_Siswa' },
  { url: '/siswa/tugas', name: 'Siswa_Tugas.svg', category: '04_Siswa' },
  { url: '/siswa/absensi', name: 'Siswa_Absensi.svg', category: '04_Siswa' },
  { url: '/siswa/reports', name: 'Siswa_Reports.svg', category: '04_Siswa' },
  { url: '/siswa/profile', name: 'Siswa_Profile.svg', category: '04_Siswa' },
];

const modalToCapture = [
  {
    url: '/guru/courses',
    buttonText: 'Tambah Kelas',
    name: 'Guru_Tambah Kelas Baru.svg',
    category: '05_Modals_and_Popups'
  },
  {
    url: '/guru/materi',
    buttonText: 'Unggah Materi',
    name: 'Guru_Unggah Materi.svg',
    category: '05_Modals_and_Popups'
  },
  {
    url: '/guru/tugas',
    buttonText: 'Buat Tugas',
    name: 'Guru_Buat Tugas.svg',
    category: '05_Modals_and_Popups'
  },
  {
    url: '/siswa/tugas',
    buttonText: 'Submit',
    name: 'Siswa_Submit Tugas.svg',
    category: '05_Modals_and_Popups'
  },
  {
    url: '/admin/users',
    buttonText: 'Tambah User',
    name: 'Admin_Add User.svg',
    category: '05_Modals_and_Popups'
  },
  {
    url: '/admin/users',
    buttonText: 'Edit',
    name: 'Admin_Edit User.svg',
    category: '05_Modals_and_Popups'
  }
];

async function capturePageToSvg(page, fullUrl, fileName, category, retryCount = 0) {
  console.log(`[CAPTURING] ${fullUrl} -> ${category}/${fileName}`);
  try {
    await page.goto(fullUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 800)));

    // Inject html-to-image script
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.js'
    });

    const svgDataUrl = await page.evaluate(async () => {
      try {
        return await window.htmlToImage.toSvg(document.body, {
          width: 1440,
          height: 900,
          filter: (node) => {
            if (node.tagName === 'SCRIPT') return false;
            return true;
          }
        });
      } catch (e) {
        return null;
      }
    });

    if (svgDataUrl) {
      let svgContent = decodeURIComponent(svgDataUrl.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
      if (!svgContent.startsWith('<svg')) {
        svgContent = svgDataUrl;
      }
      
      // Save to category subfolder only
      const categoryDirPath = path.join(OUTPUT_DIR, category);
      if (!fs.existsSync(categoryDirPath)) {
        fs.mkdirSync(categoryDirPath, { recursive: true });
      }
      const catFilePath = path.join(categoryDirPath, fileName);
      fs.writeFileSync(catFilePath, svgContent);

      console.log(`[SUCCESS] Saved ${category}/${fileName}`);
    } else if (retryCount < 2) {
      console.log(`[RETRYING] ${fileName}...`);
      await capturePageToSvg(page, fullUrl, fileName, category, retryCount + 1);
    } else {
      console.error(`[FAILED] Could not capture ${fileName}`);
    }
  } catch (err) {
    if (retryCount < 2) {
      console.log(`[RETRYING] ${fileName} due to error: ${err.message}`);
      await capturePageToSvg(page, fullUrl, fileName, category, retryCount + 1);
    } else {
      console.error(`[FAILED] Error capturing ${fileName}:`, err.message);
    }
  }
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const p of pagesToCapture) {
    await capturePageToSvg(page, `${BASE_URL}${p.url}`, p.name, p.category);
  }

  for (const m of modalToCapture) {
    try {
      await page.goto(`${BASE_URL}${m.url}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate((btnText) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const targetBtn = buttons.find(b => b.innerText.includes(btnText));
        if (targetBtn) targetBtn.click();
      }, m.buttonText);
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 800)));

      await capturePageToSvg(page, `${BASE_URL}${m.url}`, m.name, m.category);
    } catch (err) {
      console.error(`Error capturing modal ${m.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('ALL LIVE PAGES & MODALS CAPTURED TO SVG SUCCESSFULLY!');
})();
