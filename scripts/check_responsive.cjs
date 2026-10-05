const fs=require('fs');const path=require('path');const repoRoot=path.resolve(__dirname,'..');const qaRoot=process.env.QA_OUTPUT_DIR||'/tmp/project100-v2-qa';fs.mkdirSync(qaRoot,{recursive:true});const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
(async()=>{
 const browserArgs=JSON.parse(process.env.CHROMIUM_ARGS_JSON||'["--no-sandbox"]');

 const defaultPages=['index.html','fit-workout.html','fit-nutrition.html','gear-shop.html',...JSON.parse(fs.readFileSync(path.join(repoRoot,'assets/js/protocol-files.json'),'utf8')).files.map(x=>x.file)];
 const pages=process.env.TEST_PAGES?process.env.TEST_PAGES.split(','):defaultPages;
 const results=[];fs.mkdirSync(qaRoot,{recursive:true});
 for(const width of (process.env.TEST_WIDTHS?process.env.TEST_WIDTHS.split(',').map(Number):[320,390,768,1280])) {
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:browserArgs,headless:true});
 const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
 // Keep tests deterministic when third-party fonts/social embeds are unreachable.
 await context.route('**/*',async route=>{const u=new URL(route.request().url());if(u.hostname!=='127.0.0.1')return route.abort();const f=repoRoot+decodeURIComponent(u.pathname);const ext=f.split('.').pop();const types={html:'text/html',css:'text/css',js:'application/javascript',svg:'image/svg+xml',jpg:'image/jpeg',png:'image/png',mp4:'video/mp4'};if(!fs.existsSync(f))return route.fulfill({status:404,body:'Missing'});return route.fulfill({status:200,contentType:types[ext]||'application/octet-stream',body:fs.readFileSync(f)});});
 for(const file of pages){
  console.log('Checking',width,file);const p=await context.newPage();p.setDefaultTimeout(4000);const errors=[],missing=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().includes('127.0.0.1'))missing.push(r.url())});
  await p.goto('http://127.0.0.1:8765/'+file,{waitUntil:'networkidle'});
  const geometry=await p.evaluate(()=>{let sel=['#nav .brand','#themeToggle','#siteMenuTab,#sideMenuTab,#navToggle'];let boxes=sel.map(s=>{let e=document.querySelector(s);if(!e)return null;let r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}});let overlaps=[];for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){let a=boxes[i],b=boxes[j];if(a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y)overlaps.push([i,j])}return {overflow:document.documentElement.scrollWidth>innerWidth+1,boxes,overlaps,hidden: [...document.querySelectorAll('.slide,.fx-reveal')].filter(e=>getComputedStyle(e).opacity==='0').length,brokenImgs:[...document.images].filter(i=>i.getAttribute('src')&& !/^https?:/.test(i.getAttribute('src')) && i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src'))}});
  if(width===390&&['index.html','fit-nutrition.html','fit-protocol-archive.html','guidebook.html','library.html','fit-protocol-fuel.html'].includes(file))await p.screenshot({path:qaRoot+'/'+file.replace('.html','')+'-mobile.png'});
  if(width===1280 && file==='fit-protocol-archive.html')await p.screenshot({path:qaRoot+'/encyclopedia-desktop.png'});
  // Exercise menu and theme buttons; check every scroll section remains visible.
  const menu=p.locator('#nav #siteMenuTab,#nav #sideMenuTab,#nav #navToggle').first();if(await menu.count() && await menu.isVisible()) {await menu.click(); let open=await p.locator('.site-drawer.open,.drawer.open').count(); if(!open)errors.push('Menu did not open'); const close=p.locator('#siteDrawerClose,#drawerClose');if(await close.count())await close.click();else await menu.click();}
  const toggle=p.locator('#themeToggle');if(await toggle.count()){let before=await p.locator('html').getAttribute('data-theme');if(!await toggle.isVisible()){errors.push('Theme button hidden');}else await toggle.click();let after=await p.locator('html').getAttribute('data-theme');if(after===before)errors.push('Theme did not change');}
  await p.evaluate(()=>{const d=document.querySelector('#deck');if(d)d.scrollTop=d.scrollHeight;else window.scrollTo(0,document.body.scrollHeight)});
  const r={width,file,...geometry,errors,missing};results.push(r);if(r.overflow||r.overlaps.length||r.hidden||r.brokenImgs.length||errors.length||missing.length)console.log(JSON.stringify(r));await p.close();
 }
 await browser.close();
 }
 fs.writeFileSync(qaRoot+'/'+(process.env.TEST_PAGES?'targeted-results.json':'layout-results.json'),JSON.stringify(results,null,2));const failures=results.filter(r=>r.overflow||r.overlaps.length||r.hidden||r.brokenImgs.length||r.errors.length||r.missing.length);console.log('Checked',results.length,'page/viewport combinations;',failures.length,'failures');if(failures.length)throw new Error('Responsive checks failed');
})();
