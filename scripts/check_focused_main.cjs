const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(root+'/assets/js/main-files.json','utf8'));
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]'),headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();const f=root+decodeURIComponent(u.pathname),types={html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',jpg:'image/jpeg',svg:'image/svg+xml',png:'image/png',mp4:'video/mp4'};return r.fulfill({status:fs.existsSync(f)?200:404,contentType:types[path.extname(f).slice(1)]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):'Missing'});});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));const go=f=>p.goto('http://127.0.0.1:8765/'+f,{waitUntil:'networkidle'});
 const heights={};
 for(let i=0;i<manifest.files.length;i++){
  const {file}=manifest.files[i];await go(file);heights[file]=await p.evaluate(()=>document.documentElement.scrollHeight);
  assert.equal(await p.locator('.site-switch-float').getAttribute('href'),'fit-protocol.html',file);
  assert.equal(await p.locator('.site-head>.page-tabs').first().locator('a').count(),5,file);
  const primary=['index.html','fit-workout.html','fit-nutrition.html','liquid-intake.html','gear-shop.html'];
  const current=await p.locator('.site-head>.page-tabs a.current').first().getAttribute('href'),pi=primary.indexOf(current);assert(pi>=0);
  assert.equal(await p.locator('.page-nav-arrow.prev').getAttribute('href'),primary[(pi+primary.length-1)%primary.length]);
  assert.equal(await p.locator('.page-nav-arrow.next').getAttribute('href'),primary[(pi+1)%primary.length]);
 }
 await go('index.html#story');assert(p.url().endsWith('project-story.html#story'));
 await go('gear-shop.html#safety');assert(p.url().endsWith('gear-safety.html#safety'));
 await go('fit-nutrition.html#reels');assert(p.url().endsWith('fit-meals.html#reels'));
 await go('project-goals.html#roadmap');assert(await p.locator('#roadmap').evaluate(e=>e.closest('details').open));
 await go('gear-gym.html');const media=p.locator('.carousel-row > :not([data-loop-copy]) .log-media[data-yt]').first();await media.focus();await p.keyboard.press('Enter');assert.equal(await media.locator('iframe').count(),1);
 await go('index.html');await p.locator('.site-switch-float').click();assert(p.url().endsWith('fit-protocol.html'));await p.locator('.site-switch-float').click();assert(p.url().endsWith('index.html'));
 assert(heights['index.html']<6500,JSON.stringify(heights));assert(heights['gear-shop.html']<4500,JSON.stringify(heights));assert(heights['fit-nutrition.html']<4500,JSON.stringify(heights));
 await go('gear-grips.html');await p.locator('.ai-thumb button').first().click();assert.equal(await p.locator('.fx-lightbox.open').count(),1);await p.keyboard.press('Escape');assert.equal(await p.locator('.fx-lightbox.open').count(),0);
 assert.deepEqual(errors,[]);console.log('PASS: 17 main files, circular arrows, migrated bookmarks, keyboard playback, full photo viewer and both site switches.');console.log('390px page heights:',JSON.stringify(heights));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
