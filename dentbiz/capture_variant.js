const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  const url = 'https://variant.com/shared/70175a64-5df7-4f29-b828-31f18a46c12c?t=1779860784430';
  console.log('→ navigating');
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4000));
  console.log('→ taking viewport screenshot');
  await page.screenshot({
    path: path.resolve(__dirname, 'assets/variant_main_viewport.png'),
    fullPage: false,
  });
  console.log('→ taking full-page screenshot');
  await page.screenshot({
    path: path.resolve(__dirname, 'assets/variant_main_full.png'),
    fullPage: true,
  });

  const title = await page.title();
  console.log('title:', title);

  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
