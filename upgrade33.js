'use strict';
/* LUMEVIA 3.3 — progressive enhancements. No external services or tracking. */
(()=>{
  const safeNumber=value=>Number.isFinite(Number(value))?Number(value):0;
  const pct=(value,total)=>total?Math.round(value/total*100):0;
  const validDate=(date)=>/^\d{4}-\d{2}-\d{2}$/.test(String(date||''));
  const localDay=(date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  const localOffset=(offset)=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return localDay(d);};
  const fmt=new Intl.NumberFormat('vi-VN');
  function snapshot(){
    if(typeof state==='undefined'||!state)return null;
    const now=Date.now(),today=localOffset(0),yesterday=localOffset(-1);
    const tasks=Array.isArray(state.tasks)?state.tasks:[];
    const completed=Array.isArray(state.completedTasks)?state.completedTasks:[];
    const waiting=tasks.filter(t=>t&&validDate(t.date)&&t.date<=today&&!t.done);
    const todayItems=tasks.filter(t=>t?.date===today&&!t.done);
    const doneToday=completed.filter(t=>t?.date===today||t?.completedAt&&localDay(new Date(t.completedAt))===today).length;
    const due=(state.flashcards||[]).filter(c=>c&&(!safeNumber(c.dueAt)||safeNumber(c.dueAt)<=now)).length;
    const running=(state.examSessions||[]).filter(s=>s?.status==='IN_PROGRESS'&&safeNumber(s.deadlineAt)>now);
    const attempts=(state.attempts||[]).filter(a=>a&&safeNumber(a.createdAt)>=now-30*86400000);
    const totalAttempted=attempts.reduce((n,a)=>n+Math.max(0,safeNumber(a.total)),0);
    const totalCorrect=attempts.reduce((n,a)=>n+Math.max(0,safeNumber(a.score)),0);
    const days=Array.from({length:7},(_,i)=>localOffset(i-6));
    const minutesByDay=new Map(days.map(d=>[d,0]));
    for(const s of state.sessions||[]){if(s&&minutesByDay.has(s.date))minutesByDay.set(s.date,minutesByDay.get(s.date)+Math.max(0,safeNumber(s.minutes)));}
    const week=days.map(d=>({day:d,minutes:minutesByDay.get(d)}));
    const previous=Array.from({length:7},(_,i)=>localOffset(i-13));
    const previousMinutes=(state.sessions||[]).reduce((n,s)=>s&&previous.includes(s.date)?n+Math.max(0,safeNumber(s.minutes)):n,0);
    return {today,yesterday,waiting,todayItems,doneToday,due,running,attempts,totalAttempted,totalCorrect,week,previousMinutes};
  }
  function nextStep(s){
    const overdue=s.waiting.filter(t=>t.date<s.today);
    if(overdue.length)return {badge:'ƯU TIÊN',title:`${overdue.length} việc đã quá hạn`,detail:'Kiểm tra các việc chưa hoàn thành để sắp xếp lại kế hoạch.',page:'planner',cta:'Xem việc cần xử lý',symbol:'⌛'};
    if(s.running.length)return {badge:'ĐANG DIỄN RA',title:'Có phiên thi chưa kết thúc',detail:'Bài thi đang có thời hạn. Hãy kiểm tra trạng thái trước khi tiếp tục.',page:'exam',cta:'Mở Exam Mode',symbol:'◈'};
    if(s.todayItems.length){const task=s.todayItems.find(t=>t.priority==='Cao')||s.todayItems[0];return {badge:'VIỆC TIẾP THEO',title:String(task.title||'Công việc hôm nay'),detail:'Đưa một việc quan trọng lên trước thay vì cố làm mọi thứ.',page:'planner',cta:'Mở kế hoạch',symbol:'▦'};}
    if(s.due)return {badge:'ĐẾN HẠN ÔN',title:`${fmt.format(s.due)} flashcard cần ôn`,detail:'Ghi nhớ chủ động theo lịch ôn đã lưu trên thiết bị.',page:'flashcards',cta:'Mở Flashcards',symbol:'▤'};
    return {badge:'KHỞI ĐỘNG',title:'Bắt đầu một phiên tập trung',detail:'Chọn mục tiêu nhỏ và dành thời gian học có chủ đích.',page:'focus',cta:'Vào Focus Room',symbol:'◷'};
  }
  function makeDashboard(s){
    const next=nextStep(s),top=fmt.format(s.week.reduce((n,v)=>n+v.minutes,0)),max=Math.max(30,...s.week.map(x=>x.minutes));
    const trend=s.totalAttempted?pct(s.totalCorrect,s.totalAttempted)+'%':'—';
    return `<details class="v33-journey" id="v33StudyCompass" ${state.settings?.studyCompassExpanded===false?'':'open'}><summary class="v33-journey-header"><div><span class="v33-eyebrow">YOUR STUDY COMPASS · 3.4</span><h2>Học đúng việc. Đúng thời điểm.</h2><p>Gợi ý từ công việc và kết quả thật được lưu trên thiết bị của bạn.</p></div><span class="v33-compass-mark" aria-hidden="true">✧</span></summary><div class="v33-journey-grid"><article class="v33-priority"><span class="v33-chip"><span class="v33-live-dot" aria-hidden="true"></span>${escapeHtml(next.badge)}</span><div class="v33-priority-icon" aria-hidden="true">${next.symbol}</div><h3>${escapeHtml(next.title)}</h3><p>${escapeHtml(next.detail)}</p><button class="v33-cta" data-action="navigate" data-page="${next.page}">${escapeHtml(next.cta)} <span aria-hidden="true">↗</span></button></article><div class="v33-journey-side"><div class="v33-pulse-grid"><div><span>Việc cần làm hôm nay</span><strong>${fmt.format(s.todayItems.length)}</strong><small>${s.doneToday?fmt.format(s.doneToday)+' việc đã hoàn thành':'Theo kế hoạch đã lưu'}</small></div><div><span>Flashcard đến hạn</span><strong>${fmt.format(s.due)}</strong><small>Ôn theo chu kỳ ghi nhớ</small></div><div><span>Độ chính xác 30 ngày</span><strong>${trend}</strong><small>${fmt.format(s.totalAttempted)} câu có kết quả</small></div></div><div class="v33-week"><div class="v33-week-top"><div><b>Nhịp học 7 ngày</b><small>Phút học đã ghi nhận</small></div><strong>${top}<small> phút</small></strong></div><div class="v33-week-bars" aria-label="Biểu đồ phút học trong bảy ngày">${s.week.map((day,i)=>`<div class="v33-week-col" title="${escapeHtml(day.day)}: ${fmt.format(day.minutes)} phút"><span class="v33-week-rail"><i style="height:${day.minutes?Math.max(5,day.minutes/max*100):2}%" class="${i===6?'current':''}"></i></span><small>${['CN','T2','T3','T4','T5','T6','T7'][new Date(day.day+'T12:00:00').getDay()]}</small></div>`).join('')}</div><p class="v33-week-note">${s.previousMinutes===0?'Chưa có dữ liệu tuần trước để so sánh.':`7 ngày trước: ${fmt.format(s.previousMinutes)} phút. Dữ liệu không được ước lượng.`}</p></div></div></div></details>`;
  }
  function makeStatistics(s){
    const weekMinutes=s.week.reduce((n,v)=>n+v.minutes,0),prior=s.previousMinutes;
    const delta=prior?Math.round((weekMinutes-prior)/prior*100):null;
    return `<section class="v33-stats-spotlight surface"><div><span class="v33-eyebrow">WEEKLY SNAPSHOT</span><h2>7 ngày gần nhất</h2><p>So sánh hai khoảng thời gian 7 ngày dựa trên phiên học thực tế; không tự tạo dữ liệu.</p></div><div class="v33-stats-numbers"><span><strong>${fmt.format(weekMinutes)}<small> phút</small></strong><small>7 ngày gần nhất</small></span><span><strong>${fmt.format(prior)}<small> phút</small></strong><small>7 ngày trước đó</small></span><span><strong>${delta===null?'—':`${delta>0?'+':''}${delta}%`}</strong><small>${delta===null?'Chưa đủ dữ liệu đối chiếu':'Thay đổi so với kỳ trước'}</small></span></div></section>`;
  }
  function enhance(page){
    const root=document.querySelector('#pageContent');if(!root||!root.children.length)return;
    const s=snapshot();if(!s)return;
    if(page==='dashboard'&&!root.querySelector('.v33-journey')){
      const anchor=root.querySelector('.v35-compass-anchor');if(anchor)anchor.outerHTML=makeDashboard(s);else {const hero=root.querySelector('.dashboard-hero');if(hero)hero.insertAdjacentHTML('afterend',makeDashboard(s));}
    }
    if(page==='stats'&&!root.querySelector('.v33-stats-spotlight')){
      const title=root.querySelector('.page-heading');if(title)title.insertAdjacentHTML('afterend',makeStatistics(s));
    }
  }
  window.enhanceV33Page=enhance;
  function connectionStatus(){
    const hdr=document.querySelector('.topbar-right');if(!hdr)return;
    let badge=hdr.querySelector('#v33NetworkBadge');
    if(!badge){badge=document.createElement('span');badge.id='v33NetworkBadge';badge.setAttribute('role','status');badge.className='v33-network';hdr.prepend(badge);}
    const offline=navigator.onLine===false;
    badge.textContent=offline?'◌ Ngoại tuyến':'● Dữ liệu cục bộ';
    badge.classList.toggle('offline',offline);
    badge.setAttribute('aria-label',offline?'Trình duyệt đang báo ngoại tuyến. Một số tài nguyên mạng có thể không sử dụng được.':'Dữ liệu học tập được lưu cục bộ trên trình duyệt này.');
    badge.title=offline?'Một số tài nguyên trên mạng không mở được.':'Trạng thái kết nối không đảm bảo dữ liệu đã được đồng bộ.';
  }
  function showUpdateTip(){
    if(typeof state==='undefined'||!state||activePage==='exam'&&getActiveExamSession()?.status==='IN_PROGRESS'||typeof focusStarted!=='undefined'&&focusStarted)return;
    if(document.getElementById('v33UpdateTip'))return;
    const tip=document.createElement('div');tip.id='v33UpdateTip';tip.className='v33-update-tip';tip.setAttribute('role','status');
    tip.innerHTML='<span><b>Đã có phiên bản mới</b><small>Hãy lưu công việc trước khi tải lại trang.</small></span><button type="button" data-v33-reload>Tải lại</button><button type="button" data-v33-dismiss aria-label="Đóng thông báo cập nhật">×</button>';
    document.body.append(tip);
  }
  document.addEventListener('toggle',event=>{
    const section=event.target;
    if(section.id!=='v33StudyCompass'||typeof state==='undefined'||!state)return;
    if(state.settings?.studyCompassExpanded===section.open||state.settings?.studyCompassExpanded===undefined&&section.open)return;
    const before=typeof snapshotStudyState==='function'?snapshotStudyState():null;
    state.settings.studyCompassExpanded=section.open;
    if(typeof saveMutationOrRollback==='function'&&!saveMutationOrRollback(before))section.open=!section.open;
  },true);
  document.addEventListener('click',event=>{
    if(event.target.closest('[data-v33-dismiss]'))document.getElementById('v33UpdateTip')?.remove();
    if(event.target.closest('[data-v33-reload]')){
      const inExam=typeof getActiveExamSession==='function'&&getActiveExamSession()?.status==='IN_PROGRESS';
      const writing=typeof documentDirty!=='undefined'&&documentDirty;
      if(inExam||writing||typeof focusStarted!=='undefined'&&focusStarted){if(typeof showToast==='function')showToast('Hãy hoàn thành hoặc lưu phiên đang thực hiện trước khi tải lại.','warning');return;}
      window.location.reload();
    }
  });
  document.addEventListener('DOMContentLoaded',()=>{
    connectionStatus();
    window.addEventListener('online',connectionStatus);
    window.addEventListener('offline',connectionStatus);
    const root=document.querySelector('#pageContent');
    if(root){const observer=new MutationObserver(()=>{
      if(typeof activePage==='undefined'||typeof state==='undefined'||!state)return;
      if(!root.querySelector('.v33-journey,.v33-stats-spotlight'))enhance(activePage);
    });observer.observe(root,{childList:true,subtree:false});}
    if('serviceWorker' in navigator){const hadController=!!navigator.serviceWorker.controller;if(hadController)navigator.serviceWorker.addEventListener('controllerchange',showUpdateTip);}
    if(typeof activePage!=='undefined')enhance(activePage);
  });
})();
