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
function makePages(db,kind,level,guideId,values,hasImage){
values=values||{};var pages=[],l=db.levels.filter(function(x){return x.level===level;})[0],eBy={};db.exercises.forEach(function(e){eBy[e.id]=e;});
function add(p){pages.push(p);return p;}
function caution(p){p.p("Stop for pain, new numbness or weakness, dizziness, loss of grip, moving supports or damaged bands. Keep the recoil path clear. Follow manufacturer limits and individual clinical restrictions.",8.5,INK,false,4);}
function addGuide(e){
var p=add(new Page(e.name));p.top("PROJECT 100 / FOLLOW-ALONG EXERCISE",e.name,e.pattern+" / "+e.reps+" / choose resistance individually");
if(e.art&&hasImage)p.image(Math.min(420,185*e.artAspect),e.id,e.artCaption,e.artAspect);
var steps=[["1. Prepare your equipment",e.setup],["2. Find a steady position",e.position],["3. Make the movement",e.move],["4. Return slowly",e.range]],gap=12,cw=(RIGHT-M-gap)/2,fs=10;
for(var row=0;row<2;row++){var pair=steps.slice(row*2,row*2+2),height=Math.max.apply(null,pair.map(function(a){return wrap(a[1],cw-22,fs).length*fs*1.3+40;})),top=p.y;pair.forEach(function(a,col){var x=M+col*(cw+gap);p.box(x,top,cw,height,[1,.97,.94],ORANGE);p.text(a[0],x+11,top-17,10,ORANGE,true);p.column(a[1],x+11,top-34,cw-22,fs,INK,false);});p.y=top-height-10;}
p.p("HOW YOUR BODY WORKS TOGETHER",9,INK,true,5);
var roles=[["RED / Main",e.main,RED],["BLUE / Secondary",e.secondary,BLUE],["GREEN / Base and support",e.base,GREEN]],rw=(RIGHT-M-16)/3,rfs=9,height=Math.max.apply(null,roles.map(function(a){return wrap(a[1],rw-18,rfs).length*rfs*1.3+36;})),top=p.y;
roles.forEach(function(a,i){var x=M+i*(rw+8);p.box(x,top,rw,height,[.96,.97,.97],a[2]);p.text(a[0],x+9,top-15,8.5,a[2],true);p.column(a[1],x+9,top-30,rw-18,rfs,INK,false);});p.y=top-height-9;
p.p("CHECK YOURSELF: "+e.check,9,INK,true,4);
p.p("MAKE IT EASIER: "+e.easier,9,INK,false,5);
p.p("Keep joints soft and breathe normally. Colours show exercise roles, not measured activation. Hidden muscles are explained in text. Stop for pain, lost control, dizziness, slipping support or damaged bands. Keep recoil clear; follow manufacturer limits.",7.5,INK,false,4);
p.p("Sources: "+e.sources.map(function(k){return db.sources[k].title;}).join("; ")+". Links: project100.fit/downloads/kinetics/index.html",7,INK,false,0);
}
if(kind==="focused"||kind==="fullbody"){
var full=makePages(db,"planner",level,null,values,hasImage),focused=kind==="focused",chosen=db.days.filter(function(d){return focused?d.day<=3:d.day===5||d.day===6;}),ids=[];
chosen.forEach(function(d){d.slots.forEach(function(s){if(ids.indexOf(s[0])<0)ids.push(s[0]);});});
var cover=new Page(focused?"Three focused days":"Two full-body days");
cover.top("PROJECT 100 / "+(focused?"KUZARO FOCUSED DAYS":"HPYGN / PILATES CHAPTER")+" / LEVEL "+level,focused?"Three days. Clear focus.":"Two days. Whole-body control.");
cover.p(focused?"Days 1-3 of the weekly planner. Push, supported lower body, then pull. Read the complete position cues before adding resistance.":"Days 5-6 of the weekly planner. A moderate whole-body session followed by easy practice or rest. The second day never becomes another hard full-body session.",11);
if(hasImage){cover.image(370);cover.p("Technique example / bench-supported row. Red main, blue secondary, green base.",8);}
chosen.forEach(function(d){cover.heading("DAY "+d.day+" / "+d.title);cover.p(d.focus,10);});
cover.heading("Level "+level+" baseline");cover.p(l.mainSets+" main sets / "+l.accessorySets+" accessory sets on focused days; one easy set for control drills. Keep "+l.rir+"+ more good repetitions still possible. Full body A uses at most two sets and full body B only one easy set with 5+ reps in reserve.",10);
cover.p("Equipment availability is a ceiling, not a prescribed load: "+l.kits+" kit(s), up to "+l.maxBandsPerLine+" band(s) per working line. Use unloaded or bodyweight options where needed.",10);
if(!focused)cover.p("Equipment map: the supported row, chest press and hamstring curl use individually selected long-line bands. Sit-to-stand, leg lift and bracing begin unloaded. This guide sits in the HPYGN/Pilates chapter for whole-body control; the recorded HPYGN bar patterns remain separate setup references. No automatic substitution of the heavy paired short bands is prescribed.",9);
cover.p("Use the one-page weekly planner for the seven-day map. The companion "+(focused?"full-body guide covers days 5-6.":"focused-days guide covers days 1-3.")+" Days 4 and 7 are rest.",10);
caution(cover);
pages=[cover,full[1]].concat(focused?full.slice(2,5):full.slice(5,7));
ids.forEach(function(id){addGuide(eBy[id]);});
pages.push(full[7]);return pages;
}
if(kind==="weekly"){
var w=add(new Page("One-page weekly planner"));w.top("PROJECT 100 / YOUR PRINTABLE WEEK","Your week. One day at a time.","1. Choose a level below.   2. Find today's session.   3. Follow its illustrated guide.");
var cols=(RIGHT-M-16)/3,top=w.y,labels=["Start with less","Add supporting work","Add main-exercise work"];
db.levels.forEach(function(l,i){var x=M+i*(cols+8);w.box(x,top,cols,68,[1,.96,.92],ORANGE);w.text("LEVEL "+l.level+" / "+labels[i],x+8,top-14,8,ORANGE,true);w.column(l.mainSets+" main sets + "+l.accessorySets+" supporting set"+(l.accessorySets>1?"s":""),x+8,top-29,cols-16,9,INK,true);w.column("Stop while "+l.rir+" more good repetitions are still possible.",x+8,top-45,cols-16,8.5,INK,false);});
w.y=top-80;w.p("One repetition = one movement. One set = a group of repetitions before a rest.",9,INK,false,5);
w.p("Control drills stay easy. Day 5: at most two sets. Day 6: one easy set with five more repetitions possible, or rest. Band weight is chosen individually.",8.5,INK,false,8);
var names=["Push: chest and arms","Legs and hips","Pull: back and arms","Rest and recover","Full body: moderate","Full body: easy practice","Rest and recover"],shortNames={"press":"Chest press","pressdown":"Triceps pressdown","lateral":"Shoulder raise","brace":"Brace and breathe","sit-stand":"Sit-to-stand","hamstring-curl":"Hamstring curl","calf-raise":"Calf raise","hip-abduction":"Side leg lift","row":"Supported row","scapular-control":"Shoulder-blade control","curl":"Neutral-grip curl","hip-extension":"Backward leg lift"};
db.days.forEach(function(d,i){var top=w.y,height=61;w.box(M,top,RIGHT-M,height,d.kind==="rest"?[.94,.94,.92]:[.98,.98,.97]);w.box(M,top,43,height,d.kind==="rest"?[.88,.88,.85]:[1,.92,.84]);w.text("DAY",M+10,top-16,7,ORANGE,true);w.text(d.day,M+14,top-39,20,ORANGE,true);w.text(names[i],M+54,top-15,11,INK,true);
var text=d.slots.length?d.slots.map(function(s,j){return (j+1)+". "+shortNames[s[0]];}).join("  /  "):"No strength session. Optional gentle comfortable activity.";
w.column(text,M+54,top-30,265,8.5,INK,false);
w.text("MY NOTES / date, work, how it felt",370,top-12,7,INK,true);
var name="weekly-day-"+d.day+"-notes";w.fields.push({name:name,value:ascii(values[name]||""),rect:[370,top-53,RIGHT-8,top-20],multiline:true});w.y=top-height-7;});
w.p("BEFORE YOU MOVE: set your base > brace gently and breathe > move smoothly > return slowly. Stop for pain or lost control.",8.5,INK,true,5);
w.p("DAYS 1-3: focused-days-level-1.html   /   DAYS 5-6: full-body-level-1.html",8,ORANGE,true,3);
w.p("Find both at project100.fit/downloads/kinetics/ and choose the matching level. Main red; secondary blue; support green. Bands stay orange-edged charcoal.",7.5,INK,false,3);
w.p("Equipment ceilings: L1 one kit; L2 two kits; L3 four kits. Not required loads. Band labels are nominal; individual restrictions and tolerated loads remain unconfirmed.",7,INK,false,0);
return pages;
}

if(kind==="guide"){if(!eBy[guideId])throw new Error("Unknown guide");addGuide(eBy[guideId]);}
else if(kind==="guides"){var intro=add(new Page("Technique sheet index"));intro.top("PROJECT 100 / 12 TECHNIQUE SHEETS","Understand the whole position.");
intro.p("Educational draft. Current symptoms, restrictions and tolerated loads have not been confirmed. Review suitability with a qualified clinician or trainer where injury, pain or medical restrictions apply.",10);
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
[["1. Set your base","Plant feet and establish bench or chair contacts. Keep joints soft instead of forcing a hard knee or elbow lock."],["2. Brace gently and breathe","Firm the trunk gently while breathing normally. Keep the intended support areas quiet without freezing joints that need to move."],["3. Make the movement","Move smoothly through a comfortable arc. Exhale on effort, keep grip neutral where possible and keep recoil away from the face."],["4. Return slowly and check","Control the recoil. End the set before twisting, shrugging, leaning or loss of balance changes the movement."]].forEach(function(x){how.heading(x[0]);how.p(x[1]);});
how.heading("Equipment and progression");how.p(db.loadRule);
how.p("One KUZARO kit contains one each of 35, 45, 55, 65, 75 and 85 lb bands. Use one limb at a time if identical paired lines are unavailable; do not mismatch sides.");
how.p("HPYGN is separate: four 65 lb bands total, two per side = 130 lb nominal each side and 260 lb combined nominal. These are label sums, not measured resistance.");
caution(how);
db.days.filter(function(d){return d.slots.length;}).forEach(function(d){var q=add(new Page("Day "+d.day));q.top("DAY "+d.day+" / LEVEL "+level,d.title,d.focus);
if(d.kind==="easy")q.p("EASY PRACTICE: one set, 5+ more good repetitions still possible, no progression. Choose rest if not recovered from day 5.",10,ORANGE,true);
d.slots.forEach(function(slot,i){var e=eBy[slot[0]];q.p((i+1)+". "+e.name+" / "+sets(l,d,slot[1])+" set(s) / "+e.reps,10,INK,true,3);q.p("Main: "+e.main,8.5,RED,false,2);q.p("Base cue: "+e.position,8.5,INK,false,6);});
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
r.p("The separate 12-sheet technique document describes all positions. Each movement has its own reviewed naturalistic start/finish plate; a pose is not reused for a different exercise.",8,INK,false,0);
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
pages.forEach(function(p,i){var id=reserve();pageIds.push(id);var commands=p.commands.join("")+"BT /F1 8 Tf 0.25 0.32 0.36 rg 1 0 0 1 "+num(M)+" 22 Tm (PROJECT 100 / v0.3 / 15 Oct 2026) Tj ET\nBT /F1 8 Tf 1 0 0 1 510 22 Tm ("+(i+1)+" / "+pages.length+") Tj ET\n";
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
var status=document.querySelector(".wg-status"),pdf=document.querySelector("[data-download-pdf]");
function message(t){if(status)status.textContent=t;}
function save(blob,name){var url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},60000);}
function formValues(){var o={};document.querySelectorAll("input[name],textarea[name]").forEach(function(el){o[el.name]=el.value;});return o;}
async function plate(db){var kind=document.body.dataset.document,ids=[];
if(kind==="weekly")return {};
if(kind==="guide")ids=[document.body.dataset.guide];
else if(kind==="focused"||kind==="fullbody"){db.days.filter(function(d){return kind==="focused"?d.day<=3:d.day===5||d.day===6;}).forEach(function(d){d.slots.forEach(function(s){if(ids.indexOf(s[0])<0)ids.push(s[0]);});});}
else if(kind==="guides")ids=db.exercises.map(function(e){return e.id;});else ids=["row"];
var bank={};for(var i=0;i<ids.length;i++){var e=db.exercises.find(function(x){return x.id===ids[i];});if(!e||!e.art)continue;var img=new Image();img.src=new URL("../../assets/media/workout-guides/"+e.art,location.href).href;await img.decode();var canvas=document.createElement("canvas");canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;var ctx=canvas.getContext("2d");if(!ctx)throw new Error("Image export unavailable; download the ready-made PDF instead.");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0);bank[e.id]={width:canvas.width,height:canvas.height,bytes:atob(canvas.toDataURL("image/jpeg",.90).split(",")[1])};}return bank;}
if(pdf)pdf.addEventListener("click",async function(){pdf.disabled=true;message("Preparing your PDF on this device...");try{var response=await fetch("training-plan-v0.3.json",{cache:"no-cache"});if(!response.ok)throw new Error("The plan database could not load. Use Print / save as PDF or retry.");
var db=await response.json(),kind=document.body.dataset.document,level=Number(document.body.dataset.level||1),art=await plate(db),pages=makePages(db,kind,level,document.body.dataset.guide,formValues(),!!(art&&Object.keys(art).length)),bytes=buildPdf(pages,art);
var suffix=kind==="weekly"?"Weekly_Overview":kind==="focused"?"Focused_Days_Level_"+level:kind==="fullbody"?"Full_Body_Level_"+level:kind==="planner"?"Planner_Level_"+level:kind==="guide"?"Guide_"+document.body.dataset.guide:"Exercise_Guides";save(new Blob([bytes],{type:"application/pdf"}),"PROJECT100_"+suffix+"_v0.3.pdf");message("Your "+pages.length+"-page PDF is ready. Check Downloads on your device. Typed planner entries are included; its log fields remain fillable.");
}catch(error){message(error.message+" The page remains available to print.");}finally{pdf.disabled=false;}});
document.querySelectorAll("[data-print]").forEach(function(b){b.addEventListener("click",function(){window.print();});});
document.querySelectorAll("[data-download-html]").forEach(function(b){b.addEventListener("click",async function(){b.disabled=true;try{var clone=document.documentElement.cloneNode(true);clone.querySelectorAll("input[name],textarea[name]").forEach(function(el){var source=document.getElementsByName(el.name)[0];if(!source)return;if(el.tagName==="TEXTAREA")el.textContent=source.value;else el.setAttribute("value",source.value);});
var sheet=clone.querySelector('link[rel="stylesheet"]'),res=await fetch(sheet.href);if(!res.ok)throw new Error("Could not load styles.");var style=document.createElement("style");style.textContent=await res.text();sheet.replaceWith(style);
var images=clone.querySelectorAll("img");for(var i=0;i<images.length;i++){var original=document.querySelectorAll("img")[i];if(!original.complete||!original.naturalWidth){var loaded=new Image();loaded.src=original.currentSrc||original.src;await loaded.decode();original=loaded;}var c=document.createElement("canvas");c.width=original.naturalWidth;c.height=original.naturalHeight;var copyctx=c.getContext("2d");copyctx.fillStyle="#fff";copyctx.fillRect(0,0,c.width,c.height);copyctx.drawImage(original,0,0);images[i].src=c.toDataURL("image/jpeg",.9);}
clone.querySelectorAll("script").forEach(function(s){s.remove();});var base=document.createElement("base");base.href=location.href;clone.querySelector("head").prepend(base);var toolbar=clone.querySelector(".wg-toolbar");if(toolbar)toolbar.remove();var note=document.createElement("p");note.style="padding:16px;color:white;font:14px Arial";note.textContent="Offline HTML copy. Use your browser Print menu to save or print a PDF. Navigation links return to the website.";clone.querySelector("body").prepend(note);
save(new Blob(["<!doctype html>\n"+clone.outerHTML],{type:"text/html;charset=utf-8"}),"PROJECT100_"+(document.body.dataset.document||"Guide")+"_v0.3.html");message("The self-contained HTML copy is ready, with image, styles and typed entries included.");
}catch(e){message("HTML download could not finish: "+e.message);}finally{b.disabled=false;}});});
})();
