const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]'),headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],external=[];
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'){external.push(u.href);return r.abort()}const f=root+decodeURIComponent(u.pathname),types={html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',jpg:'image/jpeg',svg:'image/svg+xml',png:'image/png',mp4:'video/mp4',woff2:'font/woff2'};return r.fulfill({status:fs.existsSync(f)?200:404,contentType:types[path.extname(f).slice(1)]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):'Missing'});});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));const go=f=>p.goto('http://127.0.0.1:8765/'+f,{waitUntil:'networkidle'});
 await go('index.html');await p.evaluate(()=>document.fonts.ready);assert.deepEqual(external,[],'Automatic external request on landing load');assert(await p.evaluate(()=>document.fonts.check('700 16px Inter')));
 const pages=['main','protocol'].flatMap(key=>JSON.parse(fs.readFileSync(root+'/assets/js/'+key+'-files.json','utf8')).files.map(x=>x.file));
 for(const file of pages){
  await go(file);assert.equal(await p.locator('#nav .brand').getAttribute('href'),'index.html',file);
  assert.equal(await p.locator('#fcTrigger').count(),1,file);await p.locator('#fcTrigger').click();assert(await p.locator('#fcPanel').isVisible(),file);await p.keyboard.press('Escape');assert(!(await p.locator('#fcPanel').isVisible()),file);
  assert.equal(await p.locator('video').count(),file==='index.html'?1:0,file);
  assert(await p.locator('h1,h2,.stack-label').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).fontFamily.startsWith('Inter'))),file);
  const rows=await p.locator('.page-tabs .wrap').evaluateAll(rows=>rows.map(r=>getComputedStyle(r).scrollbarWidth));assert(rows.every(x=>x==='none'),file);
 }
 await go('gear-grips.html');await p.locator('#nav .brand').click();assert(p.url().endsWith('index.html'));
 await go('project-story.html');assert.equal(await p.locator('.origin-photos figure').count(),6);assert.equal(await p.locator('#story video').count(),0);
 for(const file of ['gear-grips.html','project-story.html','fit-protocol.html']){
  await go(file);await p.screenshot({path:root+'/../polished-qa/'+file.replace('.html','')+'-mobile.png'});
 }
 assert.deepEqual(errors,[]);console.log('PASS: 43 pages with one working @ popover and home logo; hidden menu scrollbars, compact identities, six Origins photos and no automatic third-party landing requests.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
