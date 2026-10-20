/* PROJECT 100 browser PDF exporter. No external libraries, tracking or server submissions. */
(function(){
"use strict";
var W=595.28,H=841.89,M=38,RIGHT=W-M,INK=[0.09,0.13,0.16],ORANGE=[0.62,0.23,0],RED=[0.66,0.13,0.13],BLUE=[0.12,0.33,0.62],GREEN=[0.13,0.40,0.23];
function ascii(v){return String(v==null?"":v).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[–—−]/g,"-").replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/×/g,"x").replace(/≤/g,"<=").replace(/≥/g,">=").replace(/±/g,"+/-").replace(/·/g," / ").replace(/→/g," > ").replace(/[^\x20-\x7e\n]/g,"");}
function literal(v){return ascii(v).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");}
function num(v){return Number(v).toFixed(2);}
function color(c){return c.map(num).join(" ");}
function wrap(v,width,size){var max=Math.max(12,Math.floor(width/(size*.55))),words=ascii(v).trim().split(/\s+/),out=[],line="";
words.forEach(function(word){while(word.length>max){if(line){out.push(line);line="";}out.push(word.slice(0,max));word=word.slice(max);}if(!word)return;if((line+" "+word).trim().length>max){out.push(line);line=word;}else line=(line+" "+word).trim();});if(line)out.push(line);return out;}
function Page(title){this.title=title;this.commands=[];this.fields=[];this.y=H-M;this.lowest=H-M;}
Page.prototype.text=function(t,x,y,size,c,bold){if(y<33)throw new Error("PDF layout exceeds page: "+this.title);this.lowest=Math.min(this.lowest,y);this.commands.push("BT /"+(bold?"F2":"F1")+" "+num(size)+" Tf "+color(c||INK)+" rg 1 0 0 1 "+num(x)+" "+num(y)+" Tm ("+literal(t)+") Tj ET\n");};
Page.prototype.p=function(t,size,c,bold,gap){size=size||10;var lines=wrap(t,RIGHT-M,size);for(var i=0;i<lines.length;i++){this.text(lines[i],M,this.y,size,c,bold);this.y-=size*1.30;}this.y-=gap==null?6:gap;};
Page.prototype.heading=function(t){this.y-=6;this.p(t,12,ORANGE,true,5);};
Page.prototype.top=function(kicker,title,sub){this.p(kicker.toUpperCase(),9,ORANGE,true,10);this.p(title,23,INK,true,8);if(sub)this.p(sub,10,INK,false,10);};
Page.prototype.rule=function(){this.commands.push("0.75 0.81 0.83 RG 0.6 w "+num(M)+" "+num(this.y)+" m "+num(RIGHT)+" "+num(this.y)+" l S\n");this.y-=12;};
Page.prototype.image=function(width,key,caption,aspect){key=key||"row";width=width||RIGHT-M;var height=width/(aspect||2);if(height>260){width*=260/height;height=260;}this.commands.push("q "+num(width)+" 0 0 "+num(height)+" "+num((W-width)/2)+" "+num(this.y-height)+" cm /Im_"+key+" Do Q\n");this.y-=height+8;var labels=(caption||"START / softly extended arm                    FINISH / controlled row").split(/\s{3,}/),left=(W-width)/2,half=width/2,lines=labels.map(function(t){return wrap(t,half-12,8);}),count=Math.max.apply(null,lines.map(function(a){return a.length;}));for(var col=0;col<lines.length;col++)for(var row=0;row<lines[col].length;row++)this.text(lines[col][row],left+col*half+6,this.y-row*10.4,8,INK,true);this.y-=count*10.4+7;};
Page.prototype.field=function(name,label,value,multiline){this.p(label,8.5,INK,true,2);var height=multiline?34:19;var bottom=this.y-height+3;if(bottom<38)throw new Error("PDF field exceeds page: "+name);this.fields.push({name:name,value:ascii(value||""),rect:[M,bottom,RIGHT,bottom+height],multiline:!!multiline});this.y=bottom-11;};

Page.prototype.box=function(x,top,width,height,fill,edge){this.commands.push(color(fill||[.97,.97,.96])+" rg "+num(x)+" "+num(top-height)+" "+num(width)+" "+num(height)+" re f\n");if(edge)this.commands.push(color(edge)+" rg "+num(x)+" "+num(top-height)+" 3 "+num(height)+" re f\n");};
Page.prototype.column=function(text,x,y,width,size,c,bold){var lines=wrap(text,width,size);for(var i=0;i<lines.length;i++)this.text(lines[i],x,y-i*size*1.3,size,c,bold);return y-lines.length*size*1.3;};

function sets(l,d,kind){if(d.kind==="easy"||kind==="control")return 1;var n=kind==="main"?l.mainSets:l.accessorySets;return d.kind==="moderate"?Math.min(2,n):n;}
/* Dense, shared three-card print layout. Source catalogue remains separate. */
function compactPages(db,kind,level,guideId,values,hasImage){
 values=values||{};var out=[],by={},types={};db.recordedMovementTypes.forEach(function(t){types[t.id]=t;});
 db.exercises.forEach(function(e){by[e.id]=e;});
 db.recordedVariants.forEach(function(v){if(!v.art)return;var t=types[v.movement_type_id],r=v.roleOverrides||{};by[v.id]=Object.assign({},v,{artKey:'variant-'+v.id,main:r.main||t.main,secondary:r.secondary||t.secondary,base:r.base||v.supportCue||t.base});});
 function text(p,t,x,y,width,size,c,bold){return p.column(t,x,y,width,size,c,bold);}
 function role(p,label,t,x,y,width,c){p.text(label,x,y,7.9,c,true);var fs=7.9,lines=wrap(t,width,fs);if(lines.length>4)fs=7.5;return text(p,t,x,y-9,width,fs,INK,false)-2;}
 function card(p,e,caption,number){
  if(!e||!e.art||!hasImage)throw Error('Reviewed anatomy plate missing');
  if(e.isTrainingAdaptation)caption='Training adaptation / '+caption;
  if(e.isEditorialTechnique)caption='Added band technique / '+caption;
  if(e.isKitAdaptation)caption='Pilates-kit variation / '+caption;
  var top=p.y,h=227,x=M+10,lw=180,rx=M+362,rw=RIGHT-rx-10;
  p.box(M,top,RIGHT-M,h,[.985,.98,.965],ORANGE);p.cardIds=p.cardIds||[];p.cardIds.push(e.id);p.cardData=p.cardData||[];p.cardData.push({id:e.id,caption:caption,number:number||null});
  var y=text(p,(number?number+'. ':'')+e.name,x,top-15,RIGHT-M-20,10.4,INK,true);
  y=text(p,caption,x,y-1,RIGHT-M-20,7.5,ORANGE,true)-5;
  var ah=Math.min(113,lw/(e.artAspect||2)),aw=ah*(e.artAspect||2);
  p.commands.push('q '+num(aw)+' 0 0 '+num(ah)+' '+num(x+(lw-aw)/2)+' '+num(y-ah)+' cm /Im_'+(e.artKey||e.id)+' Do Q\n');
  var cy=y-ah-10;var labels=(e.artCaption||'POSITION A                    POSITION B').split(/\s{3,}/);
  var labelBottom=cy;labels.forEach(function(t,k){labelBottom=Math.min(labelBottom,text(p,t,x+k*lw/2,cy,lw/2-4,6.1,INK,true));});if(e.gripLabel)text(p,'GRIP / '+e.gripLabel,x,labelBottom-5,lw,7.2,ORANGE,true);cy=y;
  ['setup','move','return'].forEach(function(k){var s=k.toUpperCase()+' / '+e.cardCues[k];cy=text(p,s,M+202,cy,150,8,INK,false)-8;});
  var ry=y;ry=role(p,'MAIN / RED',e.main,rx,ry,rw,RED);ry=role(p,'SECONDARY / BLUE',e.secondary,rx,ry,rw,BLUE);ry=role(p,'SUPPORT / GREEN',e.base,rx,ry,rw,GREEN);
  var r=e.resistance||{},footer=top-h+12;
  if(Math.min(cy,ry)<footer+12)throw Error('Compact card overflow: '+e.id+' '+Math.min(cy,ry)+' cy '+cy+' ry '+ry+' < '+(footer+12));
  p.commands.push('0.84 0.84 0.81 RG 0.4 w '+num(x)+' '+num(footer+10)+' m '+num(RIGHT-10)+' '+num(footer+10)+' l S\n');
  var strip=r.system==='hpygn-pilates'?'PILATES KIT / MATCHED LEFT AND RIGHT PAIRS':r.mode==='unloaded'?'OPTIONAL PREPARATION / BODYWEIGHT':'RESISTANCE BANDS';p.text(strip,x,footer,7.2,ORANGE,true);p.y=top-h-8;
 }
 function pages(items,kicker,title,sub){
  for(var i=0;i<items.length;i+=3){var p=new Page(title);out.push(p);p.p(kicker,8,ORANGE,true,5);p.p(title,16,INK,true,4);if(sub)p.p(sub,8,INK,false,6);p.y=Math.min(p.y,750);items.slice(i,i+3).forEach(function(item,j){card(p,item.e,item.caption,item.number);});}
 }
 function reps(e){return e.reps&&!/allocation|Variation|matching/.test(e.reps)?e.reps:'8-12 controlled repetitions';}
 function day(n){var d=db.days.find(function(d){return d.day===n;});var items=d.slots.map(function(s,i){var e=by[s[0]],sets=d.kind==='easy'?1:s[1]==='main'?2:1;return {e:e,number:i+1,caption:(s[2]?s[2]+' / ':'')+sets+' planned set'+(sets>1?'s':'')+' / '+reps(e)};});pages(items,'PROJECT 100 / '+(n<4?'MUSCLE FOCUS':'FULL BODY / PILATES'),'Day '+n+' / '+d.title,d.slots.length+' band exercises / '+(n>=5?'matched Pilates pairs / ':'')+(d.kind==='easy'?'one easy set per exercise':'planned sets shown per exercise'));}
 function log(){var p=new Page('Weekly training log');out.push(p);p.p('PROJECT 100 / WEEKLY PLANNER',9,ORANGE,true,8);p.p('Five sessions. '+db.days.reduce(function(total,d){return total+d.slots.length;},0)+' band exercise slots.',20,INK,true,8);p.p('Days 1-3: muscle focus. Days 5-6: matched Pilates kit. Days 4 and 7: recovery.',9,INK,false,8);p.p('Resistance and individual adjustments: agree with your personal trainer.',8,ORANGE,true,12);
 db.days.forEach(function(d){var top=p.y,h=76;p.box(M,top,RIGHT-M,h,d.kind==='rest'?[.94,.94,.92]:[.985,.98,.965]);p.text('DAY '+d.day,M+8,top-17,10,ORANGE,true);text(p,d.title,M+62,top-17,262,10,INK,true);var counts={};d.slots.forEach(function(slot){var group=slot[2]||'Exercises';counts[group]=(counts[group]||0)+1;});var names=Object.keys(counts).map(function(group){return group+': '+counts[group];}).join(' / ');text(p,names||'Rest and recovery',M+62,top-32,262,7.7,INK,false);p.text('DATE / SETS / REPS / RESISTANCE',M+338,top-14,6.7,INK,true);var key='weekly-day-'+d.day+'-notes';p.fields.push({name:key,value:ascii(values[key]||''),rect:[M+338,top-67,RIGHT-8,top-23],multiline:true});p.y=top-h-7;});p.p('Main red / secondary blue / support green. Session sets are planned, not counted from recordings.',7.5,INK,false,2);}
 if(kind==='book')return compactPages(db,'focused',level,null,values,hasImage).concat(compactPages(db,'fullbody',level,null,values,hasImage));
 if(kind==='weekly-overview'){log();return out;}
 if(kind==='weekly'){log();[1,2,3,5,6].forEach(day);return out;}
 if(kind==='focused-short'){[1,2,3].forEach(day);return out;}
 if(kind==='fullbody'||kind==='fullbody-short'){[5,6].forEach(day);return out;}
 if(kind==='selected'){
  var ids=Array.from(new Set((values['selected-exercises']||[]).filter(function(id){return by[id]&&by[id].art&&by[id].trainingPrescriptionEligible!==false;})));
  if(!ids.length)throw Error('Select at least one exercise.');
  function selectedPage(e,index,font,width){
   var p=new Page(e.name);p.p('PROJECT 100 / PERSONAL SELECTION / '+(index+1)+' OF '+ids.length,8,ORANGE,true,6);p.p(values['selection-title']||'My selected exercises',15,INK,true,5);p.p(e.name,16,INK,true,6);
   p.image(width,e.artKey||e.id,e.artCaption||'POSITION A / POSITION B',e.artAspect||2);
   if(e.gripLabel)p.p('GRIP / CONTACT: '+e.gripLabel,font,ORANGE,true,3);
   if(e.grip)p.p(e.grip,font,INK,false,4);
   ['setup','move','return'].forEach(function(k){p.p(k.toUpperCase()+' / '+e.cardCues[k],font,INK,false,5);});
   p.p('MAIN / '+e.main,font,RED,false,4);p.p('SECONDARY / '+e.secondary,font,BLUE,false,4);p.p('SUPPORT / '+e.base,font,GREEN,false,4);
   if(e.isEditorialTechnique)p.p('Added resistance-band technique; not claimed as verified personal footage.',8,INK,false,4);
   if(e.isTrainingAdaptation)p.p(e.adaptationNote,8,INK,false,4);
   p.p('Sets: __________  Repetitions: __________  Band / notes: ____________________',8,INK,false,3);
   p.cardIds=[e.id];return p;
  }
  ids.forEach(function(id,index){var p;try{p=selectedPage(by[id],index,9.4,420);if(p.y<50)p=selectedPage(by[id],index,8.5,330);}catch(error){p=selectedPage(by[id],index,8.5,330);}if(p.y<38)throw Error('Selected technique needs a shorter document title: '+id);out.push(p);});return out;
 }
 if(kind==='guide'){pages([{e:by[guideId],caption:reps(by[guideId])}],'PROJECT 100 / TECHNIQUE SHEET','Exercise technique',null);return out;}
 if(kind==='guides'){pages(db.exercises.filter(function(e){return e.resistance.mode!=='unloaded';}).map(function(e){return {e:by[e.id],caption:e.resistance.mode==='unloaded'?'Optional preparation':e.adaptationOf?'Pilates kit adaptation':'Band technique'};}),'PROJECT 100 / TECHNIQUE LIBRARY','Anatomy and movement',null);return out;}
 if(kind==='focused'){
  [1,2,3].forEach(day);var shown={};[1,2,3].forEach(function(n){db.days.find(function(d){return d.day===n;}).slots.forEach(function(s){shown[by[s[0]].art]=true;});});
  var items=[];[1,2,3].forEach(function(n){db.recordedVariants.filter(function(v){return v.guide_day===n&&v.trainingPrescriptionEligible!==false&&v.art;}).sort(function(a,b){return a.movement_type_id.localeCompare(b.movement_type_id)||a.name.localeCompare(b.name);}).forEach(function(v){if(shown[v.art])return;shown[v.art]=true;items.push({e:by[v.id],caption:'DAY '+n+' / '+types[v.movement_type_id].name+' / substitute a matching movement'});});});
  db.exercises.filter(function(e){return e.resistance.mode==='band'&&e.resistance.system!=='hpygn-pilates'&&!shown[e.art];}).forEach(function(e){shown[e.art]=true;items.push({e:e,caption:'Long-line band technique / substitute a matching movement'});});
  pages(items,'PROJECT 100 / PERSONAL BAND LIBRARY','Exercise variations / grouped by day and movement',null);
  return out;
 }
 throw Error('Unknown compact document: '+kind);
}

function makePages(db,kind,level,guideId,values,hasImage){
if(['selected','book','focused','fullbody','weekly','weekly-overview','focused-short','fullbody-short','guide','guides'].indexOf(kind)>=0)return compactPages(db,kind,level,guideId,values,hasImage);
values=values||{};var pages=[],l=db.levels.filter(function(x){return x.level===level;})[0],eBy={};db.exercises.forEach(function(e){eBy[e.id]=e;});
function add(p){pages.push(p);return p;}
function caution(p){p.p("Stop for pain, new numbness or weakness, dizziness, loss of grip, moving supports or damaged bands. Keep the recoil path clear. Follow manufacturer limits and individual clinical restrictions.",8.5,INK,false,4);}
function addPilatesSetup(){
var p=add(new Page("Pilates / matched-pair resistance"));
p.top("PROJECT 100 / FULL BODY PILATES","Pilates / matched pairs","Separate HPYGN kit / two identical bands on each side");
if(hasImage){var e=eBy["shoulder-band-bar-squat"];p.image(330,e.id,e.artCaption,e.artAspect);}
var top=p.y,cw=(RIGHT-M-16)/3;
[45,55,65].forEach(function(n,i){var x=M+i*(cw+8);p.box(x,top,cw,105,[1,.97,.94],ORANGE);p.text("R"+(i+1)+" / MATCHED PAIR",x+9,top-17,9,ORANGE,true);p.text("LEFT: 2 x "+n+" lb",x+9,top-40,10,INK,true);p.text("RIGHT: 2 x "+n+" lb",x+9,top-59,10,INK,true);p.text((n*2)+" lb nominal per side",x+9,top-84,8,INK,false);});
p.y=top-126;p.p("Four bands total at every level. Same labels and count on the left and right.",11,ORANGE,true,12);
p.p("Label ratings are nominal; tension changes with stretch. The following long-line and bodyweight exercises keep their own equipment labels.",9);
}
function addVariantMenus(dayNumbers){
(db.variantMenus||[]).filter(function(m){return dayNumbers.indexOf(m.day)>=0;}).forEach(function(m){
var p=add(new Page("Personal options / day "+m.day));p.top("PROJECT 100 / PERSONAL TRAINING VARIATIONS","Day "+m.day+" / recorded options",m.title);
p.p("Choose a suitable variation inside the existing movement slot. These options do not add automatic sets or exercises.",10,ORANGE,true,10);p.p(m.note,10);
m.guideIds.forEach(function(id){var e=eBy[id];if(!e)return;p.heading(e.name);p.p("Main: "+e.main,9,RED);p.p("Secondary: "+e.secondary,9,BLUE);p.p("Base: "+e.base,9,GREEN);p.p("Anchor: "+e.anchor+". Resistance: "+e.resistanceDirection,8.5);p.p("Source: "+e.sourceFilename+" / "+e.sourceWindow,8);p.p("Technique: guide-"+id+".html",7.5,ORANGE,false,10);});
});}
function addSourceCatalogue(){
(db.recordedMovementTypes||[]).forEach(function(type){
var p=add(new Page(type.name));p.top("PROJECT 100 / PERSONAL BAND MOVEMENTS",type.name,"Source-linked posture and attachment variants");
p.p("Main: "+type.main,10,RED);p.p("Secondary: "+type.secondary,10,BLUE);p.p("Base / support: trunk and hip stabilization with the source-specific floor, bench, box or sandbag contacts listed below.",10,GREEN);p.p("Plan placement: "+type.focus_slot,9,ORANGE,true);
if(type.representative_guide&&eBy[type.representative_guide]&&hasImage){var e=eBy[type.representative_guide];p.image(300,e.id,e.artCaption,e.artAspect);p.p("Representative technique plate. Variant geometry below is source-specific; this plate is not an exact depiction of every variation.",8);}
p.p(type.role_evidence,8);p.p("Source windows are reviewed movement phases. Multiple phases can occur within one set; exact repetition and set totals are not established by this index.",8);
function paragraph(t,size,c,bold,gap){size=size||9;var height=wrap(t,RIGHT-M,size).length*size*1.3+(gap==null?6:gap);if(p.y-height<48){p=add(new Page(type.name+" / continued"));p.top("PROJECT 100 / RECORDING VARIANTS",type.name+" / continued");}p.p(t,size,c,bold,gap);}
(db.recordedVariants||[]).filter(function(f){return f.movement_type_id===type.id;}).forEach(function(f){
if(p.y<270){p=add(new Page(type.name+" / variants"));p.top("PROJECT 100 / RECORDING VARIANTS",type.name);}
paragraph(f.name,12,ORANGE,true,8);
[["Position",f.positions],["Anchor",f.anchors],["Hands",f.hand_paths],["Resistance direction",f.resistance_directions],["Equipment",f.equipment]].forEach(function(pair){paragraph(pair[0]+": "+pair[1].join(" / "),9);});
f.sources.forEach(function(s){paragraph(s.filename+" / "+s.start+" - "+s.end+" / "+s.phase_id,8,INK,false,3);});p.rule();
});
});}
/* One anatomical card structure for every exercise and recorded variation. */
function cleanName(s){return String(s);}
function anatomyCard(p,e,caption){
 if(!e.art||!hasImage)throw new Error('Matching anatomy illustration required: '+e.id);
 var top=p.y,h=305,ix=M+11,iw=245,rx=M+272,rw=RIGHT-rx-11;
 p.box(M,top,RIGHT-M,h,[.985,.98,.965],ORANGE);
 var y=p.column(cleanName(e.name),ix,top-17,RIGHT-M-22,11,INK,true);
 y=p.column(caption||'Recorded exercise variation',ix,y-3,RIGHT-M-22,8,ORANGE,true)-6;
 var ah=Math.min(123,iw/(e.artAspect||2)),aw=ah*(e.artAspect||2);
 p.commands.push('q '+num(aw)+' 0 0 '+num(ah)+' '+num(ix+(iw-aw)/2)+' '+num(y-ah)+' cm /Im_'+(e.artKey||e.id)+' Do Q\n');
 var labels=(e.artCaption||'POSITION A                    POSITION B').split(/\s{3,}/);
 labels.forEach(function(t,k){p.column(t,ix+k*iw/2,y-ah-10,iw/2-5,6.5,INK,true);});
 var cy=y-ah-29;
 [['SETUP',e.cardCues.setup],['MOVE',e.cardCues.move],['RETURN',e.cardCues.return]].forEach(function(a){
  var lines=wrap(a[0]+' / '+cleanName(a[1]),iw,7.8);
  if(lines.length>3)throw new Error('Shorten card cue: '+e.id+' / '+a[0]);
  lines.forEach(function(t){p.text(t,ix,cy,7.8,INK,false);cy-=10.14;});cy-=5;
 });
 var ry=y;
 [['MAIN / RED',e.main,RED],['SECONDARY / BLUE',e.secondary,BLUE],['SUPPORT / GREEN',e.base,GREEN]].forEach(function(a){
  p.text(a[0],rx,ry,8,a[2],true);ry=p.column(a[1],rx,ry-13,rw,7.8,INK,false)-11;
 });
 var r=e.resistance||{},gy=top-h+62;
 if(r.mode==='band'){
  var pilates=r.system==='hpygn-pilates';
  p.text(pilates?'PILATES / MATCHED LEFT + RIGHT':'LONG-LINE BANDS / per working line',rx,gy,7,ORANGE,true);
  [1,2,3].forEach(function(n,i){p.text('R'+n+' / '+(pilates?'2 x '+[45,55,65][i]+' lb PER SIDE':['1-kit','2-kit','4-kit'][i]+' : label x count ______'),rx,gy-15-i*14,7,INK,false);});
 }else if(r.mode==='unloaded')p.text('BODYWEIGHT / no band',rx,gy-15,7,ORANGE,true);else{p.text('RESISTANCE / per working line',rx,gy,7,ORANGE,true);[1,2,3].forEach(function(n,i){p.text('R'+n+' / label x count ______',rx,gy-15-i*14,7,INK,false);});}
 if(Math.min(cy,ry)<top-h+8)throw new Error('Anatomy card overflow: '+e.id);
 p.y=top-h-12;
}
var anatomyFlowPage=null,anatomyFlowKey='',shownVariantArt={};
function anatomyPages(items,kicker,title,sub){
 var key=currentSection||title;
 items.forEach(function(item){
  if(!anatomyFlowPage||anatomyFlowKey!==key||anatomyFlowPage.y<350){
   anatomyFlowPage=add(new Page(currentSection||title));anatomyFlowKey=key;
   anatomyFlowPage.top(currentSection?'PROJECT 100 / MUSCLE-FOCUS GUIDE':kicker,currentSection?currentSection.replace(/^DAY (\d+) \/ /,'Day $1 / '):title,sub);
  }
  anatomyCard(anatomyFlowPage,item.e,item.caption);
  shownVariantArt[item.e.art]=true;
 });
}
function addIllustratedCards(dayNumbers,options){
 db.days.filter(function(d){return dayNumbers.indexOf(d.day)>=0&&d.slots.length;}).forEach(function(d){
  var menu=(db.variantMenus||[]).find(function(m){return m.day===d.day;});
  var slots=options?(menu?menu.guideIds.map(function(id){return [id,'option'];}):[]):d.slots;
  var items=slots.map(function(s){return {e:eBy[s[0]],caption:options?'Alternative / use the matching movement slot':sets(l,d,s[1])+' planned set(s) / '+eBy[s[0]].reps};});
  anatomyPages(items,'PROJECT 100 / '+(options?'EXERCISE OPTIONS':'DAY PLAN'),'Day '+d.day+' / '+d.title,d.focus);
 });
}
function addGuide(e){anatomyPages([{e:e,caption:e.reps||'Recorded exercise variation'}],'PROJECT 100 / EXERCISE GUIDE',e.pattern||'Exercise technique',null);}
function poseTag(v){if(v.guide_position)return v.guide_position;var s=v.positions[0].toLowerCase();return /half.kneel|one knee/.test(s)?'HALF KNEEL':/seated|sitting|straddl/.test(s)?'SEATED':/kneel|both knees.*on/.test(s)?'KNEELING':/squat/.test(s)?'SQUAT':/inclined|hinge|bow|fold/.test(s)?'INCLINED':'STANDING';}
function anchorTag(v){var s=v.anchors[0].toLowerCase();return /high|overhead|near head/.test(s)?'HIGH':/low|floor|below/.test(s)?'LOW':'MID';}
function variantExercise(v,t){
 if(!v.art)throw new Error('Missing reviewed anatomical variant: '+v.id);
 var roles=v.roleOverrides||{};
 return {id:v.id,artKey:'variant-'+v.id,name:v.name,art:v.art,artAspect:v.artAspect||2,artCaption:'POSITION A                    POSITION B',cardCues:v.cardCues,main:roles.main||t.main,secondary:roles.secondary||t.secondary,base:roles.base||v.supportCue||'Trunk control and the floor or box contacts shown.',resistance:v.resistance||{mode:'unconfirmed'}};
}
var currentSection='',currentGuideDay=0;
function variantsOfType(t){
 var items=db.recordedVariants.filter(function(v){return v.trainingPrescriptionEligible!==false&&(!currentGuideDay||v.guide_day===currentGuideDay)&&v.movement_type_id===t.id&&!shownVariantArt[v.art];}).sort(function(a,b){return poseTag(a).localeCompare(poseTag(b))||anchorTag(a).localeCompare(anchorTag(b))||a.name.localeCompare(b.name);}).map(function(v){return {e:variantExercise(v,t),caption:'PERSONAL VARIATION / '+poseTag(v)+' / '+anchorTag(v)+' ANCHOR'};});
 anatomyPages(items,'PROJECT 100 / '+currentSection,t.name,null);
}

function guideCover(isFullBody){anatomyFlowPage=null;anatomyFlowKey='';
var p=add(new Page(isFullBody?"Two-day full-body guide":"Three-day muscle-focus guide"));
p.top("PROJECT 100 / ILLUSTRATED TRAINING GUIDE",isFullBody?"Full body / 2 days":"Muscle focus / 3 days",isFullBody?"Whole-body sessions / separate Pilates matched-pair kit":"Chest / back / shoulders / arms / core / legs");
var rows=isFullBody?[["DAY 5 / FULL BODY A","Legs and hips > chest and shoulders > back and arms > core","shoulder-band-bar-squat"],["DAY 6 / FULL BODY B","Whole-body control / one easy set","pilates-row"]]:[["DAY 1 / CHEST + TRICEPS + CORE","Chest / front and side delts / triceps / forearm grip","press"],["DAY 2 / LEGS + SHOULDERS + CORE","Quads / hamstrings / glutes / calves / trunk and sides","shoulder-band-bar-squat"],["DAY 3 / ARMS + BACK + CORE","Back / rear delts / biceps / brachialis / forearms and grip","standing-curl"]];
rows.forEach(function(row){var e=eBy[row[2]],top=p.y,h=isFullBody?205:175;p.box(M,top,RIGHT-M,h,[.985,.98,.965],ORANGE);var aw=Math.min(225,(h-35)*e.artAspect),ah=aw/e.artAspect;if(hasImage)p.commands.push("q "+num(aw)+" 0 0 "+num(ah)+" "+num(M+8)+" "+num(top-ah-15)+" cm /Im_"+e.id+" Do Q\n");var x=M+253;p.column(row[0],x,top-26,RIGHT-x-10,12,ORANGE,true);p.column(row[1],x,top-70,RIGHT-x-10,10,INK,false);p.y=top-h-12;});
p.p("RED / Main     BLUE / Assistance     GREEN / Core and base",9,ORANGE,true,5);
if(isFullBody){
 var pairTop=p.y,cw=(RIGHT-M-16)/3;
 [45,55,65].forEach(function(n,i){var x=M+i*(cw+8);p.box(x,pairTop,cw,88,[1,.97,.94],ORANGE);p.text('R'+(i+1)+' / MATCHED PAIR',x+8,pairTop-17,8,ORANGE,true);p.text('LEFT: 2 x '+n+' lb',x+8,pairTop-38,9,INK,true);p.text('RIGHT: 2 x '+n+' lb',x+8,pairTop-57,9,INK,true);p.text((n*2)+' lb nominal per side',x+8,pairTop-76,7,INK,false);});
 p.y=pairTop-103;p.p('Four bands total: two left + two right. Both sides use the same label.',9,ORANGE,true);p.p('Label ratings are nominal; tension changes with stretch. Bodyweight drills use no band.',8);
}
else p.p("Use the day's set allocation. Choose a suitable variation for the same movement slot. Related exercises follow together by muscle group and movement.",9);
}
function focusedLibrary(){
guideCover(false);
var chapters=[
{label:"DAY 1 / CHEST + TRICEPS + CORE",guides:["press","lateral","pressdown","standing-mid-side-band-bar-pressdown","standing-shared-low-rear-overhead-extension","floor-kneeling-overhead-extension","box-kneeling-extension"],types:["wide-arm-drive","overhead-arm-drive","overhead-extension","bar-pressdown","shared-downward-draw","low-front-arm-raise","elbow-extension"]},
{label:"DAY 2 / LEGS + SHOULDERS + CORE",guides:["sit-stand","shoulder-band-bar-squat","hamstring-curl","hip-extension","hip-abduction","calf-raise","brace"],types:["squat-bar-bow","torso-bow","anti-rotation"]},
{label:"DAY 3 / ARMS + BACK + CORE",guides:["row","floor-kneeling-high-front-paired-draw","scapular-control","curl","standing-curl","supported-high-front-curl"],types:["high-front-draw","rearward-arm-drive","elbow-flexion","side-draw","line-hold","forearm-rotation"]}
];
chapters.forEach(function(ch,index){currentSection=ch.label;currentGuideDay=index+1;addIllustratedCards([index+1],false);addIllustratedCards([index+1],true);anatomyPages(ch.guides.filter(function(id){return !shownVariantArt[eBy[id].art];}).map(function(id){return {e:eBy[id],caption:'Technique option / use the matching movement slot'};}),'PROJECT 100 / TECHNIQUE OPTIONS',ch.label,null);ch.types.concat(db.recordedMovementTypes.map(function(t){return t.id;}).filter(function(id){return ch.types.indexOf(id)<0;})).forEach(function(id){variantsOfType(db.recordedMovementTypes.find(function(t){return t.id===id;}));});});
currentGuideDay=0;currentSection="SPECIAL EQUIPMENT / NECK + TRUNK POSITION";variantsOfType(db.recordedMovementTypes.find(function(t){return t.id==="head-harness-bow";}));
}

if(kind==="protocol"){
var intro=add(new Page("Band configurations"));intro.top("PROJECT 100 / SHARED PROTOCOL","One protocol. Every exercise.","R1-R3 describes equipment options; exercise technique is written once.");
intro.heading("R1 / Single band / one kit");intro.p("Record one selected band per working line. A single KUZARO kit contains one of each label, so identical paired lines may be unavailable; use one side at a time when needed.");
intro.heading("R2 / Two-kit options");intro.p("Up to two matching bands of a selected rating can be available per line. Separate matched handles and combined bands on one line are different setups; record which you use.");
intro.heading("R3 / Four-kit options");intro.p("Up to four bands of a selected rating can be available per line. This describes equipment availability, not a required load or a harder version of the movement.");
intro.heading("The six KUZARO labels");intro.p("35 / 45 / 55 / 65 / 75 / 85 lb. One of each per kit; the labels total 360 lb across the kit, not on one working line.");
intro.heading("HPYGN Pilates / matched pairs");intro.p("Separate Pilates kit: R1 = 2 x 45 lb per side; R2 = 2 x 55 lb per side; R3 = 2 x 65 lb per side. Four bands total at every level. Left and right bundles match. Nominal totals per side are 90 / 110 / 130 lb, never a single combined working load.");
intro.heading("Read the gauge beside each exercise");intro.p("Choose a suitable band label and count, then record the nominal label total per working line. The orange meter is an availability record, not a target to fill. For equal-rated bands: label x count = nominal total. Independent left/right lines are recorded separately.");
intro.p("Label pounds are not measured force at the hands, a hardware rating or a free-weight equivalent. Tension changes with stretch, anchor height, starting distance and movement range. An unloaded exercise clearly says NO BAND.",10,ORANGE,true);
intro.p("No personal load is assigned. Even one labelled band may be too much; use unloaded practice or an appropriate lighter option where needed.",9);
var settings=add(new Page("One training baseline"));settings.top("PROJECT 100 / SESSION SETTINGS","Sets and repetitions are separate.");
settings.p("One repetition is one complete movement. One set is a group of repetitions before a rest.");
settings.heading("Shared starting baseline");settings.p("Two sets for main exercises; one for supporting exercises; one easy set for control drills. Stop while about four more good repetitions remain possible. Rest about 60-120 seconds or longer as needed.");
settings.heading("Your seven-day rhythm");db.days.forEach(function(d){settings.p("DAY "+d.day+" / "+d.title,10,INK,true,5);});
settings.heading("Keep the two full-body days different");settings.p("Day 5 uses no more than two sets. Day 6 is only one easy set, with at least five more good repetitions possible, or take rest. Days 4 and 7 are rest days. R1-R3 does not override these settings.");
settings.heading("Three muscle roles");settings.p("RED / Main movement focus.",10,RED,true);settings.p("BLUE / Secondary assistance and local control.",10,BLUE,true);settings.p("GREEN / Base and supporting position.",10,GREEN,true);settings.p("Bands stay orange-edged charcoal. A muscle can change role between exercises. Colours illustrate roles, not measured activation; read the details for hidden muscles.");
settings.p("Read the setup protocol next, then follow your day's session and its linked exercise sheets.");
var baseline=makePages(db,"planner",1,null,values,hasImage);pages.push(baseline[1],baseline[7]);return pages;
}
if(kind==="book"){var bodyValues={};Object.keys(values).forEach(function(k){if(k.indexOf("fullbody-")===0)bodyValues[k.slice(9)]=values[k];});var focusedPages=makePages(db,"focused",level,null,values,hasImage),bodyPages=makePages(db,"fullbody",level,null,bodyValues,hasImage);bodyPages.forEach(function(p){p.fields.forEach(function(f){f.name="fullbody-"+f.name;});});return focusedPages.concat(bodyPages);}
if(kind==="focused-short"||kind==="fullbody-short"){
 (kind==="focused-short"?[1,2,3]:[5,6]).forEach(function(day){anatomyFlowPage=null;anatomyFlowKey='';addIllustratedCards([day],false);});return pages;
}
if(kind==="focused"){focusedLibrary();return pages;}
if(kind==="fullbody"){
 guideCover(true);[5,6].forEach(function(day){addIllustratedCards([day],false);addIllustratedCards([day],true);});
 return pages;
}
if(kind==="weekly"||kind==="weekly-overview"){
if(kind==="weekly"){
var preview=add(new Page("Illustrated five-day weekly map"));preview.top("PROJECT 100 / ILLUSTRATED WEEK","Five days. Your exercises.","Three focused sessions + two full-body sessions / days 4 and 7 are recovery days");
var previewIds={1:"standing-shared-low-rear-overhead-extension",2:"hamstring-curl",3:"supported-high-front-curl",5:"shoulder-band-bar-squat",6:"pilates-row"};
db.days.filter(function(d){return !!previewIds[d.day];}).forEach(function(d){var e=eBy[previewIds[d.day]],top=preview.y;preview.box(M,top,RIGHT-M,114,[.985,.98,.965],ORANGE);var iw=Math.min(165,90*(e.artAspect||2)),ih=iw/(e.artAspect||2);
if(hasImage)preview.commands.push("q "+num(iw)+" 0 0 "+num(ih)+" "+num(M+8)+" "+num(top-ih-12)+" cm /Im_"+e.id+" Do Q\n");
preview.text("DAY "+d.day+" / "+d.title,M+190,top-18,10,ORANGE,true);var y=preview.column(e.name,M+190,top-37,RIGHT-M-205,11,INK,true);preview.column((d.day>=5?"PILATES / matched pairs. ":"LONG-LINE BANDS. ")+(d.kind==="easy"?"One easy set or rest.":"Follow the planned sets beside each exercise."),M+190,y-9,RIGHT-M-205,8,INK,false);preview.y=top-122;});
preview.p("The following pages list and illustrate the accepted day exercises and the recorded alternatives. Main red / secondary blue / base green. Select resistance individually.",8,INK,false,4);
}
var w=add(new Page("One-page weekly planner"));w.top("PROJECT 100 / YOUR PRINTABLE WEEK","Your week. One day at a time.","Three focused days + two full-body days. Mark your work below.");
var cols=(RIGHT-M-16)/3,top=w.y;
db.resistanceProtocol.levels.forEach(function(l,i){var x=M+i*(cols+8);w.box(x,top,cols,54,[1,.96,.92],ORANGE);w.text("R"+l.level+" / "+l.label,x+8,top-16,8.5,ORANGE,true);w.column(l.kits+" kit(s) available. Record the selected band setup on its exercise sheet.",x+8,top-32,cols-16,8,INK,false);});
w.y=top-70;w.p("Pilates full-body days: R1 2 x 45 lb, R2 2 x 55 lb, R3 2 x 65 lb EACH SIDE. Keep left and right matched.",9,INK,false,6);
w.p("Starting baseline: two main sets, one supporting set, one easy control set. Day 5: at most two sets. Day 6: one easy set or rest. Band load is individually selected.",8.5,INK,false,8);
var names=["Push: chest and arms","Legs and hips","Pull: back and arms","Rest and recover","Full body: moderate","Full body: easy practice","Rest and recover"],shortNames={"press":"Chest press","pressdown":"Triceps pressdown","lateral":"Shoulder raise","brace":"Brace and breathe","sit-stand":"Sit-to-stand","hamstring-curl":"Hamstring curl","calf-raise":"Calf raise","hip-abduction":"Side leg lift","row":"Supported row","scapular-control":"Shoulder-blade control","curl":"Neutral-grip curl","hip-extension":"Backward leg lift"};
db.days.forEach(function(d,i){var top=w.y,height=58;w.box(M,top,RIGHT-M,height,d.kind==="rest"?[.94,.94,.92]:[.98,.98,.97]);w.box(M,top,43,height,d.kind==="rest"?[.88,.88,.85]:[1,.92,.84]);w.text("DAY",M+10,top-16,7,ORANGE,true);w.text(d.day,M+14,top-39,20,ORANGE,true);w.text(names[i],M+54,top-15,11,INK,true);
var text=d.slots.length?d.slots.map(function(s,j){return (j+1)+". "+(shortNames[s[0]]||eBy[s[0]].name.replace(" / Pilates pair",""));}).join("  /  "):"No strength session. Optional gentle comfortable activity.";
w.column(text,M+54,top-30,265,8.5,INK,false);
w.text("MY NOTES / date, work, how it felt",370,top-12,7,INK,true);
var name="weekly-day-"+d.day+"-notes";w.fields.push({name:name,value:ascii(values[name]||""),rect:[370,top-53,RIGHT-8,top-20],multiline:true});w.y=top-height-6;});
w.y-=8;w.p("BEFORE YOU MOVE: set your base > brace gently and breathe > move smoothly > return slowly. Stop for pain or lost control.",8.5,INK,true,5);
w.p("DAYS 1-3: focused-days.html   /   DAYS 5-6: full-body.html",8,ORANGE,true,3);
w.p("Main red / secondary blue / support green. Select a suitable resistance and control the return.",7.5,INK,false,3);
w.p("Band labels are nominal. The matched Pilates bundles are a separate system from long-line kit availability.",7,INK,false,0);
if(kind==="weekly"){[1,2,3,5,6].forEach(function(day){addIllustratedCards([day],false);addIllustratedCards([day],true);});}return pages;
}

if(kind==="catalogue"){addSourceCatalogue();return pages;}
if(kind==="guide"){if(!eBy[guideId])throw new Error("Unknown guide");addGuide(eBy[guideId]);}
else if(kind==="guides"){var intro=add(new Page("Technique sheet index"));intro.top("PROJECT 100 / "+db.exercises.length+" TECHNIQUE SHEETS","Understand the whole position.");
intro.p("Use the session guides for planned sets and the weekly planner to record your training.",10);
intro.heading("Three roles / one complete position");
intro.p("MAIN / RED: intended movement focus.",11,RED,true);
intro.p("SECONDARY / BLUE: movement assistants and local joint control.",11,BLUE,true);
intro.p("BASE / GREEN: postural support and stable contact points.",11,GREEN,true);
intro.p("BAND / ORANGE-EDGED CHARCOAL: the resistance line at every level. Colour never specifies load.");
intro.heading("Read in order: setup > base and brace > move > return");
intro.p("Inspect the equipment and stable supports first. Warm up with comfortable activity and rehearse unloaded. Brace gently while breathing; avoid forced joint locks. Use only a range you can control.");
db.exercises.forEach(function(e,i){intro.p((i+1)+". "+e.name,10,INK,false,3);});
caution(intro);db.exercises.forEach(addGuide);
}else if(kind==="planner"){
if(!l)throw new Error("Unknown intensity level");
var p=add(new Page("Weekly map"));p.top("PROJECT 100 / FIVE-DAY PLANNER / LEVEL "+level,"Your week. Built on control.");if(hasImage){p.image(370);p.p("Technique preview / bench-supported row. Main red, secondary blue, base green.",8,INK,false,6);}
p.p("Three focused days, rest, moderate full body, easy full-body practice, rest. Day 6 becomes rest if recovery or control is reduced.",11);
p.p("Educational draft; current restrictions and tolerated loads remain unconfirmed. This is not an individualized rehabilitation prescription.",9);
p.heading("Your seven-day map");db.days.forEach(function(d){p.p("DAY "+d.day+" / "+d.title,11,INK,true,4);});
p.heading("Level "+level+" / effort and volume");
p.p("Focused days: "+l.mainSets+" main sets; "+l.accessorySets+" accessory sets. One easy set for control drills. Leave "+l.rir+"+ more good repetitions still possible. Full body A is capped at two sets; day 6 remains one easy set and 5+ repetitions in reserve.");
p.p("Rest about 60-120 seconds between sets, longer if breathing or control needs it. The listed volume is a starting point, not a test.");
p.p("Equipment ceiling: "+l.kits+" kit(s), "+l.maxBandsPerLine+" band(s) per working line. More available equipment does not require more resistance. No named bundle is assigned automatically.");
p.p("Use unloaded or bodyweight practice where needed. Even a 35 lb labelled band may be too much. Label sums are not measured hand force, hardware ratings or free-weight equivalents.",9);
p.p("RED / Main. BLUE / Secondary. GREEN / Base and support. The band stays orange-edged charcoal at every intensity level.",9);
var how=add(new Page("Setup and load selection"));how.top("READ BEFORE TRAINING","Set the base. Then move.");
how.p("Inspect anchors, bands, clips and interfaces; use stable supports. Warm up with 5-10 minutes of comfortable activity and unloaded movement rehearsal.");
[["1. Set your base","Plant feet and establish stable PLYOSOFT box contacts. Keep joints soft instead of forcing a hard knee or elbow lock."],["2. Brace gently and breathe","Firm the trunk gently while breathing normally. Keep the intended support areas quiet without freezing joints that need to move."],["3. Make the movement","Move smoothly through a comfortable arc. Exhale on effort, keep grip neutral where possible and keep recoil away from the face."],["4. Return slowly and check","Control the recoil. End the set before twisting, shrugging, leaning or loss of balance changes the movement."]].forEach(function(x){how.heading(x[0]);how.p(x[1]);});
how.heading("Equipment and progression");how.p(db.loadRule);
how.p("One KUZARO kit contains one each of 35, 45, 55, 65, 75 and 85 lb bands. Use one limb at a time if identical paired lines are unavailable; do not mismatch sides.");
how.p("HPYGN is separate: four 65 lb bands total, two per side = 130 lb nominal each side and 260 lb combined nominal. These are label sums, not measured resistance.");
caution(how);
db.days.filter(function(d){return d.slots.length;}).forEach(function(d){var q=add(new Page("Day "+d.day));q.top("DAY "+d.day+" / SESSION",d.title,d.focus);
if(d.kind==="easy")q.p("EASY PRACTICE: one set, 5+ more good repetitions still possible, no progression. Choose rest if not recovered from day 5.",10,ORANGE,true);
d.slots.forEach(function(slot,i){var e=eBy[slot[0]],title=(i+1)+". "+e.name+" / "+sets(l,d,slot[1])+" set(s) / "+e.reps+" / "+(slot[1]==="main"?"main exercise":slot[1]==="control"?"easy control":"supporting exercise"),top=q.y,height=wrap(title,RIGHT-M,10).length*13+wrap("Main: "+e.main,RIGHT-M,8.5).length*11.05+wrap("Get into position: "+e.position,RIGHT-M,8.5).length*11.05+19;q.box(M-5,top+5,RIGHT-M+10,height,[1,.97,.94],ORANGE);q.p(title,10,INK,true,3);q.p("Main: "+e.main,8.5,RED,false,2);q.p("Get into position: "+e.position,8.5,INK,false,14);});
q.p("Effort: "+(d.kind==="easy"?5:l.rir)+"+ more good repetitions still possible; control drills stay easy. Read each technique sheet before training. Rest 60-120 seconds or longer as needed.",8.5,INK,false,9);
q.heading("Record the setup and response");
[["date","Date"],["band","Band label / count per line"],["anchor","Anchor height / starting distance"],["reps","Reps / effort / comfortable range"],["response","During-session and next-day response"]].forEach(function(pair){var name="day-"+d.day+"-"+pair[0];q.field(name,pair[1],values[name],pair[0]==="response");});
q.p("Stop for symptoms or lost control. Reduce load rather than force the target.",8,INK,false,0);
});
var r=add(new Page("Recovery and sources"));r.top("RECOVERY / PROGRESSION / SOURCES","Recover before repeating.");
r.p(db.recoveryRule);r.p("Rest on days 4 and 7. Check comfortable daily movement, grip, joint symptoms and ability to repeat the setup. Use another rest day or reduce the session if control or recovery is reduced.");
r.heading("Progress one factor at a time");r.p("Establish repeatable technique and comfortable range first. Add repetitions within the range before considering a small resistance increase. Reassess control after each change. No level requires the heaviest bundles.");
caution(r);r.heading("Source scope");
r.p("Personal movement names and equipment records come from Kinetics. Supported complements and cues are editorial adaptations. They are not a clinician-approved personal rehabilitation plan.",9);
Object.keys(db.sources).forEach(function(k){var s=db.sources[k];r.p(s.title,8.5,INK,true,1);r.p(s.url,7.5,INK,false,5);});
r.p("The separate technique document describes all positions. Each movement has its own reviewed naturalistic start/finish plate; a pose is not reused for a different exercise.",8,INK,false,0);
}else throw new Error("Choose a planner or exercise document.");
return pages;
}
function buildPdf(pages,jpeg){
var bank=jpeg&&jpeg.bytes?{row:jpeg}:jpeg||{},used={};pages.forEach(function(p){p.commands.forEach(function(c){var m=c.match(/Im_([A-Za-z0-9-]+) Do/);if(m)used[m[1]]=true;});});
var objects=[null],pageIds=[],fieldIds=[],font1=reserve(),font2=reserve(),catalog=reserve(),pageTree=reserve(),acro=reserve(),imageResources="";
function reserve(){objects.push("");return objects.length-1;}
function put(s){var id=reserve();objects[id]=s;return id;}
objects[font1]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
objects[font2]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
Object.keys(used).forEach(function(key){var data=bank[key];if(!data)throw new Error("Missing anatomical plate: "+key);var img=reserve();imageResources+=" /Im_"+key+" "+img+" 0 R";objects[img]="<< /Type /XObject /Subtype /Image /Width "+data.width+" /Height "+data.height+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+data.bytes.length+" >>\nstream\n"+data.bytes+"\nendstream";});
pages.forEach(function(p,i){var id=reserve();pageIds.push(id);var commands=p.commands.join("")+"BT /F1 8 Tf 0.25 0.32 0.36 rg 1 0 0 1 "+num(M)+" 22 Tm (PROJECT 100 / grip-reviewed edition / 19 Oct 2026) Tj ET\nBT /F1 8 Tf 1 0 0 1 510 22 Tm ("+(i+1)+" / "+pages.length+") Tj ET\n";
var stream=put("<< /Length "+commands.length+" >>\nstream\n"+commands+"endstream"),annots=[];
p.fields.forEach(function(f){var rect=f.rect,fw=rect[2]-rect[0],fh=rect[3]-rect[1],appearance="q 1 1 1 rg 0 0 "+num(fw)+" "+num(fh)+" re f 0.55 0.64 0.69 RG 0.6 w 0.3 0.3 "+num(fw-.6)+" "+num(fh-.6)+" re S\n";
var ls=wrap(f.value,fw-10,9).slice(0,f.multiline?2:1);
ls.forEach(function(t,j){appearance+="BT /F1 9 Tf 0.09 0.13 0.16 rg 1 0 0 1 5 "+num(fh-12-j*11)+" Tm ("+literal(t)+") Tj ET\n";});appearance+="Q\n";
var ap=put("<< /Type /XObject /Subtype /Form /BBox [0 0 "+num(fw)+" "+num(fh)+"] /Resources << /Font << /F1 "+font1+" 0 R >> >> /Length "+appearance.length+" >>\nstream\n"+appearance+"endstream");
var widget=put("<< /Type /Annot /Subtype /Widget /FT /Tx /T ("+literal(f.name)+") /V ("+literal(f.value)+") /DV ("+literal(f.value)+") /Rect ["+rect.map(num).join(" ")+"] /P "+id+" 0 R /F 4 /Ff "+(f.multiline?4096:0)+" /DA (/F1 9 Tf 0.09 0.13 0.16 rg) /AP << /N "+ap+" 0 R >> /MK << /BC [0.55 0.64 0.69] /BG [1 1 1] >> /BS << /W 0.6 /S /S >> >>");
annots.push(widget+" 0 R");fieldIds.push(widget+" 0 R");
});
objects[id]="<< /Type /Page /Parent "+pageTree+" 0 R /MediaBox [0 0 "+W+" "+H+"] /Resources << /Font << /F1 "+font1+" 0 R /F2 "+font2+" 0 R >>"+(imageResources?" /XObject <<"+imageResources+" >>":"")+" >> /Contents "+stream+" 0 R"+(annots.length?" /Annots ["+annots.join(" ")+"]":"")+" >>";
});
objects[pageTree]="<< /Type /Pages /Count "+pages.length+" /Kids ["+pageIds.map(function(x){return x+" 0 R";}).join(" ")+"] >>";
objects[acro]="<< /Fields ["+fieldIds.join(" ")+"] /DA (/F1 9 Tf 0 g) /DR << /Font << /F1 "+font1+" 0 R >> >> >>";
objects[catalog]="<< /Type /Catalog /Pages "+pageTree+" 0 R"+(fieldIds.length?" /AcroForm "+acro+" 0 R":"")+" >>";
var out="%PDF-1.4\n%\xe2\xe3\xcf\xd3\n",offsets=[0];for(var j=1;j<objects.length;j++){offsets.push(out.length);out+=j+" 0 obj\n"+objects[j]+"\nendobj\n";}
var start=out.length;out+="xref\n0 "+objects.length+"\n0000000000 65535 f \n";for(var a=1;a<objects.length;a++)out+=String(offsets[a]).padStart(10,"0")+" 00000 n \n";out+="trailer\n<< /Size "+objects.length+" /Root "+catalog+" 0 R >>\nstartxref\n"+start+"\n%%EOF\n";
var bytes=new Uint8Array(out.length);for(var n=0;n<out.length;n++)bytes[n]=out.charCodeAt(n)&255;return bytes;
}
globalThis.Project100PDF={makePages:makePages,buildPdf:buildPdf,wrap:wrap};
if(typeof document==="undefined")return;
if(new URLSearchParams(location.search).get("embed")==="1")document.body.classList.add("wg-embedded");
function refreshResistance(){document.querySelectorAll("[data-resistance] .wg-gauge-row").forEach(function(row){var rating=row.querySelector("[data-r-rating]"),count=row.querySelector("[data-r-count]"),out=row.querySelector("[data-r-total]"),meter=row.querySelector("[data-r-meter]"),summary=row.querySelector("[data-r-summary]");var n=Number(rating.value)*Number(count.value);if(!rating.value){out.textContent="Not recorded";meter.value=0;summary.value="";}else{out.textContent=n+" lb nominal / line";meter.value=n;summary.value=rating.value+" x "+count.value+" = "+n+" lb nominal";}});}
document.querySelectorAll(".wg-gauge-row select").forEach(function(select){select.addEventListener("change",refreshResistance);});refreshResistance();window.Project100RefreshResistance=refreshResistance;
var liveValues=Object.create(null);function rememberEntry(event){var el=event.target;if(el&&el.name&&/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))liveValues[el.name]=el.value;}document.addEventListener("input",rememberEntry);document.addEventListener("change",rememberEntry);
var status=document.querySelector(".wg-status"),pdf=document.querySelector("[data-download-pdf]");
function message(t){if(status)status.textContent=t;document.querySelectorAll("[data-pdf-status]").forEach(function(el){el.textContent=t;});}
function save(blob,name){var url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},60000);}
function formValues(){var o={};document.querySelectorAll("input[name],textarea[name],select[name]").forEach(function(el){o[el.name]=el.value;});return Object.assign(o,liveValues);}
window.Project100ReadValues=formValues;
async function plate(db,kind,guideId,selectedIds){
 kind=kind||document.body.dataset.document;
 if(kind==='protocol'||kind==='weekly-overview')return {};
 var items=db.exercises.map(function(e){return {id:e.id,art:e.art};});
 if(['selected','focused','book','weekly','focused-short'].includes(kind))items=items.concat(db.recordedVariants.filter(function(v){return v.art&&v.trainingPrescriptionEligible!==false;}).map(function(v){return {id:'variant-'+v.id,art:v.art};}));
 if(kind==='guide')items=items.filter(function(e){return e.id===(guideId||document.body.dataset.guide);});
 if(kind==='selected')items=items.filter(function(e){return (selectedIds||[]).includes(e.id.replace(/^variant-/,''));});
 var bank={};
 for(var i=0;i<items.length;i++){
  var e=items[i];if(!e.art)throw new Error('Matching anatomy image missing: '+e.id);
  var img=new Image();img.src=new URL('../../assets/media/workout-guides/'+e.art,location.href).href;await img.decode();
  var c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;var ctx=c.getContext('2d');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0);
  bank[e.id]={width:c.width,height:c.height,bytes:atob(c.toDataURL('image/jpeg',.90).split(',')[1])};
 }return bank;
}
async function exportEnteredPdf(entries,options){options=options||{};var captured=Object.assign({},formValues(),entries||{},liveValues,window.P100Training?window.P100Training.pdfValues():{});if(pdf)pdf.disabled=true;message("Preparing your PDF on this device...");try{var response=await fetch(document.body.dataset.planSource||"training-plan-v0.3.json",{cache:"no-cache"});if(!response.ok)throw new Error("The plan database could not load. Use Print / save as PDF or retry.");
if(options.kind==='selected'){captured['selected-exercises']=options.selectedIds||[];captured['selection-title']=String(options.title||'My selected exercises').slice(0,80);}
var db=await response.json(),kind=options.kind||document.body.dataset.document,level=Number(document.body.dataset.level||1),guideId=options.guideId||document.body.dataset.guide,art=await plate(db,kind,guideId,options.selectedIds),pages=makePages(db,kind,level,guideId,captured,!!(art&&Object.keys(art).length)),bytes=buildPdf(pages,art);
var suffix=kind==="selected"?"My_Selected_Exercises":kind==="weekly"?"Illustrated_Weekly_Planner":kind==="weekly-overview"?"Weekly_Log":kind==="focused-short"?"Focused_Session_Cards":kind==="fullbody-short"?"Full_Body_Session_Cards":kind==="protocol"?"Shared_Protocols":kind==="book"?"Complete_Guide":kind==="focused"?"Focused_Days":kind==="fullbody"?"Full_Body":kind==="planner"?"Planner_Level_"+level:kind==="guide"?"Guide_"+guideId:"Exercise_Guides";save(new Blob([bytes],{type:"application/pdf"}),"PROJECT100_"+suffix+"_guide.pdf");message("Your "+pages.length+"-page PDF is ready. Check Downloads on your device. Planner notes are included when applicable.");
}catch(error){message(error.message+" The page remains available to print.");}finally{if(pdf)pdf.disabled=false;}}
window.Project100ExportPDF=exportEnteredPdf;if(pdf)pdf.addEventListener("click",function(){exportEnteredPdf();});
document.querySelectorAll("[data-print]").forEach(function(b){b.addEventListener("click",function(){window.print();});});
document.querySelectorAll("[data-download-html]").forEach(function(b){b.addEventListener("click",async function(){b.disabled=true;try{var clone=document.documentElement.cloneNode(true);clone.querySelectorAll("input[name],textarea[name],select[name]").forEach(function(el){var source=document.getElementsByName(el.name)[0];if(!source)return;if(el.tagName==="TEXTAREA")el.textContent=source.value;else if(el.tagName==="SELECT"){Array.from(el.options).forEach(function(o){o.toggleAttribute("selected",o.value===source.value);});}else el.setAttribute("value",source.value);});
var sheet=clone.querySelector('link[rel="stylesheet"]'),res=await fetch(sheet.href);if(!res.ok)throw new Error("Could not load styles.");var style=document.createElement("style");style.textContent=await res.text();sheet.replaceWith(style);
var images=clone.querySelectorAll("img");for(var i=0;i<images.length;i++){var original=document.querySelectorAll("img")[i];if(!original.complete||!original.naturalWidth){var loaded=new Image();loaded.src=original.currentSrc||original.src;await loaded.decode();original=loaded;}var c=document.createElement("canvas");c.width=original.naturalWidth;c.height=original.naturalHeight;var copyctx=c.getContext("2d");copyctx.fillStyle="#fff";copyctx.fillRect(0,0,c.width,c.height);copyctx.drawImage(original,0,0);images[i].src=c.toDataURL("image/jpeg",.9);}
clone.querySelectorAll("script").forEach(function(s){s.remove();});var base=document.createElement("base");base.href=location.href;clone.querySelector("head").prepend(base);var toolbar=clone.querySelector(".wg-toolbar");if(toolbar)toolbar.remove();var note=document.createElement("p");note.style="padding:16px;color:white;font:14px Arial";note.textContent="Offline HTML copy. Use your browser Print menu to save or print a PDF. Navigation links return to the website.";clone.querySelector("body").prepend(note);
save(new Blob(["<!doctype html>\n"+clone.outerHTML],{type:"text/html;charset=utf-8"}),"PROJECT100_"+(document.body.dataset.document||"Guide")+"_v0.3.html");message("The self-contained HTML copy is ready, with image, styles and typed entries included.");
}catch(e){message("HTML download could not finish: "+e.message);}finally{b.disabled=false;}});});
})();

