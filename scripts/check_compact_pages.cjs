const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox']});
const c=await b.newContext({reducedMotion:'reduce'});await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();const f=root+u.pathname;const ext=path.extname(f);return r.fulfill({status:fs.existsSync(f)?200:404,contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[ext]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):''})});
const p=await c.newPage();for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:844});await p.goto('http://127.0.0.1/fit-nutrition.html',{waitUntil:'networkidle'});
assert.equal(await p.locator('.folder-page-rail').count(),0);assert.equal(await p.locator('#nutrition-files').count(),0);assert.equal(await p.locator('#reels').count(),1);assert.equal(await p.locator('#clinical-nutrition').count(),1);
assert(await p.locator('.compact-footer').evaluate(e=>e.getBoundingClientRect().height)<230);assert(await p.locator('.publication-bar').evaluate(e=>e.getBoundingClientRect().height)<70);
assert.deepEqual(await p.locator('.site-head>.page-tabs a').evaluateAll(as=>as.map(a=>a.getAttribute('href'))),['index.html','fit-workout.html','liquid-intake.html','fit-nutrition.html','gear-shop.html']);
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));if(width===390){await p.screenshot({path:'/workspace/scratch/47a88ace7b41/nutrition-compact-mobile.png'});await p.locator('.publication-bar').scrollIntoViewIfNeeded();await p.screenshot({path:'/workspace/scratch/47a88ace7b41/footer-compact-mobile.png'})}}
await b.close();console.log('PASS: one-page Nutrition, ordered tabs, compact footer and no overflow at four widths.');})().catch(e=>{console.error(e);process.exit(1)});
