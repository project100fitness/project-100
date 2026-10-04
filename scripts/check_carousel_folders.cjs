const fs=require('fs'),assert=require('assert'),path=require('path');const root=path.resolve(__dirname,'..');const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{let checked=0;
for(const width of [320,390,768,1280]){
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON),headless:true});
 const ctx=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();const f=root+u.pathname;const types={html:'text/html',css:'text/css',js:'application/javascript',svg:'image/svg+xml',jpg:'image/jpeg',png:'image/png',mp4:'video/mp4'};return r.fulfill({status:fs.existsSync(f)?200:404,body:fs.existsSync(f)?fs.readFileSync(f):'missing',contentType:types[f.split('.').pop()]||'application/octet-stream'})});
 for(const name of ['index.html','fit-workout.html','fit-nutrition.html','gear-shop.html']){
 const p=await ctx.newPage();let errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8765/'+name,{waitUntil:'networkidle'});
 const loops=await p.evaluate(async()=>{let results=[];for(const row of document.querySelectorAll('[data-loop-ready]')){
  const originals=[...row.children].filter(x=>!x.dataset.loopCopy);if(originals.length<2)continue;
  const wrap=row.parentElement,l=wrap.querySelector(':scope > .left'),r=wrap.querySelector(':scope > .right');
  for(const button of [l,r])for(let i=0;i<originals.length+3;i++){button.click();await new Promise(resolve=>setTimeout(resolve,170));if(row.scrollLeft<1||row.scrollLeft>=row.scrollWidth-row.clientWidth-1)throw Error('Hard boundary');if(button.classList.contains('hidden'))throw Error('Hidden arrow');}
  results.push(originals.length);
 }return results});checked+=loops.length;
 if(name==='fit-nutrition.html'){
  assert.deepEqual(await p.locator('.vector-stack-file').evaluateAll(fs=>fs.map(f=>f.dataset.vector)),['v3','v1','v2','v4','v5','v10','pump']);
  for(let i=0;i<7;i++){
   const f=p.locator('.vector-stack-file').nth(i);await f.locator(':scope > summary').click();await p.waitForTimeout(80);assert.equal(await p.locator('.vector-stack-file[open]').count(),1);
   assert(await f.locator('.folder-ingredients li').count()>=4);assert.notEqual(await f.locator('.stack-preview img').getAttribute('src'),await f.locator('.folder-diagram img').getAttribute('src'));
   assert.equal(await f.locator('a[download]').count(),2);
   const download=p.waitForEvent('download');await f.locator('a[download]').first().click();assert((await download).suggestedFilename().endsWith('.png'));checked++;
  }
  await p.locator('.vector-stack-file').last().locator(':scope > summary').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.vector-stack-file[open]').getAttribute('data-vector'),'v3');
  await p.locator('.vector-stack-file').first().locator(':scope > summary').focus();await p.keyboard.press('ArrowLeft');assert.equal(await p.locator('.vector-stack-file[open]').getAttribute('data-vector'),'pump');
  if(width===390){await p.screenshot({path:'/tmp/vector-folders-mobile.png',fullPage:true});}
 }
 assert.deepEqual(errors,[]);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.close();
 }await browser.close();console.log('Passed',width);
}console.log('Passed',checked,'carousel and folder checks');})();
