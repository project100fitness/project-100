const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),{chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]'),headless:true});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[],external=[];
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1'){external.push(u.href);return r.abort()}const f=root+decodeURIComponent(u.pathname),types={html:'text/html',js:'application/javascript',css:'text/css',json:'application/json',jpg:'image/jpeg',svg:'image/svg+xml',png:'image/png',mp4:'video/mp4',woff2:'font/woff2'};return r.fulfill({status:fs.existsSync(f)?200:404,contentType:types[path.extname(f).slice(1)]||'application/octet-stream',body:fs.existsSync(f)?fs.readFileSync(f):'Missing'});});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));const go=f=>p.goto('http://127.0.0.1:8765/'+f,{waitUntil:'networkidle'});
 await go('index.html');await p.evaluate(()=>document.fonts.ready);assert.deepEqual(external,[],'Automatic external request on landing load');assert(await p.evaluate(()=>document.fonts.check('700 16px Inter')));

 for(const width of [320,390,1280,2048]){
 await p.setViewportSize({width,height:900});
 for(const file of ['index.html','fit-protocol.html','guidebook.html','library.html']){
 await go(file);assert.equal(await p.locator('.page-tabs a[href="library.html"],.focused-cabinet a[href="library.html"],#siteDrawer a[href="library.html"]').count(),0);
 const bar=p.locator('.publication-bar');assert.equal(await bar.count(),1);assert.equal(await bar.getAttribute('href'),'library.html');await bar.scrollIntoViewIfNeeded();
 const b=await bar.boundingBox(),shell=await p.locator('.page-shell').boundingBox();assert(Math.abs(b.width-shell.width)<3);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));

 }
 }
 await p.locator('.publication-bar').click();assert(p.url().endsWith('library.html'));assert.deepEqual(errors,[]);console.log('PASS: footer download bar, cleared content menus, responsive widths and download destination.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
