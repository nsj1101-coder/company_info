const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  const url = 'file://' + path.resolve(__dirname, '견적서.html');
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.emulateMediaType('print');
  await page.pdf({
    path: path.resolve(__dirname, '마을숙소예약_견적서.pdf'),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await browser.close();
  console.log('✓ saved: 마을숙소예약_견적서.pdf');
})().catch(e => { console.error(e); process.exit(1); });
