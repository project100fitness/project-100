const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
(async()=>{
 const root=path.resolve(__dirname,'..'), art=JSON.parse(fs.readFileSync(root+'/assets/data/vector-artwork.json'));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:JSON.parse(process.env.CHROMIUM_ARGS_JSON)});
 for(const width of [320,390,768,1280]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',r=>{const u=new URL(r.request().url()),f=root+decodeURIComponent(u.pathname);if(u.hostname!=='127.0.0.1'||!fs.existsSync(f))return r.abort();return r.fulfill({body:fs.readFileSync(f),contentType:({html:'text/html',css:'text/css',js:'application/javascript',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg'})[f.split('.').pop()]||'application/octet-stream'});});
  const page=await context.newPage();
  for(const name of ['liquid-intake.html','fit-protocol-vectors.html',...Object.keys(art).map(k=>`fit-protocol-vector-${k}.html`)]){
   await page.goto('http://127.0.0.1/'+name,{waitUntil:'networkidle'});
   const main=name==='liquid-intake.html',kind=main?'portraits':'ingredients';
   const folders=page.locator(main?'.simple-liquid-file':'.vector-stack-file');
   assert.equal(await folders.count(),name.includes('-vector-v')?1:7);
   for(let i=0;i<await folders.count();i++){
    const folder=folders.nth(i),key=(await folder.getAttribute('data-vector'))||(await folder.getAttribute('id')).replace('vector-','');
    if(!await folder.evaluate(e=>e.open)) await folder.locator(':scope > summary').click();
    const image=folder.locator(main?'.portrait-vector-card img':'.folder-diagram img');
    await image.scrollIntoViewIfNeeded();
    await image.evaluate(i=>i.decode());
    assert.equal(await image.getAttribute('src'),art[key][kind].src);
    const dims=await image.evaluate(i=>({w:i.width,h:i.height,nw:i.naturalWidth,nh:i.naturalHeight}));
    assert.equal(dims.nw,941);assert.equal(dims.nh,1672);
    assert(Math.abs(dims.w/dims.h-dims.nw/dims.nh)<.01,'Artwork stretched');
    if(main){const download=folder.locator('a[download]');assert.equal(await download.getAttribute('href'),art[key].ingredients.src);}
    assert.equal(new URL(page.url()).pathname,'/'+name,'Opening folder navigated away');
   }
   assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),name+' overflow');
   if((width===390||width===1280)&&['liquid-intake.html','fit-protocol-vector-v1.html'].includes(name)){
    await page.goto('http://127.0.0.1/'+name+'#vector-v1',{waitUntil:'networkidle'});
    await page.locator('#vector-v1').scrollIntoViewIfNeeded();
    await page.screenshot({path:`/tmp/vector-artwork-${main?'main':'fit'}-${width}.png`});
   }
  }
  await context.close();
 }
 await browser.close();console.log('PASS: all seven MAIN portrait / FIT white mappings, loaded native images, persona-free downloads, in-place folders and no overflow across four widths.');
})().catch(e=>{console.error(e);process.exit(1)});
