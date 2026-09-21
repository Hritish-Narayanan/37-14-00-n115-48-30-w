import { chromium } from 'playwright';
import { createServer } from 'vite';

async function main() {
  console.log('Starting Vite server...');
  const server = await createServer({
    server: { port: 5199 }
  });
  await server.listen();
  const url = 'http://localhost:5199';
  console.log('Vite server running at', url);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true
  });

  const viewports = [
    { name: 'iPhone_14', width: 390, height: 844 },
    { name: 'iPhone_SE', width: 375, height: 667 },
    { name: 'Android_Pixel', width: 412, height: 915 }
  ];

  for (const vp of viewports) {
    console.log(`\n=== Testing ${vp.name} (${vp.width}x${vp.height}) ===`);
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Dismiss audio cover if present
    const cover = await page.$('#autoplay-cover');
    if (cover) {
      console.log('Clicking autoplay cover to reveal page...');
      await cover.click();
      await page.waitForTimeout(800);
    }

    // Check document scrollWidth vs innerWidth
    const metrics = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const innerWidth = window.innerWidth;

      // Find overflowing elements
      const overflowElements = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.right > innerWidth + 5 || rect.left < -5) {
          overflowElements.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          });
        }
      }

      return { scrollWidth, clientWidth, innerWidth, overflowCount: overflowElements.length, overflowElements: overflowElements.slice(0, 15) };
    });

    console.log('ScrollWidth:', metrics.scrollWidth, 'InnerWidth:', metrics.innerWidth);
    console.log('Horizontal Overflowing Elements:', metrics.overflowCount);
    if (metrics.overflowElements.length) {
      console.log('Top overflowing elements:');
      console.log(JSON.stringify(metrics.overflowElements, null, 2));
    }

    await page.screenshot({ path: `scripts/screenshot_${vp.name}.png`, fullPage: false });
    await page.screenshot({ path: `scripts/screenshot_${vp.name}_full.png`, fullPage: true });
    console.log(`Screenshots saved for ${vp.name}`);
    await page.close();
  }

  await browser.close();
  await server.close();
  console.log('Test complete.');
}

main().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
