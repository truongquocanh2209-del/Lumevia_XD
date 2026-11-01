'use strict';

/* Profile insights are derived from this account's saved records. No remote state. */
function profile30DateKey(date){
  const d=date instanceof Date?date:new Date(date);
  if(!Number.isFinite(d.getTime()))return '';
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function profile30DayOffset(now,offset){const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()+offset);return profile30DateKey(d);}
function profile30Stats(data,now=Date.now()){
  const days=Array.from({length:7},(_,i)=>({key:profile30DayOffset(now,i-6),minutes:0}));
  const previous=Array.from({length:7},(_,i)=>profile30DayOffset(now,i-13));
  const dayMap=new Map(days.map(d=>[d.key,d])),seen=new Set(),subjects=new Map();
  let totalMinutes=0,totalSessions=0,previousMinutes=0;
  for(const s of Array.isArray(data?.sessions)?data.sessions:[]){
    if(!s||s.type==='break'||!Number.isFinite(Number(s.minutes))||Number(s.minutes)<=0)continue;
    if(s.id&&seen.has(s.id))continue;if(s.id)seen.add(s.id);
    const minutes=Number(s.minutes),key=/^\d{4}-\d{2}-\d{2}$/.test(s.date||'')?s.date:profile30DateKey(s.createdAt);
    if(!key||profile30DateKey(new Date(key+'T12:00:00'))!==key||key>days[6].key)continue;
    totalMinutes+=minutes;totalSessions++;
    if(dayMap.has(key)){dayMap.get(key).minutes+=minutes;const subject=String(s.subject||'Khác');subjects.set(subject,(subjects.get(subject)||0)+minutes);}
    if(previous.includes(key))previousMinutes+=minutes;
  }
  const weekMinutes=days.reduce((n,d)=>n+d.minutes,0),todayMinutes=days[6].minutes;
  const goal=[30,60,90,120,180,240].includes(Number(data?.settings?.dailyFocusGoal))?Number(data.settings.dailyFocusGoal):120;
  const due=(Array.isArray(data?.flashcards)?data.flashcards:[]).filter(c=>c&&Number.isFinite(Number(c.dueAt||0))&&Number(c.dueAt||0)<=now).length;
  const completedExams=(Array.isArray(data?.examSessions)?data.examSessions:[]).filter(s=>s?.status==='COMPLETED').length;
  const documents=(Array.isArray(data?.documents)?data.documents:[]).filter(d=>d&&typeof d.id==='string').length;
  return {days,weekMinutes,todayMinutes,totalMinutes,totalSessions,previousMinutes,activeDays:days.filter(d=>d.minutes>0).length,goal,remaining:Math.max(0,goal-todayMinutes),percent:Math.min(100,Math.round(todayMinutes/goal*100)),due,completedExams,documents,topSubject:[...subjects.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'',intent:String(data?.settings?.learningIntent||'').trim().slice(0,160)};
}
function profile30Markup(stats,owner){
  const s=stats,fmt=n=>Number(n.toFixed(1)).toLocaleString('vi-VN'),max=Math.max(30,...s.days.map(d=>d.minutes));
  const next=s.due?{page:'review',title:`Ôn ${s.due} thẻ đến hạn`,text:'Bắt đầu từ những thẻ cần được nhớ lại hôm nay.'}:s.remaining?{page:'focus',title:'Dành một phiên cho điều quan trọng',text:`Còn ${fmt(s.remaining)} phút để đạt mục tiêu hôm nay. Bạn có thể chia thành nhiều phiên.`}:{page:'documents',title:'Ghi lại điều đã hiểu',text:'Bạn đã đạt mục tiêu thời gian hôm nay. Một ghi chú ngắn giúp khép lại phiên học.'};
  const milestones=[{on:s.totalSessions>0,icon:'◷',title:'Bắt đầu hành trình',text:'Có phiên tập trung đã lưu'},{on:s.documents>0,icon:'▤',title:'Viết để hiểu',text:'Có tài liệu trong Storage Word'},{on:s.completedExams>0,icon:'✓',title:'Tự kiểm chứng',text:'Hoàn thành một phiên thi'},{on:s.activeDays>=3,icon:'◈',title:'Giữ nhịp học',text:'Tập trung ít nhất 3/7 ngày gần nhất'}];
  return `<section id="profile30Insights" class="profile30-insights" aria-label="Hành trình học tập cá nhân"><div class="profile30-overview"><section class="surface profile30-week"><header><div><p class="eyebrow">HÀNH TRÌNH CỦA BẠN</p><h2>Bảy ngày, từng bước tiến.</h2></div><span class="profile30-chip">${s.activeDays}/7 ngày tập trung</span></header><div class="profile30-numbers"><div><strong>${fmt(s.weekMinutes)}<small> phút</small></strong><span>trong 7 ngày gần nhất</span></div><p>${s.previousMinutes?`${fmt(s.previousMinutes)} phút trong 7 ngày trước đó.`:'Chưa có thời gian tập trung được lưu trong 7 ngày trước đó.'}${s.topSubject?`<br>Môn dành nhiều thời gian nhất tuần này: <b>${escapeHtml(s.topSubject)}</b>.`:''}</p></div><div class="profile30-days" role="list" aria-label="Phút tập trung theo ngày">${s.days.map((d,i)=>`<div role="listitem" aria-label="Ngày ${d.key.slice(8)}/${d.key.slice(5,7)}: ${fmt(d.minutes)} phút"><span class="profile30-day-value">${fmt(d.minutes)}</span><div class="profile30-bar-track"><span style="height:${d.minutes?Math.max(4,d.minutes/max*100):0}%"></span></div><small>${i===6?'Hôm nay':`${d.key.slice(8)}/${d.key.slice(5,7)}`}</small></div>`).join('')}</div><p class="profile30-caption">Chỉ tính thời gian tập trung đã lưu; không tính giờ nghỉ hoặc phiên chưa lưu.</p></section><section class="surface profile30-today"><p class="eyebrow">NHỊP HỌC HÔM NAY</p><div class="profile30-goal-ring" style="--goal:${s.percent}%"><div><strong>${s.percent}%</strong><span>mục tiêu thời gian</span></div></div><h2>${fmt(s.todayMinutes)} <span>/ ${s.goal} phút</span></h2><p>${s.intent?escapeHtml(s.intent):'Một mục tiêu vừa sức sẽ dễ duy trì hơn mỗi ngày.'}</p><a href="#profile30GoalForm" class="button button-ghost button-small">Chỉnh mục tiêu ↓</a></section></div><div class="profile30-milestones" aria-label="Dấu mốc từ dữ liệu đã lưu">${milestones.map(m=>`<article class="surface ${m.on?'is-earned':''}"><span aria-hidden="true">${m.icon}</span><div><h3>${m.title}</h3><p>${m.text}</p><small>${m.on?'Đã ghi nhận':'Chưa có dữ liệu phù hợp'}</small></div></article>`).join('')}</div><div class="profile30-bottom"><section class="surface profile30-intent"><p class="eyebrow">HỌC CÓ ĐỊNH HƯỚNG</p><h2>Điều tôi muốn tiến bộ</h2><form id="profile30GoalForm" data-owner="${escapeHtml(owner)}"><label for="profile30Intent">Mục tiêu cá nhân <small>Không bắt buộc</small></label><input id="profile30Intent" class="field" maxlength="160" value="${escapeHtml(s.intent)}" placeholder="Ví dụ: Nắm chắc chương Hàm số trong tuần này"><div class="profile30-goal-row"><label for="profile30Goal">Thời gian mỗi ngày<select id="profile30Goal" class="select-field">${[30,60,90,120,180,240].map(n=>`<option value="${n}" ${n===s.goal?'selected':''}>${n} phút</option>`).join('')}</select></label><button class="button button-primary" type="submit">Lưu mục tiêu</button></div><p id="profile30SaveStatus" class="profile30-caption" role="status">Cùng mục tiêu thời gian với Focus Room và Cài đặt.</p></form></section><section class="surface profile30-next"><p class="eyebrow">BƯỚC TIẾP THEO</p><h2>${next.title}</h2><p>${next.text}</p><button class="button button-soft" data-action="navigate" data-page="${next.page}">Bắt đầu ↗</button><div class="profile30-lifetime"><span><b>${fmt(s.totalMinutes)}</b> phút đã lưu</span><span><b>${s.completedExams}</b> phiên thi hoàn thành</span></div></section></div></section>`;
}
function enhanceProfile30(page){
  if(page!=='profile')return;
  const hero=$('.profile-hero');if(!hero)return;
  $('#profile30Insights')?.remove();
  hero.classList.add('profile30-hero');hero.insertAdjacentHTML('afterend',profile30Markup(profile30Stats(state),currentUsername));
}
document.addEventListener('submit',event=>{
  const form=event.target;if(form.id!=='profile30GoalForm')return;event.preventDefault();
  if(activePage!=='profile'||form.dataset.owner!==currentUsername)return;
  const goal=Number($('#profile30Goal')?.value),intent=String($('#profile30Intent')?.value||'').normalize('NFC').trim().slice(0,160);
  if(![30,60,90,120,180,240].includes(goal))return;
  if(!aevoraSettings({dailyFocusGoal:goal,learningIntent:intent})){const status=$('#profile30SaveStatus');if(status)status.textContent='Chưa lưu được. Nội dung bạn vừa nhập vẫn được giữ trên màn hình.';return;}
  enhanceProfile30('profile');$('#profile30SaveStatus').textContent='Đã lưu mục tiêu cho tài khoản này.';$('#profile30GoalForm button[type="submit"]')?.focus({preventScroll:true});
});
