const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),folder=path.join(root,'downloads/kinetics');
vm.runInThisContext(fs.readFileSync(path.join(root,'assets/js/workout-guides.js'),'utf8'));
const db=JSON.parse(fs.readFileSync(path.join(folder,'training-plan-v0.3.json'),'utf8')),meta=JSON.parse(fs.readFileSync(path.join(folder,'image-metadata.json'),'utf8')),bank={};
for(const[id,m]of Object.entries(meta))bank[id]={width:m.width,height:m.height,bytes:fs.readFileSync(path.join(root,m.path)).toString('latin1')};
const jobs=[['focused','focused-days'],['fullbody','full-body'],['weekly','weekly-planner'],['book','complete-guide'],['catalogue','source-catalogue'],['focused-short','focused-short'],['fullbody-short','full-body-short'],['weekly-overview','weekly-overview'],['guides','exercise-guides'],...db.exercises.map(e=>['guide','guide-'+e.id,e.id])],report=[],layouts=[];
for(const[kind,name,id]of jobs){const pages=Project100PDF.makePages(db,kind,1,id||null,{},true);if(pages.some(p=>p.lowest<35))throw Error('PDF boundary: '+name);if(['focused','fullbody','weekly','book','focused-short','fullbody-short','guides'].includes(kind)&&pages.some(p=>p.cardIds?.length&&p.cardIds.length!==3))throw Error('Three-card layout: '+name);fs.writeFileSync(path.join(folder,'pdf',name+'.pdf'),Project100PDF.buildPdf(pages,bank));report.push({filename:name+'.pdf',pages:pages.length,lowest:Math.min(...pages.map(p=>p.lowest))});layouts.push({name,kind,guideId:id||null,pages:pages.map(p=>({title:p.title,cards:p.cardData||[]}))});}
fs.writeFileSync(path.join(folder,'pdf-build-report.json'),JSON.stringify(report,null,2));console.log('Built '+report.length+' illustrated PDF downloads.');

for(const name of fs.readdirSync(path.join(folder,'pdf'))){if(!/level-[123]\.pdf$/.test(name)&&name!=='protocols.pdf')continue;const source=name.startsWith('booklet')?'complete-guide.pdf':name.startsWith('focused')?'focused-days.pdf':name.startsWith('full-body')?'full-body.pdf':name.startsWith('planner')?'weekly-planner.pdf':'exercise-guides.pdf';fs.copyFileSync(path.join(folder,'pdf',source),path.join(folder,'pdf',name));}

fs.writeFileSync(path.join(folder,'guide-page-layout.json'),JSON.stringify(layouts,null,2));
