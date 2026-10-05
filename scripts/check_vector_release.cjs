const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]'),headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:900},reducedMotion:'reduce'}),errors=[];
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();const f=root+decodeURIComponent(u.pathname),types={html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',jpg:'image/jpeg',svg:'image/svg+xml',png:'image/png',mp4:'video/mp4',woff2:'font/woff2'};return r.fulfill({status:fs.existsSync(f)?200:404,contentType:types[path.extname(f).slice(1)]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):'Missing'});});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));const go=f=>p.goto('http://127.0.0.1:8765/'+f,{waitUntil:'networkidle'});
 for(const width of [320,390,768,1280]){
  await p.setViewportSize({width,height:900});await go('guidebook.html');
  for(const branch of ['training','rest','evening']){
   await p.locator('[data-day="'+branch+'"]').click();
   assert(await p.locator('.clock-card:visible').evaluateAll((ns,branch)=>ns.length>0&&ns.every(n=>n.dataset.branch===branch),branch));
   assert.equal(await p.locator('[data-day][aria-pressed="true"]').count(),1);
  }
  assert.equal(await p.locator('.clock-card:visible a[href*="vector-v1.html"]').count(),0,'Evening branch cannot route to V1');
  assert.equal(await p.locator('.clock-card:visible a[href*="vector-v6"]').count(),2);
  await p.reload({waitUntil:'networkidle'});assert.equal(await p.locator('[data-day="evening"]').getAttribute('aria-pressed'),'true');
  for(const file of ['fit-protocol-vector-v6.html','fit-protocol-supplements.html','fit-protocol-interactions.html','fit-protocol-checklists.html','fit-nutrition-notes.html']){
   await go(file);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),file+' overflow');
   const img=p.locator('.page-identity-image');if(await img.count()){await img.evaluate(i=>i.decode());assert.equal(await img.evaluate(i=>getComputedStyle(i).position),'absolute');}
   if(file==='fit-protocol-vector-v6.html'){
    const formula=p.locator('.folder-formula');assert((await formula.innerText()).includes('V6 PUMP'));
    assert.equal(await formula.locator('.folder-ingredients li').count(),7);
    assert((await formula.innerText()).includes('31 g'));assert((await formula.innerText()).includes('17.73 g'));
    const link=formula.locator('a[download$=".png"]');assert.equal(await link.getAttribute('href'),'assets/downloads/vector-diagrams/project100-v6-ingredients.png');
   }
   if(process.env.VECTOR_QA_DIR&&width===390)await p.screenshot({path:path.join(process.env.VECTOR_QA_DIR,file+'.png')});
  }
 }
 await go('fit-protocol-vector-pump.html?from=bookmark#vector-pump');assert(p.url().includes('fit-protocol-vector-v6.html?from=bookmark#vector-v6'));
 await go('guidebook.html#vector-pump');assert(p.url().includes('fit-protocol-vector-v6.html#vector-v6'));
 assert.deepEqual(errors,[]);console.log('PASS: three exclusive persisted day branches, V6 formula/downloads, legacy bookmarks and faded photos at four widths.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
