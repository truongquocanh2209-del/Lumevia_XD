'use strict';
/* Progressive enhancement only: the site works if motion is unsupported. */
(()=>{
  const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.classList.contains('reduce-motion');
  let lastPage='',pointerFrame=0;
  function mount(){
    const page=document.querySelector('#pageContent');if(!page)return;
    const newPage=page.querySelector('.page-heading h1,.exam-live-shell,.exam-result-v32')?.textContent?.trim().slice(0,90)||'';
    if(newPage!==lastPage){lastPage=newPage;page.classList.remove('v32-page-enter');if(!reduced())requestAnimationFrame(()=>{page.classList.add('v32-page-enter');});}
    const cards=page.querySelectorAll('.dashboard-hero,.dashboard-card,.quiz-card,.review-metric,.exam-preset-card,.stats-card,.study-card');
    cards.forEach(card=>{if(card.classList.contains('v32-interactive-card'))return;card.classList.add('v32-interactive-card');});
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const page=document.querySelector('#pageContent');if(!page)return;
    const observer=new MutationObserver(()=>{mount();});observer.observe(page,{childList:true,subtree:false});mount();
  });
  document.addEventListener('pointermove',event=>{
    if(reduced()||event.pointerType==='touch'||pointerFrame)return;
    const card=event.target.closest?.('.v32-interactive-card');if(!card)return;
    pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;if(!card.isConnected)return;const r=card.getBoundingClientRect();card.style.setProperty('--card-mx',`${event.clientX-r.left}px`);card.style.setProperty('--card-my',`${event.clientY-r.top}px`);});
  },{passive:true});
  document.addEventListener('pointerdown',event=>{
    if(reduced()||event.button!==0)return;
    const button=event.target.closest?.('#appShell .button');if(!button||button.disabled||!button.isConnected)return;
    const rect=button.getBoundingClientRect(),ripple=document.createElement('span');ripple.className='v32-ripple';ripple.style.left=`${event.clientX-rect.left}px`;ripple.style.top=`${event.clientY-rect.top}px`;button.append(ripple);ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
  },{passive:true});
})();
