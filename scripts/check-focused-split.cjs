const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'downloads/kinetics'),db=JSON.parse(fs.readFileSync(path.join(folder,'training-plan-v0.3.json'),'utf8'));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(folder,'kinetics-data.js'),'utf8'),ctx);assert.equal(JSON.stringify(ctx.window.PROJECT100_KINETICS.days),JSON.stringify(db.days));
const expected=[['Chest','Triceps','Core'],['Legs','Shoulders','Core'],['Arms','Back','Core']];
db.days.slice(0,3).forEach((d,i)=>{const counts=new Map();d.slots.forEach(([id,,group])=>counts.set(group,(counts.get(group)||0)+1));assert.equal(d.slots.length,15);assert.equal(new Set(d.slots.map(s=>s[0])).size,15);assert.deepEqual([...counts.keys()],expected[i]);assert.deepEqual([...counts.values()],[6,6,3]);});
assert.equal(db.days.reduce((n,d)=>n+d.slots.length,0),69);assert.equal(db.days[4].slots.length,12);assert.equal(db.days[5].slots.length,12);
const page=fs.readFileSync(path.join(root,'exercises.html'),'utf8');assert(page.indexOf('exercise-selection-bar')>page.indexOf('id="p100-downloads"'));assert.equal((page.match(/data-day="\d"/g)||[]).length,5);assert(page.includes('choice-title">Chest + Triceps')||page.includes('choice-title">Chest + triceps'));
const layouts=JSON.parse(fs.readFileSync(path.join(folder,'guide-page-layout.json'),'utf8'));
for(const name of ['focused-days','focused-short','weekly-planner','complete-guide']){
 const cards=layouts.find(x=>x.name===name).pages.flatMap(p=>p.cards);const html=fs.readFileSync(path.join(folder,name+'.html'),'utf8');const ids=[...html.matchAll(/<article\b[^>]*data-exercise="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(ids,cards.map(c=>c.id),name+' HTML/PDF order');
 for(const day of db.days.slice(0,3)){const pages=layouts.find(x=>x.name===name).pages.filter(p=>p.title==='Day '+day.day+' / '+day.title);assert.deepEqual(pages.flatMap(p=>p.cards).map(c=>c.id),day.slots.map(s=>s[0]),name+' day '+day.day);}
}
console.log('PASS focused split: 6+6+3 on each day, 69 weekly slots, authored controls/order and four HTML/PDF readers synchronized.');
