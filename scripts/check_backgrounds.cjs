const assert=require('assert'),fs=require('fs'),path=require('path');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const root=path.resolve(__dirname,'..');
async function route(c){await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname!=='127.0.0.1')return r.abort();const f=root+u.pathname;return r.fulfill({status:fs.existsSync(f)?200:404,body:fs.existsSync(f)?fs.readFileSync(f):'missing',contentType:{html:'text/html',css:'text/css',js:'application/javascript',jpg:'image/jpeg',svg:'image/svg+xml',mp4:'video/mp4'}[f.split('.').pop()]||'application/octet-stream'})})}
(async()=>{
 let checks=0;
 for(const reducedMotion of ['reduce','no-preference']){
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON)}),c=await b.newContext({viewport:{width:390,height:844},reducedMotion});
 await c.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true}}));await route(c);
 const p=await c.newPage();await p.goto('http://127.0.0.1/fit-nutrition.html',{waitUntil:'networkidle'});
 assert.equal(await p.locator('.motion-control,.folder-controls').count(),0);
 await p.waitForFunction(()=>{const v=document.querySelector('#top video');return v.readyState>=2&&!v.paused});
 assert(await p.locator('#top video').evaluate(v=>v.muted&&v.loop&&v.autoplay&&v.playsInline&&!v.controls));
 const before=await p.locator('#top video').evaluate(v=>v.currentTime);await p.waitForFunction(t=>document.querySelector('#top video').currentTime!==t,before);
 await p.locator('#vectors').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('#top video').paused);
 await p.locator('#top').scrollIntoViewIfNeeded();await p.waitForFunction(()=>!document.querySelector('#top video').paused);checks+=5;
 await b.close();
 }
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON)}),c=await b.newContext({viewport:{width:1280,height:900}});await route(c);
 const pages=['index.html','fit-workout.html','fit-nutrition.html','gear-shop.html','fit-protocol.html','fit-protocol-baseline.html','fit-protocol-fuel.html','fit-protocol-training.html','fit-protocol-troubleshooting.html','guidebook.html','library.html'];
 for(const theme of ['dark','light']){
 let reference;
 for(const file of pages){
  const p=await c.newPage();await p.goto('http://127.0.0.1/'+file,{waitUntil:'networkidle'});await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  const colors=await p.evaluate(()=>{const css=s=>getComputedStyle(document.querySelector(s));return {red:css('body').getPropertyValue('--red'),tab:css('.page-tab.current').backgroundColor,nav:css('#nav').borderBottomColor,logo:css('#nav .brand b').color,menu:css('.site-menu-tab').backgroundImage}});
  if(!reference)reference=colors;assert.deepEqual(colors,reference,file+' / '+theme);assert.equal(await p.locator('.motion-control').count(),0);checks++;await p.close();
 }
 }
 await b.close();console.log('PASS:',checks,'autoplay, silent looping, offscreen pause/resume and shared-accent checks');
})();
