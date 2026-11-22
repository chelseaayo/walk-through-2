// StudyMate interactivity layer: loads AFTER script.js, no changes to it needed.
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s);
const click=s=>$(s+':not(:disabled)')?.click();
let bypass=false,lastAction=null;

// 1) "Thinking" animation before Ask & Check answers
document.addEventListener('submit',e=>{
  const f=e.target;
  if(f.id!=='ask-form'||bypass)return;
  const input=$('#ask-input');
  if(!input||!input.value.trim())return;           // let the original handler show its message
  e.stopImmediatePropagation();e.preventDefault();
  if(f.dataset.busy)return;
  f.dataset.busy='1';
  f.querySelector('[type=submit]').disabled=true;
  $('.answer-box,.no-answer')?.remove();
  const t=document.createElement('div');
  t.className='typing';t.setAttribute('role','status');t.setAttribute('aria-label','StudyMate is thinking');
  t.innerHTML='<i></i><i></i><i></i>';
  f.after(t);
  setTimeout(()=>{bypass=true;f.requestSubmit();bypass=false},750);
},true);

// 2) Remember what opened a modal, return focus when it closes
document.addEventListener('click',e=>{
  if($('#modal-root').children.length)return;
  const b=e.target.closest('button[data-action]');
  lastAction=b?b.dataset.action:null;
},true);
new MutationObserver(()=>{
  if(!$('#modal-root').children.length&&lastAction){
    $(`button[data-action="${lastAction}"]`)?.focus();lastAction=null;
  }
}).observe($('#modal-root'),{childList:true});

// 3) Keyboard shortcuts
document.addEventListener('keydown',e=>{
  const tag=(e.target.tagName||'').toLowerCase(),k=e.key.toLowerCase();
  if(k==='enter'&&(e.ctrlKey||e.metaKey)&&e.target.id==='ask-input'){
    e.preventDefault();$('#ask-form')?.requestSubmit();return;
  }
  if(['input','textarea','select'].includes(tag)||e.ctrlKey||e.metaKey||e.altKey||$('#modal-root').children.length)return;
  if(k==='/'&&$('#ask-input')){e.preventDefault();$('#ask-input').focus();return;}
  const opts=document.querySelectorAll('.answer-option');
  if(!$('.quiz-top'))return;
  const submit=$('button[data-action=submit-answer]'),next=$('button[data-action=next-question]');
  if(submit){                                       // question phase
    const isTF=opts.length===2&&opts[0].textContent.includes('True');
    const n=isTF?(k==='t'?0:k==='f'?1:-1):(/^[1-9]$/.test(k)?+k-1:-1);
    if(n>=0&&opts[n]){opts[n].click();return;}
    if(k==='h'){click('button[data-action=hint]');return;}
    if(k==='enter'&&tag!=='button'&&!submit.disabled){submit.click();}
  }else if(next||$('.self-review')){                // feedback phase
    if(k==='y'){click('button[data-result=correct]');return;}
    if(k==='r'){click('button[data-result=review]');return;}
    if((k==='enter'&&tag!=='button')||k==='n')click('button[data-action=next-question]');
  }
});

// 4) Shortcut badges + sidebar tip, re-applied whenever the view re-renders
function decorate(){
  const opts=document.querySelectorAll('.answer-option');
  const isTF=opts.length===2&&opts[0].textContent.includes('True');
  opts.forEach((o,i)=>{
    if(o.querySelector('.kbd'))return;
    const s=document.createElement('span');s.className='kbd';s.textContent=isTF?(i?'F':'T'):i+1;o.append(s);
  });
  const ul=$('.quiz-top')&&$('.side-column .info-panel ul');
  if(ul&&!ul.querySelector('[data-sc]')){
    const li=document.createElement('li');li.dataset.sc='1';
    li.innerHTML='Shortcuts: <span class="kbd">1–4</span> / <span class="kbd">T</span><span class="kbd">F</span> choose, <span class="kbd">H</span> hint, <span class="kbd">Enter</span> continue';
    ul.append(li);
  }
}
new MutationObserver(decorate).observe($('#view'),{childList:true,subtree:true});
decorate();
})();
