const fs = require('fs'), path = require('path'), assert = require('assert');
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH, args:JSON.parse(process.env.CHROMIUM_ARGS_JSON || '["--no-sandbox"]'), headless:true});
  const context = await browser.newContext({viewport:{width:390,height:844}, reducedMotion:'reduce'});
  await context.route('**/*', route => {
    const url = new URL(route.request().url()), file = root + decodeURIComponent(url.pathname);
    const types = {html:'text/html', css:'text/css', js:'application/javascript', jpg:'image/jpeg', png:'image/png', svg:'image/svg+xml', mp4:'video/mp4'};
    return url.hostname === '127.0.0.1' && fs.existsSync(file)
      ? route.fulfill({body:fs.readFileSync(file), contentType:types[file.split('.').pop()] || 'application/octet-stream'}) : route.abort();
  });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1/fit-workout.html', {waitUntil:'networkidle'});
  assert.equal(await page.locator('[data-loop-copy] [tabindex="0"]').count(), 0, 'Cloned media must stay out of the tab order');
  for(const category of ['arms', 'resistance-bands', 'all']) {
    await page.locator(`[data-filter="${category}"]`).click();
    await page.waitForTimeout(200);
    await page.evaluate(async () => {
      for(const row of document.querySelectorAll('#logGrid .carousel-row')) {
        if(!row.clientWidth) continue;
        const count = row.querySelectorAll(':scope > :not([data-loop-copy])').length;
        if(count < 2) continue;
        if(!row.querySelector('[data-loop-copy]')) throw Error('Filtered row did not rebuild clones');
        for(const direction of ['left','right']) for(let step=0; step<count+2; step++) {
          row.parentElement.querySelector('.' + direction).click();
          await new Promise(resolve => setTimeout(resolve, 170));
          if(row.scrollLeft < 1 || row.scrollLeft >= row.scrollWidth-row.clientWidth-1) throw Error('Filtered carousel reached a hard boundary');
        }
      }
    });
    await page.setViewportSize({width:420,height:844});
    await page.waitForTimeout(100);
    await page.setViewportSize({width:390,height:844});
  }
  await page.goBack({waitUntil:'networkidle'});
  await page.waitForTimeout(200);
  assert.equal(await page.locator('[data-filter="resistance-bands"]').getAttribute('aria-pressed'), 'true');
  const row = page.locator('#logGrid .carousel-row').first();
  await row.focus();
  const before = await row.evaluate(element => element.scrollLeft);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  assert.notEqual(await row.evaluate(element => element.scrollLeft), before, 'Keyboard navigation must work after history restores a filter');
  const media = row.locator(':scope > :not([data-loop-copy]) .log-media[data-yt]').first();
  await media.focus();
  await page.keyboard.press('Enter');
  assert.equal(await media.locator('iframe').count(), 1, 'Original video remains playable');
  await page.reload({waitUntil:'networkidle'});
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const stationary = await row.evaluate(element => element.scrollLeft);
  await page.waitForTimeout(4500);
  assert.equal(await row.evaluate(element => element.scrollLeft), stationary, 'Reduced-motion rows must not automatically scroll');
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('PASS: filter rebuild, two-way wrap, resize, history, keyboard playback, clone focus, reduced motion.');
})();
