const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  const page = await browser.newPage();
  const url = 'file://' + path.resolve(__dirname, 'intro.html');
  console.log('→ rendering intro.html');
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.emulateMediaType('print');

  await page.pdf({
    path: path.resolve(__dirname, 'MaxImpact_company_intro.pdf'),
    width: '1600px',
    height: '900px',
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  console.log('  ✓ saved: MaxImpact_company_intro.pdf');

  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
