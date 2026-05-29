const puppeteer = require('puppeteer');
const path = require('path');

const files = [
  { html: 'proposal.html', pdf: '마을숙소예약_제안서.pdf' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  for (const f of files) {
    const page = await browser.newPage();
    const url = 'file://' + path.resolve(__dirname, f.html);
    console.log('→', f.html);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.emulateMediaType('print');

    await page.pdf({
      path: path.resolve(__dirname, f.pdf),
      width: '1600px',
      height: '900px',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    console.log('  ✓ saved:', f.pdf);
    await page.close();
  }

  await browser.close();
  console.log('\nDone.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
