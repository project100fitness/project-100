const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..');
async function route(context){await context.route('**/*',async r=>{
 const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();
 const f=root+u.pathname;const contentType={html:'text/html',css:'text/css',js:'application/javascript',jpg:'image/jpeg',png:'image/png',mp4:'video/mp4'}[f.split('.').pop()];
 await r.fulfill({status:fs.existsSync(f)?200:404,contentType,body:fs.existsSync(f)?fs.readFileSync(f):'Missing'});
});}
async function browser(){return chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON)});}
(async()=>{
 let checks=0;const played=new Set();
 for(const width of [320,390,768,1280]){
  const b=await browser(),c=await b.newContext({viewport:{width,height:900},reducedMotion:'reduce',colorScheme:'dark'});await route(c);
  const p=await c.newPage();await p.goto('http://127.0.0.1/fit-nutrition.html',{waitUntil:'networkidle'});
  const files=p.locator('.vector-stack-file');assert.equal(await files.count(),7);
  for(let i=0;i<7;i++){
   const f=files.nth(i);await f.locator('summary').focus();await p.keyboard.press('Enter');assert.notEqual(await f.getAttribute('open'),null);
   assert.equal(await f.locator('.stack-source').getAttribute('href'),'guidebook.html#vector-'+['v1','v2','v3','v4','v5','v10','pump'][i]);
   await f.locator('.stack-content img').scrollIntoViewIfNeeded();
   const g=await f.evaluate(e=>{const r=e.getBoundingClientRect(),parent=e.parentElement.getBoundingClientRect();return {width:r.width,parentWidth:parent.width,overflow:document.documentElement.scrollWidth>innerWidth+1}});
   assert(!g.overflow);assert(g.width>=g.parentWidth-82);
   await f.locator('summary').focus();await p.keyboard.press('Enter');assert.equal(await f.getAttribute('open'),null);checks++;
  }
  await files.nth(6).locator('summary').click();await files.nth(6).locator('.stack-step.next').click();assert.notEqual(await files.nth(0).getAttribute('open'),null);assert.equal(await files.nth(6).getAttribute('open'),null);
  await files.nth(0).locator('summary').focus();await p.keyboard.press('ArrowLeft');assert.notEqual(await files.nth(6).getAttribute('open'),null);await files.nth(6).locator('summary').click();checks++;
  if(width===1280){await p.addStyleTag({content:'.site-head{visibility:hidden!important}'});await p.locator('.vector-studio').screenshot({path:'/tmp/project100-v2-qa/vector-stack-desktop.png'});await files.nth(3).locator('summary').click();await files.nth(3).screenshot({path:'/tmp/project100-v2-qa/vector-stack-open.png'});}
  if(width===390)await p.locator('.vector-studio').screenshot({path:'/tmp/project100-v2-qa/vector-stack-mobile.png'});
  await b.close();
 }
 for(const file of ['index.html','fit-workout.html','fit-nutrition.html','gear-shop.html','fit-protocol.html','fit-protocol-baseline.html','fit-protocol-fuel.html','fit-protocol-training.html','fit-protocol-troubleshooting.html','guidebook.html','library.html']){
  const b=await browser(),c=await b.newContext({viewport:{width:1280,height:900},reducedMotion:'no-preference'});await route(c);
  const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1/'+file,{waitUntil:'networkidle'});
  const videos=p.locator('video[data-background-src]');assert(await videos.count()>0);
  for(let i=0;i<await videos.count();i++){
   const v=videos.nth(i),src=await v.getAttribute('data-background-src');if(played.has(src))continue;
   console.log('Verify playback',file,src);
   await v.locator('..').locator('..').scrollIntoViewIfNeeded();
   try{await p.waitForFunction(src=>{const v=[...document.querySelectorAll('video')].find(e=>e.dataset.backgroundSrc===src);return v.readyState>=2&&!v.paused},src)}
   catch(error){console.log(await v.evaluate(e=>({src:e.src,ready:e.readyState,paused:e.paused,error:e.error?.message,box:e.getBoundingClientRect().toJSON(),control:e.closest('.has-section-motion').querySelector('button').outerHTML})));throw error;}
   const before=await v.evaluate(e=>e.currentTime);await p.waitForFunction(({src,before})=>[...document.querySelectorAll('video')].find(e=>e.dataset.backgroundSrc===src).currentTime!==before,{src,before});
   assert.equal(await v.evaluate(e=>e.muted),true);assert.equal(await v.evaluate(e=>getComputedStyle(e).opacity),'1');assert.equal(await v.evaluate(e=>getComputedStyle(e.parentElement).zIndex),'0');
   played.add(src);checks++;
  }
  assert.deepEqual(errors,[]);await b.close();
 }
 const uploaded=[...played].filter(s=>s.startsWith('assets/media/october-2026/'));assert.equal(uploaded.length,14);
 const b=await browser(),c=await b.newContext({viewport:{width:390,height:900},reducedMotion:'no-preference'});
 await c.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,addEventListener(){}}}));await route(c);
 const p=await c.newPage();await p.goto('http://127.0.0.1/guidebook.html',{waitUntil:'networkidle'});assert.equal(await p.locator('#top video').getAttribute('src'),null);assert.equal(await p.locator('#top .motion-control').textContent(),'Play background');
 await p.locator('#top .motion-control').click();await p.waitForFunction(()=>{const v=document.querySelector('#top video');return v.readyState>=2&&!v.paused});checks++;await b.close();
 console.log('PASS:',checks,'folding files, source links, actual moving backgrounds and Save-Data opt-in;',uploaded.length,'unique uploaded clips play');
})();
