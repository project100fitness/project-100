/* Canonical PDFs: exercises appear once; old download paths remain compatible. */
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
vm.runInThisContext(fs.readFileSync("assets/js/workout-guides.js","utf8"));
const api=globalThis.Project100PDF,db=JSON.parse(fs.readFileSync("downloads/kinetics/training-plan-v0.3.json","utf8")),jpeg={};
const meta=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));
for(const [id,image] of Object.entries(meta))jpeg[id]={width:image.width,height:image.height,bytes:fs.readFileSync(image.path).toString("latin1")};
const out="downloads/kinetics/pdf";fs.mkdirSync(out,{recursive:true});const manifest=[];
function save(name,kind,id){const pages=api.makePages(db,kind,1,id||null,{},true);if(pages.some(p=>p.lowest<35))throw Error("Page overflow: "+name);fs.writeFileSync(path.join(out,name),api.buildPdf(pages,jpeg));manifest.push({name,pages:pages.length,fields:pages.reduce((s,p)=>s+p.fields.length,0),lowestTextBaseline:Math.min(...pages.map(p=>p.lowest))});}
save("protocols.pdf","protocol");save("weekly-planner.pdf","weekly");save("focused-days.pdf","focused");save("full-body.pdf","fullbody");save("exercise-guides.pdf","guides");save("complete-guide.pdf","book");
for(const e of db.exercises)save("guide-"+e.id+".pdf","guide",e.id);
for(let n=1;n<=3;n++){for(const [old,target] of [["focused-days-level-","focused-days.pdf"],["full-body-level-","full-body.pdf"],["planner-level-","complete-guide.pdf"],["booklet-level-","complete-guide.pdf"]])fs.copyFileSync(path.join(out,target),path.join(out,old+n+".pdf"));}
fs.writeFileSync(path.join(out,"build-manifest.json"),JSON.stringify({version:db.version,edition:"unified-protocol",files:manifest},null,2)+"\n");
console.log(JSON.stringify(manifest,null,2));
