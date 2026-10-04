// Reproduce the long, word-by-word clinical columns reported in the screenshots.
const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 let checks=0;
 for(const width of [320,390,768,900,980,1280,2048]){
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON)});
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await context.route('**/*',async route=>{
   const u=new URL(route.request().url());if(u.hostname!=='127.0.0.1')return route.abort();
   const f=path.resolve(__dirname,'..')+u.pathname;
   const contentType={html:'text/html',css:'text/css',js:'application/javascript',png:'image/png',jpg:'image/jpeg'}[f.split('.').pop()];
   await route.fulfill({status:fs.existsSync(f)?200:404,contentType,body:fs.existsSync(f)?fs.readFileSync(f):'Missing'});
  });
  for(const file of ['guidebook.html','fit-nutrition.html','fit-workout.html','gear-shop.html']){
   const page=await context.newPage();await page.goto('http://127.0.0.1/'+file,{waitUntil:'networkidle'});
   const result=await page.evaluate(()=>{
    const notes=[...document.querySelectorAll('.clinical-card')].map(e=>{
     const dl=e.querySelector('dl'),r=e.getBoundingClientRect(),d=dl.querySelector('dd').getBoundingClientRect();
     return {width:r.width,readingWidth:d.width,stacked:getComputedStyle(dl).display==='block',overflow:e.scrollWidth>e.clientWidth+1};
    });
    const g=document.querySelector('#vectors>.v2-grid');
    return {notes,overflow:document.documentElement.scrollWidth>innerWidth+1,
     vectors:g?[...g.children].map(e=>({width:e.getBoundingClientRect().width,parentWidth:g.getBoundingClientRect().width})):[]};
   });
   assert(!result.overflow,file+' viewport overflow at '+width);
   for(const n of result.notes){assert(!n.overflow,file+' clinical overflow');assert(n.readingWidth>=Math.min(240,n.width-36),file+' compressed reading column at '+width+': '+JSON.stringify(n));if(n.width<480)assert(n.stacked,file+' narrow notes must stack');}
   if(file==='guidebook.html'){
    assert.equal(result.vectors.length,7);
    for(const v of result.vectors)assert(Math.abs(v.width-v.parentWidth)<1,'Vector record must use its full row');
    if([390,1280].includes(width)){await page.locator('#vector-v3').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/project100-v2-qa/clinical-guidebook-'+width+'.png'});}
    const summary=page.locator('#vector-v3 .clinical-card summary');await summary.click();assert.equal(await page.locator('#vector-v3 .clinical-card').getAttribute('open'),null);await summary.click();assert.notEqual(await page.locator('#vector-v3 .clinical-card').getAttribute('open'),null);
   }
   checks++;await page.close();
  }
  await browser.close();
 }
 console.log('PASS:',checks,'clinical reading layouts, full-width vector rows and disclosure interactions');
})();
