const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]'),headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],external=[];
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'){external.push(u.href);return r.abort()}const f=root+decodeURIComponent(u.pathname),types={html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',jpg:'image/jpeg',svg:'image/svg+xml',png:'image/png',mp4:'video/mp4',woff2:'font/woff2'};return r.fulfill({status:fs.existsSync(f)?200:404,contentType:types[path.extname(f).slice(1)]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):'Missing'});});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));const go=f=>p.goto('http://127.0.0.1:8765/'+f,{waitUntil:'networkidle'});
 await go('index.html');await p.evaluate(()=>document.fonts.ready);assert.deepEqual(external,[],'Automatic external request on landing load');assert(await p.evaluate(()=>document.fonts.check('700 16px Inter')));

 for(const width of [320,390,768,1280,2048]){
 await p.setViewportSize({width,height:900});
 for(const file of ['index.html','fit-nutrition.html','gear-shop.html','fit-protocol.html','guidebook.html']){
 await go(file);await p.locator('.focused-cabinet').first().scrollIntoViewIfNeeded();
 for(const img of await p.locator('.focused-cabinet img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode())}
 assert(await p.locator('.focused-cabinet:not(.vector-cabinet) > a').evaluateAll(ns=>ns.every(n=>{const i=n.querySelector('img');return !i||(i.complete&&i.naturalWidth>0)})),file+' previews');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),file+' overflow');
 const shell=await p.locator('.page-shell').boundingBox();
 for(const selector of ['.fc-trigger','.site-switch-float']){const b=await p.locator(selector).boundingBox();assert(b.x>=shell.x&&b.x+b.width<=shell.x+shell.width+1,file+' edge '+width)}

 }
 }
 await go('fit-protocol-labs.html');assert.equal(await p.locator('.page-identity-image').count(),0,'No unrelated lab image');
 await go('fit-protocol-supplements.html');assert.equal(await p.locator('.page-identity-image').getAttribute('src'),'assets/media/october-2026/pill-organizer-february-2026.jpg');
 assert.equal(await p.locator('.page-identity-image').evaluate(n=>getComputedStyle(n).position),'absolute','Art consumes no layout space');
 assert.deepEqual(errors,[]);console.log('PASS: loaded category previews and enclosed fixed controls on five directories at five viewport sizes.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
