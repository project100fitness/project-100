/* Build the downloadable PDFs from the same source used in the browser. */
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
vm.runInThisContext(fs.readFileSync("assets/js/workout-guides.js","utf8"));
const api=globalThis.Project100PDF,db=JSON.parse(fs.readFileSync("downloads/kinetics/training-plan-v0.3.json","utf8"));
const jpegPath=process.argv[2],jpeg=jpegPath?{width:1774,height:887,bytes:fs.readFileSync(jpegPath).toString("latin1")}:null;
const out="downloads/kinetics/pdf";fs.mkdirSync(out,{recursive:true});
const manifest=[];
function save(name,pages,fields){if(pages.some(p=>p.lowest<35))throw Error("Page overflow: "+name);const bytes=api.buildPdf(pages,jpeg);fs.writeFileSync(path.join(out,name),bytes);manifest.push({name,pages:pages.length,fields,lowestTextBaseline:Math.min(...pages.map(p=>p.lowest))});}
const guides=api.makePages(db,"guides",1,null,{},!!jpeg);
for(const level of db.levels){const p=api.makePages(db,"planner",level.level,null,{},false);save("planner-level-"+level.level+".pdf",p,25);save("booklet-level-"+level.level+".pdf",p.concat(guides),25);}
save("exercise-guides.pdf",guides,0);
for(const e of db.exercises)save("guide-"+e.id+".pdf",api.makePages(db,"guide",1,e.id,{},!!jpeg),0);
fs.writeFileSync(path.join(out,"build-manifest.json"),JSON.stringify({version:db.version,files:manifest},null,2)+"\n");
console.log(JSON.stringify(manifest,null,2));
