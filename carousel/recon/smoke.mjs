import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
await p.goto('https://example.com', { timeout: 30000 });
console.log('OK title=', await p.title());
console.log('UA=', await p.evaluate(() => navigator.userAgent));
await b.close();
