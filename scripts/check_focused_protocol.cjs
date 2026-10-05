const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(root+'/assets/js/protocol-files.json','utf8'));
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]'),headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();const f=root+decodeURIComponent(u.pathname),types={html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',jpg:'image/jpeg',svg:'image/svg+xml',png:'image/png',mp4:'video/mp4'};return r.fulfill({status:fs.existsSync(f)?200:404,contentType:types[path.extname(f).slice(1)]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):'Missing'});});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 const go=f=>page.goto('http://127.0.0.1:8765/'+f,{waitUntil:'networkidle'});
 for(let i=0;i<manifest.files.length;i++){
  const {file}=manifest.files[i];await go(file);
  assert.equal(await page.locator('.site-switch-float').getAttribute('href'),'index.html',file);
  assert.equal(await page.locator('.site-destinations,.encyclopedia-float').count(),0,file);
  assert.equal(await page.locator('.page-nav-arrow.prev').getAttribute('href'),manifest.files[(i+manifest.files.length-1)%manifest.files.length].file);
  assert.equal(await page.locator('.page-nav-arrow.next').getAttribute('href'),manifest.files[(i+1)%manifest.files.length].file);
  assert.equal(await page.locator('.site-head>.page-tabs').first().locator('a').count(),10,file);
 }
 await go('index.html');await page.locator('.site-switch-float').click();assert(page.url().endsWith('fit-protocol.html'));
 await page.locator('.site-switch-float').click();assert(page.url().endsWith('index.html'));
 await go('fit-protocol-fuel.html#s-vectors');assert(page.url().endsWith('fit-protocol-vectors.html'));
 await go('fit-protocol-archive.html#ch5');assert(page.url().endsWith('fit-protocol-nutrition.html#ch5'));
 await go('guidebook.html#vector-v4');assert(page.url().endsWith('fit-protocol-vector-v4.html#vector-v4'));
 assert.equal(await page.locator('.vector-stack-file[open]').count(),1);
 assert.equal(await page.locator('.folder-downloads a[download]').count(),2);
 assert.equal(await page.locator('.folder-sheet img[src*="vector-v4.jpg"]').count(),0);
 for(const a of await page.locator('.folder-downloads a').all())assert(fs.existsSync(root+'/'+await a.getAttribute('href')));
 await go('guidebook.html');await page.locator('[data-day=rest]').click();assert.equal(await page.locator('.clock-card[data-branch=training]:visible').count(),0);
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('[data-day=rest]').getAttribute('aria-pressed'),'true');
 await go('fit-protocol-checklists.html#guide-page-11');assert(await page.locator('#guide-page-11').evaluate(e=>e.open));
 assert.deepEqual(errors,[]);console.log('PASS: 27 focused files, both site switches, circular arrows, migrated bookmarks, day selection and descriptive downloads.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
