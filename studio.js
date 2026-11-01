'use strict';
/* LUMEVIA 2.5: user-owned room layouts and long-exam navigation. */
const STUDIO_SOUND_KEYS=['rain','wind','ocean','white','brown','pink','stream','fire','night','bowl','train','fan','underwater','chimes'];
let studioApplyGeneration=0,studioExamFilter='all',studioExamSession='',studioPendingSounds=null;
function studioTextSettings(value=state?.settings?.focusText){return {title:value?.title!==false,labels:value?.labels!==false,quote:value?.quote!==false};}
function studioCleanRoom(value){
  if(!value||typeof value!=='object'||typeof value.id!=='string'||typeof value.name!=='string'||!value.name.trim())return null;
  const p=value.appearance||{},num=(n,d,min,max)=>Number.isFinite(n)?Math.max(min,Math.min(max,n)):d;
  return {id:value.id.slice(0,120),name:value.name.trim().slice(0,50),theme:FOCUS_THEMES.some(t=>t.id===value.theme)?value.theme:'forest',
    appearance:{blur:num(p.blur,0,0,24),brightness:num(p.brightness,1,.4,1.4),dim:num(p.dim,-.01,-.01,.8),panel:num(p.panel,.88,.4,1),view:['normal','minimal','clock','quiet'].includes(p.view)?p.view:'normal',clock:['ring','digital','compact'].includes(p.clock)?p.clock:'digital'},
    text:studioTextSettings(value.text),visual:['none','aurora','rain','stars','breath','fireflies','fog','snow'].includes(value.visual)?value.visual:'none',strength:num(value.strength,.6,0,1),cinema:value.cinema===true,locked:value.locked===true,
    position:Number.isFinite(value.position?.x)&&Number.isFinite(value.position?.y)?{x:num(value.position.x,.5,0,1),y:num(value.position.y,.5,0,1)}:null,
    photo:typeof value.photo?.id==='string'&&typeof value.photo?.name==='string'?{id:value.photo.id.slice(0,120),name:value.photo.name.slice(0,60)}:null,
    sounds:Object.fromEntries(Object.entries(value.sounds&&typeof value.sounds==='object'?value.sounds:{}).filter(([k,v])=>STUDIO_SOUND_KEYS.includes(k)&&Number.isFinite(v)&&v>0&&v<=.3))};
}
function studioRooms(){const rooms=state?.settings?.workspacePresets;return (Array.isArray(rooms)?rooms:[]).map(studioCleanRoom).filter(Boolean).slice(0,12);}
function studioCaptureRoom(name){return studioCleanRoom({id:makeId('room'),name,theme:state.settings.focusTheme,appearance:focusAppearance(),text:studioTextSettings(),visual:state.settings.focusVisual,strength:state.settings.visualStrength,cinema:state.settings.cinemaBars,locked:state.settings.clockLocked,position:state.settings.clockPosition,photo:state.settings.personalBackground,sounds:Object.fromEntries([...ambientSources].map(([k,s])=>[k,s.volume]))});}
function applyStudioSettings(){
  const overlay=$('#focusOverlay');if(!overlay||!state)return;const text=studioTextSettings();
  overlay.classList.toggle('studio-hide-title',!text.title);overlay.classList.toggle('studio-hide-labels',!text.labels);overlay.classList.toggle('studio-hide-quote',!text.quote);
  $$('[data-studio-text]').forEach(input=>input.checked=text[input.dataset.studioText]);
  const quick=$('#studioQuickText');if(quick){const hidden=!text.title&&!text.labels&&!text.quote;quick.textContent=hidden?'◉ Hiện chữ':'◌ Ẩn chữ';quick.setAttribute('aria-pressed',String(hidden));}
  positionNextClock();
}
function studioTextMarkup(){const t=studioTextSettings();return `<div class="studio-text-options"><p>Chọn phần chữ bạn muốn giữ. Đồng hồ và nút điều khiển vẫn sử dụng được.</p>${[['title','Dòng tiêu đề lớn'],['labels','Nhãn chế độ và bối cảnh'],['quote','Câu nhắc dưới đồng hồ']].map(([key,label])=>`<label><input type="checkbox" data-studio-text="${key}" ${t[key]?'checked':''}><span>${label}</span></label>`).join('')}<div class="studio-mode-buttons"><button class="button button-soft button-small" data-studio="text-hide" type="button">Chỉ giữ đồng hồ</button><button class="button button-soft button-small" data-studio="text-show" type="button">Hiện đầy đủ chữ</button></div></div>`;}
function studioPresetMarkup(){const rooms=studioRooms();return `<div class="studio-room-presets" data-studio-presets><p>Lưu nền, chữ, vị trí đồng hồ, hiệu ứng và âm thanh đang bật. Tối đa 12 không gian trên tài khoản này.</p><label>Tên không gian<input class="field" data-studio-name maxlength="50" placeholder="Góc học buổi tối"></label><button type="button" class="button button-soft" data-studio="save-room">＋ Lưu không gian hiện tại</button><div class="studio-room-list">${rooms.map(p=>`<article><div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.photo?.name||getFocusTheme(p.theme).name)} · ${Object.keys(p.sounds).length} lớp âm</small></div><div class="studio-room-actions"><button type="button" class="button button-soft button-small" data-studio="apply-room" data-id="${escapeHtml(p.id)}">Dùng</button><button type="button" class="icon-button" aria-label="Xóa cấu hình ${escapeHtml(p.name)}" data-studio="delete-room" data-id="${escapeHtml(p.id)}">×</button></div></article>`).join('')||'<p class="form-hint">Chưa lưu không gian nào.</p>'}</div><small>Ảnh riêng cần còn trong kho ảnh của thiết bị. Cấu hình không thay thời lượng hoặc tiến độ phiên học.</small></div>`;}
function studioToolsMarkup(){return `<details class="next-studio-section" open><summary>Chữ trong phòng</summary>${studioTextMarkup()}</details><details class="next-studio-section"><summary>Không gian đã lưu</summary>${studioPresetMarkup()}</details>`;}
function refreshStudioPresets(){
  $$('[data-studio-presets]').forEach(node=>node.outerHTML=studioPresetMarkup());
}
async function applyStudioRoom(id){
  const room=studioRooms().find(p=>p.id===id);if(!room)return;const owner=currentUsername,generation=++studioApplyGeneration;
  const patch={focusTheme:room.theme,focusAppearance:{...focusAppearance(),...room.appearance},focusText:room.text,clockPosition:room.position,clockLocked:room.locked,focusVisual:room.visual,visualStrength:room.strength,cinemaBars:room.cinema,personalBackground:room.photo};
  if(!aevoraSettings(patch))return;studioPendingSounds=null;stopAmbientSounds();const soundGeneration=ambientGeneration;clearNextPhoto();applyFocusAppearance(room.theme);await restoreNextPhoto();
  if(generation!==studioApplyGeneration||owner!==currentUsername)return;
  if(!focusStarted&&soundGeneration===ambientGeneration)studioPendingSounds={owner,sounds:room.sounds};
  if(focusStarted&&soundGeneration===ambientGeneration)for(const [key,volume] of Object.entries(room.sounds)){if(soundGeneration!==ambientGeneration||generation!==studioApplyGeneration)return;await setAmbientVolume(key,volume);}
  if(generation!==studioApplyGeneration||owner!==currentUsername)return;
  const preview=$('.focus-preview-card');if(preview)preview.dataset.focusTheme=room.theme;updateFocusPhotoPreviews();paintNextGalleries();
  if(focusStarted&&!saveFocusSession())showToast('Không gian đã đổi, nhưng chưa ghi nhớ được cảnh cho phiên khôi phục.','warning');
  renderFocusAppearanceStudio();applyStudioSettings();showToast(`Đã áp dụng “${room.name}”.${!focusStarted&&Object.keys(room.sounds).length?' Âm thanh sẽ phát khi bắt đầu phiên.':''}`,'success');
}
function studioAnswered(session,q){const response=session.responses?.[q.id];return Array.isArray(response)?response.length>0:typeof response==='string'?response.trim().length>0:Number.isInteger(response);}
function studioQuestionIndexes(session,filter){return session.questions.map((q,i)=>({q,i})).filter(({q})=>filter==='unanswered'?!studioAnswered(session,q):filter==='marked'?(session.markedForReview||[]).includes(q.id):true).map(x=>x.i);}
function studioNextUnanswered(session){const total=session.questions.length;for(let step=1;step<=total;step++){const i=((Number(session.currentIndex)||0)+step)%total;if(!studioAnswered(session,session.questions[i]))return i;}return -1;}
function refreshStudioExamMap(){
  const session=getActiveExamSession();if(!session||!$('#studioExamMapTools'))return;const visible=new Set(studioQuestionIndexes(session,studioExamFilter));
  $$('.exam-number-grid .exam-number').forEach(b=>b.hidden=!visible.has(Number(b.dataset.index)));
  $('#studioExamMapStatus').textContent=`${visible.size}/${session.questions.length} câu trong bộ lọc`;
}
function mountStudioExamMap(){
  const session=getActiveExamSession(),map=$('.exam-question-map');if(!session||!map)return;
  // The 3.2 native navigator already supplies filtering and unanswered navigation.
  if(map.querySelector('.exam-map-tabs'))return;
  if(studioExamSession!==session.id){studioExamSession=session.id;studioExamFilter='all';}
  map.querySelector('.exam-number-grid').insertAdjacentHTML('beforebegin',`<div class="studio-exam-tools" id="studioExamMapTools"><label for="studioExamFilter">Hiển thị câu<select class="select-field" id="studioExamFilter">${[['all','Tất cả'],['unanswered','Chưa làm'],['marked','Đã đánh dấu']].map(([v,t])=>`<option value="${v}" ${v===studioExamFilter?'selected':''}>${t}</option>`).join('')}</select></label><form id="studioExamJump"><label for="studioExamNumber">Đến câu<input class="field" id="studioExamNumber" type="number" min="1" max="${session.questions.length}" value="${session.currentIndex+1}" required></label><button class="button button-soft button-small" type="submit">Đi</button></form><button class="button button-soft button-small" type="button" data-studio="next-unanswered">Câu chưa làm kế tiếp →</button><p id="studioExamMapStatus" role="status"></p></div>`);
  refreshStudioExamMap();
}
function enhanceStudioPage(page){
  if(page==='focus'){
    $('.focus-studio-grid')?.insertAdjacentHTML('beforebegin',`<section class="surface studio-lobby"><div class="studio-lobby-heading"><p class="eyebrow">KHÔNG GIAN THEO CÁCH CỦA BẠN</p><h2>Giữ lại điều giúp bạn tập trung.</h2><p>Ẩn phần chữ không cần thiết, lưu góc học yêu thích và mở lại cho phiên sau.</p></div><div class="studio-lobby-columns"><section><h3>Hiển thị trong phòng</h3>${studioTextMarkup()}</section><section><h3>Bộ sưu tập không gian</h3>${studioPresetMarkup()}</section></div></section>`);
    applyStudioSettings();
  }
  if(page==='exam')mountStudioExamMap();
}
document.addEventListener('DOMContentLoaded',()=>{
  const b=document.createElement('button');b.id='studioQuickText';b.type='button';b.className='button studio-quick-text';b.dataset.studio='toggle-text';b.textContent='◌ Ẩn chữ';b.setAttribute('aria-label','Ẩn hoặc hiện tiêu đề, nhãn và câu nhắc trong phòng');$('#focusOverlay').append(b);
});
document.addEventListener('change',e=>{
  const t=e.target;if(t.dataset.studioText&&state){const key=t.dataset.studioText;if(['title','labels','quote'].includes(key)&&aevoraSettings({focusText:{...studioTextSettings(),[key]:t.checked}}))applyStudioSettings();else applyStudioSettings();}
  if(t.id==='studioExamFilter'){studioExamFilter=['all','unanswered','marked'].includes(t.value)?t.value:'all';refreshStudioExamMap();}
});
document.addEventListener('submit',e=>{if(e.target.id!=='studioExamJump')return;e.preventDefault();const s=getActiveExamSession(),n=Number($('#studioExamNumber').value);if(!s||!Number.isInteger(n)||n<1||n>s.questions.length)return showToast('Nhập số câu nằm trong bài thi.','info');jumpExamQuestion(n-1);});
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-studio]');if(!b||!state)return;const action=b.dataset.studio;
  try{
    if(['toggle-text','text-hide','text-show'].includes(action)){
      const old=studioTextSettings(),show=action==='text-show'||action==='toggle-text'&&!Object.values(old).some(Boolean);
      if(aevoraSettings({focusText:{title:show,labels:show,quote:show},focusAppearance:{...focusAppearance(),view:'normal'}})){applyFocusAppearance();applyStudioSettings();}
    }
    if(action==='save-room'){
      const input=b.closest('[data-studio-presets]').querySelector('[data-studio-name]'),name=input.value.trim(),rooms=studioRooms();
      if(!name)return showToast('Đặt tên cho không gian trước khi lưu.','info');if(rooms.length>=12)return showToast('Đã có 12 không gian. Xóa một cấu hình để lưu thêm.','info');
      if(rooms.some(p=>p.name.toLocaleLowerCase('vi')===name.toLocaleLowerCase('vi')))return showToast('Tên này đã có. Hãy dùng tên khác để dễ phân biệt.','info');
      const room=studioCaptureRoom(name);if(room&&aevoraSettings({workspacePresets:[...rooms,room]})){refreshStudioPresets();showToast('Đã lưu không gian, gồm các lớp âm thanh đang bật.','success');}
    }
    if(action==='apply-room'){b.disabled=true;try{await applyStudioRoom(b.dataset.id);}finally{if(b.isConnected)b.disabled=false;}}
    if(action==='delete-room'){
      const room=studioRooms().find(r=>r.id===b.dataset.id),owner=currentUsername;if(!room)return;
      requestConfirmation({title:'Xóa cấu hình không gian?',message:`Xóa “${room.name}” khỏi danh sách cấu hình. Ảnh gốc và dữ liệu học tập vẫn được giữ.`,confirmLabel:'Xóa cấu hình',cancelLabel:'Giữ lại',danger:true},()=>{if(owner===currentUsername&&aevoraSettings({workspacePresets:studioRooms().filter(r=>r.id!==room.id)}))refreshStudioPresets();});
    }
    if(action==='next-unanswered'){const session=getActiveExamSession();if(!session)return;const index=studioNextUnanswered(session);if(index<0)return showToast('Bạn đã trả lời tất cả câu hỏi. Có thể rà lại các câu đánh dấu.','success');jumpExamQuestion(index);}
  }catch{showToast('Chưa hoàn tất thao tác. Dữ liệu đã lưu vẫn được giữ; hãy thử lại.','error');}
});

async function playStudioPendingSounds(){
  const pending=studioPendingSounds;studioPendingSounds=null;
  if(!pending||pending.owner!==currentUsername||!focusStarted)return;
  await nextPlayMix(pending.sounds);
}
