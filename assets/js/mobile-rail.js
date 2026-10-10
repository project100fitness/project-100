/* Mobile-only rail drawer; reuse the existing links without changing desktop navigation. */
(function(){
 'use strict';
 var layout=document.querySelector('body[data-site="protocol"] .layout--rail'),rail=layout&&layout.querySelector('.rail');
 if(!rail||typeof HTMLDialogElement==='undefined')return;
 var mobile=window.matchMedia('(max-width:719px),(max-width:1023px) and (pointer:coarse)');
 var title=rail.querySelector('.rail__title'),list=rail.querySelector('.rail__list');if(!list)return;
 var category=document.querySelector('.tabs a[aria-current="page"]');
 var name=category?category.textContent.trim():(title?title.textContent.trim():'Overview');
 if(/^on this page$|^sections$/i.test(name))name='Overview';
 var active=list.querySelector('[aria-current="page"]');
 var button=document.createElement('button');button.type='button';button.className='rail-toggle';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','mobile-sections');button.setAttribute('aria-expanded','false');
 var label=document.createElement('span');label.className='rail-toggle__category';label.textContent='☰ '+name;
 var current=document.createElement('span');current.className='rail-toggle__current';current.textContent=active?(active.querySelector('.rail__label')||active).textContent.trim():'';if(current.textContent===name)current.textContent='';
 var chevron=document.createElement('span');chevron.className='rail-toggle__chevron';chevron.textContent='▾';chevron.setAttribute('aria-hidden','true');
 button.append(label,current,chevron);
 var dialog=document.createElement('dialog');dialog.id='mobile-sections';dialog.className='rail-drawer';dialog.setAttribute('aria-labelledby','mobile-sections-title');
 var head=document.createElement('div');head.className='rail-drawer__head';
 var heading=document.createElement('h2');heading.id='mobile-sections-title';heading.textContent=name;
 var close=document.createElement('button');close.type='button';close.className='rail-drawer__close';close.textContent='×';close.setAttribute('aria-label','Close sections');
 head.append(heading,close);
 var body=document.createElement('div');body.className='rail-drawer__body';var links=list.cloneNode(true);links.removeAttribute('id');links.querySelectorAll('[id]').forEach(function(e){e.removeAttribute('id');});body.appendChild(links);dialog.append(head,body);
 document.body.appendChild(dialog);layout.insertBefore(button,rail);
 var space=document.createElement('div');space.className='rail-toggle-space';space.setAttribute('aria-hidden','true');layout.insertBefore(space,rail);
 layout.classList.add('has-mobile-rail');
 var siteHead=document.getElementById('siteHead');
 function syncTop(){
  var top=siteHead&&siteHead.getAttribute('data-hidden')!=='true'?siteHead.getBoundingClientRect().height:0;
  document.documentElement.style.setProperty('--mobile-rail-top',Math.max(0,top)+'px');
 }
 syncTop();window.addEventListener('resize',syncTop);
 if(siteHead&&window.MutationObserver)new MutationObserver(syncTop).observe(siteHead,{attributes:true,attributeFilter:['data-hidden']});
 if(siteHead&&window.ResizeObserver)new ResizeObserver(syncTop).observe(siteHead);
 var restore=false;
 function shut(focus){restore=focus;if(dialog.open)dialog.close();}
 button.addEventListener('click',function(){if(!mobile.matches)return;if(dialog.open){shut(true);return;}dialog.showModal();button.setAttribute('aria-expanded','true');var selected=links.querySelector('[aria-current="page"]')||links.querySelector('a');if(selected)selected.focus({preventScroll:true});});
 close.addEventListener('click',function(){shut(true);});
 dialog.addEventListener('click',function(e){if(e.target===dialog){var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)shut(true);}if(e.target.closest('a'))shut(false);});
 dialog.addEventListener('cancel',function(){restore=true;});
 dialog.addEventListener('close',function(){button.setAttribute('aria-expanded','false');if(restore&&mobile.matches)button.focus({preventScroll:true});restore=false;});
 mobile.addEventListener('change',function(){if(!mobile.matches)shut(false);});
})();
