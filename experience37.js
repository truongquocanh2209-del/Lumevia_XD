'use strict';
/* LUMEVIA 3.7 — on-device onboarding + original learning game.
 * Progressive enhancement. Does not change the exam engine, SRS ratings, or user XP.
 * No remote endpoint, no third-party dependencies and no artificial questions.
 */
(()=>{
  const GUIDE=[
    {icon:'✦',name:'Không gian học tập của bạn',detail:'LUMEVIA giúp bạn lên kế hoạch, tập trung, ghi nhớ và nhìn thấy tiến bộ bằng những dữ liệu bạn tự ghi nhận.',tips:['Dữ liệu được lưu trong trình duyệt hiện tại.','Hãy xuất bản sao lưu định kỳ trong Cài đặt.'],page:'dashboard'},
    {icon:'◷',name:'Tập trung theo nhịp riêng',detail:'Focus Room có đồng hồ, bối cảnh và âm thanh để bạn thực hiện từng phiên học mà không cần mở nhiều công cụ.',tips:['Chọn thời lượng vừa sức.','Bài học chỉ được ghi nhận theo quy tắc của phiên tập trung.'],page:'focus'},
    {icon:'◈',name:'Luyện tập có hệ thống',detail:'Exam Mode giúp chọn bộ câu hỏi, làm bài và xem những câu cần ôn lại. Bảng kiểm tra trước khi nộp giúp bạn tránh bỏ sót.',tips:['Xem kỹ nguồn và đáp án trước khi tạo đề.','Chế độ toàn màn hình không thể thay thế giám sát thi thật.'],page:'exam'},
    {icon:'▤',name:'Ghi nhớ chủ động',detail:'Tạo bộ flashcard từ kiến thức của bạn rồi ôn theo lịch. Trò Ghép cặp tri thức sử dụng chính thẻ đã lưu, không tạo câu hỏi giả.',tips:['Tạo bộ thẻ trước khi bắt đầu chơi.','Chơi ghép cặp không tự tăng XP hoặc thay đổi lịch ôn tập.'],page:'flashcards'},
    {icon:'↗',name:'Luôn giữ một bản sao',detail:'Dùng Tiến trình để theo dõi thói quen học, Cài đặt để đổi màu, giảm chuyển động hoặc xuất và nhập bản sao lưu.',tips:['Có thể mở lại hướng dẫn bất kỳ lúc nào ở Cài đặt.','Không có đồng bộ tài khoản qua máy chủ trong phiên bản này.'],page:'settings'}
  ];
  let guideIndex=0,guideDialog=null,game=null,gameTimer=0,autostartTimer=0;
  const $=selector=>document.querySelector(selector);
  const escape=str=>typeof escapeHtml==='function'?escapeHtml(String(str)):String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const userReady=()=>typeof state!=='undefined'&&!!state&&typeof currentUsername!=='undefined'&&!!currentUsername;
  const activeStrictExam=()=>userReady()&&typeof getActiveExamSession==='function'&&getActiveExamSession()?.status==='IN_PROGRESS'&&getActiveExamSession()?.strictFullscreen;
  function persistGuide(){
    if(!userReady())return false;
    const before=snapshotStudyState();state.settings.guidedTourCompleted=true;
    if(!saveMutationOrRollback(before))return false;
    return true;
  }
  function removeDialog(){if(guideDialog){const node=guideDialog;guideDialog=null;if(node.open)node.close();node.remove();}}
  function closeGuide(markDone=true){
    if(markDone&&!persistGuide())return false;
    removeDialog();return true;
  }
  function paintGuide(){
    if(!guideDialog)return;
    const s=GUIDE[guideIndex];
    guideDialog.innerHTML=`<div class="exp37-inner">
      <div class="exp37-top"><span class="exp37-kicker">LUMEVIA / HƯỚNG DẪN NHANH</span><button type="button" class="button button-ghost button-small" data-exp37="skip-guide" aria-label="Bỏ qua hướng dẫn">Bỏ qua ×</button></div>
      <div class="exp37-steps" aria-label="Tiến độ hướng dẫn">${GUIDE.map((_,i)=>`<span class="exp37-step ${i<=guideIndex?'is-complete':''}" title="Bước ${i+1}"></span>`).join('')}</div>
      <div class="exp37-body"><div class="exp37-visual" aria-hidden="true">${s.icon}</div><h2 id="exp37GuideTitle">${escape(s.name)}</h2><p>${escape(s.detail)}</p><ul class="exp37-points">${s.tips.map(t=>`<li>${escape(t)}</li>`).join('')}</ul></div>
      <div class="exp37-actions"><span class="exp37-counter">Bước ${guideIndex+1} / ${GUIDE.length}</span><div class="exp37-actions-right"><button class="button button-ghost button-small" data-exp37="previous-guide" ${guideIndex?'':'disabled'}>← Trước</button><button class="button button-soft button-small" data-exp37="open-feature">Mở tính năng ↗</button><button class="button button-primary button-small" data-exp37="next-guide">${guideIndex===GUIDE.length-1?'Hoàn thành ✓':'Tiếp theo →'}</button></div></div>
    </div>`;
  }
  function openGuide(force=false){
    if(!userReady()||activeStrictExam()||$('#focusOverlay:not(.hidden)')?.classList.contains('active'))return false;
    if(!force&&state.settings.guidedTourCompleted)return false;
    removeDialog();guideIndex=0;
    guideDialog=document.createElement('dialog');guideDialog.id='experience37Dialog';guideDialog.setAttribute('aria-labelledby','exp37GuideTitle');
    guideDialog.addEventListener('cancel',e=>{e.preventDefault();closeGuide(true);});
    guideDialog.addEventListener('click',event=>{
      const name=event.target.closest('[data-exp37]')?.dataset.exp37;if(!name)return;
      if(name==='skip-guide')closeGuide(true);
      else if(name==='previous-guide'){guideIndex=Math.max(0,guideIndex-1);paintGuide();}
      else if(name==='next-guide'){
        if(guideIndex===GUIDE.length-1){if(closeGuide(true))showToast('Bạn có thể mở lại hướng dẫn trong Cài đặt.','success');}
        else{guideIndex++;paintGuide();}
      }else if(name==='open-feature'){
        const page=GUIDE[guideIndex].page;
        if(closeGuide(true))navigate(page);
      }
    });
    document.body.append(guideDialog);paintGuide();
    try{guideDialog.showModal();}catch(err){removeDialog();console.warn('Không thể mở hướng dẫn:',err);return false;}
    return true;
  }
  function maybeOpenGuide(){
    if(userReady()&&!state.settings.guidedTourCompleted&&!$('#experience37Dialog')&&!activeStrictExam())openGuide(false);
  }
  // Preserve the existing app's authentication and routing behavior.
  if(typeof enterApp==='function'){
    const originalEnter=enterApp;
    enterApp=async function(...args){const result=await originalEnter.apply(this,args);clearTimeout(autostartTimer);autostartTimer=setTimeout(maybeOpenGuide,400);return result;};
  }
  // Remembered sessions can finish loading before or while this extension runs.
  autostartTimer=setTimeout(maybeOpenGuide,1000);
  if(typeof logout==='function'){
    const originalLogout=logout;
    logout=function(...args){const result=originalLogout.apply(this,args);if(!userReady())removeDialog();stopGame();return result;};
  }
  if(typeof renderSettings==='function'){
    const originalSettings=renderSettings;
    renderSettings=function(...args){const html=originalSettings.apply(this,args);return `<section class="surface surface-pad exp37-guide-card"><div><p class="eyebrow">LUMEVIA / HỖ TRỢ</p><h2>Hướng dẫn sử dụng</h2><p>5 bước ngắn để làm quen với các công cụ, cách lưu dữ liệu và quy tắc bài kiểm tra.</p></div><button type="button" class="button button-soft button-small" data-exp37="open-guide">Xem lại hướng dẫn ↗</button></section>`+html;};
  }
  function eligiblePairs(){
    if(!userReady())return [];
    const observed=new Set(),result=[];
    for(const card of state.flashcards||[]){
      const front=String(card?.front||'').trim(),back=String(card?.back||'').trim();
      if(!front||!back||front===back||front.length>220||back.length>220)continue;
      const f=front.normalize('NFC').toLocaleLowerCase('vi'),b=back.normalize('NFC').toLocaleLowerCase('vi');
      if(observed.has(f)||observed.has(b)||f===b)continue;
      result.push({front,back});observed.add(f);observed.add(b);
    }
    return result;
  }
  function shuffle(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
  function gameMarkup(){
    const possible=eligiblePairs().length;
    return `<section class="exp37-game-card" id="exp37Game" aria-label="Trò ghép cặp tri thức"><div class="exp37-game-head"><div><p class="eyebrow">ORIGINAL / LEARN & PLAY</p><h2>✦ Ghép cặp tri thức</h2><p>Lật các ô, tìm cặp mặt trước và mặt sau tương ứng từ flashcard của chính bạn. Mỗi lượt chơi chọn tối đa 6 cặp, không sử dụng nội dung mẫu.</p></div><span class="pill pill-cyan">${possible} cặp khả dụng</span></div>
      <div class="exp37-game-actions"><button type="button" class="button button-primary button-small" data-exp37="start-game" ${possible>=3?'':'disabled'}>↻ ${possible>=3?'Bắt đầu lượt mới':'Cần tối thiểu 3 thẻ'}</button><button type="button" class="button button-ghost button-small" data-action="navigate" data-page="flashcards">Quản lý flashcard ↗</button></div>
      <div class="exp37-game-status" id="exp37GameStatus" aria-live="polite">${possible>=3?'Chọn Bắt đầu lượt mới để lật ô và ghép cặp.':'Chưa có đủ 3 cặp nội dung khác nhau. Hãy tạo thêm thẻ trước khi chơi.'}</div>
      <div class="exp37-grid" id="exp37Grid" aria-label="Lưới thẻ ghép cặp"></div>
      <div class="exp37-result" id="exp37Result" hidden aria-live="polite"></div><p class="exp37-meta-note">Câu trả lời và tiến độ SRS không bị thay đổi khi chơi; trò chơi này không phát XP để tránh lặp phần thưởng.</p></section>`;
  }
  if(typeof renderPlay==='function'){
    const originalPlay=renderPlay;
    renderPlay=function(...args){return originalPlay.apply(this,args).replace('<div class="section-heading"><div><h2>Trò chơi học tập ngắn', gameMarkup()+'<div class="section-heading"><div><h2>Trò chơi học tập ngắn');};
  }
  function stopGame(){if(gameTimer){clearTimeout(gameTimer);gameTimer=0;}game=null;}
  function gameStatus(){
    const node=$('#exp37GameStatus');if(!node||!game)return;
    node.innerHTML=`<span class="exp37-stat">Đã ghép <b>${game.matched}/${game.pairs.length}</b></span><span class="exp37-stat">Lượt mở <b>${game.moves}</b></span><span class="exp37-stat">Sai <b>${game.mistakes}</b></span>`;
  }
  function startGame(){
    const pairs=shuffle(eligiblePairs()).slice(0,6);
    if(pairs.length<3){showToast('Hãy tạo ít nhất 3 flashcard với nội dung khác nhau.','warning');return;}
    stopGame();
    const cards=shuffle(pairs.flatMap((p,i)=>[{pair:i,face:'front',value:p.front},{pair:i,face:'back',value:p.back}]));
    game={pairs,cards,opened:[],matched:0,moves:0,mistakes:0,locked:false};
    const board=$('#exp37Grid');if(!board)return;
    board.innerHTML=cards.map((_,i)=>`<button type="button" class="exp37-tile is-hidden-answer" data-exp37="flip-tile" data-index="${i}" aria-label="Ô số ${i+1}, chưa lật" aria-pressed="false">✦</button>`).join('');
    const result=$('#exp37Result');if(result){result.hidden=true;result.textContent='';}
    gameStatus();board.querySelector('button')?.focus({preventScroll:true});
  }
  function paintTile(index,mode){
    const tile=$(`#exp37Grid [data-index="${index}"]`);if(!tile||!game)return;
    const item=game.cards[index];
    if(mode==='hidden'){
      tile.className='exp37-tile is-hidden-answer';tile.textContent='✦';tile.setAttribute('aria-label',`Ô số ${index+1}, chưa lật`);tile.setAttribute('aria-pressed','false');
    }else{
      tile.className=`exp37-tile ${mode==='matched'?'is-matched':'is-visible'}`;
      tile.innerHTML=`<span>${escape(item.value)}<small>${mode==='matched'?'Đã ghép':item.face==='front'?'Mặt trước':'Mặt sau'}</small></span>`;
      tile.setAttribute('aria-pressed','true');tile.setAttribute('aria-label',`${mode==='matched'?'Đã ghép':'Đã lật'}: ${item.value}`);
      tile.disabled=mode==='matched';
    }
  }
  function flipTile(index){
    const g=game;
    if(!g||g.locked||!Number.isInteger(index)||index<0||index>=g.cards.length||g.opened.includes(index))return;
    const tile=$(`#exp37Grid [data-index="${index}"]`);if(!tile||tile.disabled||tile.classList.contains('is-matched'))return;
    g.opened.push(index);paintTile(index,'open');
    if(g.opened.length===2){
      g.moves++;
      const [a,b]=g.opened,matched=g.cards[a].pair===g.cards[b].pair;
      if(matched){paintTile(a,'matched');paintTile(b,'matched');g.matched++;g.opened=[];
        if(g.matched===g.pairs.length){
          const result=$('#exp37Result');if(result){result.hidden=false;result.textContent=`Hoàn thành ${g.matched} cặp trong ${g.moves} lượt, ${g.mistakes} lần ghép chưa đúng. Bạn có thể chơi lại hoặc mở bộ thẻ để ôn chủ động.`;}
          showToast('Đã ghép xong tất cả cặp kiến thức!','success');
        }
      }else{
        g.mistakes++;g.locked=true;
        gameTimer=setTimeout(()=>{gameTimer=0;if(game!==g)return;paintTile(a,'hidden');paintTile(b,'hidden');g.opened=[];g.locked=false;},850);
      }
      gameStatus();
    }
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-exp37]');if(!button)return;
    if(button.disabled)return;
    const action=button.dataset.exp37;
    if(action==='open-guide')openGuide(true);
    if(action==='start-game')startGame();
    if(action==='flip-tile')flipTile(Number(button.dataset.index));
  });
  // A new page render replaces the game board; clear timers and stale references.
  if(typeof renderPage==='function'){
    const originalRender=renderPage;
    renderPage=function(...args){stopGame();return originalRender.apply(this,args);};
  }
  // Keep the app accessible if this optional extension is unavailable.
  window.Lumevia37={openGuide,eligiblePairs};
})();
