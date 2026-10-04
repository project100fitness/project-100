const assert=require('assert');const fs=require('fs');const path=require('path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 for(const reducedMotion of ['reduce','no-preference']){
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON)});
  const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion});
  await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='127.0.0.1')return route.abort();const f=path.resolve(__dirname,'..')+u.pathname;const type={html:'text/html',css:'text/css',js:'application/javascript',jpg:'image/jpeg',mp4:'video/mp4'}[f.split('.').pop()];await route.fulfill({status:fs.existsSync(f)?200:404,contentType:type,body:fs.existsSync(f)?fs.readFileSync(f):'Missing'})});
  const page=await context.newPage();await page.goto('http://127.0.0.1/fit-nutrition.html',{waitUntil:'networkidle'});
  const video=page.locator('#top video');const control=page.locator('#top .motion-control');
  if(reducedMotion==='reduce'){
   assert.equal(await video.getAttribute('src'),null);assert.equal(await control.isVisible(),true);
   assert.equal(await control.textContent(),'Play background');
   await control.click();
   await page.waitForFunction(()=>{const v=document.querySelector('#top video');return v.readyState>=2&&!v.paused});
   assert.equal(await video.evaluate(v=>getComputedStyle(v).visibility),'visible');
   await control.click();assert.equal(await video.evaluate(v=>v.paused),true);
  }else{
   await page.waitForFunction(()=>document.querySelector('#top video').getAttribute('src'));
   await page.waitForFunction(()=>{const v=document.querySelector('#top video');return v.readyState>=2&&!v.paused});
   assert.equal(await video.evaluate(v=>v.muted),true);
   await control.click();assert.equal(await control.getAttribute('aria-pressed'),'true');assert.equal(await video.evaluate(v=>v.paused),true);
   await control.click();assert.equal(await control.getAttribute('aria-pressed'),'false');
   await page.locator('#vectors').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#top video').paused);
   await page.locator('#top').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!document.querySelector('#top video').paused);
   await page.locator('#vectors').scrollIntoViewIfNeeded();
   await page.screenshot({path:process.env.QA_OUTPUT_DIR||'/tmp/project100-v2-qa'+'/background-vectors-desktop.png'});
  }
  await browser.close();
 }
 console.log('PASS: reduced-motion/no-download default, explicit motion opt-in, silence, pause/play and offscreen pause/resume');
})();
