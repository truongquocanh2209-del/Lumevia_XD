/* 3.1 — One source of truth for visual accents; CSS legacy layers cannot override these tokens. */
const ACCENT_PRESETS={
  cyan:{name:'Ngọc lam',swatch:'#74e0eb',dark:'#81dfe9',darkStrong:'#9aebf1',light:'#12686e',lightStrong:'#0c5359',blueDark:'#80c7f0',blueLight:'#266b99'},
  violet:{name:'Tím thiên hà',swatch:'#b8a0ff',dark:'#bdadff',darkStrong:'#d3c7ff',light:'#6845aa',lightStrong:'#51348b',blueDark:'#adbcff',blueLight:'#6552aa'},
  rose:{name:'Hồng hoa',swatch:'#f4a8ce',dark:'#f5abd0',darkStrong:'#ffc6e1',light:'#964370',lightStrong:'#783458',blueDark:'#f7a9dc',blueLight:'#96518d'},
  lime:{name:'Xanh lá non',swatch:'#c5e68d',dark:'#c9e998',darkStrong:'#daf3b5',light:'#496b19',lightStrong:'#375514',blueDark:'#95d7af',blueLight:'#497750'},
  ocean:{name:'Xanh đại dương',swatch:'#87bcff',dark:'#92c5ff',darkStrong:'#b4d9ff',light:'#235ca0',lightStrong:'#19467f',blueDark:'#82d7ea',blueLight:'#246f8c'},
  amber:{name:'Hổ phách',swatch:'#f0cc85',dark:'#f1d193',darkStrong:'#fae2b2',light:'#805614',lightStrong:'#66420c',blueDark:'#d5bb90',blueLight:'#806029'},
  mint:{name:'Bạc hà',swatch:'#8fe4bd',dark:'#9fe9c6',darkStrong:'#bdf4db',light:'#176b55',lightStrong:'#115642',blueDark:'#87d6dc',blueLight:'#286d79'},
  coral:{name:'San hô',swatch:'#f7a597',dark:'#f6ada3',darkStrong:'#ffc8c1',light:'#91463d',lightStrong:'#74352e',blueDark:'#e3b0c1',blueLight:'#98536b'}
};
const DEFAULT_CUSTOM_ACCENT='#6595E9';
function normalizeAccentHex(value){const v=String(value||'').trim();return /^#[\da-f]{6}$/i.test(v)?v.toUpperCase():null;}
function rgbToHsl(hex){const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);const max=Math.max(...c),min=Math.min(...c),d=max-min;let h=0,s=0,l=(max+min)/2;if(d){s=d/(1-Math.abs(2*l-1));switch(max){case c[0]:h=((c[1]-c[2])/d)%6;break;case c[1]:h=(c[2]-c[0])/d+2;break;default:h=(c[0]-c[1])/d+4;}h=(h*60+360)%360;}return {h,s:s*100,l:l*100};}
function customAccentTokens(hex){const {h,s}=rgbToHsl(hex);const sat=Math.max(s<12?0:48,Math.min(85,s));const tone=(light,shift=0,saturation=sat)=>`hsl(${Math.round((h+shift+360)%360)} ${Math.round(saturation)}% ${light}%)`;return {name:'Màu của tôi',swatch:hex,dark:tone(76),darkStrong:tone(85),light:tone(34),lightStrong:tone(27),blueDark:tone(75,16),blueLight:tone(36,16)};}
function currentAccentSettings(settings){return settings?.accent==='custom'?customAccentTokens(normalizeAccentHex(settings.customAccent)||DEFAULT_CUSTOM_ACCENT):(ACCENT_PRESETS[settings?.accent]||ACCENT_PRESETS.cyan);}
const WEB_FONTS={system:{label:'Hiện đại · Hệ thống',family:'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "LUMEVIA Sans", sans-serif'},arial:{label:'Gọn gàng · Arial',family:'Arial, Helvetica, "LUMEVIA Sans", sans-serif'},verdana:{label:'Dễ đọc · Verdana',family:'Verdana, Geneva, "LUMEVIA Sans", sans-serif'},serif:{label:'Trang sách · LUMEVIA Serif',family:'"LUMEVIA Serif", "Times New Roman", serif'},mono:{label:'Đơn cách · Consolas',family:'Consolas, "Liberation Mono", "LUMEVIA Sans", monospace'}};
'use strict';

/* LUMEVIA StudyOS — original, dependency-free frontend. Local-only account mode. */
const APP_NAME = 'LUMEVIA StudyOS';
const USERS_KEY = 'praxilume.users.v1';
const ACTIVE_KEY = 'praxilume.active-user.v1';
const XP_PER_LEVEL = 100;
const SRS_DAY_MS = 24 * 60 * 60 * 1000;
const AVATARS = ['🌙','🦊','🐼','🐸','🐱','🐨','🐯','🐧','🦉','🐲','🪐','🌻','🦋','🐙','🦄','⭐'];
const SUBJECTS = ['Toán','Ngữ văn','Tiếng Anh','Tiếng Pháp','Vật lý','Hóa học','Sinh học','Khoa học tự nhiên','Lịch sử','Địa lý','Tin học','Công nghệ','Giáo dục công dân','Giáo dục địa phương','Hoạt động trải nghiệm','Nghệ thuật','Giáo dục thể chất','Khác'];
const RESOURCE_TYPES = ['Video','Bài viết','Công cụ','Tài liệu','Từ điển','Khóa học','Khác'];
const NOTIFICATION_PREF_GROUPS = [
  {title:'Học tập và kế hoạch',items:[['taskReminders','Nhắc nhiệm vụ trong ngày','Nhắc một lần khi đến giờ của nhiệm vụ hôm nay; chỉ hoạt động khi trang đang mở, không gửi nền khi đóng website.'],['deadlineReminders','Nhắc deadline','Kiểm tra mốc 24 giờ, 3 giờ, 30 phút theo từng deadline khi trang đang mở.'],['morningSummary','Tổng kết buổi sáng','Khi mở ứng dụng trước 11:00, chỉ tạo tổng kết nếu hôm nay còn nhiệm vụ chưa hoàn thành.'],['unfinishedTasks','Nhắc việc quá hạn','Hiển thị nhóm công việc có ngày trước hôm nay và chưa hoàn thành.'],['flashcardReview','Ôn tập flashcard','Hiện số thẻ đến hạn trong trung tâm thông báo; không phải thông báo nền tự động khi đóng website.'],['streakReminder','Duy trì chuỗi học tập','Kiểm tra lúc 20:30 khi trang đang mở và hôm trước có hoạt động học.']]},
  {title:'Thành tích và thử thách',items:[['achievements','Mở khóa thành tựu','Thông báo khi đạt mốc dựa trên dữ liệu thật.'],['flashChallenge','Thử thách học tập','Chỉ kiểm tra khi trang đang mở; thời điểm trong ngày được chọn cục bộ.']]},
  {title:'Thời gian nghỉ và sức khỏe',items:[['pomodoroBreak','Nhắc Focus Room','Thông báo khi phiên Focus/giờ nghỉ kết thúc thành công và dữ liệu được lưu.'],['wellnessBreak','Bảo vệ nhịp học','Nhắc nghỉ nhẹ nhàng khi phiên học dài hoặc tổng thời lượng hôm nay cao; có thể nhắc lại sau 20 phút.'],['nightOwl','Nhắc chế độ đêm','Nhắc lúc 23:30 khi trang đang mở và không bị giờ yên tĩnh chặn; không chạy nền sau khi đóng website.']]},
  {title:'Hệ thống và dữ liệu',items:[['storageActions','Thay đổi Storage','Thông báo khi dữ liệu được chuyển vào Lịch sử xóa.'],['featureUpdates','Thông tin cập nhật','Điều khiển việc ghi thông báo thuộc loại cập nhật vào lịch sử; thẻ ghi chú phiên bản trong trung tâm có nút thu gọn riêng. Không theo dõi bản phát hành bên ngoài.']]}
];
const DEFAULT_NOTIFICATION_PREFS = {taskReminders:true,deadlineReminders:true,morningSummary:true,unfinishedTasks:false,flashcardReview:true,streakReminder:true,achievements:true,flashChallenge:false,pomodoroBreak:true,wellnessBreak:true,nightOwl:false,storageActions:true,featureUpdates:true};
function defaultNotificationPrefs(){return {...DEFAULT_NOTIFICATION_PREFS};}
function notificationPrefEnabled(key){return state?.notificationPrefs?.[key]!==false;}
const FOCUS_THEMES = [
  {id:'lake',photo:'lake',dim:.42,name:'Hồ núi bình yên',icon:'◌',desc:'Mặt hồ trong giữa những dãy núi',vibe:'Rộng mở và tĩnh lặng',bestFor:'Đọc và nghiên cứu',palette:'Xanh hồ · đá · trời'},
  {id:'snow',photo:'snow',dim:.36,name:'Cabin mùa đông',icon:'⌂',desc:'Một mái nhà nhỏ giữa rừng tuyết',vibe:'Êm dịu, tách khỏi ồn ào',bestFor:'Viết và ôn tập',palette:'Tuyết · gỗ · xanh thông'},
  {id:'forest',photo:'forest',dim:.38,name:'Rừng sương',icon:'🌲',desc:'Sương sớm giữa những tầng thông',vibe:'Dịu mắt, sâu và yên tĩnh',bestFor:'Pomodoro, đọc hiểu và viết tay',palette:'Rêu đêm · ngọc lam · khói sương'},
  {id:'ocean',photo:'ocean',dim:.3,name:'Biển hoàng hôn',icon:'🌊',desc:'Ánh chiều lặng trên mặt biển',vibe:'Êm, mát và nhịp nhàng',bestFor:'Đọc tài liệu, nghe giảng và xem lại bài',palette:'Xanh biển sâu · cyan · đá phiến'},
  {"id": "aurora", "photo": "aurora", "dim": 0.42, "name": "Cực quang phương Bắc", "icon": "✧", "desc": "Cực quang phương Bắc · một khoảng lặng để tập trung", "vibe": "Đêm", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Đêm", "isNew": true},
  {"id": "desert", "photo": "desert", "dim": 0.42, "name": "Biển cát vàng", "icon": "◒", "desc": "Biển cát vàng · một khoảng lặng để tập trung", "vibe": "Ấm áp", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Ấm áp", "isNew": true},
  {"id": "waterfall", "photo": "waterfall", "dim": 0.42, "name": "Thác giữa rừng", "icon": "≈", "desc": "Thác giữa rừng · một khoảng lặng để tập trung", "vibe": "Thiên nhiên", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Thiên nhiên", "isNew": true},
  {"id": "lavender", "photo": "lavender", "dim": 0.42, "name": "Mùa hoa tím", "icon": "❋", "desc": "Mùa hoa tím · một khoảng lặng để tập trung", "vibe": "Thiên nhiên", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Thiên nhiên", "isNew": true},
  {"id": "bamboo", "photo": "bamboo", "dim": 0.42, "name": "Lối tre xanh", "icon": "♧", "desc": "Lối tre xanh · một khoảng lặng để tập trung", "vibe": "Thiên nhiên", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Thiên nhiên", "isNew": true},
  {"id": "coast", "photo": "coast", "dim": 0.42, "name": "Bờ biển tĩnh lặng", "icon": "≋", "desc": "Bờ biển tĩnh lặng · một khoảng lặng để tập trung", "vibe": "Biển & hồ", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Biển & hồ", "isNew": true},
  {"id": "valley", "photo": "valley", "dim": 0.42, "name": "Thung lũng rộng mở", "icon": "△", "desc": "Thung lũng rộng mở · một khoảng lặng để tập trung", "vibe": "Thiên nhiên", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Thiên nhiên", "isNew": true},
  {"id": "stars", "photo": "stars", "dim": 0.42, "name": "Đêm đầy sao", "icon": "✦", "desc": "Đêm đầy sao · một khoảng lặng để tập trung", "vibe": "Đêm", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Đêm", "isNew": true},
  {"id": "autumn", "photo": "autumn", "dim": 0.42, "name": "Rừng mùa thu", "icon": "❧", "desc": "Rừng mùa thu · một khoảng lặng để tập trung", "vibe": "Ấm áp", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Ấm áp", "isNew": true},
  {"id": "rain-city", "photo": "rain-city", "dim": 0.42, "name": "Phố đêm ánh đèn", "icon": "☂", "desc": "Phố đêm ánh đèn · một khoảng lặng để tập trung", "vibe": "Đêm", "bestFor": "Học tập, đọc và sáng tạo", "palette": "Ánh sáng tự nhiên", "category": "Đêm", "isNew": true},
];
const FOCUS_AMBIENTS = {
  gentle:{label:'Nhẹ nhàng',quote:'Bạn không cần làm tất cả. Chỉ cần bắt đầu một việc.',hint:'✦ Nhắm vào bước tiếp theo, không cần hoàn hảo ngay.',insight:'Giữ nhịp vừa đủ. Tiến bộ bền vững luôn thắng sự quá sức.'},
  minimal:{label:'Tối giản',quote:'Một việc tại một thời điểm.',hint:'✦ Bỏ bớt nhiễu. Chỉ giữ lại thứ bạn đang làm.',insight:'Giảm lựa chọn để tăng lực tập trung.'},
  starry:{label:'Bầu trời sao',quote:'Dưới bầu trời rộng lớn, hãy dành vài phút cho điều đang học.',hint:'✦ Hít sâu, nhìn xa một nhịp rồi quay lại mục tiêu.',insight:'Những phút nhỏ lặp lại đủ lâu sẽ tạo thành bước nhảy lớn.'},
  ritual:{label:'Nghi thức tập trung',quote:'Đến giờ vào guồng. Hít sâu, bắt đầu và giữ nhịp.',hint:'✦ Bàn sạch, lưng thẳng, mắt nhìn vào một mục tiêu duy nhất.',insight:'Một nghi thức bắt đầu ổn định sẽ làm phiên học dễ duy trì hơn.'},
  recharge:{label:'Hồi phục năng lượng',quote:'Dành cho bản thân một nhịp nghỉ để đi tiếp vững hơn.',hint:'✦ Nghỉ ngắn cũng là một phần của tiến bộ.',insight:'Khôi phục năng lượng đúng lúc giúp phiên tiếp theo hiệu quả hơn.'}
};
function getFocusTheme(themeId) { return FOCUS_THEMES.find(theme=>theme.id===themeId) || FOCUS_THEMES.find(theme=>theme.id==='forest'); }
function getFocusAmbientDetails(ambientId) { return FOCUS_AMBIENTS[ambientId] || FOCUS_AMBIENTS.gentle; }
function focusModeLabel(mode) { return mode==='break' ? 'Nghỉ ngắn' : mode==='review' ? 'Ôn tập chủ động' : 'Tập trung sâu'; }
function focusThemeSpotlightMarkup(theme) {
  const selectedTheme=getFocusTheme(theme?.id||'forest');
  return `<div class="focus-spotlight-head"><span class="focus-spotlight-mark" aria-hidden="true">${selectedTheme.icon}</span><div><p class="eyebrow">SCENE SPOTLIGHT</p><h2>${escapeHtml(selectedTheme.name)}</h2><p>${escapeHtml(selectedTheme.desc)}</p></div></div><div class="focus-spotlight-grid"><div class="focus-spotlight-item"><small>Bầu không khí</small><strong>${escapeHtml(selectedTheme.vibe||'Tập trung và thư thái')}</strong></div><div class="focus-spotlight-item"><small>Phù hợp cho</small><strong>${escapeHtml(selectedTheme.bestFor||'Tự học và làm bài')}</strong></div><div class="focus-spotlight-item"><small>Bảng màu</small><strong>${escapeHtml(selectedTheme.palette||'Tông dịu mắt')}</strong></div></div>`;
}

const BUILTIN_RESOURCES = [
  {id:'seed-geo',title:'GeoGebra — Khám phá Toán học',url:'https://www.geogebra.org/',subject:'Toán',type:'Công cụ',description:'Vẽ đồ thị, hình học động và thử nghiệm các ý tưởng toán học bằng công cụ tương tác.',tags:['Hình học','Đại số'],icon:'📐'},
  {id:'seed-khan',title:'Khan Academy',url:'https://www.khanacademy.org/',subject:'Khác',type:'Khóa học',description:'Bài học và bài luyện tập có cấu trúc ở nhiều chủ đề, phù hợp để học lại nền tảng.',tags:['Miễn phí','Luyện tập'],icon:'🎓'},
  {id:'seed-phET',title:'PhET Interactive Simulations',url:'https://phet.colorado.edu/vi/',subject:'Vật lý',type:'Công cụ',description:'Mô phỏng khoa học giúp quan sát lực, điện, sóng và các hiện tượng khó hình dung.',tags:['Mô phỏng','Thực hành'],icon:'⚛️'},
  {id:'seed-oxford',title:'Oxford Learner’s Dictionaries',url:'https://www.oxfordlearnersdictionaries.com/',subject:'Tiếng Anh',type:'Từ điển',description:'Tra nghĩa, cách phát âm và ví dụ dùng từ trong ngữ cảnh tiếng Anh.',tags:['Từ vựng','Phát âm'],icon:'🔤'},
  {id:'seed-britannica',title:'Britannica School & Reference',url:'https://www.britannica.com/',subject:'Khác',type:'Bài viết',description:'Nguồn tra cứu bách khoa để bắt đầu tìm hiểu chủ đề và mở rộng kiến thức.',tags:['Tra cứu','Bách khoa'],icon:'🌐'},
  {id:'seed-nasa',title:'NASA STEM Engagement',url:'https://www.nasa.gov/learning-resources/',subject:'Vật lý',type:'Tài liệu',description:'Tài liệu học tập về không gian, công nghệ và khoa học do NASA cung cấp.',tags:['STEM','Không gian'],icon:'🚀'},
  {id:'seed-gutenberg',title:'Project Gutenberg',url:'https://www.gutenberg.org/',subject:'Ngữ văn',type:'Tài liệu',description:'Thư viện sách điện tử, trong đó có nhiều tác phẩm thuộc phạm vi công cộng.',tags:['Đọc sách','Văn học'],icon:'📚'},
  {id:'seed-vdict',title:'VietLex / từ điển tra cứu',url:'https://vdict.com/',subject:'Tiếng Anh',type:'Từ điển',description:'Tra cứu nhanh từ và cụm từ Anh–Việt khi đọc, viết hoặc học từ mới.',tags:['Anh–Việt','Tra cứu'],icon:'🗂️'},
  {id:'seed-ck12',title:'CK-12 Foundation',url:'https://www.ck12.org/student/',subject:'Sinh học',type:'Khóa học',description:'Tài nguyên giáo dục số theo chủ đề, có nội dung khoa học và bài luyện tập.',tags:['Khoa học','Học liệu'],icon:'🧬'}
];
const BUILTIN_QUIZZES = [
  {id:'seed-english',title:'English Essentials',subject:'Tiếng Anh',description:'Từ vựng và ngữ pháp tiếng Anh nền tảng.',questions:[
    {question:'Choose the correct sentence.',options:['She go to school every day.','She goes to school every day.','She going to school every day.','She gone to school every day.'],answer:1,explanation:'Với chủ ngữ số ít ở hiện tại đơn, động từ thường thêm -s/-es.'},
    {question:'What is the closest meaning of “rapid”?',options:['Slow','Quiet','Fast','Careful'],answer:2,explanation:'Rapid có nghĩa là nhanh, diễn ra trong thời gian ngắn.'},
    {question:'I have lived here ___ 2022.',options:['for','since','during','from'],answer:1,explanation:'Since đi với một mốc thời gian bắt đầu.'},
    {question:'What is the opposite of “generous”?',options:['Kind','Selfish','Honest','Patient'],answer:1,explanation:'Generous là hào phóng; selfish là ích kỷ.'},
    {question:'If it rains tomorrow, we ___ at home.',options:['stay','stayed','will stay','staying'],answer:2,explanation:'Câu điều kiện loại 1 dùng will + động từ nguyên mẫu ở mệnh đề chính.'}
  ]},
  {id:'seed-math',title:'Toán nhanh: nền tảng',subject:'Toán',description:'Ôn các quy tắc đại số và tư duy tính toán.',questions:[
    {question:'Giá trị của 3² + 4² là bao nhiêu?',options:['12','25','49','14'],answer:1,explanation:'3² + 4² = 9 + 16 = 25.'},
    {question:'Giải phương trình 2x + 6 = 14.',options:['x = 3','x = 4','x = 5','x = 10'],answer:1,explanation:'Trừ 6 hai vế: 2x = 8, nên x = 4.'},
    {question:'Tổng ba góc trong một tam giác bằng?',options:['90°','180°','270°','360°'],answer:1,explanation:'Tổng ba góc trong mọi tam giác Euclid là 180°.'},
    {question:'Phân số nào bằng 0,75?',options:['1/4','2/3','3/4','4/5'],answer:2,explanation:'0,75 = 75/100 = 3/4.'},
    {question:'Nếu y = 2x và x = 7 thì y bằng?',options:['9','12','14','49'],answer:2,explanation:'Thay x = 7 vào y = 2x được y = 14.'}
  ]},
  {id:'seed-science',title:'Science Explorer',subject:'Vật lý',description:'Các khái niệm khoa học tự nhiên cơ bản.',questions:[
    {question:'Đơn vị đo cường độ dòng điện là gì?',options:['Volt','Ohm','Ampere','Watt'],answer:2,explanation:'Cường độ dòng điện đo bằng ampe (A).'},
    {question:'Quá trình thực vật tạo chất hữu cơ nhờ ánh sáng gọi là gì?',options:['Hô hấp','Quang hợp','Bay hơi','Ngưng tụ'],answer:1,explanation:'Quang hợp dùng năng lượng ánh sáng để tạo chất hữu cơ từ CO₂ và nước.'},
    {question:'Hành tinh nào gần Mặt Trời nhất?',options:['Sao Kim','Trái Đất','Sao Hỏa','Sao Thủy'],answer:3,explanation:'Sao Thủy là hành tinh gần Mặt Trời nhất.'},
    {question:'Nước tinh khiết ở áp suất khí quyển tiêu chuẩn sôi khoảng?',options:['0°C','50°C','100°C','150°C'],answer:2,explanation:'Ở áp suất khí quyển tiêu chuẩn, nước sôi khoảng 100°C.'},
    {question:'Lực nào giữ các vật gần mặt đất?',options:['Lực ma sát','Lực hấp dẫn','Lực đàn hồi','Lực đẩy Ác-si-mét'],answer:1,explanation:'Lực hấp dẫn giữa Trái Đất và vật tạo nên trọng lực.'}
  ]}
];
const DEFAULT_FLASHCARDS = [
  {id:'fc-1',front:'photosynthesis',back:'quang hợp — quá trình cây dùng ánh sáng để tạo chất hữu cơ',subject:'Sinh học',box:0},
  {id:'fc-2',front:'reliable',back:'đáng tin cậy — someone or something you can trust',subject:'Tiếng Anh',box:0},
  {id:'fc-3',front:'Định lý Pythagoras',back:'Trong tam giác vuông: bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông.',subject:'Toán',box:0},
  {id:'fc-4',front:'current (I)',back:'Cường độ dòng điện; đơn vị SI là ampe (A).',subject:'Vật lý',box:0}
];
const $ = (s,root=document) => root.querySelector(s);
const $$ = (s,root=document) => [...root.querySelectorAll(s)];
const todayKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const makeId = (prefix='id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const safeHttpUrl = value => { try { const u=new URL(String(value)); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const fmtMinutes = n => { n=Math.max(0,Math.round(Number(n)||0)); const h=Math.floor(n/60),m=n%60; return h ? `${h} giờ ${m} phút` : `${m} phút`; };
const fmtDate = date => new Intl.DateTimeFormat('vi-VN',{weekday:'short',day:'2-digit',month:'short'}).format(date);
const fmtDateLong = date => new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date);
const formatClock = totalSeconds => `${String(Math.floor(Math.max(0,totalSeconds)/60)).padStart(2,'0')}:${String(Math.max(0,totalSeconds)%60).padStart(2,'0')}`;
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
const FOCUS_TAB_ID = (() => {
  try {
    let id=sessionStorage.getItem('orilynth.tab-session.v1');
    if(!id){id=`tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`;sessionStorage.setItem('orilynth.tab-session.v1',id);}
    return id;
  } catch { return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,10)}`; }
})();
const focusSessionKey = username => `praxilume.focus.v1.${String(username||currentUsername).toLowerCase()}`;
let focusLastLeaseAt = 0;
let currentUsername = '';
let state = null;
// Tracks the exact last copy read/written for this account; a stale tab must not overwrite a newer tab.
let lastPersistedStateRaw = null;
let activePage = 'dashboard';
let activeQuiz = null;
let quizResponses = [];
let activeExamId = null;
let selectedExamResultId = null;
let examTimer = null;
let examFullscreenEstablished = false;
let examLockoutTimer = null;
let pendingAvatarDataUrl = null;
const DELETE_MODE_PAGES=new Set(['planner','deadlines','notes','documents','vault','quiz','flashcards','storage','recycle','exam']);
const deleteModePages=new Set();
const DELETE_MODE_ACTIONS={
  planner:new Set(['task-select-item','bulk-delete-tasks','clear-task-selection','completed-task-select-item','bulk-delete-completed-tasks','clear-completed-task-selection','delete-task','delete-completed-task']),
  deadlines:new Set(['deadline-select-item','bulk-delete-deadlines','clear-deadline-selection','completed-deadline-select-item','bulk-delete-completed-deadlines','clear-completed-deadline-selection','delete-task']),
  notes:new Set(['note-select-item','bulk-delete-notes','clear-note-selection','delete-note']),
  documents:new Set(['document-select-item','bulk-delete-documents','clear-document-selection','delete-document']),
  vault:new Set(['resource-select-item','bulk-delete-resources','clear-resource-selection','delete-resource']),
  quiz:new Set(['quiz-select-item','bulk-delete-quizzes','clear-quiz-selection','delete-quiz']),
  flashcards:new Set(['flash-select-item','bulk-delete-flashcards','clear-flashcard-selection','delete-flash']),
  storage:new Set(['storage-select-item','storage-select-visible','storage-clear-selection','storage-delete-selected','storage-delete']),
  recycle:new Set(['recycle-select-item','recycle-select-visible','recycle-clear-selection','purge-deleted','purge-selected-recycle','purge-recycle-selected']),
  exam:new Set(['exam-bank-delete'])
};

let quizIndex = 0;
let quizScore = 0;
let quizSelected = null;
let quizTextAnswer = '';
let quizLocked = false;
let flashIndex = 0;
let currentFlashcardDeckId = 'all';
let flashCreateDeckOpen=false,flashCardEditorOpen=false,flashEditingId=null;
let flashStudyOpen = false;
let flashStudyReturnFocus = null;
const selectedFlashIds = new Set();
const selectedQuizIds = new Set();
const selectedNoteIds = new Set();
const selectedResourceIds = new Set();
const selectedNotificationIds = new Set();
let notificationDeleteMode = false;
const selectedTaskIds = new Set();
const selectedCompletedTaskIds = new Set();
const selectedDeadlineIds = new Set();
const selectedCompletedDeadlineIds = new Set();
const selectedDocumentIds = new Set();
let flashRevealed = false;
let focusTimer = null;
let notificationTimer = null;
let notificationFilter = 'all';
let notificationCategoryFilter = 'all';
let documentFocusMode = false;
let writerStatusObserver=null;
let documentOutlineCollapsed = true;
let focusDeadline = 0;
let focusRemaining = 0;
let focusInitialSeconds = 0;
let focusStartAt = 0;
let focusPaused = false;
let focusSubject = 'Tự học';
let focusType = 'focus';
let focusAmbient = 'gentle';
let focusStarted = false;
let focusStartBackground = null;
let selectedAuthTab = 'login';
let authOperationBusy = false;
let plannerSelectedDate = todayKey();
let plannerMonthDate = new Date();
let studyCalendarDate = new Date();
let editingNoteId = null;
let notesPinnedOnly = false;
let noteSearchQuery = '';
let notesSubjectFilter = 'all';
let notesSortMode = 'smart';
let activeDocumentId = null;
let openDocumentIds = [];
let documentActionsOpen = false;
let documentLibraryOpen = false;
let documentToolsOpen = false;
let documentHideStudyHeader = false;
let documentSaveTimer = null;
let documentDirty = false;
let wallClockTimer = null;
const toastQueue = [];
let toastSequence = 0;
let documentSelectionRange = null;
let pageHistory = [];
let pendingConfirmation = null;
let confirmationReturnFocus = null;

function emptyState(displayName, avatar='🌙', avatarImage=null) {
  const date=todayKey();
  return {
    profile:{displayName,avatar,avatarImage,createdAt:new Date().toISOString()},
    settings:{theme:'dark',accent:'cyan',customAccent:DEFAULT_CUSTOM_ACCENT,defaultSubject:'Khác',fontSize:'medium',fontFamily:'system',reduceMotion:false,stickers:true,notifications:false,taskReminders:true,focusTheme:'forest',notificationPreferencesCollapsed:true,notificationUpdatesCollapsed:true,notificationStatusCollapsed:true,bubbleNotifications:true,wellnessThreshold:50,wellnessSnoozedUntil:0,dailyFocusGoal:120,flashDeckListCollapsed:{},quietHoursEnabled:false,quietHoursStart:'22:00',quietHoursEnd:'07:00'},
    notificationPrefs:defaultNotificationPrefs(),notificationHistory:[],deletedItems:[],unlockedAchievements:[],reminderKeys:[],dailyChallenge:null,
    tasks:[
      {id:makeId('task'),title:'Chọn một mục tiêu quan trọng nhất',date,when:'09:00',subject:'Khác',priority:'Cao',done:false,createdAt:Date.now()},
      {id:makeId('task'),title:'Học tập trung 25 phút',date,when:'16:00',subject:'Khác',priority:'Vừa',done:false,createdAt:Date.now()+1},
      {id:makeId('task'),title:'Ôn lại kiến thức bằng flashcard',date,when:'19:30',subject:'Khác',priority:'Vừa',done:false,createdAt:Date.now()+2}
    ],
    completedTasks:[],notes:[],documents:[],resources:[],hiddenBuiltinResources:[],hiddenBuiltinQuizzes:[],examQuestionBank:[],examSessions:[],examIntegrityRecords:[],examIntegrityEvents:[],flashDecks:[],flashcards:DEFAULT_FLASHCARDS.map(c=>({...c,id:makeId('fc'),deckId:`deck-default-${String(c.subject||'Khác').toLocaleLowerCase('vi').replace(/[^\p{L}\p{N}]+/gu,'-')}`,deckName:`${c.subject||'Khác'} · Bộ mặc định`,repetitions:0,easeFactor:2.5,intervalDays:0,dueAt:0,lapses:0,lastReviewedAt:0,reviewHistory:[]})),customQuizzes:[],attempts:[],sessions:[],studyDays:[],notificationReadIds:[],notifiedTaskKeys:[],xp:0,stickerSet:'study',bestStreak:0,flashReviews:0
  };
}
function readUsers() {
  let raw;
  try { raw=localStorage.getItem(USERS_KEY); }
  catch { throw new Error('Trình duyệt đang chặn bộ nhớ tài khoản. Hãy mở website bằng HTTPS, bật quyền lưu dữ liệu cho trang rồi thử lại.'); }
  if(raw===null||raw==='')return Object.create(null);
  let parsed;
  try { parsed=JSON.parse(raw); }
  catch { throw new Error('Kho tài khoản cục bộ không đọc được. LUMEVIA đã giữ nguyên dữ liệu gốc và không tự tạo lại kho mới để tránh ghi đè tài khoản. Hãy khôi phục bản sao lưu trình duyệt nếu có.'); }
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('Cấu trúc kho tài khoản không hợp lệ. Dữ liệu chưa bị ghi đè; hãy khôi phục bản sao lưu trước khi tiếp tục.');
  // Use a null-prototype map so names such as "__proto__" cannot alter object behavior.
  const users=Object.create(null);
  for(const [key,value] of Object.entries(parsed)){
    if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Một hồ sơ trong kho tài khoản bị lỗi. Ứng dụng không tự xóa hồ sơ để bảo vệ dữ liệu.');
    users[key]=value;
  }
  return users;
}
function writeUsers(users) { localStorage.setItem(USERS_KEY,JSON.stringify(users)); }
function userDataKey(username) { return `praxilume.data.v1.${String(username).toLowerCase()}`; }
function saveState() {
  if (!currentUsername || !state) return false;
  let serialized;
  try {
    serialized=JSON.stringify(state);
    if(typeof serialized!=='string')throw new Error('Dữ liệu không thể chuyển thành JSON.');
    const key=userDataKey(currentUsername);
    // Read-before-write is best-effort optimistic concurrency; localStorage offers no atomic compare-and-swap.
    // We intentionally refuse to overwrite another tab's data rather than silently destroying its changes.
    if(localStorage.getItem(key)!==lastPersistedStateRaw){
      showToast('Dữ liệu đã thay đổi ở tab khác. Tab hiện tại chưa ghi đè bản mới. Hãy xuất bản sao lưu, rồi tải lại trang để xem dữ liệu mới nhất.', 'error');
      return false;
    }
    localStorage.setItem(key,serialized);
    lastPersistedStateRaw=serialized;
  } catch (err) {
    showToast('Không thể lưu dữ liệu. Có thể bộ nhớ trình duyệt đã đầy hoặc dữ liệu không hợp lệ. Hãy xuất bản sao lưu nếu còn có thể, giải phóng dung lượng rồi thử lại.', 'error');
    console.warn('StudyOS persistence failed:',err);
    return false;
  }
  // Storage success is decided only by the write above. A nonessential UI refresh
  // must not turn a successful write into a false persistence failure.
  try { updateShellProfile(); updateSidebarDaily(); updateNotificationDot(); }
  catch(err) { console.error('StudyOS saved, but a UI refresh failed:',err); }
  return true;
}
function snapshotStudyState(){try{return JSON.stringify(state);}catch{return null;}}
function saveMutationOrRollback(snapshot){
  if(saveState())return true;
  if(snapshot){
    try{state=JSON.parse(snapshot);applySettings();updateShellProfile();updateSidebarDaily();updateNotificationDot();}
    catch(err){console.error('Could not roll back a failed StudyOS mutation:',err);}
  }
  return false;
}
function loadState(username) {
  const dataKey=userDataKey(username);let raw;
  try { raw=localStorage.getItem(dataKey); }
  catch { throw new Error('Không thể đọc dữ liệu học tập trong trình duyệt. Hãy kiểm tra quyền lưu trữ của website; dữ liệu chưa được đặt lại.'); }
  let loaded=null;
  if(raw!==null&&raw!==''){
    try { loaded=JSON.parse(raw); }
    catch { throw new Error('Dữ liệu học tập của tài khoản này không đọc được. LUMEVIA đã dừng đăng nhập để tránh ghi đè dữ liệu; hãy khôi phục bản sao lưu JSON trước khi tiếp tục.'); }
    if(!loaded||typeof loaded!=='object'||Array.isArray(loaded))throw new Error('Cấu trúc dữ liệu học tập không hợp lệ. Dữ liệu gốc được giữ nguyên để tránh mất dữ liệu.');
  }
  // Establish the storage baseline only after the source record has been parsed successfully.
  lastPersistedStateRaw=raw;
  const users=readUsers();const user=Object.hasOwn(users,username.toLowerCase())?users[username.toLowerCase()]:null;
  const displayName=user?.displayName||username;const base=emptyState(displayName,user?.avatar||'🌙',user?.avatarImage||null);
  if(loaded){state={...base,...loaded,profile:{...base.profile,...(loaded.profile||{})},settings:{...base.settings,...(loaded.settings||{})}};normalizeStudyState();}
  else state=base;
}
function normalizeStudyState() {
  if(!state||typeof state!=='object')return;
  for(const key of ['tasks','completedTasks','notes','documents','resources','flashDecks','flashcards','customQuizzes','attempts','sessions','studyDays','hiddenBuiltinResources','hiddenBuiltinQuizzes','examQuestionBank','examSessions','examIntegrityRecords','examIntegrityEvents','notificationHistory','deletedItems','unlockedAchievements','reminderKeys']) if(!Array.isArray(state[key]))state[key]=[];
  state.flashDecks=state.flashDecks.filter(x=>x&&typeof x.id==='string'&&x.id.length<=120&&x.id&&typeof x.name==='string'&&x.name.trim()&&x.name.length<=80&&SUBJECTS.includes(x.subject)).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(0,500).map(x=>({id:x.id,name:x.name.trim(),subject:x.subject,createdAt:Number(x.createdAt)||Date.now()}));
  state.notificationPrefs={...defaultNotificationPrefs(),...(state.notificationPrefs&&typeof state.notificationPrefs==='object'?state.notificationPrefs:{})};
  state.notificationHistory=state.notificationHistory.filter(n=>n&&typeof n.id==='string'&&typeof n.title==='string').slice(-150);
  state.deletedItems=state.deletedItems.filter(n=>n&&typeof n.id==='string'&&n.data&&typeof n.data==='object');
  state.unlockedAchievements=[...new Set(state.unlockedAchievements.filter(v=>typeof v==='string'))];
  state.reminderKeys=[...new Set(state.reminderKeys.filter(v=>typeof v==='string'))].slice(-600);
  state.hiddenBuiltinResources=[...new Set(state.hiddenBuiltinResources.filter(id=>typeof id==='string'&&BUILTIN_RESOURCES.some(r=>r.id===id)))];
  state.hiddenBuiltinQuizzes=[...new Set(state.hiddenBuiltinQuizzes.filter(id=>typeof id==='string'&&BUILTIN_QUIZZES.some(q=>q.id===id)))];
  state.examQuestionBank=state.examQuestionBank.filter(q=>q&&typeof q==='object'&&typeof q.id==='string'&&typeof q.question==='string'&&q.question.trim()).slice(-5000);
  state.examSessions=state.examSessions.filter(x=>x&&typeof x==='object'&&typeof x.id==='string'&&Array.isArray(x.questions)&&['IN_PROGRESS','COMPLETED','TIMED_OUT','CANCELED','INTERRUPTED','PENDING_REVIEW'].includes(x.status)).slice(-100);
  state.examIntegrityRecords=state.examIntegrityRecords.filter(x=>x&&typeof x==='object'&&typeof x.key==='string'&&x.key.length<=160&&Number.isFinite(Number(x.violations))&&Number(x.violations)>=0).map(x=>({...x,violations:Math.max(0,Math.floor(Number(x.violations)||0)),lastViolationAt:Math.max(0,Number(x.lastViolationAt)||0),lockUntil:Math.max(0,Number(x.lockUntil)||0),originalDeadlineAt:Math.max(0,Number(x.originalDeadlineAt)||0)})).slice(-200);
  state.examIntegrityEvents=state.examIntegrityEvents.filter(x=>x&&typeof x==='object'&&typeof x.id==='string'&&typeof x.sessionId==='string'&&typeof x.reason==='string'&&Number.isFinite(Number(x.occurredAt))).map(x=>({id:String(x.id).slice(0,120),key:String(x.key||'').slice(0,160),sessionId:String(x.sessionId).slice(0,120),reason:['FULLSCREEN_EXIT','TAB_HIDDEN'].includes(x.reason)?x.reason:'OTHER',violationNumber:Math.max(1,Math.floor(Number(x.violationNumber)||1)),occurredAt:Number(x.occurredAt)||Date.now(),lockUntil:Math.max(0,Number(x.lockUntil)||0),originalDeadlineAt:Math.max(0,Number(x.originalDeadlineAt)||0)})).slice(-500);
  if(!['dark','light'].includes(state.settings.theme))state.settings.theme='dark';
  if(!Object.hasOwn(ACCENT_PRESETS,state.settings.accent)&&state.settings.accent!=='custom')state.settings.accent='cyan';
  state.settings.customAccent=normalizeAccentHex(state.settings.customAccent)||DEFAULT_CUSTOM_ACCENT;
  if(!Object.hasOwn(WEB_FONTS,state.settings.fontFamily))state.settings.fontFamily='system';
  if(!['small','medium','large'].includes(state.settings.fontSize))state.settings.fontSize='medium';
  if(!FOCUS_THEMES.some(theme=>theme.id===state.settings?.focusTheme))state.settings.focusTheme='forest';
  state.settings.bubbleNotifications=state.settings.bubbleNotifications!==false;
  if(![30,50,75,90].includes(Number(state.settings.wellnessThreshold)))state.settings.wellnessThreshold=50;
  if(![30,60,90,120,180,240].includes(Number(state.settings.dailyFocusGoal)))state.settings.dailyFocusGoal=120;
  if(!Number.isFinite(Number(state.settings.wellnessSnoozedUntil))||Number(state.settings.wellnessSnoozedUntil)<0)state.settings.wellnessSnoozedUntil=0;
  if(!state.settings.flashDeckListCollapsed||typeof state.settings.flashDeckListCollapsed!=='object'||Array.isArray(state.settings.flashDeckListCollapsed))state.settings.flashDeckListCollapsed={};else state.settings.flashDeckListCollapsed=Object.fromEntries(Object.entries(state.settings.flashDeckListCollapsed).filter(([key,value])=>typeof key==='string'&&key.length<=180&&typeof value==='boolean').slice(-200));
  state.profile.avatarImage=isSafeAvatarImageData(state.profile.avatarImage)?state.profile.avatarImage:null;
  state.settings.quietHoursEnabled=!!state.settings.quietHoursEnabled;
  if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(state.settings.quietHoursStart||''))state.settings.quietHoursStart='22:00';
  if(!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(state.settings.quietHoursEnd||''))state.settings.quietHoursEnd='07:00';
  // Normalize the rich-text document library while preserving user content safely.
  state.documents=state.documents.filter(d=>d&&typeof d==='object'&&typeof d.id==='string').map(d=>({
    id:d.id.slice(0,120),title:String(d.title||'Tài liệu chưa có tiêu đề').slice(0,160),
    content:sanitizeDocumentHtml(String(d.content||'')),subject:SUBJECTS.includes(d.subject)?d.subject:'Khác',
    autoTitleSeeded:!!d.autoTitleSeeded,paperOrientation:d.paperOrientation==='landscape'?'landscape':'portrait',paperMargin:[12,20,25.4].includes(Number(d.paperMargin))?Number(d.paperMargin):20,autoTitle:typeof d.autoTitle==='boolean'?d.autoTitle:['Tài liệu mới','Tài liệu chưa có tiêu đề'].includes(String(d.title||'')),paperSize:['A4','A5','Letter','Legal'].includes(d.paperSize)?d.paperSize:'A4',tags:String(d.tags||'').slice(0,180),pinned:!!d.pinned,createdAt:Number(d.createdAt)||Date.now(),updatedAt:Number(d.updatedAt)||Number(d.createdAt)||Date.now()
  }));
  // Migrate tasks marked done by older versions into the completion archive.
  // Ignore malformed records rather than letting one null entry break startup/import.
  state.completedTasks=state.completedTasks.filter(t=>t&&typeof t==='object'&&!Array.isArray(t));
  const doneIds=new Set(state.completedTasks.map(t=>t?.id).filter(id=>typeof id==='string'));
  for(const task of state.tasks.filter(t=>t&&typeof t==='object'&&t.done)) if(typeof task.id==='string'&&!doneIds.has(task.id)) state.completedTasks.push({...task,done:true,completedAt:task.completedAt||task.createdAt||Date.now(),xpClaimed:true});
  state.tasks=state.tasks.filter(t=>t&&!t.done);
  // Migrate legacy Leitner-box flashcards to spaced repetition fields without discarding progress.
  const legacyIntervals=[0,1,6,15,30,60];
  state.flashcards=state.flashcards.filter(c=>c&&typeof c==='object'&&typeof c.front==='string'&&typeof c.back==='string').map(card=>{
    const c={...card};
    if(!Number.isFinite(c.repetitions))c.repetitions=Math.max(0,Math.floor(Number(c.box)||0));
    if(!Number.isFinite(c.easeFactor))c.easeFactor=2.5;
    c.easeFactor=clamp(c.easeFactor,1.3,3.5);
    if(!Number.isFinite(c.intervalDays))c.intervalDays=legacyIntervals[clamp(Math.floor(Number(c.box)||0),0,5)]||0;
    if(!Number.isFinite(c.dueAt))c.dueAt=c.intervalDays>0?Date.now()+c.intervalDays*SRS_DAY_MS:0;
    if(!Number.isFinite(c.lapses))c.lapses=0;
    if(!Number.isFinite(c.lastReviewedAt))c.lastReviewedAt=0;
    if(!Array.isArray(c.reviewHistory))c.reviewHistory=[];
    c.subject=SUBJECTS.includes(c.subject)?c.subject:'Khác';
    const slug=String(c.subject).toLocaleLowerCase('vi').replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'')||'khac';
    c.deckId=typeof c.deckId==='string'&&c.deckId.trim()?c.deckId:`deck-default-${slug}`;
    c.deckName=typeof c.deckName==='string'&&c.deckName.trim()?c.deckName.slice(0,80):`${c.subject} · Bộ mặc định`;
    return c;
  });
  state.customQuizzes=state.customQuizzes.filter(q=>q&&typeof q==='object'&&Array.isArray(q.questions)).map(q=>({...q,subject:SUBJECTS.includes(q.subject)?q.subject:'Khác',questions:q.questions.filter(Boolean).map(item=>({...item,type:['multiple-choice','true-false','multiple-select','short-answer','fill-blank'].includes(item.type)?item.type:'multiple-choice',options:Array.isArray(item.options)?item.options:[]}))}));
  // Migrate study activity from old sessions and quiz history.
  const daySet=new Set(state.studyDays.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)));
  state.sessions.forEach(session=>{if(session?.type!=='break'&&/^\d{4}-\d{2}-\d{2}$/.test(session?.date||''))daySet.add(session.date);});
  state.attempts.forEach(attempt=>{const ts=Number(attempt?.createdAt);if(Number.isFinite(ts)&&ts>0)daySet.add(localDateKey(new Date(ts)));});
  state.flashcards.forEach(card=>{if(card.lastReviewedAt)daySet.add(localDateKey(new Date(card.lastReviewedAt)));(card.reviewHistory||[]).forEach(review=>{if(review?.at)daySet.add(localDateKey(new Date(review.at)));});});
  state.studyDays=[...daySet].sort();
  if(!Array.isArray(state.notificationReadIds))state.notificationReadIds=[];
  state.notificationReadIds=state.notificationReadIds.filter(v=>typeof v==='string').slice(-200);
  if(!Array.isArray(state.notifiedTaskKeys))state.notifiedTaskKeys=[];
  state.notifiedTaskKeys=state.notifiedTaskKeys.filter(v=>typeof v==='string').slice(-300);
  if(!Number.isFinite(state.xp))state.xp=0;
  if(!Number.isFinite(state.bestStreak))state.bestStreak=0;
  if(!Number.isFinite(state.flashReviews))state.flashReviews=0;
  state.bestStreak=Math.max(state.bestStreak,longestStreak(daySet));
}
const localDateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
function longestStreak(dayValues) {
  const days=[...new Set(dayValues)].filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort();let best=0,run=0,previous=null;
  for(const key of days){const day=Date.parse(`${key}T12:00:00Z`);if(previous!==null&&day-previous===SRS_DAY_MS)run++;else run=1;best=Math.max(best,run);previous=day;}return best;
}
function studyDaySet() {
  const days=new Set(state?.studyDays||[]);
  (state?.sessions||[]).forEach(item=>{if(item?.type!=='break'&&/^\d{4}-\d{2}-\d{2}$/.test(item?.date||''))days.add(item.date);});
  (state?.attempts||[]).forEach(item=>{const ts=Number(item?.createdAt);if(ts>0)days.add(localDateKey(new Date(ts)));});
  (state?.flashcards||[]).forEach(card=>{if(card?.lastReviewedAt)days.add(localDateKey(new Date(card.lastReviewedAt)));(card?.reviewHistory||[]).forEach(review=>{if(review?.at)days.add(localDateKey(new Date(review.at)));});});
  return days;
}
function logStudyActivity(date=todayKey()) {
  if(!state)return;const days=studyDaySet();days.add(date);state.studyDays=[...days].sort();state.bestStreak=Math.max(Number(state.bestStreak)||0,longestStreak(days));
}
function bytesToBase64(bytes) { let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b)); return btoa(bin); }
function base64ToBytes(text) { return Uint8Array.from(atob(text),c=>c.charCodeAt(0)); }
async function derivePasswordHash(password, saltBase64) {
  if (!window.crypto?.subtle || !window.crypto?.getRandomValues) throw new Error('Trình duyệt hiện tại chưa hỗ trợ mã hóa cần thiết. Hãy mở bằng HTTPS trên GitHub Pages hoặc trình duyệt mới.');
  const salt = saltBase64 ? base64ToBytes(saltBase64) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const hash=await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:180000,hash:'SHA-256'},keyMaterial,256);
  return {hash:bytesToBase64(new Uint8Array(hash)),salt:bytesToBase64(salt)};
}
function equalText(a,b) { if (typeof a!=='string'||typeof b!=='string'||a.length!==b.length) return false; let diff=0; for(let i=0;i<a.length;i++) diff|=a.charCodeAt(i)^b.charCodeAt(i); return diff===0; }
function setAuthMessage(message, isError=true) { const node=$('#authMessage'); if (!node) return; node.textContent=message; node.style.color=isError?'var(--danger)':'var(--green)'; }
function switchAuthTab(tab) {
  if(authOperationBusy)return;
  if(!['login','signup'].includes(tab))return;
  selectedAuthTab=tab;$('#loginForm').classList.toggle('hidden',tab!=='login');$('#signupForm').classList.toggle('hidden',tab!=='signup');
  $$('.auth-tab').forEach(btn=>{const on=btn.dataset.tab===tab;btn.classList.toggle('active',on);btn.setAttribute('aria-selected',String(on));});
  $('#authTitle').textContent=tab==='login'?'Mở không gian của bạn':'Bắt đầu hành trình mới';setAuthMessage('');
}
function setAuthBusy(busy, activeForm=null) {
  authOperationBusy=busy;
  $$('.auth-tab').forEach(button=>{button.disabled=busy;});
  const loginSubmit=$('#loginForm button[type="submit"]'),signupSubmit=$('#signupForm button[type="submit"]');
  if(loginSubmit){loginSubmit.disabled=busy;loginSubmit.innerHTML=busy&&activeForm==='login'?'Đang xác minh…':'Vào StudyOS <span>↗</span>';}
  if(signupSubmit){signupSubmit.disabled=busy;signupSubmit.innerHTML=busy&&activeForm==='signup'?'Đang tạo tài khoản…':'Tạo không gian học tập <span>↗</span>';}
}
function authStorageError(err, fallback) {
  const name=err?.name||'';
  if(name==='QuotaExceededError'||name==='NS_ERROR_DOM_QUOTA_REACHED')return 'Bộ nhớ trình duyệt đã đầy. Chưa thể hoàn tất thao tác; hãy xuất bản sao lưu còn truy cập được và giải phóng dung lượng rồi thử lại.';
  return err?.message||fallback;
}
async function handleSignup(event) {
  event.preventDefault();if(authOperationBusy)return;setAuthMessage('');
  const form=event.target,displayName=$('#signupDisplay').value.trim(),username=$('#signupUsername').value.trim(),password=$('#signupPassword').value,confirmation=$('#signupPasswordConfirm').value;
  if(displayName.length<2)return setAuthMessage('Tên hiển thị cần có ít nhất 2 ký tự.');
  if(!/^[A-Za-z0-9_.-]{3,24}$/.test(username))return setAuthMessage('Tên tài khoản cần từ 3–24 ký tự và chỉ dùng chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.');
  const key=username.toLowerCase();
  if(['__proto__','prototype','constructor'].includes(key))return setAuthMessage('Tên tài khoản này được dành riêng cho hệ thống. Hãy chọn tên khác.');
  if(password.length<8||password.length>128)return setAuthMessage('Mật khẩu cần từ 8 đến 128 ký tự.');
  if(password!==confirmation)return setAuthMessage('Hai mật khẩu chưa trùng khớp. Hãy kiểm tra lại.');
  setAuthBusy(true,'signup');
  let committed=false;
  try {
    const users=readUsers();
    if(Object.hasOwn(users,key))return setAuthMessage('Tên tài khoản này đã tồn tại trên trình duyệt. Hãy chọn tên khác hoặc đăng nhập.');
    const {hash,salt}=await derivePasswordHash(password);
    const dataKey=userDataKey(key);let previousData;
    try{previousData=localStorage.getItem(dataKey);}catch{throw new Error('Không thể kiểm tra dữ liệu học tập của tên tài khoản này. Hãy bật bộ nhớ cục bộ của trình duyệt rồi thử lại.');}
    let initialState;
    if(previousData!==null&&previousData!==''){
      try{initialState=JSON.parse(previousData);}catch{throw new Error('Đã có dữ liệu học tập cũ nhưng không đọc được cho tên này. Để tránh ghi đè, hãy chọn tên khác hoặc khôi phục bản sao lưu trước.');}
      if(!initialState||typeof initialState!=='object'||Array.isArray(initialState))throw new Error('Đã có dữ liệu học tập cũ không đúng cấu trúc cho tên này. Dữ liệu được giữ nguyên; hãy chọn tên khác hoặc khôi phục bản sao lưu.');
      initialState={...initialState,profile:{...(initialState.profile&&typeof initialState.profile==='object'?initialState.profile:{}),displayName}};
    } else initialState=emptyState(displayName);
    const nextData=JSON.stringify(initialState);
    // Write the data first, then commit the account index. If the index write fails,
    // restore the previous data value instead of leaving a half-created account.
    localStorage.setItem(dataKey,nextData);
    const nextUsers={...users,[key]:{displayName,avatar:'🌙',passwordHash:hash,salt,createdAt:new Date().toISOString(),version:1}};
    try{writeUsers(nextUsers);committed=true;}
    catch(writeError){
      try{localStorage.removeItem(dataKey);if(previousData!==null)localStorage.setItem(dataKey,previousData);}
      catch(rollbackError){console.error('Signup rollback needs recovery:',rollbackError);throw new Error('Không thể hoàn tất đăng ký và trình duyệt cũng chặn bước khôi phục tự động. Đừng xóa dữ liệu trình duyệt; hãy xuất/khôi phục bản sao lưu trước khi thử lại.');}
      throw writeError;
    }
    form.reset();
    try{await enterApp(key);showToast('Tài khoản đã tạo trên thiết bị này. Chào mừng bạn!','success');}
    catch(openError){console.warn('Account was saved but the workspace did not open:',openError);setAuthMessage('Tài khoản đã được lưu, nhưng không thể mở không gian học tập lúc này. Hãy đăng nhập lại; dữ liệu không bị xóa. Chi tiết: '+(openError?.message||'lỗi chưa xác định'),true);}
  } catch(err) {
    setAuthMessage(authStorageError(err,'Không thể tạo tài khoản. Hãy thử lại.'),true);
  } finally {setAuthBusy(false);}
}
async function handleLogin(event) {
  event.preventDefault();if(authOperationBusy)return;setAuthMessage('');
  const form=event.target,username=$('#loginUsername').value.trim().toLowerCase(),password=$('#loginPassword').value;
  if(!/^[a-z0-9_.-]{3,24}$/.test(username))return setAuthMessage('Hãy nhập tên tài khoản hợp lệ dài từ 3–24 ký tự.');
  if(password.length<1||password.length>128)return setAuthMessage('Hãy nhập mật khẩu từ 1 đến 128 ký tự.');
  setAuthBusy(true,'login');
  try {
    const users=readUsers(),user=Object.hasOwn(users,username)?users[username]:null;
    if(!user)return setAuthMessage('Không tìm thấy tài khoản trên trình duyệt này. Hãy kiểm tra tên hoặc tạo tài khoản mới.');
    if(typeof user.salt!=='string'||typeof user.passwordHash!=='string')return setAuthMessage('Hồ sơ tài khoản thiếu thông tin xác minh hợp lệ. Dữ liệu chưa bị thay đổi; hãy khôi phục bản sao lưu nếu có.');
    const result=await derivePasswordHash(password,user.salt);
    if(!equalText(result.hash,user.passwordHash))return setAuthMessage('Mật khẩu chưa đúng. Hãy thử lại.');
    try{await enterApp(username);form.reset();showToast(`Chào mừng trở lại, ${state.profile.displayName}!`,'success');}
    catch(openError){console.warn('Authenticated account could not open its workspace:',openError);setAuthMessage(openError?.message||'Đã xác minh mật khẩu nhưng không thể mở dữ liệu học tập. Dữ liệu gốc được giữ nguyên.',true);}
  } catch(err) {setAuthMessage(authStorageError(err,'Không thể xác minh tài khoản. Hãy kiểm tra bộ nhớ trình duyệt rồi thử lại.'),true);}
  finally {setAuthBusy(false);}
}
async function enterApp(username) {
  const normalized=String(username).toLowerCase(),previousState=state;
  // Validate and load the study record before changing the active session. Invalid
  // stored JSON must never be silently replaced with an empty profile.
  try{loadState(normalized);}catch(err){state=previousState;throw err;}
  currentUsername=normalized;pageHistory=[];updatePageBackButton();
  try{localStorage.setItem(ACTIVE_KEY,currentUsername);}
  catch{showToast('Không thể ghi nhớ phiên đăng nhập trên thiết bị này. Hãy kiểm tra dung lượng trình duyệt.','error');}
  $('#welcomeScreen').classList.add('hidden');$('#appShell').classList.remove('hidden');
  applySettings();updateShellProfile();updateHeaderDate();updateSidebarDaily();updateNotificationDot();
  const firstPage=['dashboard','planner','notes','documents','focus','vault','quiz','flashcards','stats','play','settings','profile'].includes(activePage)?activePage:'dashboard';
  renderPage(firstPage);startReminderChecks();checkMorningSummary();checkDailyNudge();restoreFocusSession();
}

function logout() {
  if(activePage==='documents'&&documentDirty&&!saveActiveDocument(true)){showToast('Không thể đăng xuất vì bản nháp đang mở chưa được lưu. Hãy tải bản nháp xuống hoặc khắc phục lỗi lưu trữ trước.','error');return;}
  if(documentSaveTimer){clearTimeout(documentSaveTimer);documentSaveTimer=null;}documentDirty=false;
  deleteModePages.clear();$('#appShell')?.classList.remove('exam-strict-active');
  if(focusStarted) stopFocus(false);
  if(notificationTimer){clearInterval(notificationTimer);notificationTimer=null;}closeNotifications(false);closeConfirmation(false,false);$('#toastRoot')?.replaceChildren();toastQueue.length=0;pageHistory=[];currentUsername='';state=null;lastPersistedStateRaw=null;activeQuiz=null;try{localStorage.removeItem(ACTIVE_KEY);}catch(err){console.warn('Could not clear remembered session:',err);}$('#appShell').classList.add('hidden');$('#welcomeScreen').classList.remove('hidden');$('#sidebar').classList.remove('open');$('#sidebarScrim').classList.remove('active');switchAuthTab('login');setAuthMessage('');activePage='dashboard';
}
function getTier(xp=state?.xp||0) {
  const tiers=[{min:0,name:'Người mới',emoji:'🌱',next:150},{min:150,name:'Tập sự',emoji:'🌿',next:400},{min:400,name:'Nhà khám phá',emoji:'🧭',next:800},{min:800,name:'Chuyên gia',emoji:'⚡',next:1400},{min:1400,name:'Expert',emoji:'✦',next:2200},{min:2200,name:'Huyền thoại tri thức',emoji:'👑',next:3500}];
  let tier=tiers[0];for(const t of tiers){if(xp>=t.min)tier=t;else break;}return {...tier,level:Math.floor(Math.max(0,xp)/XP_PER_LEVEL)+1};
}
function xpProgress() { const t=getTier(); return {tier:t,pct:clamp((state.xp-t.min)/(t.next-t.min)*100,0,100),remaining:Math.max(0,t.next-state.xp)}; }
function totalStudyMinutes() { return state.sessions.reduce((sum,s)=>sum+(Number(s.minutes)||0),0); }
function currentStreak() {
  const days=studyDaySet();let streak=0;const d=new Date();
  if(!days.has(todayKey())) d.setDate(d.getDate()-1);
  while(days.has(localDateKey(d))){streak++;d.setDate(d.getDate()-1);}
  return streak;
}
function studyEventsOn(dateKey) {
  const sessions=state.sessions.filter(s=>s.type!=='break'&&s.date===dateKey).length;
  const attempts=state.attempts.filter(a=>a.createdAt&&localDateKey(new Date(a.createdAt))===dateKey).length;
  const reviews=state.flashcards.reduce((n,c)=>n+(c.reviewHistory||[]).filter(r=>r.at&&localDateKey(new Date(r.at))===dateKey).length,0);
  return Math.max(state.studyDays?.includes(dateKey)?1:0,sessions+attempts+reviews);
}
function studyCalendarMarkup() {
  const year=studyCalendarDate.getFullYear(),month=studyCalendarDate.getMonth(),first=new Date(year,month,1),offset=(first.getDay()+6)%7,daysInMonth=new Date(year,month+1,0).getDate(),active=studyDaySet();
  const blanks=Array.from({length:offset},()=>'<span class="study-calendar-blank" aria-hidden="true"></span>');
  const days=Array.from({length:daysInMonth},(_,i)=>{const day=i+1,key=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`,count=studyEventsOn(key),isActive=active.has(key),today=key===todayKey(),level=count>=4?3:count>=2?2:count?1:0;return `<span class="study-calendar-day ${isActive?'has-study':''} ${today?'is-today':''} heat-${level}" title="${key}: ${isActive?'có hoạt động học tập':'chưa ghi nhận học tập'}${count?`, ${count} hoạt động`:''}" aria-label="${key}${isActive?', có học tập':''}"><b>${day}</b>${isActive?'<i aria-hidden="true"></i>':''}</span>`;});
  const monthName=new Intl.DateTimeFormat('vi-VN',{month:'long',year:'numeric'}).format(studyCalendarDate),activeDays=[...active].filter(key=>key.startsWith(`${year}-${String(month+1).padStart(2,'0')}-`)).length;
  return `<section class="surface study-calendar-panel"><div class="study-calendar-head"><div><p class="eyebrow">STREAK / STUDY RHYTHM</p><h2>Lịch học tập</h2><p>${activeDays} ngày có hoạt động trong tháng này · chuỗi hiện tại <strong>${currentStreak()} ngày</strong></p></div><div class="calendar-controls"><button type="button" class="icon-button" data-action="study-calendar-prev" aria-label="Tháng trước">‹</button><span class="study-calendar-month">${escapeHtml(monthName)}</span><button type="button" class="icon-button" data-action="study-calendar-next" aria-label="Tháng sau">›</button></div></div><div class="study-calendar-grid study-calendar-weekdays">${['T2','T3','T4','T5','T6','T7','CN'].map(d=>`<span>${d}</span>`).join('')}</div><div class="study-calendar-grid">${[...blanks,...days].join('')}</div><div class="study-calendar-legend"><span>Ít</span><i class="heat-1"></i><i class="heat-2"></i><i class="heat-3"></i><span>Nhiều hoạt động</span><span class="study-calendar-key"><i></i> Ngày có học</span></div><p class="study-calendar-footnote">Ngày học được ghi nhận khi bạn hoàn thành phiên Focus, làm xong quiz hoặc tự đánh giá flashcard. Đây là nhật ký thói quen, không phải điểm số về năng lực.</p></section>`;
}
function shiftStudyCalendar(offset) { const d=new Date(studyCalendarDate.getFullYear(),studyCalendarDate.getMonth()+offset,1);studyCalendarDate=d;renderPage('stats'); }
function priorityWeight(task) { return task.priority==='Cao'?3:task.priority==='Vừa'?2:1; }
function sortTasksByPriority(tasks) { return [...tasks].sort((a,b)=>priorityWeight(b)-priorityWeight(a)||(a.when||'99:99').localeCompare(b.when||'99:99')||(a.createdAt||0)-(b.createdAt||0)); }
function todayTasks() { const today=todayKey();return sortTasksByPriority(state.tasks.filter(t=>t.date===today)); }
function tasksForDate(date) { return sortTasksByPriority(state.tasks.filter(t=>t.date===date)); }
function completedForDate(date) { return state.completedTasks.filter(t=>t.date===date).sort((a,b)=>(b.completedAt||0)-(a.completedAt||0)); }
function completedTodayTasks() { return completedForDate(todayKey()).length; }
function dateLabel(date) { if(date===todayKey())return 'Hôm nay';const d=new Date(`${date}T12:00:00`);return new Intl.DateTimeFormat('vi-VN',{weekday:'short',day:'numeric',month:'short'}).format(d); }
function shiftPlannerMonth(offset) { const current=new Date(`${plannerSelectedDate}T12:00:00`),targetMonth=current.getMonth()+offset,targetYear=current.getFullYear()+Math.floor(targetMonth/12),normalizedMonth=((targetMonth%12)+12)%12,lastDay=new Date(targetYear,normalizedMonth+1,0).getDate(),next=new Date(targetYear,normalizedMonth,Math.min(current.getDate(),lastDay));plannerSelectedDate=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,'0')}-${String(next.getDate()).padStart(2,'0')}`;renderPage('planner'); }
function calendarMarkup() {
  const year=plannerMonthDate.getFullYear(),month=plannerMonthDate.getMonth(),first=new Date(year,month,1),offset=(first.getDay()+6)%7,days=new Date(year,month+1,0).getDate();
  const names=['T2','T3','T4','T5','T6','T7','CN'];
  const cells=Array.from({length:offset},()=>'<span class="calendar-blank" aria-hidden="true"></span>');
  for(let day=1;day<=days;day++){
    const key=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const active=state.tasks.filter(t=>t.date===key),completed=state.completedTasks.filter(t=>t.date===key),count=active.length+completed.length;
    const hasHigh=active.some(t=>t.priority==='Cao'),indicatorClass=hasHigh?'priority':completed.length?'complete':'scheduled';
    cells.push(`<button type="button" class="calendar-day ${key===plannerSelectedDate?'selected':''} ${key===todayKey()?'is-today':''} ${count?'has-events':''} ${hasHigh?'has-high-priority':''}" data-action="calendar-select-day" data-date="${key}" aria-label="${key}, ${active.length} việc còn lại, ${completed.length} hoàn thành" aria-pressed="${key===plannerSelectedDate}"><span>${day}</span>${count?`<i class="calendar-indicator ${indicatorClass}"></i>`:''}</button>`);
  }
  const monthName=new Intl.DateTimeFormat('vi-VN',{month:'long',year:'numeric'}).format(first);
  return `<section class="surface calendar-panel"><div class="calendar-header"><div><p class="eyebrow">YOUR STUDY CALENDAR</p><h2>${escapeHtml(monthName)}</h2></div><div class="calendar-controls"><button type="button" class="icon-button" data-action="calendar-prev" aria-label="Tháng trước">‹</button><button type="button" class="button button-soft button-small" data-action="calendar-today">Hôm nay</button><button type="button" class="icon-button" data-action="calendar-next" aria-label="Tháng sau">›</button></div></div><div class="calendar-grid calendar-weekdays">${names.map(n=>`<span>${n}</span>`).join('')}</div><div class="calendar-grid">${cells.join('')}</div><div class="calendar-legend"><span><i class="calendar-indicator scheduled"></i> Có việc đã lên lịch</span><span><i class="calendar-indicator priority"></i> Ưu tiên cao</span><span><i class="calendar-indicator complete"></i> Đã hoàn thành</span></div></section>`;
}
function todayMinutes() { return state.sessions.filter(s=>s.date===todayKey()).reduce((n,s)=>n+(Number(s.minutes)||0),0); }
function quizAccuracy() { const total=state.attempts.reduce((n,a)=>n+(Number(a.total)||0),0),correct=state.attempts.reduce((n,a)=>n+(Number(a.score)||0),0);return total?Math.round(correct/total*100):0; }
function isSafeAvatarImageData(value){return typeof value==='string'&&value.length<=600000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value);}
function avatarMarkup(profile={},extraClass=''){const cls=['avatar-image',extraClass].filter(Boolean).join(' ');return isSafeAvatarImageData(profile.avatarImage)?`<img class="${cls}" src="${profile.avatarImage}" alt="" draggable="false">`:escapeHtml(profile.avatar||'🌙');}
function updateShellProfile() {
  if(!state)return;const profile=state.profile||{};const tier=getTier();
  $('#sidebarAvatar').innerHTML=avatarMarkup(profile);$('#topAvatar').innerHTML=avatarMarkup(profile);$('#sidebarDisplay').textContent=profile.displayName||currentUsername;$('#sidebarRank').textContent=`${tier.name} · LV ${tier.level}`;
  $('#topAvatar').title=profile.displayName||currentUsername;document.body.dataset.theme=state.settings.theme==='light'?'light':'dark';
}
function applySettings() {
  if(!state)return;
  const s=state.settings||{},theme=s.theme==='light'?'light':'dark',p=currentAccentSettings(s),body=document.body;
  document.documentElement.style.setProperty('--app-font',(WEB_FONTS[s.fontFamily]||WEB_FONTS.system).family);
  body.dataset.theme=theme;
  body.dataset.accent=(Object.hasOwn(ACCENT_PRESETS,s.accent)||s.accent==='custom')?s.accent:'cyan';
  /* Inline custom properties win over all historical preset/theme CSS, in both modes. */
  body.style.setProperty('--cyan',theme==='dark'?p.dark:p.light);
  body.style.setProperty('--cyan-strong',theme==='dark'?p.darkStrong:p.lightStrong);
  body.style.setProperty('--blue',theme==='dark'?p.blueDark:p.blueLight);
  body.style.setProperty('--accent-on',theme==='dark'?'#0b1427':'#ffffff');
  document.documentElement.style.setProperty('--font-scale',s.fontSize==='small'?.92:s.fontSize==='large'?1.08:1);
  body.classList.toggle('reduce-motion',!!s.reduceMotion);body.dataset.stickers=s.stickers?'on':'off';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0b1020':'#f1f5fc');
  updateHeaderDate();
}
function updateHeaderDate() {
  const now=new Date(),clock=$('#headerClock'),date=$('#headerDate');
  if(clock)clock.textContent=new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now);
  if(date){date.textContent=new Intl.DateTimeFormat('vi-VN',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).format(now);date.dateTime=now.toISOString();}
}
function startWallClock(){
  if(wallClockTimer){clearTimeout(wallClockTimer);wallClockTimer=null;}
  if(document.hidden)return;
  updateHeaderDate();
  const delay=1000-(Date.now()%1000)+8;
  wallClockTimer=setTimeout(startWallClock,delay);
}
function updateSidebarDaily() {
  if(!state)return;const active=todayTasks().length,done=completedTodayTasks(),total=active+done;$('#sidebarDailyCount').textContent=`${done}/${total}`;$('#sidebarDailyBar').style.width=`${total?done/total*100:0}%`;
  $('#sidebarDailyHint').textContent=active?`${active} việc còn lại; ưu tiên việc quan trọng trước.`:total?'Hôm nay bạn đã hoàn tất kế hoạch!':'Thêm một việc nhỏ để bắt đầu.';
}
function safeLocalDateTime(value,fallback='Không rõ thời điểm') {
  const timestamp=value instanceof Date?value.getTime():typeof value==='string'&&value.trim()?Number(value):Number(value);
  if(!Number.isFinite(timestamp)||timestamp<=0)return fallback;
  const date=new Date(timestamp);if(Number.isNaN(date.getTime()))return fallback;
  return new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short'}).format(date);
}
function notificationHash(value) {
  let hash=2166136261;
  for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return (hash>>>0).toString(36);
}
const REMINDER_CATEGORIES=new Set(['taskReminders','deadlineReminders','morningSummary','unfinishedTasks','flashcardReview','streakReminder','flashChallenge','pomodoroBreak','wellnessBreak','nightOwl']);
function isQuietHoursActive(date=new Date()){
  const settings=state?.settings||{};if(!settings.quietHoursEnabled)return false;
  const toMinutes=value=>{const match=/^(\d{2}):(\d{2})$/.exec(String(value||''));return match?Number(match[1])*60+Number(match[2]):null;};
  const start=toMinutes(settings.quietHoursStart),end=toMinutes(settings.quietHoursEnd);if(start===null||end===null||start===end)return false;
  const now=date.getHours()*60+date.getMinutes();return start<end?now>=start&&now<end:now>=start||now<end;
}
function getNotificationItems() {
  if(!state)return [];
  const now=new Date(),today=todayKey(),items=[];
  const overdue=state.tasks.filter(t=>t&&!t.done&&/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')&&t.date<today)
    .sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  if(overdue.length&&notificationPrefEnabled('unfinishedTasks')){
    const details=overdue.slice(0,3).map(t=>t.title).filter(Boolean).join(' · ');
    const newestKey=notificationHash(overdue.map(t=>`${t.id}:${t.date}`).sort().join('|'));
    items.push({id:`overdue:${newestKey}`,category:'unfinishedTasks',kind:'overdue',icon:'!',title:`${overdue.length} việc đã quá hạn`,body:details+(overdue.length>3?' · và các việc khác':''),action:'deadlines',actionLabel:'Xem hạn chót',timeLabel:'Cần xem lại'});
  }
  const todayTasksList=state.tasks.filter(t=>t&&!t.done&&t.date===today).sort((a,b)=>String(a.when||'99:99').localeCompare(String(b.when||'99:99')));
  if(todayTasksList.length&&notificationPrefEnabled('morningSummary')){
    const details=todayTasksList.slice(0,3).map(t=>`${t.when?`${t.when} · `:''}${t.title}`).filter(Boolean).join(' • ');
    const key=notificationHash(todayTasksList.map(t=>`${t.id}:${t.when||''}`).sort().join('|'));
    items.push({id:`today:${today}:${key}`,category:'morningSummary',kind:'today',icon:'◷',title:`Kế hoạch hôm nay · ${todayTasksList.length} việc`,body:details+(todayTasksList.length>3?' • và các việc khác':''),action:'planner',actionLabel:'Mở lịch học tập',timeLabel:'Hôm nay'});
  }
  const deadlines=state.tasks.filter(t=>t?.isDeadline&&!t.done&&t.date===today).sort((a,b)=>String(a.when||'23:59').localeCompare(String(b.when||'23:59')));
  if(deadlines.length&&notificationPrefEnabled('deadlineReminders')){
    items.push({id:`deadline-today:${today}:${notificationHash(deadlines.map(t=>t.id).sort().join('|'))}`,category:'deadlineReminders',kind:'deadline',icon:'⌛',title:`${deadlines.length} deadline đến hạn hôm nay`,body:deadlines.slice(0,3).map(t=>`${t.when||'23:59'} · ${t.title}`).join(' • '),action:'deadlines',actionLabel:'Mở Deadline',timeLabel:'Hôm nay'});
  }
  const due=dueFlashcards();
  if(due.length&&notificationPrefEnabled('flashcardReview')){
    const key=notificationHash(due.map(c=>`${c.id}:${Number(c.dueAt)||0}`).sort().join('|'));
    items.push({id:`flashcards:${key}`,category:'flashcardReview',kind:'review',icon:'▤',title:`${due.length} thẻ flashcard đến hạn`,body:'Ôn lại các thẻ đang đến hạn để củng cố kiến thức theo lịch lặp lại ngắt quãng.',action:'flashcards',actionLabel:'Bắt đầu ôn tập',timeLabel:'Ôn tập'});
  }
  const read=new Set(state.notificationReadIds||[]);
  const history=(state.notificationHistory||[]).slice().reverse().map(n=>({id:n.id,isHistory:true,category:n.category||'featureUpdates',kind:n.kind||'system',icon:n.icon||'✦',title:n.title,body:n.body||'',action:n.action||'settings',actionLabel:n.actionLabel||'Xem chi tiết',timeLabel:safeLocalDateTime(n.createdAt,'Mới đây')}));
  const merged=[...history,...items];
  const seen=new Set();
  return merged.filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true;});
}
function recordNotification(title,body,category='featureUpdates',options={}) {
  if(!state||!notificationPrefEnabled(category))return false;
  if(REMINDER_CATEGORIES.has(category)&&isQuietHoursActive(new Date()))return false;
  const dedupeKey=options.dedupeKey||'';
  if(dedupeKey&&state.notificationHistory.some(n=>n.dedupeKey===dedupeKey))return false;
  const item={id:makeId('notice'),kind:options.kind||category,icon:options.icon||'✦',title:String(title||'Thông báo').slice(0,140),body:String(body||'').slice(0,700),category,action:options.action||'settings',actionLabel:options.actionLabel||'Xem chi tiết',createdAt:Date.now(),dedupeKey};
  const before=snapshotStudyState();state.notificationHistory=[...(state.notificationHistory||[]),item].slice(-150);
  if(!saveMutationOrRollback(before))return false;
  if(options.toast!==false&&state.settings.bubbleNotifications!==false){const toastType=options.toastType||(REMINDER_CATEGORIES.has(category)?'reminder':'');showToast(item.body||item.title,toastType,{label:item.actionLabel,page:item.action},{title:item.title,bubble:true,category,snooze:category==='wellnessBreak'});}
  if(options.toast===false||state.settings.bubbleNotifications===false)animateNotificationArrival();
  if(state.settings.notifications&&'Notification' in window&&Notification.permission==='granted'&&window.isSecureContext){try{new Notification(item.title,{body:item.body,icon:'lumevia-favicon.png',tag:dedupeKey||item.id});}catch(err){console.warn('Browser notification unavailable',err);}}
  return true;
}
function getBrowserPermissionStatus(){
  if(!('Notification' in window))return {value:'unsupported',permission:'unsupported',secure:window.isSecureContext===true,label:'Trình duyệt này không hỗ trợ Notification API'};
  let permission='default';
  try{permission=Notification.permission;}catch{permission='default';}
  if(!['granted','denied','default'].includes(permission))permission='default';
  const secure=window.isSecureContext===true;
  if(!secure)return {value:'insecure',permission,secure,label:'Trang chưa chạy trong môi trường HTTPS/localhost an toàn'};
  if(permission==='granted')return {value:'granted',permission,secure,label:'Website hiện tại đã được trình duyệt cấp quyền'};
  if(permission==='denied')return {value:'denied',permission,secure,label:'Quyền thông báo của website hiện tại đang bị chặn trong trình duyệt'};
  return {value:'default',permission,secure,label:'Website hiện tại chưa được cấp quyền thông báo trong trình duyệt'};
}
function browserPermissionChipLabel(status=getBrowserPermissionStatus()){
  return status.value==='granted'?'Đã cấp':status.value==='denied'?'Bị chặn':status.value==='unsupported'?'Không hỗ trợ':status.value==='insecure'?'Cần HTTPS':'Chưa cấp';
}
function browserPermissionActionLabel(status=getBrowserPermissionStatus(),systemEnabled=!!state?.settings?.notifications){
  if(status.value==='granted')return systemEnabled?'Tắt gửi thông báo':'Bật gửi thông báo';
  if(status.value==='denied')return 'Cách mở lại quyền';
  if(status.value==='unsupported')return 'Trình duyệt không hỗ trợ';
  if(status.value==='insecure')return 'Mở website qua HTTPS';
  return 'Cấp quyền cho website';
}
function browserPermissionDetails(status=getBrowserPermissionStatus()){
  const notes={
    granted:'Đã cấp quyền cho đúng địa chỉ website đang mở. Công tắc điều khiển bên dưới chỉ bật/tắt việc ứng dụng gửi thông báo hệ thống.',
    denied:'Quyền của địa chỉ website này đang bị chặn. Hãy đổi quyền trong cài đặt trang của trình duyệt; website không thể tự bỏ chặn.',
    default:'Website này chưa được cấp quyền thông báo trong trình duyệt. Bật thông báo trong ứng dụng không tự cấp quyền trình duyệt; nhấn “Cấp quyền cho website” để tiếp tục.',
    unsupported:'Trình duyệt này không hỗ trợ Notification API. Thông báo nổi và trung tâm thông báo trong trang vẫn có thể hoạt động.',
    insecure:'Thông báo hệ thống yêu cầu HTTPS hoặc localhost. Hãy mở website qua HTTPS rồi kiểm tra quyền lại.'
  };
  const origin=window.location.origin&&window.location.origin!=='null'?window.location.origin:'file:// (tệp cục bộ)';
  return `${notes[status.value]||notes.default} Địa chỉ đang kiểm tra: ${origin}.`;
}
function notificationCenterStatusText(){
  if(!state)return '';
  const permission=getBrowserPermissionStatus();
  const tasksOn=notificationPrefEnabled('taskReminders')&&state.settings.taskReminders!==false;
  const systemOn=!!state.settings.notifications;
  let systemText;
  if(permission.value==='granted')systemText=systemOn?'Gửi thông báo hệ thống trong ứng dụng: đang bật.':'Đã cấp quyền nhưng gửi thông báo hệ thống trong ứng dụng đang tắt.';
  else if(systemOn&&permission.value==='insecure'&&permission.permission==='granted')systemText='Quyền trình duyệt đã cấp, nhưng trang hiện không ở môi trường HTTPS/localhost nên không thể gửi thông báo hệ thống.';
  else if(systemOn)systemText='Công tắc gửi thông báo hệ thống đang bật nhưng chưa khả dụng cho đến khi quyền trình duyệt được cấp và môi trường đáp ứng yêu cầu.';
  else systemText='Gửi thông báo hệ thống trong ứng dụng: đang tắt.';
  const taskText=tasksOn?'Nhắc nhiệm vụ trong ứng dụng: đang bật, chỉ kiểm tra khi trang mở.':'Nhắc nhiệm vụ trong ứng dụng: đang tắt.';
  const origin=window.location.origin&&window.location.origin!=='null'?window.location.origin:'file:// (tệp cục bộ)';
  return `Quyền trình duyệt cho ${origin}: ${permission.label}. ${systemText} ${taskText}`;
}
function updateNotificationPermissionUI(){
  if(!state)return;
  const status=getBrowserPermissionStatus();
  const centerSummary=$('#notificationPermissionSummary');
  if(centerSummary)centerSummary.textContent=notificationCenterStatusText();
  const description=$('#browserPermissionDescription');
  if(description)description.textContent=browserPermissionDetails(status);
  const chip=$('#browserPermissionChip');
  if(chip){chip.className=`permission-chip permission-${status.value}`;chip.textContent=browserPermissionChipLabel(status);}
  const button=$('#browserPermissionAction');
  if(button){button.textContent=browserPermissionActionLabel(status,!!state.settings.notifications);button.disabled=status.value==='unsupported'||status.value==='insecure';button.title=status.value==='denied'?'Mở cài đặt quyền của website trong trình duyệt để cho phép lại':status.value==='default'?'Yêu cầu cấp quyền cho đúng địa chỉ website hiện tại':'';}
}
let notificationPermissionWatchStarted=false;
async function watchBrowserNotificationPermission(){
  if(notificationPermissionWatchStarted)return;
  notificationPermissionWatchStarted=true;
  try{
    if(navigator.permissions?.query){
      const permissionStatus=await navigator.permissions.query({name:'notifications'});
      const refresh=()=>updateNotificationPermissionUI();
      if(permissionStatus.addEventListener)permissionStatus.addEventListener('change',refresh);
      else permissionStatus.onchange=refresh;
    }
  }catch{/* Some browsers do not expose notification permission through Permissions API. */}
}
function refreshBrowserNotificationPermission(){updateNotificationPermissionUI();}
window.addEventListener('focus',refreshBrowserNotificationPermission);
window.addEventListener('pageshow',refreshBrowserNotificationPermission);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshBrowserNotificationPermission();startWallClock();$$('.toast').forEach(node=>node._toastStartTimer?.());if(state){checkTaskReminders();checkFlashChallenge();}}else{$$('.toast').forEach(node=>node._toastPauseTimer?.());if(wallClockTimer){clearTimeout(wallClockTimer);wallClockTimer=null;}}});
window.addEventListener('focus',()=>{refreshBrowserNotificationPermission();startWallClock();if(state){checkTaskReminders();checkFlashChallenge();}});
window.addEventListener('pageshow',startWallClock);
function updateNotificationDot() {
  if(!state)return;
  const items=getNotificationItems(),read=new Set(state.notificationReadIds||[]),unread=items.filter(item=>!read.has(item.id)).length;
  const badge=$('#notificationDot'),button=$('#notificationButton');
  if(badge){badge.textContent=unread>9?'9+':String(unread);badge.classList.toggle('hidden',unread===0);}
  if(button){button.classList.toggle('has-unread',unread>0);button.setAttribute('aria-label',unread?`Mở trung tâm thông báo, ${unread} mục chưa xem`:'Mở trung tâm thông báo');button.title=unread?`${unread} thông báo chưa xem`:'Trung tâm thông báo';}
}

function notificationCategoryMatches(category,filter){
  if(!filter||filter==='all')return true;
  const groups={
    reminders:new Set(['taskReminders','deadlineReminders','morningSummary','unfinishedTasks','flashcardReview','streakReminder','flashChallenge','pomodoroBreak','wellnessBreak','nightOwl']),
    tasks:new Set(['taskReminders','deadlineReminders','unfinishedTasks']),
    system:new Set(['storageActions','featureUpdates','achievements'])
  };
  return !!groups[filter]?.has(category);
}
function renderNotificationCenter() {
  const overlay=$('#notificationOverlay');if(!overlay||!state)return;
  const allItems=getNotificationItems(),read=new Set(state.notificationReadIds||[]),unread=allItems.filter(item=>!read.has(item.id)).length;
  const statusItems=notificationFilter==='unread'?allItems.filter(item=>!read.has(item.id)):allItems;
  const visibleItems=statusItems.filter(item=>notificationCategoryMatches(item.category||'featureUpdates',notificationCategoryFilter));
  const overdueCount=state.tasks.filter(t=>t&&!t.done&&/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')&&t.date<todayKey()).length;
  const dueCount=dueFlashcards().length;
  const permissionSummary=notificationCenterStatusText();
  const emptyTitle=notificationFilter==='unread'?'Bạn đã xem hết rồi!':notificationCategoryFilter!=='all'?'Chưa có thông báo thuộc bộ lọc này':'Không có việc nào cần nhắc lúc này';
  const emptyBody=notificationFilter==='unread'?'Tất cả thông báo hiện tại đã được đánh dấu đã xem.':notificationCategoryFilter!=='all'?'Thử chọn danh mục khác hoặc làm mới danh sách.':'Khi có việc đến hạn hoặc flashcard cần ôn, thông báo sẽ xuất hiện tại đây.';
  const categoryOptions=[['all','Tất cả danh mục'],['reminders','Nhắc lịch'],['tasks','Công việc'],['system','Hệ thống']];
  const updatesCollapsed=state.settings.notificationUpdatesCollapsed!==false;
  const statusCollapsed=state.settings.notificationStatusCollapsed!==false;
  const updatesMarkup=updatesCollapsed?'':`<section class="notification-updates" aria-labelledby="notificationUpdatesTitle"><div><p class="eyebrow">THÔNG TIN MỚI · v3.0.0</p><h3 id="notificationUpdatesTitle">Ưu tiên hiển thị các thông báo mới nhất</h3><p>Bản 3.0.0 bổ sung bộ đề theo tài liệu, phiên thi đến 1.000 câu, ảnh nền cá nhân, đồng hồ kéo thả và bản phối âm thanh riêng.</p></div></section>`;
  const statusMarkup=statusCollapsed?'':`<div class="notification-status"><span class="notification-status-dot ${!notificationPrefEnabled('taskReminders')||state.settings.taskReminders===false?'is-paused':''}" aria-hidden="true"></span><span id="notificationPermissionSummary">${escapeHtml(permissionSummary)}</span><button type="button" class="notification-settings-link" data-action="notification-go" data-page="settings">Cài đặt</button></div>`;
  const displayToggleMarkup=`<div class="notification-display-toggles" role="group" aria-label="Hiển thị thêm thông tin"><button type="button" id="notificationDisplayToggleUpdates" class="notification-display-toggle ${updatesCollapsed?'is-collapsed':'is-expanded'}" data-action="toggle-notification-panel-section" data-section="updates" aria-expanded="${!updatesCollapsed}" title="${updatesCollapsed?'Hiện phần thông tin mới nhất':'Ẩn phần thông tin mới nhất'}"><span aria-hidden="true">✧</span><span>Bản mới</span><span class="notification-toggle-state" aria-hidden="true">${updatesCollapsed?'＋':'−'}</span></button><button type="button" id="notificationDisplayToggleStatus" class="notification-display-toggle ${statusCollapsed?'is-collapsed':'is-expanded'}" data-action="toggle-notification-panel-section" data-section="status" aria-expanded="${!statusCollapsed}" title="${statusCollapsed?'Hiện trạng thái quyền thông báo':'Ẩn trạng thái quyền thông báo'}"><span aria-hidden="true">ⓘ</span><span>Trạng thái</span><span class="notification-toggle-state" aria-hidden="true">${statusCollapsed?'＋':'−'}</span></button></div>`;
  overlay.innerHTML=`<section class="notification-panel" role="dialog" aria-modal="true" aria-labelledby="notificationTitle" aria-describedby="notificationDescription"><header class="notification-panel-head"><div class="notification-heading-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></div><div class="notification-heading-copy"><p class="eyebrow">LUMEVIA · YOUR DAILY SIGNALS</p><h2 id="notificationTitle">Trung tâm thông báo</h2><p id="notificationDescription">Những điều cần chú ý, được gom lại để bạn học tập nhẹ đầu hơn.</p></div><button type="button" class="icon-button notification-close" data-action="close-notifications" aria-label="Đóng trung tâm thông báo">×</button></header><div class="notification-panel-body" id="notificationPanelBody">${updatesMarkup}<div class="notification-summary-grid"><div class="notification-summary-card"><span class="summary-card-icon summary-icon-cyan" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></span><span><small>Chưa xem</small><b>${unread}</b></span></div><div class="notification-summary-card"><span class="summary-card-icon summary-icon-red">!</span><span><small>Quá hạn</small><b>${overdueCount}</b></span></div><div class="notification-summary-card"><span class="summary-card-icon summary-icon-purple">▤</span><span><small>Thẻ cần ôn</small><b>${dueCount}</b></span></div></div><div class="notification-toolbar"><div class="notification-filter-tabs" role="group" aria-label="Lọc thông báo"><button type="button" class="notification-filter ${notificationFilter==='all'?'is-active':''}" data-action="notification-filter" data-filter="all" aria-pressed="${notificationFilter==='all'}">Tất cả <span>${allItems.length}</span></button><button type="button" class="notification-filter ${notificationFilter==='unread'?'is-active':''}" data-action="notification-filter" data-filter="unread" aria-pressed="${notificationFilter==='unread'}">Chưa xem <span>${unread}</span></button></div><label class="notification-category-filter"><span class="sr-only">Lọc theo danh mục</span><select id="notificationCategoryFilter" aria-label="Lọc theo danh mục">${categoryOptions.map(([value,label])=>`<option value="${value}" ${notificationCategoryFilter===value?'selected':''}>${label}</option>`).join('')}</select></label><button type="button" class="notification-refresh" data-action="refresh-notifications" title="Cập nhật danh sách">↻ Làm mới</button>${displayToggleMarkup}<button type="button" class="button button-ghost button-small notification-delete-mode-toggle" data-action="notification-toggle-delete-mode" aria-pressed="${notificationDeleteMode}">${notificationDeleteMode?'Tắt chế độ xóa':'Bật chế độ xóa'}</button></div><div class="notification-bulk-toolbar"><span>${selectedNotificationIds.size} thông báo đã chọn</span><button type="button" class="button button-danger button-small" data-action="notification-delete-selected" ${selectedNotificationIds.size?'':'disabled'}>Xóa nhóm đã chọn</button><button type="button" class="button button-ghost button-small" data-action="notification-clear-selection">Bỏ chọn</button></div><div class="notification-list" id="notificationList" role="region" tabindex="0" aria-label="Danh sách thông báo; dùng cuộn dọc để xem thêm">${visibleItems.length?visibleItems.map(item=>`<article class="notification-item notification-${item.kind} ${read.has(item.id)?'is-read':''}">${item.isHistory?`<label class="bulk-pick notification-bulk-pick"><input type="checkbox" data-action="notification-select-item" data-id="${escapeHtml(item.id)}" ${selectedNotificationIds.has(item.id)?'checked':''} aria-label="Chọn thông báo ${escapeHtml(item.title)}"><span></span></label>`:''}<div class="notification-item-icon" aria-hidden="true">${escapeHtml(item.icon)}</div><div class="notification-item-copy"><div class="notification-item-title"><b>${escapeHtml(item.title)}</b>${!read.has(item.id)?'<span class="notification-unread">MỚI</span>':'<span class="notification-read-label">ĐÃ XEM</span>'}</div><p>${escapeHtml(item.body||'')}</p><small>${escapeHtml(item.timeLabel)}</small><div class="notification-item-actions"><button type="button" class="notification-action" data-action="notification-go" data-page="${escapeHtml(item.action)}">${escapeHtml(item.actionLabel)} ↗</button><button type="button" class="notification-mark-one" data-action="notification-mark-item" data-id="${escapeHtml(item.id)}" ${read.has(item.id)?'disabled':''}>${read.has(item.id)?'Đã xem':'Đánh dấu đã xem'}</button>${item.isHistory?`<button type="button" class="notification-mark-one" data-action="notification-delete" data-id="${escapeHtml(item.id)}">Xóa</button>`:''}</div></div></article>`).join(''):`<div class="notification-empty"><span>✦</span><h3>${emptyTitle}</h3><p>${emptyBody}</p>${notificationFilter==='unread'?'<button type="button" class="button button-soft button-small" data-action="notification-filter" data-filter="all">Xem tất cả thông báo</button>':'<button class="button button-primary button-small" data-action="notification-go" data-page="planner">Lên kế hoạch học tập</button>'}</div>`}</div>${studyRhythmMarkup(true)}${statusMarkup}</div><footer class="notification-panel-foot"><span>${unread?`${unread} thông báo chưa xem`:'Bạn đã cập nhật mọi thông báo'}</span><div><button type="button" class="button button-ghost button-small" data-action="notification-mark-read" ${unread?'':'disabled'}>✓ Đánh dấu tất cả đã xem</button><button type="button" class="button button-soft button-small" data-action="close-notifications">Đóng</button></div></footer></section>`;
  overlay.classList.toggle('notification-delete-mode',notificationDeleteMode);overlay.classList.remove('hidden');document.body.classList.add('notification-open');$('#notificationButton')?.setAttribute('aria-expanded','true');
  updateNotificationDot();overlay.querySelector('[data-action="close-notifications"]')?.focus({preventScroll:true});
}
function closeNotifications(returnFocus=true) {
  notificationDeleteMode=false;selectedNotificationIds.clear();
  const overlay=$('#notificationOverlay');if(!overlay)return;overlay.classList.add('hidden');overlay.innerHTML='';document.body.classList.remove('notification-open');$('#notificationButton')?.setAttribute('aria-expanded','false');
  if(returnFocus)$('#notificationButton')?.focus({preventScroll:true});
}
function markNotificationsRead() {
  if(!state)return;const before=snapshotStudyState(),ids=getNotificationItems().map(item=>item.id),read=new Set(state.notificationReadIds||[]);ids.forEach(id=>read.add(id));state.notificationReadIds=[...read].slice(-200);if(!saveMutationOrRollback(before))return;renderNotificationCenter();
}
function markNotificationRead(id){
  if(!state||!id)return;const valid=getNotificationItems().some(item=>item.id===id);if(!valid)return;
  const before=snapshotStudyState(),read=new Set(state.notificationReadIds||[]);read.add(id);state.notificationReadIds=[...read].slice(-200);if(!saveMutationOrRollback(before))return;renderNotificationCenter();
}
function deleteNotification(id){if(!state||!id||!state.notificationHistory.some(n=>n.id===id))return;const before=snapshotStudyState();state.notificationHistory=state.notificationHistory.filter(n=>n.id!==id);state.notificationReadIds=(state.notificationReadIds||[]).filter(v=>v!==id);if(!saveMutationOrRollback(before))return;renderNotificationCenter();showToast('Đã xóa thông báo khỏi lịch sử.','success');}
function deleteSelectedNotifications(){
  const ids=[...selectedNotificationIds];if(!ids.length)return showToast('Hãy chọn ít nhất một thông báo đã lưu.','error');
  const valid=new Set((state.notificationHistory||[]).map(item=>item.id));if(ids.some(id=>!valid.has(id)))return showToast('Một số thông báo đã thay đổi. Hãy bỏ chọn và thử lại.','error');
  requestConfirmation({eyebrow:'TRUNG TÂM THÔNG BÁO · XÓA THEO NHÓM',title:`Xóa ${ids.length} thông báo khỏi lịch sử?`,message:'Các mục đã chọn sẽ bị loại khỏi lịch sử thông báo của tài khoản này.',detail:'Thao tác này không xóa nhiệm vụ, deadline hay flashcard được nhắc đến.',confirmLabel:'Xóa thông báo đã chọn',cancelLabel:'Giữ lại',danger:true},()=>{
    const before=snapshotStudyState(),chosen=new Set(ids);state.notificationHistory=state.notificationHistory.filter(item=>!chosen.has(item.id));state.notificationReadIds=(state.notificationReadIds||[]).filter(id=>!chosen.has(id));
    if(!saveMutationOrRollback(before))return;selectedNotificationIds.clear();renderNotificationCenter();showToast(`Đã xóa ${ids.length} thông báo khỏi lịch sử.`,'success');
  });
}
function checkTaskReminders() {
  if(!state||isQuietHoursActive(new Date()))return;
  const now=Date.now(),today=todayKey(),known=new Set(state.notifiedTaskKeys||[]);let changed=false;
  if(state.settings.taskReminders!==false&&notificationPrefEnabled('taskReminders'))for(const task of state.tasks){
    if(!task||task.done||task.isDeadline||task.date!==today||!/^([01]\d|2[0-3]):[0-5]\d$/.test(task.when||''))continue;
    const [hour,minute]=task.when.split(':').map(Number),dueAt=new Date();dueAt.setHours(hour,minute,0,0);const delta=now-dueAt.getTime(),key=`${task.date}:${task.id}`,dedupeKey=`task:${key}`;
    if(delta<0||delta>120_000||known.has(key))continue;
    // Persist the user-facing notification before marking its task as notified.
    // If persistence fails, the task key is not consumed and the reminder can retry.
    const alreadyRecorded=(state.notificationHistory||[]).some(item=>item.dedupeKey===dedupeKey);
    if(!alreadyRecorded){
      const recorded=browserNotify('Đến giờ học rồi ✦',`${task.title}${task.subject?` · ${task.subject}`:''}. Mở Lịch học tập để bắt đầu.`,'taskReminders',{action:'planner',actionLabel:'Mở lịch',dedupeKey});
      if(!recorded&&!((state.notificationHistory||[]).some(item=>item.dedupeKey===dedupeKey)))continue;
    }
    known.add(key);changed=true;
  }
  if(changed){const before=snapshotStudyState();state.notifiedTaskKeys=[...known].slice(-300);saveMutationOrRollback(before);}
  checkDeadlineReminders(now);
  checkEveningReminders(now);
}
function deadlineTimestamp(task){const time=/^([01]\d|2[0-3]):[0-5]\d$/.test(task?.when||'')?task.when:'23:59';return new Date(`${task.date}T${time}:00`).getTime();}
function checkDeadlineReminders(now=Date.now()){
  if(!state||isQuietHoursActive(new Date(now))||!notificationPrefEnabled('deadlineReminders'))return;
  const offsets=[1440,180,30];
  for(const task of state.tasks){if(!task?.isDeadline||task.done||!/^\d{4}-\d{2}-\d{2}$/.test(task.date||''))continue;
    const due=deadlineTimestamp(task);if(!Number.isFinite(due))continue;
    for(const minutes of (Array.isArray(task.reminders)?task.reminders:[1440,180,30])){if(!offsets.includes(minutes))continue;
      const key=`deadline:${task.id}:${task.date}:${task.when||'23:59'}:${minutes}`;const delta=(due-minutes*60_000)-now;
      if(delta<0||delta>45_000)continue;
      const isRecorded=(state.notificationHistory||[]).some(item=>item.dedupeKey===key);
      if(!isRecorded){
        const label=minutes===1440?'24 giờ':minutes===180?'3 giờ':'30 phút';
        const recorded=recordNotification(`Deadline sắp đến · ${label}`,`“${task.title}” đến hạn ${task.date}${task.when?` lúc ${task.when}`:''}.`,'deadlineReminders',{icon:'⌛',action:'deadlines',actionLabel:'Mở deadline',dedupeKey:key,toast:true});
        if(!recorded&&!((state.notificationHistory||[]).some(item=>item.dedupeKey===key)))continue;
      }
      if(!state.reminderKeys.includes(key)){const before=snapshotStudyState();state.reminderKeys=[...state.reminderKeys,key].slice(-600);saveMutationOrRollback(before);}
    }
  }
}
function checkEveningReminders(now=Date.now()){
  if(!state||isQuietHoursActive(new Date(now)))return;const date=todayKey(),hour=new Date(now).getHours(),minute=new Date(now).getMinutes();
  if(notificationPrefEnabled('streakReminder')&&hour===20&&minute===30&&!studyDaySet().has(date)){
    const days=studyDaySet(),yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);const ykey=localDateKey(yesterday);
    if(days.has(ykey))recordNotification('Giữ nhịp học tập của bạn','Một hoạt động ôn tập ngắn cũng đủ để ghi nhận hôm nay. Hãy giữ nhịp theo cách nhẹ nhàng.','streakReminder',{icon:'✦',action:'quiz',actionLabel:'Làm mini quiz',dedupeKey:`streak:${date}`,toast:true});
  }
  if(notificationPrefEnabled('nightOwl')&&hour===23&&minute===30&&(focusStarted||document.visibilityState==='visible'))recordNotification('Đã đến giờ nghỉ ngơi','Hãy lưu công việc và cân nhắc kết thúc phiên học. Ứng dụng sẽ không tự đóng nội dung của bạn.','nightOwl',{icon:'🌙',action:'focus',actionLabel:'Mở Focus Room',dedupeKey:`nightowl:${date}`,toast:true});
}
function wellnessStudyMinutes(dateKey=todayKey()) {
  return (state?.sessions||[]).filter(session=>session?.date===dateKey&&session.type!=='break').reduce((sum,session)=>sum+Math.max(0,Number(session.minutes)||0),0);
}
function wellnessBreakMinutes(dateKey=todayKey()) {
  return (state?.sessions||[]).filter(session=>session?.date===dateKey&&session.type==='break').reduce((sum,session)=>sum+Math.max(0,Number(session.minutes)||0),0);
}
function wellnessCue(now=Date.now()) {
  if(!state||!notificationPrefEnabled('wellnessBreak')||isQuietHoursActive(new Date(now))||Number(state.settings.wellnessSnoozedUntil||0)>now)return null;
  if(document.visibilityState==='hidden')return null;
  const today=wellnessStudyMinutes(),rest=wellnessBreakMinutes();
  const inLongFocus=focusStarted&&!focusPaused&&focusType!=='break';
  const minutes=inLongFocus?Math.floor(Math.max(0,focusInitialSeconds-focusRemaining)/60):0,threshold=Number(state.settings.wellnessThreshold)||50;
  const deferred=Number(state.settings.wellnessSnoozedUntil)||0;
  if(deferred>0&&now>=deferred&&(inLongFocus&&minutes>=threshold||!focusStarted&&today>=180&&rest<10)){
    return {key:`deferred:${deferred}`,title:'Nhắc nhẹ như bạn đã hẹn 🌿',body:'Đã qua thời gian tạm hoãn. Nếu thuận tiện, bạn có thể dành vài phút rời màn hình hoặc vận động nhẹ.',action:inLongFocus?'pause-focus':'focus',actionLabel:inLongFocus?'Tạm dừng phiên':'Mở Focus Room'};
  }
  if(inLongFocus){
    if(minutes>=threshold&&minutes<threshold+40)return {key:`session:${focusStartAt}:${threshold}`,title:'Bạn đã tập trung khá lâu rồi 🌿',body:`Bạn đã học liên tục khoảng ${minutes} phút. Thử đứng dậy, thư giãn mắt hoặc uống chút nước khi thấy phù hợp nhé.`,action:'pause-focus',actionLabel:'Tạm dừng phiên'};
    if(minutes>=threshold+40)return {key:`session:${focusStartAt}:${threshold+40}`,title:'Một khoảng nghỉ có thể rất hữu ích',body:`Phiên hiện tại đã đi qua khoảng ${minutes} phút. Bạn có thể tạm dừng để vận động nhẹ trước khi tiếp tục.`,action:'pause-focus',actionLabel:'Tạm dừng phiên'};
  }
  // A daily cumulative tip is only sent when real completed/stopped sessions have been recorded.
  if(today>=180&&rest<10&&!focusStarted){return {key:`day:${todayKey()}:180`,title:'Bạn đã dành nhiều thời gian học hôm nay ✨',body:`Đã ghi nhận ${today} phút học và ${rest} phút nghỉ trong Focus Room. Bạn có thể cân nhắc một quãng nghỉ thật sự trước phiên tiếp theo.`,action:'focus',actionLabel:'Mở Focus Room'};}
  return null;
}
function checkWellnessReminders(now=Date.now()) {
  const cue=wellnessCue(now);if(!cue)return false;
  return recordNotification(cue.title,cue.body,'wellnessBreak',{icon:'🌿',kind:'wellness',action:cue.action,actionLabel:cue.actionLabel,dedupeKey:`wellness:${cue.key}`,toast:true});
}
function snoozeWellnessReminder(minutes=20) {
  if(!state)return false;
  const before=snapshotStudyState();state.settings.wellnessSnoozedUntil=Date.now()+Math.max(5,Math.min(120,minutes))*60_000;
  if(!saveMutationOrRollback(before))return false;
  showToast(`Đã tạm hoãn lời nhắc nghỉ trong ${minutes} phút. Bạn có thể thay đổi tùy chọn trong Cài đặt.`, 'success');
  if(activePage==='settings')renderPage('settings',{recordHistory:false});
  return true;
}
function checkDailyFocusGoal() {
  if(!state||!notificationPrefEnabled('achievements'))return false;
  const goal=Number(state.settings.dailyFocusGoal)||120,minutes=wellnessStudyMinutes();
  if(minutes<goal)return false;
  return recordNotification('Bạn đã chạm mục tiêu học hôm nay ✨',`Đã ghi nhận ${minutes}/${goal} phút học trong Focus Room. Hãy tự thưởng một quãng nghỉ nếu bạn muốn.`, 'achievements',{icon:'✦',kind:'goal',action:'stats',actionLabel:'Xem tiến trình',dedupeKey:`goal:${todayKey()}:${goal}`,toast:true,toastType:'success'});
}
function studyRhythmData() {
  const tasks=todayTasks(),next=tasks.find(t=>t.priority==='Cao')||tasks[0]||null;
  const due=dueFlashcards().length,minutes=wellnessStudyMinutes(),breakMinutes=wellnessBreakMinutes();
  const goal=Number(state.settings.dailyFocusGoal)||120,progress=Math.min(100,Math.round(minutes/goal*100));
  const needsRest=minutes>=120&&breakMinutes<10;
  const recommendation=needsRest?'Bạn đã học khá nhiều. Cân nhắc nghỉ 5–10 phút trước khi bắt đầu việc tiếp theo.':minutes>=goal?'Đã đạt mục tiêu hôm nay. Bạn có thể nghỉ ngơi hoặc tiếp tục theo nhịp riêng.':next?`Một bước hợp lý tiếp theo: ${next.title}`:due?`Có ${due} thẻ tới hạn, bạn có thể ôn vài thẻ để củng cố trí nhớ.`:'Chưa có việc gấp. Hãy chọn một mục tiêu vừa sức hoặc nghỉ ngơi.';
  return {tasks:tasks.length,priority:next,flashcards:due,minutes,breakMinutes,goal,progress,needsRest,recommendation};
}
function studyRhythmMarkup(compact=false) {
  const data=studyRhythmData();
  return `<section class="study-rhythm-card ${compact?'study-rhythm-compact':''}" aria-label="Nhịp học hôm nay"><div class="study-rhythm-head"><div><p class="eyebrow">✧ STUDY RHYTHM · DỮ LIỆU THỰC</p><h3>Nhịp học hôm nay</h3><p>${escapeHtml(data.recommendation)}</p></div><span class="rhythm-symbol" aria-hidden="true">${data.needsRest?'🌿':'✦'}</span></div><div class="study-rhythm-metrics"><div><strong>${data.minutes}<small> phút</small></strong><span>Thời gian học</span></div><div><strong>${data.breakMinutes}<small> phút</small></strong><span>Thời gian nghỉ</span></div><div><strong>${data.tasks}</strong><span>Việc cần làm</span></div><div><strong>${data.flashcards}</strong><span>Thẻ cần ôn</span></div></div><div class="study-rhythm-goal"><div><span>MỤC TIÊU HÔM NAY</span><strong>${data.minutes}/${data.goal} phút · ${data.progress}%</strong></div><div class="study-rhythm-goal-track" role="progressbar" aria-label="Tiến độ thời gian học hôm nay" aria-valuemin="0" aria-valuemax="${data.goal}" aria-valuenow="${Math.min(data.minutes,data.goal)}"><span style="width:${data.progress}%"></span></div></div><div class="study-rhythm-actions"><button type="button" data-action="quick-break" data-minutes="5" class="button button-primary button-small">◷ Nghỉ 5 phút</button><button type="button" data-action="quick-break" data-minutes="10" class="button button-ghost button-small">Nghỉ 10 phút</button><button type="button" data-action="navigate" data-page="${data.tasks?'planner':data.flashcards?'flashcards':'focus'}" class="button button-ghost button-small">${data.tasks?'Xem kế hoạch':data.flashcards?'Ôn thẻ':'Vào Focus Room'} ↗</button></div></section>`;
}
function startQuickBreak(minutes=5) {
  if(focusStarted)return showToast('Bạn đang ở trong một phiên Focus Room. Hãy kết thúc phiên đó trước khi bắt đầu giờ nghỉ mới.','info');
  if(getActiveExamSession()?.status==='IN_PROGRESS')return showToast('Hãy hoàn tất bài thi đang thực hiện trước khi bắt đầu giờ nghỉ.','info');
  if(activePage==='documents'&&documentDirty&&!saveActiveDocument(true))return showToast('Bản nháp tài liệu chưa lưu được. Hãy cứu bản nháp trước khi vào giờ nghỉ.','error');
  if(!$('#notificationOverlay')?.classList.contains('hidden'))closeNotifications(false);
  beginFocus(minutes,'Thư giãn mắt và nghỉ ngơi','break','recharge',state?.settings?.focusTheme||'forest');
}
function startReminderChecks() {
  if(notificationTimer)clearInterval(notificationTimer);
  checkTaskReminders();checkFlashChallenge();checkWellnessReminders();notificationTimer=setInterval(()=>{checkTaskReminders();checkFlashChallenge();checkWellnessReminders();},15000);
}
function checkMorningSummary(){if(!state||!notificationPrefEnabled('morningSummary'))return;const now=new Date();if(now.getHours()>10)return;const pending=todayTasks().filter(t=>!t.done).length;if(pending<1)return;recordNotification('Kế hoạch buổi sáng',`${pending} nhiệm vụ đang chờ hôm nay. Hãy bắt đầu từ việc quan trọng nhất của bạn.`,'morningSummary',{icon:'☀',action:'planner',actionLabel:'Mở lịch học',dedupeKey:`morning:${todayKey()}`,toast:false});}
function prepareDailyFlashChallenge(){if(!state)return null;const date=todayKey();if(!state.dailyChallenge||state.dailyChallenge.date!==date){const before=snapshotStudyState();state.dailyChallenge={id:`flash-challenge-${date}`,date,status:'scheduled',scheduledMinute:14*60+Math.floor(Math.random()*240),target:5,rewardXp:40,startedAt:0,initialReviews:0};if(!saveMutationOrRollback(before))return null;}return state.dailyChallenge;}
function checkFlashChallenge(now=Date.now()){if(!state||isQuietHoursActive(new Date(now))||!notificationPrefEnabled('flashChallenge'))return;const challenge=prepareDailyFlashChallenge();if(!challenge)return;const minute=new Date(now).getHours()*60+new Date(now).getMinutes();if(challenge.status==='scheduled'&&document.visibilityState==='visible'&&minute>=challenge.scheduledMinute&&minute<=21*60){const before=snapshotStudyState();challenge.status='offered';if(!saveMutationOrRollback(before))return;recordNotification('⚡ Thử thách học tập hôm nay','Ôn 5 flashcard trong 10 phút để nhận thêm 40 XP. Bạn có thể bắt đầu ngay hoặc bỏ qua.','flashChallenge',{icon:'⚡',action:'start-flash-challenge',actionLabel:'Bắt đầu thử thách',dedupeKey:`flash-challenge:${challenge.date}`,toast:true});}if(challenge.status==='active'&&now>Number(challenge.startedAt)+10*60_000){const before=snapshotStudyState();challenge.status='expired';if(!saveMutationOrRollback(before))return;recordNotification('Thử thách đã hết thời gian','Không sao cả — bạn vẫn giữ tiến bộ học tập đã ghi nhận. Thử lại vào ngày khác nhé.','flashChallenge',{icon:'⏱',action:'flashcards',actionLabel:'Ôn tập bình thường',dedupeKey:`flash-challenge-expired:${challenge.date}`,toast:true});}}
function startFlashChallenge(){if(!state)return;if(!notificationPrefEnabled('flashChallenge'))return showToast('Bạn đã tắt loại thông báo thử thách trong Cài đặt.','error');const challenge=prepareDailyFlashChallenge();if(!challenge)return;if(challenge.status==='completed')return showToast('Bạn đã hoàn thành thử thách hôm nay rồi.','success');if(challenge.status==='expired'||challenge.status==='skipped')return showToast('Thử thách hôm nay đã kết thúc. Ngày mai sẽ có cơ hội mới.','error');const before=snapshotStudyState();challenge.status='active';challenge.startedAt=Date.now();challenge.initialReviews=Number(state.flashReviews)||0;challenge.target=5;challenge.rewardXp=40;if(!saveMutationOrRollback(before))return;navigate('flashcards');showToast('Thử thách bắt đầu: đánh giá 5 flashcard trong 10 phút để nhận +40 XP.','success');}
function skipFlashChallenge(){if(!state?.dailyChallenge||state.dailyChallenge.date!==todayKey())return;const before=snapshotStudyState();state.dailyChallenge.status='skipped';if(!saveMutationOrRollback(before))return;renderPage(activePage);showToast('Đã bỏ qua thử thách hôm nay. Bạn có thể học theo nhịp riêng của mình.');}
function checkFlashChallengeProgress(){const challenge=state?.dailyChallenge;if(!challenge||challenge.date!==todayKey()||challenge.status!=='active')return;if(Date.now()>Number(challenge.startedAt)+10*60_000){const before=snapshotStudyState();challenge.status='expired';if(!saveMutationOrRollback(before))return;recordNotification('Thử thách đã hết thời gian','Không sao cả — bạn vẫn giữ tiến bộ học tập đã ghi nhận.','flashChallenge',{icon:'⏱',action:'flashcards',actionLabel:'Ôn tập bình thường',dedupeKey:`flash-challenge-expired:${challenge.date}`,toast:true});return;}if((Number(state.flashReviews)||0)-Number(challenge.initialReviews||0)>=Number(challenge.target||5)){const before=snapshotStudyState();challenge.status='completed';state.xp+=Number(challenge.rewardXp)||40;if(!saveMutationOrRollback(before))return;recordNotification('🏆 Hoàn thành thử thách +40 XP','Bạn đã ôn đủ 5 flashcard trong thời gian quy định. Phần thưởng đã được cộng một lần.','flashChallenge',{icon:'🏆',action:'stats',actionLabel:'Xem tiến trình',dedupeKey:`flash-challenge-complete:${challenge.date}`,toast:true,toastType:'success'});}}
function checkDailyNudge() {
  if(!state)return;const key=`last-nudge-${todayKey()}`;let seen=false;
  try{seen=sessionStorage.getItem(key)==='1';}catch(sessionError){try{seen=localStorage.getItem(`praxilume.${key}`)==='1';}catch(storageError){console.debug('Daily nudge state is not available in this browser context.',sessionError,storageError);}}
  if(seen)return;
  try{sessionStorage.setItem(key,'1');}catch(sessionError){try{localStorage.setItem(`praxilume.${key}`,'1');}catch(storageError){console.debug('Daily nudge dismissal could not be persisted.',sessionError,storageError);}}
  const pending=todayTasks().filter(t=>!t.done).length;
  if(pending>0) showToast(`Kế hoạch hôm nay còn ${pending} việc. Chọn một việc nhỏ để bắt đầu nhé.`);else showToast('Chào mừng bạn đến StudyOS — hãy tạo một mục tiêu nhỏ cho hôm nay.');
}
function toastHeading(type=''){
  if(type==='error')return 'Cần xử lý';
  if(type==='success')return 'Thành công';
  if(type==='reminder')return 'Nhắc nhở';
  if(type==='info')return 'Thông tin';
  if(type==='warning')return 'Lưu ý';
  return 'Cập nhật';
}
function updateToastRepeatBadge(node,repeat){
  let badge=node.querySelector('.toast-repeat');
  if(repeat>1){
    if(!badge){badge=document.createElement('span');badge.className='toast-repeat';badge.setAttribute('aria-label','Số lần thông báo trùng lặp');node.querySelector('.toast-copy')?.appendChild(badge);}
    if(badge)badge.textContent=`×${repeat}`;
  }else badge?.remove();
}
function showToast(message,type='',action=null,meta={}) {
  const root=$('#toastRoot');if(!root)return;
  const text=String(message??'').trim();if(!text)return;
  const title=String(meta?.title||toastHeading(type)).trim().slice(0,100);
  {
    const duplicate=[...root.querySelectorAll('.toast')].find(node=>node.dataset.toastType===type&&node.dataset.toastTitle===title&&node.dataset.toastMessage===text);
    if(duplicate){const repeat=Number(duplicate.dataset.toastRepeat||1)+1;duplicate.dataset.toastRepeat=String(repeat);updateToastRepeatBadge(duplicate,repeat);return;}
    const queued=toastQueue.find(item=>item.type===type&&item.title===title&&item.message===text);
    if(queued){queued.repeat=(queued.repeat||1)+1;return;}
  }
  if(toastQueue.length>=40){const removable=toastQueue.findIndex(item=>item.type!=='error');toastQueue.splice(removable>=0?removable:0,1);}
  const nextToast={id:++toastSequence,title,message:text,type,action,repeat:1,bubble:meta?.bubble===true,category:meta?.category||'',snooze:meta?.snooze===true};
  if(type==='error')toastQueue.unshift(nextToast);else toastQueue.push(nextToast);
  // A storage/auth error must not wait behind three nonessential bubble notifications.
  if(type==='error'&&root.querySelectorAll('.toast').length>=3){
    const lowerPriority=[...root.querySelectorAll('.toast')].find(node=>node.dataset.toastType!=='error');
    if(lowerPriority){lowerPriority._toastPauseTimer?.();lowerPriority.remove();}
  }
  drainToastQueue();
}
function drainToastQueue(){
  const root=$('#toastRoot');if(!root)return;
  while(root.querySelectorAll('.toast').length<3&&toastQueue.length){
    const item=toastQueue.shift(),node=document.createElement('div');
    node.className=`toast ${item.type?`toast-${item.type}`:''} ${item.bubble?'toast-bubble':''}`;node.dataset.toastId=String(item.id);node.dataset.toastType=item.type||'';node.dataset.toastTitle=item.title||toastHeading(item.type);node.dataset.toastMessage=item.message;node.dataset.toastRepeat=String(item.repeat||1);
    node.setAttribute('role',item.type==='error'?'alert':'status');node.setAttribute('aria-live',item.type==='error'?'assertive':'polite');node.setAttribute('aria-atomic','true');
    const mark=document.createElement('span');mark.className='toast-mark';mark.setAttribute('aria-hidden','true');mark.textContent=item.type==='error'?'!':item.type==='success'?'✓':item.type==='reminder'?'◷':'✦';
    if(item.bubble||item.type==='reminder')mark.innerHTML=notificationBellMarkup();
    const copy=document.createElement('div');copy.className='toast-copy';
    const heading=document.createElement('strong');heading.className='toast-title';heading.textContent=item.title||toastHeading(item.type);
    const message=document.createElement('span');message.className='toast-message';message.textContent=item.message;
    copy.append(heading,message);node.append(mark,copy);updateToastRepeatBadge(node,Number(item.repeat)||1);
    const validPages=['dashboard','planner','deadlines','storage','recycle','notes','documents','focus','vault','quiz','flashcards','exam','review','stats','play','settings','profile'];
    const actionPage=['start-flash-challenge','pause-focus'].includes(item.action?.page)?item.action.page:validPages.includes(item.action?.page)?item.action.page:null;
    const timerState={timer:null,remaining:item.type==='error'?0:(item.type==='success'?4200:item.type==='reminder'?9000:item.type==='info'?5000:5800),started:0,persistent:item.type==='error'};
    const clearTimer=()=>{if(timerState.timer){clearTimeout(timerState.timer);timerState.timer=null;timerState.remaining=Math.max(0,timerState.remaining-(Date.now()-timerState.started));}};
    const dismiss=()=>{clearTimer();node.remove();drainToastQueue();};
    if(actionPage&&item.action?.label){const go=document.createElement('button');go.type='button';go.className='toast-action';go.textContent=String(item.action.label).slice(0,60);go.addEventListener('click',()=>{dismiss();if(actionPage==='start-flash-challenge')startFlashChallenge();else if(actionPage==='pause-focus'){if(focusStarted&&!focusPaused)pauseFocus();else showToast('Phiên tập trung đã tạm dừng hoặc đã kết thúc.','info');}else navigate(actionPage);});node.appendChild(go);}
    if(item.snooze){const snooze=document.createElement('button');snooze.type='button';snooze.className='toast-snooze';snooze.textContent='Nhắc sau 20 phút';snooze.addEventListener('click',()=>{if(snoozeWellnessReminder(20))dismiss();});node.appendChild(snooze);}
    const close=document.createElement('button');close.type='button';close.className='toast-dismiss';close.setAttribute('aria-label','Đóng thông báo');close.title='Đóng thông báo';close.textContent='×';close.addEventListener('click',dismiss);node.appendChild(close);
    const startTimer=()=>{if(timerState.persistent||timerState.timer||!node.isConnected||document.hidden)return;timerState.started=Date.now();timerState.timer=setTimeout(()=>{timerState.timer=null;node.remove();drainToastQueue();},timerState.remaining);};
    node._toastPauseTimer=clearTimer;node._toastStartTimer=startTimer;
    node.addEventListener('mouseenter',clearTimer);node.addEventListener('mouseleave',startTimer);node.addEventListener('focusin',clearTimer);node.addEventListener('focusout',startTimer);
    root.appendChild(node);animateNotificationArrival(node);startTimer();
  }
}
function requestConfirmation(options,onConfirm) {
  closeConfirmation(false,false);
  const config={eyebrow:'LUMEVIA · XÁC NHẬN',title:'Bạn chắc chắn chứ?',message:'Vui lòng kiểm tra lại trước khi tiếp tục.',detail:'',confirmLabel:'Xác nhận',cancelLabel:'Hủy',danger:false,...(options||{})};
  confirmationReturnFocus=document.activeElement;
  pendingConfirmation=typeof onConfirm==='function'?onConfirm:null;
  const overlay=document.createElement('div');overlay.className='confirm-overlay';overlay.id='confirmOverlay';overlay.setAttribute('role','presentation');
  overlay.innerHTML=`<section class="confirm-dialog ${config.danger?'is-danger':''}" role="alertdialog" aria-modal="true" aria-labelledby="confirmDialogTitle" aria-describedby="confirmDialogMessage" tabindex="-1"><div class="confirm-dialog-art" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 21 20H3L12 3.5Z"/><path d="M12 9v4.5M12 17h.01"/></svg></div><div class="confirm-dialog-copy"><p class="eyebrow confirm-dialog-eyebrow">${escapeHtml(config.eyebrow)}</p><h2 id="confirmDialogTitle">${escapeHtml(config.title)}</h2><p id="confirmDialogMessage">${escapeHtml(config.message)}</p>${config.detail?`<div class="confirm-dialog-detail">${escapeHtml(config.detail)}</div>`:''}</div><div class="confirm-dialog-actions"><button type="button" class="button button-ghost" data-action="confirm-cancel">${escapeHtml(config.cancelLabel)}</button><button type="button" class="button ${config.danger?'button-danger':'button-primary'}" data-action="confirm-accept">${escapeHtml(config.confirmLabel)}</button></div><p class="confirm-dialog-footnote"><span>↵</span> Chọn hành động bằng nút · <kbd>Esc</kbd> để hủy</p></section>`;
  overlay.addEventListener('click',event=>{if(event.target===overlay)closeConfirmation(false);});
  document.body.appendChild(overlay);document.body.classList.add('confirmation-open');
  overlay.querySelector('[data-action="confirm-cancel"]')?.focus({preventScroll:true});
}
function closeConfirmation(accept=false,restoreFocus=true) {
  const overlay=$('#confirmOverlay');const callback=accept?pendingConfirmation:null;pendingConfirmation=null;
  if(overlay)overlay.remove();document.body.classList.remove('confirmation-open');
  const target=confirmationReturnFocus;confirmationReturnFocus=null;
  if(restoreFocus&&target?.isConnected)target.focus({preventScroll:true});
  if(callback){try{callback();}catch(error){console.error('Confirmation action failed',error);showToast('Không thể hoàn tất thao tác. Dữ liệu chưa được thay đổi nếu thao tác chưa lưu.','error');}}
}
function browserNotify(title,body,category='taskReminders',options={}) {
  return recordNotification(title,body,category,{...options,toast:options.toast!==false,toastType:options.toastType||'success'});
}
function pageTitle(page) {
  const titles={dashboard:'Toàn cảnh',planner:'Lịch học tập',deadlines:'Deadline & Hạn chót',storage:'Storage · Kho dữ liệu',recycle:'Lịch sử xóa',notes:'Sổ ghi chú',documents:'Storage tài liệu',focus:'Focus Room',vault:'Kho tri thức',quiz:'Quiz Lab',flashcards:'Flashcards',exam:'Exam Mode',review:'Ôn tập thông minh',stats:'Tiến trình',play:'Góc giải trí',settings:'Cài đặt',profile:'Hồ sơ cá nhân'};return titles[page]||'Toàn cảnh';
}
function updatePageBackButton() {
  const button=$('#pageBackButton');if(!button)return;
  const previous=pageHistory[pageHistory.length-1],available=!!previous&&!focusStarted;
  button.disabled=!available;button.setAttribute('aria-disabled',String(!available));
  button.title=available?`Quay lại ${pageTitle(previous)}`:'Chưa có trang trước';
  button.classList.toggle('has-history',available);
}
function goBack() {
  if(focusStarted){showToast('Hãy kết thúc Focus Room trước khi quay lại.');return;}
  const protectedExam=getActiveExamSession();if(activePage==='exam'&&protectedExam?.status==='IN_PROGRESS'&&protectedExam.strictFullscreen){showToast('Strict Mode đang bật. Hãy nộp hoặc kết thúc bài thi trước khi quay lại.','warning');return;}
  const previous=pageHistory[pageHistory.length-1];
  if(previous&&previous!==activePage){
    renderPage(previous,{recordHistory:false});
    // If an unsaved draft blocks navigation, the back destination must remain available.
    if(activePage===previous)pageHistory.pop();
  }
  updatePageBackButton();
}
function navigate(page) {
  if(!['dashboard','planner','deadlines','storage','recycle','notes','documents','focus','vault','quiz','flashcards','exam','review','stats','play','settings','profile'].includes(page))return;
  // A deliberate navigation to Exam Mode returns to the blueprint; result details stay available from history.
  if(page==='exam')selectedExamResultId=null;
  const protectedExam=getActiveExamSession();if(activePage==='exam'&&page!=='exam'&&protectedExam?.status==='IN_PROGRESS'&&protectedExam.strictFullscreen){showToast('Strict Mode đang bật. Hãy nộp bài hoặc kết thúc phiên trước khi rời trang thi.','warning');return;}
  if(focusStarted && page!=='focus') { showToast('Hãy kết thúc Focus Room trước khi chuyển trang.');return; }
  $('#sidebar').classList.remove('open');$('#sidebarScrim').classList.remove('active');renderPage(page);
}
function clearDeleteSelectionForPage(page){
  if(page==='planner'){selectedTaskIds.clear();selectedCompletedTaskIds.clear();}
  else if(page==='deadlines'){selectedDeadlineIds.clear();selectedCompletedDeadlineIds.clear();}
  else if(page==='notes')selectedNoteIds.clear();
  else if(page==='documents')selectedDocumentIds.clear();
  else if(page==='vault')selectedResourceIds.clear();
  else if(page==='quiz')selectedQuizIds.clear();
  else if(page==='flashcards')selectedFlashIds.clear();
  else if(page==='storage')selectedStorageKeys.clear();
  else if(page==='recycle')selectedRecycleIds.clear();
}
function applyDeleteModeControl(page){
  const root=$('#pageContent');if(!root||!DELETE_MODE_PAGES.has(page))return;
  const examSession=page==='exam'?getActiveExamSession():null;
  if(page==='exam'&&(examSession?.status==='IN_PROGRESS'||selectedExamResultId))return;
  const host=page==='documents'?root.querySelector('.doc-tabbar'):root.querySelector('.page-heading-actions');
  if(!host)return;
  const enabled=deleteModePages.has(page),button=document.createElement('button');
  button.type='button';button.className='button button-ghost button-small delete-mode-toggle';button.dataset.action='toggle-delete-mode';button.setAttribute('aria-pressed',String(enabled));
  button.textContent=enabled?'Tắt chế độ xóa':'Bật chế độ xóa';
  button.title=enabled?'Ẩn công cụ xóa và bỏ các lựa chọn tạm thời':'Hiện công cụ chọn và xóa dữ liệu trong mục này';
  if(page==='documents')button.classList.add('doc-delete-mode-toggle');
  host.appendChild(button);
}
function toggleDeleteModeForCurrentPage(){
  const page=activePage;if(!DELETE_MODE_PAGES.has(page))return;
  if(page==='exam'&&(getActiveExamSession()?.status==='IN_PROGRESS'||selectedExamResultId))return showToast('Chế độ xóa chỉ khả dụng ở màn hình quản lý Exam Mode, không trong phiên thi hoặc kết quả.','warning');
  // Toggle state only after unsaved editor content can be persisted.
  if(page==='documents'&&documentDirty&&!saveActiveDocument(true))return;
  if(deleteModePages.has(page)){deleteModePages.delete(page);clearDeleteSelectionForPage(page);}
  else deleteModePages.add(page);
  renderPage(page,{recordHistory:false});
  showToast(deleteModePages.has(page)?'Đã bật chế độ xóa cho mục này.':'Đã tắt chế độ xóa; lựa chọn tạm đã được bỏ, không có dữ liệu nào bị xóa.','info');
}
function syncExamStrictLayout(){
  const shell=$('#appShell');if(!shell)return;
  const session=activePage==='exam'?getActiveExamSession():null;
  shell.classList.toggle('exam-strict-active',!!(session?.status==='IN_PROGRESS'&&session.strictFullscreen));
}

function renderPage(page, options={}) {
  if(!state)return;
  const flashModalFocusHint=flashStudyOpen&&document.activeElement?.closest?.('#flashStudyOverlay')?{action:document.activeElement.dataset.action||'',grade:document.activeElement.dataset.grade||''}:null;
  if(page!=='flashcards'&&flashStudyOpen)closeFlashStudyModal(false);
  const protectedExam=getActiveExamSession();
  if(activePage==='exam'&&page!=='exam'&&protectedExam?.status==='IN_PROGRESS'&&protectedExam.strictFullscreen){showToast('Bài thi đang ở Strict Mode. Hãy nộp bài hoặc kết thúc phiên trước khi chuyển trang.','warning');return;}
  if(page!=='storage'&&storageFullscreenMode){storageFullscreenMode=false;if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(error=>console.debug('Fullscreen request was rejected by the browser.',error));storageNativeFullscreen=false;}
  const previousPage=activePage;
  // Save BEFORE replacing the editor DOM (including a same-page redraw) and BEFORE adding history.
  // A failed autosave leaves documentDirty true, so later UI actions must not discard the draft.
  if(activePage==='documents'&&documentDirty&&!saveActiveDocument(true)){
    showToast('Tài liệu chưa được lưu. Hãy tải bản nháp xuống hoặc khắc phục lỗi lưu trữ trước khi chuyển màn hình.','error');
    return;
  }
  if(page!==previousPage&&options.recordHistory!==false&&['dashboard','planner','deadlines','storage','recycle','notes','documents','focus','vault','quiz','flashcards','exam','review','stats','play','settings','profile'].includes(previousPage)){
    pageHistory.push(previousPage);if(pageHistory.length>40)pageHistory.shift();
  }
  if(page!==previousPage&&DELETE_MODE_PAGES.has(previousPage)&&deleteModePages.has(previousPage)){deleteModePages.delete(previousPage);clearDeleteSelectionForPage(previousPage);}
  if(page!=='documents'){documentFocusMode=false;document.body.classList.remove('writer-open');}
  activePage=page;$('#pageCrumb').textContent=pageTitle(page);$$('.nav-token[data-page]').forEach(n=>n.classList.toggle('active',n.dataset.page===page));
  const node=$('#pageContent');
  node.classList.toggle('page-content-wide',page==='documents');node.classList.toggle('document-focus-mode',page==='documents'&&documentFocusMode);
  const pageRender={dashboard:renderDashboard,planner:renderPlanner,deadlines:renderDeadlines,storage:renderStorage,recycle:renderRecycleBin,notes:renderNotes,documents:renderDocuments,focus:renderFocusSetup,vault:renderVault,quiz:renderQuizLab,flashcards:renderFlashcards,exam:renderExamMode,review:renderSmartReview,stats:renderStats,play:renderPlay,settings:renderSettings,profile:renderProfile};
  node.innerHTML=(pageRender[page]||renderDashboard)();enhanceStudyPage(page);node.classList.toggle('delete-mode-enabled',deleteModePages.has(page));applyDeleteModeControl(page);syncExamStrictLayout();node.scrollTop=0;node.focus({preventScroll:true});applySettings();if(page==='exam')startExamLockoutCountdown();else stopExamLockoutCountdown();if(page==='notes'){filterNotes();updateNoteWritingStats();}if(page==='storage'){filterStorage();}if(page==='recycle'){filterRecycleBin();}if(page==='flashcards'&&flashStudyOpen){renderFlashStudyModal();let focusTarget=null;if(flashModalFocusHint){focusTarget=$$('#flashStudyOverlay [data-action]').find(item=>item.dataset.action===flashModalFocusHint.action&&(!flashModalFocusHint.grade||item.dataset.grade===flashModalFocusHint.grade)&&!item.disabled)||null;}if(focusTarget)focusTarget.focus({preventScroll:true});else $('.flash-study-modal-close')?.focus({preventScroll:true});}updatePageBackButton();
}
function taskMarkup(task,compact=false) {
  const calendarDeleteMode=!compact&&activePage==='planner'&&deleteModePages.has('planner');
  return `<div class="${compact?'today-task':'task-row'} ${task.done?'is-done':''} ${compact&&task.done?'done':''}" data-task-id="${escapeHtml(task.id)}">
    ${!compact?`<label class="bulk-pick task-bulk-pick" title="Chọn công việc để xóa"><input type="checkbox" data-action="task-select-item" data-id="${escapeHtml(task.id)}" ${selectedTaskIds.has(task.id)?'checked':''} aria-label="Chọn công việc để xóa: ${escapeHtml(task.title)}"><span></span></label>`:''}
    <button class="task-check ${task.done?'checked':''} ${calendarDeleteMode?'hidden':''}" data-action="toggle-task" data-id="${escapeHtml(task.id)}" aria-label="${task.done?'Đánh dấu chưa hoàn thành':'Đánh dấu hoàn thành'}">${task.done?'✓':''}</button>
    <div class="${compact?'today-task-body':'task-main'}"><b>${escapeHtml(task.title)}</b>${compact?`<small>${escapeHtml(task.when||'Chưa đặt giờ')} · ${escapeHtml(task.subject||'Khác')}</small>`:`<p>${escapeHtml(task.date===todayKey()?'Hôm nay':new Date(`${task.date}T12:00:00`).toLocaleDateString('vi-VN',{day:'2-digit',month:'short'}))}${task.when?` · ${escapeHtml(task.when)}`:''}</p><div class="task-meta"><span class="pill">${escapeHtml(task.subject||'Khác')}</span><span class="pill ${task.priority==='Cao'?'pill-amber':''}">Ưu tiên ${escapeHtml(String(task.priority||'Vừa').toLocaleLowerCase('vi'))}</span></div>`}</div>
    ${compact?`<span class="task-priority">${escapeHtml(task.priority==='Cao'?'●':'')}</span>`:`<button class="task-delete" data-action="delete-task" data-id="${escapeHtml(task.id)}" aria-label="Xóa việc">×</button>`}
  </div>`;
}
function weeklyValues() {
  const days=[];for(let offset=6;offset>=0;offset--){const d=new Date();d.setDate(d.getDate()-offset);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const min=state.sessions.filter(s=>s.date===key).reduce((n,s)=>n+(Number(s.minutes)||0),0);days.push({key,label:new Intl.DateTimeFormat('vi-VN',{weekday:'short'}).format(d).replace('.',''),date:new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit'}).format(d),minutes:min,today:key===todayKey()});}return days;
}
function weeklyBarsMarkup(wide=false) {
  const data=weeklyValues(),max=Math.max(30,...data.map(d=>d.minutes));return `<div class="${wide?'stats-chart':'weekly-bars'}">${data.map(d=>`<div class="week-day" title="${escapeHtml(d.date)}: ${d.minutes} phút"><b>${d.minutes?escapeHtml(d.minutes):'—'}</b><div class="bar-wrap"><span class="bar" style="height:${d.minutes?Math.max(5,d.minutes/max*100):3}%;${d.today?'filter:brightness(1.18)':''}"></span></div><small style="${d.today?'color:var(--cyan);font-weight:800':''}">${escapeHtml(d.label)}</small></div>`).join('')}</div>`;
}
function levelCardMarkup() {
  const p=xpProgress();return `<div class="surface surface-pad"><div class="section-heading" style="margin:0 0 16px"><div><h2>Hành trình tri thức</h2><p>Mỗi phiên học cộng thêm kinh nghiệm cho bạn.</p></div><span class="pill pill-cyan">LV ${p.tier.level}</span></div><div class="level-row"><div class="level-emblem">${p.tier.emoji}</div><div class="level-info"><h3>${escapeHtml(p.tier.name)}</h3><p>Bậc tiếp theo: ${p.tier.next===2200?'Huyền thoại tri thức':'mốc '+p.tier.next+' XP'}</p></div><span class="level-xp">${Math.floor(state.xp)} XP</span></div><div class="level-bar"><span style="width:${p.pct}%"></span></div><div class="level-footer"><span>${Math.floor(state.xp-p.tier.min)} / ${p.tier.next-p.tier.min} XP trong bậc</span><span>Còn ${p.remaining} XP</span></div></div>`;
}
function renderDashboard() {
  const tier=getTier(),tasks=todayTasks(),done=completedTodayTasks(),total=tasks.length+done,mins=todayMinutes(),streak=currentStreak(),accuracy=quizAccuracy();
  const greeting=new Date().getHours()<11?'Chào buổi sáng':new Date().getHours()<18?'Chào buổi chiều':'Chào buổi tối';
  const name=escapeHtml(state.profile.displayName||currentUsername);
  const taskPanel=tasks.length
    ? `<div class="v35-task-list">${tasks.slice(0,4).map(t=>taskMarkup(t,true)).join('')}</div>${tasks.length>4?`<p class="v35-muted">Còn ${tasks.length-4} việc khác trong lịch hôm nay.</p>`:''}`
    : done
      ? `<div class="v35-empty-mini"><span aria-hidden="true">✓</span><div><b>Đã hoàn thành việc hôm nay</b><p>${done} việc được ghi nhận. Bạn có thể nghỉ ngơi hoặc lên lịch cho ngày tiếp theo.</p></div></div>`
      : `<div class="v35-empty-mini"><span aria-hidden="true">✧</span><div><b>Hôm nay chưa có kế hoạch</b><p>Thêm một việc nhỏ để bắt đầu ngày học có mục tiêu.</p></div></div>`;
  const metric=(label,number,unit,note,kind)=>`<article class="v35-metric v35-metric-${kind} surface"><span class="v35-metric-label">${label}</span><div class="v35-metric-value">${number}<small>${unit}</small></div><span class="v35-metric-note">${note}</span></article>`;
  const tools=[
    ['focus','◷','Focus Room','Bắt đầu tập trung'],
    ['planner','▦','Lịch học','Sắp xếp công việc'],
    ['exam','◈','Exam Mode','Luyện đề thi'],
    ['flashcards','▤','Flashcards','Ôn tập ghi nhớ'],
    ['notes','✎','Ghi chú','Lưu kiến thức'],
    ['vault','⌘','Kho tri thức','Mở tài liệu']
  ];
  return `<div class="v35-dashboard" aria-label="Toàn cảnh học tập">
    <header class="dashboard-hero v35-hero ${state.settings.stickers?'sticker-decor':''}">
      <div class="v35-hero-copy">
        <p class="v35-overline"><span class="live-dot" aria-hidden="true"></span> TOÀN CẢNH HỌC TẬP <span class="v35-sep">/</span> ${escapeHtml(fmtDateLong(new Date()))}</p>
        <h1>${greeting}, <span class="gradient-text">${name}</span>.</h1>
        <p class="v35-hero-description">Mọi việc quan trọng, tiến độ và công cụ học tập trong một không gian gọn gàng.</p>
        <div class="hero-actions"><button type="button" class="button button-primary" data-action="navigate" data-page="focus">◷ Bắt đầu tập trung</button><button type="button" class="button button-ghost" data-action="navigate" data-page="planner">▦ Kế hoạch hôm nay</button></div>
      </div>
      <div class="v35-hero-level" aria-label="Cấp độ học tập hiện tại"><span class="v35-level-emoji" aria-hidden="true">${tier.emoji}</span><div><small>HÀNH TRÌNH TRI THỨC</small><strong>Cấp ${tier.level}</strong><span>${Math.floor(state.xp)} XP tích lũy</span></div></div>
    </header>
    <section class="v35-summary" aria-label="Chỉ số học tập hôm nay">
      ${metric('Thời gian tập trung',mins,'phút','Hôm nay','time')}
      ${metric('Việc đã hoàn thành',done,`/ ${total}` ,tasks.length?`${tasks.length} việc còn lại`:'Không còn việc đang chờ','tasks')}
      ${metric('Chuỗi học tập',streak,'ngày','Dựa trên phiên đã lưu','streak')}
      ${metric('Độ chính xác Quiz',accuracy,'% ',state.attempts.length?`${state.attempts.length} lượt luyện`:'Chưa có lượt luyện','quiz')}
    </section>
    <div class="v35-compass-anchor" aria-label="Gợi ý học tập thông minh"></div>
    <section class="v35-workspace" aria-label="Công việc và công cụ học tập">
      <article class="surface v35-task-panel"><header class="v35-panel-header"><div><p class="v35-overline">KẾ HOẠCH · HÔM NAY</p><h2>Việc cần ưu tiên</h2><p>${tasks.length?`${tasks.length} việc đang chờ hoàn thành.`:'Bắt đầu bằng một mục tiêu nhỏ.'}</p></div><button type="button" class="v35-text-link" data-action="navigate" data-page="planner">Mở lịch ↗</button></header>
        ${taskPanel}
        <button type="button" class="button button-ghost button-small v35-add-task" data-action="navigate" data-page="planner">＋ Thêm công việc</button>
      </article>
      <aside class="v35-tools-panel" aria-label="Công cụ truy cập nhanh"><header class="v35-panel-header"><div><p class="v35-overline">WORKSPACE / CÔNG CỤ</p><h2>Truy cập nhanh</h2><p>Chọn đúng công cụ bạn cần.</p></div></header>
        <div class="v35-tools-grid">${tools.map(([page,icon,title,desc])=>`<button type="button" class="v35-tool" data-action="navigate" data-page="${page}"><span class="v35-tool-icon" aria-hidden="true">${icon}</span><span class="v35-tool-copy"><b>${title}</b><small>${desc}</small></span><span class="v35-tool-arrow" aria-hidden="true">↗</span></button>`).join('')}</div>
      </aside>
    </section>
    <footer class="v35-dashboard-foot"><span>✦ LUMEVIA STUDYOS</span><span>Mỗi bước tiến đều được ghi nhận từ hoạt động học tập của bạn.</span><button type="button" class="v35-text-link" data-action="navigate" data-page="stats">Xem tiến trình ↗</button></footer>
  </div>`;
}

function renderPlanner() {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(plannerSelectedDate))plannerSelectedDate=todayKey();
  plannerMonthDate=new Date(`${plannerSelectedDate}T12:00:00`);plannerMonthDate.setDate(1);
  const active=tasksForDate(plannerSelectedDate),archived=completedForDate(plannerSelectedDate),isToday=plannerSelectedDate===todayKey(),total=active.length+archived.length;for(const id of [...selectedTaskIds])if(!active.some(task=>task.id===id))selectedTaskIds.delete(id);for(const id of [...selectedCompletedTaskIds])if(!archived.some(task=>task.id===id))selectedCompletedTaskIds.delete(id);
  const selectedLabel=isToday?'Hôm nay':new Intl.DateTimeFormat('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${plannerSelectedDate}T12:00:00`));
  return `<div class="page-heading"><div><p class="eyebrow">CALENDAR / DAILY FLOW</p><h1>Lịch học tập</h1><p>Chọn ngày, xác định ưu tiên và để hệ thống đưa việc quan trọng lên đầu danh sách.</p></div><div class="page-heading-actions"><button class="button button-soft" data-action="navigate" data-page="focus">◷ Focus ngay</button><button class="button button-ghost" data-action="navigate" data-page="notes">✎ Ghi chú</button></div></div>
  ${calendarMarkup()}
  <div class="planner-summary"><div><strong>${total}</strong><small>Việc đã lên lịch</small></div><div><strong>${archived.length}</strong><small>Đã hoàn tất</small></div><div><strong>${active.length}</strong><small>Còn phải làm</small></div></div>
  <div class="planner-layout"><section class="surface surface-pad"><div class="section-heading" style="margin:0 0 15px"><div><h2>${escapeHtml(selectedLabel)}</h2><p>${deleteModePages.has('planner')?'Chế độ xóa đang bật: chọn nhiệm vụ để xóa; thao tác hoàn thành tạm ẩn.':'Việc ưu tiên cao được xếp trước; giờ bắt đầu dùng để sắp xếp tiếp. Ô chọn ✓ dùng để hoàn thành nhiệm vụ.'}</p></div><span class="pill pill-cyan">${active.length} việc mở</span></div><div class="bulk-action-bar planner-bulk-bar"><div><b>${selectedTaskIds.size} công việc được chọn</b><small>Deadline cũng được đồng bộ trong lịch; các mục đã chọn sẽ vào Lịch sử xóa.</small></div><button class="button button-danger button-small" data-action="bulk-delete-tasks" ${selectedTaskIds.size?'':'disabled'}>Xóa nhóm đã chọn</button><button class="button button-ghost button-small" data-action="clear-task-selection">Bỏ chọn</button></div><div class="task-list">${active.length?active.map(t=>taskMarkup(t,false)).join(''):`<div class="empty-state"><div class="empty-icon">${archived.length?'✓':'🗓️'}</div><h3>${archived.length?'Bạn đã hoàn thành ngày này':'Ngày này đang trống'}</h3><p>${archived.length?'Việc đã hoàn thành được lưu vào lịch sử bên dưới.':'Thêm việc mới để lên kế hoạch cho ngày đã chọn.'}</p></div>`}</div>${archived.length?`<div class="completed-archive"><div class="section-heading" style="margin:18px 0 10px"><div><h3>Đã hoàn thành</h3><p>Các việc được tự động chuyển khỏi danh sách đang chờ và vẫn giữ trong lịch sử.</p></div><span class="pill">${archived.length}</span></div><div class="bulk-action-bar planner-bulk-bar"><div><b>${selectedCompletedTaskIds.size} mục hoàn thành được chọn</b><small>Xóa nhóm chỉ loại mục đã chọn khỏi lịch sử hoàn thành.</small></div><button class="button button-danger button-small" data-action="bulk-delete-completed-tasks" ${selectedCompletedTaskIds.size?'':'disabled'}>Xóa nhóm đã chọn</button><button class="button button-ghost button-small" data-action="clear-completed-task-selection">Bỏ chọn</button></div><div class="task-list">${archived.map(t=>`<div class="archived-task"><label class="bulk-pick task-bulk-pick"><input type="checkbox" data-action="completed-task-select-item" data-id="${escapeHtml(t.id)}" ${selectedCompletedTaskIds.has(t.id)?'checked':''} aria-label="Chọn lịch sử ${escapeHtml(t.title)}"><span></span></label><span class="archived-check">✓</span><div class="archived-task-copy"><b>${escapeHtml(t.title)}</b><small>${escapeHtml(t.subject||'Khác')} · ${t.completedAt?escapeHtml(new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit'}).format(new Date(t.completedAt))):'Hoàn tất'}</small></div><button class="button button-ghost button-small" data-action="restore-task" data-id="${escapeHtml(t.id)}" title="Khôi phục vào danh sách">Khôi phục</button><button class="task-delete" data-action="delete-completed-task" data-id="${escapeHtml(t.id)}" aria-label="Xóa lịch sử">×</button></div>`).join('')}</div>`:''}</section>
  <div class="grid"><section class="surface surface-pad"><h2 class="card-title">Thêm việc cho ngày đã chọn</h2><p class="card-subtitle">Đặt mức ưu tiên để hệ thống gợi ý điều cần làm trước.</p><form id="taskForm" style="margin-top:16px"><div class="form-grid"><div class="form-field full"><label for="taskTitle">Tên công việc *</label><input class="field" id="taskTitle" name="title" maxlength="120" placeholder="Ví dụ: Ôn 15 từ vựng Unit 5" required></div><div class="form-field"><label for="taskDate">Ngày</label><input class="field" type="date" id="taskDate" name="date" value="${plannerSelectedDate}" required></div><div class="form-field"><label for="taskTime">Giờ (tùy chọn)</label><input class="field" type="time" id="taskTime" name="when"></div><div class="form-field"><label for="taskSubject">Môn học</label><select class="select-field" id="taskSubject" name="subject">${SUBJECTS.map(s=>`<option value="${escapeHtml(s)}" ${s===defaultStudySubject()?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></div><div class="form-field"><label for="taskPriority">Mức ưu tiên</label><select class="select-field" id="taskPriority" name="priority"><option value="Cao">🔴 Cao — cần làm trước</option><option value="Vừa" selected>🟡 Vừa — quan trọng</option><option value="Thấp">⚪ Thấp — khi còn thời gian</option></select></div></div><div class="form-actions"><button class="button button-primary" type="submit">＋ Thêm vào lịch</button></div></form></section>
  <section class="day-brief"><h3>✧ Một ngày dễ thở hơn</h3><p>Đặt ưu tiên để giảm tải việc phải quyết định lại nhiều lần.</p><ul><li>Làm việc mức Cao trước, nếu thời gian cho phép.</li><li>Thêm giờ bắt đầu để sắp xếp những việc cùng mức ưu tiên.</li><li>Hoàn thành sẽ chuyển việc sang lịch sử và cộng XP một lần.</li></ul><button class="button button-ghost button-small" data-action="request-notifications">♧ Bật thông báo trình duyệt</button></section></div></div>`;
}

function noteWordCount(content) {
  const text=String(content||'').trim();
  return text ? text.split(/\s+/u).filter(Boolean).length : 0;
}
function noteAccentClass(subject) {
  const accents=['math','english','physics','chemistry','biology','literature','history','geography','computing','general'];
  const index=Math.max(0,SUBJECTS.indexOf(subject));
  return `note-accent-${accents[index]||'general'}`;
}
function renderNotes() {
  const notes=[...state.notes].sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||(b.updatedAt||0)-(a.updatedAt||0));
  const editing=editingNoteId?state.notes.find(n=>n.id===editingNoteId):null;
  const pinnedCount=notes.filter(n=>n.pinned).length;
  const totalWords=notes.reduce((sum,n)=>sum+noteWordCount(n.content),0);
  const subjectOptions=SUBJECTS.map(sub=>`<option value="${escapeHtml(sub)}" ${notesSubjectFilter===sub?'selected':''}>${escapeHtml(sub)}</option>`).join('');
  const title=editing?.title||'';
  const content=editing?.content||'';
  return `<div class="notes-page-shell">
    <div class="page-heading notes-page-heading"><div><p class="eyebrow"><span class="live-dot"></span> LUMEVIA / MEMORY ATLAS</p><h1>Sổ ghi chú <span class="notes-heading-spark">✦</span></h1><p>Một thư viện tri thức mang dấu ấn của riêng bạn — từ công thức nhanh đến những ý tưởng cần được phát triển.</p></div><div class="page-heading-actions"><button class="button button-ghost" data-action="export-notes-md">⇩ Xuất Markdown</button><button class="button button-primary" data-action="new-note">＋ Ghi chú mới</button></div></div>

    <section class="notes-hero" aria-label="Tổng quan sổ ghi chú"><div class="notes-hero-main"><div class="notes-hero-art" aria-hidden="true"><div class="notes-orbit notes-orbit-a"></div><div class="notes-orbit notes-orbit-b"></div><div class="notes-hero-orb"><svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 8.5h13l7 7V39H15z"/><path d="M28 8.5V16h7M20 23h10M20 28h10M20 33h7"/><path d="M10 13v29h22" opacity=".48"/></svg></div><span class="notes-art-star notes-star-one">✦</span><span class="notes-art-star notes-star-two">✧</span></div><div class="notes-hero-copy"><span class="notes-hero-kicker">YOUR KNOWLEDGE CONSTELLATION</span><h2>Giữ lại điều đáng nhớ.<br><span>Biến hiểu biết thành tiến bộ.</span></h2><p>Ghi nhanh, nối ý tưởng, tìm lại đúng lúc. Mỗi ghi chú là một mảnh ghép trong bản đồ kiến thức của bạn.</p></div></div><div class="notes-hero-stats"><div class="notes-stat"><span class="notes-stat-icon">▤</span><b>${notes.length}</b><small>Ghi chú</small></div><div class="notes-stat"><span class="notes-stat-icon notes-stat-amber">★</span><b>${pinnedCount}</b><small>Đã ghim</small></div><div class="notes-stat"><span class="notes-stat-icon notes-stat-violet">Aa</span><b>${totalWords.toLocaleString('vi-VN')}</b><small>Tổng số từ</small></div></div></section>

    <section class="notes-template-strip" aria-label="Mẫu ghi chú nhanh"><div class="notes-template-intro"><span class="notes-template-icon">✧</span><div><b>Bắt đầu nhanh</b><small>Chọn khung phù hợp với điều bạn muốn ghi lại.</small></div></div><div class="notes-template-buttons"><button class="note-template-chip" data-action="note-template" data-template="lesson"><span>📚</span> Bài học</button><button class="note-template-chip" data-action="note-template" data-template="cornell"><span>🧠</span> Cornell</button><button class="note-template-chip" data-action="note-template" data-template="formula"><span>∑</span> Công thức</button><button class="note-template-chip" data-action="note-template" data-template="question"><span>？</span> Cần hỏi</button><button class="note-template-chip" data-action="note-template" data-template="vocabulary"><span>🔤</span> Từ vựng</button></div></section>

    <div class="notes-layout notes-layout-studio"><section class="surface notes-editor notes-editor-studio"><div class="notes-editor-top"><div class="notes-editor-label"><span class="notes-editor-glyph">${editing?'✎':'✧'}</span><div><p class="eyebrow eyebrow-small">${editing?'EDIT / REFINE':'CAPTURE / CREATE'}</p><h2>${editing?'Hoàn thiện ghi chú':'Ý tưởng mới bắt đầu ở đây'}</h2><p>${editing?'Chỉnh sửa nội dung đã lưu mà vẫn giữ lịch sử ngày tạo.':'Viết theo cách của bạn. Nội dung được lưu cục bộ trên trình duyệt.'}</p></div></div><span class="notes-local-badge"><span class="live-dot"></span> Lưu riêng tư</span></div>
      <form id="noteForm" class="note-form-studio"><input type="hidden" name="noteId" value="${escapeHtml(editing?.id||'')}">
        <div class="form-field note-title-field"><label for="noteTitle">Tiêu đề ghi chú <span>*</span></label><input class="field note-title-input" id="noteTitle" name="title" maxlength="100" placeholder="Ví dụ: Vì sao phương trình bậc hai có hai nghiệm?" value="${escapeHtml(title)}" required><small class="note-field-hint">Đặt tên đủ rõ để tìm lại sau này.</small></div>
        <div class="form-field note-content-field"><div class="note-content-label-row"><label for="noteContent">Nội dung <span>*</span></label><span id="noteContentCount" class="note-writing-count">${noteWordCount(content)} từ · ${content.length} ký tự</span></div><textarea class="text-area note-content-input" id="noteContent" name="content" maxlength="12000" rows="11" placeholder="Viết điều bạn vừa hiểu, một ví dụ dễ nhớ, câu hỏi cần hỏi lại…" required>${escapeHtml(content)}</textarea><div class="note-writing-footer"><span>✧ Mẹo: một ý chính + một ví dụ + một câu hỏi sẽ giúp bạn ôn lại dễ hơn.</span><kbd>Ctrl</kbd><span>+</span><kbd>Enter</kbd><span>để lưu</span></div></div>
        <div class="form-grid note-meta-grid"><div class="form-field"><label for="noteSubject">Môn học / chủ đề</label><select class="select-field" id="noteSubject" name="subject">${SUBJECTS.map(sub=>`<option ${sub===(editing?.subject||defaultStudySubject())?'selected':''}>${escapeHtml(sub)}</option>`).join('')}</select></div><div class="form-field"><label for="noteTags">Từ khóa</label><input class="field" id="noteTags" name="tags" maxlength="100" placeholder="công thức, kiểm tra, cần ôn" value="${escapeHtml(editing?.tags||'')}"></div></div>
        <label class="note-pin-option note-pin-option-studio"><input type="checkbox" name="pinned" ${editing?.pinned?'checked':''}><span class="note-pin-star">★</span><span><b>Ghim lên đầu thư viện</b><small>Giữ ghi chú này ở vị trí dễ tìm.</small></span></label>
        <div class="form-actions note-form-actions"><button class="button button-primary note-save-button" type="submit"><span>✓</span> ${editing?'Lưu thay đổi':'Lưu ghi chú'}</button>${editing?'<button class="button button-ghost" type="button" data-action="new-note">Hủy chỉnh sửa</button>':''}</div>
      </form><div class="notes-editor-bottom"><span>▣ Chỉ lưu trên trình duyệt này</span><span>Hãy xuất bản sao lưu định kỳ trong Cài đặt.</span></div></section>

      <section class="notes-library notes-library-studio"><div class="notes-library-heading"><div><p class="eyebrow eyebrow-small">YOUR PERSONAL ARCHIVE</p><h2>Thư viện ghi chú</h2><p>Tìm kiếm, lọc và mở lại những gì bạn đã học.</p></div><span class="notes-library-count" id="noteResultCount">${notes.length} mục</span></div>
        <div class="notes-filter-panel"><div class="search-input-wrap notes-search-wrap"><span aria-hidden="true">⌕</span><input class="field" id="noteSearch" placeholder="Tìm tiêu đề, nội dung, từ khóa…" aria-label="Tìm ghi chú" value="${escapeHtml(noteSearchQuery)}"></div><div class="notes-filter-row"><label class="notes-filter-select"><span>Môn học</span><select class="select-field" id="noteSubjectFilter"><option value="all" ${notesSubjectFilter==='all'?'selected':''}>Tất cả môn học</option>${subjectOptions}</select></label><label class="notes-filter-select"><span>Sắp xếp</span><select class="select-field" id="noteSort"><option value="smart" ${notesSortMode==='smart'?'selected':''}>Đã ghim và gần đây</option><option value="recent" ${notesSortMode==='recent'?'selected':''}>Mới cập nhật</option><option value="oldest" ${notesSortMode==='oldest'?'selected':''}>Cũ nhất</option><option value="title" ${notesSortMode==='title'?'selected':''}>Tên A → Z</option></select></label><button class="note-pinned-filter ${notesPinnedOnly?'is-active':''}" id="notePinnedOnly" data-action="toggle-note-pinned-filter" aria-pressed="${notesPinnedOnly?'true':'false'}"><span>★</span> Đã ghim</button></div></div>
        <div class="notes-results-line"><span><span class="live-dot"></span> <b id="noteResultsLabel">${notes.length} ghi chú</b></span><span>Chạm <b>Xem</b> để đọc, <b>Sửa</b> để tiếp tục viết.</span></div><div class="bulk-action-bar"><div><b>${selectedNoteIds.size} ghi chú được chọn</b><small>Chọn nhiều ghi chú để chuyển cùng lúc vào Lịch sử xóa.</small></div><button class="button button-danger button-small" data-action="bulk-delete-notes" ${selectedNoteIds.size?'':'disabled'}>Xóa nhóm đã chọn</button><button class="button button-ghost button-small" data-action="clear-note-selection">Bỏ chọn</button></div>
        <div class="notes-grid notes-grid-studio" id="notesGrid">${notes.map(note=>noteCardMarkup(note)).join('')}</div>
        <div class="notes-empty-state ${notes.length?'hidden':''}" id="notesInitialEmpty"><div class="notes-empty-art">✧</div><h3>Chương đầu tiên đang chờ bạn</h3><p>Hãy lưu một công thức, một ý tưởng hay câu hỏi đầu tiên. Bộ sưu tập tri thức sẽ lớn dần theo từng buổi học.</p><button class="button button-soft button-small" data-action="note-template" data-template="lesson">＋ Bắt đầu từ mẫu bài học</button></div>
        <div class="empty-state hidden notes-search-empty" id="notesEmpty"><div class="empty-icon">⌕</div><h3>Chưa tìm thấy ghi chú phù hợp</h3><p>Thử từ khóa khác hoặc tắt bộ lọc “Đã ghim”.</p><button class="button button-ghost button-small" data-action="clear-note-filters">Xóa bộ lọc</button></div>
      </section></div>
    </div>`;
}
function noteCardMarkup(note) {
  const raw=String(note.content||'');
  const preview=raw.trim().replace(/\n{3,}/g,'\n\n').slice(0,250);
  const words=noteWordCount(raw);
  const updated=new Date(note.updatedAt||Date.now());
  const dateLabel=new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'short',year:'numeric'}).format(updated);
  const minutes=Math.max(1,Math.ceil(words/200));
  return `<article class="note-card note-card-studio ${noteAccentClass(note.subject)} ${note.pinned?'is-pinned':''}" data-note-id="${escapeHtml(note.id)}" data-note-subject="${escapeHtml(note.subject||'Khác')}" data-note-pinned="${note.pinned?'true':'false'}" data-note-updated="${Number(note.updatedAt)||0}" data-note-title="${escapeHtml(note.title||'')}" data-note-search="${escapeHtml([note.title,raw,note.subject,note.tags].join(' ').toLocaleLowerCase('vi'))}">
    <div class="note-card-accent" aria-hidden="true"></div><div class="note-card-top"><label class="bulk-pick" title="Chọn ghi chú"><input type="checkbox" data-action="note-select-item" data-id="${escapeHtml(note.id)}" ${selectedNoteIds.has(note.id)?'checked':''} aria-label="Chọn ghi chú ${escapeHtml(note.title)}"><span></span></label><span class="note-subject note-subject-studio"><span class="note-subject-dot"></span>${escapeHtml(note.subject||'Khác')}</span><button class="note-pin-button" data-action="pin-note" data-id="${escapeHtml(note.id)}" aria-label="${note.pinned?'Bỏ ghim':'Ghim'} ghi chú" title="${note.pinned?'Bỏ ghim':'Ghim'}">${note.pinned?'★':'☆'}</button></div>
    <h3>${escapeHtml(note.title||'Ghi chú chưa có tiêu đề')}</h3><p class="note-preview note-preview-studio">${escapeHtml(preview)}${raw.length>250?'…':''}</p>
    ${note.tags?`<div class="note-tags note-tags-studio">${String(note.tags).split(',').map(t=>t.trim()).filter(Boolean).slice(0,4).map(t=>`<span>#${escapeHtml(t)}</span>`).join('')}</div>`:''}
    <div class="note-card-insight"><span>≡ ${words.toLocaleString('vi-VN')} từ</span><span>◷ ${minutes} phút đọc</span></div>
    <div class="note-card-footer note-card-footer-studio"><small><span class="note-updated-dot"></span>${escapeHtml(dateLabel)}</small><div><button class="button button-soft button-small note-view-button" data-action="view-note" data-id="${escapeHtml(note.id)}">◉ Xem</button><button class="text-action note-edit-action" data-action="edit-note" data-id="${escapeHtml(note.id)}">Sửa</button><button class="task-delete" data-action="delete-note" data-id="${escapeHtml(note.id)}" aria-label="Xóa ghi chú: ${escapeHtml(note.title)}" title="Xóa ghi chú">×</button></div></div></article>`;
}
function filterNotes() {
  const query=String($('#noteSearch')?.value??noteSearchQuery).trim().toLocaleLowerCase('vi');
  if($('#noteSearch'))noteSearchQuery=$('#noteSearch').value;
  if($('#noteSubjectFilter'))notesSubjectFilter=$('#noteSubjectFilter').value||'all';
  if($('#noteSort'))notesSortMode=$('#noteSort').value||'smart';
  const grid=$('#notesGrid');
  if(!grid)return;
  const cards=$$('.note-card',grid);
  const getNote=card=>state.notes.find(n=>n.id===card.dataset.noteId);
  cards.sort((a,b)=>{
    const na=getNote(a),nb=getNote(b);if(!na||!nb)return 0;
    if(notesSortMode==='title')return String(na.title||'').localeCompare(String(nb.title||''),'vi');
    if(notesSortMode==='oldest')return (Number(na.updatedAt)||0)-(Number(nb.updatedAt)||0);
    if(notesSortMode==='recent')return (Number(nb.updatedAt)||0)-(Number(na.updatedAt)||0);
    return (Number(!!nb.pinned)-Number(!!na.pinned))||((Number(nb.updatedAt)||0)-(Number(na.updatedAt)||0));
  });
  cards.forEach(card=>grid.appendChild(card));
  let visible=0;
  cards.forEach(card=>{
    const note=getNote(card);const hay=String(card.dataset.noteSearch||'');
    const matchesQuery=!query||hay.includes(query);
    const matchesSubject=notesSubjectFilter==='all'||card.dataset.noteSubject===notesSubjectFilter;
    const matchesPinned=!notesPinnedOnly||card.dataset.notePinned==='true';
    const matches=matchesQuery&&matchesSubject&&matchesPinned;
    card.classList.toggle('hidden',!matches);if(matches)visible++;
  });
  const hasNotes=state.notes.length>0;
  $('#notesInitialEmpty')?.classList.toggle('hidden',hasNotes);
  $('#notesEmpty')?.classList.toggle('hidden',visible>0||!hasNotes);
  if($('#noteResultCount'))$('#noteResultCount').textContent=`${visible} / ${state.notes.length} mục`;
  if($('#noteResultsLabel'))$('#noteResultsLabel').textContent=`${visible} ${visible===1?'ghi chú':'ghi chú'}`;
  const pin=$('#notePinnedOnly');if(pin){pin.classList.toggle('is-active',notesPinnedOnly);pin.setAttribute('aria-pressed',String(notesPinnedOnly));}
}
function updateNoteWritingStats() {
  const content=$('#noteContent');const output=$('#noteContentCount');if(!content||!output)return;
  output.textContent=`${noteWordCount(content.value).toLocaleString('vi-VN')} từ · ${content.value.length.toLocaleString('vi-VN')} ký tự`;
}
function applyNoteTemplate(key,confirmed=false) {
  const form=$('#noteForm');if(!form)return;
  const titleField=$('#noteTitle'),contentField=$('#noteContent');if(!titleField||!contentField)return;
  if(!confirmed&&(titleField.value.trim()||contentField.value.trim())){requestConfirmation({eyebrow:'SỔ GHI CHÚ · THAY NỘI DUNG',title:'Áp dụng mẫu ghi chú?',message:'Mẫu mới sẽ thay tiêu đề và nội dung đang có trong khung soạn thảo.',detail:'Nếu còn nội dung cần giữ, hãy sao chép hoặc lưu ghi chú trước khi tiếp tục.',confirmLabel:'Áp dụng mẫu',cancelLabel:'Giữ nội dung',danger:false},()=>applyNoteTemplate(key,true));return;}
  const templates={
    lesson:{title:'Ghi chú bài học — ',subject:'Khác',content:'MỤC TIÊU BÀI HỌC\n- Hôm nay mình cần hiểu:\n\nKIẾN THỨC TRỌNG TÂM\n- Ý chính 1:\n- Ý chính 2:\n\nVÍ DỤ / DẪN CHỨNG\n\nĐIỀU MÌNH CÒN CHƯA RÕ\n-\n\nTỰ KIỂM TRA\n- Mình có thể giải thích lại điều gì mà không nhìn tài liệu?\n'},
    cornell:{title:'Cornell Notes — ',subject:'Khác',content:'CHỦ ĐỀ / NGÀY HỌC\n\nCÂU HỎI VÀ TỪ KHÓA\n-\n-\n\nGHI CHÚ CHÍNH\n-\n-\n\nTÓM TẮT BẰNG LỜI CỦA MÌNH\n\nCÂU HỎI CẦN ÔN LẠI\n-\n'},
    formula:{title:'Công thức — ',subject:'Toán',content:'TÊN CÔNG THỨC\n\nCÔNG THỨC\n\nÝ NGHĨA CÁC KÝ HIỆU\n-\n\nKHI NÀO SỬ DỤNG?\n\nVÍ DỤ MẪU\nBước 1:\nBước 2:\n\nLỖI DỄ NHẦM\n'},
    question:{title:'Câu hỏi cần làm rõ — ',subject:'Khác',content:'CÂU HỎI CỦA MÌNH\n\nMÌNH ĐÃ HIỂU ĐẾN ĐÂU?\n\nMÌNH ĐÃ THỬ CÁCH NÀO?\n\nĐIỂM CÒN VƯỚNG\n\nNGƯỜI / NGUỒN CÓ THỂ HỎI\n\nCÂU TRẢ LỜI SAU KHI LÀM RÕ\n'},
    vocabulary:{title:'Sổ từ vựng — ',subject:'Tiếng Anh',content:'TỪ / CỤM TỪ\n\nLoại từ:\nPhiên âm:\nNghĩa:\n\nVí dụ trong ngữ cảnh:\n\nTừ đồng nghĩa / trái nghĩa:\n\nCâu tự đặt:\n'}
  };
  const template=templates[key];if(!template)return;
  titleField.value=template.title;contentField.value=template.content;
  const subject=$('#noteSubject');if(subject){const option=[...subject.options].find(o=>o.textContent===template.subject);if(option)subject.value=option.value;}
  updateNoteWritingStats();titleField.focus();showToast('Đã chèn mẫu ghi chú. Hãy đặt tên và hoàn thiện nội dung.','success');
}
function noteMarkdown(note) {
  return [`# ${note.title||'Ghi chú không tiêu đề'}`,``,`- **Môn/chủ đề:** ${note.subject||'Khác'}`,`- **Từ khóa:** ${note.tags||'—'}`,`- **Ghim:** ${note.pinned?'Có':'Không'}`,`- **Cập nhật:** ${new Date(note.updatedAt||Date.now()).toLocaleString('vi-VN')}`,``,String(note.content||''),``].join('\n');
}
function exportSingleNoteMarkdown(noteId) {
  const note=state.notes.find(n=>n.id===noteId);if(!note)return;
  const slug=String(note.title||'ghi-chu').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,45)||'ghi-chu';
  const blob=new Blob(['\ufeff',noteMarkdown(note)],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${slug}.md`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Đã xuất ghi chú thành Markdown.','success');
}
async function copyNote(noteId) {
  const note=state.notes.find(n=>n.id===noteId);if(!note)return;
  const text=noteMarkdown(note);
  try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else throw new Error('clipboard unavailable');showToast('Đã sao chép ghi chú vào bộ nhớ tạm.','success');}
  catch{const temp=document.createElement('textarea');temp.value=text;temp.setAttribute('readonly','');temp.style.position='fixed';temp.style.opacity='0';document.body.appendChild(temp);temp.select();let ok=false;try{ok=document.execCommand('copy');}catch(fallbackError){console.debug('Legacy clipboard command failed.',fallbackError);}temp.remove();showToast(ok?'Đã sao chép ghi chú vào bộ nhớ tạm.':'Trình duyệt không cho phép sao chép tự động. Hãy thử qua HTTPS hoặc chọn nội dung để sao chép.',ok?'success':'error');}
}
function openNoteViewer(noteId) {
  const note=state.notes.find(n=>n.id===noteId);if(!note)return;
  closeNoteViewer();const overlay=document.createElement('div');overlay.className='note-viewer-overlay';overlay.id='noteViewerOverlay';overlay.setAttribute('role','presentation');
  overlay.innerHTML=`<section class="note-viewer-modal note-viewer-modal-studio ${noteAccentClass(note.subject)}" role="dialog" aria-modal="true" aria-labelledby="noteViewerTitle"><div class="note-viewer-top"><span class="note-subject note-subject-studio"><span class="note-subject-dot"></span>${escapeHtml(note.subject||'Khác')}</span><button class="note-viewer-close" data-action="close-note-viewer" aria-label="Đóng ghi chú">×</button></div><p class="eyebrow eyebrow-small note-viewer-eyebrow">LUMEVIA / NOTE DETAIL</p><h2 id="noteViewerTitle">${escapeHtml(note.title)}</h2><div class="note-viewer-meta">Cập nhật ${escapeHtml(new Intl.DateTimeFormat('vi-VN',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(note.updatedAt||Date.now())))} · ${noteWordCount(note.content)} từ</div>${note.tags?`<div class="note-tags note-tags-studio">${String(note.tags).split(',').map(t=>t.trim()).filter(Boolean).slice(0,8).map(t=>`<span>#${escapeHtml(t)}</span>`).join('')}</div>`:''}<div class="note-viewer-content note-viewer-content-studio">${escapeHtml(note.content)}</div><div class="note-viewer-actions"><button class="button button-ghost" data-action="copy-note" data-id="${escapeHtml(note.id)}">⧉ Sao chép</button><button class="button button-ghost" data-action="export-note-md-one" data-id="${escapeHtml(note.id)}">⇩ Markdown</button><button class="button button-ghost" data-action="close-note-viewer">Đóng</button><button class="button button-primary" data-action="edit-note" data-id="${escapeHtml(note.id)}">✎ Chỉnh sửa</button></div></section>`;
  overlay.addEventListener('click',event=>{if(event.target===overlay)closeNoteViewer();});document.body.appendChild(overlay);overlay.querySelector('.note-viewer-close')?.focus();
}
function closeNoteViewer(){document.getElementById('noteViewerOverlay')?.remove();}
function renderFocusSetup() {
  const theme=getFocusTheme(state?.settings?.focusTheme||'forest');
  const todaySessionList=(state?.sessions||[]).filter(session=>session.date===todayKey());
  const todayFocusMinutes=todaySessionList.reduce((sum,session)=>sum+Number(session.minutes||0),0);
  const completedSessions=todaySessionList.filter(session=>session.completed).length;
  const currentTier=getTier();
  return `<div class="page-heading"><div><p class="eyebrow">DEEP WORK / QUIET MODE / AMBIENCE STUDIO</p><h1>Focus Room</h1><p>Chọn một khung cảnh. Đặt một mục tiêu. Dành thời gian cho điều quan trọng.</p></div><div class="page-heading-actions"><span class="pill pill-cyan">${FOCUS_THEMES.length} bối cảnh</span><span class="pill">↺ Khôi phục phiên dang dở</span></div></div>
  <section class="surface focus-preview-card focus-preview-card-deluxe" data-focus-theme="${theme.id}"><div class="focus-preview-copy"><span class="pill pill-cyan">✦ LUMEVIA FOCUS STUDIO 2.0</span><h2>Một việc. Một khoảng thời gian.<br><span class="gradient-text">Một khoảng lặng dành cho bạn.</span></h2><p>Giữ một mục tiêu trong tầm mắt. Điều chỉnh ánh sáng, âm thanh và độ tĩnh của không gian mà không làm gián đoạn phiên học.</p><div class="focus-preview-meta"><span class="pill" id="focusPreviewThemeName">${theme.icon} ${escapeHtml(theme.name)}</span><span class="pill">${escapeHtml(theme.vibe||'Dịu mắt · giàu chiều sâu')}</span><span class="pill">LEVEL ${currentTier.level} · ${escapeHtml(currentTier.name)}</span></div><div class="focus-preview-stats"><div><strong>${FOCUS_THEMES.length}</strong><small>bối cảnh có sẵn</small></div><div><strong>${todayFocusMinutes}</strong><small>phút hôm nay</small></div><div><strong>${completedSessions}</strong><small>phiên hoàn tất</small></div><div><strong>${currentStreak()}</strong><small>ngày liên tiếp</small></div></div></div><div class="focus-preview-art"><div class="focus-preview-scene"><span class="focus-preview-scene-label" id="focusPreviewSceneLabel">${theme.icon} ${escapeHtml(theme.name)}</span><div class="preview-timer"><strong id="previewFocusTime">25:00</strong><small>DEEP FOCUS</small></div><p class="focus-preview-scene-copy" id="focusPreviewSceneCopy">${escapeHtml(theme.desc)}</p></div></div></section>
  <div class="focus-studio-grid"><section class="surface focus-form"><div class="section-heading" style="margin:0 0 5px"><div><p class="eyebrow">SESSION BUILDER</p><h2>Thiết lập phiên học</h2><p>Chọn kiểu phiên, thời gian và nhịp gợi ý phù hợp với trạng thái hiện tại.</p></div></div><div class="preset-row"><button class="preset-button" data-action="focus-preset" data-minutes="15">15 phút · Khởi động</button><button class="preset-button selected" data-action="focus-preset" data-minutes="25">25 phút · Pomodoro</button><button class="preset-button" data-action="focus-preset" data-minutes="45">45 phút · Chuyên sâu</button><button class="preset-button" data-action="focus-preset" data-minutes="60">60 phút · Bền bỉ</button><button class="preset-button" data-action="focus-preset" data-minutes="90">90 phút · Deep Work</button></div><form id="focusForm"><div class="form-grid"><div class="form-field"><label for="focusSubject">Bạn sẽ làm gì?</label><input class="field" id="focusSubject" name="subject" maxlength="80" placeholder="Ví dụ: Ôn từ vựng Unit 5" value="Ôn tập kiến thức"></div><div class="form-field"><label for="focusMinutes">Thời gian (phút)</label><input class="field" id="focusMinutes" name="minutes" type="number" min="1" max="180" value="25" required></div><div class="form-field"><label for="focusMode">Kiểu phiên</label><select class="select-field" id="focusMode" name="mode"><option value="focus">Tập trung sâu</option><option value="review">Ôn tập chủ động</option><option value="break">Nghỉ ngắn</option></select></div><div class="form-field"><label for="focusAmbient">Nhịp gợi ý trong phòng</label><select class="select-field" id="focusAmbient" name="ambient"><option value="gentle">Nhẹ nhàng, khích lệ</option><option value="minimal">Tối giản, ít chữ</option><option value="starry">Bầu trời sao</option><option value="ritual">Nghi thức tập trung</option><option value="recharge">Hồi phục năng lượng</option></select></div></div><div class="form-actions"><button class="button button-primary" type="submit">✦ Bắt đầu Focus Room <span>↗</span></button></div></form></section><section class="surface focus-boost-panel"><div class="section-heading" style="margin:0 0 8px"><div><p class="eyebrow">WHY THIS ROOM WORKS</p><h2>Nâng cấp trải nghiệm tập trung</h2><p>Không chỉ đổi màu nền — toàn bộ trải nghiệm được thiết kế để giữ nhịp học của bạn.</p></div></div><div class="focus-boost-list"><article><span>▣</span><div><strong>Phong cảnh thật, lưu cùng ứng dụng</strong><p>Ảnh thiên nhiên được tối ưu, tải theo cảnh bạn chọn. 14 bối cảnh bằng ảnh thật: 10 cảnh mới và 4 cảnh được giữ lại.</p></div></article><article><span>↺</span><div><strong>Khôi phục phiên dang dở</strong><p>Nếu tải lại trang hoặc chuyển thẻ trình duyệt, Focus Room có thể khôi phục phiên học thay vì bắt đầu lại từ đầu.</p></div></article><article><span>✓</span><div><strong>Bám theo việc hôm nay</strong><p>Danh sách nhiệm vụ ngày hiện ngay bên trong Focus Room để bạn không cần nhảy qua màn khác.</p></div></article><article><span>✦</span><div><strong>Thống kê được ghi nhận</strong><p>Thời lượng hoàn thành, XP và tiến độ học vẫn được lưu như một phần của toàn hệ thống.</p></div></article></div></section></div>
  <section class="surface focus-theme-panel"><div class="section-heading"><div><p class="eyebrow">AMBIENCE STUDIO</p><h2>Chọn bối cảnh của bạn</h2><p>Bộ sưu tập bối cảnh mang đến không gian riêng cho mỗi phiên học. Lựa chọn này cũng được dùng cho Focus Room toàn màn hình.</p></div><span class="pill pill-cyan">${theme.icon} Đang chọn: ${escapeHtml(theme.name)}</span></div><div class="focus-theme-grid">${FOCUS_THEMES.map(item=>`<button type="button" class="focus-theme-card ${item.id===theme.id?'is-selected':''}" data-action="focus-theme" data-value="${item.id}" aria-pressed="${item.id===theme.id?'true':'false'}"><span class="focus-theme-swatch theme-${item.id}" aria-hidden="true"><i></i><b>${item.icon}</b><em></em></span><span class="focus-theme-copy"><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.desc)}</small></span><span class="focus-theme-check" aria-hidden="true">✓</span></button>`).join('')}</div></section>
  <section class="surface focus-scene-spotlight" id="focusSceneSpotlight">${focusThemeSpotlightMarkup(theme)}</section>
  <section class="focus-tips"><div class="focus-tip"><span>📵</span><strong>Chuẩn bị trước</strong><p>Để sẵn sách, vở, nước uống và đóng những tab không cần thiết.</p></div><div class="focus-tip"><span>🎯</span><strong>Viết một mục tiêu</strong><p>Ví dụ: làm xong 3 bài, học 10 từ mới hoặc tóm tắt một trang kiến thức.</p></div><div class="focus-tip"><span>🌱</span><strong>Tiến bộ vừa đủ</strong><p>Bạn luôn có thể tạm dừng. Sự đều đặn quan trọng hơn cố quá sức.</p></div><div class="focus-tip"><span>🌙</span><strong>Chuyển cảnh theo nhịp học</strong><p>Chọn bối cảnh dịu mắt cho phiên học dài, bối cảnh tươi sáng khi cần thêm động lực.</p></div></section>`;
}
/* Rich-text Storage: local-first document library with Word-style editing. */
const DOCUMENT_TEMPLATES={
  blank:{title:'Tài liệu mới',subject:'Khác',tags:'',content:'<p><br></p>'},
  lesson:{title:'Ghi chép bài học',subject:'Khác',tags:'bài học, ôn tập',content:'<h1>Ghi chép bài học</h1><p><strong>Môn học:</strong> … &nbsp; <strong>Ngày:</strong> …</p><hr><h2>1. Mục tiêu bài học</h2><ul><li>Điều cần hiểu sau bài học</li><li></li></ul><h2>2. Kiến thức trọng tâm</h2><p>Ghi lại khái niệm, quy tắc hoặc công thức quan trọng…</p><h2>3. Ví dụ minh họa</h2><p></p><h2>4. Điều còn chưa rõ</h2><ul><li>Câu hỏi cần tìm hiểu thêm</li></ul><h2>5. Tự kiểm tra</h2><p>Đóng vở và tự giải thích bài học bằng lời của mình.</p>'},
  essay:{title:'Dàn ý bài luận',subject:'Ngữ văn',tags:'dàn ý, bài luận',content:'<h1>Dàn ý bài luận</h1><p><strong>Đề bài:</strong> …</p><h2>I. Mở bài</h2><p>Giới thiệu vấn đề và nêu luận điểm chính.</p><h2>II. Thân bài</h2><h3>Luận điểm 1</h3><p>• Luận cứ:<br>• Dẫn chứng:<br>• Phân tích:</p><h3>Luận điểm 2</h3><p>• Luận cứ:<br>• Dẫn chứng:<br>• Phân tích:</p><h2>III. Kết bài</h2><p>Khẳng định lại luận điểm và mở rộng suy nghĩ.</p>'},
  lab:{title:'Báo cáo thí nghiệm',subject:'Vật lý',tags:'thí nghiệm, khoa học',content:'<h1>Báo cáo thí nghiệm</h1><p><strong>Tên thí nghiệm:</strong> …</p><p><strong>Ngày thực hiện:</strong> …</p><h2>1. Mục đích</h2><p></p><h2>2. Dụng cụ và vật liệu</h2><ul><li></li></ul><h2>3. Cơ sở lý thuyết</h2><p></p><h2>4. Các bước tiến hành</h2><ol><li></li></ol><h2>5. Kết quả và số liệu</h2><p></p><h2>6. Nhận xét, kết luận</h2><p></p><h2>7. Sai số và lưu ý an toàn</h2><p></p>'},
  vocab:{title:'Sổ từ vựng',subject:'Tiếng Anh',tags:'từ vựng, ngoại ngữ',content:'<h1>Sổ từ vựng</h1><p><strong>Chủ đề:</strong> …</p><table><tbody><tr><th>Từ / cụm từ</th><th>Loại từ</th><th>Nghĩa</th><th>Ví dụ</th></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr></tbody></table><h2>Ôn tập chủ động</h2><p>Che cột nghĩa và thử nhớ lại trước khi xem đáp án.</p>'},
  cornell:{title:'Cornell Notes',subject:'Khác',tags:'cornell, ghi nhớ chủ động',content:'<h1>Cornell Notes</h1><p><strong>Môn học:</strong> … &nbsp; <strong>Ngày:</strong> …</p><table><tbody><tr><th style="width:30%">Từ khóa / câu hỏi</th><th>Ghi chép chi tiết</th></tr><tr><td><p>Câu hỏi gợi nhớ 1</p></td><td><p>Giải thích, định nghĩa hoặc ví dụ…</p></td></tr><tr><td><p>Câu hỏi gợi nhớ 2</p></td><td><p>Ghi kiến thức trọng tâm…</p></td></tr></tbody></table><h2>Tóm tắt bằng lời của mình</h2><p>Viết 3–5 câu mà không nhìn lại phần ghi chép.</p><h2>Điều cần ôn thêm</h2><ul><li>Câu hỏi chưa trả lời được</li></ul>'},
  summary:{title:'Tóm tắt chương',subject:'Khác',tags:'tóm tắt, ôn thi',content:'<h1>Tóm tắt chương</h1><p><strong>Tên chương:</strong> … &nbsp; <strong>Ngày ôn:</strong> …</p><h2>1. Ý chính trong 3 câu</h2><ol><li></li><li></li><li></li></ol><h2>2. Khái niệm cần nhớ</h2><ul><li><strong>Khái niệm:</strong> định nghĩa bằng lời của mình</li><li><strong>Ví dụ:</strong> một ví dụ tự giải thích được</li></ul><h2>3. Công thức / mốc thời gian / luận điểm</h2><p></p><h2>4. Lỗi dễ mắc</h2><ul><li></li></ul><h2>5. Tự kiểm tra không nhìn tài liệu</h2><p>Viết 3 câu hỏi và tự trả lời ở cuối buổi ôn.</p>'},
  weekly:{title:'Kế hoạch học tuần',subject:'Khác',tags:'kế hoạch tuần, mục tiêu',content:'<h1>Kế hoạch học tuần</h1><p><strong>Tuần từ:</strong> … &nbsp; <strong>Đến:</strong> …</p><h2>Mục tiêu trọng tâm</h2><ul><li>Mục tiêu 1 — hoàn thành khi…</li><li>Mục tiêu 2 — hoàn thành khi…</li><li>Mục tiêu 3 — hoàn thành khi…</li></ul><table><tbody><tr><th>Ngày</th><th>Việc học chính</th><th>Thời lượng dự kiến</th><th>Hoàn thành</th></tr><tr><td>Thứ 2</td><td></td><td></td><td>☐</td></tr><tr><td>Thứ 3</td><td></td><td></td><td>☐</td></tr><tr><td>Thứ 4</td><td></td><td></td><td>☐</td></tr><tr><td>Thứ 5</td><td></td><td></td><td>☐</td></tr><tr><td>Thứ 6</td><td></td><td></td><td>☐</td></tr><tr><td>Thứ 7</td><td></td><td></td><td>☐</td></tr><tr><td>Chủ nhật</td><td></td><td></td><td>☐</td></tr></tbody></table><h2>Nhìn lại cuối tuần</h2><p>Điều làm tốt:</p><p>Điều cần điều chỉnh tuần sau:</p>'}
};
function sanitizeDocumentHtml(html){
  const allowed=new Set(['P','DIV','BR','STRONG','B','EM','I','U','S','STRIKE','UL','OL','LI','H1','H2','H3','H4','BLOCKQUOTE','PRE','CODE','A','SPAN','SUB','SUP','HR','TABLE','THEAD','TBODY','TFOOT','TR','TD','TH','IMG']);
  const dropContents=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','VIDEO','AUDIO','CANVAS','FORM','INPUT','BUTTON','TEXTAREA','SELECT','OPTION','PICTURE','SOURCE']);
  try{
    const parsed=new DOMParser().parseFromString(`<div>${String(html||'')}</div>`,'text/html');const root=parsed.body.firstElementChild;if(!root)return '';
    const cleanNode=node=>{
      for(const child of [...node.childNodes]){
        if(child.nodeType!==1)continue;
        const tag=child.tagName;
        if(dropContents.has(tag)){child.remove();continue;}
        cleanNode(child);
        if(!allowed.has(tag)){child.replaceWith(...child.childNodes);continue;}
        for(const attr of [...child.attributes]){const key=attr.name.toLowerCase();const ok=['style','href','title','colspan','rowspan'].includes(key)||(tag==='OL'&&key==='type'&&/^[1aAiI]$/.test(attr.value))||((tag==='OL'&&key==='start'||tag==='LI'&&key==='value')&&/^\d{1,4}$/.test(attr.value))||(tag==='IMG'&&['src','alt','width','height'].includes(key));if(!ok)child.removeAttribute(attr.name);}
        if(tag==='IMG'){const src=String(child.getAttribute('src')||'');if(!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src)||src.length>85000){child.remove();continue;}child.setAttribute('alt',String(child.getAttribute('alt')||'Ảnh tài liệu').slice(0,120));child.setAttribute('style','max-width:100%;height:auto;border-radius:8px');}
        if(child.hasAttribute('style')){
          const style=child.style, kept={};
          const size=style.getPropertyValue('font-size').trim();if(/^(?:1[0-9]|2[0-9]|3[0-6])(?:px|pt)$/.test(size))kept['font-size']=size;
          const color=style.getPropertyValue('color').trim();if(/^(#[\da-f]{3,8}|rgba?\([\d.% ,/]+\)|hsla?\([\d.% ,/]+\)|[a-z]{1,20})$/i.test(color))kept.color=color;
          const bg=style.getPropertyValue('background-color').trim();if(/^(#[\da-f]{3,8}|rgba?\([\d.% ,/]+\)|hsla?\([\d.% ,/]+\)|[a-z]{1,20})$/i.test(bg))kept['background-color']=bg;
          const align=style.getPropertyValue('text-align').trim().toLowerCase();if(['left','right','center','justify','start','end'].includes(align))kept['text-align']=align;
          const family=style.getPropertyValue('font-family').replace(/['"]/g,'').trim();if(/^(Arial|Calibri|Georgia|Verdana|Tahoma|Times New Roman|Courier New)$/i.test(family))kept['font-family']=family;
          const listStyle=style.getPropertyValue('list-style-type');if(['decimal','lower-alpha','upper-alpha','lower-roman','upper-roman'].includes(listStyle))kept['list-style-type']=listStyle;
          const weight=style.getPropertyValue('font-weight').trim();if(['bold','normal','400','500','600','700','800','900'].includes(weight))kept['font-weight']=weight;
          const fontStyle=style.getPropertyValue('font-style').trim();if(['italic','normal'].includes(fontStyle))kept['font-style']=fontStyle;
          const decoration=style.getPropertyValue('text-decoration').trim().toLowerCase();if(['underline','line-through','underline line-through','none'].includes(decoration))kept['text-decoration']=decoration;
          child.removeAttribute('style');for(const [key,val] of Object.entries(kept))child.style.setProperty(key,val);
          if(!child.getAttribute('style'))child.removeAttribute('style');
        }
        if(tag==='A'){
          const href=String(child.getAttribute('href')||'');try{const u=new URL(href,location.href);if(!['https:','http:','mailto:'].includes(u.protocol))child.removeAttribute('href');else child.setAttribute('href',u.href);}catch{child.removeAttribute('href');}
          if(child.hasAttribute('href')){child.setAttribute('target','_blank');child.setAttribute('rel','noopener noreferrer');}
        }
        if(['TD','TH'].includes(tag)){const span=Number(child.getAttribute('colspan')||1);if(span<1||span>8)child.removeAttribute('colspan');const row=Number(child.getAttribute('rowspan')||1);if(row<1||row>12)child.removeAttribute('rowspan');}
      }
    };
    cleanNode(root);return root.innerHTML;
  }catch(err){console.warn('Document sanitizer fallback',err);return escapeHtml(String(html||'')).replace(/\n/g,'<br>');}
}
function documentText(html){const holder=document.createElement('div');holder.innerHTML=sanitizeDocumentHtml(html);return (holder.innerText||holder.textContent||'').replace(/\u00a0/g,' ').trim();}
function countWords(text){const words=String(text||'').trim().match(/[\p{L}\p{N}]+(?:[’'._-][\p{L}\p{N}]+)*/gu);return words?words.length:0;}
function relativeDocumentDate(value){const ts=Number(value)||Date.now(),diff=Date.now()-ts;if(diff<60000)return 'Vừa cập nhật';if(diff<3600000)return `${Math.floor(diff/60000)} phút trước`;if(diff<86400000)return `${Math.floor(diff/3600000)} giờ trước`;return new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(ts));}
function docTemplatesMarkup(){return `<select id="documentTemplateSelect" class="select-field doc-template-select" aria-label="Tạo từ mẫu"><option value="">✧ Tạo từ mẫu…</option><option value="lesson">Ghi chép bài học</option><option value="essay">Dàn ý bài luận</option><option value="lab">Báo cáo thí nghiệm</option><option value="vocab">Sổ từ vựng</option><option value="cornell">Cornell Notes</option><option value="summary">Tóm tắt chương</option><option value="weekly">Kế hoạch học tuần</option><option value="blank">Tài liệu trống</option></select>`;}
function documentLibraryMarkup(){
  const docs=[...(state.documents||[])].sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||(Number(b.updatedAt)||0)-(Number(a.updatedAt)||0));
  if(!docs.length)return `<div class="doc-library-empty"><span>▤</span><b>Chưa có tài liệu</b><p>Tạo tài liệu đầu tiên hoặc bắt đầu từ một mẫu học tập.</p><button type="button" class="button button-primary button-small" data-action="new-document">＋ Tạo tài liệu</button></div>`;
  return docs.map(doc=>{const text=documentText(doc.content);return `<article class="doc-library-item ${selectedDocumentIds.has(doc.id)?'is-selected':''} ${doc.id===activeDocumentId?'is-active':''} ${doc.pinned?'is-pinned':''}" data-doc-id="${escapeHtml(doc.id)}" data-search="${escapeHtml(`${doc.title} ${doc.subject} ${doc.tags} ${text.slice(0,1000)}`.toLocaleLowerCase('vi'))}"><label class="bulk-pick doc-bulk-pick"><input type="checkbox" data-action="document-select-item" data-id="${escapeHtml(doc.id)}" ${selectedDocumentIds.has(doc.id)?'checked':''} aria-label="Chọn tài liệu ${escapeHtml(doc.title)}"><span></span></label><button type="button" class="doc-select-row" data-action="select-document" data-id="${escapeHtml(doc.id)}" aria-current="${doc.id===activeDocumentId?'page':'false'}"><span class="doc-file-icon">${doc.pinned?'★':'▤'}</span><span class="doc-library-copy"><b>${escapeHtml(doc.title||'Tài liệu chưa có tiêu đề')}</b><small>${escapeHtml(doc.subject||'Khác')} · ${countWords(text)} từ</small><small>${escapeHtml(relativeDocumentDate(doc.updatedAt))}</small></span></button><div class="doc-library-actions"><button type="button" data-action="toggle-document-pin" data-id="${escapeHtml(doc.id)}" aria-label="${doc.pinned?'Bỏ ghim':'Ghim'} tài liệu" title="${doc.pinned?'Bỏ ghim':'Ghim'}">${doc.pinned?'★':'☆'}</button><button type="button" data-action="delete-document" data-id="${escapeHtml(doc.id)}" aria-label="Xóa tài liệu" title="Xóa">×</button></div></article>`;}).join('');
}
function renderDocumentLibrary(){const list=$('#documentLibraryList');if(list)list.innerHTML=documentLibraryMarkup();filterDocumentLibrary();updateDocumentSummary();}
function filterDocumentLibrary(){const q=String($('#documentSearch')?.value||'').trim().toLocaleLowerCase('vi');let n=0;$$('.doc-library-item',$('#documentLibraryList')||document).forEach(card=>{const visible=!q||(card.dataset.search||'').includes(q);card.classList.toggle('hidden',!visible);if(visible)n++;});const label=$('#documentSearchResults');if(label)label.textContent=`${n} / ${(state?.documents||[]).length} tài liệu`;const empty=$('#documentSearchEmpty');if(empty)empty.classList.toggle('hidden',n>0||!q);}
function updateDocumentSummary(){const docs=state?.documents||[],totalWords=docs.reduce((sum,d)=>sum+countWords(documentText(d.content)),0);const a=$('#documentCountMetric'),b=$('#documentWordsMetric'),c=$('#documentPinnedMetric');if(a)a.textContent=String(docs.length);if(b)b.textContent=totalWords.toLocaleString('vi-VN');if(c)c.textContent=String(docs.filter(d=>d.pinned).length);}
function updateDocumentEditorStats(){const editor=$('#wordEditor');if(!editor)return;const text=(editor.innerText||editor.textContent||'').replace(/\u00a0/g,' ').trim();const wc=countWords(text),cc=text.length;const word=$('#wordCount'),char=$('#characterCount');if(word)word.textContent=`${wc.toLocaleString('vi-VN')} từ`;if(char)char.textContent=`${cc.toLocaleString('vi-VN')} ký tự`;}
function documentOutlineMarkup(content){
  const holder=document.createElement('div');holder.innerHTML=sanitizeDocumentHtml(content||'');
  const headings=$$('h1,h2,h3',holder).slice(0,60);
  if(!headings.length)return `<div class="document-outline-empty">Định dạng đoạn thành <b>Tiêu đề 1/2/3</b> để tạo dàn ý tự động.</div>`;
  return `<nav class="document-outline-list" aria-label="Dàn ý tài liệu">${headings.map((h,i)=>`<button type="button" class="document-outline-item outline-level-${h.tagName.toLowerCase()}" data-action="jump-document-heading" data-index="${i}" title="${escapeHtml(h.textContent||'Tiêu đề')} "><span class="outline-bullet"></span><span>${escapeHtml((h.textContent||'Tiêu đề').trim().slice(0,90)||'Tiêu đề')}</span></button>`).join('')}</nav>`;
}
function updateDocumentOutline(){
  const editor=$('#wordEditor'),items=$('#documentOutlineItems'),toggle=$('[data-action="toggle-document-outline"]');if(!editor||!items||!toggle)return;
  const holder=document.createElement('div');holder.innerHTML=sanitizeDocumentHtml(editor.innerHTML);const count=$$('h1,h2,h3',holder).length;
  items.innerHTML=documentOutlineMarkup(editor.innerHTML);toggle.innerHTML=`⌗ Dàn ý <span>${count}</span>`;toggle.setAttribute('aria-expanded',String(!documentOutlineCollapsed));
}
function toggleDocumentOutline(){
  documentOutlineCollapsed=!documentOutlineCollapsed;const panel=$('#documentOutline'),button=$('[data-action="toggle-document-outline"]');
  panel?.classList.toggle('is-collapsed',documentOutlineCollapsed);if(button)button.setAttribute('aria-expanded',String(!documentOutlineCollapsed));
}
let documentNativeFocus=false;
function setDocumentFocus(enabled){
  documentFocusMode=Boolean(enabled);
  $('#pageContent')?.classList.toggle('document-focus-mode',documentFocusMode);
  $('.document-studio')?.classList.toggle('is-focus',documentFocusMode);
  document.body.classList.toggle('writer-open',documentFocusMode);
  $$('[data-action="toggle-document-focus"]').forEach(button=>{button.textContent=documentFocusMode?'↙ Thoát':'⛶ Toàn màn hình';button.setAttribute('aria-pressed',String(documentFocusMode));});
}
function toggleDocumentFocus(){
  const enabled=!documentFocusMode;setDocumentFocus(enabled);if(enabled)fitWriterPage();
  if(!enabled&&documentNativeFocus&&document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});
  if(enabled){const target=$('.document-studio');if(target?.requestFullscreen)target.requestFullscreen().then(()=>{documentNativeFocus=true;fitWriterPage();if(!documentFocusMode)document.exitFullscreen?.().catch(()=>{});}).catch(()=>{});}
}
function writerPaperSpec(value,orientation='portrait'){
  const dimensions={A4:[210,297],A5:[148,210],Letter:[215.9,279.4],Legal:[215.9,355.6]};
  const pair=dimensions[value]||dimensions.A4;
  const widthMM=pair[orientation==='landscape'?1:0],heightMM=pair[orientation==='landscape'?0:1];
  return {width:Math.round(widthMM*96/25.4),height:Math.round(heightMM*96/25.4),widthMM,heightMM,print:widthMM+'mm '+heightMM+'mm'};
}
function writerPageOptions(){
  const paper=writerPaperSpec($('#writerPaperSize')?.value,$('#writerOrientation')?.value);
  const raw=Number($('#writerMargin')?.value),margin=[12,20,25.4].includes(raw)?raw:20;
  return {...paper,margin};
}
function setDocumentZoom(value){
  const workspace=$('.doc-paper-workspace');if(!workspace)return;
  const paper=writerPageOptions();
  const width=Math.max(.1,(workspace.clientWidth-40)/Math.ceil(paper.widthMM*96/25.4));
  const height=Math.max(.1,((documentFocusMode?workspace.clientHeight:window.innerHeight-180)-120)/Math.ceil(paper.heightMM*96/25.4));
  const zoom=value==='page'?Math.min(1,width,height):value==='fit'?Math.min(1,width):Math.min(1.5,Math.max(.5,Number(value)||1));
  workspace.style.setProperty('--writer-zoom',String(zoom));
  const label=$('#writerPaperInfo');if(label)label.textContent=`${paper.widthMM} × ${paper.heightMM} mm · ${Math.round(zoom*100)}%`;
}
function applyWriterPaper(){
  const workspace=$('.doc-paper-workspace');if(!workspace)return;
  const paper=writerPageOptions();
  workspace.style.setProperty('--writer-width',paper.widthMM+'mm');workspace.style.setProperty('--writer-height',paper.heightMM+'mm');workspace.style.setProperty('--writer-margin',paper.margin+'mm');
  let printStyle=$('#writerPrintStyle');if(!printStyle){printStyle=document.createElement('style');printStyle.id='writerPrintStyle';document.head.append(printStyle);}
  printStyle.textContent='@media print{@page{size:'+paper.print+';margin:'+paper.margin+'mm}}';
  setDocumentZoom($('#writerZoom')?.value||'fit');
}
function fitWriterPage(){const select=$('#writerZoom');if(select){select.value='fit';setDocumentZoom('fit');}}
function toggleWriterTools(){
  documentToolsOpen=!documentToolsOpen;$('.document-studio')?.classList.toggle('writer-tools-open',documentToolsOpen);
  const button=$('[data-action="writer-tools"]');button?.setAttribute('aria-expanded',String(documentToolsOpen));
  if($('#writerZoom')?.value==='page')setDocumentZoom('page');
}
function jumpToDocumentHeading(index){
  const headings=$$('#wordEditor h1, #wordEditor h2, #wordEditor h3'),heading=headings[Number(index)];if(!heading)return;
  heading.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
  heading.classList.add('document-outline-target');setTimeout(()=>heading.classList.remove('document-outline-target'),1400);
}
function renderDocumentTabsMarkup(){
  const valid=new Set((state?.documents||[]).map(d=>d.id));
  openDocumentIds=openDocumentIds.filter((id,index,arr)=>valid.has(id)&&arr.indexOf(id)===index);
  if(activeDocumentId&&valid.has(activeDocumentId)&&!openDocumentIds.includes(activeDocumentId))openDocumentIds.push(activeDocumentId);
  return openDocumentIds.map(id=>{const doc=state.documents.find(d=>d.id===id);if(!doc)return '';return `<div class="doc-tab ${id===activeDocumentId?'is-active':''}"><button type="button" class="doc-tab-title" data-action="select-document" data-id="${escapeHtml(id)}" aria-current="${id===activeDocumentId?'page':'false'}" title="Mở ${escapeHtml(doc.title)}"><span>${escapeHtml(doc.title||'Tài liệu chưa có tiêu đề')}</span></button><button type="button" class="doc-tab-close" data-action="close-document-tab" data-id="${escapeHtml(id)}" aria-label="Đóng tab ${escapeHtml(doc.title)}" title="Đóng tab">×</button></div>`;}).join('');
}
function refreshDocumentTabs(){const tabs=$('#documentTabList');if(tabs)tabs.innerHTML=renderDocumentTabsMarkup();}
function openDocumentLibrary(){
  if(documentDirty&&!saveActiveDocument(true))return;
  if(documentFocusMode){setDocumentFocus(false);if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});}
  documentLibraryOpen=!documentLibraryOpen;documentToolsOpen=false;
  renderPage('documents',{recordHistory:false});
  if(documentLibraryOpen)$('#documentSearch')?.focus({preventScroll:true});
}
function renderDocuments(){
  const docs=state.documents||[];
  if(activeDocumentId&&!docs.some(d=>d.id===activeDocumentId))activeDocumentId=null;
  if(!activeDocumentId&&openDocumentIds.length){const open=openDocumentIds.find(id=>docs.some(d=>d.id===id));if(open)activeDocumentId=open;}
  if(!activeDocumentId&&docs.length){activeDocumentId=docs[0].id;if(!openDocumentIds.includes(activeDocumentId))openDocumentIds.push(activeDocumentId);}
  openDocumentIds=openDocumentIds.filter((id,index,arr)=>docs.some(d=>d.id===id)&&arr.indexOf(id)===index);
  const doc=docs.find(d=>d.id===activeDocumentId)||null;
  const text=doc?documentText(doc.content):'',totalWords=docs.reduce((n,d)=>n+countWords(documentText(d.content)),0);
  const action=(command,label,icon='')=>`<button type="button" class="doc-action-item" data-action="document-action" data-command="${command}"><span aria-hidden="true">${icon}</span><span>${label}</span></button>`;
  if(documentLibraryOpen)return `<section class="writer-library-page"><section id="documentLibraryDrawer" class="doc-library-drawer "><div class="doc-library-drawer-head"><div><h1>Thư viện tài liệu</h1><small>${docs.length} tài liệu · lưu trên thiết bị này</small></div><div class="doc-library-tools"><button type="button" class="button button-ghost button-small" data-action="toggle-document-library">← Trở về trang viết</button><input type="search" class="field" id="documentSearch" placeholder="Tìm theo tên, nội dung, từ khóa…" aria-label="Tìm tài liệu" value=""><button type="button" class="button button-ghost button-small" data-action="new-document">＋ Tài liệu mới</button></div></div><div class="doc-library-filter"><span>▤ ${docs.length} mục</span><span id="documentSearchResults">${docs.length} tài liệu</span></div><div class="bulk-action-bar doc-bulk-toolbar"><div><b id="documentBulkSelectedCount">${selectedDocumentIds.size} tài liệu được chọn</b><small>Nhóm sẽ được lưu vào Lịch sử xóa, có thể khôi phục sau.</small></div><button type="button" class="button button-danger button-small" id="documentBulkDelete" data-action="bulk-delete-documents" ${selectedDocumentIds.size?'':'disabled'}>Xóa nhóm đã chọn</button><button type="button" class="button button-ghost button-small" data-action="clear-document-selection">Bỏ chọn</button></div><div class="doc-library-list" id="documentLibraryList">${documentLibraryMarkup()}</div><div id="documentSearchEmpty" class="doc-search-empty hidden">Không tìm thấy tài liệu phù hợp.</div></section></section>`;
  const tabs=renderDocumentTabsMarkup();
  return `<section class="document-studio ${documentToolsOpen?'writer-tools-open':''} ${documentFocusMode?'is-focus':''}">
    <div class="doc-tabbar"><div class="doc-tabs-scroll" id="documentTabList" role="tablist" aria-label="Tài liệu đang mở">${tabs||'<span class="doc-tabs-empty">Chưa mở tài liệu nào</span>'}</div><button type="button" class="doc-new-tab" data-action="new-document" aria-label="Tạo tài liệu mới" title="Tạo tài liệu mới">＋</button><div class="doc-actions-menu"><button type="button" class="doc-actions-trigger" data-action="toggle-document-actions" aria-haspopup="menu" aria-expanded="${documentActionsOpen}">Thao tác <span aria-hidden="true">⌃</span></button><div id="documentActionsDropdown" class="doc-actions-dropdown ${documentActionsOpen?'':'hidden'}" role="menu" aria-label="Thao tác tài liệu">${action('new','Tài liệu mới','＋')}${action('save-draft','Lưu bản nháp cục bộ','▣')}${action('save-storage','Lưu vào Storage','⇧')}${action('rename','Đổi tên tài liệu','✎')}${action('undo','Hoàn tác','↶')}${action('fullscreen','Mở trình soạn thảo toàn màn hình','⤢')}${action('header','Ẩn/hiện thanh LUMEVIA','◉')}${action('library','Mở thư viện tài liệu','▤')}</div></div></div>
    <div class="doc-toolbar-wrap"><div class="writer-commandbar"><span class="writer-brand">LUMEVIA <b>Word</b></span><span id="writerLiveStatus" role="status" aria-live="polite">Tự động lưu</span><div class="writer-quick-actions"><button type="button" data-action="toggle-document-library">▤ Thư viện</button><button type="button" data-action="writer-recall">Tự kiểm tra</button><button type="button" data-action="writer-tools" aria-controls="writerDetails" aria-expanded="${documentToolsOpen}">Thông tin & tìm kiếm</button><label>Khổ giấy <select id="writerPaperSize" aria-label="Khổ giấy">${['A4','A5','Letter','Legal'].map(size=>`<option value="${size}" ${size===(doc?.paperSize||'A4')?'selected':''}>${size}</option>`).join('')}</select></label><label>Hướng <select id="writerOrientation" aria-label="Hướng giấy"><option value="portrait" ${doc?.paperOrientation!=='landscape'?'selected':''}>Dọc</option><option value="landscape" ${doc?.paperOrientation==='landscape'?'selected':''}>Ngang</option></select></label><label>Lề <select id="writerMargin" aria-label="Lề trang">${[[12,'Hẹp · 12 mm'],[20,'Vừa · 20 mm'],[25.4,'Rộng · 25,4 mm']].map(([value,label])=>`<option value="${value}" ${value===(doc?.paperMargin||20)?'selected':''}>${label}</option>`).join('')}</select></label><label>Thu phóng <select id="writerZoom" aria-label="Thu phóng trang"><option value="page">Trọn trang</option><option value="fit" selected>Vừa chiều rộng</option><option value="0.75">75%</option><option value="1">100%</option><option value="1.25">125%</option><option value="1.5">150%</option></select></label><button type="button" data-action="save-document-now">Lưu</button><button type="button" data-action="document-print">In / PDF</button><button type="button" data-action="document-recovery-export" title="Tải nội dung đang viết, kể cả khi tự lưu thất bại">Tải nháp</button><button type="button" data-action="toggle-document-focus" aria-pressed="${documentFocusMode}">${documentFocusMode?'↙ Thoát':'⛶ Toàn màn hình'}</button></div></div><div class="doc-toolbar" role="toolbar" aria-label="Công cụ soạn thảo tài liệu">
      <span class="doc-tool-label">PHÔNG</span><select id="docFontFamily" class="doc-toolbar-select doc-font-family" aria-label="Phông chữ"><option>Times New Roman</option><option>Arial</option><option>Calibri</option><option>Georgia</option><option>Verdana</option><option>Tahoma</option><option>Courier New</option></select>
      <button type="button" class="doc-tool-button" data-action="doc-size-step" data-step="-1" aria-label="Giảm cỡ chữ" title="Giảm cỡ chữ">−</button><span class="doc-tool-label">CỠ</span><select id="docFontSize" class="doc-toolbar-select doc-font-size" aria-label="Cỡ chữ"><option value="12" selected>12 pt</option><option value="14">14 pt</option><option value="16">16 pt</option><option value="18">18 pt</option><option value="20">20 pt</option><option value="24">24 pt</option><option value="28">28 pt</option><option value="36">36 pt</option></select><button type="button" class="doc-tool-button" data-action="doc-size-step" data-step="1" aria-label="Tăng cỡ chữ" title="Tăng cỡ chữ">＋</button>
      <label class="doc-color-button" title="Màu chữ"><span>A</span><input type="color" id="docTextColor" value="#202843" aria-label="Màu chữ"></label><button type="button" class="doc-tool-button" data-action="doc-format" data-command="bold" aria-label="In đậm" title="In đậm (Ctrl+B)"><b>B</b></button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="italic" aria-label="In nghiêng" title="In nghiêng (Ctrl+I)"><i>I</i></button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="underline" aria-label="Gạch chân" title="Gạch chân (Ctrl+U)"><u>U</u></button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="strikeThrough" aria-label="Gạch ngang" title="Gạch ngang"><s>S</s></button><label class="doc-color-button doc-highlight-color" title="Tô sáng"><span>▰</span><input type="color" id="docHighlightColor" value="#fff29b" aria-label="Màu tô sáng"></label>
      <span class="doc-toolbar-divider"></span><button type="button" class="doc-tool-button is-active" data-action="doc-format" data-command="justifyLeft" aria-label="Căn trái" title="Căn trái">≡</button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="justifyCenter" aria-label="Căn giữa" title="Căn giữa">☰</button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="justifyRight" aria-label="Căn phải" title="Căn phải">≡</button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="justifyFull" aria-label="Căn đều" title="Căn đều hai bên">☷</button>
      <span class="doc-toolbar-divider"></span><select id="docBlockFormat" class="doc-toolbar-select doc-paragraph-select" aria-label="Kiểu đoạn"><option value="P">Văn bản</option><option value="H1">Tiêu đề 1</option><option value="H2">Tiêu đề 2</option><option value="H3">Tiêu đề 3</option><option value="BLOCKQUOTE">Trích dẫn</option><option value="PRE">Khối mã</option></select><button type="button" class="doc-tool-button" data-action="doc-format" data-command="insertUnorderedList" title="Danh sách dấu chấm" aria-label="Danh sách dấu chấm">•≡</button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="insertOrderedList" title="Danh sách đánh số" aria-label="Danh sách đánh số">1≡</button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="indent" title="Tăng thụt lề" aria-label="Tăng thụt lề">⇥</button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="outdent" title="Giảm thụt lề" aria-label="Giảm thụt lề">⇤</button>
      <span class="doc-toolbar-divider"></span><button type="button" class="doc-tool-button" data-action="doc-insert-link" title="Chèn liên kết" aria-label="Chèn liên kết">↗</button><button type="button" class="doc-tool-button" data-action="doc-insert-image" title="Chèn ảnh nhỏ từ máy" aria-label="Chèn ảnh">▧</button><button type="button" class="doc-tool-button" data-action="doc-insert-table" title="Chèn bảng 3 × 3" aria-label="Chèn bảng">▦</button><button type="button" class="doc-tool-button" data-action="doc-table-edit" data-mode="row-add" title="Thêm hàng" aria-label="Thêm hàng">＋↕</button><button type="button" class="doc-tool-button" data-action="doc-table-edit" data-mode="column-add" title="Thêm cột" aria-label="Thêm cột">＋↔</button><button type="button" class="doc-tool-button" data-action="doc-table-edit" data-mode="row-delete" title="Xóa hàng" aria-label="Xóa hàng">−↕</button><button type="button" class="doc-tool-button" data-action="doc-table-edit" data-mode="column-delete" title="Xóa cột" aria-label="Xóa cột">−↔</button>
      <span class="doc-toolbar-divider"></span><button type="button" class="doc-tool-button" data-action="doc-format" data-command="undo" title="Hoàn tác" aria-label="Hoàn tác">↶</button><button type="button" class="doc-tool-button" data-action="doc-format" data-command="redo" title="Làm lại" aria-label="Làm lại">↷</button><button type="button" class="doc-tool-button" data-action="doc-clear-format" title="Xóa định dạng" aria-label="Xóa định dạng">Tx</button>
      <span class="doc-toolbar-divider"></span><button type="button" class="doc-tool-button" data-action="toggle-document-library" aria-expanded="${documentLibraryOpen}" title="Mở thư viện tài liệu">▤</button>
    </div></div>

    ${doc?`<div id="writerDetails" class="writer-details"><label class="writer-auto-title"><input id="writerAutoTitle" type="checkbox" ${!doc.autoTitleSeeded&&doc.autoTitle!==false&&(doc.autoTitle===true||['Tài liệu mới','Tài liệu chưa có tiêu đề'].includes(doc.title))?'checked':''}> Đặt tên từ nội dung khi chưa có tiêu đề <small>Chỉ đặt một lần, không sửa chính tả tự động. Bật lại để lấy tên mới; tên bạn nhập luôn được giữ.</small></label><section class="doc-current-meta"><div class="doc-current-title"><span class="doc-file-icon">▤</span><div><label for="documentTitle">Tên tài liệu</label><input class="field" id="documentTitle" maxlength="160" value="${escapeHtml(doc.title||'')}" placeholder="Tên tài liệu"></div></div><label><span>Môn học</span><select class="select-field" id="documentSubject">${SUBJECTS.map(sub=>`<option ${doc.subject===sub?'selected':''}>${escapeHtml(sub)}</option>`).join('')}</select></label><label><span>Từ khóa</span><input class="field" id="documentTags" maxlength="180" value="${escapeHtml(doc.tags||'')}" placeholder="Ôn thi, chương 2"></label><div class="doc-meta-actions"><button type="button" class="doc-icon-action ${doc.pinned?'is-pinned':''}" data-action="toggle-document-pin" data-id="${escapeHtml(doc.id)}" title="${doc.pinned?'Bỏ ghim':'Ghim tài liệu'}" aria-label="${doc.pinned?'Bỏ ghim':'Ghim tài liệu'}">${doc.pinned?'★':'☆'}</button><button type="button" class="doc-icon-action" data-action="duplicate-document" data-id="${escapeHtml(doc.id)}" title="Nhân bản" aria-label="Nhân bản tài liệu">⧉</button><button type="button" class="doc-icon-action doc-danger-action" data-action="delete-document" data-id="${escapeHtml(doc.id)}" title="Chuyển vào lịch sử xóa" aria-label="Chuyển tài liệu vào lịch sử xóa">×</button></div></section>
    <div class="doc-find-panel"><label for="documentFindInput">Tìm trong tài liệu</label><input class="field" id="documentFindInput" type="search" placeholder="Từ hoặc cụm từ…"><button type="button" class="button button-ghost button-small" data-action="doc-find-next">Tìm tiếp</button><input class="field" id="documentReplaceInput" placeholder="Thay bằng…" aria-label="Nội dung thay thế"><button type="button" class="button button-soft button-small" data-action="doc-replace-current">Thay mục đang chọn</button></div>
    <div class="document-outline-wrap"><div class="document-outline-tools"><div><b>Dàn ý tài liệu</b><small>Chọn Tiêu đề 1/2/3 để tạo mục điều hướng</small></div><button type="button" class="doc-outline-toggle" data-action="toggle-document-outline" aria-expanded="${!documentOutlineCollapsed}">⌗ Dàn ý <span>${(()=>{const holder=document.createElement('div');holder.innerHTML=sanitizeDocumentHtml(doc.content);return $$('h1,h2,h3',holder).length;})()}</span></button></div><aside id="documentOutline" class="document-outline ${documentOutlineCollapsed?'is-collapsed':''}"><div id="documentOutlineItems">${documentOutlineMarkup(doc.content)}</div></aside></div>
    </div><div class="document-paper-wrap doc-paper-workspace"><div class="writer-paper-caption"><span id="writerPaperInfo" aria-live="polite"></span><span>Trang liên tục · khổ in theo lựa chọn</span></div><div class="doc-ruler" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span class="doc-ruler-marker">▼</span></div><article class="word-page" id="wordEditor" data-document-id="${escapeHtml(doc.id)}" contenteditable="true" role="textbox" aria-label="Nội dung tài liệu" aria-multiline="true" spellcheck="true" data-placeholder="Bắt đầu viết tại đây…">${sanitizeDocumentHtml(doc.content)||'<p><br></p>'}</article></div>
    <div class="document-editor-footer"><div><strong id="documentSaveStatus" role="status" aria-live="polite">Đã lưu · ${escapeHtml(relativeDocumentDate(doc.updatedAt))}</strong><span class="doc-footer-dot">·</span><span id="wordCount">${countWords(text)} từ</span><span class="doc-footer-dot">·</span><span id="characterCount">${text.length} ký tự</span><span class="doc-footer-dot">·</span><span id="documentAutosaveLabel">Tự động lưu</span></div><div class="document-footer-actions"><button type="button" class="button button-ghost button-small" data-action="export-document-md" data-id="${escapeHtml(doc.id)}">⇩ Markdown</button><button type="button" class="button button-ghost button-small" data-action="export-document-txt" data-id="${escapeHtml(doc.id)}">⇩ TXT</button><button type="button" class="button button-ghost button-small" data-action="export-document-html" data-id="${escapeHtml(doc.id)}">⇩ HTML</button><button type="button" class="button button-soft button-small" data-action="export-document-word" data-id="${escapeHtml(doc.id)}">⇩ Word-compatible</button><button type="button" class="button button-ghost button-small" data-action="document-recovery-export" title="Xuất văn bản hiện đang hiển thị, kể cả khi tự lưu thất bại">⇩ Cứu bản nháp TXT</button><button type="button" class="button button-ghost button-small" data-action="document-print">⎙ In / PDF</button><button type="button" class="button button-primary button-small" data-action="save-document-now">✓ Lưu ngay</button></div></div>
    <input class="visually-hidden" type="file" id="documentImageInput" accept="image/png,image/jpeg,image/webp,image/gif"><p class="document-editor-tip">Bản nháp tự lưu sau khi bạn ngừng gõ. <kbd>Ctrl</kbd> + <kbd>S</kbd> để lưu ngay. Ảnh chèn được nhúng vào tài liệu với giới hạn dung lượng để giảm rủi ro đầy bộ nhớ cục bộ.</p>`:`<div class="doc-no-open"><span>▤</span><h2>Chọn tài liệu để bắt đầu viết</h2><p>Hãy mở thư viện hoặc tạo một trang giấy mới. Nội dung của bạn không bị xóa khi đóng tab.</p><button type="button" class="button button-primary" data-action="new-document">＋ Tạo tài liệu mới</button><button type="button" class="button button-ghost" data-action="toggle-document-library">Mở thư viện</button></div>`}
  </section>`;
}

function createStudyDocument(templateKey='blank'){
  if(!saveActiveDocument(true)){showToast('Chưa thể lưu tài liệu đang mở. Hãy giải phóng dung lượng trước khi tạo tài liệu khác.','error');return;}
  const template=DOCUMENT_TEMPLATES[templateKey]||DOCUMENT_TEMPLATES.blank,now=Date.now();const doc={id:makeId('doc'),title:template.title,autoTitle:templateKey==='blank',content:sanitizeDocumentHtml(template.content),subject:template.subject,tags:template.tags,pinned:false,createdAt:now,updatedAt:now};state.documents.unshift(doc);activeDocumentId=doc.id;if(!openDocumentIds.includes(doc.id))openDocumentIds.push(doc.id);documentLibraryOpen=false;documentActionsOpen=false;if(!saveState()){state.documents=state.documents.filter(d=>d.id!==doc.id);openDocumentIds=openDocumentIds.filter(id=>id!==doc.id);activeDocumentId=openDocumentIds.at(-1)||null;showToast('Không tạo được tài liệu vì chưa lưu được dữ liệu.','error');return;}renderPage('documents');$('#wordEditor')?.focus();showToast('Đã tạo tài liệu mới trong Storage. Nội dung sẽ tự lưu khi bạn chỉnh sửa.','success');}
function saveActiveDocument(immediate=false){
  if(documentSaveTimer){clearTimeout(documentSaveTimer);documentSaveTimer=null;}
  const editor=$('#wordEditor');
  // The displayed editor may belong to an old tab while a new document is being opened.
  // Never copy the old editor contents into a different document.
  const editorId=editor?.dataset.documentId;
  const doc=(state?.documents||[]).find(d=>d.id===editorId);
  if(!editor||!doc||editorId!==activeDocumentId)return true;
  if(editor.innerHTML.length>120000){
    documentDirty=true;
    const status=$('#documentSaveStatus'),label=$('#documentAutosaveLabel');
    if(status)status.textContent='Nội dung vượt giới hạn 120.000 ký tự HTML · chưa lưu';
    if(label)label.textContent='Cần chia nhỏ tài liệu';
    showToast('Tài liệu vượt 120.000 ký tự HTML. Không cắt mất phần cuối; hãy xuất bản nháp hoặc chia nhỏ tài liệu.','error');
    return false;
  }
  const persistedDocument=JSON.stringify(doc);
  const titleField=$('#documentTitle'),subjectField=$('#documentSubject'),tagsField=$('#documentTags');applyWriterAutoTitle(doc,editor,titleField);const autoToggle=$('#writerAutoTitle');if(autoToggle&&doc.autoTitleSeeded)autoToggle.checked=false;doc.title=String(titleField?.value||'').trim().slice(0,160)||'Tài liệu chưa có tiêu đề';doc.subject=SUBJECTS.includes(subjectField?.value)?subjectField.value:'Khác';doc.tags=String(tagsField?.value||'').slice(0,180);doc.paperSize=['A4','A5','Letter','Legal'].includes($('#writerPaperSize')?.value)?$('#writerPaperSize').value:(doc.paperSize||'A4');doc.paperOrientation=$('#writerOrientation')?.value==='landscape'?'landscape':'portrait';doc.paperMargin=[12,20,25.4].includes(Number($('#writerMargin')?.value))?Number($('#writerMargin').value):20;doc.content=sanitizeDocumentHtml(editor.innerHTML);doc.updatedAt=Date.now();
  const ok=saveState();if(ok)documentDirty=false;else{documentDirty=true;Object.assign(doc,JSON.parse(persistedDocument));}const status=$('#documentSaveStatus'),label=$('#documentAutosaveLabel');if(status)status.textContent=ok?`Đã lưu · ${new Intl.DateTimeFormat('vi-VN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date(doc.updatedAt))}`:'Chưa lưu được · hãy xuất bản sao lưu';if(label)label.textContent=ok?'Đã lưu tự động':'Lỗi lưu trữ';updateDocumentEditorStats();const heading=$('#documentEditorHeading');if(heading)heading.textContent=doc.title;renderDocumentLibrary();refreshDocumentTabs();return ok;
}
function queueDocumentSave(){documentDirty=true;const status=$('#documentSaveStatus'),label=$('#documentAutosaveLabel');if(status)status.textContent='Đang lưu thay đổi…';if(label)label.textContent='Đang lưu…';updateDocumentEditorStats();if(documentSaveTimer)clearTimeout(documentSaveTimer);documentSaveTimer=setTimeout(()=>saveActiveDocument(true),650);}
function rememberDocumentSelection(){const editor=$('#wordEditor'),sel=window.getSelection();if(!editor||!sel||!sel.rangeCount)return;const range=sel.getRangeAt(0);if(editor.contains(range.commonAncestorContainer))documentSelectionRange=range.cloneRange();}
function restoreDocumentSelection(){const editor=$('#wordEditor');if(!editor)return;const sel=window.getSelection();if(documentSelectionRange&&editor.contains(documentSelectionRange.commonAncestorContainer)){sel.removeAllRanges();sel.addRange(documentSelectionRange);}else{editor.focus();}}
function applyDocumentCommand(command){const editor=$('#wordEditor');if(!editor)return;editor.focus({preventScroll:true});restoreDocumentSelection();try{document.execCommand(command,false,null);}catch(err){console.warn('Formatting command unavailable',command,err);}rememberDocumentSelection();queueDocumentSave();}
function applyDocumentFontFamily(family){
  const editor=$('#wordEditor');if(!editor)return;const allowed=['Arial','Calibri','Georgia','Verdana','Tahoma','Times New Roman','Courier New'];if(!allowed.includes(family))return;
  editor.focus({preventScroll:true});restoreDocumentSelection();document.execCommand('fontName',false,family);
  editor.querySelectorAll('font[face]').forEach(font=>{const name=font.getAttribute('face');if(!allowed.includes(name))return;const span=document.createElement('span');span.style.fontFamily=name;span.innerHTML=font.innerHTML;font.replaceWith(span);});
  rememberDocumentSelection();queueDocumentSave();
}
function changeDocumentSize(step){const select=$('#docFontSize');if(!select)return;const values=[12,14,16,18,20,24,28,36],current=Number(select.value)||16,index=values.indexOf(current),next=values[clamp((index<0?2:index)+Number(step||0),0,values.length-1)];select.value=String(next);applyDocumentFontSize(next);}
function modifySelectedTable(mode){
  const editor=$('#wordEditor');if(!editor)return;restoreDocumentSelection();const selection=window.getSelection(),node=selection?.anchorNode?.nodeType===1?selection.anchorNode:selection?.anchorNode?.parentElement,cell=node?.closest?.('td,th'),table=cell?.closest('table');
  if(!cell||!table||!editor.contains(table))return showToast('Đặt con trỏ vào một ô trong bảng trước khi chỉnh sửa hàng hoặc cột.','info');
  const row=cell.parentElement,rows=[...table.rows],col=cell.cellIndex;
  if(mode==='row-add'){const next=row.cloneNode(true);[...next.cells].forEach(c=>c.innerHTML='<br>');row.after(next);}
  else if(mode==='row-delete'){if(rows.length===1)table.remove();else row.remove();}
  else if(mode==='column-add'){rows.forEach(r=>{const ref=r.cells[col];const next=document.createElement(ref?.tagName==='TH'?'th':'td');next.innerHTML='<br>';if(ref)ref.after(next);else r.appendChild(next);});}
  else if(mode==='column-delete'){if(!rows.some(r=>r.cells.length>1))table.remove();else rows.forEach(r=>r.cells[col]?.remove());}
  queueDocumentSave();
}
function findDocumentNext(){const q=String($('#documentFindInput')?.value||'').trim(),editor=$('#wordEditor');if(!q||!editor)return showToast('Nhập từ hoặc cụm từ cần tìm.','info');editor.focus();let found=false;try{found=window.find(q,false,false,true,false,false,false);}catch(searchError){console.debug('Browser-native text search is unavailable.',searchError);}const sel=window.getSelection();if(!found||!sel?.rangeCount||!editor.contains(sel.anchorNode))showToast(`Không tìm thấy “${q}” trong tài liệu.`,'info');else rememberDocumentSelection();}
function replaceDocumentCurrent(){const editor=$('#wordEditor'),replacement=$('#documentReplaceInput')?.value??'',sel=window.getSelection();if(!editor)return;let range=sel?.rangeCount?sel.getRangeAt(0):null;if(!range||!editor.contains(range.commonAncestorContainer)||!sel.toString()){findDocumentNext();range=window.getSelection()?.rangeCount?window.getSelection().getRangeAt(0):null;}if(!range||!editor.contains(range.commonAncestorContainer)||!window.getSelection()?.toString())return showToast('Hãy tìm và chọn đoạn chữ cần thay trước.','info');document.execCommand('insertText',false,replacement);rememberDocumentSelection();queueDocumentSave();showToast('Đã thay đoạn chữ đang chọn.','success');}
function insertDocumentImageFile(file){const editor=$('#wordEditor');if(!file||!editor)return;if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type)||file.size>60*1024)return showToast('Chỉ hỗ trợ ảnh PNG/JPEG/WebP/GIF tối đa 60 KB mỗi ảnh để bảo vệ dung lượng Storage.','error');const reader=new FileReader();reader.onerror=()=>showToast('Không đọc được tệp ảnh. Nội dung tài liệu chưa đổi.','error');reader.onload=()=>{const src=String(reader.result||'');if(!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src)||src.length>85_000)return showToast('Ảnh sau mã hóa vượt quá giới hạn an toàn.','error');editor.focus();restoreDocumentSelection();document.execCommand('insertHTML',false,`<img src="${src}" alt="${escapeHtml(file.name.slice(0,100))}" style="max-width:100%;height:auto">`);rememberDocumentSelection();queueDocumentSave();};reader.readAsDataURL(file);}
function applyDocumentFontSize(size){const editor=$('#wordEditor');if(!editor)return;editor.focus({preventScroll:true});restoreDocumentSelection();document.execCommand('fontSize',false,'7');editor.querySelectorAll('font[size="7"]').forEach(font=>{const span=document.createElement('span');span.style.fontSize=`${clamp(Number(size)||12,12,36)}pt`;span.innerHTML=font.innerHTML;font.replaceWith(span);});rememberDocumentSelection();queueDocumentSave();}
function insertDocumentLink(){const editor=$('#wordEditor');if(!editor)return;restoreDocumentSelection();const raw=prompt('Nhập đường dẫn liên kết (https://…):','https://');if(!raw)return;let url;try{url=new URL(raw);}catch{return showToast('Đường dẫn chưa hợp lệ.','error');}if(!['https:','http:','mailto:'].includes(url.protocol))return showToast('Chỉ hỗ trợ liên kết http, https hoặc mailto.','error');editor.focus();restoreDocumentSelection();const selected=String(window.getSelection()?.toString()||'').trim();if(selected)document.execCommand('createLink',false,url.href);else document.execCommand('insertHTML',false,`<a href="${escapeHtml(url.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url.href)}</a>`);rememberDocumentSelection();queueDocumentSave();}
function insertDocumentTable(){const editor=$('#wordEditor');if(!editor)return;editor.focus();restoreDocumentSelection();const table='<table><tbody>'+Array.from({length:3},()=>'<tr>'+Array.from({length:3},()=>'<td><br></td>').join('')+'</tr>').join('')+'</tbody></table><p><br></p>';document.execCommand('insertHTML',false,table);rememberDocumentSelection();queueDocumentSave();}
function clearDocumentFormatting(){const editor=$('#wordEditor');if(!editor)return;editor.focus();restoreDocumentSelection();document.execCommand('removeFormat',false,null);document.execCommand('formatBlock',false,'P');queueDocumentSave();}
function exportDocumentRecoveryDraft(){
  const editor=$('#wordEditor');if(!editor)return showToast('Không có bản nháp đang mở.','error');
  try{
    const title=String($('#documentTitle')?.value||'Ban-nhap').trim().replace(/[\\/:*?"<>|]+/g,'-').slice(0,80)||'Ban-nhap';
    const text=editor.innerText||editor.textContent||'';
    const blob=new Blob([text],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`${title}-ban-nhap-chua-luu.txt`;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    showToast('Đã tạo bản nháp TXT từ nội dung đang hiển thị. Đây không phải bản lưu đầy đủ định dạng.','success');
  }catch(error){console.error('Draft recovery export failed:',error);showToast('Không thể xuất bản nháp TXT. Hãy sao chép nội dung thủ công.','error');}
}
function exportDocument(docId,format='word'){
  const doc=(state?.documents||[]).find(d=>d.id===docId)|| (state?.documents||[]).find(d=>d.id===activeDocumentId);if(!doc)return;
  const saved=saveActiveDocument(true),editor=$('#wordEditor'),liveEditor=editor?.dataset.documentId===doc.id;
  // Export is a recovery path even if localStorage is full. Never export stale text from an unsaved editor.
  const liveTitle=liveEditor?String($('#documentTitle')?.value||doc.title):String(doc.title||'');const title=liveTitle.replace(/[\\/:*?"<>|]+/g,'-').trim().slice(0,80)||'Tai-lieu';const content=sanitizeDocumentHtml(liveEditor?editor.innerHTML:doc.content);const html=`<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${escapeHtml(liveTitle)}</title><style>@page{size:${writerPaperSpec(doc.paperSize,doc.paperOrientation).print};margin:${[12,20,25.4].includes(Number(doc.paperMargin))?Number(doc.paperMargin):20}mm}body{font-family:Calibri,Arial,sans-serif;font-size:12pt;line-height:1.65;color:#20243a;max-width:800px;margin:36px auto;padding:0 28px}h1,h2,h3{line-height:1.3}table{width:100%;border-collapse:collapse}td,th{border:1px solid #aab1c2;padding:7px}blockquote{border-left:3px solid #8795b7;margin-left:0;padding-left:14px;color:#545e78}@media print{body{margin:0;padding:0;max-width:none}}</style></head><body>${content}</body></html>`;let mime='text/html;charset=utf-8',ext='html',payload=html;
  if(format==='txt'){mime='text/plain;charset=utf-8';ext='txt';payload=documentText(content);}
  else if(format==='md'){mime='text/markdown;charset=utf-8';ext='md';const holder=document.createElement('div');holder.innerHTML=content;holder.querySelectorAll('h1,h2,h3,h4').forEach(h=>{h.textContent=`${'#'.repeat(Number(h.tagName.slice(1)))} ${h.textContent}`;});holder.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));holder.querySelectorAll('p,div,li,tr').forEach(n=>n.append('\n'));payload=(holder.innerText||holder.textContent||'').replace(/\n{3,}/g,'\n\n').trim();}
  else if(format==='word'){mime='application/msword;charset=utf-8';ext='doc';}
  const blob=new Blob(['\ufeff',payload],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${title}.${ext}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);if(!saved&&liveEditor)showToast('Đã tạo bản xuất từ nội dung đang mở, nhưng thay đổi CHƯA lưu vào thư viện. Hãy giữ tệp vừa tải để bảo toàn bản nháp.','warning');else showToast(format==='word'?'Đã xuất tệp tương thích với Word (.doc), không phải tệp DOCX.':format==='html'?'Đã xuất tệp HTML.':format==='md'?'Đã xuất tệp Markdown.':'Đã xuất tệp văn bản TXT.','success');}
function printDocument(){saveActiveDocument(true);document.body.classList.add('printing-document');const cleanup=()=>document.body.classList.remove('printing-document');window.addEventListener('afterprint',cleanup,{once:true});window.print();setTimeout(cleanup,1200);}
function duplicateStudyDocument(id){const source=(state.documents||[]).find(d=>d.id===id);if(!source)return;if(!saveActiveDocument(true)){showToast('Chưa thể lưu tài liệu đang mở; không tạo bản sao để tránh mất nội dung.','error');return;}const before=snapshotStudyState(),previousActive=activeDocumentId,previousTabs=[...openDocumentIds],now=Date.now(),copy={...source,autoTitle:false,id:makeId('doc'),title:`${String(source.title||'Tài liệu').slice(0,145)} (bản sao)`,content:sanitizeDocumentHtml(source.content),pinned:false,createdAt:now,updatedAt:now};state.documents.unshift(copy);activeDocumentId=copy.id;if(!openDocumentIds.includes(copy.id))openDocumentIds.push(copy.id);if(!saveMutationOrRollback(before)){activeDocumentId=previousActive;openDocumentIds=previousTabs;refreshDocumentTabs();renderDocumentLibrary();return;}renderPage('documents');$('#documentTitle')?.focus();$('#documentTitle')?.select();showToast('Đã tạo bản sao độc lập trong Storage.','success');}
function toggleDocumentPin(id){const doc=(state.documents||[]).find(d=>d.id===id);if(!doc)return;if(!saveActiveDocument(true)){showToast('Chưa thể lưu nội dung tài liệu đang mở; không thay đổi trạng thái ghim.','error');return;}const before=snapshotStudyState(),wasPinned=!!doc.pinned;doc.pinned=!doc.pinned;doc.updatedAt=Date.now();if(!saveMutationOrRollback(before))return;renderPage('documents');showToast(wasPinned?'Đã bỏ ghim tài liệu.':'Đã ghim tài liệu lên đầu Storage.','success');}
function deleteDocument(id){
  const doc=(state.documents||[]).find(d=>d.id===id);
  if(!doc)return;
  requestConfirmation({eyebrow:'STORAGE · LỊCH SỬ XÓA',title:'Chuyển tài liệu vào lịch sử xóa?',message:`“${doc.title||'Tài liệu chưa có tiêu đề'}” sẽ được chuyển vào Lịch sử xóa.`,detail:'Bạn có thể khôi phục tài liệu nếu chưa xóa vĩnh viễn. Nếu tài liệu đang mở chưa lưu được, thao tác xóa sẽ bị dừng.',confirmLabel:'Chuyển vào lịch sử xóa',cancelLabel:'Giữ lại',danger:true},()=>{
    // Never delete a document after a failed editor save. A storage quota/security
    // error must not turn the destructive action into a way to lose unsaved edits.
    if(!saveActiveDocument(true)){
      showToast('Chưa thể lưu tài liệu đang mở; chưa xóa mục nào. Hãy xuất bản sao lưu hoặc giải phóng dung lượng rồi thử lại.','error');
      return;
    }
    const current=(state.documents||[]).find(d=>d.id===id);
    if(!current)return;
    if(softDeleteItem('document',current,'documents')){
      if(activeDocumentId===id){openDocumentIds=openDocumentIds.filter(tab=>tab!==id);activeDocumentId=openDocumentIds.at(-1)||state.documents[0]?.id||null;if(activeDocumentId&&!openDocumentIds.includes(activeDocumentId))openDocumentIds.push(activeDocumentId);}
      else openDocumentIds=openDocumentIds.filter(tab=>tab!==id);
      renderPage('documents');showToast('Đã chuyển tài liệu vào Lịch sử xóa.','success');
    }
  });
}

function allResources() { const hidden=new Set(state.hiddenBuiltinResources||[]);return [...BUILTIN_RESOURCES.filter(r=>!hidden.has(r.id)),...(state.resources||[])]; }
function renderVault() {
  const resources=allResources();const subjects=['Tất cả môn học',...new Set(resources.map(r=>r.subject).filter(Boolean))];const types=['Tất cả định dạng',...new Set(resources.map(r=>r.type).filter(Boolean))];
  return `<div class="page-heading"><div><p class="eyebrow">KNOWLEDGE VAULT / COLLECT & CONNECT</p><h1>Kho tri thức</h1><p>Lưu những đường dẫn đáng giá, bài học cần xem lại và công cụ bạn muốn tìm thấy thật nhanh.</p></div><div class="page-heading-actions"><button class="button button-ghost" data-action="export-data">⇩ Xuất bản sao lưu</button></div></div>
  <section class="surface vault-hero"><div class="vault-hero-mark">⌘</div><div class="vault-hero-copy"><h2>Mọi tài nguyên tốt đều có một chỗ của riêng nó.</h2><p>Tìm kiếm theo tên, môn, loại tài liệu hoặc thẻ. Nguồn mẫu bên dưới là đường dẫn bên ngoài để bạn tham khảo; nội dung của website gốc thuộc chủ sở hữu tương ứng.</p></div><div class="vault-count"><strong>${resources.length}</strong><br>tài nguyên</div></section>
  <div class="filter-bar"><div class="search-input-wrap"><span>⌕</span><input class="field" id="resourceSearch" placeholder="Tìm tên, môn học, mô tả hoặc thẻ…" aria-label="Tìm tài nguyên"></div><select class="select-field" id="resourceSubjectFilter" aria-label="Lọc theo môn">${subjects.map((s,i)=>`<option value="${i===0?'all':escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}</select><select class="select-field" id="resourceTypeFilter" aria-label="Lọc theo định dạng">${types.map((s,i)=>`<option value="${i===0?'all':escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}</select><select class="select-field" id="resourceSort" aria-label="Sắp xếp"><option value="name">Tên A–Z</option><option value="recent">Mới thêm trước</option></select></div>
  <div class="vault-library"><section><div class="section-heading" style="margin-top:0"><div><h2>Thư viện của bạn</h2><p id="resourceResults">${resources.length} mục sẵn sàng để khám phá</p></div></div><div class="bulk-action-bar"><div><b>${selectedResourceIds.size} tài nguyên được chọn</b><small>Nguồn mẫu chỉ bị ẩn; nguồn của bạn được chuyển vào Lịch sử xóa.</small></div><button class="button button-danger button-small" data-action="bulk-delete-resources" ${selectedResourceIds.size?'':'disabled'}>Xóa nhóm đã chọn</button><button class="button button-ghost button-small" data-action="clear-resource-selection">Bỏ chọn</button></div><div class="resource-grid" id="resourceGrid">${resources.map(resourceCardMarkup).join('')}</div><div class="empty-state hidden" id="resourceEmpty"><div class="empty-icon">⌕</div><h3>Chưa tìm thấy tài nguyên phù hợp</h3><p>Thử thay từ khóa hoặc chọn bộ lọc khác.</p><button class="button button-ghost button-small" data-action="clear-resource-filters">Xóa bộ lọc</button></div></section>
  <aside class="surface vault-add-card"><div class="section-heading" style="margin:0 0 8px"><div><h3>Thêm tài nguyên</h3><p>Lưu đường dẫn hay của riêng bạn.</p></div><span style="font-size:1.2rem;color:var(--cyan)">＋</span></div><form id="resourceForm"><div class="form-field"><label for="resourceTitle">Tên tài nguyên *</label><input class="field" id="resourceTitle" name="title" maxlength="100" placeholder="Tên bài học / trang web" required></div><div class="form-field" style="margin-top:11px"><label for="resourceUrl">Đường dẫn (http/https) *</label><input class="field" id="resourceUrl" name="url" type="url" placeholder="https://…" required></div><div class="form-grid" style="margin-top:11px"><div class="form-field"><label for="resourceSubject">Môn học</label><select class="select-field" id="resourceSubject" name="subject">${SUBJECTS.map(s=>`<option value="${escapeHtml(s)}" ${s===defaultStudySubject()?'selected':''}>${escapeHtml(s)}</option>`).join('')}</select></div><div class="form-field"><label for="resourceType">Loại</label><select class="select-field" id="resourceType" name="type">${RESOURCE_TYPES.map(s=>`<option>${s}</option>`).join('')}</select></div><div class="form-field full"><label for="resourceTags">Thẻ, cách nhau bằng dấu phẩy</label><input class="field" id="resourceTags" name="tags" maxlength="100" placeholder="Ôn tập, lớp 9, video"></div><div class="form-field full"><label for="resourceDescription">Ghi chú</label><textarea class="text-area" id="resourceDescription" name="description" maxlength="260" rows="3" placeholder="Vì sao bạn muốn lưu mục này?"></textarea></div></div><div class="form-actions"><button type="submit" class="button button-primary">＋ Lưu vào kho</button></div></form></aside></div>`;
}
function resourceCardMarkup(r) {
  const url=safeHttpUrl(r.url);const tags=Array.isArray(r.tags)?r.tags:[];const builtin=String(r.id).startsWith('seed-');
  return `<article class="surface resource-card" data-resource-id="${escapeHtml(r.id)}" data-title="${escapeHtml((r.title||'').toLowerCase())}" data-url="${escapeHtml((r.url||'').toLowerCase())}" data-subject="${escapeHtml(r.subject||'Khác')}" data-type="${escapeHtml(r.type||'Khác')}" data-search="${escapeHtml([r.title,r.description,r.subject,r.type,...tags].join(' ').toLowerCase())}" data-created="${Number(r.createdAt)||0}"><div class="resource-top"><label class="bulk-pick" title="Chọn tài nguyên"><input type="checkbox" data-action="resource-select-item" data-id="${escapeHtml(r.id)}" ${selectedResourceIds.has(r.id)?'checked':''} aria-label="Chọn tài nguyên ${escapeHtml(r.title)}"><span></span></label><span class="resource-icon">${escapeHtml(r.icon||'↗')}</span><span class="pill">${escapeHtml(r.type||'Khác')}</span></div><h3>${escapeHtml(r.title)}</h3><p>${escapeHtml(r.description||'Đã lưu vào kho tri thức của bạn.')}</p><div class="tag-list"><span class="pill pill-cyan">${escapeHtml(r.subject||'Khác')}</span>${tags.slice(0,2).map(t=>`<span class="pill">#${escapeHtml(t)}</span>`).join('')}</div><div class="resource-bottom"><a href="${escapeHtml(url||'#')}" target="_blank" rel="noopener noreferrer" ${url?'':'aria-disabled="true"'}>Mở tài nguyên ↗</a><span class="text-dim resource-origin-label" style="font-size:.59rem">${builtin?'Gợi ý mẫu':'Của bạn'}</span><button data-action="delete-resource" data-id="${escapeHtml(r.id)}" aria-label="Xóa tài nguyên ${escapeHtml(r.title)}" title="Xóa khỏi kho">×</button></div></article>`;
}
function quizQuestionTypeLabel(type){return ({'multiple-choice':'Trắc nghiệm','true-false':'Đúng / Sai','multiple-select':'Chọn nhiều','fill-blank':'Điền từ','short-answer':'Trả lời ngắn'})[type]||'Trắc nghiệm';}
function quizQuestionTypeEditor(type='multiple-choice'){
  if(type==='true-false')return `<div class="form-grid quiz-type-editor"><div class="form-field full"><label>Đáp án đúng</label><select class="select-field" id="quizCorrect" name="correct"><option value="0">Đúng</option><option value="1">Sai</option></select><small class="form-hint">Dùng cho nhận định có thể xác định là đúng hoặc sai.</small></div></div>`;
  if(type==='short-answer'||type==='fill-blank')return `<div class="quiz-type-editor"><div class="form-field"><label for="quizExpectedAnswer">Đáp án chuẩn *</label><input class="field" id="quizExpectedAnswer" name="expectedAnswer" maxlength="300" placeholder="Từ/cụm từ đúng" required></div><div class="form-field" style="margin-top:10px"><label for="quizAcceptedAnswers">Cách viết được chấp nhận (tùy chọn)</label><input class="field" id="quizAcceptedAnswers" name="acceptedAnswers" maxlength="500" placeholder="Các cách khác, ngăn cách bằng dấu |"><small class="form-hint">Đối chiếu không phân biệt chữ hoa/thường và dấu tiếng Việt; không chấm ngữ nghĩa bằng AI.</small></div></div>`;
  const correct=type==='multiple-select';
  return `<div class="answer-builder-grid quiz-type-editor" style="margin-top:12px">${[0,1,2,3].map(i=>`<div class="answer-builder"><b>${'ABCDEFGH'[i]}</b><input class="field" id="quizOption${i}" name="option${i}" maxlength="300" aria-label="Đáp án ${'ABCDEFGH'[i]}" placeholder="Đáp án ${'ABCDEFGH'[i]}" required>${correct?`<label class="quiz-correct-check"><input type="checkbox" name="correctMulti" value="${i}"> Đúng</label>`:''}</div>`).join('')}</div>${correct?'<p class="form-hint">Đánh dấu tất cả đáp án đúng; người học cần chọn đúng toàn bộ tập đáp án để được tính đúng.</p>':`<div class="form-field" style="margin-top:12px"><label for="quizCorrect">Đáp án đúng</label><select class="select-field" id="quizCorrect" name="correct"><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select></div>`}`;
}
function normalizeQuizAnswer(value){return String(value??'').replace(/[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/g,ch=>String('₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(ch)%10)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('vi').replace(/[\s.,;:!?"'“”‘’()[\]{}]+/g,' ').trim();}
function isQuizQuestionCorrect(question,response){
  if(Array.isArray(question.optionIds)&&Array.isArray(question.correctOptionIds)&&question.correctOptionIds.length)return ExamImport.gradeChoices(question,response);
  const type=question.type||'multiple-choice';
  if(type==='short-answer'||type==='fill-blank'){
    if(typeof response!=='string'||!response.trim())return false;
    const expected=[question.correctAnswer,...(question.acceptedAnswers||[])].filter(Boolean).map(normalizeQuizAnswer);
    return expected.includes(normalizeQuizAnswer(response));
  }
  if(type==='multiple-select'){
    if(!Array.isArray(response)||!response.length||response.some(x=>!Number.isInteger(x)||x<0||x>=(question.options||[]).length)||new Set(response).size!==response.length)return false;
    const selected=[...(Array.isArray(response)?response:[])].map(Number).sort((a,b)=>a-b),correct=[...(Array.isArray(question.answers)?question.answers:[question.answer])].map(Number).sort((a,b)=>a-b);
    return selected.length===correct.length&&selected.every((v,i)=>v===correct[i]);
  }
  return Number.isInteger(response)&&response>=0&&response<(question.options||[]).length&&response===question.answer;
}

/* Exam Mode + Smart Review: offline-first, persisted, auditable learning workflows. */
function getActiveExamSession(){return activeExamId&&state?.examSessions?.find(s=>s.id===activeExamId)||null;}
function examQuestionValid(q){
  if(!q||typeof q!=='object'||typeof q.question!=='string'||!q.question.trim()||q.question.length>3000)return false;
  const type=q.type||'multiple-choice';
  if(!['multiple-choice','true-false','multiple-select','short-answer','fill-blank'].includes(type))return false;
  if(type==='short-answer'||type==='fill-blank')return typeof q.correctAnswer==='string'&&!!q.correctAnswer.trim()&&q.correctAnswer.length<=300&&(q.acceptedAnswers===undefined||Array.isArray(q.acceptedAnswers)&&q.acceptedAnswers.length<=30&&q.acceptedAnswers.every(a=>typeof a==='string'&&a.length<=300));
  if(!Array.isArray(q.options)||q.options.length<2||q.options.length>8||q.options.some(o=>typeof o!=='string'||!o.trim()||o.length>1000))return false;
  if(type==='true-false'&&q.options.length!==2)return false;
  if(type==='multiple-select')return Array.isArray(q.answers)&&q.answers.length>0&&new Set(q.answers).size===q.answers.length&&q.answers.every(i=>Number.isInteger(i)&&i>=0&&i<q.options.length);
  return Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length;
}
function examQuestionCopy(q,source){
  const copy={...q,id:makeId('exam-q'),type:q.type||'multiple-choice',subject:SUBJECTS.includes(q.subject)?q.subject:(source?.subject||'Khác'),points:clamp(Number(q.points)||1,1,10),sourceLabel:String(source?.label||q.sourceLabel||'Ngân hàng câu hỏi').slice(0,120),options:Array.isArray(q.options)?q.options.map(x=>String(x).slice(0,1000)):[],answers:Array.isArray(q.answers)?q.answers.slice():[],acceptedAnswers:Array.isArray(q.acceptedAnswers)?q.acceptedAnswers.map(x=>String(x).slice(0,300)):[]};
  if(copy.options.length){const ids=Array.isArray(q.optionIds)&&q.optionIds.length===copy.options.length&&new Set(q.optionIds).size===q.optionIds.length?q.optionIds:copy.options.map((_,i)=>`${q.id||copy.id}-option-${i}`);copy.optionIds=[...ids];copy.correctOptionIds=(copy.type==='multiple-select'?copy.answers:[copy.answer]).map(i=>ids[i]).filter(Boolean);}
  copy.reviewKey=q.reviewKey||examQuestionFingerprint(q);copy.question=String(q.question).slice(0,3000);copy.explanation=String(q.explanation||'').slice(0,2000);if(typeof q.correctAnswer==='string')copy.correctAnswer=q.correctAnswer.slice(0,300);return copy;
}
function examQuestionCatalog(){
  const questions=[];
  const quizzes=[...visibleBuiltinQuizzes(),...(state.customQuizzes||[])];
  for(const quiz of quizzes){if(!Array.isArray(quiz.questions))continue;quiz.questions.forEach((q,index)=>{const item={...q,subject:SUBJECTS.includes(q.subject)?q.subject:quiz.subject||'Khác'};const source={type:'quiz',id:quiz.id,label:`Quiz · ${quiz.title}`,subject:quiz.subject||'Khác'};if(examQuestionValid(item))questions.push(examQuestionCopy(item,source));});}
  for(const item of (state.examQuestionBank||[])){if(examQuestionValid(item))questions.push(examQuestionCopy(item,{type:'bank',id:item.id,label:`Ngân hàng câu hỏi · ${item.subject||'Khác'}`,subject:item.subject}));}
  return questions;
}
function examSourceCounts(){return [...visibleBuiltinQuizzes(),...(state.customQuizzes||[])].filter(q=>Array.isArray(q.questions)&&q.questions.some(examQuestionValid));}
function renderExamSourceList(){const sources=examSourceCounts();if(!sources.length)return '<div class="empty-state"><h3>Chưa có bộ quiz khả dụng</h3><p>Chọn bộ mẫu/bộ đã lưu trước đây hoặc thêm câu vào Ngân hàng câu hỏi bên dưới.</p></div>';return sources.map(q=>`<label class="exam-source-option"><input type="checkbox" data-exam-quiz-source value="${escapeHtml(q.id)}" checked><span><b>${escapeHtml(q.title)}</b><small>${escapeHtml(q.subject||'Khác')} · ${q.questions.filter(examQuestionValid).length} câu · ${BUILTIN_QUIZZES.some(b=>b.id===q.id)?'Bộ mẫu':'Bộ của bạn'}</small></span></label>`).join('');}
function examFlashcardDecks(){const names=new Map();for(const c of state.flashcards||[]){const id=c.deckId||'legacy-all',name=c.deckName||'Bộ cũ';if(!names.has(id))names.set(id,{id,name,subject:c.subject||'Khác',count:0});names.get(id).count++;}return [...names.values()];}
function examIntegrityPolicyKey(config={}){
  const canonical=JSON.stringify({v:1,subject:String(config.subject||'all'),questionCount:Number(config.questionCount)||0,durationMinutes:Number(config.durationMinutes)||0,quizIds:[...(config.quizIds||[])].map(String).sort(),includeBank:!!config.includeBank,bankIds:config.includeBank?[...(config.bankIds||[])].map(String).sort():[],flashMode:['due','all'].includes(config.flashMode)?config.flashMode:'none',deckId:config.flashMode==='none'?'all':String(config.deckId||'all')});
  const reversed=[...canonical].reverse().join('');return `integrity-${notificationHash(canonical)}-${notificationHash(reversed)}`;
}
function examIntegrityPolicyKeyForSession(session){
  if(typeof session?.integrityPolicyKey==='string'&&session.integrityPolicyKey.startsWith('integrity-'))return session.integrityPolicyKey;
  const source=session?.sourceSummary||{};return examIntegrityPolicyKey({subject:source.subject||session?.subject||'all',questionCount:source.questionCount||session?.questions?.length||0,durationMinutes:session?.durationMinutes||0,quizIds:source.quizIds||[],includeBank:!!source.includeBank,bankIds:source.bankIds||[],flashMode:source.flashMode||'none',deckId:source.deckId||'all'});
}
function examIntegrityPenaltyFor(violationNumber,now,deadlineAt){
  const violation=Math.max(1,Math.floor(Number(violationNumber)||1)),time=Number(now)||Date.now(),deadline=Math.max(0,Number(deadlineAt)||time),durationMs=({1:5000,2:15000,3:30000})[violation]||0;
  return {violationNumber:violation,lockUntil:violation>=4?Math.max(time,deadline):time+durationMs,originalDeadlineAt:deadline,lockKind:violation>=4?'deadline':'duration',durationMs};
}
function getExamIntegrityRecord(key){return (state?.examIntegrityRecords||[]).find(record=>record.key===key)||null;}
function getActiveExamLockouts(now=Date.now()) { return [...(state?.examIntegrityRecords||[])].filter(record=>Number(record.lockUntil)>now).sort((a,b)=>Number(a.lockUntil)-Number(b.lockUntil)); }
function examLockoutMarkup(){
  const locks=getActiveExamLockouts();if(!locks.length)return '';
  return `<section class="surface exam-lockout-banner" aria-label="Trạng thái khóa vào lại Exam Mode"><div class="exam-lockout-banner-head"><div><p class="eyebrow">EXAM INTEGRITY / KHÓA VÀO LẠI</p><h2>Đang tạm khóa vào Exam Mode</h2><p>Một lượt thi đã bị hủy theo chính sách đã thông báo. Bộ đếm vi phạm được lưu cục bộ trên trình duyệt này; không có đồng bộ máy chủ.</p></div><span class="exam-lockout-shield" aria-hidden="true">⛨</span></div><div class="exam-lockout-items">${locks.map((record,index)=>{const until=Number(record.lockUntil)||Date.now(),deadlineLock=record.lockKind==='deadline'||Number(record.violations)>=4;const seconds=Math.max(0,Math.ceil((until-Date.now())/1000));return `<article class="exam-lockout-item"><div><b>${deadlineLock?'Khóa đến hạn kết thúc lượt thi ban đầu':`Mức phạt ${record.violations}: khóa vào lại`}</b><small>${record.violations} lần vi phạm đã xác minh · ${record.lastReason==='TAB_HIDDEN'?'chuyển tab/ẩn trang':record.lastReason==='PAGEHIDE'?'rời/đóng trang thi':'thoát toàn màn hình'} · không lưu câu trả lời của lượt bị hủy</small></div><strong data-exam-lock-until="${until}" data-exam-lock-kind="${deadlineLock?'deadline':'duration'}">${formatClock(seconds)}</strong></article>`;}).join('')}</div><p class="exam-lockout-footnote">Hết thời hạn khóa, bạn có thể bắt đầu một lượt mới. Các lần vi phạm trước vẫn được giữ cho đúng cấu hình bài thi. Tải lại trang không đặt lại bộ đếm.</p></section>`;
}
let examIntegrityDialogTimer=null;
let examIntegrityDialogPreviousFocus=null;
function closeExamIntegrityDialog(){
  const overlay=document.getElementById('examIntegrityDialog');
  if(examIntegrityDialogTimer){clearInterval(examIntegrityDialogTimer);examIntegrityDialogTimer=null;}
  if(overlay)overlay.remove();
  if(examIntegrityDialogPreviousFocus?.isConnected)examIntegrityDialogPreviousFocus.focus({preventScroll:true});
  examIntegrityDialogPreviousFocus=null;
}
function showExamIntegrityDialog(record,reason,persisted){
  closeExamIntegrityDialog();
  examIntegrityDialogPreviousFocus=document.activeElement;
  const overlay=document.createElement('div');overlay.id='examIntegrityDialog';overlay.className='exam-integrity-overlay';
  const lockUntil=Math.max(0,Number(record.lockUntil)||0),n=Number(record.violations)||1;
  const deadlineLock=record.lockKind==='deadline'||n>=4;
  const eventText=({FULLSCREEN_EXIT:'Đã rời chế độ toàn màn hình sau khi Chế độ giám sát được kích hoạt.',TAB_HIDDEN:'Trang thi đã bị chuyển sang nền/ẩn sau khi Chế độ giám sát được kích hoạt.',PAGEHIDE:'Trang thi đã bị rời hoặc đóng sau khi Chế độ giám sát được kích hoạt.'})[reason]||'Một sự kiện vi phạm điều kiện Chế độ giám sát đã được ghi nhận.';
  overlay.innerHTML=`<section class="exam-integrity-dialog" role="alertdialog" aria-modal="true" aria-labelledby="examIntegrityDialogTitle" aria-describedby="examIntegrityDialogDescription" tabindex="-1">
    <div class="exam-integrity-emblem" aria-hidden="true">!</div>
    <p class="eyebrow exam-integrity-eyebrow">EXAM MODE · KIỂM SOÁT PHIÊN THI</p>
    <h2 id="examIntegrityDialogTitle">VI PHẠM QUY ĐỊNH THI</h2>
    <p id="examIntegrityDialogDescription">${escapeHtml(eventText)}</p>
    <div class="exam-integrity-facts">
      <div><span>Lượt thi</span><strong>Đã hủy · Không lưu điểm và câu trả lời</strong></div>
      <div><span>Mức phạt</span><strong>Lần ${n} · ${deadlineLock?'khóa đến hạn thi':'khóa vào lại'}</strong></div>
      <div><span>Thời gian còn lại</span><strong class="exam-integrity-time" data-integrity-modal-countdown aria-live="off">${formatClock(Math.max(0,Math.ceil((lockUntil-Date.now())/1000)))}</strong></div>
    </div>
    ${persisted?'':'<p class="exam-integrity-save-error" role="status">Không thể lưu bộ đếm vào trình duyệt. Trạng thái sau khi tải lại chưa được bảo đảm; hãy xuất bản sao lưu và kiểm tra dung lượng.</p>'}
    <p class="exam-integrity-hint" data-integrity-modal-hint>Đóng thông báo không hủy hình phạt. Bạn vẫn có thể dùng các công cụ học tập khác.</p>
    <button type="button" class="button button-primary exam-integrity-ack" data-action="exam-integrity-ack">Đã hiểu · Quay về Exam Mode</button>
  </section>`;
  document.body.appendChild(overlay);
  const dialog=overlay.querySelector('.exam-integrity-dialog'),countdown=overlay.querySelector('[data-integrity-modal-countdown]'),hint=overlay.querySelector('[data-integrity-modal-hint]');
  const update=()=>{if(!countdown?.isConnected){if(examIntegrityDialogTimer)clearInterval(examIntegrityDialogTimer);examIntegrityDialogTimer=null;return;}
    const seconds=Math.max(0,Math.ceil((lockUntil-Date.now())/1000));countdown.textContent=formatClock(seconds);
    if(seconds===0){hint.textContent='Hết thời gian khóa. Có thể bắt đầu một lượt mới nếu cấu hình bài thi vẫn hợp lệ.';if(examIntegrityDialogTimer){clearInterval(examIntegrityDialogTimer);examIntegrityDialogTimer=null;}}
  };
  update();if(lockUntil>Date.now())examIntegrityDialogTimer=setInterval(update,250);
  dialog.focus({preventScroll:true});
}
function stopExamLockoutCountdown(){if(examLockoutTimer){clearInterval(examLockoutTimer);examLockoutTimer=null;}}
function startExamLockoutCountdown(){
  stopExamLockoutCountdown();if(activePage!=='exam')return;const nodes=$$('#pageContent [data-exam-lock-until]');if(!nodes.length)return;
  const update=()=>{let expired=false;for(const node of nodes){const until=Number(node.dataset.examLockUntil)||0,seconds=Math.max(0,Math.ceil((until-Date.now())/1000));node.textContent=formatClock(seconds);if(seconds<=0)expired=true;}if(expired){stopExamLockoutCountdown();if(activePage==='exam')renderPage('exam',{recordHistory:false});}};
  update();if(nodes.length&&!getActiveExamLockouts().length)return;examLockoutTimer=setInterval(update,250);
}
function examLockoutMessage(record){const remaining=Math.max(0,Math.ceil(((Number(record?.lockUntil)||Date.now())-Date.now())/1000));return `Exam Mode đang khóa vào lại trong ${formatClock(remaining)}. Các câu trả lời của lượt vi phạm không được lưu.`;}
function renderExamBankForm(){return `<section class="surface exam-bank-editor"><div class="section-heading"><div><p class="eyebrow">QUESTION BANK</p><h2>Thêm câu hỏi riêng</h2><p>Câu hỏi được lưu cục bộ vào hồ sơ này và có thể được đưa vào Exam Blueprint.</p></div><span class="pill">${state.examQuestionBank.length} câu</span></div><form id="examBankQuestionForm"><div class="form-grid"><div class="form-field full"><label for="examBankQuestion">Nội dung câu hỏi *</label><textarea class="text-area" id="examBankQuestion" name="question" rows="3" maxlength="3000" required placeholder="Viết câu hỏi rõ ràng, có thể chấm được…"></textarea></div><div class="form-field"><label for="examBankSubject">Môn học</label><select class="select-field" id="examBankSubject" name="subject">${SUBJECTS.map(x=>`<option value="${escapeHtml(x)}" ${x===defaultStudySubject()?'selected':''}>${escapeHtml(x)}</option>`).join('')}</select></div><div class="form-field"><label for="examBankQuestionType">Dạng câu hỏi</label><select class="select-field" id="examBankQuestionType" name="questionType"><option value="short-answer">Trả lời ngắn</option><option value="fill-blank">Điền từ</option><option value="multiple-choice">Trắc nghiệm một đáp án</option><option value="multiple-select">Chọn nhiều đáp án</option><option value="true-false">Đúng / Sai</option></select></div><div class="form-field full"><div id="examBankQuestionTypeFields">${quizQuestionTypeEditor('short-answer')}</div></div><div class="form-field full"><label for="examBankExplanation">Giải thích / nguồn (tùy chọn)</label><textarea class="text-area" id="examBankExplanation" name="explanation" rows="2" maxlength="2000" placeholder="Ghi nguồn hoặc giải thích ngắn để bạn kiểm tra lại…"></textarea></div></div><div class="form-actions"><button class="button button-primary" type="submit">＋ Lưu câu hỏi</button></div></form></section>`;}
function renderExamBankList(){return nextExamLibrary();}
function legacyExamBankList(){const items=[...(state.examQuestionBank||[])].slice().reverse();return `<section class="surface exam-bank-list"><div class="section-heading"><div><h2>Ngân hàng câu hỏi cá nhân</h2><p>${items.length} câu đã lưu · đáp án mẫu lấy từ nguồn của bạn, hãy rà soát trước khi thi.</p></div></div>${items.length?`<div class="exam-bank-items">${items.map(q=>`<article class="exam-bank-row"><div><span class="pill">${escapeHtml(q.subject||'Khác')}</span><span class="quiz-type-tag">${escapeHtml(quizQuestionTypeLabel(q.type))}</span><h3>${escapeHtml(q.question)}</h3><p>Đáp án: ${escapeHtml(q.type==='multiple-select'?(q.answers||[]).map(i=>q.options?.[i]).join(' + '):(q.type==='short-answer'||q.type==='fill-blank'?q.correctAnswer:q.options?.[q.answer]||''))}</p></div><button class="icon-button" data-action="exam-bank-delete" data-id="${escapeHtml(q.id)}" aria-label="Xóa câu hỏi ${escapeHtml(q.question.slice(0,70))}" title="Chuyển vào lịch sử xóa">×</button></article>`).join('')}</div>`:'<div class="empty-state"><h3>Ngân hàng câu hỏi đang trống</h3><p>Bắt đầu bằng một câu hỏi do bạn tự tạo, hoặc tạo đề từ các bộ quiz sẵn có.</p></div>'}</section>`;}
function renderExamHistory(){const sessions=[...(state.examSessions||[])].slice().sort((a,b)=>(b.startedAt||0)-(a.startedAt||0)).slice(0,20);const labels={IN_PROGRESS:'Đang làm',COMPLETED:'Hoàn thành',TIMED_OUT:'Hết giờ',CANCELED:'Đã hủy',INTERRUPTED:'Gián đoạn',PENDING_REVIEW:'Chờ chấm'};return `<section class="surface exam-history"><div class="section-heading"><div><h2>Lịch sử phiên thi</h2><p>Chỉ phiên đã hoàn thành mới được tính là hợp lệ; các phiên bị hủy hoặc gián đoạn không được cộng XP.</p></div></div>${sessions.length?`<div class="exam-history-list">${sessions.map(s=>`<article class="exam-history-row"><div><b>${escapeHtml(s.title||'Bài kiểm tra')}</b><small>${new Date(s.startedAt||Date.now()).toLocaleString('vi-VN')} · ${s.endReason==='INTEGRITY_VIOLATION'?'lượt bị hủy theo chính sách':`${s.questions.length} câu`} · ${Number(s.durationMinutes)||0} phút${s.endReason==='INTEGRITY_VIOLATION'?' · không lưu câu trả lời':''}</small></div><span class="exam-status exam-status-${String(s.status).toLowerCase()}">${labels[s.status]||s.status}</span><div class="exam-history-score">${s.score?`${s.score.earned}/${s.score.max} điểm`:s.status==='IN_PROGRESS'?'Chưa có điểm':'—'}</div>${s.status==='IN_PROGRESS'?`<button class="button button-soft button-small" data-action="exam-resume" data-id="${escapeHtml(s.id)}">Tiếp tục</button>`:s.score&&['COMPLETED','TIMED_OUT'].includes(s.status)?`<button class="button button-soft button-small" data-action="exam-view-result" data-id="${escapeHtml(s.id)}">Xem kết quả</button>`:''}</article>`).join('')}</div>`:'<div class="empty-state"><h3>Chưa có phiên thi nào</h3><p>Sau khi tạo đề và bắt đầu kiểm tra, lịch sử sẽ xuất hiện tại đây.</p></div>'}</section>`;}
let examScratchExpanded=false;
let examNavigatorFilter='all';
const EXAM_MAP_PAGE_SIZE=84;
let examNavigatorPage=0;
let examResultFilter='all';
const EXAM_PRESETS={quick:{label:'Luyện nhanh',count:10,minutes:15},standard:{label:'Kiểm tra tiêu chuẩn',count:25,minutes:35},deep:{label:'Thử thách chuyên sâu',count:50,minutes:60}};
function applyExamPreset(key){
  const config=EXAM_PRESETS[key];if(!config)return;
  const countField=$('#examQuestionCount'),durationField=$('#examDuration');if(!countField||!durationField)return;
  const available=typeof nextExamCandidates==='function'?nextExamCandidates().length:config.count;
  if(!available)return showToast('Chưa có câu hỏi hợp lệ. Hãy chọn hoặc nhập một nguồn đề trước.','warning');
  const finalCount=Math.min(config.count,available);
  countField.value=String(finalCount);durationField.value=String(config.minutes);
  $$('.exam-preset-card').forEach(node=>node.classList.toggle('is-active',node.dataset.preset===key));
  if(typeof refreshNextExamPlan==='function')refreshNextExamPlan();
  showToast(finalCount<config.count?`Nguồn hiện có ${available} câu; đã chọn ${finalCount} câu và ${config.minutes} phút.`:`Đã chọn cấu hình ${config.label.toLowerCase()}.`,'info');
}
function examJumpNextUnanswered(){
  const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS')return;
  const total=session.questions.length,initial=Number(session.currentIndex)||0;
  let next=-1;for(let offset=1;offset<=total;offset++){
    const index=(initial+offset)%total;
    if(!Object.prototype.hasOwnProperty.call(session.responses||{},session.questions[index].id)){next=index;break;}
  }
  if(next<0)return showToast('Bạn đã trả lời tất cả câu hỏi. Hãy xem lại trước khi nộp.','success');
  if(next===initial)return showToast('Đây là câu duy nhất chưa trả lời.','info');
  jumpExamQuestion(next);
}
function renderExamMode(){
  let session=getActiveExamSession();
  if(session?.status==='IN_PROGRESS'){
    if(session.deadlineAt<=Date.now()){finishExamSession(session.id,'TIMED_OUT','DEADLINE',{render:false});session=state.examSessions.find(x=>x.id===session.id);}
    else return renderExamPlayer(session);
  }
  activeExamId=null;examFullscreenEstablished=false;if(examTimer){clearInterval(examTimer);examTimer=null;}
  if(selectedExamResultId){const resultSession=(state.examSessions||[]).find(x=>x.id===selectedExamResultId&&['COMPLETED','TIMED_OUT'].includes(x.status));if(resultSession&&resultSession.score)return `<div class="page-heading"><div><p class="eyebrow">EXAM MODE / RESULT</p><h1>Kết quả bài thi</h1><p>Phân tích dựa trên bản chụp dữ liệu đã lưu khi bắt đầu bài thi.</p></div><div class="page-heading-actions"><button class="button button-soft" data-action="exam-new-blueprint">← Về thiết lập đề</button></div></div>${renderExamResultCard(resultSession)}${renderExamHistory()}`;selectedExamResultId=null;}
  const inProgress=[...(state.examSessions||[])].filter(x=>x.status==='IN_PROGRESS').sort((a,b)=>b.startedAt-a.startedAt);
  const entryLocked=getActiveExamLockouts().length>0;
  const inventories=examQuestionCatalog();const dueCards=(state.flashcards||[]).filter(c=>!Number(c.dueAt)||Number(c.dueAt)<=Date.now()).length;
  const decks=examFlashcardDecks();
  return `<div class="page-heading"><div><p class="eyebrow">EXAM MODE / BLUEPRINT → SESSION → REVIEW</p><h1>Exam Mode</h1><p>Chọn nguồn → Thiết lập đề → Làm bài → Xem kết quả.</p></div><div class="page-heading-actions"><button class="button button-soft" data-action="navigate" data-page="review">✧ Mở Ôn thông minh</button></div></div>
  <section class="exam-command-center" aria-label="Trung tâm Exam Mode"><div class="exam-command-orbit" aria-hidden="true">◈</div><div class="exam-command-copy"><span class="exam-kicker">LUMEVIA · EXAM STUDIO 3.6</span><h2>Chuẩn bị thông minh. Thi tập trung. Ôn đúng trọng tâm.</h2><p>Chọn nguồn và cấu hình đề trong vài bước, theo dõi tiến độ theo từng câu, sau đó xem lại lời giải và câu cần củng cố.</p></div><div class="exam-command-metrics"><span><strong>${inventories.length}</strong><small>Bộ quiz hiện có</small></span><span><strong>${(state.examQuestionBank||[]).length}</strong><small>Câu trong ngân hàng</small></span><span><strong>${(state.examSessions||[]).filter(x=>x.status==='COMPLETED').length}</strong><small>Lượt thi hoàn thành</small></span></div></section>
  <details class="v36-exam-disclosure"><summary><b>Nhập đề từ tài liệu</b><small>Mở khi cần chuyển tài liệu thành câu hỏi</small></summary>${documentExamImportMarkup()}</details>
  ${examLockoutMarkup()}
  ${inProgress.length?`<section class="surface exam-resume-banner"><div><span class="eyebrow">PHIÊN CHƯA KẾT THÚC</span><h2>${escapeHtml(inProgress[0].title||'Bài kiểm tra đang làm')}</h2><p>${entryLocked?'Tạm thời không thể vào lại khi hình phạt còn hiệu lực.':inProgress[0].deadlineAt>Date.now()?`Còn ${formatClock(Math.ceil((inProgress[0].deadlineAt-Date.now())/1000))}; câu trả lời đã lưu cục bộ.`:'Đã quá hạn, phiên sẽ được chấm hết giờ khi mở lại.'}</p></div><button class="button button-primary" data-action="exam-resume" data-id="${escapeHtml(inProgress[0].id)}" ${entryLocked?'disabled':''}>${entryLocked?'Đang khóa':'Tiếp tục phiên ↗'}</button></section>`:''}
  <details class="v36-exam-disclosure"><summary><b>Thư viện câu hỏi và bộ đề</b><small>Mở danh sách nguồn đã lưu</small></summary>${renderExamBankList()}</details><div class="exam-layout v36-exam-layout"><section class="surface exam-blueprint"><div class="section-heading"><div><p class="eyebrow">01 / EXAM BLUEPRINT</p><h2>Thiết lập đề</h2><p>Chỉ nguồn được chọn mới được sử dụng. Không đủ câu hợp lệ thì hệ thống từ chối tạo đề, không tự thêm câu giả.</p></div></div>
  <div class="exam-preset-zone"><div class="exam-preset-heading"><div><span class="eyebrow">EXAM PRESETS</span><h3>Chọn nhịp độ luyện tập</h3></div><small>Có thể tùy chỉnh số câu và thời gian bên dưới</small></div><div class="exam-presets">${Object.entries(EXAM_PRESETS).map(([key,item],i)=>`<button type="button" class="exam-preset-card" data-action="exam-preset" data-preset="${key}"><span class="exam-preset-icon" aria-hidden="true">${['⚡','◈','✧'][i]}</span><strong>${item.label}</strong><span>${item.count} câu · ${item.minutes} phút</span><small>${['Khởi động và củng cố','Đánh giá kiến thức toàn diện','Luyện sức bền và tốc độ'][i]}</small></button>`).join('')}</div></div>
  <div class="exam-source-group"><div class="exam-subheading"><b>Nguồn bài trắc nghiệm</b><small>Chọn một hoặc nhiều bộ · ${inventories.length} bộ đang có</small></div><div class="exam-source-list">${renderExamSourceList()}</div></div>
  <div class="exam-source-group"><div class="exam-subheading"><b>Ngân hàng câu hỏi</b><small>${state.examQuestionBank.length} câu tự tạo</small></div><label class="exam-source-option"><input id="examIncludeBank" type="checkbox" checked><span><b>Dùng câu hỏi trong ngân hàng</b><small>Câu hỏi phải đủ đáp án và có cấu trúc chấm hợp lệ.</small></span></label><label for="examBankBatch">Nhóm câu hỏi</label><select id="examBankBatch" class="select-field">${examBankBatchOptions()}</select></div>
  <div class="exam-source-group"><div class="exam-subheading"><b>Flashcards</b><small>${(state.flashcards||[]).length} thẻ · ${dueCards} thẻ đến hạn</small></div><div class="form-grid"><div class="form-field"><label for="examFlashMode">Nguồn flashcard</label><select class="select-field" id="examFlashMode"><option value="none">Không dùng flashcards</option><option value="due">Chỉ thẻ đến hạn</option><option value="all">Tất cả thẻ</option></select></div><div class="form-field"><label for="examFlashDeck">Bộ thẻ</label><select class="select-field" id="examFlashDeck"><option value="all">Tất cả bộ thẻ</option>${decks.map(d=>`<option value="${escapeHtml(d.id)}">${escapeHtml(d.name)} · ${d.count} thẻ</option>`).join('')}</select></div></div><small class="form-hint">Thẻ được chuyển thành câu trả lời ngắn theo mặt trước → mặt sau. Hãy chọn phần nội dung có thể đối chiếu đáng tin cậy.</small></div>
  <div class="form-grid exam-blueprint-fields"><div class="form-field"><label for="examTitle">Tên bài thi</label><input class="field" id="examTitle" maxlength="100" value="Bài kiểm tra tổng hợp" required></div><div class="form-field"><label for="examSubjectFilter">Môn học</label><select id="examSubjectFilter" class="select-field"><option value="all" selected>Tất cả môn</option>${SUBJECTS.map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}</select></div><div class="form-field"><label for="examQuestionCount">Số câu</label><input class="field" id="examQuestionCount" type="number" min="1" max="1000" value="10" required></div><div class="form-field"><label for="examDuration">Thời gian (phút)</label><input class="field" id="examDuration" type="number" min="1" max="180" value="15" required></div></div>
  <div class="exam-option-list"><label class="exam-option"><input id="examShuffle" type="checkbox" checked><span><b>Xáo trộn câu hỏi</b><small>Xáo trộn trước khi lưu đề; giữ nguyên thứ tự sau khi bắt đầu.</small></span></label><label class="exam-option"><input id="examShuffleOptions" type="checkbox" checked><span><b>Xáo trộn lựa chọn</b><small>Đáp án được gắn ID và giữ nguyên trong phiên thi.</small></span></label><label class="exam-option exam-option-strict"><input id="examStrictFullscreen" type="checkbox" checked><span><b>Chế độ thi toàn màn hình</b><small>Thoát fullscreen hoặc chuyển tab/ẩn trang sau khi Chế độ giám sát đã vào fullscreen sẽ hủy lượt thi. Khóa vào lại tăng dần 5 giây → 15 giây → 30 giây → đến deadline ban đầu của lượt vi phạm thứ tư trở đi. Việc lưu cục bộ không thể ngăn người có quyền sửa dữ liệu trình duyệt; không thể giám sát thiết bị khác.</small></span></label></div><button class="button button-primary button-full exam-create-button" data-action="exam-create" ${entryLocked?'disabled':''}>${entryLocked?'Đang khóa vào lại':'Tạo đề và bắt đầu thi ↗'}</button><p class="form-hint">Độ khó/phân bổ chương chưa thể tự suy ra đáng tin cậy vì dữ liệu hiện chưa có nhãn phân loại thống nhất. Hiện chọn lọc theo nguồn và môn học.</p></section>
  <aside class="exam-side-column"><details class="v36-exam-disclosure v36-exam-editor"><summary><b>＋ Tạo câu hỏi riêng</b><small>Trình biên tập câu hỏi</small></summary>${renderExamBankForm()}</details><section class="surface v36-exam-guide"><p class="eyebrow">3 BƯỚC THỰC HIỆN</p><h3>Thi gọn, học sâu</h3><p>01 · Chọn nguồn đề</p><p>02 · Đặt số câu và thời gian</p><p>03 · Làm bài và ôn câu sai</p></section></aside></div>${renderExamHistory()}`;
}
function renderExamPlayer(session){
  activeExamId=session.id;startExamTimer();
  const total=session.questions.length,index=clamp(Number(session.currentIndex)||0,0,Math.max(0,total-1)),q=session.questions[index];
  if(!q){finishExamSession(session.id,'CANCELED','EMPTY_SNAPSHOT',{render:false});return renderExamMode();}
  const response=session.responses?.[q.id],type=q.type||'multiple-choice';
  const answered=Object.prototype.hasOwnProperty.call(session.responses||{},q.id),marked=(session.markedForReview||[]).includes(q.id);
  const answeredCount=session.questions.filter(item=>Object.prototype.hasOwnProperty.call(session.responses||{},item.id)).length;
  const flaggedCount=session.questions.filter(item=>(session.markedForReview||[]).includes(item.id)).length;
  const remain=total-answeredCount,seconds=Math.max(0,Math.ceil((session.deadlineAt-Date.now())/1000));
  const urgency=seconds<=60?'is-critical':seconds<=300?'is-warning':'';
  let input='';
  if(type==='short-answer'||type==='fill-blank'){
    input=`<div class="exam-answer-text"><label for="examTextAnswer">${type==='fill-blank'?'Điền phần còn thiếu':'Câu trả lời'}</label><textarea class="text-area" id="examTextAnswer" maxlength="1000" rows="4" placeholder="Nhập câu trả lời của bạn…">${escapeHtml(typeof response==='string'?response:'')}</textarea><div class="exam-answer-autosave"><span class="exam-autosave-dot"></span><small role="status">${answered?'Câu trả lời đã được lưu':'Tự lưu khi nhập câu trả lời'}</small><button type="button" class="button button-soft button-small" data-action="exam-save-text-answer" data-id="${escapeHtml(q.id)}">Lưu ngay</button></div></div>`;
  } else {
    input=`<div class="exam-options exam-options-elevated ${type==='multiple-select'?'exam-options-multi':''}">${(q.options||[]).map((opt,i)=>{const chosen=type==='multiple-select'?Array.isArray(response)&&response.includes(i):response===i;return `<button type="button" class="exam-option-answer ${chosen?'is-selected':''}" data-action="${type==='multiple-select'?'exam-toggle-option':'exam-answer-option'}" data-id="${escapeHtml(q.id)}" data-index="${i}" aria-pressed="${chosen}"><span class="exam-letter">${type==='true-false'?(i===0?'✓':'×'):'ABCDEFGH'[i]||String(i+1)}</span><span class="exam-choice-copy">${escapeHtml(opt)}</span><span class="exam-choice-check" aria-hidden="true">${chosen?'✓':'○'}</span></button>`;}).join('')}</div><p class="exam-choice-hint">${type==='multiple-select'?'Chọn tất cả đáp án phù hợp. Mỗi thay đổi được tự lưu.':'Nhấp vào đáp án để lưu ngay. Có thể thay đổi lựa chọn trước khi nộp.'}</p>`;
  }
  const filtered=session.questions.map((item,i)=>({item,i,done:Object.prototype.hasOwnProperty.call(session.responses||{},item.id),flagged:(session.markedForReview||[]).includes(item.id)}))
    .filter(item=>examNavigatorFilter==='all'||(examNavigatorFilter==='unanswered'&&!item.done)||(examNavigatorFilter==='flagged'&&item.flagged));
  // Large exams (up to 1,000 questions) must not create 1,000 DOM buttons
  // for every answer or navigation. Keep the complete filter in memory and
  // render one accessible, keyboard-focusable page of question buttons.
  const navigatorPages=Math.max(1,Math.ceil(filtered.length/EXAM_MAP_PAGE_SIZE));
  examNavigatorPage=clamp(examNavigatorPage,0,navigatorPages-1);
  const navigatorStart=examNavigatorPage*EXAM_MAP_PAGE_SIZE;
  const visibleQuestions=filtered.slice(navigatorStart,navigatorStart+EXAM_MAP_PAGE_SIZE);
  const navigationPager=filtered.length>EXAM_MAP_PAGE_SIZE?`<div class="exam-map-pager" role="group" aria-label="Phân trang bản đồ câu hỏi"><button type="button" class="button button-ghost button-small" data-action="exam-map-page" data-page="${examNavigatorPage-1}" ${examNavigatorPage===0?'disabled':''} aria-label="Trang câu hỏi trước">← Trước</button><span>Hiển thị ${navigatorStart+1}–${navigatorStart+visibleQuestions.length}/${filtered.length}</span><button type="button" class="button button-ghost button-small" data-action="exam-map-page" data-page="${examNavigatorPage+1}" ${examNavigatorPage===navigatorPages-1?'disabled':''} aria-label="Trang câu hỏi tiếp theo">Tiếp →</button></div>`:'';
  const tabs=[['all','Tất cả',total],['unanswered','Chưa làm',remain],['flagged','Đánh dấu',flaggedCount]];
  return `<div class="exam-live-shell exam-live-v32">
    <div class="exam-live-top exam-live-header"><div class="exam-live-identity"><p class="eyebrow">EXAM SESSION / ${escapeHtml(session.subject||'Hỗn hợp')}</p><h1>${escapeHtml(session.title)}</h1><p><span class="exam-session-live-dot" aria-hidden="true"></span>Đang làm bài · ${session.strictFullscreen?'Toàn màn hình có giám sát':'Chế độ tự luyện'} · Tự lưu cục bộ</p></div><div class="exam-clock-block ${urgency}"><small>THỜI GIAN CÒN LẠI</small><strong class="exam-clock" role="timer" aria-live="off">${formatClock(seconds)}</strong><span>${seconds<=300?'Hãy kiểm tra các câu còn trống':'Giữ nhịp độ của bạn'}</span></div></div>
    <div class="exam-v32-stats"><div><span class="exam-stat-symbol">◷</span><strong>${index+1}<small> / ${total}</small></strong><span>Vị trí hiện tại</span></div><div><span class="exam-stat-symbol">✓</span><strong>${answeredCount}</strong><span>Đã trả lời</span></div><div><span class="exam-stat-symbol">○</span><strong>${remain}</strong><span>Chưa trả lời</span></div><div><span class="exam-stat-symbol">⚑</span><strong>${flaggedCount}</strong><span>Cần xem lại</span></div></div>
    <div class="exam-v32-progress-label"><span>Tiến độ hoàn thành</span><b>${Math.round(answeredCount/total*100)}%</b></div><div class="exam-live-progress" role="progressbar" aria-label="Tiến độ trả lời" aria-valuenow="${answeredCount}" aria-valuemin="0" aria-valuemax="${total}"><span style="width:${answeredCount/total*100}%"></span></div>
    <div class="exam-live-grid"><main class="surface exam-question-panel"><div class="exam-question-meta"><span class="pill">Câu ${index+1}/${total}</span><span class="quiz-type-tag">${escapeHtml(quizQuestionTypeLabel(type))}</span><span class="pill">${escapeHtml(q.subject||'Khác')}</span>${marked?'<span class="pill pill-amber">⚑ Cần xem lại</span>':''}</div><h2>${escapeHtml(q.question)}</h2>${input}<details class="v33-exam-scratch" id="examScratchSection" ${examScratchExpanded?'open':''}><summary><span>✎ Giấy nháp riêng cho câu này</span><small>Không tính điểm · Lưu trên thiết bị</small></summary><label for="examScratchpad">Ghi chú, phép tính hoặc cách suy luận</label><textarea id="examScratchpad" class="text-area" maxlength="1200" rows="4" spellcheck="false" placeholder="Nháp ý chính, công thức, bước giải…">${escapeHtml(session.scratchpad?.[q.id]||'')}</textarea><small class="v33-scratch-status" role="status">${session.scratchpad?.[q.id]?'Đã lưu giấy nháp của câu này.':'Tự lưu khi nhập. Giấy nháp không gửi đi để chấm.'}</small></details><div class="exam-question-controls"><button class="button button-ghost" data-action="exam-prev" ${index===0?'disabled':''}>← Câu trước</button><button class="button ${marked?'button-soft':'button-ghost'}" data-action="exam-mark-review" aria-pressed="${marked}">${marked?'⚑ Bỏ đánh dấu':'⚑ Đánh dấu'}</button><button class="button button-primary" data-action="exam-next" ${index===total-1?'disabled':''}>Câu tiếp →</button></div><div class="exam-shortcut-hint">Phím tắt: ← → chuyển câu · 1–8 chọn đáp án · F đánh dấu · N tìm câu chưa làm</div></main>
    <aside class="surface exam-question-map"><div class="exam-map-heading"><div><span class="eyebrow">QUESTION NAVIGATOR</span><h3>Bản đồ câu hỏi</h3></div><span class="exam-map-count">${answeredCount}/${total}</span></div><p>Chọn số câu để di chuyển, hoặc lọc theo tiến độ.</p><div class="exam-map-tabs" role="group" aria-label="Bộ lọc câu hỏi">${tabs.map(([key,label,num])=>`<button type="button" class="exam-map-tab ${examNavigatorFilter===key?'is-active':''}" aria-pressed="${examNavigatorFilter===key}" data-action="exam-filter" data-value="${key}">${label}<b>${num}</b></button>`).join('')}</div><div class="exam-number-grid">${visibleQuestions.map(({item,i,done,flagged})=>`<button type="button" class="exam-number ${i===index?'is-current':''} ${done?'is-answered':''} ${flagged?'is-flagged':''}" data-action="exam-jump" data-index="${i}" ${i===index?'aria-current="step"':''} aria-label="Câu ${i+1}${done?', đã trả lời':', chưa trả lời'}${flagged?', cần xem lại':''}">${i+1}</button>`).join('')||'<p class="exam-map-empty">Không có câu hỏi nào trong bộ lọc này.</p>'}</div>${navigationPager}<div class="exam-map-legend"><span><i class="is-answered"></i>Đã trả lời</span><span><i class="is-flagged"></i>Đánh dấu</span><span><i class="is-current"></i>Hiện tại</span></div><button type="button" class="button button-soft button-full exam-find-next" data-action="exam-next-unanswered" ${remain?'':'disabled'}>Tìm câu chưa làm →</button><div class="exam-submit-box"><small>${remain?`Còn ${remain} câu chưa trả lời. Bạn vẫn có thể nộp bài.`:'Đã trả lời hết. Hãy kiểm tra lại trước khi nộp.'}</small><button class="button button-primary button-full" data-action="exam-submit">Nộp bài kiểm tra ↗</button><button class="button button-ghost button-full" data-action="exam-cancel">Hủy bài thi</button></div></aside></div><p class="security-status exam-local-warning"><span>ⓘ</span><span>Tiến độ và đáp án chỉ lưu trên trình duyệt này. Đóng tab khi thi có thể kết thúc phiên; hãy hoàn thành trước khi rời phòng thi.</span></p></div>`;
}

function examQuestionFingerprint(q){
  const canonical=x=>String(x||'').normalize('NFC').trim().replace(/\s+/g,' ');
  return JSON.stringify([q.type||'multiple-choice',canonical(q.question),(q.options||[]).map(canonical),q.type==='multiple-select'?[...(q.answers||[])].sort((a,b)=>a-b):q.answer,canonical(q.correctAnswer),(q.acceptedAnswers||[]).map(canonical).sort()]);
}
function examShuffle(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
let examCreationPending=false;
async function createExamSessionFromForm(){
  if(examCreationPending)return;examCreationPending=true;
  const button=$('[data-action="exam-create"]');if(button)button.disabled=true;
  try{return await buildExamSessionFromForm();}finally{examCreationPending=false;if(button?.isConnected)button.disabled=false;}
}
async function buildExamSessionFromForm(){
  if(!state)return;const title=String($('#examTitle')?.value||'').trim().slice(0,100),subject=String($('#examSubjectFilter')?.value||'all'),count=Number($('#examQuestionCount')?.value),minutes=Number($('#examDuration')?.value),strict=!!$('#examStrictFullscreen')?.checked,shuffle=!!$('#examShuffle')?.checked;
  if(!title)return showToast('Hãy đặt tên bài thi trước khi bắt đầu.','error');if(!Number.isInteger(count)||count<1||count>1000)return showToast('Số câu phải từ 1 đến 1.000.','error');if(!Number.isInteger(minutes)||minutes<1||minutes>180)return showToast('Thời gian phải từ 1 đến 180 phút.','error');
  const selectedQuizIds=new Set($$('#pageContent [data-exam-quiz-source]:checked').map(x=>x.value));const bankBatch=$('#examBankBatch')?.value||'all';const selectedBank=nextSelectedBank(bankBatch);const includeBank=!!$('#examIncludeBank')?.checked,flashMode=$('#examFlashMode')?.value||'none',deckId=$('#examFlashDeck')?.value||'all';
  const policyConfig={subject,questionCount:count,durationMinutes:minutes,quizIds:[...selectedQuizIds],includeBank,bankIds:includeBank?selectedBank.map(q=>q.id).sort():[],flashMode,deckId:flashMode==='none'?'all':deckId};
  const integrityPolicyKey=examIntegrityPolicyKey(policyConfig),activeLockouts=getActiveExamLockouts();
  if(activeLockouts.length){showToast(examLockoutMessage(activeLockouts[0]),'warning');return;}
  let candidates=[];
  for(const quiz of [...visibleBuiltinQuizzes(),...(state.customQuizzes||[])])if(selectedQuizIds.has(quiz.id))for(const q of quiz.questions||[]){const item={...q,subject:SUBJECTS.includes(q.subject)?q.subject:quiz.subject||'Khác'};if(examQuestionValid(item))candidates.push(examQuestionCopy(item,{label:`Quiz · ${quiz.title}`,subject:item.subject}));}
  if(includeBank)for(const q of selectedBank)if(examQuestionValid(q))candidates.push(examQuestionCopy(q,{label:`Ngân hàng câu hỏi · ${q.subject||'Khác'}`,subject:q.subject||'Khác'}));
  if(flashMode!=='none')for(const card of state.flashcards||[]){if(deckId!=='all'&&(card.deckId||'legacy-all')!==deckId)continue;if(subject!=='all'&&card.subject!==subject)continue;if(flashMode==='due'&&Number(card.dueAt)>Date.now())continue;candidates.push(examQuestionCopy({question:String(card.front||'').trim(),type:'short-answer',correctAnswer:String(card.back||'').trim(),acceptedAnswers:[],options:[],subject:card.subject||'Khác',explanation:`Nguồn flashcard: ${card.deckName||'Bộ thẻ'} · đối chiếu với mặt sau của thẻ.`},{label:`Flashcard · ${card.deckName||'Bộ thẻ'}`,subject:card.subject||'Khác'}));}
  if(subject!=='all')candidates=candidates.filter(q=>q.subject===subject);
  const seen=new Set();candidates=candidates.filter(q=>{if(!examQuestionValid(q))return false;const key=examQuestionFingerprint(q);if(seen.has(key))return false;seen.add(key);return true;});
  if(count>candidates.length)return showToast(`Không đủ câu hợp lệ: cần ${count}, hiện có ${candidates.length}. Hãy chọn thêm nguồn hoặc giảm số câu.`, 'error');
  if(!candidates.length)return showToast('Chưa có câu hợp lệ từ nguồn đã chọn. Hãy chọn quiz, Ngân hàng câu hỏi hoặc flashcards.', 'error');
  if((state.examSessions||[]).filter(x=>x.status==='IN_PROGRESS').length>=3)return showToast('Đã có 3 phiên thi chưa kết thúc. Hãy tiếp tục hoặc hủy một phiên trước khi tạo phiên mới.','warning');
  if(strict){if(!document.documentElement.requestFullscreen)return showToast('Trình duyệt không hỗ trợ Fullscreen API. Strict Mode chưa bắt đầu bài thi; hãy tắt Strict Mode hoặc dùng trình duyệt tương thích.','error');try{await document.documentElement.requestFullscreen();if(!document.fullscreenElement)throw new Error('Fullscreen chưa được thiết lập.');}catch(error){showToast('Không thể vào toàn màn hình. Chưa tạo phiên thi; hãy cho phép fullscreen rồi thử lại hoặc tắt Strict Mode.','error');return;}}
  const shuffleOptions=!!$('#examShuffleOptions')?.checked;let questions=nextPickQuestions(candidates,count,shuffle);questions=questions.map(q=>({...q,id:makeId('eq'),options:[...(q.options||[])],answers:[...(q.answers||[])],acceptedAnswers:[...(q.acceptedAnswers||[])]}));
  if(shuffleOptions)questions=questions.map(q=>ExamImport.shuffleChoices(q));
  const now=Date.now(),session={id:makeId('exam'),title,subject:subject==='all'?'Hỗn hợp':subject,createdAt:now,startedAt:now,deadlineAt:now+minutes*60*1000,durationMinutes:minutes,strictFullscreen:strict,shuffle,shuffleOptions,integrityPolicyKey,sourceSummary:{quizIds:[...selectedQuizIds].sort(),includeBank,bankIds:policyConfig.bankIds,flashMode,deckId:policyConfig.deckId,subject,questionCount:count},questions,responses:{},markedForReview:[],currentIndex:0,status:'IN_PROGRESS',score:null,endedAt:null};
  const before=snapshotStudyState();state.examSessions.push(session);const live=state.examSessions.filter(x=>x.status==='IN_PROGRESS');const closed=state.examSessions.filter(x=>x.status!=='IN_PROGRESS');state.examSessions=[...closed.slice(-Math.max(0,100-live.length)),...live];if(!saveMutationOrRollback(before)){if(strict&&document.fullscreenElement)document.exitFullscreen().catch(error=>console.debug('Fullscreen request was rejected by the browser.',error));return;}activeExamId=session.id;selectedExamResultId=null;examNavigatorFilter='all';examNavigatorPage=0;examResultFilter='all';examFullscreenEstablished=strict&&!!document.fullscreenElement;syncExamStrictLayout();startExamTimer();renderPage('exam',{recordHistory:false});showToast('Phiên thi đã được tạo và lưu. Chúc bạn bình tĩnh làm bài.','success');
}
async function resumeExamSession(id){const session=state.examSessions.find(x=>x.id===id);if(!session||session.status!=='IN_PROGRESS')return showToast('Phiên này không còn ở trạng thái có thể tiếp tục.','error');const activeLock=getActiveExamLockouts()[0];if(activeLock)return showToast(examLockoutMessage(activeLock),'warning');if(session.deadlineAt<=Date.now())return finishExamSession(id,'TIMED_OUT','DEADLINE');if(session.strictFullscreen){if(!document.documentElement.requestFullscreen)return showToast('Trình duyệt không hỗ trợ Chế độ thi toàn màn hình; không thể tiếp tục phiên thi theo chính sách này.','error');try{await document.documentElement.requestFullscreen();if(!document.fullscreenElement)throw new Error('Fullscreen chưa bắt đầu.');}catch{showToast('Không thể tiếp tục vì trình duyệt không cho phép fullscreen. Phiên vẫn được giữ lại; bạn có thể quay lại sau hoặc hủy.','error');return;}}activeExamId=session.id;examNavigatorPage=Math.floor(Math.max(0,Number(session.currentIndex)||0)/EXAM_MAP_PAGE_SIZE);examFullscreenEstablished=!!session.strictFullscreen&&!!document.fullscreenElement;syncExamStrictLayout();startExamTimer();renderPage('exam');}
function startExamTimer(){if(examTimer)clearInterval(examTimer);examTimer=setInterval(()=>{const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS'){clearInterval(examTimer);examTimer=null;return;}const left=Math.max(0,Math.ceil((session.deadlineAt-Date.now())/1000));const node=$('.exam-clock');if(node)node.textContent=formatClock(left);
    const clockBox=$('.exam-live-v32 .exam-clock-block');if(clockBox){clockBox.classList.toggle('is-warning',left<=300&&left>60);clockBox.classList.toggle('is-critical',left<=60);const label=clockBox.querySelector('span');if(label)label.textContent=left<=300?'Hãy kiểm tra các câu còn trống':'Giữ nhịp độ của bạn';}
    if(left<=0)finishExamSession(session.id,'TIMED_OUT','DEADLINE',{render:activePage==='exam'});},250);}
function saveExamSessionMutation(session,mutate){if(!session||session.status!=='IN_PROGRESS')return false;if(Number(session.deadlineAt)<=Date.now()){finishExamSession(session.id,'TIMED_OUT','DEADLINE');return false;}const before=snapshotStudyState();try{mutate();}catch(error){if(before){try{state=JSON.parse(before);}catch(rollbackError){console.error('Không thể khôi phục phiên thi:',rollbackError);}}showToast(error.message||'Không thể cập nhật câu trả lời.', 'error');return false;}if(!saveMutationOrRollback(before))return false;return true;}
function autoSaveExamScratchpad(){
  const input=$('#examScratchpad'),session=getActiveExamSession();
  if(!input||!session||session.status!=='IN_PROGRESS')return;
  const q=session.questions[session.currentIndex];if(!q)return;
  const text=input.value.slice(0,1200);
  const previous=String(session.scratchpad?.[q.id]||'');
  if(text===previous)return;
  const saved=saveExamSessionMutation(session,()=>{
    if(!session.scratchpad||typeof session.scratchpad!=='object'||Array.isArray(session.scratchpad))session.scratchpad={};
    if(text)session.scratchpad[q.id]=text;else delete session.scratchpad[q.id];
  });
  const status=$('.v33-scratch-status');
  if(status)status.textContent=saved?(text?'Đã lưu giấy nháp của câu này.':'Giấy nháp đã được xóa.'):'Chưa thể lưu. Hãy sao chép giấy nháp trước khi rời trang.';
}
document.addEventListener('input',event=>{if(event.target.id==='examScratchpad')autoSaveExamScratchpad();});
document.addEventListener('toggle',event=>{if(event.target.id==='examScratchSection')examScratchExpanded=event.target.open;},true);
function requestExamSubmission(){
  const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS')return;
  const answered=session.questions.filter(q=>Object.prototype.hasOwnProperty.call(session.responses||{},q.id)).length;
  const missing=session.questions.length-answered;
  const flagged=(session.markedForReview||[]).length;
  requestConfirmation({eyebrow:'EXAM MODE · KIỂM TRA TRƯỚC KHI NỘP',title:'Xác nhận nộp bài?',message:`Đã làm ${answered}/${session.questions.length} câu. Còn ${missing} câu chưa trả lời và ${flagged} câu được đánh dấu cần xem lại.`,detail:'Các câu bỏ trống được tính là chưa đúng. Giấy nháp không được chấm. Sau khi nộp, bạn không thể sửa bài thi này.',confirmLabel:'Xác nhận nộp bài',cancelLabel:'Tiếp tục kiểm tra',danger:false},()=>finishExamSession(session.id,'COMPLETED'));
}
function setExamOptionAnswer(qid,index){const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS')return;const q=session.questions.find(x=>x.id===qid);if(!q||!Number.isInteger(index)||index<0||index>=q.options.length)return;if(!saveExamSessionMutation(session,()=>{session.responses[qid]=index;}))return;renderPage('exam',{recordHistory:false});}
function toggleExamMultiAnswer(qid,index){const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS')return;const q=session.questions.find(x=>x.id===qid);if(!q||!Number.isInteger(index)||index<0||index>=q.options.length)return;if(!saveExamSessionMutation(session,()=>{const selected=Array.isArray(session.responses[qid])?[...session.responses[qid]]:[];const next=selected.includes(index)?selected.filter(v=>v!==index):[...selected,index];if(next.length)session.responses[qid]=next;else delete session.responses[qid];}))return;renderPage('exam',{recordHistory:false});}
function saveExamTextAnswer(qid){const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS')return;const q=session.questions.find(x=>x.id===qid);if(!q||!['short-answer','fill-blank'].includes(q.type||'multiple-choice'))return;const value=String($('#examTextAnswer')?.value||'').trim().slice(0,1000);if(!value)return showToast('Hãy nhập câu trả lời trước khi lưu.','error');if(!saveExamSessionMutation(session,()=>{session.responses[qid]=value;}))return;renderPage('exam',{recordHistory:false});showToast('Câu trả lời đã được lưu vào phiên thi.','success');}
function examNavigateMapTo(index,session){
  if(examNavigatorFilter==='all'){
    examNavigatorPage=Math.floor(index/EXAM_MAP_PAGE_SIZE);
    return;
  }
  const items=session.questions.map((q,i)=>({q,i})).filter(({q})=>examNavigatorFilter==='flagged'?(session.markedForReview||[]).includes(q.id):!Object.hasOwn(session.responses||{},q.id));
  const position=items.findIndex(({i})=>i===index);
  if(position>=0)examNavigatorPage=Math.floor(position/EXAM_MAP_PAGE_SIZE);
}
function moveExamQuestion(offset){const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS')return;const next=clamp(Number(session.currentIndex||0)+offset,0,session.questions.length-1);if(next===session.currentIndex)return;if(!saveExamSessionMutation(session,()=>{session.currentIndex=next;}))return;examNavigateMapTo(next,session);renderPage('exam',{recordHistory:false});}
function jumpExamQuestion(index){const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS')return;if(!Number.isInteger(index)||index<0||index>=session.questions.length)return;if(!saveExamSessionMutation(session,()=>{session.currentIndex=index;}))return;examNavigateMapTo(index,session);renderPage('exam',{recordHistory:false});}
function toggleExamMarkForReview(){const session=getActiveExamSession();if(!session||session.status!=='IN_PROGRESS')return;const q=session.questions[session.currentIndex];if(!q)return;if(!saveExamSessionMutation(session,()=>{const set=new Set(session.markedForReview||[]);if(set.has(q.id))set.delete(q.id);else set.add(q.id);session.markedForReview=[...set];}))return;renderPage('exam',{recordHistory:false});}
function evaluateExamSession(session){let earned=0,max=0,correct=0,blank=0;const details=[];for(const q of session.questions){const response=session.responses?.[q.id],answered=Object.prototype.hasOwnProperty.call(session.responses||{},q.id)&&(Array.isArray(response)?response.length>0:typeof response==='string'?response.trim().length>0:Number.isInteger(response)),points=clamp(Number(q.points)||1,1,10);max+=points;if(!answered)blank++;const isCorrect=answered&&isQuizQuestionCorrect(q,response);if(isCorrect){earned+=points;correct++;}const correctAnswer=(q.type==='short-answer'||q.type==='fill-blank')?q.correctAnswer:q.type==='multiple-select'?(q.answers||[]).map(i=>q.options?.[i]).filter(Boolean).join(' + '):(q.options||[])[q.answer]||'';details.push({id:q.id,reviewKey:q.reviewKey||examQuestionFingerprint(q),question:q.question,type:q.type||'multiple-choice',subject:q.subject||'Khác',response:answered?(Array.isArray(response)?response.map(i=>q.options?.[i]).join(' + '):typeof response==='number'?q.options?.[response]||String(response):String(response)):'',correctAnswer:String(correctAnswer||''),correct:!!isCorrect,answered,points,explanation:String(q.explanation||''),sourceLabel:String(q.sourceLabel||'')});}return {earned,max,correct,blank,total:session.questions.length,percent:max?Math.round(earned/max*100):0,details};}
function handleExamIntegrityViolation(session,reason){
  if(!state||!session||session.status!=='IN_PROGRESS'||!session.strictFullscreen||activePage!=='exam')return false;
  const now=Date.now(),key=examIntegrityPolicyKeyForSession(session),alreadyHandled=(state.examIntegrityEvents||[]).some(event=>event.sessionId===session.id);
  if(alreadyHandled)return false;
  let record=getExamIntegrityRecord(key);if(!record){record={key,violations:0,lastViolationAt:0,lockUntil:0,originalDeadlineAt:0,lastReason:'',lockKind:'duration',updatedAt:now};state.examIntegrityRecords.push(record);}
  const penalty=examIntegrityPenaltyFor((Number(record.violations)||0)+1,now,session.deadlineAt),{violationNumber,lockUntil,originalDeadlineAt,lockKind,durationMs}=penalty;
  record.violations=violationNumber;record.lastViolationAt=now;record.lastViolationSessionId=session.id;record.lockUntil=lockUntil;record.originalDeadlineAt=originalDeadlineAt;record.lastReason=reason;record.lockKind=lockKind;record.examLabel=String(session.title||'Bài thi').slice(0,100);record.updatedAt=now;
  state.examIntegrityEvents.push({id:makeId('integrity-event'),key,sessionId:session.id,reason:['FULLSCREEN_EXIT','TAB_HIDDEN'].includes(reason)?reason:'OTHER',violationNumber,occurredAt:now,lockUntil,originalDeadlineAt});state.examIntegrityEvents=state.examIntegrityEvents.slice(-500);state.examIntegrityRecords=state.examIntegrityRecords.slice(-200);
  // The violation record deliberately stores metadata only; clear the canceled attempt's content.
  session.status='CANCELED';session.endedAt=now;session.endReason='INTEGRITY_VIOLATION';session.responses={};session.scratchpad={};session.markedForReview=[];session.questions=[];session.score=null;session.currentIndex=0;session.integrityViolationNumber=violationNumber;session.integrityPolicyKey=key;
  if(examTimer){clearInterval(examTimer);examTimer=null;}activeExamId=null;examFullscreenEstablished=false;
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(error=>console.debug('Fullscreen request was rejected by the browser.',error));
  syncExamStrictLayout();const persisted=saveState();renderPage('exam',{recordHistory:false});
  showExamIntegrityDialog(record,reason,persisted);
  if(!persisted)console.warn('Exam lockout state could not be persisted; the user has been warned in the dialog.');
  return true;
}
function startExamExitPenalty(session){if(document.fullscreenElement)return;handleExamIntegrityViolation(session,'FULLSCREEN_EXIT');}

function finishExamSession(id,status,reason='',options={}){const session=state?.examSessions?.find(x=>x.id===id);if(!session)return false;if(session.status!=='IN_PROGRESS')return false;if(!['COMPLETED','TIMED_OUT','CANCELED','INTERRUPTED','PENDING_REVIEW'].includes(status))return false;if(status==='COMPLETED'&&Number(session.deadlineAt)<=Date.now()){status='TIMED_OUT';reason='DEADLINE';}const before=snapshotStudyState();session.status=status;session.endedAt=Date.now();session.endReason=String(reason||'').slice(0,80);if(status==='COMPLETED'||status==='TIMED_OUT')session.score=evaluateExamSession(session);if(status==='COMPLETED'){const result=session.score;state.attempts.unshift({id:makeId('attempt'),title:session.title,subject:session.subject,score:result.correct,total:result.total,createdAt:session.endedAt,source:'exam',responses:result.details.map(q=>({question:q.question,type:q.type,subject:q.subject,response:q.response,correct:q.correct,correctAnswer:q.correctAnswer,explanation:q.explanation}))});state.attempts=state.attempts.slice(0,1000);state.xp+=Math.round(result.correct*3+10);logStudyActivity();}if(!saveMutationOrRollback(before)){if(examTimer){clearInterval(examTimer);examTimer=null;}return false;}if(examTimer){clearInterval(examTimer);examTimer=null;}if(activeExamId===id)activeExamId=null;selectedExamResultId=['COMPLETED','TIMED_OUT'].includes(status)?id:null;const wasStrict=session.strictFullscreen;examFullscreenEstablished=false;if(wasStrict&&document.fullscreenElement)document.exitFullscreen().catch(error=>console.debug('Fullscreen request was rejected by the browser.',error));syncExamStrictLayout();if(options.render!==false)renderPage('exam',{recordHistory:false});if(status==='COMPLETED')showToast('Đã nộp bài và lưu kết quả phiên thi.','success');else if(status==='TIMED_OUT')showToast('Hết giờ. Kết quả đã lưu nhưng không cộng XP hoàn thành.','warning');else if(status==='CANCELED')showToast('Bài thi đã bị hủy theo yêu cầu; không cộng XP hoặc ghi nhận hoàn thành.','warning');return true;}
function renderExamResultCard(session){
  const result=session.score;
  if(!result)return `<section class="surface exam-result-card"><span class="exam-status">${escapeHtml(session.status)}</span><h2>${escapeHtml(session.title)}</h2><p>Phiên này không có điểm hợp lệ.</p></section>`;
  const wrongCount=(result.details||[]).filter(d=>d.answered&&!d.correct).length;
  const details=(result.details||[]).map((d,i)=>({...d,position:i+1})).filter(d=>examResultFilter==='all'||(examResultFilter==='wrong'&&!d.correct)||(examResultFilter==='correct'&&d.correct));
  const feedback=result.percent>=85?'Kiến thức đang rất vững. Tiếp tục luyện đề với phạm vi rộng hơn.':result.percent>=60?'Bạn đã có nền tảng. Ưu tiên ôn lại các câu sai và câu bỏ trống.':'Hãy củng cố từng chuyên đề nhỏ rồi thử lại một đề ngắn hơn.';
  return `<section class="surface exam-result-card exam-result-v32"><div class="exam-result-head"><div><p class="eyebrow">EXAM RESULT / ${session.status==='TIMED_OUT'?'HẾT GIỜ':'HOÀN THÀNH'}</p><h2>${escapeHtml(session.title)}</h2><p>Kết quả được tính từ bản đề cố định đã lưu khi bắt đầu thi.</p></div><span class="exam-result-outcome">${session.status==='TIMED_OUT'?'◷ Hết thời gian':'✓ Đã nộp bài'}</span></div><div class="exam-score-hero"><div class="exam-score-ring" style="--score-percent:${Math.max(0,Math.min(100,Number(result.percent)||0))}%"><div><strong>${result.percent}%</strong><small>Mức độ chính xác</small></div></div><div class="exam-score-description"><span class="eyebrow">GỢI Ý SAU BÀI THI</span><h3>${result.percent>=85?'Tiếp tục phát huy':result.percent>=60?'Tập trung củng cố':'Ôn nền tảng trước'}</h3><p>${feedback}</p><small>${session.status==='TIMED_OUT'?'Bài hết giờ: không cộng XP hoàn thành.':'Kết quả đã được ghi vào lịch sử học tập trên thiết bị này.'}</small></div></div><div class="exam-result-stats"><span><b>${result.correct}/${result.total}</b><small>Câu đúng</small></span><span><b>${wrongCount}</b><small>Câu sai</small></span><span><b>${result.blank}</b><small>Bỏ trống</small></span><span><b>${result.earned}/${result.max}</b><small>Điểm</small></span></div><div class="exam-result-review-header"><div><span class="eyebrow">ANSWER REVIEW</span><h3>Phân tích từng câu</h3><p>Đối chiếu đáp án, lời giải và học lại những câu chưa đúng.</p></div><div class="exam-result-filter" role="group" aria-label="Lọc kết quả">${[['all','Tất cả'],['wrong','Cần ôn lại'],['correct','Đã đúng']].map(([key,label])=>`<button type="button" class="${examResultFilter===key?'active':''}" data-action="exam-result-filter" data-value="${key}" aria-pressed="${examResultFilter===key}">${label}</button>`).join('')}</div></div><div class="exam-review-details">${details.map(d=>`<article class="exam-review-row ${d.correct?'is-correct':d.answered?'is-wrong':'is-blank'}"><div class="exam-review-title"><b>${d.position}. ${escapeHtml(d.question)}</b><span>${d.correct?'✓ Đúng':d.answered?'× Chưa đúng':'○ Bỏ trống'} · ${d.points} điểm</span></div><small><strong>Câu trả lời:</strong> ${escapeHtml(d.response||'—')}</small><small><strong>Đáp án tham chiếu:</strong> ${escapeHtml(d.correctAnswer||'Chưa có đáp án hiển thị')}</small>${d.explanation?`<p>${escapeHtml(d.explanation)}</p>`:''}</article>`).join('')||'<p class="exam-map-empty">Không có câu nào trong nhóm này.</p>'}</div><div class="form-actions"><button class="button button-primary" data-action="exam-new-blueprint">Tạo đề khác ↗</button><button class="button button-soft" data-action="navigate" data-page="review">Ôn tập câu sai</button></div></section>`;
}

function renderSmartReview(){
  const due=(state.flashcards||[]).filter(c=>!Number(c.dueAt)||Number(c.dueAt)<=Date.now());const attempts=(state.attempts||[]).slice(0,50);const misses=new Map();for(const attempt of attempts)for(const r of attempt.responses||[]){if(r.correct||!r.question)continue;const key=normalizeQuizAnswer(r.question)+'|'+(r.subject||'Khác');if(!misses.has(key))misses.set(key,{...r,missCount:0,latestAt:attempt.createdAt||0,attempts:0});const item=misses.get(key);item.missCount++;item.attempts++;item.latestAt=Math.max(item.latestAt,attempt.createdAt||0);}
  const weak=[...misses.values()].sort((a,b)=>b.missCount-a.missCount||b.latestAt-a.latestAt).slice(0,12);const subjectStats=new Map();for(const attempt of attempts)for(const r of attempt.responses||[]){const key=r.subject||attempt.subject||'Khác';const item=subjectStats.get(key)||{subject:key,total:0,correct:0};item.total++;if(r.correct)item.correct++;subjectStats.set(key,item);}const stats=[...subjectStats.values()].sort((a,b)=>(a.total>=3?0:1)-(b.total>=3?0:1)||(a.correct/Math.max(1,a.total))-(b.correct/Math.max(1,b.total)));
  const canStart=due.length+weak.length>0;
  return `<div class="page-heading"><div><p class="eyebrow">SMART REVIEW / DATA-BASED NEXT STEP</p><h1>Ôn tập <span class="gradient-text">thông minh</span></h1><p>Đề xuất dựa trên thẻ đã đến hạn và những câu đã lưu kết quả sai. Đây là quy tắc xác định từ dữ liệu cục bộ, không phải dự đoán AI.</p></div><div class="page-heading-actions"><button class="button button-primary" data-action="review-start" ${canStart?'':'disabled'}>Bắt đầu phiên ôn ↗</button></div></div>
  <div class="review-metric-grid"><article class="surface review-metric"><small>THẺ ĐẾN HẠN</small><strong>${due.length}</strong><p>Thẻ chưa có lịch hoặc đã tới lịch ôn.</p></article><article class="surface review-metric"><small>CÂU SAI CÓ LỊCH SỬ</small><strong>${weak.length}</strong><p>Câu sai được ghi từ các lượt đã lưu đáp án chi tiết.</p></article><article class="surface review-metric"><small>LƯỢT CÓ DỮ LIỆU CHI TIẾT</small><strong>${attempts.filter(a=>Array.isArray(a.responses)).length}</strong><p>Lượt cũ không có đáp án chi tiết sẽ không bị suy đoán.</p></article></div>
  <div class="review-content-grid"><section class="surface review-section"><div class="section-heading"><div><h2>Ôn lại câu từng sai</h2><p>Sắp xếp theo số lần sai đã ghi nhận, không xem đây là chẩn đoán chắc chắn về năng lực.</p></div></div>${weak.length?`<div class="review-weak-list">${weak.map((item,i)=>`<article class="review-weak-row"><span class="review-rank">${i+1}</span><div><b>${escapeHtml(item.question)}</b><small>${escapeHtml(item.subject||'Khác')} · ghi nhận sai ${item.missCount} lần</small><p>Đáp án đã lưu: ${escapeHtml(item.correctAnswer||'Không có đáp án mẫu lưu')}</p></div></article>`).join('')}</div>`:'<div class="empty-state"><h3>Chưa có câu sai được lưu chi tiết</h3><p>Các lượt quiz làm từ phiên bản này trở đi sẽ ghi các câu trả lời đã chấm để phục vụ ôn tập.</p></div>'}</section>
  <section class="surface review-section"><div class="section-heading"><div><h2>Bản đồ môn học</h2><p>Chỉ hiện chủ đề có ít nhất 1 câu trả lời chi tiết. Mẫu dưới 3 câu được đánh dấu còn ít dữ liệu.</p></div></div>${stats.length?`<div class="review-subject-list">${stats.map(x=>`<article class="review-subject-row"><div><b>${escapeHtml(x.subject)}</b><small>${x.total} câu đã ghi nhận ${x.total<3?'· Dữ liệu còn ít':''}</small></div><strong>${Math.round(x.correct/Math.max(1,x.total)*100)}%</strong><div class="review-subject-bar"><span style="width:${Math.round(x.correct/Math.max(1,x.total)*100)}%"></span></div></article>`).join('')}</div>`:'<div class="empty-state"><h3>Chưa đủ dữ liệu</h3><p>Hoàn thành quiz hoặc Exam Mode để xây dựng thống kê từ kết quả thật.</p></div>'}</section></div>
  <section class="surface review-due-list"><div class="section-heading"><div><h2>Thẻ cần ôn</h2><p>${Math.min(12,due.length)} thẻ đầu tiên sẽ được đưa vào phiên ôn kết hợp.</p></div><button class="button button-soft button-small" data-action="review-open-flashcards">Mở thư viện flashcard</button></div>${due.length?`<div class="review-flash-grid">${due.slice(0,12).map(c=>`<article class="review-flash-item"><small>${escapeHtml(c.subject||'Khác')} · ${escapeHtml(c.deckName||'Bộ cũ')}</small><b>${escapeHtml(c.front)}</b><p>${escapeHtml(c.back.slice(0,200))}${c.back.length>200?'…':''}</p></article>`).join('')}</div>`:'<div class="empty-state"><h3>Không có thẻ đến hạn</h3><p>Thẻ ôn trong tương lai sẽ xuất hiện khi đến lịch.</p></div>'}</section>`;
}
function startSmartReview(){
  const due=(state.flashcards||[]).filter(c=>!Number(c.dueAt)||Number(c.dueAt)<=Date.now()).slice(0,8).map(c=>({question:String(c.front||''),type:'short-answer',correctAnswer:String(c.back||''),acceptedAnswers:[],options:[],answer:0,subject:c.subject||'Khác',explanation:`Flashcard · ${c.deckName||'Bộ thẻ'} — tự đối chiếu với mặt sau.`}));
  const misses=[];for(const attempt of (state.attempts||[]).slice(0,50))for(const r of attempt.responses||[]){if(!r.correct&&r.question)misses.push({...r,options:[],answers:[],acceptedAnswers:[],subject:r.subject||attempt.subject||'Khác',explanation:r.explanation||`Câu đã trả lời sai trong “${attempt.title||'Quiz'}”.`});}
  const distinct=new Map();for(const q of misses){const key=normalizeQuizAnswer(q.question)+'|'+(q.subject||'Khác');if(!distinct.has(key))distinct.set(key,q);}const mistakeQuestions=[...distinct.values()].slice(0,7).map(q=>({...q,type:q.type||'short-answer',correctAnswer:q.correctAnswerValue||q.correctAnswer||'',options:Array.isArray(q.options)?q.options:[],answers:Array.isArray(q.answers)?q.answers:[],acceptedAnswers:Array.isArray(q.acceptedAnswers)?q.acceptedAnswers:[]})).filter(examQuestionValid);
  const questions=[...due,...mistakeQuestions].filter(examQuestionValid).slice(0,15);if(!questions.length)return showToast('Chưa có thẻ đến hạn hoặc câu sai có đáp án hợp lệ để ôn.','warning');activeQuiz={id:'smart-review',title:'Smart Review · Ôn theo dữ liệu',subject:'Hỗn hợp',questions:questions.map(q=>({...q,options:[...(q.options||[])],answers:[...(q.answers||[])],acceptedAnswers:[...(q.acceptedAnswers||[])]})),origin:'sprint'};quizResponses=[];quizIndex=0;quizScore=0;quizSelected=null;quizTextAnswer='';quizLocked=false;renderQuizPlayer();
}
function saveExamBankQuestion(form){const fd=new FormData(form),question=String(fd.get('question')||'').trim(),type=String(fd.get('questionType')||'short-answer'),subject=SUBJECTS.includes(String(fd.get('subject')||''))?String(fd.get('subject')):'Khác',explanation=String(fd.get('explanation')||'').trim().slice(0,2000);if(!question)return showToast('Hãy nhập nội dung câu hỏi.','error');if(state.examQuestionBank.length>=5000)return showToast('Ngân hàng câu hỏi đã đạt giới hạn 5.000 câu. Hãy xuất bản sao lưu trước khi dọn dữ liệu.','error');
  const item={id:makeId('qb'),question:question.slice(0,3000),type,subject,explanation,points:1,createdAt:Date.now(),options:[],answers:[],acceptedAnswers:[]};
  if(type==='short-answer'||type==='fill-blank'){const answer=String(fd.get('expectedAnswer')||'').trim();if(!answer)return showToast('Hãy nhập đáp án chuẩn.','error');if(type==='fill-blank'&&!/_{3,}|\[\s*\]|…/.test(question))return showToast('Câu điền từ phải có dấu ____ hoặc … tại vị trí cần điền.','error');item.correctAnswer=answer.slice(0,300);item.acceptedAnswers=[...new Set(String(fd.get('acceptedAnswers')||'').split('|').map(x=>x.trim()).filter(Boolean).map(x=>x.slice(0,300)))];}
  else if(type==='true-false'){item.options=['Đúng','Sai'];item.answer=Number(fd.get('correct')||0);if(![0,1].includes(item.answer))return showToast('Đáp án đúng/sai không hợp lệ.','error');}
  else {item.options=[0,1,2,3].map(i=>String(fd.get(`option${i}`)||'').trim().slice(0,1000));if(item.options.some(x=>!x)||new Set(item.options.map(normalizeQuizAnswer)).size!==4)return showToast('Hãy điền 4 phương án khác nhau.','error');if(type==='multiple-select'){item.answers=[...new Set(fd.getAll('correctMulti').map(Number).filter(x=>Number.isInteger(x)&&x>=0&&x<4))];if(!item.answers.length)return showToast('Hãy đánh dấu ít nhất một đáp án đúng.','error');}else {item.answer=Number(fd.get('correct'));if(!Number.isInteger(item.answer)||item.answer<0||item.answer>3)return showToast('Chọn đáp án đúng.','error');}}
  if(!examQuestionValid(item))return showToast('Dữ liệu câu hỏi chưa đủ hoặc không hợp lệ.','error');const before=snapshotStudyState();state.examQuestionBank.push(item);if(!saveMutationOrRollback(before))return;renderPage('exam',{recordHistory:false});showToast('Đã lưu câu hỏi vào ngân hàng.','success');}
function renderQuizLab() {
  const attempts=Array.isArray(state.attempts)?state.attempts:[],custom=Array.isArray(state.customQuizzes)?state.customQuizzes:[];
  const visibleBuiltins=BUILTIN_QUIZZES.filter(q=>!(state.hiddenBuiltinQuizzes||[]).includes(q.id));
  const quizzes=[...visibleBuiltins,...custom];
  const card=q=>{const builtin=BUILTIN_QUIZZES.some(item=>item.id===q.id),selected=selectedQuizIds.has(q.id),types=[...new Set((q.questions||[]).map(question=>question.type||'multiple-choice'))];return `<article class="surface quiz-card ${builtin?'quiz-card-sample':''}"><label class="bulk-pick quiz-card-pick" title="Chọn bộ quiz"><input type="checkbox" data-action="quiz-select-item" data-id="${escapeHtml(q.id)}" ${selected?'checked':''} aria-label="Chọn bộ quiz ${escapeHtml(q.title)}"><span></span></label><div class="quiz-card-top"><span class="pill pill-cyan">${escapeHtml(q.subject||'Khác')}</span><span class="text-dim" style="font-size:.72rem">✳ ${(q.questions||[]).length} câu</span></div><h3>${escapeHtml(q.title||'Bộ quiz đã lưu')}</h3><p>${escapeHtml(q.description||'Bộ câu hỏi để tự ôn tập.')}</p><div class="quiz-type-tags">${types.map(type=>`<span>${escapeHtml(quizQuestionTypeLabel(type))}</span>`).join('')}</div><div class="quiz-card-footer"><small>${builtin?'Bộ câu hỏi mẫu':'Bộ đã lưu trước đây'}</small><div class="quiz-card-actions"><button class="button button-primary button-small" data-action="start-quiz" data-id="${escapeHtml(q.id)}">Làm quiz ↗</button><button class="button button-ghost button-small quiz-delete-button" data-action="delete-quiz" data-id="${escapeHtml(q.id)}" aria-label="Xóa quiz ${escapeHtml(q.title)}" title="Xóa khỏi thư viện">×</button></div></div></article>`;};
  const selectedCount=quizzes.filter(q=>selectedQuizIds.has(q.id)).length;
  return `<div class="page-heading"><div><p class="eyebrow">QUIZ LAB / RECALL & PLAY</p><h1>Quiz Lab <span class="heading-orbit">✳</span></h1><p>Làm quiz mẫu, tiếp tục sử dụng các bộ đã lưu trước đây và theo dõi lịch sử luyện tập.</p></div><div class="page-heading-actions"><button class="button button-soft" data-action="start-sprint">⚡ Brain Sprint</button></div></div>
  <section class="surface quiz-hero"><div class="quiz-hero-symbol">✳</div><div class="quiz-hero-copy"><h2>Học chủ động — nhớ lâu hơn.</h2><p>Luyện nhớ chủ động với bộ câu hỏi của bạn. Tạo đề từ tài liệu trong Exam Mode và ôn lại câu sai trong Ôn thông minh.</p></div><span class="pill pill-pink">${attempts.length} lượt đã làm</span></section>
  <div class="section-heading quiz-library-heading"><div><h2>Thư viện bộ quiz</h2><p>${quizzes.length} bộ đang hiển thị${custom.length?' · bao gồm bộ đã lưu trước đây':''}.</p></div><label class="quiz-subject-filter"><span>Lọc theo môn</span><select class="select-field" id="quizSubjectFilter"><option value="all">Tất cả môn học</option>${[...new Set(quizzes.map(q=>q.subject||'Khác'))].sort((a,b)=>a.localeCompare(b,'vi')).map(subject=>`<option value="${escapeHtml(subject)}">${escapeHtml(subject)}</option>`).join('')}</select></label></div>
  <div class="bulk-action-bar"><div><b>${selectedCount} bộ được chọn</b><small>Bộ mẫu sẽ chỉ bị ẩn trong tài khoản; bộ cũ của bạn được chuyển vào Lịch sử xóa.</small></div><button class="button button-danger button-small" data-action="bulk-delete-quizzes" ${selectedCount?'':'disabled'}>Xóa nhóm đã chọn</button><button class="button button-ghost button-small" data-action="clear-quiz-selection">Bỏ chọn</button></div>
  ${quizzes.length?`<section class="quiz-list" id="quizLibraryList">${quizzes.map(card).join('')}</section>`:`<section class="surface empty-state quiz-library-empty"><div class="empty-icon">✳</div><h3>Thư viện quiz đang trống</h3><p>Bạn vẫn có thể sử dụng Brain Sprint hoặc tạo bài thi từ Exam Mode và Ngân hàng câu hỏi.</p><button class="button button-primary button-small" data-action="navigate" data-page="exam">Mở Exam Mode</button></section>`}
  <section class="surface quiz-history-panel"><div class="section-heading"><div><h2>Lịch sử luyện tập</h2><p>Kết quả dựa trên những lượt làm bài đã lưu trên thiết bị này.</p></div><span class="pill">${attempts.length} lượt</span></div>${attempts.length?`<div class="quiz-history-list">${attempts.slice(0,12).map(a=>`<article class="quiz-history-row"><div class="history-copy"><b>${escapeHtml(a.title||'Lượt luyện tập')}</b><small>${escapeHtml(a.subject||'Khác')} · ${a.createdAt?new Date(a.createdAt).toLocaleString('vi-VN'):'Không rõ thời điểm'}</small></div><strong class="history-score" aria-label="Điểm ${Number(a.score)||0} trên ${Number(a.total)||0}">${Number(a.score)||0}<span> / ${Number(a.total)||0}</span></strong></article>`).join('')}</div>`:'<div class="empty-state" style="padding:18px"><h3>Chưa có lịch sử</h3><p>Kết quả sẽ xuất hiện sau khi bạn hoàn thành một lượt luyện tập.</p></div>'}</section>`;
}

function flashcardDeckGroups(){
  const groups=new Map();
  for(const d of state?.flashDecks||[])groups.set(d.id,{...d,count:0,due:0});
  for(const card of state?.flashcards||[]){
    const id=String(card.deckId||`deck-default-${String(card.subject||'Khác').toLocaleLowerCase('vi').replace(/[^\p{L}\p{N}]+/gu,'-')}`);
    if(!groups.has(id))groups.set(id,{id,name:String(card.deckName||`${card.subject||'Khác'} · Bộ mặc định`),subject:SUBJECTS.includes(card.subject)?card.subject:'Khác',count:0,due:0});
    const group=groups.get(id);group.count++;if(!card.dueAt||Number(card.dueAt)<=Date.now())group.due++;
  }
  return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name,'vi'));
}
function defaultStudySubject(){const configured=String(state?.settings?.defaultSubject||'Khác');return SUBJECTS.includes(configured)?configured:'Khác';}
function subjectSelectOptions(selected='Khác', includeAll=false){
  const head=includeAll?'<option value="all">Tất cả môn học</option>':'';
  return head+SUBJECTS.map(subject=>`<option value="${escapeHtml(subject)}" ${subject===selected?'selected':''}>${escapeHtml(subject)}</option>`).join('');
}
function flashcardDeck() {
  return [...(state?.flashcards||[])].filter(card=>currentFlashcardDeckId==='all'||String(card.deckId||`deck-default-${String(card.subject||'Khác').toLocaleLowerCase('vi').replace(/[^\p{L}\p{N}]+/gu,'-')}`)===currentFlashcardDeckId).sort((a,b)=>{
    const ad=!a.dueAt||a.dueAt<=Date.now(),bd=!b.dueAt||b.dueAt<=Date.now();
    if(ad!==bd)return ad?-1:1;
    return (Number(a.dueAt)||0)-(Number(b.dueAt)||0)||(Number(a.createdAt)||0)-(Number(b.createdAt)||0);
  });
}
function dueFlashcards() { return (state?.flashcards||[]).filter(c=>!c.dueAt||Number(c.dueAt)<=Date.now()); }
function reviewDelayLabel(ms) {
  if(ms<=0)return 'ngay';if(ms<60*1000)return 'dưới 1 phút';if(ms<60*60*1000)return `${Math.ceil(ms/60000)} phút`;
  if(ms< SRS_DAY_MS)return `${Math.ceil(ms/3600000)} giờ`;const days=Math.ceil(ms/SRS_DAY_MS);return days===1?'1 ngày':`${days} ngày`;
}
function srsSchedule(card,grade,now=Date.now()) {
  let repetitions=Math.max(0,Number(card.repetitions)||0),easeFactor=clamp(Number(card.easeFactor)||2.5,1.3,3.5),intervalDays=Math.max(0,Number(card.intervalDays)||0),lapses=Math.max(0,Number(card.lapses)||0),dueAt=now;
  if(grade==='again') { repetitions=0;intervalDays=0;easeFactor=Math.max(1.3,easeFactor-0.2);lapses++;dueAt=now+10*60*1000; }
  else if(grade==='hard') { easeFactor=Math.max(1.3,easeFactor-0.14);intervalDays=repetitions===0?1:repetitions===1?2:Math.max(intervalDays+1,Math.ceil(intervalDays*easeFactor*1.2));repetitions++;dueAt=now+intervalDays*SRS_DAY_MS; }
  else if(grade==='good') { easeFactor=Math.max(1.3,easeFactor);intervalDays=repetitions===0?1:repetitions===1?6:Math.max(1,Math.ceil(intervalDays*easeFactor));repetitions++;dueAt=now+intervalDays*SRS_DAY_MS; }
  else if(grade==='easy') { easeFactor=Math.min(3.5,easeFactor+0.1);intervalDays=repetitions===0?4:repetitions===1?10:Math.max(2,Math.ceil(intervalDays*easeFactor*1.3));repetitions++;dueAt=now+intervalDays*SRS_DAY_MS; }
  else throw new Error('Mức tự đánh giá không hợp lệ.');
  return {repetitions,easeFactor,intervalDays,lapses,dueAt};
}
function renderFlashStudyModal(){
  const overlay=$('#flashStudyOverlay');
  if(!overlay||!flashStudyOpen||activePage!=='flashcards')return;
  const cards=flashcardDeck();
  if(!cards.length){closeFlashStudyModal(false);showToast('Bộ flashcard này hiện chưa có thẻ để học.','info');return;}
  if(flashIndex<0||flashIndex>=cards.length)flashIndex=0;
  const card=cards[flashIndex];
  const groups=flashcardDeckGroups();
  const group=groups.find(item=>item.id===currentFlashcardDeckId);
  const title=currentFlashcardDeckId==='all'?'Tất cả bộ flashcard':(group?.name||card.deckName||'Bộ flashcard');
  const dueCount=cards.filter(item=>!item.dueAt||Number(item.dueAt)<=Date.now()).length;
  const status=!card.dueAt||Number(card.dueAt)<=Date.now()
    ?'<span class="srs-state due">● Đến hạn ôn</span>'
    :`<span class="srs-state scheduled">◷ Ôn lại sau ${escapeHtml(reviewDelayLabel(Number(card.dueAt)-Date.now()))}</span>`;
  const gradeButton=(grade,label,icon)=>{
    let preview=null;try{preview=srsSchedule(card,grade);}catch(scheduleError){console.debug('Could not preview spaced-repetition schedule for this card.',scheduleError);}
    return `<button type="button" class="srs-grade-button srs-${grade}" data-action="flash-grade" data-grade="${grade}" ${!flashRevealed?'disabled':''}><span aria-hidden="true">${icon}</span><b>${label}</b><small>${preview?escapeHtml(reviewDelayLabel(preview.dueAt-Date.now())):'Lật thẻ trước'}</small></button>`;
  };
  overlay.innerHTML=`<section class="flash-study-modal" role="dialog" aria-modal="true" aria-labelledby="flashStudyModalTitle" aria-describedby="flashStudyModalHint" tabindex="-1">
    <header class="flash-study-modal-header"><div class="flash-study-modal-brand"><span class="flash-study-modal-icon" aria-hidden="true">▤</span><div><p class="eyebrow">FOCUS / ACTIVE RECALL</p><h2 id="flashStudyModalTitle">${escapeHtml(title)}</h2><p class="flash-study-modal-subtitle">${escapeHtml(card.subject||'Khác')} · ${cards.length} thẻ trong lượt học</p></div></div><button type="button" id="flashStudyModalClose" class="icon-button flash-study-modal-close" data-action="close-flash-study" aria-label="Đóng cửa sổ học flashcard" title="Đóng (Esc)">×</button></header>
    <div class="flash-study-modal-progress"><div><span>THẺ ${flashIndex+1} / ${cards.length}</span><span>${dueCount} thẻ đến hạn</span></div><div class="flash-study-progress-track" aria-label="Tiến độ lượt học"><span style="width:${((flashIndex+1)/cards.length)*100}%"></span></div></div>
    <div class="flash-study-modal-body">${status}<button type="button" class="flash-study-modal-card flash-card-display ${flashRevealed?'is-revealed':''}" data-action="flip-card" aria-label="${flashRevealed?'Đã hiện mặt sau. Bấm để xem mặt trước':'Bấm để lật thẻ và xem mặt sau'}"><span class="flash-label">${flashRevealed?'MẶT SAU':'MẶT TRƯỚC'}</span><strong class="flash-text">${escapeHtml(flashRevealed?card.back:card.front)}</strong><span class="flash-hint">${flashRevealed?'Tự đánh giá trung thực theo mức độ bạn nhớ.':'Hãy thử tự trả lời trước khi lật thẻ.'}</span></button>
    <div class="flash-controls flash-study-modal-controls"><button type="button" class="button button-ghost" data-action="flash-prev" ${cards.length<2?'disabled':''}>← Trước</button><button type="button" class="button button-soft" data-action="flip-card">${flashRevealed?'Xem mặt trước':'Lật thẻ ↻'}</button><button type="button" class="button button-ghost" data-action="flash-next" ${cards.length<2?'disabled':''}>Tiếp →</button></div>
    <div class="flash-study-modal-grade"><p class="eyebrow">BẠN NHỚ ĐẾN ĐÂU?</p><div class="srs-grade-grid">${gradeButton('again','Lại','↻')}${gradeButton('hard','Khó','◔')}${gradeButton('good','Tốt','✓')}${gradeButton('easy','Dễ','✦')}</div><p class="srs-algorithm-hint" id="flashStudyModalHint">Mức tự đánh giá sẽ cập nhật lịch ôn của chính thẻ này sau khi lưu thành công.</p></div></div>
    <footer class="flash-study-modal-footer"><span>✦ ${Number(state.flashReviews)||0} lượt tự đánh giá đã lưu</span><span>Esc để đóng cửa sổ</span><button type="button" class="button button-ghost button-small" data-action="close-flash-study">Thoát lượt học</button></footer>
  </section>`;
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');
}
function openFlashStudyModal(returnFocus=null){
  if(activePage!=='flashcards'){showToast('Hãy mở trang Flashcards trước khi bắt đầu học.','info');return;}
  const cards=flashcardDeck();
  if(!cards.length){showToast('Bộ flashcard này chưa có thẻ. Hãy tạo hoặc nhập thẻ trước.','info');return;}
  if(flashIndex<0||flashIndex>=cards.length)flashIndex=0;
  flashStudyReturnFocus=returnFocus?.isConnected?returnFocus:(document.querySelector('#openFlashStudyButton')||null);
  flashStudyOpen=true;
  document.body.classList.add('flash-study-open');
  renderFlashStudyModal();
  $('#flashStudyModalClose')?.focus({preventScroll:true});
}
function closeFlashStudyModal(restoreFocus=true){
  const overlay=$('#flashStudyOverlay');
  flashStudyOpen=false;
  if(overlay){overlay.classList.add('hidden');overlay.setAttribute('aria-hidden','true');overlay.replaceChildren();}
  document.body.classList.remove('flash-study-open');
  const target=flashStudyReturnFocus;flashStudyReturnFocus=null;
  if(restoreFocus&&target?.isConnected)target.focus({preventScroll:true});
}
function flashDeckCollapseKeyFor(deckId){if(deckId==='all')return 'all';const id=String(deckId);return id.length<=180?id:`long-${id.slice(0,130)}-${notificationHash(id)}`;}
function flashDeckCollapseKey(){return flashDeckCollapseKeyFor(currentFlashcardDeckId);}
function isFlashDeckListCollapsed(){return state?.settings?.flashDeckListCollapsed?.[flashDeckCollapseKey()]===true;}
function toggleFlashDeckList(){
  const before=snapshotStudyState(),key=flashDeckCollapseKey(),next={...(state.settings.flashDeckListCollapsed||{})};
  next[key]=!isFlashDeckListCollapsed();state.settings.flashDeckListCollapsed=next;
  if(!saveMutationOrRollback(before))return;
  renderPage('flashcards',{recordHistory:false});
}

function saveFlashDeckForm(form){
  const fd=new FormData(form),name=String(fd.get('deckName')||'').trim(),subject=String(fd.get('subject')||'');
  if(!name||name.length>80||!SUBJECTS.includes(subject))return showToast('Hãy nhập tên bộ (1–80 ký tự) và chọn môn học hợp lệ.','error');
  if(flashcardDeckGroups().length>=500)return showToast('Thư viện đã đạt giới hạn 500 bộ thẻ.','error');
  if(flashcardDeckGroups().some(x=>x.subject===subject&&x.name.toLowerCase()===name.toLowerCase()))return showToast('Đã có bộ cùng tên trong môn này.','error');
  const before=snapshotStudyState(),id=makeId('deck');state.flashDecks.push({id,name,subject,createdAt:Date.now()});
  if(!saveMutationOrRollback(before))return;
  currentFlashcardDeckId=id;flashCreateDeckOpen=false;flashCardEditorOpen=true;flashEditingId=null;flashIndex=0;
  renderPage('flashcards',{recordHistory:false});showToast('Đã tạo bộ thẻ. Bạn có thể thêm thẻ đầu tiên.','success');
}
function saveFlashcardForm(form){
  const fd=new FormData(form),front=String(fd.get('front')||'').trim(),back=String(fd.get('back')||'').trim(),id=String(fd.get('deckId')||'');
  const deck=flashcardDeckGroups().find(x=>x.id===id);
  if(!deck||!front||!back||front.length>2000||back.length>5000)return showToast('Chọn bộ hợp lệ và nhập đủ hai mặt thẻ, không vượt giới hạn ký tự.','error');
  const before=snapshotStudyState();
  if(flashEditingId){const card=state.flashcards.find(c=>c.id===flashEditingId);if(!card)return showToast('Không tìm thấy thẻ đang sửa.','error');Object.assign(card,{front,back,deckId:id,deckName:deck.name,subject:deck.subject,updatedAt:Date.now()});}
  else {if(state.flashcards.length>=10000)return showToast('Thư viện đã đạt giới hạn 10.000 thẻ.','error');state.flashcards.push({id:makeId('fc'),front,back,deckId:id,deckName:deck.name,subject:deck.subject,createdAt:Date.now(),repetitions:0,easeFactor:2.5,intervalDays:0,dueAt:0,lapses:0,lastReviewedAt:0,reviewHistory:[]});}
  if(!saveMutationOrRollback(before))return;
  flashEditingId=null;flashCardEditorOpen=true;currentFlashcardDeckId=id;flashIndex=0;
  renderPage('flashcards',{recordHistory:false});showToast('Đã lưu flashcard thành công.','success');
}
function deleteFlashDeck(id){
  const group=flashcardDeckGroups().find(x=>x.id===id);if(!group)return;
  requestConfirmation({eyebrow:'FLASHCARDS / BỘ THẺ',title:'Xóa bộ thẻ này?',message:`Bộ “${group.name}” chứa ${group.count} thẻ. Các thẻ sẽ chuyển vào Lịch sử xóa.`,detail:'Có thể khôi phục từng thẻ đã xóa. Thông tin riêng của bộ trống không có lịch sử khôi phục — hãy sao lưu JSON nếu cần.',confirmLabel:'Xóa bộ thẻ',cancelLabel:'Giữ lại',danger:true},()=>{
    const ids=new Set(state.flashcards.filter(c=>String(c.deckId||`deck-default-${String(c.subject||'Khác').toLocaleLowerCase('vi').replace(/[^\p{L}\p{N}]+/gu,'-')}`)===id).map(c=>c.id));
    if(state.deletedItems.length+ids.size>500)return showToast('Lịch sử xóa không đủ chỗ cho cả bộ. Hãy xuất bản sao lưu, dọn lịch sử rồi thử lại.','error');
    const before=snapshotStudyState(),old=state.flashcards.filter(c=>ids.has(c.id));
    state.flashcards=state.flashcards.filter(c=>!ids.has(c.id));state.flashDecks=state.flashDecks.filter(d=>d.id!==id);
    state.deletedItems.push(...old.map(c=>({id:makeId('deleted'),itemId:c.id,type:'flashcard',title:String(c.front||'Thẻ ghi nhớ').slice(0,160),summary:String(c.back||'').slice(0,180),deletedAt:Date.now(),sourceCollection:'flashcards',data:JSON.parse(JSON.stringify(c))})));
    if(!saveMutationOrRollback(before))return;
    currentFlashcardDeckId='all';flashEditingId=null;flashCreateDeckOpen=false;flashCardEditorOpen=false;selectedFlashIds.clear();renderPage('flashcards',{recordHistory:false});showToast(`Đã xóa bộ. ${old.length} thẻ được đưa vào Lịch sử xóa.`,'success');
  });
}
function flashEditorMarkup(groups){
  const edit=state.flashcards.find(c=>c.id===flashEditingId)||null,active=edit?.deckId||currentFlashcardDeckId;
  const deckSelect=groups.map(g=>`<option value="${escapeHtml(g.id)}" ${active===g.id?'selected':''}>${escapeHtml(g.name)}</option>`).join('');
  const createDeck=`<section class="surface v36-editor-section"><div class="section-heading"><div><p class="eyebrow">TẠO BỘ THẺ</p><h2>Bộ thẻ mới</h2><p>Chia kiến thức theo môn học hoặc chuyên đề.</p></div></div><form id="flashDeckCreateForm" class="v36-flash-form"><div class="form-field"><label for="flashDeckNewName">Tên bộ thẻ *</label><input class="field" id="flashDeckNewName" name="deckName" required maxlength="80" placeholder="Ví dụ: Hóa 9 · Dạng bài nâng cao"></div><div class="form-field"><label for="flashDeckNewSubject">Môn học *</label><select class="select-field" id="flashDeckNewSubject" name="subject">${subjectSelectOptions(defaultStudySubject())}</select></div><button class="button button-primary" type="submit">＋ Lưu bộ thẻ</button></form></section>`;
  const createCard=`<section class="surface v36-editor-section"><div class="section-heading"><div><p class="eyebrow">GHI NHỚ CHỦ ĐỘNG</p><h2>${edit?'Sửa flashcard':'Thêm flashcard'}</h2><p>Một câu hỏi rõ ràng và một câu trả lời ngắn gọn.</p></div></div><form id="flashCardCreateForm" class="v36-flash-form"><div class="form-field"><label for="flashCardDeckId">Bộ thẻ *</label><select class="select-field" id="flashCardDeckId" name="deckId" required>${deckSelect||'<option value="">Hãy tạo bộ thẻ trước</option>'}</select></div><div class="form-field"><label for="flashCardFront">Mặt trước · Câu hỏi *</label><textarea class="text-area" id="flashCardFront" name="front" required maxlength="2000" rows="2" placeholder="Bạn muốn tự kiểm tra điều gì?">${escapeHtml(edit?.front||'')}</textarea></div><div class="form-field"><label for="flashCardBack">Mặt sau · Đáp án *</label><textarea class="text-area" id="flashCardBack" name="back" required maxlength="5000" rows="3" placeholder="Ghi đáp án, công thức hoặc lời giải ngắn…">${escapeHtml(edit?.back||'')}</textarea></div><div class="form-actions"><button class="button button-primary" type="submit" ${groups.length?'':'disabled'}>${edit?'Lưu chỉnh sửa':'＋ Lưu thẻ mới'}</button>${edit?'<button class="button button-ghost" type="button" data-action="flash-cancel-edit">Hủy sửa</button>':''}</div></form></section>`;
  return `<div class="v36-flash-editors" id="flashEditorArea">${flashCreateDeckOpen?createDeck:''}${flashCardEditorOpen?createCard:''}</div>`;
}
function renderFlashcards() {
  const allCards=state.flashcards||[],groups=flashcardDeckGroups();
  if(currentFlashcardDeckId!=='all'&&!groups.some(group=>group.id===currentFlashcardDeckId))currentFlashcardDeckId='all';
  const cards=flashcardDeck();if(flashIndex>=cards.length)flashIndex=Math.max(0,cards.length-1);
  const dueCount=cards.filter(c=>!c.dueAt||Number(c.dueAt)<=Date.now()).length,scheduled=cards.length-dueCount;
  const reviewsToday=allCards.reduce((n,c)=>n+(c.reviewHistory||[]).filter(r=>r.at&&localDateKey(new Date(r.at))===todayKey()).length,0);
  const challenge=state.dailyChallenge?.date===todayKey()?state.dailyChallenge:null;
  const challengePanel=challenge&&['offered','active','completed'].includes(challenge.status)?`<section class="surface flash-challenge-panel"><div><p class="eyebrow">DAILY FLASH CHALLENGE</p><b>${challenge.status==='completed'?'✓ Thử thách đã hoàn thành':challenge.status==='active'?'⚡ Đang thực hiện thử thách':'⚡ Thử thách hôm nay'}</b><p>${challenge.status==='active'?`Đã ôn ${Math.min(challenge.target,Math.max(0,(state.flashReviews||0)-challenge.initialReviews))}/${challenge.target} thẻ · còn ${Math.max(0,Math.ceil((challenge.startedAt+600000-Date.now())/60000))} phút.`:challenge.status==='completed'?'Bạn đã nhận +40 XP. Hãy giữ nhịp học theo cách phù hợp với bạn.':'Ôn 5 flashcard trong 10 phút để nhận +40 XP.'}</p></div>${challenge.status==='offered'?'<button class="button button-primary button-small" data-action="start-flash-challenge">Bắt đầu</button>':''}${challenge.status==='active'?'<button class="button button-ghost button-small" data-action="skip-flash-challenge">Dừng thử thách</button>':''}</section>`:'';
  const deckSelect=`<label class="flash-deck-filter"><span>Bộ đang xem</span><select class="select-field" id="flashDeckFilter"><option value="all">Tất cả bộ (${allCards.length})</option>${groups.map(group=>`<option value="${escapeHtml(group.id)}" ${currentFlashcardDeckId===group.id?'selected':''}>${escapeHtml(group.name)} · ${group.count} thẻ</option>`).join('')}</select></label>`;
  const selectedCount=cards.filter(c=>selectedFlashIds.has(c.id)).length,deckListCollapsed=isFlashDeckListCollapsed();
  const bulkBar=`<div class="bulk-action-bar"><div><b>${selectedCount} thẻ được chọn</b><small>Chọn nhiều thẻ để chuyển cùng lúc vào Lịch sử xóa.</small></div><button class="button button-danger button-small" data-action="bulk-delete-flashcards" ${selectedCount?'':'disabled'}>Xóa nhóm đã chọn</button><button class="button button-ghost button-small" data-action="clear-flashcard-selection">Bỏ chọn</button></div>`;
  return `<div class="page-heading"><div><p class="eyebrow">ACTIVE RECALL / SPACED REPETITION</p><h1>Flashcards <span class="heading-orbit">✦</span></h1><p>Quản lý bộ thẻ, tự tạo flashcard và ôn tập ngắt quãng theo lịch.</p></div><div class="page-heading-actions"><button class="button button-soft" data-action="flash-new-card" aria-expanded="${flashCardEditorOpen}">＋ ${flashCardEditorOpen?"Đóng trình tạo thẻ":"Thêm thẻ"}</button><button class="button button-primary" data-action="flash-new-deck" aria-expanded="${flashCreateDeckOpen}">＋ Tạo bộ thẻ</button></div></div>
  <section class="srs-overview"><div class="srs-overview-main"><span class="srs-overview-orb">↻</span><div><span class="eyebrow">ÔN TẬP THÔNG MINH</span><h2>${dueCount?`${dueCount} thẻ đang đến hạn`:'Bạn đã ôn xong các thẻ đến hạn ✨'}</h2><p>${currentFlashcardDeckId==='all'?'Tổng hợp tất cả các bộ thẻ.':'Số liệu chỉ tính bộ thẻ đang chọn.'} Ôn các thẻ đến hạn trước; mỗi bộ giữ lịch ôn riêng.</p></div></div><div class="srs-mini-stats"><div><strong>${dueCount}</strong><small>Đến hạn</small></div><div><strong>${scheduled}</strong><small>Đã lên lịch</small></div><div><strong>${reviewsToday}</strong><small>Lượt hôm nay</small></div></div></section>
  ${challengePanel}
  ${flashEditorMarkup(groups)}
  <section class="surface flash-deck-manager v36-library"><div class="section-heading"><div><p class="eyebrow">DECK LIBRARY</p><h2>Thư viện bộ thẻ</h2><p>Chọn một bộ để xem thẻ; dùng nút × trên bộ để xóa sau khi xác nhận.</p></div>${deckSelect}</div><div class="flash-deck-grid">${groups.length?groups.map(group=>`<div class="v36-deck-item"><button type="button" class="flash-deck-tile ${currentFlashcardDeckId===group.id?'is-active':''}" data-action="choose-flash-deck" data-id="${escapeHtml(group.id)}"><span class="flash-deck-glyph">▤</span><b>${escapeHtml(group.name)}</b><small>${escapeHtml(group.subject)} · ${group.count} thẻ</small><span class="flash-deck-due">${group.due} đến hạn</span></button><button type="button" class="v36-deck-delete" data-action="flash-delete-deck" data-id="${escapeHtml(group.id)}" aria-label="Xóa bộ ${escapeHtml(group.name)}" title="Xóa bộ">×</button></div>`).join(''):'<div class="empty-state"><h3>Chưa có thẻ được lưu</h3><p>Hãy bấm “Tạo bộ thẻ” để tạo bộ đầu tiên của riêng bạn.</p></div>'}</div></section>
  <div class="flash-layout"><section class="surface flash-study-launcher"><div class="flash-study-launcher-visual" aria-hidden="true"><span>▤</span><i>✦</i><b>↻</b></div><p class="eyebrow">YOUR PRIVATE STUDY SESSION</p><h2>${escapeHtml(currentFlashcardDeckId==='all'?'Tất cả bộ flashcard':(groups.find(g=>g.id===currentFlashcardDeckId)?.name||'Bộ flashcard'))}</h2><p class="flash-study-launcher-copy">Lật thẻ, chuyển thẻ và tự đánh giá mức độ nhớ trong cửa sổ học tập riêng.</p><div class="flash-study-launcher-metrics"><div><strong>${cards.length}</strong><small>Thẻ trong bộ</small></div><div><strong>${dueCount}</strong><small>Đến hạn ôn</small></div><div><strong>${scheduled}</strong><small>Đã lên lịch</small></div></div><button type="button" class="button button-primary flash-study-launcher-button" id="openFlashStudyButton" data-action="open-flash-study" ${cards.length?'':'disabled'}>Mở cửa sổ học flashcard <span aria-hidden="true">↗</span></button><div class="flash-study-launcher-note"><span aria-hidden="true">✧</span><span>Tiến độ, lịch ôn và đánh giá chỉ được cập nhật khi thao tác lưu thành công.</span></div><div class="flash-review-footer"><span>✦ ${state.flashReviews} lượt tự đánh giá đã lưu</span><span>Chuỗi học hiện tại: ${currentStreak()} ngày</span></div></section>
  <section class="surface surface-pad flash-deck-card-list"><div class="section-heading flash-deck-list-heading" style="margin:0 0 12px"><div><h2>Thẻ trong bộ đang xem</h2><p>Có thể thêm, sửa và xóa từng thẻ. Bật chế độ xóa để hiện thao tác xóa thẻ hoặc chọn nhiều.</p></div><div class="flash-deck-list-heading-actions"><span class="pill">${cards.length} thẻ</span><button type="button" class="icon-button flash-deck-collapse-toggle ${deckListCollapsed?'is-collapsed':''}" data-action="toggle-flash-deck-list" aria-expanded="${!deckListCollapsed}" aria-controls="flashDeckListContent" aria-label="${deckListCollapsed?'Hiện danh sách thẻ':'Ẩn danh sách thẻ'}" title="${deckListCollapsed?'Hiện danh sách thẻ':'Ẩn danh sách thẻ'}"><span aria-hidden="true">⌄</span></button></div></div><div id="flashDeckListContent" class="flash-deck-list-content" ${deckListCollapsed?'hidden':''}>${bulkBar}${cards.length?`<div class="flash-list">${cards.map((c,i)=>{const due=!c.dueAt||c.dueAt<=Date.now(),checked=selectedFlashIds.has(c.id);return `<div class="flash-list-row ${due?'flash-list-row-due':''}"><label class="bulk-pick" title="Chọn ${escapeHtml(c.front)}"><input type="checkbox" data-action="flash-select-item" data-id="${escapeHtml(c.id)}" ${checked?'checked':''} aria-label="Chọn flashcard ${escapeHtml(c.front)}"><span></span></label><span class="flash-list-letter">${String(i+1).padStart(2,'0')}</span><button data-action="select-flash" data-index="${i}" style="flex:1;min-width:0;text-align:left;border:0;background:transparent;color:var(--text);padding:0"><strong>${escapeHtml(c.front)}</strong><small>${escapeHtml(c.deckName||c.subject||'Khác')} · ${due?'Đến hạn':`Ôn lại ${escapeHtml(new Date(c.dueAt).toLocaleDateString('vi-VN'))}`}</small></button><button type="button" class="button button-ghost button-small v36-flash-edit" data-action="flash-edit-card" data-id="${escapeHtml(c.id)}">Sửa</button><button class="icon-button" data-action="delete-flash" data-id="${escapeHtml(c.id)}" aria-label="Xóa ${escapeHtml(c.front)}">×</button></div>`;}).join('')}</div>`:'<div class="empty-state"><h3>Chưa có thẻ trong bộ này</h3><p>Không có thẻ cũ trong phạm vi bộ đang chọn.</p></div>'}</div></section></div>`;
}

function renderStats() {
  const minutes=totalStudyMinutes(),sessions=state.sessions.length,completed=state.sessions.filter(s=>s.completed).length,accuracy=quizAccuracy(),p=xpProgress(),week=weeklyValues(),weekMins=week.reduce((n,d)=>n+d.minutes,0);const subjects={};state.sessions.forEach(s=>{const key=s.subject||'Tự học';subjects[key]=(subjects[key]||0)+(Number(s.minutes)||0);});const topSubjects=Object.entries(subjects).sort((a,b)=>b[1]-a[1]).slice(0,7);const colors=['var(--cyan)','var(--purple)','var(--amber)','var(--pink)','var(--green)','var(--blue)'];
  const allMilestones=[{min:0,title:'Bắt đầu hành trình',description:'Tạo tài khoản và bước vào StudyOS.',icon:'🌱'},{min:60,title:'Giờ đầu tiên',description:'Tích lũy tổng cộng 60 phút học tập.',icon:'◷',kind:'minutes'},{min:150,title:'Tập sự kiên trì',description:'Đạt mốc 150 XP.',icon:'🌿',kind:'xp'},{min:400,title:'Nhà khám phá',description:'Đạt mốc 400 XP.',icon:'🧭',kind:'xp'},{min:10,title:'Người luyện tập',description:'Hoàn thành 10 lượt quiz.',icon:'✳',kind:'attempts'},{min:800,title:'Chuyên gia',description:'Đạt mốc 800 XP.',icon:'⚡',kind:'xp'}];
  return `<div class="page-heading"><div><p class="eyebrow">PROGRESS INSIGHTS</p><h1>Tiến trình của bạn</h1><p>Dữ liệu phản ánh những phiên học và lượt ôn tập bạn đã ghi nhận trên thiết bị này.</p></div><div class="page-heading-actions"><button class="button button-ghost" data-action="export-data">⇩ Xuất dữ liệu</button></div></div>
  <section class="surface stats-hero"><div><h2>Tiến bộ được đo bằng sự đều đặn.</h2><p>Không cần so sánh với người khác — hãy nhìn lại chính hành trình của mình.</p></div><div class="stats-big-number">${Math.floor(state.xp)} <span style="font-size:.8rem;color:var(--muted);letter-spacing:0">XP</span></div></section>
  ${studyCalendarMarkup()}
  <section class="grid grid-4" style="margin-top:15px"><div class="surface stat-card"><div class="stat-head">Tổng thời gian <span class="stat-icon">◷</span></div><div class="stat-value">${Math.round(minutes/60*10)/10}<span style="font-size:.75rem;color:var(--muted)"> giờ</span></div><div class="stat-foot">${fmtMinutes(minutes)} đã ghi nhận</div></div><div class="surface stat-card"><div class="stat-head">Phiên học <span class="stat-icon">✧</span></div><div class="stat-value">${sessions}</div><div class="stat-foot">${completed} phiên hoàn thành đủ giờ</div></div><div class="surface stat-card"><div class="stat-head">Quiz đã làm <span class="stat-icon">✳</span></div><div class="stat-value">${state.attempts.length}</div><div class="stat-foot">Độ chính xác tổng: ${accuracy}%</div></div><div class="surface stat-card"><div class="stat-head">Chuỗi hiện tại <span class="stat-icon">♨</span></div><div class="stat-value">${currentStreak()}<span style="font-size:.75rem;color:var(--muted)"> ngày</span></div><div class="stat-foot">Ngày liên tiếp có Focus, Quiz hoặc ôn thẻ</div></div></section>
  <div class="grid grid-2" style="align-items:start;margin-top:15px"><section class="surface surface-pad"><div class="section-heading" style="margin:0"><div><h2>Thời gian học mỗi ngày</h2><p>7 ngày gần nhất · ${weekMins} phút</p></div><span class="pill pill-cyan">${weekMins?Math.round(weekMins/7):0} phút/ngày</span></div>${weeklyBarsMarkup(true)}</section>${levelCardMarkup()}</div>
  <div class="grid grid-2" style="align-items:start;margin-top:15px"><section class="surface surface-pad"><div class="section-heading" style="margin:0 0 9px"><div><h2>Thời gian theo môn</h2><p>Phân bổ dựa trên chủ đề từng phiên học.</p></div></div>${topSubjects.length?topSubjects.map(([name,m],i)=>`<div class="subject-row"><span class="subject-dot" style="--subject-color:${colors[i%colors.length]}"></span><span>${escapeHtml(name)}</span><span class="subject-minutes">${m} phút</span></div><div class="subject-bar"><span style="--subject-color:${colors[i%colors.length]};width:${minutes?m/minutes*100:0}%"></span></div>`).join(''):`<div class="empty-state"><h3>Chưa có dữ liệu theo môn</h3><p>Khi bạn dùng Focus Room, hãy ghi rõ môn học để xem phân bổ ở đây.</p></div>`}</section><section class="surface surface-pad"><div class="section-heading" style="margin:0 0 12px"><div><h2>Cột mốc hành trình</h2><p>Mỗi cột mốc là một dấu hiệu bạn đã tiếp tục.</p></div></div><div class="milestone-list">${allMilestones.map(m=>{const val=m.kind==='minutes'?minutes:m.kind==='xp'?state.xp:m.kind==='attempts'?state.attempts.length:1;const done=val>=m.min;return `<div class="milestone-row ${done?'unlocked':'locked'}"><span class="milestone-badge">${done?'✓':m.icon}</span><span><strong>${escapeHtml(m.title)}</strong><small>${escapeHtml(m.description)}</small></span></div>`}).join('')}</div></section></div>
  <section class="data-notice" style="margin-top:15px"><b>Lưu ý về thống kê:</b> dữ liệu phản ánh những gì bạn ghi nhận trong website, không phải phép đo tuyệt đối về khả năng học tập. Phiên dừng sớm được ghi nhận theo số phút đã thực sự học; thời gian tab nền có thể phụ thuộc giới hạn của trình duyệt.</section>`;
}
function renderPlay() {
  return `<div class="page-heading"><div><p class="eyebrow">RECHARGE / PLAY / LEARN</p><h1>Góc giải trí</h1><p>Thư giãn lành mạnh và chơi những thử thách ngắn để làm mới đầu óc giữa các phiên học.</p></div></div>
  <section class="surface game-feature"><div class="game-feature-copy"><span class="pill pill-pink">✦ GAME CỦA BẠN</span><h2>Echo Collapse</h2><p>Khám phá khu rừng huyền bí, tìm đường đi qua những thử thách và tận hưởng thế giới game do bạn giới thiệu. Liên kết mở trang itch.io chính thức trong tab mới.</p><div class="tag-list"><span class="pill">🌌 Phiêu lưu</span><span class="pill">🎮 itch.io</span><span class="pill">⚡ Giải trí</span></div><div class="game-feature-actions"><a class="button button-primary" href="https://blackdragon-xd.itch.io/echo-collapse" target="_blank" rel="noopener noreferrer">▶ Chơi Echo Collapse ↗</a><button class="button button-ghost" data-action="copy-game-link">Sao chép đường dẫn</button></div></div><div class="game-art" aria-label="Minh họa vũ trụ do CSS tạo"><span class="game-sparks game-spark-a">✧</span><span class="game-sparks game-spark-b">✦</span><span class="game-sparks game-spark-c">✴</span><div class="game-moon"></div></div></section>
  <div class="section-heading"><div><h2>Trò chơi học tập ngắn</h2><p>Những vòng chơi ngắn để luyện phản xạ và củng cố kiến thức.</p></div></div><section class="grid grid-3"><article class="surface play-card"><span class="play-card-icon">⚡</span><h3>Brain Sprint</h3><p>Trả lời nhanh 10 câu hỏi ngẫu nhiên từ bộ quiz mẫu và bộ quiz đã lưu trước đây của bạn. Điểm số sẽ được ghi vào tiến trình.</p><button class="button button-primary button-small" data-action="start-sprint">Bắt đầu thử thách ↗</button></article><article class="surface play-card"><span class="play-card-icon">▤</span><h3>Memory Flip</h3><p>Lật flashcard, tự nhớ trước khi xem đáp án và đánh dấu thẻ đã thuộc hoặc cần ôn tiếp.</p><button class="button button-soft button-small" data-action="navigate" data-page="flashcards">Mở thẻ ghi nhớ ↗</button></article><article class="surface play-card"><span class="play-card-icon">🧭</span><h3>Resource Hunt</h3><p>Thử thách nhỏ của riêng bạn: tìm một nguồn học thật tốt, lưu vào kho tri thức và ghi lý do hữu ích của nó.</p><button class="button button-ghost button-small" data-action="navigate" data-page="vault">Khám phá kho ↗</button></article></section>
  <section class="surface surface-pad" style="margin-top:16px"><div class="section-heading" style="margin:0 0 12px"><div><h2>Góc thư giãn nhanh</h2><p>Gợi ý hoạt động rời màn hình trong vài phút.</p></div></div><div class="grid grid-3"><div class="recommendation"><span class="recommend-icon">🌿</span><div><b style="font-size:.74rem">Thư giãn 3 phút</b><p>Đứng lên, duỗi người nhẹ nhàng và nhìn ra xa khỏi màn hình.</p></div></div><div class="recommendation"><span class="recommend-icon">🎵</span><div><b style="font-size:.74rem">Một bản nhạc</b><p>Nghe một bài nhạc bạn thích trong giờ nghỉ, không cần đa nhiệm.</p></div></div><div class="recommendation"><span class="recommend-icon">💧</span><div><b style="font-size:.74rem">Nạp lại năng lượng</b><p>Uống nước và chuẩn bị bàn học cho phiên tiếp theo.</p></div></div></div></section>`;
}
function renderProfile() {
  const tier=getTier(),previewImage=pendingAvatarDataUrl||state.profile.avatarImage||null,previewProfile={...state.profile,avatarImage:previewImage};
  return `<div class="page-heading"><div><p class="eyebrow">YOUR IDENTITY</p><h1>Hồ sơ cá nhân</h1><p>Tùy chỉnh tên và ảnh đại diện để không gian học tập mang dấu ấn của bạn.</p></div><div class="page-heading-actions"><button class="button button-ghost" data-action="navigate" data-page="settings">⚙ Cài đặt</button></div></div>
  <section class="surface profile-hero"><div class="profile-avatar-large">${avatarMarkup(previewProfile,'profile-avatar-image')}</div><div><h2>${escapeHtml(state.profile.displayName)}</h2><p>@${escapeHtml(currentUsername)} · ${escapeHtml(tier.name)} · LV ${tier.level}</p><div class="tag-list"><span class="pill pill-cyan">${Math.floor(state.xp)} XP</span><span class="pill">✦ ${state.sessions.length} phiên học</span><span class="pill">✳ ${state.attempts.length} lượt quiz</span></div></div></section>
  <div class="grid grid-2 profile-layout" style="align-items:start"><section class="surface surface-pad"><div class="section-heading" style="margin:0 0 15px"><div><h2>Chỉnh sửa hồ sơ</h2><p>Chọn tên hiển thị, biểu tượng đại diện hoặc tải ảnh riêng lên.</p></div></div><form id="profileForm"><div class="form-field"><label for="profileDisplayName">Tên hiển thị</label><input class="field" id="profileDisplayName" name="displayName" value="${escapeHtml(state.profile.displayName)}" maxlength="32" required></div><div class="form-field profile-avatar-upload" style="margin-top:16px"><label>Ảnh đại diện</label><input type="file" id="profileAvatarInput" accept="image/jpeg,image/png,image/webp" hidden><div class="avatar-upload-row"><div class="avatar-upload-preview">${avatarMarkup(previewProfile,'profile-avatar-image')}</div><div class="avatar-upload-actions"><button type="button" class="button button-soft button-small" data-action="choose-avatar-image">${pendingAvatarDataUrl?'Chọn ảnh khác':'Tải ảnh lên'}</button><small>JPEG, PNG hoặc WebP · tối đa 5 MB. Ảnh được thu nhỏ và lưu trên trình duyệt này.</small></div></div>${pendingAvatarDataUrl?'<div class="avatar-pending-note" role="status">Đang xem trước ảnh mới. Chưa áp dụng vào hồ sơ.</div>':''}<div class="form-actions avatar-image-actions">${pendingAvatarDataUrl?'<button type="button" class="button button-primary button-small" data-action="apply-avatar-image">Áp dụng ảnh</button><button type="button" class="button button-ghost button-small" data-action="cancel-avatar-image">Hủy xem trước</button>':''}${state.profile.avatarImage&&!pendingAvatarDataUrl?'<button type="button" class="button button-ghost button-small" data-action="remove-avatar-image">Dùng biểu tượng đại diện</button>':''}</div></div><div class="form-field" style="margin-top:17px"><label>Hoặc chọn biểu tượng đại diện</label><div class="avatar-picker">${AVATARS.map(a=>`<button type="button" class="avatar-choice ${!state.profile.avatarImage&&a===state.profile.avatar?'active':''}" data-action="pick-avatar" data-avatar="${a}" aria-label="Chọn avatar ${a}" aria-pressed="${!state.profile.avatarImage&&a===state.profile.avatar}">${a}</button>`).join('')}</div></div><div class="form-actions"><button class="button button-primary" type="submit">Lưu hồ sơ</button></div></form></section><div class="grid"><section class="surface surface-pad"><h2 class="card-title">Thẻ hành trình</h2><p class="card-subtitle">Một cái nhìn nhanh về hồ sơ học tập.</p><div class="level-row" style="margin-top:17px"><div class="level-emblem">${tier.emoji}</div><div class="level-info"><h3>${escapeHtml(tier.name)}</h3><p>Cấp độ ${tier.level} · ${Math.floor(state.xp)} XP</p></div></div><div class="level-bar"><span style="width:${xpProgress().pct}%"></span></div><div class="level-footer"><span>${xpProgress().remaining} XP đến bậc kế tiếp</span><button class="text-action" style="color:var(--cyan);border:0;background:transparent;font-size:.64rem" data-action="navigate" data-page="stats">Xem tiến trình ↗</button></div></section><section class="data-notice"><b>Quyền riêng tư:</b> tài khoản và ảnh đại diện được lưu cục bộ trong trình duyệt này. Ảnh không được đồng bộ lên máy chủ hoặc thiết bị khác.</section></div></div>`;
}

function renderDeadlines(){
  const active=(state.tasks||[]).filter(t=>t?.isDeadline&&!t.done).sort((a,b)=>deadlineTimestamp(a)-deadlineTimestamp(b));
  const completed=(state.completedTasks||[]).filter(t=>t?.isDeadline).sort((a,b)=>(b.completedAt||0)-(a.completedAt||0));for(const id of [...selectedDeadlineIds])if(!active.some(task=>task.id===id))selectedDeadlineIds.delete(id);const visibleCompleted=completed.slice(0,8);for(const id of [...selectedCompletedDeadlineIds])if(!visibleCompleted.some(task=>task.id===id))selectedCompletedDeadlineIds.delete(id);
  const today=todayKey(),soon=active.filter(t=>t.date>=today&&t.date<=new Date(Date.now()+7*86400000).toISOString().slice(0,10)).length,overdue=active.filter(t=>t.date<today||t.date===today&&deadlineTimestamp(t)<Date.now()).length;
  const edit=active.find(t=>t.id===editingDeadlineId)||null;
  return `<div class="page-heading"><div><p class="eyebrow">PLAN / DUE DATES</p><h1>Deadline <span class="gradient-text">& Hạn chót</span></h1><p>Quản lý hạn bài tập trên cùng nguồn dữ liệu với Lịch học tập. Thay đổi tại đây cũng xuất hiện trong lịch.</p></div><div class="page-heading-actions"><button class="button button-ghost" data-action="navigate" data-page="planner">Mở lịch học ↗</button></div></div>
  <div class="deadline-summary-grid"><div class="surface deadline-stat"><small>Đang chờ</small><strong>${active.length}</strong><span>deadline đang mở</span></div><div class="surface deadline-stat"><small>Sắp đến hạn</small><strong>${soon}</strong><span>trong 7 ngày</span></div><div class="surface deadline-stat deadline-stat-warning"><small>Quá hạn</small><strong>${overdue}</strong><span>cần xem lại</span></div><div class="surface deadline-stat"><small>Hoàn thành</small><strong>${completed.length}</strong><span>đã lưu lịch sử</span></div></div>
  <div class="grid grid-2 deadline-layout" style="align-items:start"><section class="surface deadline-form-card"><div class="section-heading" style="margin:0 0 14px"><div><h2>${edit?'Chỉnh sửa deadline':'Tạo deadline mới'}</h2><p>${edit?'Thay đổi hạn sẽ được áp dụng ngay cho lịch nhắc.':'Chọn hạn đến và các mốc nhắc trước hạn.'}</p></div></div>
  <form id="deadlineForm"><input type="hidden" name="id" value="${escapeHtml(edit?.id||'')}"><div class="form-field"><label for="deadlineTitle">Tên công việc *</label><input id="deadlineTitle" name="title" class="field" maxlength="120" value="${escapeHtml(edit?.title||'')}" placeholder="Ví dụ: Nộp bài tập Vật lý" required></div><div class="form-field" style="margin-top:12px"><label for="deadlineDescription">Mô tả</label><textarea id="deadlineDescription" name="description" class="text-area" rows="2" maxlength="500" placeholder="Yêu cầu hoặc ghi chú cần nhớ">${escapeHtml(edit?.description||'')}</textarea></div><div class="form-grid" style="margin-top:12px"><div class="form-field"><label for="deadlineDate">Ngày đến hạn *</label><input id="deadlineDate" name="date" type="date" class="field" value="${escapeHtml(edit?.date||today)}" required></div><div class="form-field"><label for="deadlineTime">Giờ đến hạn</label><input id="deadlineTime" name="when" type="time" class="field" value="${escapeHtml(edit?.when||'23:59')}"></div><div class="form-field"><label for="deadlineSubject">Môn học</label><select id="deadlineSubject" name="subject" class="select-field">${SUBJECTS.map(subject=>`<option ${subject===(edit?.subject||defaultStudySubject())?'selected':''}>${escapeHtml(subject)}</option>`).join('')}</select></div><div class="form-field"><label for="deadlinePriority">Mức ưu tiên</label><select id="deadlinePriority" name="priority" class="select-field">${[['Thấp','Thấp'],['Vừa','Trung bình'],['Cao','Cao'],['Khẩn cấp','Khẩn cấp']].map(([v,l])=>`<option value="${v}" ${v===(edit?.priority||'Vừa')?'selected':''}>${l}</option>`).join('')}</select></div></div><fieldset class="deadline-reminder-fieldset"><legend>Nhắc trước hạn (khi website đang mở)</legend>${[[1440,'24 giờ trước'],[180,'3 giờ trước'],[30,'30 phút trước']].map(([v,label])=>`<label><input type="checkbox" name="reminders" value="${v}" ${(edit?.reminders||[1440,180,30]).includes(v)?'checked':''}> <span>${label}</span></label>`).join('')}</fieldset><div class="form-actions"><button type="submit" class="button button-primary">${edit?'Lưu thay đổi':'＋ Tạo deadline'}</button>${edit?'<button type="button" class="button button-ghost" data-action="cancel-edit-deadline">Hủy chỉnh sửa</button>':''}</div><p class="form-hint">Lưu ý: ứng dụng tĩnh kiểm tra nhắc hạn khi trang đang mở. Để gửi đúng giờ khi trình duyệt đã đóng cần backend/Push chưa được cấu hình trong bản này.</p></form></section>
  <section class="surface deadline-list-card"><div class="section-heading" style="margin:0 0 12px"><div><h2>Deadline đang theo dõi</h2><p>Ưu tiên theo hạn gần nhất.</p></div><span class="pill pill-cyan">${active.length} mục</span></div><div class="bulk-action-bar"><div><b>${selectedDeadlineIds.size} deadline được chọn</b><small>Chọn nhiều hạn chót để chuyển cùng lúc vào Lịch sử xóa.</small></div><button class="button button-danger button-small" data-action="bulk-delete-deadlines" ${selectedDeadlineIds.size?'':'disabled'}>Xóa nhóm đã chọn</button><button class="button button-ghost button-small" data-action="clear-deadline-selection">Bỏ chọn</button></div>${active.length?`<div class="deadline-list">${active.map(task=>{const late=task.date<today||task.date===today&&deadlineTimestamp(task)<Date.now();const remain=Math.ceil((deadlineTimestamp(task)-Date.now())/86400000);return `<article class="deadline-item ${late?'is-overdue':''}"><label class="bulk-pick deadline-bulk-pick"><input type="checkbox" data-action="deadline-select-item" data-id="${escapeHtml(task.id)}" ${selectedDeadlineIds.has(task.id)?'checked':''} aria-label="Chọn deadline ${escapeHtml(task.title)}"><span></span></label><div class="deadline-item-mark">${late?'!':'⌛'}</div><div class="deadline-item-body"><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.subject||'Khác')} · Ưu tiên ${escapeHtml(String(task.priority||'Vừa').toLocaleLowerCase('vi'))} · ${escapeHtml(task.date)}${task.when?` lúc ${escapeHtml(task.when)}`:''}</p>${task.description?`<p class="deadline-description">${escapeHtml(task.description)}</p>`:''}<div class="deadline-item-tags"><span class="pill ${late?'pill-amber':'pill-cyan'}">${late?'Quá hạn':remain===0?'Đến hạn hôm nay':`Còn ${remain} ngày`}</span><span class="pill">${(task.reminders||[1440,180,30]).length} mốc nhắc</span></div><div class="deadline-item-actions"><button class="button button-soft button-small" data-action="toggle-task" data-id="${escapeHtml(task.id)}">✓ Hoàn thành</button><button class="button button-ghost button-small" data-action="edit-deadline" data-id="${escapeHtml(task.id)}">Sửa</button><button class="button button-ghost button-small" data-action="delete-task" data-id="${escapeHtml(task.id)}">Xóa</button></div></div></article>`;}).join('')}</div>`:'<div class="empty-state"><div class="empty-icon">⌛</div><h3>Chưa có deadline</h3><p>Tạo hạn chót đầu tiên ở biểu mẫu bên trái. Deadline sẽ dùng chung lịch học hiện tại.</p></div>'}<div class="section-heading" style="margin:22px 0 10px"><div><h3>Đã hoàn thành</h3><p>Các hạn đã hoàn thành được lưu trong lịch sử.</p></div></div>${completed.length?`<div class="bulk-action-bar"><div><b>${selectedCompletedDeadlineIds.size} deadline hoàn thành được chọn</b><small>Chọn tối đa 8 mục đang hiển thị để xử lý theo nhóm.</small></div><button class="button button-danger button-small" data-action="bulk-delete-completed-deadlines" ${selectedCompletedDeadlineIds.size?'':'disabled'}>Xóa nhóm đã chọn</button><button class="button button-ghost button-small" data-action="clear-completed-deadline-selection">Bỏ chọn</button></div><div class="deadline-completed-list">${completed.slice(0,8).map(task=>`<div><label class="bulk-pick"><input type="checkbox" data-action="completed-deadline-select-item" data-id="${escapeHtml(task.id)}" ${selectedCompletedDeadlineIds.has(task.id)?'checked':''} aria-label="Chọn deadline hoàn thành ${escapeHtml(task.title)}"><span></span></label><span>✓</span><div><b>${escapeHtml(task.title)}</b><small>${escapeHtml(task.date)}${task.completedAt?` · xong ${new Date(task.completedAt).toLocaleDateString('vi-VN')}`:''}</small></div><button class="text-action" data-action="restore-task" data-id="${escapeHtml(task.id)}">Khôi phục</button></div>`).join('')}</div>`:'<p class="text-muted">Chưa có deadline hoàn thành.</p>'}</section></div>`;
}
function saveDeadline(form){
  const fd=new FormData(form),id=String(fd.get('id')||''),title=String(fd.get('title')||'').trim(),date=String(fd.get('date')||''),when=String(fd.get('when')||'23:59');
  if(!title)return showToast('Hãy nhập tên deadline.','error');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(new Date(`${date}T12:00:00`).getTime()))return showToast('Ngày đến hạn chưa hợp lệ.','error');
  if(when&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(when))return showToast('Giờ đến hạn chưa hợp lệ.','error');
  const reminders=fd.getAll('reminders').map(Number).filter(v=>[1440,180,30].includes(v));const old=id?state.tasks.find(t=>t.id===id&&t.isDeadline):null;
  if(id&&!old)return showToast('Deadline đã thay đổi hoặc không còn tồn tại. Hãy tải lại danh sách.','error');
  const record={...(old||{}),id:old?.id||makeId('deadline'),title:title.slice(0,120),description:String(fd.get('description')||'').trim().slice(0,500),date,when,subject:String(fd.get('subject')||'Khác'),priority:String(fd.get('priority')||'Vừa'),isDeadline:true,reminders,done:false,updatedAt:Date.now(),createdAt:old?.createdAt||Date.now()};
  const before=snapshotStudyState(),previousSelectedDate=plannerSelectedDate,previousEditingId=editingDeadlineId;
  if(old){Object.assign(old,record);state.reminderKeys=(state.reminderKeys||[]).filter(key=>!key.startsWith(`deadline:${old.id}:`));}else state.tasks.push(record);
  plannerSelectedDate=date;editingDeadlineId=null;
  if(!saveMutationOrRollback(before)){plannerSelectedDate=previousSelectedDate;editingDeadlineId=previousEditingId;return;}
  renderPage('deadlines');showToast(old?'Đã cập nhật deadline và đặt lại mốc nhắc.':'Đã tạo deadline và đồng bộ vào Lịch học tập.','success');
}
function storageDateNumber(value){const n=Number(value);if(Number.isFinite(n)&&n>0)return n;const text=String(value||'');if(/^\d{4}-\d{2}-\d{2}$/.test(text)){const parsed=new Date(`${text}T12:00:00`).getTime();return Number.isFinite(parsed)?parsed:0;}return 0;}
function storageRecords(){
  const rows=[];
  const add=(type,items,page,titleOf,dateOf,summaryOf)=>items.forEach(item=>rows.push({type,id:item.id,title:titleOf(item),date:dateOf(item),summary:summaryOf(item),page,item}));
  add('note',state.notes||[],'notes',x=>x.title||'Ghi chú không tiêu đề',x=>x.updatedAt||x.createdAt,x=>String(x.content||'').slice(0,130));
  add('document',state.documents||[],'documents',x=>x.title||'Tài liệu không tiêu đề',x=>x.updatedAt||x.createdAt,x=>documentText(x.content||'').slice(0,130));
  add('flashcard',state.flashcards||[],'flashcards',x=>x.front||'Flashcard',x=>x.lastReviewedAt||x.createdAt,x=>String(x.back||'').slice(0,130));
  add('quiz',state.customQuizzes||[],'quiz',x=>x.title||'Bộ quiz',x=>x.createdAt,x=>`${(x.questions||[]).length} câu hỏi · ${x.subject||'Khác'}`);
  add('examQuestion',state.examQuestionBank||[],'exam',x=>x.question||'Câu hỏi trong ngân hàng',x=>x.createdAt,x=>`${quizQuestionTypeLabel(x.type)} · ${x.subject||'Khác'}`);
  add('task',(state.tasks||[]).filter(x=>!x.isDeadline),'planner',x=>x.title||'Nhiệm vụ',x=>x.date,x=>`${x.subject||'Khác'} · Ưu tiên ${String(x.priority||'Vừa').toLocaleLowerCase('vi')}`);
  add('completedTask',state.completedTasks||[],'planner',x=>x.title||'Việc đã hoàn thành',x=>x.completedAt||x.date,x=>`Đã hoàn thành · ${x.subject||'Khác'}`);
  add('deadline',(state.tasks||[]).filter(x=>x.isDeadline),'deadlines',x=>x.title||'Deadline',x=>x.date,x=>`Hạn ${x.date}${x.when?` ${x.when}`:''} · Ưu tiên ${String(x.priority||'Vừa').toLocaleLowerCase('vi')}`);
  add('resource',state.resources||[],'vault',x=>x.title||'Tài nguyên',x=>x.createdAt,x=>x.url||x.description||'');
  return rows.sort((a,b)=>storageDateNumber(b.date)-storageDateNumber(a.date));
}
const STORAGE_TYPE_LABELS={note:'Ghi chú',document:'Tài liệu',flashcard:'Flashcard',quiz:'Bộ quiz',examQuestion:'Câu hỏi trong ngân hàng',task:'Nhiệm vụ',deadline:'Deadline',completedTask:'Việc đã hoàn thành',resource:'Tài nguyên'};
let selectedStorageKeys=new Set();
let selectedRecycleIds=new Set();
let storageFullscreenMode=false;
let storageNativeFullscreen=false;
function storageSelectionKey(type,id){return JSON.stringify([String(type),String(id)]);}
function updateStorageSelectionUI(){const selected=$('#storageSelectedCount'),deleteButton=$('#storageDeleteSelected');if(selected)selected.textContent=`${selectedStorageKeys.size} mục đã chọn`;if(deleteButton)deleteButton.disabled=selectedStorageKeys.size===0;const visible=$$('[data-storage-record]').filter(row=>!row.classList.contains('hidden'));const allChecked=visible.length>0&&visible.every(row=>selectedStorageKeys.has(storageSelectionKey(row.dataset.type,row.dataset.id)));const selectButton=$('#storageSelectVisible');if(selectButton){selectButton.textContent=allChecked?'Bỏ chọn mục đang hiển thị':'Chọn mục đang hiển thị';selectButton.setAttribute('aria-pressed',String(allChecked));}const count=$('#storageVisibleCount');if(count)count.textContent=`${visible.length} mục đang hiển thị`; }
function updateRecycleSelectionUI(){const count=$('#recycleSelectedCount'),restore=$('#restoreRecycleSelected'),purge=$('#purgeRecycleSelected');if(count)count.textContent=`${selectedRecycleIds.size} mục đã chọn`;if(restore)restore.disabled=selectedRecycleIds.size===0;if(purge)purge.disabled=selectedRecycleIds.size===0;const visible=$$('[data-recycle-row]').filter(row=>!row.classList.contains('hidden'));const allChecked=visible.length>0&&visible.every(row=>selectedRecycleIds.has(row.dataset.id));const button=$('#recycleSelectVisible');if(button){button.textContent=allChecked?'Bỏ chọn mục đang hiển thị':'Chọn mục đang hiển thị';button.setAttribute('aria-pressed',String(allChecked));}}
function renderStorage(){
  const records=storageRecords();const approx=(()=>{try{return new Blob([JSON.stringify(state)]).size;}catch{return 0;}})();const kb=(approx/1024).toLocaleString('vi-VN',{maximumFractionDigits:1});
  const types=Object.keys(STORAGE_TYPE_LABELS);const counts=types.map(type=>({type,count:records.filter(r=>r.type===type).length}));
  return `<div id="storagePage" class="storage-page ${storageFullscreenMode?'is-fullscreen':''}"><div class="page-heading"><div><p class="eyebrow">PERSONAL DATA / LIBRARY</p><h1>Storage <span class="gradient-text">· Kho dữ liệu</span></h1><p>Một nơi để tìm, mở, chọn và quản lý cả dữ liệu đang dùng lẫn việc đã hoàn thành trên thiết bị này.</p></div><div class="page-heading-actions"><button class="button button-ghost" data-action="storage-fullscreen" aria-pressed="${storageFullscreenMode}" title="${storageFullscreenMode?'Thoát toàn màn hình':'Mở Storage toàn màn hình'}">${storageFullscreenMode?'↙ Thoát toàn màn hình':'⛶ Toàn màn hình'}</button><button class="button button-primary" data-action="export-data">⇩ Xuất bản sao lưu JSON</button><button class="button button-ghost" data-action="navigate" data-page="recycle">Lịch sử xóa ↗</button></div></div>
  <section class="storage-overview-grid"><div class="surface storage-overview-main"><div><p class="eyebrow">LOCAL DATA ESTIMATE</p><h2>${kb} KB</h2><p>Dung lượng ước tính của dữ liệu ứng dụng đang lưu, không phải giới hạn dung lượng chính thức của trình duyệt. Mở rộng giao diện không làm tăng giới hạn localStorage.</p></div><div class="storage-usage-track"><span style="width:${Math.min(100,Math.max(2,approx/1024/50*100))}%"></span></div><small>${records.length} mục đang hoạt động · cục bộ trên trình duyệt này</small></div><div class="surface storage-bin-link"><span class="storage-link-symbol">♲</span><div><b>${(state.deletedItems||[]).length} mục trong lịch sử xóa</b><p>Khôi phục theo nhóm hoặc xóa vĩnh viễn có xác nhận.</p><button class="button button-soft button-small" data-action="navigate" data-page="recycle">Mở lịch sử xóa ↗</button></div></div></section>
  <div class="storage-type-grid">${counts.map(item=>`<button class="surface storage-type-card" data-action="storage-type" data-type="${item.type}"><span>${({note:'✎',document:'▤',flashcard:'▣',quiz:'✳',examQuestion:'Q',task:'✓',deadline:'⌛',completedTask:'✓',resource:'⌘'})[item.type]}</span><b>${item.count}</b><small>${STORAGE_TYPE_LABELS[item.type]}</small></button>`).join('')}</div>
  <section class="surface storage-library-panel"><div class="section-heading"><div><h2>Tất cả dữ liệu</h2><p>Tìm kiếm/lọc, chọn nhiều mục và chuyển chúng cùng lúc vào Lịch sử xóa.</p></div><span class="pill">${records.length} mục</span></div><div class="filter-bar storage-filters"><div class="search-input-wrap"><span>⌕</span><input id="storageSearch" class="field" placeholder="Tìm tên, nội dung hoặc mô tả…" aria-label="Tìm dữ liệu Storage"></div><select id="storageTypeFilter" class="select-field" aria-label="Lọc loại dữ liệu"><option value="all">Tất cả loại</option>${types.map(type=>`<option value="${type}">${STORAGE_TYPE_LABELS[type]}</option>`).join('')}</select><select id="storageSort" class="select-field" aria-label="Sắp xếp dữ liệu"><option value="recent">Gần đây trước</option><option value="name">Tên A–Z</option></select></div><div class="storage-bulk-toolbar"><button type="button" id="storageSelectVisible" class="button button-soft button-small" data-action="storage-select-visible">Chọn mục đang hiển thị</button><span id="storageVisibleCount" class="text-muted">${records.length} mục đang hiển thị</span><span id="storageSelectedCount" class="pill">${selectedStorageKeys.size} mục đã chọn</span><button type="button" id="storageDeleteSelected" class="button button-danger button-small" data-action="storage-delete-selected" ${selectedStorageKeys.size?'':'disabled'}>Chuyển mục đã chọn vào lịch sử xóa</button><button type="button" class="button button-ghost button-small" data-action="storage-clear-selection">Bỏ chọn</button></div><div id="storageRecords" class="storage-record-list">${renderStorageRecordRows(records)}</div><div id="storageEmpty" class="empty-state ${records.length?'hidden':''}"><div class="empty-icon">⌘</div><h3>Chưa có dữ liệu phù hợp</h3><p>Thêm nội dung trong Notes, Flashcards, Quiz Lab hoặc Lịch học tập.</p></div></section></div>`;
}
function renderStorageRecordRows(records){if(!records.length)return '';return records.map(row=>{const key=storageSelectionKey(row.type,row.id),checked=selectedStorageKeys.has(key);return `<article class="storage-record" data-storage-record data-type="${row.type}" data-id="${escapeHtml(row.id)}" data-search="${escapeHtml(`${row.title} ${row.summary} ${STORAGE_TYPE_LABELS[row.type]}`.toLowerCase())}" data-date="${storageDateNumber(row.date)}"><label class="storage-select-control"><input type="checkbox" data-action="storage-select-item" data-type="${row.type}" data-id="${escapeHtml(row.id)}" aria-label="Chọn ${escapeHtml(row.title)}" ${checked?'checked':''}><span></span></label><span class="storage-record-icon">${({note:'✎',document:'▤',flashcard:'▣',quiz:'✳',examQuestion:'Q',task:'✓',deadline:'⌛',completedTask:'✓',resource:'⌘'})[row.type]||'•'}</span><div class="storage-record-content"><b>${escapeHtml(row.title)}</b><small>${STORAGE_TYPE_LABELS[row.type]} · ${row.date?(new Date(typeof row.date==='number'?row.date:`${row.date}T12:00:00`).toLocaleDateString('vi-VN')):'Chưa có ngày'}</small><p>${escapeHtml(row.summary||'Không có mô tả')}</p></div><div class="storage-record-actions"><button class="button button-soft button-small" data-action="storage-open" data-type="${row.type}" data-id="${escapeHtml(row.id)}">Mở</button><button class="icon-button" aria-label="Chuyển ${escapeHtml(row.title)} vào lịch sử xóa" title="Chuyển vào lịch sử xóa" data-action="storage-delete" data-type="${row.type}" data-id="${escapeHtml(row.id)}">×</button></div></article>`;}).join('');}
function filterStorage(){const query=String($('#storageSearch')?.value||'').toLowerCase().trim(),type=$('#storageTypeFilter')?.value||'all',sort=$('#storageSort')?.value||'recent';const container=$('#storageRecords');if(!container)return;const rows=$$('[data-storage-record]',container);rows.sort((a,b)=>sort==='name'?a.querySelector('b').textContent.localeCompare(b.querySelector('b').textContent,'vi'):Number(b.dataset.date)-Number(a.dataset.date)).forEach(row=>container.appendChild(row));let visible=0;rows.forEach(row=>{const show=(type==='all'||row.dataset.type===type)&&(!query||row.dataset.search.includes(query));row.classList.toggle('hidden',!show);if(show)visible++;});$('#storageEmpty')?.classList.toggle('hidden',visible>0);updateStorageSelectionUI();}
function renderRecycleBin(){
  const items=(state.deletedItems||[]).slice().sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));
  return `<div class="page-heading"><div><p class="eyebrow">RESTORE / DATA SAFETY</p><h1>Lịch sử <span class="gradient-text">xóa</span></h1><p>Các mục ở đây đã được chuyển khỏi thư viện nhưng chưa bị xóa vĩnh viễn. Bạn có thể khôi phục hoặc xóa từng mục/theo nhóm.</p></div><div class="page-heading-actions"><button class="button button-ghost" data-action="navigate" data-page="storage">← Quay lại Storage</button>${items.length?`<button class="button button-danger button-small" data-action="purge-selected-recycle" data-id="all">Xóa vĩnh viễn tất cả</button>`:''}</div></div><section class="surface recycle-summary"><span class="storage-link-symbol">♲</span><div><b>${items.length} mục đã xóa</b><p>Khôi phục không ghi đè dữ liệu đang hoạt động. Nếu nhóm có xung đột ID, cả nhóm sẽ được giữ nguyên để bạn xử lý riêng.</p></div></section><div class="filter-bar"><div class="search-input-wrap"><span>⌕</span><input class="field" id="recycleSearch" placeholder="Tìm trong lịch sử xóa…" aria-label="Tìm mục đã xóa"></div><select class="select-field" id="recycleTypeFilter" aria-label="Lọc loại đã xóa"><option value="all">Tất cả loại</option>${Object.keys(STORAGE_TYPE_LABELS).map(type=>`<option value="${type}">${STORAGE_TYPE_LABELS[type]}</option>`).join('')}</select></div><div class="storage-bulk-toolbar recycle-bulk-toolbar"><button type="button" class="button button-soft button-small" id="recycleSelectVisible" data-action="recycle-select-visible">Chọn mục đang hiển thị</button><span id="recycleSelectedCount" class="pill">${selectedRecycleIds.size} mục đã chọn</span><button type="button" class="button button-primary button-small" id="restoreRecycleSelected" data-action="restore-recycle-selected" ${selectedRecycleIds.size?'':'disabled'}>Khôi phục mục đã chọn</button><button type="button" class="button button-danger button-small" id="purgeRecycleSelected" data-action="purge-recycle-selected" ${selectedRecycleIds.size?'':'disabled'}>Xóa vĩnh viễn mục đã chọn</button><button type="button" class="button button-ghost button-small" data-action="recycle-clear-selection">Bỏ chọn</button></div><section id="recycleList" class="surface recycle-list">${items.length?items.map(item=>{const checked=selectedRecycleIds.has(item.id);return `<article class="recycle-row" data-recycle-row data-id="${escapeHtml(item.id)}" data-type="${escapeHtml(item.type)}" data-search="${escapeHtml(`${item.title} ${item.type}`.toLowerCase())}"><label class="storage-select-control"><input type="checkbox" data-action="recycle-select-item" data-id="${escapeHtml(item.id)}" aria-label="Chọn mục đã xóa ${escapeHtml(item.title||'không tên')}" ${checked?'checked':''}><span></span></label><span class="storage-record-icon">♲</span><div class="storage-record-content"><b>${escapeHtml(item.title||'Mục không có tên')}</b><small>${STORAGE_TYPE_LABELS[item.type]||item.type} · Xóa lúc ${item.deletedAt?new Date(item.deletedAt).toLocaleString('vi-VN'):'không rõ'}${item.sourceCollection?` · ${item.sourceCollection==='completedTasks'?'Lịch sử hoàn thành':'Thư viện gốc'}`:''}</small><p>${escapeHtml(item.summary||'Bạn có thể khôi phục hoặc xóa vĩnh viễn mục này.')}</p></div><div class="storage-record-actions"><button class="button button-soft button-small" data-action="restore-deleted" data-id="${escapeHtml(item.id)}">Khôi phục</button><button class="button button-danger button-small" data-action="purge-deleted" data-id="${escapeHtml(item.id)}">Xóa vĩnh viễn</button></div></article>`}).join(''):'<div class="empty-state"><div class="empty-icon">♲</div><h3>Lịch sử xóa đang trống</h3><p>Khi bạn chuyển dữ liệu vào lịch sử xóa, mục đó sẽ xuất hiện ở đây.</p></div>'}</section>`;
}
function filterRecycleBin(){const query=String($('#recycleSearch')?.value||'').toLowerCase().trim(),type=$('#recycleTypeFilter')?.value||'all';let visible=0;$$('[data-recycle-row]').forEach(row=>{const show=(type==='all'||row.dataset.type===type)&&(!query||row.dataset.search.includes(query));row.classList.toggle('hidden',!show);if(show)visible++;});updateRecycleSelectionUI();}
function itemCollection(type){return ({note:'notes',document:'documents',flashcard:'flashcards',quiz:'customQuizzes',examQuestion:'examQuestionBank',resource:'resources',task:'tasks',deadline:'tasks',completedTask:'completedTasks'})[type]||null;}

function storageCollectionForRecord(record){return record.type==='completedTask'?'completedTasks':itemCollection(record.type);}
function bulkDeleteStorageSelected(){const keys=[...selectedStorageKeys];if(!keys.length)return showToast('Hãy chọn ít nhất một mục trước.','error');const records=storageRecords().filter(row=>selectedStorageKeys.has(storageSelectionKey(row.type,row.id)));if(records.length!==keys.length){return showToast('Một số mục đã thay đổi hoặc không còn hoạt động. Hãy tải lại danh sách rồi chọn lại.','error');}if((state.deletedItems||[]).length+records.length>500)return showToast('Nhóm đã chọn vượt giới hạn Lịch sử xóa 500 mục. Hãy chia thành các nhóm nhỏ hoặc dọn Lịch sử xóa trước.','error');const before=snapshotStudyState();try{for(const row of records){const collection=storageCollectionForRecord(row);if(!collection||!Array.isArray(state[collection]))throw new Error('Không xác định được nơi lưu của một mục đã chọn.');const index=state[collection].findIndex(x=>x?.id===row.id);if(index<0)throw new Error('Một mục đã thay đổi trước khi xóa. Không có nhóm nào được lưu.');const [removed]=state[collection].splice(index,1);const record={id:makeId('deleted'),itemId:removed.id,type:row.type,title:String(removed.title||removed.front||removed.name||'Mục đã xóa').slice(0,160),summary:String(removed.description||removed.content||removed.back||removed.url||'').replace(/<[^>]*>/g,' ').slice(0,180),deletedAt:Date.now(),sourceCollection:collection,data:JSON.parse(JSON.stringify(removed))};state.deletedItems=[...(state.deletedItems||[]),record];}}catch(err){if(before){try{state=JSON.parse(before);}catch(rollbackError){console.error('Could not roll back prepared storage deletion.',rollbackError);}}showToast(err.message||'Không thể chuẩn bị thao tác xóa theo nhóm. Không lưu thay đổi.','error');return;}if(!saveMutationOrRollback(before))return;const count=records.length;recordNotification('Đã chuyển nhóm dữ liệu vào Lịch sử xóa',`Đã chuyển ${count} mục vào Lịch sử xóa.`,'storageActions',{icon:'♲',action:'recycle',actionLabel:'Mở lịch sử xóa',dedupeKey:`deleted-batch:${makeId('batch')}`,toast:false});selectedStorageKeys.clear();selectedRecycleIds.clear();renderPage('storage',{recordHistory:false});showToast(`Đã chuyển ${count} mục vào Lịch sử xóa.`,'success');}
function toggleStorageFullscreen(){if(activePage!=='storage')return;if(storageFullscreenMode){storageFullscreenMode=false;storageNativeFullscreen=false;if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(error=>console.debug('Fullscreen request was rejected by the browser.',error));renderPage('storage',{recordHistory:false});return;}storageFullscreenMode=true;renderPage('storage',{recordHistory:false});const root=$('#storagePage');if(root?.requestFullscreen){root.requestFullscreen().then(()=>{storageNativeFullscreen=true;}).catch(()=>{storageNativeFullscreen=false;});}}
function restoreDeletedItemsBatch(){const ids=[...selectedRecycleIds];if(!ids.length)return showToast('Hãy chọn ít nhất một mục để khôi phục.','error');const records=ids.map(id=>(state.deletedItems||[]).find(r=>r.id===id));if(records.some(r=>!r))return showToast('Một số mục đã biến mất khỏi lịch sử. Hãy tải lại rồi chọn lại.','error');const occupied=new Set(),plans=[];for(const collection of ['notes','documents','flashcards','customQuizzes','examQuestionBank','resources','tasks','completedTasks'])for(const item of state[collection]||[]){const family=(collection==='tasks'||collection==='completedTasks')?'task':collection;occupied.add(`${family}\u0000${item.id}`);}for(const record of records){const collection=record.sourceCollection||itemCollection(record.type);if(!collection||!Array.isArray(state[collection])||!record.data||!record.data.id)return showToast('Không xác định được nơi khôi phục của một mục. Không có dữ liệu nào được thay đổi.','error');const family=(collection==='tasks'||collection==='completedTasks')?'task':collection,key=`${family}\u0000${record.data.id}`;if(occupied.has(key))return showToast(`Không thể khôi phục nhóm: ID “${record.data.id}” đã tồn tại hoặc bị trùng trong nhóm. Không có mục nào được thay đổi.`, 'error');occupied.add(key);plans.push({record,collection,data:JSON.parse(JSON.stringify(record.data))});}const before=snapshotStudyState();for(const plan of plans)state[plan.collection].push(plan.data);const chosen=new Set(ids);state.deletedItems=state.deletedItems.filter(r=>!chosen.has(r.id));if(!saveMutationOrRollback(before))return;selectedRecycleIds.clear();renderPage('recycle',{recordHistory:false});showToast(`Đã khôi phục ${plans.length} mục.`,'success');}
function permanentlyDeleteItemsBatch(){const ids=[...selectedRecycleIds];if(!ids.length)return showToast('Hãy chọn ít nhất một mục để xóa vĩnh viễn.','error');const existing=(state.deletedItems||[]).filter(r=>ids.includes(r.id));if(existing.length!==ids.length)return showToast('Một số mục đã thay đổi. Hãy tải lại danh sách trước khi xóa.','error');requestConfirmation({eyebrow:'LỊCH SỬ XÓA · XÓA THEO NHÓM',title:`Xóa vĩnh viễn ${existing.length} mục đã chọn?`,message:'Dữ liệu của các mục đã chọn sẽ bị loại khỏi Lịch sử xóa.',detail:'Thao tác không thể hoàn tác. Hãy xuất bản sao lưu trước khi tiếp tục.',confirmLabel:'Xóa vĩnh viễn nhóm',cancelLabel:'Giữ lại',danger:true},()=>{const before=snapshotStudyState(),chosen=new Set(ids);state.deletedItems=state.deletedItems.filter(r=>!chosen.has(r.id));if(!saveMutationOrRollback(before))return;selectedRecycleIds.clear();renderPage('recycle',{recordHistory:false});showToast(`Đã xóa vĩnh viễn ${existing.length} mục.`,'success');});}

function softDeleteItem(type,item,sourceCollection){if(!state||!item||!item.id)return false;if((state.deletedItems||[]).length>=500){showToast('Lịch sử xóa đã đạt giới hạn an toàn 500 mục. Hãy xuất bản sao lưu rồi khôi phục hoặc xóa vĩnh viễn một số mục trước khi xóa tiếp.','error');return false;}const collection=itemCollection(type)||sourceCollection;if(!collection)return false;const target=state[collection];const index=Array.isArray(target)?target.findIndex(x=>x?.id===item.id):-1;if(index<0)return false;const [removed]=target.splice(index,1);const record={id:makeId('deleted'),itemId:removed.id,type,title:String(removed.title||removed.front||removed.name||'Mục đã xóa').slice(0,160),summary:String(removed.description||removed.content||removed.back||removed.url||'').replace(/<[^>]*>/g,' ').slice(0,180),deletedAt:Date.now(),sourceCollection:collection,data:JSON.parse(JSON.stringify(removed))};state.deletedItems=[...(state.deletedItems||[]),record];if(!saveState()){state[collection].splice(Math.min(index,state[collection].length),0,removed);state.deletedItems=state.deletedItems.filter(x=>x.id!==record.id);return false;}recordNotification('Đã chuyển vào Lịch sử xóa',`“${record.title}” đã được chuyển vào Lịch sử xóa.`,'storageActions',{icon:'♲',action:'recycle',actionLabel:'Mở lịch sử xóa',dedupeKey:`deleted:${record.id}`,toast:false});return true;}
function restoreDeletedItem(deletedId){const record=state.deletedItems.find(x=>x.id===deletedId);if(!record)return showToast('Mục này không còn trong lịch sử xóa.','error');const collection=record.sourceCollection||itemCollection(record.type);if(!collection||!Array.isArray(state[collection]))return showToast('Không thể xác định nơi khôi phục dữ liệu này.','error');const data=JSON.parse(JSON.stringify(record.data));if(state[collection].some(x=>x?.id===data.id)||(collection==='tasks'&&state.completedTasks.some(x=>x?.id===data.id))||(collection==='completedTasks'&&state.tasks.some(x=>x?.id===data.id))){showToast('Không thể khôi phục vì ID đã tồn tại trong dữ liệu đang hoạt động. Không có dữ liệu nào bị ghi đè.','error');return;}state[collection].push(data);state.deletedItems=state.deletedItems.filter(x=>x.id!==deletedId);if(!saveState()){state[collection]=state[collection].filter(x=>x?.id!==data.id);state.deletedItems.push(record);return;}selectedRecycleIds.delete(deletedId);renderPage('recycle');showToast(`Đã khôi phục “${record.title}”.`,'success');}
function permanentlyDeleteItem(deletedId){const record=state.deletedItems.find(x=>x.id===deletedId);if(!record)return;requestConfirmation({eyebrow:'LỊCH SỬ XÓA · XÓA VĨNH VIỄN',title:'Xóa vĩnh viễn mục này?',message:`“${record.title}” và dữ liệu của mục đó sẽ bị loại bỏ khỏi lịch sử xóa.`,detail:'Thao tác này không thể hoàn tác. Hãy xuất bản sao lưu trước khi tiếp tục.',confirmLabel:'Xóa vĩnh viễn',cancelLabel:'Giữ lại',danger:true},()=>{const before=state.deletedItems;state.deletedItems=before.filter(x=>x.id!==deletedId);if(!saveState()){state.deletedItems=before;return;}selectedRecycleIds.delete(deletedId);renderPage('recycle');showToast('Đã xóa vĩnh viễn mục đã chọn.','success');});}
function checkAchievements(){if(!state||!notificationPrefEnabled('achievements'))return;const totalStudy=(state.sessions||[]).filter(x=>x.type!=='break').reduce((n,x)=>n+(Number(x.minutes)||0),0),attempts=(state.attempts||[]).length,reviews=Number(state.flashReviews)||0;const candidates=[['study-5h',totalStudy>=300,'Bạn đã ghi nhận 5 giờ học','Đã tích lũy 5 giờ trong các phiên học được lưu.'],['quiz-5',attempts>=5,'Bạn đã hoàn thành 5 lượt quiz','Các lượt làm bài đã được ghi nhận trong lịch sử.'],['flash-10',reviews>=10,'Bạn đã ôn 10 flashcard','Các lượt tự đánh giá thẻ đã được lưu.']];let changed=false;for(const [id,ok,title,body] of candidates){if(ok&&!state.unlockedAchievements.includes(id)){state.unlockedAchievements.push(id);recordNotification(title,body,'achievements',{icon:'🏆',action:id==='quiz-5'?'quiz':'stats',actionLabel:'Xem tiến trình',dedupeKey:`achievement:${id}`,toast:true,toastType:'success'});changed=true;}}if(changed)saveState();}
function renderSettings() {
  const s=state.settings;
  const notificationSettingsCollapsed=s.notificationPreferencesCollapsed!==false;
  const enabledNotificationTypes=Object.keys(DEFAULT_NOTIFICATION_PREFS).filter(key=>notificationPrefEnabled(key)).length;
  const totalNotificationTypes=Object.keys(DEFAULT_NOTIFICATION_PREFS).length;
  return `<div class="page-heading"><div><p class="eyebrow">PERSONALIZATION / PRIVACY</p><h1>Cài đặt</h1><p>Điều chỉnh diện mạo, khả năng truy cập, thông báo và quản lý dữ liệu học tập.</p></div></div>
  <div class="settings-layout"><div><section class="surface settings-section"><div class="settings-section-header"><span class="section-symbol">◐</span><div><h3>Giao diện của bạn</h3><p>Thiết lập không gian phù hợp với mắt và cách học.</p></div></div>
  <div class="setting-row"><div class="setting-copy"><b>Chế độ hiển thị</b><small>Chọn nền tối hoặc sáng.</small></div><div class="segmented"><button data-action="set-theme" data-value="dark" class="${s.theme==='dark'?'active':''}">Tối</button><button data-action="set-theme" data-value="light" class="${s.theme==='light'?'active':''}">Sáng</button></div></div>
  <div class="setting-row accent-setting-row"><div class="setting-copy"><b>Màu nhấn</b><small>Đổi đồng bộ màu nút, viền, biểu tượng và trạng thái chọn. Màu được lưu riêng cho tài khoản của bạn.</small><small class="accent-current" aria-live="polite">Đang chọn: <strong>${escapeHtml(currentAccentSettings(s).name)}</strong></small></div><details class="accent-color-details" id="accentColorDetails" ${s.appearancePanelExpanded===true?'open':''}>
  <summary class="accent-color-summary"><span class="accent-summary-orb" style="--swatch:${escapeHtml(currentAccentSettings(s).swatch)}" aria-hidden="true">✦</span><span class="accent-summary-text"><strong>Tùy chỉnh bảng màu</strong><small>Chạm để ${s.appearancePanelExpanded===true?'thu gọn':'mở rộng'} · 8 bảng màu + màu HEX</small></span><span class="accent-summary-chevron" aria-hidden="true">⌄</span></summary>
  <div class="accent-workspace"><div class="accent-options" role="group" aria-label="Chọn bảng màu nhấn">${Object.entries(ACCENT_PRESETS).map(([id,p])=>`<button type="button" class="accent-dot ${s.accent===id?'active':''}" data-action="set-accent" data-value="${id}" style="--swatch:${p.swatch}" aria-label="${p.name}" title="${p.name}" aria-pressed="${s.accent===id}"><span class="visually-hidden">${p.name}</span></button>`).join('')}<button type="button" class="accent-dot accent-dot-custom ${s.accent==='custom'?'active':''}" data-action="set-accent" data-value="custom" style="--swatch:${normalizeAccentHex(s.customAccent)||DEFAULT_CUSTOM_ACCENT}" aria-label="Dùng màu tùy chỉnh" title="Màu tùy chỉnh" aria-pressed="${s.accent==='custom'}"><span aria-hidden="true">✦</span></button></div><div class="accent-custom-controls"><label for="customAccentPicker">Màu tùy chỉnh</label><input type="color" id="customAccentPicker" value="${normalizeAccentHex(s.customAccent)||DEFAULT_CUSTOM_ACCENT}" aria-label="Chọn màu tùy chỉnh"><label class="visually-hidden" for="customAccentHex">Mã màu HEX</label><input type="text" id="customAccentHex" class="field accent-hex-field" maxlength="7" spellcheck="false" autocapitalize="characters" value="${normalizeAccentHex(s.customAccent)||DEFAULT_CUSTOM_ACCENT}" placeholder="#6595E9" aria-label="Mã màu HEX gồm sáu chữ số"><button type="button" class="button button-soft button-small" data-action="save-custom-accent">Áp dụng</button></div><div class="accent-live-preview"><div><span class="accent-demo-symbol" aria-hidden="true">✦</span><span><strong>Thử màu giao diện</strong><small>Nút bấm và điểm nhấn có cùng tông màu</small></span></div><span class="accent-demo-button" aria-hidden="true">Xem trước ✓</span></div><div class="accent-actions"><span>8 bảng màu sẵn có · 1 màu tùy chỉnh</span><button type="button" class="button button-ghost button-small" data-action="reset-appearance">Đặt lại giao diện</button></div></div></details></div>
  <div class="setting-row font-family-setting"><div class="setting-copy"><label for="webFontFamily"><b>Phông chữ giao diện</b></label><small>Áp dụng ngay và lưu trên hồ sơ này. Phông tiêu đề và phông dự phòng tiếng Việt đi kèm website.</small></div><select id="webFontFamily" class="select-field" aria-describedby="fontPreview">${Object.entries(WEB_FONTS).map(([id,font])=>`<option value="${id}" ${s.fontFamily===id?'selected':''}>${font.label}</option>`).join('')}</select></div><div id="fontPreview" class="font-preview"><strong>Mỗi ngày, tiến thêm một bước.</strong><span>Tiếng Việt rõ ràng · Ă Â Ê Ô Ơ Ư Đ · 0123456789</span><small>Phông Trang sách đi kèm website; các kiểu khác dùng phông thiết bị và phông dự phòng tiếng Việt. Số đồng hồ Focus dùng kiểu chữ riêng; nội dung tài liệu giữ định dạng gốc.</small></div>
  <div class="setting-row"><div class="setting-copy"><b>Cỡ chữ</b><small>Điều chỉnh kích thước chữ toàn website.</small></div><div class="segmented"><button data-action="set-font" data-value="small" class="${s.fontSize==='small'?'active':''}">A−</button><button data-action="set-font" data-value="medium" class="${s.fontSize==='medium'?'active':''}">A</button><button data-action="set-font" data-value="large" class="${s.fontSize==='large'?'active':''}">A+</button></div></div>
  <div class="setting-row"><div class="setting-copy"><b>Môn học mặc định</b><small>Đồng bộ lựa chọn ban đầu giữa Lịch, ghi chú, tài liệu, Quiz Lab và học liệu mới.</small></div><select id="defaultStudySubject" class="select-field default-subject-setting" aria-label="Môn học mặc định">${SUBJECTS.map(subject=>`<option value="${escapeHtml(subject)}" ${subject===defaultStudySubject()?'selected':''}>${escapeHtml(subject)}</option>`).join('')}</select></div>
  <div class="setting-row"><div class="setting-copy"><b>Sticker trang trí</b><small>Hiện các chi tiết nhỏ trên màn hình chính.</small></div><button type="button" class="toggle" data-action="toggle-setting" data-key="stickers" aria-label="Bật hoặc tắt sticker trang trí" aria-pressed="${s.stickers}"><span></span></button></div>
  <div class="setting-row"><div class="setting-copy"><b>Giảm chuyển động</b><small>Hạn chế hiệu ứng chuyển cảnh và hoạt ảnh.</small></div><button type="button" class="toggle" data-action="toggle-setting" data-key="reduceMotion" aria-label="Bật hoặc tắt giảm chuyển động" aria-pressed="${s.reduceMotion}"><span></span></button></div>
  </section>
  <section class="surface settings-section notification-preferences-section"><div class="settings-section-header notification-settings-heading"><span class="section-symbol">♧</span><div class="notification-settings-heading-copy"><h3>Thông báo cá nhân hóa</h3><p>Bật hoặc tắt từng loại thông báo. Lựa chọn được lưu trên hồ sơ cục bộ của thiết bị này.</p><small class="notification-settings-summary">${enabledNotificationTypes}/${totalNotificationTypes} loại thông báo đang bật · ${notificationSettingsCollapsed?'Bảng cài đặt đang thu gọn':'Bảng cài đặt đang mở'}</small></div><button id="notificationPreferencesToggle" type="button" class="notification-collapse-toggle" data-action="toggle-notification-settings" aria-controls="notificationPreferencesBody" aria-expanded="${!notificationSettingsCollapsed}" title="${notificationSettingsCollapsed?'Mở rộng cài đặt thông báo':'Thu gọn cài đặt thông báo'}"><span>${notificationSettingsCollapsed?'Mở rộng':'Thu gọn'}</span><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
  <div id="notificationPreferencesBody" class="notification-preferences-body${notificationSettingsCollapsed?' is-collapsed':''}"${notificationSettingsCollapsed?' hidden':''}>
  <div class="setting-row"><div class="setting-copy"><b>Nhắc việc theo giờ khi trang đang mở</b><small>Đây là bộ kiểm tra trong ứng dụng, không phải tác vụ nền khi đã đóng trình duyệt.</small></div><button type="button" class="toggle" data-action="toggle-setting" data-key="taskReminders" aria-label="Bật hoặc tắt nhắc việc khi trang đang mở" aria-pressed="${s.taskReminders!==false}"><span></span></button></div>
  <div class="setting-row"><div class="setting-copy"><b>Bong bóng thông báo nổi</b><small>Hiển thị lời nhắc thành bong bóng nhẹ nhàng, có nút thao tác và tự ẩn khi thích hợp. Lỗi nghiêm trọng vẫn được báo rõ.</small></div><button type="button" class="toggle" data-action="toggle-setting" data-key="bubbleNotifications" aria-label="Bật hoặc tắt bong bóng thông báo" aria-pressed="${s.bubbleNotifications!==false}"><span></span></button></div>
  <div class="setting-row setting-row-save"><div class="setting-copy"><b>Nhắc nghỉ sau bao lâu?</b><small>Chỉ tính thời gian tập trung thực sự của phiên đang chạy. Có thể tạm hoãn thông báo và không ép buộc ngừng học.</small></div><select id="wellnessThreshold" class="select-field" aria-label="Mốc nhắc nghỉ">${[30,50,75,90].map(m=>`<option value="${m}" ${Number(s.wellnessThreshold)===m?'selected':''}>${m} phút</option>`).join('')}</select><button class="button button-soft button-small" type="button" data-action="save-wellness-threshold">Lưu</button></div>
  <div class="setting-row setting-row-save"><div class="setting-copy"><b>Mục tiêu thời gian học mỗi ngày</b><small>Đo theo số phút phiên học đã lưu, không tính giờ nghỉ. Hoàn thành mục tiêu được ghi nhận một lần mỗi ngày.</small></div><select id="dailyFocusGoal" class="select-field" aria-label="Mục tiêu thời gian học mỗi ngày">${[30,60,90,120,180,240].map(m=>`<option value="${m}" ${Number(s.dailyFocusGoal)===m?'selected':''}>${m} phút</option>`).join('')}</select><button class="button button-soft button-small" type="button" data-action="save-daily-focus-goal">Lưu</button></div>
  <div class="notification-pref-actions"><button class="button button-ghost button-small" data-action="notification-prefs-all" data-value="on">Bật tất cả</button><button class="button button-ghost button-small" data-action="notification-prefs-all" data-value="off">Tắt tất cả</button><button class="button button-soft button-small" data-action="notification-prefs-default">Khôi phục mặc định</button></div>
  ${NOTIFICATION_PREF_GROUPS.map(group=>`<div class="notification-pref-group"><h4>${escapeHtml(group.title)}</h4>${group.items.map(([key,title,description])=>`<div class="setting-row notification-pref-row"><div class="setting-copy"><b>${escapeHtml(title)}</b><small>${escapeHtml(description)}</small></div><button type="button" class="toggle" data-action="set-notification-pref" data-key="${key}" aria-label="${escapeHtml(title)}" aria-pressed="${notificationPrefEnabled(key)}"><span></span></button></div>`).join('')}</div>`).join('')}
  ${(()=>{const permission=getBrowserPermissionStatus();return `<div class="notification-browser-card"><div class="setting-copy"><b>Thông báo hệ thống của trình duyệt</b><small id="browserPermissionDescription">${escapeHtml(browserPermissionDetails(permission))}</small></div><div class="notification-permission-line"><span id="browserPermissionChip" class="permission-chip permission-${permission.value}">${escapeHtml(browserPermissionChipLabel(permission))}</span><button id="browserPermissionAction" type="button" class="button button-soft button-small" data-action="request-notifications" ${permission.value==='unsupported'||permission.value==='insecure'?'disabled':''}>${escapeHtml(browserPermissionActionLabel(permission,!!s.notifications))}</button></div></div>`;})()}
  <div class="security-status" style="margin-top:12px"><span>ℹ</span><span>Browser Push khi website đã đóng chưa được cấu hình: dự án hiện là frontend tĩnh, chưa có Push Subscription, máy chủ gửi thông báo hoặc lịch nền. Các nhắc giờ hiện chỉ được kiểm tra khi trang đang mở. Từ chối quyền trình duyệt không làm tắt thông báo nổi trong ứng dụng.</span></div><div class="form-actions"><button class="button button-ghost button-small" data-action="open-notifications">Mở trung tâm thông báo ↗</button><button class="button button-ghost button-small" data-action="navigate" data-page="recycle">Lịch sử xóa ↗</button></div></div></section>
  <section class="surface settings-section"><div class="settings-section-header"><span class="section-symbol">▤</span><div><h3>Storage & Lịch sử</h3><p>Mở các khu vực quản lý dữ liệu mà không làm thanh điều hướng chính quá dài.</p></div></div><div class="settings-shortcut-grid"><button type="button" class="settings-shortcut" data-action="navigate" data-page="storage"><span>▤</span><span><b>Kho dữ liệu Storage</b><small>Tìm, mở và quản lý các mục đã lưu.</small></span><span aria-hidden="true">↗</span></button><button type="button" class="settings-shortcut" data-action="navigate" data-page="recycle"><span>♲</span><span><b>Lịch sử xóa</b><small>Khôi phục hoặc xóa vĩnh viễn mục đã chuyển vào thùng rác.</small></span><span aria-hidden="true">↗</span></button><button type="button" class="settings-shortcut" data-action="navigate" data-page="documents"><span>▤</span><span><b>Storage tài liệu</b><small>Soạn và quản lý tài liệu kiểu Word.</small></span><span aria-hidden="true">↗</span></button></div></section>
  <section class="surface settings-section"><div class="settings-section-header"><span class="section-symbol">◷</span><div><h3>Giờ yên tĩnh</h3><p>Ngừng tạo nhắc nhở trong ứng dụng ở khung giờ bạn chọn. Thiết lập chỉ áp dụng khi trang đang chạy.</p></div></div><div class="setting-row"><div class="setting-copy"><b>Bật giờ yên tĩnh</b><small>Không hiện các nhắc lịch trong khung giờ dưới đây. Không ảnh hưởng việc tự lưu tài liệu.</small></div><button type="button" class="toggle" data-action="toggle-setting" data-key="quietHoursEnabled" aria-label="Bật hoặc tắt giờ yên tĩnh" aria-pressed="${!!s.quietHoursEnabled}"><span></span></button></div><div class="quiet-hours-fields"><label><span>Bắt đầu</span><select id="quietHoursStart" class="select-field">${['20:00','21:00','22:00','23:00','00:00'].map(v=>`<option ${s.quietHoursStart===v?'selected':''}>${v}</option>`).join('')}</select></label><label><span>Kết thúc</span><select id="quietHoursEnd" class="select-field">${['05:00','06:00','07:00','08:00','09:00'].map(v=>`<option ${s.quietHoursEnd===v?'selected':''}>${v}</option>`).join('')}</select></label><button type="button" class="button button-soft button-small" data-action="save-quiet-hours">Lưu giờ yên tĩnh</button></div></section>
  <section class="surface settings-section"><div class="settings-section-header"><span class="section-symbol">⇩</span><div><h3>Sao lưu & dữ liệu</h3><p>Xuất một bản JSON để giữ ghi chú, tài liệu Storage và tiến trình của bạn.</p></div></div><div class="setting-row"><div class="setting-copy"><b>Xuất bản sao lưu</b><small>Tải xuống lịch, lịch sử hoàn thành, ghi chú, tài liệu Storage, tài nguyên, quiz, flashcard và thống kê.</small></div><button class="button button-primary button-small" data-action="export-data">⇩ Xuất tệp</button></div><div class="setting-row"><div class="setting-copy"><b>Nhập bản sao lưu</b><small>Khôi phục tệp JSON được xuất từ LUMEVIA.</small></div><button class="button button-ghost button-small" data-action="import-data">↑ Nhập tệp</button></div><div class="setting-row"><div class="setting-copy"><b>Xuất sổ ghi chú (.md)</b><small>Mở và chỉnh sửa bằng ứng dụng ghi chú hoặc trình soạn thảo văn bản.</small></div><button class="button button-soft button-small" data-action="export-notes-md">✎ Xuất Markdown</button></div></section>
  </div>
  <div class="grid"><section class="surface settings-section"><div class="settings-section-header"><span class="section-symbol">⌑</span><div><h3>Đổi mật khẩu cục bộ</h3><p>Thay mật khẩu đăng nhập trên thiết bị này.</p></div></div><form id="passwordForm"><div class="form-field"><label for="currentPassword">Mật khẩu hiện tại</label><input class="field" id="currentPassword" name="currentPassword" type="password" minlength="8" required autocomplete="current-password"></div><div class="form-field" style="margin-top:10px"><label for="newPassword">Mật khẩu mới</label><input class="field" id="newPassword" name="newPassword" type="password" minlength="8" required autocomplete="new-password"></div><div class="form-field" style="margin-top:10px"><label for="confirmNewPassword">Nhập lại mật khẩu mới</label><input class="field" id="confirmNewPassword" name="confirmNewPassword" type="password" minlength="8" required autocomplete="new-password"></div><div class="form-actions"><button class="button button-primary" type="submit">Cập nhật mật khẩu</button></div><div id="passwordFeedback" class="auth-error" aria-live="polite"></div></form></section>
  <section class="surface settings-section"><div class="settings-section-header"><span class="section-symbol">⌘</span><div><h3>Tài khoản & bảo mật</h3><p>Thông tin quan trọng về chế độ tài khoản hiện tại.</p></div></div><div class="security-status"><span>✓</span><span><strong>PBKDF2-SHA-256 · 180.000 vòng</strong><br>Mật khẩu không được lưu dưới dạng văn bản thuần; trình duyệt lưu hash và salt cục bộ. Tuy vậy, mã frontend và dữ liệu localStorage có thể bị người dùng có quyền trên thiết bị xem hoặc sửa. Đây không thay thế backend an toàn.</span></div><div class="setting-row"><div class="setting-copy"><b>Tài khoản hiện tại</b><small>@${escapeHtml(currentUsername)}</small></div><button class="button button-ghost button-small" data-action="logout">Đăng xuất</button></div></section>
  <section class="surface settings-section"><div class="settings-section-header"><span class="section-symbol" style="color:var(--danger);background:color-mix(in srgb,var(--danger) 10%,var(--panel-3))">!</span><div><h3>Vùng thao tác nguy hiểm</h3><p>Hãy sao lưu trước khi xóa dữ liệu.</p></div></div><div class="data-notice"><b>Chú ý:</b> xóa dữ liệu sẽ loại bỏ tiến trình, ghi chú, bộ quiz đã lưu trước đây và flashcard khỏi trình duyệt. Thao tác này không thể hoàn tác nếu bạn chưa có bản sao lưu.</div><button class="button button-danger button-small" style="margin-top:13px" data-action="reset-data">Xóa dữ liệu học tập</button></section></div></div>`;
}

/* App mutations and event handlers */
function deleteTask(taskId) { const index=state.tasks.findIndex(t=>t.id===taskId);if(index<0)return;const task=state.tasks[index];if(softDeleteItem(task.isDeadline?'deadline':'task',task,'tasks')){renderPage(activePage);showToast('Đã chuyển công việc vào Lịch sử xóa.','success');} }
function completeTask(taskId) {
  const index=state.tasks.findIndex(t=>t.id===taskId);if(index<0)return;
  const before=snapshotStudyState();
  const [item]=state.tasks.splice(index,1);item.done=true;item.completedAt=Date.now();
  const earned=!item.xpClaimed;if(earned){state.xp+=5;item.xpClaimed=true;}
  state.completedTasks.unshift(item);if(!saveMutationOrRollback(before))return;
  renderPage(activePage);showToast(earned?'Đã hoàn thành và lưu vào lịch sử · +5 XP':'Đã hoàn thành và lưu vào lịch sử.','success');
}
function restoreTask(taskId) {
  const index=state.completedTasks.findIndex(t=>t.id===taskId);if(index<0)return;
  const before=snapshotStudyState();
  const [item]=state.completedTasks.splice(index,1);delete item.done;delete item.completedAt;state.tasks.push(item);plannerSelectedDate=item.date||todayKey();
  if(!saveMutationOrRollback(before))return;
  renderPage('planner');showToast('Đã khôi phục công việc vào lịch.','success');
}
function addTask(form) {
  const fd=new FormData(form),title=String(fd.get('title')||'').trim(),date=String(fd.get('date')||plannerSelectedDate||todayKey());if(!title)return;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(new Date(`${date}T12:00:00`).getTime()))return showToast('Ngày chưa hợp lệ.','error');
  const before=snapshotStudyState();
  state.tasks.push({id:makeId('task'),title:title.slice(0,240),date,when:String(fd.get('when')||''),subject:String(fd.get('subject')||'Khác'),priority:['Cao','Vừa','Thấp'].includes(String(fd.get('priority')||''))?String(fd.get('priority')):'Vừa',done:false,createdAt:Date.now()});plannerSelectedDate=date;
  if(!saveMutationOrRollback(before))return;
  renderPage('planner');showToast('Đã thêm vào lịch. Việc được xếp theo mức ưu tiên.','success');
}
function saveNote(form) {
  const fd=new FormData(form),title=String(fd.get('title')||'').trim(),content=String(fd.get('content')||'').trim(),id=String(fd.get('noteId')||'');
  if(!title||!content)return showToast('Nhập tiêu đề và nội dung ghi chú trước khi lưu.','error');
  const before=snapshotStudyState();
  const now=Date.now(),existing=state.notes.find(n=>n.id===id);
  const note={id:existing?.id||makeId('note'),title:title.slice(0,160),content:content.slice(0,40000),subject:String(fd.get('subject')||'Khác'),tags:String(fd.get('tags')||'').split(',').map(t=>t.trim()).filter(Boolean).slice(0,8).join(', '),pinned:fd.has('pinned'),createdAt:existing?.createdAt||now,updatedAt:now};
  if(existing){Object.assign(existing,note);}else state.notes.unshift(note);
  if(!saveMutationOrRollback(before))return;
  editingNoteId=null;renderPage('notes');showToast(existing?'Đã cập nhật ghi chú.':'Đã lưu ghi chú.','success');
}
function toggleNotePin(id) { const note=state.notes.find(n=>n.id===id);if(!note)return;const before=snapshotStudyState();note.pinned=!note.pinned;note.updatedAt=Date.now();if(!saveMutationOrRollback(before))return;renderPage('notes');showToast(note.pinned?'Đã ghim ghi chú lên đầu.':'Đã bỏ ghim ghi chú.'); }
function addResource(form) {
  const fd=new FormData(form),title=String(fd.get('title')||'').trim(),url=safeHttpUrl(fd.get('url'));if(!title||!url)return showToast('Vui lòng nhập tên và đường dẫn http/https hợp lệ.','error');
  const before=snapshotStudyState();
  state.resources.unshift({id:makeId('res'),title:title.slice(0,100),url,subject:SUBJECTS.includes(String(fd.get('subject')||''))?String(fd.get('subject')):'Khác',type:RESOURCE_TYPES.includes(String(fd.get('type')||''))?String(fd.get('type')):'Khác',description:String(fd.get('description')||'').trim().slice(0,260),tags:String(fd.get('tags')||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,8).map(s=>s.slice(0,40)),icon:'🔖',createdAt:Date.now()});
  if(!saveMutationOrRollback(before))return;
  renderPage('vault');showToast('Đã lưu tài nguyên vào kho.','success');
}
function filterResources() {
  const query=($('#resourceSearch')?.value||'').trim().toLowerCase(),subject=$('#resourceSubjectFilter')?.value||'all',type=$('#resourceTypeFilter')?.value||'all',sort=$('#resourceSort')?.value||'name';let cards=$$('.resource-card',$('#resourceGrid'));
  cards.sort((a,b)=>sort==='recent'?Number(b.dataset.created)-Number(a.dataset.created):a.dataset.title.localeCompare(b.dataset.title,'vi'));
  const grid=$('#resourceGrid');cards.forEach(card=>grid.appendChild(card));let visible=0;cards.forEach(card=>{const ok=(card.dataset.search||'').includes(query)&&(subject==='all'||card.dataset.subject===subject)&&(type==='all'||card.dataset.type===type);card.classList.toggle('hidden',!ok);if(ok)visible++;});$('#resourceEmpty')?.classList.toggle('hidden',visible>0);$('#resourceResults').textContent=`Hiển thị ${visible}/${cards.length} tài nguyên`;
}
function clearResourceFilters() { if($('#resourceSearch'))$('#resourceSearch').value='';if($('#resourceSubjectFilter'))$('#resourceSubjectFilter').value='all';if($('#resourceTypeFilter'))$('#resourceTypeFilter').value='all';if($('#resourceSort'))$('#resourceSort').value='name';filterResources(); }
function selectFocusTheme(themeId) {
  const theme=getFocusTheme(themeId);if(!theme)return;
  const before=snapshotStudyState();state.settings.focusTheme=theme.id;state.settings.personalBackground=null;
  if(!saveMutationOrRollback(before))return;clearNextPhoto();
  const preview=$('#pageContent .focus-preview-card');if(preview)preview.dataset.focusTheme=theme.id;
  $$('.focus-theme-card').forEach(button=>{const selected=button.dataset.value===theme.id;button.classList.toggle('is-selected',selected);button.setAttribute('aria-pressed',String(selected));});
  const label=$('#pageContent .focus-theme-panel .section-heading .pill');if(label)label.textContent=`${theme.icon} Đang chọn: ${theme.name}`;
  const previewThemeName=$('#focusPreviewThemeName');if(previewThemeName)previewThemeName.textContent=`${theme.icon} ${theme.name}`;
  const previewSceneLabel=$('#focusPreviewSceneLabel');if(previewSceneLabel)previewSceneLabel.textContent=`${theme.icon} ${theme.name}`;
  const previewSceneCopy=$('#focusPreviewSceneCopy');if(previewSceneCopy)previewSceneCopy.textContent=theme.desc;
  const spotlight=$('#focusSceneSpotlight');if(spotlight)spotlight.innerHTML=focusThemeSpotlightMarkup(theme);
  updateFocusPhotoPreviews();paintNextGalleries();showToast(`Đã chọn bối cảnh “${theme.name}”.`,'success');
}
function focusDailyTasksMarkup() {
  const pending=todayTasks(),completed=completedForDate(todayKey()),total=pending.length+completed.length,done=completed.length,pct=total?Math.round(done/total*100):0;
  const taskRows=[...pending.map(task=>`<button type="button" class="focus-task-item" data-action="focus-toggle-task" data-id="${escapeHtml(task.id)}" title="Đánh dấu hoàn thành"><span class="focus-task-check" aria-hidden="true"></span><span class="focus-task-copy"><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.subject||'Khác')}${task.when?` · ${escapeHtml(task.when)}`:''}</small></span><em class="focus-task-priority priority-${task.priority==='Cao'?'high':task.priority==='Thấp'?'low':'normal'}">${escapeHtml(task.priority||'Vừa')}</em></button>`),...completed.map(task=>`<button type="button" class="focus-task-item is-complete" data-action="focus-restore-task" data-id="${escapeHtml(task.id)}" title="Khôi phục công việc"><span class="focus-task-check" aria-hidden="true">✓</span><span class="focus-task-copy"><strong>${escapeHtml(task.title)}</strong><small>Đã hoàn thành</small></span><span class="focus-task-undo" aria-hidden="true">↶</span></button>`)];
  return `<section class="focus-daily-card"><div class="focus-daily-heading"><div><p class="eyebrow">TODAY'S QUESTS</p><h2>Việc hôm nay</h2></div><span class="focus-daily-counter">${done}/${total}</span></div><div class="focus-daily-progress" role="progressbar" aria-label="Tiến độ nhiệm vụ hôm nay" aria-valuemin="0" aria-valuemax="${Math.max(1,total)}" aria-valuenow="${done}"><span style="width:${pct}%"></span></div><p class="focus-daily-caption">${total?`${done===total?'Đã hoàn thành toàn bộ kế hoạch hôm nay.':`${total-done} việc còn lại · ${pct}% hoàn thành`}`:'Bắt đầu bằng một việc nhỏ nhé.'}</p>${taskRows.length?`<div class="focus-daily-list">${taskRows.join('')}</div>`:`<div class="focus-daily-empty"><span>✦</span><b>Hôm nay chưa có nhiệm vụ</b><small>Thêm nhanh một mục tiêu vào danh sách để dễ theo dõi trong phiên học.</small></div>`}<form class="focus-quick-task" id="focusQuickTaskForm"><input name="title" maxlength="100" aria-label="Nhiệm vụ mới cho hôm nay" placeholder="Thêm nhiệm vụ hôm nay…" required><button type="submit" aria-label="Thêm nhiệm vụ" title="Thêm nhiệm vụ">＋</button></form><p class="focus-daily-footnote">Chạm một việc để hoàn thành · tiến độ được lưu tự động</p></section>`;
}
function refreshFocusDailyTasks() { const board=$('#focusDailyBoard');if(board)board.innerHTML=focusDailyTasksMarkup(); }
function toggleFocusDailyTask(taskId,restore=false) {
  const before=snapshotStudyState();
  if(restore){const index=state.completedTasks.findIndex(task=>task.id===taskId&&task.date===todayKey());if(index<0)return;const [task]=state.completedTasks.splice(index,1);delete task.done;delete task.completedAt;state.tasks.push(task);if(!saveMutationOrRollback(before)){refreshFocusDailyTasks();return;}refreshFocusDailyTasks();showToast('Đã khôi phục nhiệm vụ vào danh sách hôm nay.');return;}
  const index=state.tasks.findIndex(task=>task.id===taskId&&task.date===todayKey());if(index<0)return;const [task]=state.tasks.splice(index,1);task.done=true;task.completedAt=Date.now();if(!task.xpClaimed){state.xp+=5;task.xpClaimed=true;}state.completedTasks.unshift(task);if(!saveMutationOrRollback(before)){refreshFocusDailyTasks();return;}refreshFocusDailyTasks();showToast('Hoàn thành nhiệm vụ hôm nay · +5 XP','success');
}
function addFocusQuickTask(form) {
  const fd=new FormData(form),title=String(fd.get('title')||'').trim();if(!title)return;
  const before=snapshotStudyState();state.tasks.push({id:makeId('task'),title:title.slice(0,100),date:todayKey(),when:'',subject:focusSubject||'Khác',priority:'Vừa',done:false,createdAt:Date.now()});
  if(!saveMutationOrRollback(before)){refreshFocusDailyTasks();return;}form.reset();refreshFocusDailyTasks();showToast('Đã thêm nhiệm vụ vào kế hoạch hôm nay.','success');
}
function readStoredFocusSession(username=currentUsername) {
  if(!username)return null;
  try {
    const value=JSON.parse(localStorage.getItem(focusSessionKey(username))||'null');
    if(!value||value.v!==1||!Number.isFinite(Number(value.initialSeconds))||!Number.isFinite(Number(value.deadline)))return null;
    if(!['focus','review','break'].includes(value.type)||typeof value.owner!=='string')return null;
    return value;
  } catch { return null; }
}
function saveFocusSession() {
  if(!focusStarted||!currentUsername)return false;
  const now=Date.now();
  const remaining=focusPaused?focusRemaining:Math.max(0,Math.ceil((focusDeadline-now)/1000));
  const record={v:1,owner:FOCUS_TAB_ID,subject:focusSubject,type:focusType,ambient:focusAmbient,startedAt:focusStartAt,themeId:$('#focusOverlay')?.dataset.focusTheme||'forest',initialSeconds:focusInitialSeconds,remainingSeconds:remaining,deadline:focusDeadline,paused:focusPaused,updatedAt:now,leaseUntil:now+15000};
  try { localStorage.setItem(focusSessionKey(),JSON.stringify(record));focusLastLeaseAt=now;return true; }
  catch { return false; }
}
function clearFocusSession() {
  try { const stored=readStoredFocusSession();if(!stored||stored.owner===FOCUS_TAB_ID)localStorage.removeItem(focusSessionKey()); } catch(storageError) { console.debug('Focus session lease cleanup was skipped.',storageError); }
}
function setFocusOverlayActive(active) {
  const shell=$('#appShell'),overlay=$('#focusOverlay');
  if(shell)shell.inert=!!active;
  if(overlay)overlay.classList.toggle('active',!!active);if(!active)stopAmbientSounds();
}
function presentFocusSession(themeId,ambient=focusAmbient) {
  const theme=getFocusTheme(themeId);const ambientDetails=getFocusAmbientDetails(ambient);const focusOverlay=$('#focusOverlay');
  focusOverlay.dataset.focusTheme=theme.id;setFocusOverlayActive(true);$('#focusStage').classList.remove('hidden');$('#focusComplete').classList.add('hidden');$('#focusDailyBoard').classList.remove('hidden');refreshFocusDailyTasks();$('#focusSubjectLabel').textContent=`${focusSubject} · ${formatClock(focusInitialSeconds)}`;
  $('#focusHeadline').textContent=focusType==='break'?'Nghỉ ngơi cũng là một phần của tiến bộ.':focusType==='review'?'Gợi nhớ, kết nối và củng cố.':'Dành thời gian cho điều quan trọng.';
  $('#focusQuote').textContent=ambientDetails.quote;
  const hint=$('.focus-key-hint');if(hint)hint.textContent=ambientDetails.hint;
  const insight=$('#focusStageInsight');if(insight)insight.textContent=ambientDetails.insight;
  const modeChip=$('#focusModeChip');if(modeChip)modeChip.textContent=focusModeLabel(focusType);
  const themeChip=$('#focusThemeChip');if(themeChip)themeChip.textContent=`${theme.icon} ${theme.name}`;
  const ambientChip=$('#focusAmbientChip');if(ambientChip)ambientChip.textContent=ambientDetails.label;
  $('#focusPauseBtn').textContent=focusPaused?'▶ Tiếp tục':'Ⅱ Tạm dừng';updateFocusClock();
  applyFocusAppearance(theme.id);renderFocusAppearanceStudio();$('#focusPauseBtn')?.focus({preventScroll:true});
}
function beginFocus(minutes, subject, mode='focus', ambient='gentle', themeId=state?.settings?.focusTheme||'forest') {
  if(focusStarted){showToast('Một phiên Focus Room đang chạy. Hãy tiếp tục hoặc kết thúc phiên hiện tại trước khi bắt đầu phiên mới.','error');return;}
  const existing=readStoredFocusSession();
  if(existing&&existing.owner!==FOCUS_TAB_ID&&Number(existing.leaseUntil)>Date.now()) {showToast('Đã có phiên Focus Room đang chạy ở một tab khác. Hãy quay lại tab đó để tránh ghi nhận trùng.','error');return;}
  const previousState=snapshotStudyState();const mins=clamp(Number(minutes)||25,1,180);focusSubject=String(subject||'Tự học').trim().slice(0,80)||'Tự học';focusType=['focus','review','break'].includes(mode)?mode:'focus';focusAmbient=Object.prototype.hasOwnProperty.call(FOCUS_AMBIENTS,String(ambient||'gentle'))?String(ambient):'gentle';themeId=FOCUS_THEMES.some(theme=>theme.id===themeId)?themeId:'forest';state.settings.focusTheme=themeId;if(!saveMutationOrRollback(previousState))return;focusInitialSeconds=Math.round(mins*60);focusRemaining=focusInitialSeconds;focusStartAt=Date.now();focusDeadline=Date.now()+focusRemaining*1000;focusPaused=false;focusStarted=true;focusStartBackground=null;
  presentFocusSession(themeId,ambient);
  if(!saveFocusSession()){focusStarted=false;focusPaused=false;setFocusOverlayActive(false);showToast('Không thể lưu phiên Focus Room vào thiết bị. Phiên học chưa bắt đầu; hãy giải phóng bộ nhớ rồi thử lại.','error');return;}
  try { const request=document.documentElement.requestFullscreen; if(request) request.call(document.documentElement).catch(error=>console.debug('Fullscreen request was rejected by the browser.',error)); } catch(err){console.debug('Fullscreen unavailable',err);}
  focusTimer=setInterval(tickFocus,400);tickFocus();void playStudioPendingSounds();
}
function restoreFocusSession() {
  const stored=readStoredFocusSession();if(!stored)return;
  if(stored.owner!==FOCUS_TAB_ID&&Number(stored.leaseUntil)>Date.now()) {showToast('Một phiên Focus Room khác vẫn đang chạy ở tab khác. Hãy chuyển về tab đó để tiếp tục.','info');return;}
  focusSubject=String(stored.subject||'Tự học').slice(0,80);focusType=stored.type;focusInitialSeconds=clamp(Number(stored.initialSeconds)||1500,60,10800);focusDeadline=Number(stored.deadline)||Date.now()+Math.max(0,Number(stored.remainingSeconds)||0)*1000;focusPaused=!!stored.paused;focusRemaining=focusPaused?clamp(Number(stored.remainingSeconds)||0,0,focusInitialSeconds):Math.max(0,Math.ceil((focusDeadline-Date.now())/1000));focusStartAt=Number(stored.startedAt)||Number(stored.updatedAt)||Date.now();focusStarted=true;focusStartBackground=null;
  const themeId=FOCUS_THEMES.some(theme=>theme.id===stored.themeId)?stored.themeId:'forest';focusAmbient=Object.prototype.hasOwnProperty.call(FOCUS_AMBIENTS,String(stored.ambient||''))?String(stored.ambient):'gentle';presentFocusSession(themeId,focusAmbient);saveFocusSession();
  if(focusRemaining<=0&&!focusPaused){finishFocus(true);return;}
  focusTimer=setInterval(tickFocus,400);tickFocus();
  showToast('Đã khôi phục phiên Focus Room đang dang dở.','success');
}
function releaseFocusToOtherTab() {
  if(!focusStarted)return;
  // Another tab now owns the lease. Do not record partial minutes here:
  // the new owner will eventually record the whole session exactly once.
  if(focusTimer){clearInterval(focusTimer);focusTimer=null;}
  focusStarted=false;focusPaused=false;setFocusOverlayActive(false);
  try{if(document.fullscreenElement)document.exitFullscreen()?.catch(error=>console.debug('Focus takeover fullscreen exit unavailable.',error));}
  catch(error){console.debug('Focus takeover fullscreen exit unavailable.',error);}
  renderPage(activePage,{recordHistory:false});
  showToast('Phiên Focus Room đã được tiếp quản ở tab khác. Tab này không ghi nhận thời gian trùng lặp.','info');
}
function updateFocusClock() {
  const remaining=Math.max(0,Math.ceil(focusRemaining)),progress=focusInitialSeconds?1-remaining/focusInitialSeconds:1;$('#timerText').textContent=formatClock(remaining);$('#timerCaption').textContent=focusType==='break'?'NGHỈ NGẮN':focusPaused?'TẠM DỪNG':focusType==='review'?'ÔN TẬP':'TẬP TRUNG';$('#timerProgress').style.strokeDashoffset=String(660*progress);$('#timerProgress').style.stroke=focusPaused?'var(--amber)':'var(--cyan)';$('#focusElapsedLabel').textContent=`Đã qua ${fmtMinutes(Math.floor((focusInitialSeconds-remaining)/60))} · Còn ${formatClock(remaining)}`;const preview=$('#previewFocusTime');if(preview)preview.textContent=formatClock(remaining);
}
function tickFocus() {
  if(!focusStarted)return;
  const stored=readStoredFocusSession();
  if(stored&&stored.owner!==FOCUS_TAB_ID){releaseFocusToOtherTab();return;}
  if(Date.now()-focusLastLeaseAt>4000)saveFocusSession();
  if(focusPaused)return;
  focusRemaining=Math.max(0,Math.ceil((focusDeadline-Date.now())/1000));updateFocusClock();if(focusRemaining<=0)finishFocus(true);
}
function pauseFocus() {
  if(!focusStarted)return;const wasPaused=focusPaused,previousRemaining=focusRemaining,previousDeadline=focusDeadline;
  if(!focusPaused){focusRemaining=Math.max(0,Math.ceil((focusDeadline-Date.now())/1000));focusPaused=true;$('#focusPauseBtn').textContent='▶ Tiếp tục';}else{focusDeadline=Date.now()+focusRemaining*1000;focusPaused=false;$('#focusPauseBtn').textContent='Ⅱ Tạm dừng';}
  updateFocusClock();if(!saveFocusSession()){focusPaused=wasPaused;focusRemaining=previousRemaining;focusDeadline=previousDeadline;$('#focusPauseBtn').textContent=focusPaused?'▶ Tiếp tục':'Ⅱ Tạm dừng';updateFocusClock();showToast('Không thể lưu trạng thái phiên Focus Room. Trạng thái trước đó được giữ lại.','error');}
}
function finishFocus(completed) {
  stopAmbientSounds();
  if(!focusStarted)return;clearInterval(focusTimer);focusTimer=null;clearFocusSession();
  const actualSeconds=completed?focusInitialSeconds:Math.max(0,Math.min(focusInitialSeconds,focusInitialSeconds-focusRemaining));const actualMinutes=Math.floor(actualSeconds/60);let persistenceOk=true;
  if(actualMinutes>0){const before=snapshotStudyState();state.sessions.push({id:makeId('session'),date:todayKey(),minutes:actualMinutes,subject:focusSubject,type:focusType,completed:!!completed,createdAt:Date.now()});if(focusType!=='break')logStudyActivity();state.xp+=actualMinutes*(focusType==='break'?0:2);persistenceOk=saveMutationOrRollback(before);if(persistenceOk&&completed)checkAchievements();if(persistenceOk&&focusType!=='break')checkDailyFocusGoal();}
  focusStarted=false;focusPaused=false;$('#focusStage').classList.toggle('hidden',completed);$('#focusDailyBoard').classList.toggle('hidden',completed);$('#focusComplete').classList.toggle('hidden',!completed);$('#focusCompleteText').textContent=!persistenceOk?`Phiên “${focusSubject}” đã kết thúc nhưng không thể lưu tiến trình. Thời lượng và XP chưa được ghi nhận vào dữ liệu.`:completed?`Bạn đã hoàn thành ${fmtMinutes(actualMinutes)} cho “${focusSubject}”. ${actualMinutes?`+${actualMinutes*(focusType==='break'?0:2)} XP đã được ghi nhận.`:'Phiên nghỉ ngơi đã hoàn thành.'}`:`Đã ghi nhận ${fmtMinutes(actualMinutes)} trong phiên “${focusSubject}”.`;
  if(completed&&persistenceOk)browserNotify(focusType==='break'?'Giờ nghỉ đã kết thúc ✦':'Focus Room hoàn thành ✦',focusType==='break'?'Bạn đã nghỉ xong. Khi sẵn sàng, hãy quay lại mục tiêu tiếp theo.':`Bạn đã dành ${fmtMinutes(actualMinutes)} cho ${focusSubject}. Hãy nghỉ một chút trước phiên tiếp theo.`, 'pomodoroBreak',{action:'focus',actionLabel:'Mở Focus Room'});else if(!completed&&actualMinutes>0&&persistenceOk)showToast(`Đã lưu ${fmtMinutes(actualMinutes)} học tập.`,'success');updateFocusClock();
  if(!completed){setFocusOverlayActive(false);try{if(document.fullscreenElement)document.exitFullscreen().catch(error=>console.debug('Could not exit fullscreen after Focus Room.',error));}catch(fullscreenError){console.debug('Fullscreen exit is unavailable.',fullscreenError);}renderPage(activePage);}
}
function closeFocus() {setFocusOverlayActive(false);$('#focusDailyBoard').classList.add('hidden');try{if(document.fullscreenElement)document.exitFullscreen().catch(error=>console.debug('Could not exit fullscreen after Focus Room.',error));}catch(fullscreenError){console.debug('Fullscreen exit is unavailable.',fullscreenError);}renderPage('dashboard');}
function stopFocus(manual=true) { if(!focusStarted){setFocusOverlayActive(false);return;}finishFocus(false); }
function visibleBuiltinQuizzes() { const hidden=new Set(state?.hiddenBuiltinQuizzes||[]);return BUILTIN_QUIZZES.filter(q=>!hidden.has(q.id)); }
function resolveQuiz(id) { return [...visibleBuiltinQuizzes(),...(state.customQuizzes||[])].find(q=>q.id===id)||null; }
function startQuiz(id, options={}) {
  const quiz=resolveQuiz(id);if(!quiz)return showToast('Không tìm thấy bộ quiz này.','error');
  const questions=(quiz.questions||[]).filter(q=>q&&typeof q.question==='string');if(!questions.length)return showToast('Bộ quiz này chưa có câu hỏi hợp lệ.','error');
  activeQuiz={id,title:options.title||quiz.title,subject:quiz.subject||'Khác',questions:questions.map(q=>({...q,type:q.type||'multiple-choice',options:Array.isArray(q.options)?[...q.options]:[],answers:Array.isArray(q.answers)?[...q.answers]:[],acceptedAnswers:Array.isArray(q.acceptedAnswers)?[...q.acceptedAnswers]:[]})),origin:options.sprint?'sprint':'quiz'};
  quizResponses=[];quizIndex=0;quizScore=0;quizSelected=null;quizTextAnswer='';quizLocked=false;renderQuizPlayer();
}
function renderQuizPlayer() {
  activePage='quiz';$('#pageCrumb').textContent='Quiz Lab';$$('.nav-token[data-page]').forEach(n=>n.classList.toggle('active',n.dataset.page==='quiz'));$('#pageContent').innerHTML=renderQuizQuestion();$('#pageContent').focus({preventScroll:true});
}
function renderQuizQuestion() {
  if(!activeQuiz)return renderQuizLab();const total=activeQuiz.questions.length;
  if(quizIndex>=total){const percent=total?Math.round(quizScore/total*100):0;return `<div class="quiz-workspace"><div class="page-heading"><div><p class="eyebrow">QUIZ RESULT</p><h1>Kết quả của bạn</h1><p>${escapeHtml(activeQuiz.title)}</p></div><div class="page-heading-actions">${activeQuiz.resultSaved===false?'<span class="pill pill-amber">XP chưa lưu</span>':`<span class="pill pill-cyan">+${quizScore*5+15} XP</span>`}</div></div><section class="surface quiz-result"><div class="complete-orb">${percent>=80?'✦':percent>=50?'🌱':'↻'}</div><div class="quiz-result-score">${percent}%</div><h2>${percent>=80?'Rất tốt! Tiếp tục phát huy.':percent>=50?'Bạn đang tiến bộ.':'Một lượt ôn tập hữu ích.'}</h2><p>${activeQuiz.resultSaved===false?'Kết quả đang hiển thị tạm thời vì chưa lưu được lịch sử hoặc XP. Hãy kiểm tra dung lượng và xuất bản sao lưu. ':''}Bạn trả lời đúng ${quizScore}/${total} câu. Hãy xem lại giải thích trước khi làm lại.</p><div class="tag-list" style="justify-content:center;margin-bottom:20px"><span class="pill">${quizScore}/${total} câu đúng</span><span class="pill">${escapeHtml(activeQuiz.subject)}</span>${activeQuiz.resultSaved===false?'<span class="pill pill-amber">Chưa ghi nhận XP</span>':`<span class="pill pill-cyan">+${quizScore*5+15} XP</span>`}</div><div class="quiz-result-actions"><button class="button button-primary" data-action="retry-quiz">Làm lại quiz ↻</button><button class="button button-ghost" data-action="navigate" data-page="quiz">Về Quiz Lab</button></div></section></div>`;}
  const q=activeQuiz.questions[quizIndex],type=q.type||'multiple-choice',letters=['A','B','C','D'],selectedSet=new Set(Array.isArray(quizSelected)?quizSelected:[]);
  let answerMarkup='';
  if(type==='short-answer'||type==='fill-blank'){
    answerMarkup=`<div class="quiz-text-answer-wrap"><label for="quizTextAnswer">${type==='fill-blank'?'Điền phần còn thiếu':'Câu trả lời của bạn'}</label><input class="field quiz-text-answer" id="quizTextAnswer" maxlength="500" placeholder="Nhập câu trả lời…" value="${escapeHtml(typeof quizSelected==='string'?quizSelected:quizTextAnswer)}" ${quizLocked?'disabled':''}><button class="button button-primary" data-action="submit-quiz-text" ${quizLocked?'disabled':''}>Chấm câu trả lời</button></div>`;
  } else {
    answerMarkup=`<div class="quiz-option-grid ${type==='multiple-select'?'is-multi-select':''}">${(q.options||[]).map((opt,i)=>{const correct=(type==='multiple-select'?(q.answers||[]).includes(i):i===q.answer),picked=type==='multiple-select'?selectedSet.has(i):quizSelected===i;let cls=picked?'selected':'';if(quizLocked&&correct)cls='correct';else if(quizLocked&&picked&&!correct)cls='incorrect';return `<button class="quiz-option ${cls}" data-action="quiz-answer" data-index="${i}" ${quizLocked?'disabled':''} aria-pressed="${picked}"><span class="option-letter">${type==='true-false'?(i===0?'✓':'×'):letters[i]}</span><span>${escapeHtml(opt)}</span>${quizLocked&&correct?'<span class="quiz-option-mark">✓</span>':''}</button>`;}).join('')}</div>${type==='multiple-select'&&!quizLocked?`<div class="quiz-multi-submit"><small>Chọn mọi đáp án đúng. Chỉ đúng khi cả tập hợp lựa chọn trùng khớp.</small><button class="button button-primary" data-action="submit-quiz-multi">Kiểm tra lựa chọn</button></div>`:''}`;
  }
  const correct=isQuizQuestionCorrect(q,quizSelected);
  return `<div class="quiz-workspace"><div class="page-heading"><div><p class="eyebrow">${activeQuiz.origin==='sprint'?'⚡ BRAIN SPRINT':'QUIZ IN PROGRESS'}</p><h1>${escapeHtml(activeQuiz.title)}</h1><p>${escapeHtml(quizQuestionTypeLabel(type))} · ${type==='multiple-select'?'Chọn tất cả đáp án phù hợp.':type==='short-answer'||type==='fill-blank'?'Nhập câu trả lời, sau đó kiểm tra.':'Chọn đáp án phù hợp nhất.'}</p></div><div class="page-heading-actions"><button class="button button-ghost button-small" data-action="exit-quiz">Thoát quiz</button></div></div><section class="surface surface-pad quiz-player-surface"><div class="quiz-player-meta"><span class="pill">${escapeHtml(activeQuiz.subject)}</span><span class="text-muted">Câu ${quizIndex+1} / ${total}</span><span class="quiz-type-tag">${escapeHtml(quizQuestionTypeLabel(type))}</span></div><div class="quiz-progress-line"><span style="width:${(quizIndex+1)/total*100}%"></span></div><h2 class="quiz-question">${escapeHtml(q.question)}</h2>${answerMarkup}${quizLocked?`<div class="quiz-feedback"><strong class="${correct?'quiz-correct-text':'quiz-wrong-text'}">${correct?'Chính xác!':'Chưa đúng — hãy xem lại đáp án.'}</strong>${type==='short-answer'||type==='fill-blank'?`<p>Đáp án chuẩn: <b>${escapeHtml(q.correctAnswer||'')}</b>${q.acceptedAnswers?.length?` · Chấp nhận thêm: ${escapeHtml(q.acceptedAnswers.join(', '))}`:''}</p>`:type==='multiple-select'?`<p>Đáp án đúng: <b>${escapeHtml((q.answers||[]).map(i=>q.options[i]).join(' + '))}</b></p>`:''}${q.explanation?`<p>${escapeHtml(q.explanation)}</p>`:''}</div>`:''}<div class="form-actions quiz-next-row"><span class="text-muted">Điểm hiện tại: ${quizScore}</span><button class="button button-primary" data-action="quiz-next" ${!quizLocked?'disabled':''}>${quizIndex===total-1?'Xem kết quả':'Câu tiếp theo'} ↗</button></div></section></div>`;
}
function recordCurrentQuizResponse(response){if(!activeQuiz)return;const q=activeQuiz.questions[quizIndex];if(!q)return;const type=q.type||'multiple-choice';let correctAnswer='';if(type==='short-answer'||type==='fill-blank')correctAnswer=q.correctAnswer||'';else if(type==='multiple-select')correctAnswer=(q.answers||[]).map(i=>q.options?.[i]).filter(Boolean).join(' + ');else correctAnswer=q.options?.[q.answer]||'';quizResponses[quizIndex]={id:q.id||`${activeQuiz.id||'quiz'}-${quizIndex}`,question:String(q.question||'').slice(0,1000),type,subject:q.subject||activeQuiz.subject||'Khác',response:Array.isArray(response)?response.slice(0,20):String(response??'').slice(0,1000),correct:isQuizQuestionCorrect(q,response),correctAnswer:String(correctAnswer).slice(0,1000),correctAnswerValue:String(q.correctAnswer||'').slice(0,300),answer:Number.isInteger(q.answer)?q.answer:undefined,answers:Array.isArray(q.answers)?q.answers.slice(0,20):[],options:Array.isArray(q.options)?q.options.map(x=>String(x).slice(0,1000)):[],acceptedAnswers:Array.isArray(q.acceptedAnswers)?q.acceptedAnswers.slice(0,20):[],explanation:String(q.explanation||'').slice(0,1200),sourceId:activeQuiz.id||'quiz'};}
function answerQuiz(index) {
  if(!activeQuiz||quizLocked)return;const q=activeQuiz.questions[quizIndex];if(!q)return;
  if((q.type||'multiple-choice')==='multiple-select'){
    if(!Number.isInteger(index)||index<0||index>=(q.options||[]).length)return;
    const selected=Array.isArray(quizSelected)?[...quizSelected]:[];quizSelected=selected.includes(index)?selected.filter(v=>v!==index):[...selected,index];renderQuizPlayer();return;
  }
  if(!Number.isInteger(index)||index<0||index>=(q.options||[]).length)return;
  quizSelected=index;quizLocked=true;if(isQuizQuestionCorrect(q,index))quizScore++;recordCurrentQuizResponse(quizSelected);renderQuizPlayer();
}
function submitQuizTextAnswer(){
  if(!activeQuiz||quizLocked)return;const q=activeQuiz.questions[quizIndex],value=String($('#quizTextAnswer')?.value??quizTextAnswer).trim();
  if(!value)return showToast('Hãy nhập câu trả lời trước khi chấm.','error');quizTextAnswer=value;quizSelected=value;quizLocked=true;if(isQuizQuestionCorrect(q,value))quizScore++;recordCurrentQuizResponse(quizSelected);renderQuizPlayer();
}
function submitQuizMultiAnswer(){
  if(!activeQuiz||quizLocked)return;const q=activeQuiz.questions[quizIndex];if((q.type||'multiple-choice')!=='multiple-select')return;
  if(!Array.isArray(quizSelected)||!quizSelected.length)return showToast('Hãy chọn ít nhất một đáp án rồi mới chấm.','error');quizLocked=true;if(isQuizQuestionCorrect(q,quizSelected))quizScore++;recordCurrentQuizResponse(quizSelected);renderQuizPlayer();
}
function nextQuizQuestion() { if(!quizLocked)return;quizIndex++;quizSelected=null;quizTextAnswer='';quizLocked=false;if(quizIndex>=activeQuiz.questions.length){const total=activeQuiz.questions.length,before=snapshotStudyState();state.attempts.unshift({id:makeId('attempt'),title:activeQuiz.title,subject:activeQuiz.subject,score:quizScore,total,createdAt:Date.now(),responses:quizResponses.filter(Boolean).map(r=>({...r,response:Array.isArray(r.response)?[...r.response]:r.response})).slice(0,100)});state.attempts=state.attempts.slice(0,1000);logStudyActivity();state.xp+=quizScore*5+15;if(saveMutationOrRollback(before)){checkAchievements();}else{activeQuiz.resultSaved=false;}}else if(quizIndex<activeQuiz.questions.length){activeQuiz.resultSaved=true;}renderQuizPlayer(); }
function startBrainSprint() {
  // A legacy short-answer question may have no options; never spread an undefined array.
  const options=[...visibleBuiltinQuizzes(),...(state?.customQuizzes||[])].filter(q=>Array.isArray(q?.questions)&&q.questions.some(examQuestionValid));
  if(!options.length)return showToast('Chưa có câu hỏi hợp lệ để chơi Brain Sprint.','warning');
  const questions=options.flatMap(quiz=>quiz.questions.filter(examQuestionValid).map(question=>({
    ...question,type:question.type||'multiple-choice',options:Array.isArray(question.options)?[...question.options]:[],
    answers:Array.isArray(question.answers)?[...question.answers]:[],
    acceptedAnswers:Array.isArray(question.acceptedAnswers)?[...question.acceptedAnswers]:[],
    subject:question.subject||quiz.subject||'Khác'
  })));
  for(let i=questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]];}
  activeQuiz={id:'sprint-mix',title:'Brain Sprint · 10 câu',subject:'Hỗn hợp',questions:questions.slice(0,10),origin:'sprint'};quizResponses=[];quizIndex=0;quizScore=0;quizSelected=null;quizTextAnswer='';quizLocked=false;renderQuizPlayer();
}
function retryQuiz() { if(!activeQuiz)return;if(activeQuiz.origin==='sprint')startBrainSprint();else startQuiz(activeQuiz.id); }
function moveFlash(offset) { const deck=flashcardDeck();if(!deck.length)return;flashIndex=(flashIndex+offset+deck.length)%deck.length;flashRevealed=false;renderPage('flashcards'); }
function rateFlash(grade) {
  const deck=flashcardDeck(),card=deck[flashIndex];if(!card)return;if(!flashRevealed)return showToast('Hãy lật thẻ và đọc mặt sau trước khi tự đánh giá.','error');
  let schedule;try{schedule=srsSchedule(card,grade);}catch(err){return showToast(err.message,'error');}
  const before=snapshotStudyState();
  Object.assign(card,schedule,{box:Math.min(5,schedule.repetitions),lastReviewedAt:Date.now()});card.reviewHistory=[...(card.reviewHistory||[]),{at:card.lastReviewedAt,grade,dueAt:schedule.dueAt,intervalDays:schedule.intervalDays}].slice(-300);
  state.flashReviews++;state.xp+=grade==='again'?1:grade==='hard'?2:grade==='good'?3:4;logStudyActivity();if(!saveMutationOrRollback(before))return;checkAchievements();checkFlashChallengeProgress();flashIndex=0;flashRevealed=false;renderPage('flashcards');
  const dueText=grade==='again'?'sẽ quay lại sau 10 phút':`lịch ôn tiếp theo: ${reviewDelayLabel(schedule.dueAt-Date.now())}`;showToast(`Đã lưu đánh giá “${({again:'Lại',hard:'Khó',good:'Tốt',easy:'Dễ'})[grade]}” · ${dueText}.`,'success');
}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(typeof reader.result==='string'?reader.result:'');reader.onerror=()=>reject(reader.error||new Error('Không đọc được ảnh đã xử lý.'));reader.readAsDataURL(blob);});}
async function handleAvatarFile(file){
  if(!file)return;
  const allowed=new Set(['image/jpeg','image/png','image/webp']);
  if(!allowed.has(file.type)){showToast('Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP. SVG và các định dạng khác bị từ chối.','error');return;}
  if(file.size<=0||file.size>5*1024*1024){showToast('Ảnh phải có dung lượng lớn hơn 0 và không vượt quá 5 MB.','error');return;}
  let bitmap=null;
  try{
    if(typeof createImageBitmap!=='function')throw new Error('Trình duyệt chưa hỗ trợ xử lý ảnh an toàn.');
    bitmap=await createImageBitmap(file);
    if(!bitmap.width||!bitmap.height||bitmap.width>12000||bitmap.height>12000)throw new Error('Kích thước ảnh không hợp lệ.');
    const maxSide=512,scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Không khởi tạo được bộ xử lý ảnh.');
    ctx.fillStyle='#f4f5f7';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    let blob=null;for(const quality of [.84,.76,.66,.56,.46]){blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(blob&&blob.size<=430000)break;}
    if(!blob||blob.size>430000){canvas.width=Math.max(1,Math.round(canvas.width*.72));canvas.height=Math.max(1,Math.round(canvas.height*.72));const retry=document.createElement('canvas');retry.width=canvas.width;retry.height=canvas.height;const rctx=retry.getContext('2d',{alpha:false});if(!rctx)throw new Error('Không thể thu nhỏ ảnh.');rctx.fillStyle='#f4f5f7';rctx.fillRect(0,0,retry.width,retry.height);rctx.drawImage(bitmap,0,0,retry.width,retry.height);blob=await new Promise(resolve=>retry.toBlob(resolve,'image/jpeg',.68));}
    if(!blob||blob.size>430000)throw new Error('Ảnh vẫn quá lớn sau khi thu nhỏ. Hãy thử ảnh khác.');
    const dataUrl=await blobToDataUrl(blob);if(!isSafeAvatarImageData(dataUrl))throw new Error('Ảnh sau xử lý không có định dạng hợp lệ.');
    pendingAvatarDataUrl=dataUrl;renderPage('profile',{recordHistory:false});showToast('Đã tạo ảnh xem trước. Chọn “Áp dụng ảnh” để lưu vào hồ sơ.','success');
  }catch(err){showToast(err?.message||'Không thể xử lý ảnh. Hãy chọn một tệp ảnh hợp lệ khác.','error');}
  finally{bitmap?.close?.();}
}
function commitAvatarImage(dataUrl){
  if(!isSafeAvatarImageData(dataUrl)){showToast('Ảnh xem trước không hợp lệ. Chưa có thay đổi nào được lưu.','error');return false;}
  const before=snapshotStudyState();let usersBefore,users;
  try{usersBefore=readUsers();users=JSON.parse(JSON.stringify(usersBefore));}catch(err){showToast(authStorageError(err,'Không thể đọc hồ sơ tài khoản.'),'error');return false;}
  state.profile.avatarImage=dataUrl;if(Object.hasOwn(users,currentUsername))users[currentUsername].avatarImage=dataUrl;
  try{writeUsers(users);}catch(err){state=JSON.parse(before);showToast('Không thể lưu ảnh vào hồ sơ cục bộ. Dữ liệu cũ vẫn được giữ.','error');console.error(err);return false;}
  if(!saveMutationOrRollback(before)){try{writeUsers(usersBefore);}catch(err){console.error('Could not roll back avatar metadata:',err);}return false;}
  pendingAvatarDataUrl=null;renderPage('profile',{recordHistory:false});showToast('Đã áp dụng và lưu ảnh đại diện trên thiết bị này.','success');return true;
}
function clearAvatarImage(){
  const before=snapshotStudyState();let usersBefore,users;
  try{usersBefore=readUsers();users=JSON.parse(JSON.stringify(usersBefore));}catch(err){showToast(authStorageError(err,'Không thể đọc hồ sơ tài khoản.'),'error');return;}
  state.profile.avatarImage=null;if(Object.hasOwn(users,currentUsername))users[currentUsername].avatarImage=null;
  try{writeUsers(users);}catch(err){state=JSON.parse(before);showToast('Không thể cập nhật hồ sơ cục bộ.','error');console.error(err);return;}
  if(!saveMutationOrRollback(before)){try{writeUsers(usersBefore);}catch(err){console.error('Could not roll back avatar metadata:',err);}return;}
  pendingAvatarDataUrl=null;renderPage('profile',{recordHistory:false});showToast('Đã chuyển về biểu tượng đại diện.','success');
}
function pickAvatar(avatar) {
  if(!AVATARS.includes(avatar))return;
  const before=snapshotStudyState();let usersBefore,users;
  try{usersBefore=readUsers();users=JSON.parse(JSON.stringify(usersBefore));}
  catch(err){showToast(authStorageError(err,'Không thể đọc hồ sơ tài khoản. Dữ liệu chưa thay đổi.'),'error');return;}
  pendingAvatarDataUrl=null;state.profile.avatar=avatar;state.profile.avatarImage=null;if(Object.hasOwn(users,currentUsername)){users[currentUsername].avatar=avatar;users[currentUsername].avatarImage=null;}
  try{writeUsers(users);}catch(err){state=JSON.parse(before);showToast('Không thể lưu biểu tượng đại diện vào hồ sơ trên trình duyệt này.','error');console.error(err);return;}
  if(!saveMutationOrRollback(before)){
    try{writeUsers(usersBefore);}catch(err){console.error('Could not roll back user profile metadata:',err);}
    return;
  }
  renderPage(activePage);
}
function applySetting(key,value) {
  if(!(key in state.settings))return;
  if(key==='accent'&&!Object.hasOwn(ACCENT_PRESETS,value)&&value!=='custom')return;
  if(key==='theme'&&!['light','dark'].includes(value))return;
  if(key==='fontSize'&&!['small','medium','large'].includes(value))return;
  const before=snapshotStudyState();state.settings[key]=value;
  if(!saveMutationOrRollback(before))return;
  applySettings();renderPage(activePage,{recordHistory:false});
}
function saveCustomAccent(raw){
  const hex=normalizeAccentHex(raw);
  if(!hex){showToast('Mã màu không hợp lệ. Hãy nhập đúng dạng #RRGGBB, ví dụ #6595E9.','error');$('#customAccentHex')?.focus();return;}
  const before=snapshotStudyState();state.settings.customAccent=hex;state.settings.accent='custom';
  if(!saveMutationOrRollback(before))return;
  applySettings();renderPage('settings',{recordHistory:false});showToast('Đã áp dụng và lưu màu tùy chỉnh.','success');
}
function resetAppearance(){
  const before=snapshotStudyState();Object.assign(state.settings,{theme:'dark',accent:'cyan',customAccent:DEFAULT_CUSTOM_ACCENT,fontFamily:'system',fontSize:'medium'});
  if(!saveMutationOrRollback(before))return;
  applySettings();renderPage('settings',{recordHistory:false});showToast('Đã khôi phục màu, chế độ hiển thị và phông chữ mặc định.','success');
}
function exportData() {
  try {
    const payload={app:APP_NAME,version:2,exportedAt:new Date().toISOString(),username:currentUsername,studyData:state};
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`lumevia-backup-${currentUsername}-${todayKey()}.json`;document.body.appendChild(a);a.click();a.remove();
    // Keep the object URL alive through the browser's asynchronous download start.
    setTimeout(()=>URL.revokeObjectURL(url),1500);showToast('Đã tạo tệp sao lưu JSON.','success');
  } catch(err) { console.error('Backup export failed:',err);showToast('Không thể tạo tệp sao lưu. Hãy thử lại hoặc kiểm tra dung lượng bộ nhớ.','error'); }
}
function exportNotesMarkdown() {
  const notes=[...state.notes].sort((a,b)=>(Number(!!b.pinned)-Number(!!a.pinned))||(b.updatedAt||0)-(a.updatedAt||0));
  const date=new Date().toLocaleString('vi-VN');const body=[`# LUMEVIA StudyOS — Sổ ghi chú`,``,`Xuất từ tài khoản cục bộ **@${currentUsername}** · ${date}`,``,`Số ghi chú: ${notes.length}`,``,...notes.flatMap((note,index)=>[`---`,``,`## ${index+1}. ${note.title||'Ghi chú không tiêu đề'}`,``,`- **Môn/chủ đề:** ${note.subject||'Khác'}`,`- **Từ khóa:** ${note.tags||'—'}`,`- **Ghim:** ${note.pinned?'Có':'Không'}`,`- **Cập nhật:** ${new Date(note.updatedAt||Date.now()).toLocaleString('vi-VN')}`,``,String(note.content||''),``])].join('\n');
  const blob=new Blob(['\ufeff',body],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`lumevia-notes-${todayKey()}.md`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Đã xuất sổ ghi chú thành tệp Markdown (.md).','success');
}
const BACKUP_IMPORT_MAX_BYTES=12*1024*1024;
const BACKUP_ARRAY_LIMITS={tasks:3000,completedTasks:3000,notes:2000,documents:500,resources:1500,flashDecks:500,flashcards:10000,customQuizzes:300,attempts:10000,sessions:20000,studyDays:10000,notificationHistory:150,deletedItems:500,reminderKeys:600,notificationReadIds:200,notifiedTaskKeys:300,examQuestionBank:5000,examSessions:100,examIntegrityRecords:200,examIntegrityEvents:500};
function validateBackupState(incoming){
  if(!incoming||typeof incoming!=='object'||Array.isArray(incoming))throw new Error('Dữ liệu sao lưu không phải một đối tượng hợp lệ.');
  const required=['tasks','resources','flashcards','customQuizzes','sessions','attempts'];
  for(const key of required)if(!Array.isArray(incoming[key]))throw new Error(`Bản sao lưu thiếu danh sách “${key}” hoặc có cấu trúc sai.`);
  for(const [key,limit] of Object.entries(BACKUP_ARRAY_LIMITS)){
    if(incoming[key]!==undefined&&(!Array.isArray(incoming[key])||incoming[key].length>limit))throw new Error(`Danh sách “${key}” không hợp lệ hoặc vượt giới hạn an toàn (${limit} mục).`);
  }
  for(const key of ['profile','settings','notificationPrefs'])if(incoming[key]!==undefined&&(!incoming[key]||typeof incoming[key]!=='object'||Array.isArray(incoming[key])))throw new Error(`Phần “${key}” trong bản sao lưu không hợp lệ.`);
  if(incoming.profile){if(incoming.profile.displayName!==undefined&&(typeof incoming.profile.displayName!=='string'||incoming.profile.displayName.trim().length<2||incoming.profile.displayName.length>32))throw new Error('Tên hiển thị trong bản sao lưu cần từ 2 đến 32 ký tự.');if(incoming.profile.avatar!==undefined&&(typeof incoming.profile.avatar!=='string'||incoming.profile.avatar.length>16))throw new Error('Biểu tượng đại diện trong bản sao lưu không hợp lệ.');if(incoming.profile.avatarImage!==undefined&&incoming.profile.avatarImage!==null&&!isSafeAvatarImageData(incoming.profile.avatarImage))throw new Error('Ảnh đại diện trong bản sao lưu không hợp lệ hoặc vượt giới hạn an toàn.');}
  if(incoming.settings){const settings=incoming.settings;if(settings.fontFamily!==undefined&&!Object.hasOwn(WEB_FONTS,settings.fontFamily))throw new Error('Phông chữ trong bản sao lưu không hợp lệ.');if(settings.theme!==undefined&&!['dark','light'].includes(settings.theme))throw new Error('Chế độ giao diện trong bản sao lưu không hợp lệ.');if(settings.accent!==undefined&&settings.accent!=='custom'&&!Object.hasOwn(ACCENT_PRESETS,settings.accent))throw new Error('Màu nhấn trong bản sao lưu không hợp lệ.');if(settings.customAccent!==undefined&&!normalizeAccentHex(settings.customAccent))throw new Error('Mã màu tùy chỉnh trong bản sao lưu không hợp lệ.');if(settings.fontSize!==undefined&&!['small','medium','large'].includes(settings.fontSize))throw new Error('Cỡ chữ trong bản sao lưu không hợp lệ.');if(settings.defaultSubject!==undefined&&!SUBJECTS.includes(settings.defaultSubject))throw new Error('Môn học mặc định trong bản sao lưu không hợp lệ.');if(settings.flashDeckListCollapsed!==undefined&&(!settings.flashDeckListCollapsed||typeof settings.flashDeckListCollapsed!=='object'||Array.isArray(settings.flashDeckListCollapsed)||Object.entries(settings.flashDeckListCollapsed).length>200||Object.entries(settings.flashDeckListCollapsed).some(([key,value])=>key.length>180||typeof value!=='boolean')))throw new Error('Trạng thái thu gọn danh sách thẻ trong bản sao lưu không hợp lệ.');if(settings.focusTheme!==undefined&&!FOCUS_THEMES.some(theme=>theme.id===settings.focusTheme)){if(['cosmos','sakura','alpine','library','cyber','monsoon','dune','ember','zen','loft'].includes(settings.focusTheme))settings.focusTheme='forest';else throw new Error('Bối cảnh Focus Room trong bản sao lưu không hợp lệ.');}for(const key of ['reduceMotion','stickers','notifications','taskReminders','notificationPreferencesCollapsed','notificationUpdatesCollapsed','notificationStatusCollapsed','quietHoursEnabled','bubbleNotifications'])if(settings[key]!==undefined&&typeof settings[key]!=='boolean')throw new Error(`Thiết lập “${key}” trong bản sao lưu không hợp lệ.`);if(settings.dailyFocusGoal!==undefined&&![30,60,90,120,180,240].includes(Number(settings.dailyFocusGoal)))throw new Error('Mục tiêu thời gian học không hợp lệ.');if(settings.wellnessThreshold!==undefined&&![30,50,75,90].includes(Number(settings.wellnessThreshold)))throw new Error('Mốc nhắc nghỉ không hợp lệ.');if(settings.wellnessSnoozedUntil!==undefined&&(!Number.isFinite(Number(settings.wellnessSnoozedUntil))||Number(settings.wellnessSnoozedUntil)<0))throw new Error('Trạng thái tạm hoãn không hợp lệ.');for(const key of ['quietHoursStart','quietHoursEnd'])if(settings[key]!==undefined&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(settings[key]))throw new Error(`Khung giờ “${key}” trong bản sao lưu không hợp lệ.`);}
  const record=(value)=>!!value&&typeof value==='object'&&!Array.isArray(value);
  const text=(value,max=10000)=>typeof value==='string'&&value.length<=max;
  const date=(value)=>{if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const [year,month,day]=value.split('-').map(Number),parsed=new Date(Date.UTC(year,month-1,day));return parsed.getUTCFullYear()===year&&parsed.getUTCMonth()===month-1&&parsed.getUTCDate()===day;};
  const checkRecords=(key,validator,description)=>{const values=incoming[key];if(values===undefined)return;if(!Array.isArray(values))throw new Error(`Danh sách “${key}” không hợp lệ.`);const ids=new Set();for(let i=0;i<values.length;i++){const item=values[i];if(!record(item)||!validator(item))throw new Error(`Mục số ${i+1} trong “${key}” không hợp lệ (${description}). Không có dữ liệu nào được nhập.`);if(typeof item.id==='string'){if(ids.has(item.id))throw new Error(`Danh sách “${key}” có ID trùng lặp. Hãy xuất bản sao lưu mới hơn hoặc sửa tệp trước khi nhập.`);ids.add(item.id);}}};
  checkRecords('tasks',x=>text(x.id,120)&&x.id.trim()&&text(x.title,240)&&x.title.trim()&&date(x.date)&&(x.when===undefined||x.when===''||/^([01]\d|2[0-3]):[0-5]\d$/.test(x.when))&&(x.priority===undefined||['Cao','Vừa','Thấp','Khẩn cấp'].includes(x.priority))&&(x.subject===undefined||text(x.subject,40))&&(x.reminders===undefined||Array.isArray(x.reminders)&&x.reminders.length<=3&&x.reminders.every(v=>[1440,180,30].includes(v))),'cần ID, tiêu đề, ngày, giờ và nhắc việc hợp lệ');
  checkRecords('completedTasks',x=>text(x.id,120)&&x.id.trim()&&text(x.title,240)&&x.title.trim()&&date(x.date)&&(x.subject===undefined||text(x.subject,40)),'cần ID, tiêu đề và ngày hợp lệ');
  checkRecords('notes',x=>text(x.id,120)&&x.id.trim()&&text(x.title,160)&&text(x.content,40000)&&(x.tags===undefined||text(x.tags,180)),'cần ID, tiêu đề, nội dung và từ khóa dạng văn bản');
  checkRecords('documents',x=>text(x.id,120)&&x.id.trim()&&text(x.title,160)&&text(x.content,120000)&&(x.tags===undefined||text(x.tags,180)),'cần ID, tiêu đề, nội dung và thẻ dạng văn bản');
  checkRecords('resources',x=>text(x.id,120)&&x.id.trim()&&text(x.title,100)&&x.title.trim()&&text(x.url,2048)&&!!safeHttpUrl(x.url)&&(x.tags===undefined||Array.isArray(x.tags)&&x.tags.length<=8&&x.tags.every(tag=>text(tag,40)) )&&(x.description===undefined||text(x.description,260))&&(x.subject===undefined||SUBJECTS.includes(x.subject))&&(x.type===undefined||RESOURCE_TYPES.includes(x.type)),'cần ID, tên, URL HTTP(S), thẻ và mô tả hợp lệ');
  if(incoming.flashDecks!==undefined){checkRecords('flashDecks',x=>text(x.id,120)&&x.id.trim()&&text(x.name,80)&&x.name.trim()&&SUBJECTS.includes(x.subject),'cần mã, tên bộ thẻ và môn học hợp lệ');if(new Set(incoming.flashDecks.map(x=>x.id)).size!==incoming.flashDecks.length)throw new Error('Bộ thẻ bị trùng ID.');}
  checkRecords('flashcards',x=>text(x.id,120)&&x.id.trim()&&text(x.front,2000)&&x.front.trim()&&text(x.back,5000)&&x.back.trim()&&(x.reviewHistory===undefined||Array.isArray(x.reviewHistory)&&x.reviewHistory.length<=1000),'cần ID, mặt trước/mặt sau và lịch sử ôn hợp lệ');
  checkRecords('customQuizzes',x=>text(x.id,120)&&x.id.trim()&&text(x.title,80)&&x.title.trim()&&Array.isArray(x.questions)&&x.questions.length>0&&x.questions.length<=100&&x.questions.every(q=>{if(!record(q)||!text(q.question,500)||!q.question.trim()||!['multiple-choice','true-false','multiple-select','short-answer','fill-blank',undefined].includes(q.type))return false;const type=q.type||'multiple-choice';if(type==='short-answer'||type==='fill-blank')return text(q.correctAnswer,300)&&q.correctAnswer.trim()&&(q.acceptedAnswers===undefined||Array.isArray(q.acceptedAnswers)&&q.acceptedAnswers.every(a=>text(a,300)))&&(q.options===undefined||Array.isArray(q.options));if(type==='true-false')return Array.isArray(q.options)&&q.options.length===2&&q.options.every(o=>text(o,500)&&o.trim())&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<2;if(type==='multiple-select')return Array.isArray(q.options)&&q.options.length===4&&q.options.every(o=>text(o,500)&&o.trim())&&Array.isArray(q.answers)&&q.answers.length>0&&q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<4);return Array.isArray(q.options)&&q.options.length===4&&q.options.every(o=>text(o,500)&&o.trim())&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4;})&& (x.description===undefined||text(x.description,160)),'cần câu hỏi và cấu trúc đáp án tương ứng với dạng câu hỏi');
  checkRecords('sessions',x=>text(x.id,120)&&date(x.date)&&Number.isFinite(Number(x.minutes))&&Number(x.minutes)>=0&&Number(x.minutes)<=1440,'cần ngày và thời lượng hợp lệ');
  checkRecords('attempts',x=>text(x.id,120)&&text(x.title,160)&&Number.isFinite(Number(x.score))&&Number.isFinite(Number(x.total))&&Number(x.total)>=0&&Number(x.score)>=0&&Number(x.score)<=Number(x.total),'cần tên và điểm quiz hợp lệ');
  checkRecords('examQuestionBank',x=>text(x.id,120)&&x.id.trim()&&examQuestionValid(x)&&(x.subject===undefined||SUBJECTS.includes(x.subject)),'cần câu hỏi, môn học và cấu trúc đáp án hợp lệ');
  checkRecords('examSessions',x=>text(x.id,120)&&x.id.trim()&&text(x.title,100)&&x.title.trim()&&['IN_PROGRESS','COMPLETED','TIMED_OUT','CANCELED','INTERRUPTED','PENDING_REVIEW'].includes(x.status)&&Number.isFinite(x.startedAt)&&x.startedAt>0&&Number.isFinite(x.deadlineAt)&&x.deadlineAt>=x.startedAt&&Number.isInteger(x.durationMinutes)&&x.durationMinutes>=1&&x.durationMinutes<=180&&Array.isArray(x.questions)&&((x.status==='CANCELED'&&x.endReason==='INTEGRITY_VIOLATION'&&x.questions.length===0)||(x.questions.length>=1&&x.questions.length<=1000&&x.questions.every(q=>record(q)&&text(q.id,120)&&q.id.trim()&&examQuestionValid(q))))&&(x.responses===undefined||record(x.responses))&&Object.keys(x.responses||{}).every(qid=>x.questions.some(q=>q.id===qid))&&new Set(x.questions.map(q=>q.id)).size===x.questions.length&&(!x.currentIndex||Number.isInteger(x.currentIndex)&&x.currentIndex>=0&&x.currentIndex<x.questions.length)&&Object.entries(x.responses||{}).every(([qid,response])=>{const question=x.questions.find(q=>q.id===qid);if(!question)return false;const type=question.type||'multiple-choice';if(['short-answer','fill-blank'].includes(type))return typeof response==='string'&&response.length<=1000;if(type==='multiple-select')return Array.isArray(response)&&response.length<=question.options.length&&new Set(response).size===response.length&&response.every(n=>Number.isInteger(n)&&n>=0&&n<question.options.length);return Number.isInteger(response)&&response>=0&&response<question.options.length;})&&(x.scratchpad===undefined||(record(x.scratchpad)&&Object.keys(x.scratchpad).length<=1000&&Object.entries(x.scratchpad).every(([qid,note])=>x.questions.some(q=>q.id===qid)&&typeof note==='string'&&note.length<=1200)))&&(x.markedForReview===undefined||Array.isArray(x.markedForReview)&&x.markedForReview.every(qid=>x.questions.some(q=>q.id===qid)))&&(x.strictFullscreen===undefined||typeof x.strictFullscreen==='boolean')&&(x.score===null||x.score===undefined||record(x.score)&&Number.isFinite(x.score.earned)&&Number.isFinite(x.score.max)&&x.score.earned>=0&&x.score.max>=x.score.earned),'cần trạng thái, thời hạn, snapshot câu hỏi và câu trả lời hợp lệ');
  if(incoming.examIntegrityRecords!==undefined)checkRecords('examIntegrityRecords',x=>text(x.key,160)&&x.key.startsWith('integrity-')&&Number.isInteger(x.violations)&&x.violations>=0&&Number.isFinite(Number(x.lockUntil))&&Number.isFinite(Number(x.originalDeadlineAt||0)),'cần key chính sách, số lần và deadline khóa hợp lệ');
  if(incoming.examIntegrityEvents!==undefined)checkRecords('examIntegrityEvents',x=>text(x.id,120)&&text(x.key,160)&&text(x.sessionId,120)&&['FULLSCREEN_EXIT','TAB_HIDDEN','OTHER'].includes(x.reason)&&Number.isInteger(x.violationNumber)&&x.violationNumber>=1&&Number.isFinite(Number(x.occurredAt))&&Number.isFinite(Number(x.lockUntil)),'chỉ chấp nhận metadata vi phạm, không chứa câu trả lời');
  if(incoming.deletedItems!==undefined)checkRecords('deletedItems',x=>text(x.id,120)&&record(x.data)&&text(x.title,160),'cần dữ liệu lưu trữ có cấu trúc');
  return JSON.parse(JSON.stringify(incoming));
}
function importDataFile(file) {
  if(!file)return;
  if(Number(file.size)>BACKUP_IMPORT_MAX_BYTES){showToast('Tệp sao lưu vượt giới hạn 12 MB. Hãy kiểm tra tệp đã chọn hoặc xuất dữ liệu theo từng phần nếu ứng dụng hỗ trợ.','error');$('#importFileInput').value='';return;}
  const reader=new FileReader();
  reader.onload=()=>{
    let incoming,missingOptional=[];
    try{
      const parsed=JSON.parse(String(reader.result||''));incoming=parsed?.studyData;
      if(!['LUMEVIA StudyOS','Orilynth StudyOS','Praxilume StudyOS'].includes(parsed?.app)||!incoming||typeof incoming!=='object'||Array.isArray(incoming))throw new Error('Tệp không phải bản sao lưu LUMEVIA hợp lệ. Hãy chọn tệp xuất từ LUMEVIA StudyOS hoặc Praxilume StudyOS.');
      incoming=validateBackupState(incoming);
      missingOptional=['completedTasks','notes','documents','examQuestionBank','examSessions'].filter(key=>incoming[key]===undefined);
    }catch(err){showToast(err.message||'Không thể đọc tệp sao lưu. Dữ liệu hiện tại được giữ nguyên.','error');$('#importFileInput').value='';return;}
    const detail=['Bản sao lưu sẽ thay thế dữ liệu học tập của tài khoản này. Hãy xuất bản sao lưu hiện tại trước khi tiếp tục.',missingOptional.length?`Lưu ý: bản sao lưu không có ${missingOptional.join(', ')}; các phần này sẽ bắt đầu trống sau khi nhập.`:'Thao tác nhập không tự hợp nhất hai bộ dữ liệu.'].join(' ');
    requestConfirmation({eyebrow:'SAO LƯU · KHÔI PHỤC DỮ LIỆU',title:'Thay thế dữ liệu hiện tại?',message:'Chỉ tiếp tục khi đúng tệp và bạn đã giữ bản sao lưu hiện tại.',detail,confirmLabel:'Nhập bản sao lưu',cancelLabel:'Hủy nhập',danger:true},()=>{
      if(activePage==='documents'&&documentDirty&&!saveActiveDocument(true))return;
      const before=snapshotStudyState();
      try{
        state={...state,...incoming,completedTasks:Array.isArray(incoming.completedTasks)?incoming.completedTasks:[],notes:Array.isArray(incoming.notes)?incoming.notes:[],documents:Array.isArray(incoming.documents)?incoming.documents:[],examQuestionBank:Array.isArray(incoming.examQuestionBank)?incoming.examQuestionBank:[],examSessions:Array.isArray(incoming.examSessions)?incoming.examSessions:[],profile:{...state.profile,...(incoming.profile||{})},settings:{...state.settings,...(incoming.settings||{})}};
        normalizeStudyState();
        if(!saveMutationOrRollback(before))return;
        activeExamId=null;selectedExamResultId=null;examNavigatorPage=0;
        if(examTimer){clearInterval(examTimer);examTimer=null;}
        renderPage(activePage);showToast('Đã nhập bản sao lưu và lưu vào thiết bị này.','success');
      }catch(err){
        if(before){try{state=JSON.parse(before);applySettings();updateShellProfile();updateSidebarDaily();updateNotificationDot();renderPage(activePage,{recordHistory:false});}catch(rollbackError){console.error('Backup import rollback failed:',rollbackError);}}
        showToast(err.message||'Không thể nhập tệp sao lưu. Dữ liệu hiện tại đã được giữ lại.','error');
      }
    });
    $('#importFileInput').value='';
  };
  reader.onerror=()=>{showToast('Không thể đọc tệp được chọn. Dữ liệu hiện tại được giữ nguyên.','error');$('#importFileInput').value='';};
  reader.readAsText(file);
}

async function requestNotifications() {
  if(!state)return;
  const initial=getBrowserPermissionStatus();
  if(initial.value==='unsupported'){
    state.settings.notifications=false;saveState();renderPage(activePage);updateNotificationPermissionUI();
    showToast('Trình duyệt này không hỗ trợ thông báo hệ thống. Thông báo nổi và trung tâm thông báo trong website vẫn hoạt động.','error');return;
  }
  if(initial.value==='insecure'){
    state.settings.notifications=false;saveState();renderPage(activePage);updateNotificationPermissionUI();
    showToast('Thông báo hệ thống yêu cầu HTTPS hoặc localhost. Hãy mở đúng website qua HTTPS rồi thử lại.','error');return;
  }
  // Never toggle the app switch off while browser permission is still default.
  // The browser permission is the source of truth; the saved setting is only app intent.
  if(initial.value==='granted'){
    const enabling=!state.settings.notifications;
    state.settings.notifications=enabling;
    if(!saveState()){state.settings.notifications=!enabling;return;}
    renderPage(activePage);updateNotificationPermissionUI();
    showToast(enabling?'Đã bật gửi thông báo hệ thống cho website này.':'Đã tắt gửi thông báo hệ thống. Nhắc trong ứng dụng vẫn hoạt động theo cài đặt riêng.','success');
    return;
  }
  if(initial.value==='denied'){
    if(state.settings.notifications){state.settings.notifications=false;saveState();}
    renderPage(activePage);updateNotificationPermissionUI();
    showToast('Quyền thông báo của địa chỉ website này đang bị chặn. Hãy mở biểu tượng cài đặt/quyền ở cạnh thanh địa chỉ, cho phép Thông báo, rồi quay lại và bấm “Làm mới” hoặc “Cấp quyền cho website”. Website không thể tự vượt qua lựa chọn đã bị chặn.','error');return;
  }
  try{
    const returnedPermission=await Notification.requestPermission();
    // Read the browser again after the prompt; do not trust a stale app setting or return value alone.
    const after=getBrowserPermissionStatus();
    const actualPermission=after.permission||returnedPermission;
    if(after.value==='granted'&&actualPermission==='granted'){
      state.settings.notifications=true;
      if(!saveState()){state.settings.notifications=false;return;}
      renderPage(activePage);updateNotificationPermissionUI();
      showToast('Đã cấp quyền và bật gửi thông báo hệ thống cho website này. Nhắc tự động khi đóng trang vẫn cần Browser Push ở máy chủ.','success');
    }else{
      state.settings.notifications=false;saveState();renderPage(activePage);updateNotificationPermissionUI();
      if(actualPermission==='denied'||after.value==='denied')showToast('Trình duyệt đang chặn thông báo cho website này. Hãy đổi quyền trong cài đặt trang; website không thể tự mở lại quyền.','error');
      else showToast('Bạn chưa cấp quyền thông báo cho website này. Nhắc trong ứng dụng vẫn hoạt động khi trang đang mở.','info');
    }
  }catch(err){
    state.settings.notifications=false;saveState();renderPage(activePage);updateNotificationPermissionUI();
    showToast('Không thể yêu cầu quyền thông báo trong môi trường hiện tại. Hãy kiểm tra HTTPS, quyền của đúng địa chỉ website và cài đặt trình duyệt.','error');
  }
}
async function changePassword(form) {
  const fd=new FormData(form),oldPassword=String(fd.get('currentPassword')||''),next=String(fd.get('newPassword')||''),confirmPassword=String(fd.get('confirmNewPassword')||''),feedback=$('#passwordFeedback');feedback.textContent='';
  if(next.length<8||next.length>128){feedback.textContent='Mật khẩu mới cần từ 8 đến 128 ký tự.';return;}if(next!==confirmPassword){feedback.textContent='Hai mật khẩu mới chưa trùng khớp.';return;}
  try{
    const users=readUsers(),user=Object.hasOwn(users,currentUsername)?users[currentUsername]:null;
    if(!user||typeof user.salt!=='string'||typeof user.passwordHash!=='string'){feedback.textContent='Không đọc được hồ sơ tài khoản hợp lệ; dữ liệu chưa thay đổi.';return;}
    const old=await derivePasswordHash(oldPassword,user.salt);if(!equalText(old.hash,user.passwordHash)){feedback.textContent='Mật khẩu hiện tại chưa đúng.';return;}
    const updated=await derivePasswordHash(next);const nextUsers={...users,[currentUsername]:{...user,passwordHash:updated.hash,salt:updated.salt}};writeUsers(nextUsers);form.reset();showToast('Đã cập nhật mật khẩu trên trình duyệt này.','success');
  }catch(err){feedback.textContent=authStorageError(err,'Không thể cập nhật mật khẩu.');}
}
function bulkDeleteSelectedRecords(type,collection,selectionSet,label,options={}){
  const ids=[...selectionSet];if(!ids.length)return showToast('Hãy chọn ít nhất một mục trước.','error');
  const active=state?.[collection];if(!Array.isArray(active))return showToast('Không xác định được danh sách dữ liệu.','error');
  const records=ids.map(id=>active.find(item=>item?.id===id)).filter(Boolean);if(records.length!==ids.length)return showToast('Một số mục đã thay đổi hoặc không còn tồn tại. Hãy tải lại danh sách và chọn lại.','error');
  if((state.deletedItems||[]).length+records.length>500)return showToast('Nhóm vượt giới hạn 500 mục của Lịch sử xóa. Hãy chia thành các nhóm nhỏ.', 'error');
  requestConfirmation({eyebrow:`${label.toLocaleUpperCase('vi')} · XÓA THEO NHÓM`,title:`Chuyển ${records.length} mục vào Lịch sử xóa?`,message:`${records.length} mục đã chọn sẽ được chuyển khỏi danh sách hiện tại.`,detail:'Bạn có thể khôi phục các mục sau trong Lịch sử xóa. Nếu lưu thất bại, ứng dụng sẽ giữ lại dữ liệu ban đầu.',confirmLabel:'Chuyển nhóm đã chọn',cancelLabel:'Hủy',danger:true},()=>{
    const before=snapshotStudyState(),now=Date.now();
    for(const removed of records){const title=String(removed.title||removed.front||removed.name||removed.question||'Mục đã xóa').slice(0,160);state.deletedItems.push({id:makeId('deleted'),itemId:removed.id,type:typeof options.typeForItem==='function'?options.typeForItem(removed):type,title,summary:String(removed.description||removed.content||removed.back||removed.url||'').replace(/<[^>]*>/g,' ').slice(0,180),deletedAt:now,sourceCollection:collection,data:JSON.parse(JSON.stringify(removed))});}
    const chosen=new Set(ids);state[collection]=state[collection].filter(item=>!chosen.has(item.id));
    if(!saveMutationOrRollback(before))return;selectionSet.clear();if(typeof options.afterCommit==='function'){try{options.afterCommit(records,ids);}catch(error){console.error('Post-delete UI reconciliation failed:',error);}}
    recordNotification('Đã chuyển nhóm dữ liệu vào Lịch sử xóa',`Đã chuyển ${records.length} ${label} vào Lịch sử xóa.`,'storageActions',{icon:'♲',action:'recycle',actionLabel:'Mở lịch sử xóa',dedupeKey:`deleted-batch:${makeId('batch')}`,toast:false});
    renderPage(activePage,{recordHistory:false});showToast(`Đã chuyển ${records.length} mục vào Lịch sử xóa.`,'success');
  });
}
function bulkDeleteQuizzes(){
  const ids=[...selectedQuizIds];if(!ids.length)return showToast('Hãy chọn ít nhất một bộ quiz.','error');
  const custom=ids.filter(id=>(state.customQuizzes||[]).some(q=>q.id===id)),builtins=ids.filter(id=>BUILTIN_QUIZZES.some(q=>q.id===id)&&!(state.hiddenBuiltinQuizzes||[]).includes(id));
  if((state.deletedItems||[]).length+custom.length>500)return showToast('Nhóm vượt giới hạn Lịch sử xóa 500 mục. Hãy chia thành nhóm nhỏ.', 'error');
  requestConfirmation({eyebrow:'QUIZ LAB · XÓA THEO NHÓM',title:`Xử lý ${custom.length+builtins.length} bộ quiz đã chọn?`,message:'Bộ tự tạo sẽ chuyển vào Lịch sử xóa; bộ mẫu được ẩn khỏi thư viện cá nhân.',detail:'Thao tác chỉ được lưu sau khi toàn bộ thay đổi đã được chuẩn bị. Nếu lưu thất bại, dữ liệu được khôi phục.',confirmLabel:'Xác nhận nhóm',cancelLabel:'Hủy',danger:true},()=>{
    const before=snapshotStudyState(),now=Date.now(),customSet=new Set(custom),builtinSet=new Set(builtins);
    for(const quiz of (state.customQuizzes||[]).filter(q=>customSet.has(q.id)))state.deletedItems.push({id:makeId('deleted'),itemId:quiz.id,type:'quiz',title:String(quiz.title||'Bộ quiz').slice(0,160),summary:`${quiz.questions?.length||0} câu · ${quiz.subject||'Khác'}`,deletedAt:now,sourceCollection:'customQuizzes',data:JSON.parse(JSON.stringify(quiz))});
    state.customQuizzes=state.customQuizzes.filter(q=>!customSet.has(q.id));state.hiddenBuiltinQuizzes=[...new Set([...(state.hiddenBuiltinQuizzes||[]),...builtinSet])];
    if(!saveMutationOrRollback(before))return;selectedQuizIds.clear();renderPage('quiz',{recordHistory:false});showToast(`Đã xử lý ${custom.length+builtins.length} bộ quiz.`,'success');
  });
}
function bulkDeleteFlashcards(){bulkDeleteSelectedRecords('flashcard','flashcards',selectedFlashIds,'flashcard');}
function bulkDeletePlannerTasks(){bulkDeleteSelectedRecords('task','tasks',selectedTaskIds,'công việc',{typeForItem:item=>item.isDeadline?'deadline':'task'});}
function bulkDeleteCompletedTasks(){bulkDeleteSelectedRecords('completedTask','completedTasks',selectedCompletedTaskIds,'việc đã hoàn thành');}
function bulkDeleteDeadlines(){bulkDeleteSelectedRecords('deadline','tasks',selectedDeadlineIds,'deadline');}
function bulkDeleteCompletedDeadlines(){bulkDeleteSelectedRecords('completedTask','completedTasks',selectedCompletedDeadlineIds,'deadline đã hoàn thành');}
function updateDocumentLibraryBulkUI(){const count=$('#documentBulkSelectedCount'),button=$('#documentBulkDelete');if(count)count.textContent=`${selectedDocumentIds.size} tài liệu được chọn`;if(button)button.disabled=selectedDocumentIds.size===0;}
function bulkDeleteDocuments(){if(!selectedDocumentIds.size)return showToast('Hãy chọn ít nhất một tài liệu.','error');if(!saveActiveDocument(true)){showToast('Chưa thể lưu tài liệu đang mở; chưa xóa mục nào.','error');return;}bulkDeleteSelectedRecords('document','documents',selectedDocumentIds,'tài liệu',{afterCommit:(records)=>{const removed=new Set(records.map(doc=>doc.id));openDocumentIds=openDocumentIds.filter(id=>!removed.has(id));if(removed.has(activeDocumentId))activeDocumentId=openDocumentIds.find(id=>state.documents.some(doc=>doc.id===id))||state.documents[0]?.id||null;if(activeDocumentId&&!openDocumentIds.includes(activeDocumentId))openDocumentIds.push(activeDocumentId);}});}
function bulkDeleteNotes(){bulkDeleteSelectedRecords('note','notes',selectedNoteIds,'ghi chú');}
function bulkDeleteResources(){
  const ids=[...selectedResourceIds];if(!ids.length)return showToast('Hãy chọn ít nhất một tài nguyên.','error');
  const builtin=ids.filter(id=>BUILTIN_RESOURCES.some(r=>r.id===id)),custom=ids.filter(id=>(state.resources||[]).some(r=>r.id===id));
  if((state.deletedItems||[]).length+custom.length>500)return showToast('Nhóm vượt giới hạn Lịch sử xóa 500 mục.','error');
  requestConfirmation({eyebrow:'KHO TRI THỨC · XÓA THEO NHÓM',title:`Xử lý ${builtin.length+custom.length} tài nguyên?`,message:'Tài nguyên do bạn thêm sẽ chuyển vào Lịch sử xóa; nguồn mẫu sẽ chỉ bị ẩn khỏi thư viện cá nhân.',confirmLabel:'Xác nhận nhóm',cancelLabel:'Hủy',danger:true},()=>{
    const before=snapshotStudyState(),now=Date.now(),customSet=new Set(custom),builtinSet=new Set(builtin);
    for(const resource of state.resources.filter(r=>customSet.has(r.id)))state.deletedItems.push({id:makeId('deleted'),itemId:resource.id,type:'resource',title:String(resource.title||'Tài nguyên').slice(0,160),summary:String(resource.description||resource.url||'').slice(0,180),deletedAt:now,sourceCollection:'resources',data:JSON.parse(JSON.stringify(resource))});
    state.resources=state.resources.filter(r=>!customSet.has(r.id));state.hiddenBuiltinResources=[...new Set([...(state.hiddenBuiltinResources||[]),...builtinSet])];
    if(!saveMutationOrRollback(before))return;selectedResourceIds.clear();renderPage('vault',{recordHistory:false});showToast(`Đã xử lý ${builtin.length+custom.length} tài nguyên.`,'success');
  });
}

function handleAction(action, el) {
  if(handleEvolutionAction(action,el))return;
  const id=el.dataset.id, page=el.dataset.page, value=el.dataset.value;
  if(action==='toggle-delete-mode'){toggleDeleteModeForCurrentPage();return;}
  if(action==='notification-toggle-delete-mode'){notificationDeleteMode=!notificationDeleteMode;if(!notificationDeleteMode)selectedNotificationIds.clear();renderNotificationCenter();return;}
  if(['notification-select-item','notification-delete-selected','notification-clear-selection','notification-delete'].includes(action)&&!notificationDeleteMode){showToast('Hãy bật chế độ xóa trong trung tâm thông báo trước.','warning');return;}
  if(DELETE_MODE_ACTIONS[activePage]?.has(action)&&!deleteModePages.has(activePage)){showToast('Hãy bật chế độ xóa trước khi chọn hoặc xóa dữ liệu.','warning');return;}
  if(action==='toggle-task'&&activePage==='planner'&&deleteModePages.has('planner')){showToast('Hãy tắt chế độ xóa để hoàn thành nhiệm vụ; lúc này ô chọn chỉ dùng để chọn mục cần xóa.','warning');return;}
  switch(action){
    case 'exam-integrity-ack':closeExamIntegrityDialog();break;
    case 'auth-tab':switchAuthTab(el.dataset.tab);break;
    case 'toggle-password':{const input=$(`#${el.dataset.target}`);if(input)input.type=input.type==='password'?'text':'password';break;}
    case 'navigate':navigate(page);break;
    case 'exam-preset':applyExamPreset(el.dataset.preset);break;
    case 'exam-create':void createExamSessionFromForm();break;
    case 'exam-resume':void resumeExamSession(id);break;
    case 'exam-answer-option':setExamOptionAnswer(id,Number(el.dataset.index));break;
    case 'exam-toggle-option':toggleExamMultiAnswer(id,Number(el.dataset.index));break;
    case 'exam-save-text-answer':saveExamTextAnswer(id);break;
    case 'exam-prev':moveExamQuestion(-1);break;
    case 'exam-next':moveExamQuestion(1);break;
    case 'exam-jump':jumpExamQuestion(Number(el.dataset.index));break;
    case 'exam-filter':examNavigatorFilter=['all','unanswered','flagged'].includes(value)?value:'all';examNavigatorPage=0;renderPage('exam',{recordHistory:false});break;
    case 'exam-map-page':{const page=Number(el.dataset.page);if(Number.isInteger(page))examNavigatorPage=Math.max(0,page);renderPage('exam',{recordHistory:false});break;}
    case 'exam-result-filter':examResultFilter=['all','wrong','correct'].includes(value)?value:'all';renderPage('exam',{recordHistory:false});break;
    case 'exam-next-unanswered':examJumpNextUnanswered();break;
    case 'exam-mark-review':toggleExamMarkForReview();break;
    case 'exam-submit':requestExamSubmission();break;
    case 'exam-cancel':requestConfirmation({eyebrow:'EXAM MODE · HỦY PHIÊN',title:'Hủy bài kiểm tra?',message:'Phiên bị hủy sẽ không được tính là bài hoàn thành và không nhận XP.',detail:'Câu trả lời đã lưu sẽ được giữ trong hồ sơ phiên thi, nhưng không có điểm thành tích.',confirmLabel:'Hủy bài thi',cancelLabel:'Tiếp tục',danger:true},()=>finishExamSession(activeExamId,'CANCELED','USER_CANCEL'));break;
    case 'exam-new-blueprint':selectedExamResultId=null;renderPage('exam',{recordHistory:false});break;
    case 'exam-view-result':{const result=state.examSessions.find(x=>x.id===id&&['COMPLETED','TIMED_OUT'].includes(x.status)&&x.score);if(result){selectedExamResultId=result.id;renderPage('exam',{recordHistory:false});}else showToast('Không tìm thấy kết quả hợp lệ của phiên thi này.','error');break;}
    case 'exam-bank-delete':{const item=state.examQuestionBank.find(q=>q.id===id);if(item)requestConfirmation({eyebrow:'QUESTION BANK',title:'Xóa câu hỏi này?',message:`“${item.question.slice(0,140)}” sẽ được chuyển vào Lịch sử xóa.`,confirmLabel:'Chuyển vào lịch sử xóa',cancelLabel:'Giữ lại',danger:true},()=>{if(softDeleteItem('examQuestion',item,'examQuestionBank'))renderPage('exam');});break;}
    case 'review-start':startSmartReview();break;
    case 'review-open-flashcards':currentFlashcardDeckId='all';navigate('flashcards');break;
    case 'go-back':goBack();break;
    case 'confirm-cancel':closeConfirmation(false);break;
    case 'confirm-accept':closeConfirmation(true);break;
    case 'open-notifications':renderNotificationCenter();break;
    case 'quick-break':startQuickBreak(Number(el.dataset.minutes)||5);break;
    case 'save-daily-focus-goal':{const goal=Number($('#dailyFocusGoal')?.value);if(![30,60,90,120,180,240].includes(goal))break;const before=snapshotStudyState();state.settings.dailyFocusGoal=goal;if(!saveMutationOrRollback(before))break;showToast(`Đã đặt mục tiêu học ${goal} phút/ngày.`,'success');renderPage('settings',{recordHistory:false});break;}
    case 'save-wellness-threshold':{const threshold=Number($('#wellnessThreshold')?.value);if(![30,50,75,90].includes(threshold))break;const before=snapshotStudyState();state.settings.wellnessThreshold=threshold;if(!saveMutationOrRollback(before))break;showToast(`Đã đặt nhắc nghỉ sau ${threshold} phút tập trung.`,'success');break;}
    case 'toggle-notification-settings':{const previous=state.settings.notificationPreferencesCollapsed!==false;state.settings.notificationPreferencesCollapsed=!previous;if(!saveState()){state.settings.notificationPreferencesCollapsed=previous;break;}renderPage('settings');$('#notificationPreferencesToggle')?.focus({preventScroll:true});break;}
    case 'set-notification-pref':{const key=el.dataset.key;if(key in DEFAULT_NOTIFICATION_PREFS){const before=snapshotStudyState();state.notificationPrefs[key]=!notificationPrefEnabled(key);if(!saveMutationOrRollback(before))break;renderPage('settings');showToast(`${NOTIFICATION_PREF_GROUPS.flatMap(g=>g.items).find(x=>x[0]===key)?.[1]||'Cài đặt thông báo'}: ${state.notificationPrefs[key]?'đã bật':'đã tắt'}.`,'success');}break;}
    case 'notification-prefs-all':{const before=snapshotStudyState(),value=el.dataset.value==='on';state.notificationPrefs=Object.fromEntries(Object.keys(DEFAULT_NOTIFICATION_PREFS).map(key=>[key,value]));if(!saveMutationOrRollback(before))break;renderPage('settings');showToast(value?'Đã bật tất cả loại thông báo.':'Đã tắt tất cả loại thông báo.');break;}
    case 'notification-prefs-default':{const before=snapshotStudyState();state.notificationPrefs=defaultNotificationPrefs();if(!saveMutationOrRollback(before))break;renderPage('settings');showToast('Đã khôi phục cài đặt thông báo mặc định.');break;}
    case 'close-notifications':closeNotifications();break;
    case 'notification-mark-read':markNotificationsRead();break;
    case 'notification-mark-item':markNotificationRead(el.dataset.id);break;
    case 'notification-delete':deleteNotification(el.dataset.id);break;
    case 'notification-select-item':if(el.checked)selectedNotificationIds.add(id);else selectedNotificationIds.delete(id);renderNotificationCenter();break;
    case 'notification-delete-selected':deleteSelectedNotifications();break;
    case 'notification-clear-selection':selectedNotificationIds.clear();renderNotificationCenter();break;
    case 'notification-filter':notificationFilter=el.dataset.filter==='unread'?'unread':'all';renderNotificationCenter();break;
    case 'toggle-notification-panel-section':{
      const section=el.dataset.section;
      const key=section==='updates'?'notificationUpdatesCollapsed':section==='status'?'notificationStatusCollapsed':null;
      if(!key)break;
      const previous=state.settings[key]!==false;
      state.settings[key]=!previous;
      if(!saveState()){state.settings[key]=previous;break;}
      renderNotificationCenter();
      const targetId=section==='updates'?'notificationDisplayToggleUpdates':'notificationDisplayToggleStatus';
      document.getElementById(targetId)?.focus({preventScroll:true});
      break;
    }
    case 'snooze-wellness':snoozeWellnessReminder(20);break;
    case 'refresh-notifications':refreshBrowserNotificationPermission();renderNotificationCenter();showToast('Đã kiểm tra lại quyền trình duyệt và cập nhật danh sách thông báo.');break;
    case 'notification-go':{const destination=page;closeNotifications(false);if(destination==='start-flash-challenge')startFlashChallenge();else if(destination==='pause-focus'){if(focusStarted&&!focusPaused)pauseFocus();else navigate('focus');}else navigate(destination);break;}
    case 'start-flash-challenge':startFlashChallenge();break;
    case 'skip-flash-challenge':skipFlashChallenge();break;
    case 'toggle-document-focus':toggleDocumentFocus();break;
    case 'toggle-document-actions':documentActionsOpen=!documentActionsOpen;$('#documentActionsDropdown')?.classList.toggle('hidden',!documentActionsOpen);el.setAttribute('aria-expanded',String(documentActionsOpen));break;
    case 'toggle-document-library':openDocumentLibrary();break;
    case 'writer-tools':toggleWriterTools();break;
    case 'document-action':{
      documentActionsOpen=false;$('#documentActionsDropdown')?.classList.add('hidden');
      const command=el.dataset.command;
      if(command==='new')createStudyDocument('blank');
      else if(command==='save-draft'||command==='save-storage'){const current=(state?.documents||[]).find(d=>d.id===activeDocumentId);if(!current){showToast('Hãy mở hoặc tạo tài liệu trước khi lưu.','error');break;}const ok=saveActiveDocument(true);showToast(ok?(command==='save-draft'?'Đã lưu bản nháp cục bộ.':'Đã lưu tài liệu vào Storage.'):'Chưa lưu được. Hãy xuất bản sao lưu. ',ok?'success':'error');}
      else if(command==='rename'){if(!documentToolsOpen)toggleWriterTools();const title=$('#documentTitle');if(title){title.focus();title.select();showToast('Sửa tên tại trường “Tên tài liệu”; thay đổi sẽ tự lưu.');}else showToast('Hãy mở một tài liệu trước.','info');}
      else if(command==='undo')applyDocumentCommand('undo');
      else if(command==='fullscreen'){toggleDocumentFocus();}
      else if(command==='header'){documentHideStudyHeader=!documentHideStudyHeader;document.body.classList.toggle('doc-hide-study-header',documentHideStudyHeader);showToast(documentHideStudyHeader?'Đã ẩn thanh tiêu đề StudySpace.':'Đã hiện thanh tiêu đề StudySpace.','success');}
      else if(command==='library'){if(!documentLibraryOpen)openDocumentLibrary();else openDocumentLibrary();}
      break;}
    case 'close-document-tab':{
      const closing=el.dataset.id;if(documentDirty&&!saveActiveDocument(true))break;openDocumentIds=openDocumentIds.filter(tab=>tab!==closing);
      if(activeDocumentId===closing){const idx=Math.max(0,openDocumentIds.length-1);activeDocumentId=openDocumentIds[idx]||null;}
      documentSelectionRange=null;renderPage('documents');break;}
    case 'doc-size-step':changeDocumentSize(Number(el.dataset.step)||0);break;
    case 'doc-insert-image':$('#documentImageInput')?.click();break;
    case 'doc-table-edit':modifySelectedTable(el.dataset.mode);break;
    case 'doc-find-next':findDocumentNext();break;
    case 'doc-replace-current':replaceDocumentCurrent();break;
    case 'toggle-document-outline':toggleDocumentOutline();break;
    case 'jump-document-heading':jumpToDocumentHeading(el.dataset.index);break;
    case 'open-sidebar':$('#sidebar').classList.add('open');$('#sidebarScrim').classList.add('active');break;
    case 'close-sidebar':$('#sidebar').classList.remove('open');$('#sidebarScrim').classList.remove('active');break;
    case 'logout':requestConfirmation({eyebrow:'TÀI KHOẢN · ĐĂNG XUẤT',title:'Đăng xuất khỏi LUMEVIA?',message:'Bạn sẽ trở về màn hình đăng nhập.',detail:'Dữ liệu đã lưu vẫn nằm trên trình duyệt này.',confirmLabel:'Đăng xuất',cancelLabel:'Ở lại',danger:false},logout);break;
    case 'toggle-task':completeTask(id);break;
    case 'restore-task':restoreTask(id);break;
    case 'delete-completed-task':{const task=state.completedTasks.find(t=>t.id===id);if(task)requestConfirmation({eyebrow:'LỊCH HỌC · LỊCH SỬ',title:'Xóa việc đã hoàn thành?',message:`“${task.title||'Công việc'}” sẽ bị xóa khỏi lịch sử hoàn thành.`,confirmLabel:'Xóa khỏi lịch sử',cancelLabel:'Giữ lại',danger:true},()=>{const current=state.completedTasks.find(t=>t.id===id);if(current&&softDeleteItem('completedTask',current,'completedTasks')){renderPage(activePage);showToast('Đã chuyển mục vào Lịch sử xóa.','success');}});break;}
    case 'calendar-prev':shiftPlannerMonth(-1);break;
    case 'calendar-next':shiftPlannerMonth(1);break;
    case 'calendar-today':plannerSelectedDate=todayKey();renderPage('planner');break;
    case 'calendar-select-day':if(/^\d{4}-\d{2}-\d{2}$/.test(el.dataset.date||'')){plannerSelectedDate=el.dataset.date;renderPage('planner');}break;
    case 'study-calendar-prev':shiftStudyCalendar(-1);break;
    case 'study-calendar-next':shiftStudyCalendar(1);break;
    case 'new-note':closeNoteViewer();editingNoteId=null;renderPage('notes');$('#noteTitle')?.focus();break;
    case 'note-template':applyNoteTemplate(el.dataset.template);break;
    case 'toggle-note-pinned-filter':notesPinnedOnly=!notesPinnedOnly;filterNotes();break;
    case 'clear-note-filters':notesPinnedOnly=false;notesSubjectFilter='all';notesSortMode='smart';noteSearchQuery='';renderPage('notes');break;
    case 'copy-note':copyNote(id);break;
    case 'export-note-md-one':exportSingleNoteMarkdown(id);break;
    case 'new-document':createStudyDocument('blank');break;
    case 'new-document-template':createStudyDocument(el.dataset.template||'blank');break;
    case 'duplicate-document':duplicateStudyDocument(id);break;
    case 'select-document':if(documentDirty&&!saveActiveDocument(true))break;if(!(state?.documents||[]).some(d=>d.id===id))break;activeDocumentId=id;if(!openDocumentIds.includes(id))openDocumentIds.push(id);documentSelectionRange=null;documentLibraryOpen=false;renderPage('documents');break;
    case 'toggle-document-pin':toggleDocumentPin(id);break;
    case 'delete-document':deleteDocument(id);break;
    case 'doc-format':applyDocumentCommand(el.dataset.command);break;
    case 'doc-insert-link':insertDocumentLink();break;
    case 'doc-insert-table':insertDocumentTable();break;
    case 'doc-clear-format':clearDocumentFormatting();break;
    case 'document-recovery-export':exportDocumentRecoveryDraft();break;
    case 'save-document-now':{const ok=saveActiveDocument(true);showToast(ok?'Đã lưu tài liệu.':'Chưa lưu được. Hãy xuất bản sao lưu. ',ok?'success':'error');break;}
    case 'export-document-word':exportDocument(id,'word');break;
    case 'export-document-html':exportDocument(id,'html');break;
    case 'export-document-txt':exportDocument(id,'txt');break;
    case 'export-document-md':exportDocument(id,'md');break;
    case 'document-print':printDocument();break;
    case 'view-note':openNoteViewer(id);break;
    case 'close-note-viewer':closeNoteViewer();break;
    case 'edit-note':closeNoteViewer();editingNoteId=id;renderPage('notes');$('#noteTitle')?.focus();break;
    case 'pin-note':toggleNotePin(id);break;
    case 'delete-note':{const note=state.notes.find(n=>n.id===id);if(note)requestConfirmation({eyebrow:'MEMORY ATLAS · SỔ GHI CHÚ',title:'Xóa ghi chú này?',message:`“${note.title||'Ghi chú không tiêu đề'}” sẽ bị xóa khỏi thư viện.`,detail:'Ghi chú sẽ được chuyển vào Lịch sử xóa. Bạn có thể khôi phục nếu chưa xóa vĩnh viễn.',confirmLabel:'Xóa ghi chú',cancelLabel:'Giữ lại',danger:true},()=>{const current=state.notes.find(n=>n.id===id);if(current&&softDeleteItem('note',current,'notes')){if(editingNoteId===id)editingNoteId=null;renderPage('notes');showToast('Đã chuyển ghi chú vào Lịch sử xóa.','success');}});break;}
    case 'task-select-item':if(el.checked)selectedTaskIds.add(id);else selectedTaskIds.delete(id);renderPage('planner',{recordHistory:false});break;
    case 'bulk-delete-tasks':bulkDeletePlannerTasks();break;
    case 'clear-task-selection':selectedTaskIds.clear();renderPage('planner',{recordHistory:false});break;
    case 'completed-task-select-item':if(el.checked)selectedCompletedTaskIds.add(id);else selectedCompletedTaskIds.delete(id);renderPage('planner',{recordHistory:false});break;
    case 'bulk-delete-completed-tasks':bulkDeleteCompletedTasks();break;
    case 'clear-completed-task-selection':selectedCompletedTaskIds.clear();renderPage('planner',{recordHistory:false});break;
    case 'deadline-select-item':if(el.checked)selectedDeadlineIds.add(id);else selectedDeadlineIds.delete(id);renderPage('deadlines',{recordHistory:false});break;
    case 'bulk-delete-deadlines':bulkDeleteDeadlines();break;
    case 'clear-deadline-selection':selectedDeadlineIds.clear();renderPage('deadlines',{recordHistory:false});break;
    case 'completed-deadline-select-item':if(el.checked)selectedCompletedDeadlineIds.add(id);else selectedCompletedDeadlineIds.delete(id);renderPage('deadlines',{recordHistory:false});break;
    case 'bulk-delete-completed-deadlines':bulkDeleteCompletedDeadlines();break;
    case 'clear-completed-deadline-selection':selectedCompletedDeadlineIds.clear();renderPage('deadlines',{recordHistory:false});break;
    case 'document-select-item':if(el.checked)selectedDocumentIds.add(id);else selectedDocumentIds.delete(id);renderDocumentLibrary();updateDocumentLibraryBulkUI();break;
    case 'bulk-delete-documents':bulkDeleteDocuments();break;
    case 'clear-document-selection':selectedDocumentIds.clear();renderDocumentLibrary();updateDocumentLibraryBulkUI();break;
    case 'delete-task':{const task=state.tasks.find(t=>t.id===id);if(task)requestConfirmation({eyebrow:'LỊCH HỌC · KẾ HOẠCH',title:'Xóa công việc này?',message:`“${task.title||'Công việc'}” sẽ bị xóa khỏi kế hoạch.`,confirmLabel:'Xóa công việc',cancelLabel:'Giữ lại',danger:true},()=>deleteTask(id));break;}
    case 'focus-preset':{$$('#pageContent .preset-button').forEach(b=>b.classList.toggle('selected',b===el));const field=$('#focusMinutes');if(field)field.value=value;const p=$('#previewFocusTime');if(p)p.textContent=formatClock(Number(value)*60);break;}
    case 'focus-theme':selectFocusTheme(value);break;
    case 'focus-toggle-task':toggleFocusDailyTask(id,false);break;
    case 'focus-restore-task':toggleFocusDailyTask(id,true);break;
    case 'pause-focus':pauseFocus();break;
    case 'stop-focus':requestConfirmation({eyebrow:'FOCUS ROOM · PHIÊN HỌC',title:'Kết thúc phiên tập trung?',message:'Phiên học sẽ dừng ngay tại thời điểm này.',detail:'Thời gian đã học sẽ được ghi nhận; phần thời gian còn lại sẽ không được tính.',confirmLabel:'Kết thúc phiên',cancelLabel:'Tiếp tục học',danger:false},()=>stopFocus(true));break;
    case 'close-focus':closeFocus();break;
    case 'clear-resource-filters':clearResourceFilters();break;
    case 'delete-resource':{const resource=allResources().find(r=>r.id===id);const isBuiltin=BUILTIN_RESOURCES.some(r=>r.id===id);if(resource)requestConfirmation({eyebrow:'KNOWLEDGE VAULT · TÀI NGUYÊN',title:'Xóa tài nguyên này?',message:`“${resource.title||'Tài nguyên'}” sẽ bị gỡ khỏi kho tri thức của tài khoản này.`,detail:isBuiltin?'Đây là nguồn gợi ý mẫu. Xóa sẽ ẩn nguồn khỏi thư viện của bạn; bạn vẫn có thể khôi phục dữ liệu bằng bản sao lưu cũ nếu cần.':'Thao tác này không thể hoàn tác nếu chưa có bản sao lưu.',confirmLabel:'Xóa khỏi kho',cancelLabel:'Giữ lại',danger:true},()=>{if(isBuiltin){const before=snapshotStudyState();state.hiddenBuiltinResources=[...new Set([...(state.hiddenBuiltinResources||[]),id])];if(!saveMutationOrRollback(before))return;renderPage('vault');showToast('Đã ẩn nguồn mẫu khỏi kho cá nhân.','success');}else if(softDeleteItem('resource',resource,'resources')){renderPage('vault');showToast('Đã chuyển tài nguyên vào Lịch sử xóa.','success');}});break;}
    case 'start-quiz':startQuiz(id);break;
    case 'delete-quiz':{const quiz=[...BUILTIN_QUIZZES,...(state.customQuizzes||[])].find(q=>q.id===id);const isBuiltin=BUILTIN_QUIZZES.some(q=>q.id===id);if(quiz)requestConfirmation({eyebrow:'QUIZ LAB · THƯ VIỆN',title:'Xóa bộ quiz này?',message:`“${quiz.title||'Quiz chưa có tên'}” sẽ bị gỡ khỏi thư viện và không xuất hiện trong Brain Sprint nữa.`,detail:isBuiltin?'Đây là bộ quiz mẫu. Hành động chỉ ẩn bộ mẫu trong thư viện của tài khoản này, không xóa mã nguồn chung.':'Bộ câu hỏi sẽ được chuyển vào Lịch sử xóa và có thể khôi phục nếu chưa xóa vĩnh viễn.',confirmLabel:'Xóa khỏi thư viện',cancelLabel:'Giữ lại',danger:true},()=>{if(isBuiltin){const before=snapshotStudyState();state.hiddenBuiltinQuizzes=[...new Set([...(state.hiddenBuiltinQuizzes||[]),id])];if(!saveMutationOrRollback(before))return;renderPage('quiz');showToast('Đã ẩn quiz mẫu khỏi thư viện riêng.','success');}else if(softDeleteItem('quiz',quiz,'customQuizzes')){renderPage('quiz');showToast('Đã chuyển bộ quiz vào Lịch sử xóa.','success');}});break;}
    case 'quiz-answer':answerQuiz(Number(el.dataset.index));break;
    case 'submit-quiz-text':submitQuizTextAnswer();break;
    case 'submit-quiz-multi':submitQuizMultiAnswer();break;
    case 'quiz-select-item':if(el.checked)selectedQuizIds.add(id);else selectedQuizIds.delete(id);renderPage('quiz',{recordHistory:false});break;
    case 'bulk-delete-quizzes':bulkDeleteQuizzes();break;
    case 'clear-quiz-selection':selectedQuizIds.clear();renderPage('quiz',{recordHistory:false});break;
    case 'flash-new-deck':flashCreateDeckOpen=!flashCreateDeckOpen;flashCardEditorOpen=false;flashEditingId=null;renderPage('flashcards',{recordHistory:false});if(flashCreateDeckOpen)$('#flashDeckNewName')?.focus({preventScroll:true});break;
    case 'flash-new-card':flashCardEditorOpen=!flashCardEditorOpen;flashCreateDeckOpen=false;flashEditingId=null;renderPage('flashcards',{recordHistory:false});if(flashCardEditorOpen)$('#flashCardFront')?.focus({preventScroll:true});break;
    case 'flash-edit-card':{const card=state.flashcards.find(c=>c.id===id);if(card){flashEditingId=id;currentFlashcardDeckId=card.deckId||'all';flashCardEditorOpen=true;flashCreateDeckOpen=false;renderPage('flashcards',{recordHistory:false});$('#flashCardFront')?.focus({preventScroll:true});}break;}
    case 'flash-cancel-edit':flashEditingId=null;renderPage('flashcards',{recordHistory:false});break;
    case 'flash-delete-deck':deleteFlashDeck(id);break;
    case 'flash-select-item':if(el.checked)selectedFlashIds.add(id);else selectedFlashIds.delete(id);renderPage('flashcards',{recordHistory:false});break;
    case 'bulk-delete-flashcards':bulkDeleteFlashcards();break;
    case 'clear-flashcard-selection':selectedFlashIds.clear();renderPage('flashcards',{recordHistory:false});break;
    case 'choose-flash-deck':currentFlashcardDeckId=id;flashIndex=0;flashRevealed=false;selectedFlashIds.clear();renderPage('flashcards',{recordHistory:false});break;
    case 'note-select-item':if(el.checked)selectedNoteIds.add(id);else selectedNoteIds.delete(id);renderPage('notes',{recordHistory:false});break;
    case 'bulk-delete-notes':bulkDeleteNotes();break;
    case 'clear-note-selection':selectedNoteIds.clear();renderPage('notes',{recordHistory:false});break;
    case 'resource-select-item':if(el.checked)selectedResourceIds.add(id);else selectedResourceIds.delete(id);renderPage('vault',{recordHistory:false});break;
    case 'bulk-delete-resources':bulkDeleteResources();break;
    case 'clear-resource-selection':selectedResourceIds.clear();renderPage('vault',{recordHistory:false});break;
    case 'quiz-next':nextQuizQuestion();break;
    case 'retry-quiz':retryQuiz();break;
    case 'exit-quiz':requestConfirmation({eyebrow:'QUIZ LAB · ĐANG LÀM BÀI',title:'Thoát bài quiz?',message:'Lượt làm bài hiện tại sẽ kết thúc.',detail:'Kết quả chưa hoàn thành sẽ không được ghi vào lịch sử.',confirmLabel:'Thoát quiz',cancelLabel:'Tiếp tục làm',danger:false},()=>{activeQuiz=null;renderPage('quiz');});break;
    case 'start-sprint':startBrainSprint();break;
    case 'open-flash-study':openFlashStudyModal(el);break;
    case 'close-flash-study':closeFlashStudyModal();break;
    case 'flip-card':flashRevealed=!flashRevealed;if(flashStudyOpen)renderFlashStudyModal();else renderPage('flashcards');break;
    case 'flash-prev':moveFlash(-1);break;
    case 'flash-next':moveFlash(1);break;
    case 'flash-review':rateFlash(el.dataset.known==='true'?'good':'again');break;
    case 'flash-grade':rateFlash(el.dataset.grade);break;
    case 'select-flash':flashIndex=Number(el.dataset.index);flashRevealed=false;renderPage('flashcards',{recordHistory:false});openFlashStudyModal(document.querySelector('#openFlashStudyButton'));break;
    case 'delete-flash':{const card=state.flashcards.find(c=>c.id===id);if(card)requestConfirmation({eyebrow:'FLASHCARDS · BỘ THẺ',title:'Xóa flashcard này?',message:`“${card.front||'Thẻ ghi nhớ'}” sẽ bị xóa khỏi bộ thẻ và lịch ôn.`,confirmLabel:'Xóa flashcard',cancelLabel:'Giữ lại',danger:true},()=>{if(softDeleteItem('flashcard',card,'flashcards')){if(state.flashcards.length)flashIndex=clamp(flashIndex,0,state.flashcards.length-1);else flashIndex=0;flashRevealed=false;renderPage('flashcards');showToast('Đã chuyển flashcard vào Lịch sử xóa.','success');}});break;}
    case 'set-theme':applySetting('theme',value);break;
    case 'set-accent':applySetting('accent',value);break;
    case 'save-custom-accent':saveCustomAccent($('#customAccentHex')?.value);break;
    case 'reset-appearance':resetAppearance();break;
    case 'set-font':applySetting('fontSize',value);break;
    case 'save-quiet-hours':{const before=snapshotStudyState();state.settings.quietHoursStart=$('#quietHoursStart')?.value||'22:00';state.settings.quietHoursEnd=$('#quietHoursEnd')?.value||'07:00';if(!saveMutationOrRollback(before))break;showToast('Đã lưu khung giờ yên tĩnh.','success');break;}
    case 'toggle-setting':applySetting(el.dataset.key,!state.settings[el.dataset.key]);break;
    case 'pick-avatar':pickAvatar(el.dataset.avatar);break;
    case 'choose-avatar-image':$('#profileAvatarInput')?.click();break;
    case 'apply-avatar-image':commitAvatarImage(pendingAvatarDataUrl);break;
    case 'cancel-avatar-image':pendingAvatarDataUrl=null;renderPage('profile',{recordHistory:false});break;
    case 'remove-avatar-image':clearAvatarImage();break;
    case 'toggle-flash-deck-list':toggleFlashDeckList();break;
    case 'export-data':exportData();break;
    case 'export-notes-md':exportNotesMarkdown();break;
    case 'import-data':$('#importFileInput').click();break;
    case 'request-notifications':requestNotifications();break;
    case 'cancel-edit-deadline':editingDeadlineId=null;renderPage('deadlines');break;
    case 'edit-deadline':editingDeadlineId=id;renderPage('deadlines');$('#deadlineTitle')?.focus();break;
    case 'storage-type':{const target=$('#storageTypeFilter');if(target){target.value=el.dataset.type||'all';filterStorage();$('#storageSearch')?.focus();}break;}
    case 'storage-select-item':{const key=storageSelectionKey(el.dataset.type,el.dataset.id);if(el.checked)selectedStorageKeys.add(key);else selectedStorageKeys.delete(key);updateStorageSelectionUI();break;}
    case 'storage-select-visible':{const visible=$$('[data-storage-record]').filter(row=>!row.classList.contains('hidden'));const allChecked=visible.length>0&&visible.every(row=>selectedStorageKeys.has(storageSelectionKey(row.dataset.type,row.dataset.id)));visible.forEach(row=>{const key=storageSelectionKey(row.dataset.type,row.dataset.id),box=row.querySelector('input[data-action="storage-select-item"]');if(allChecked){selectedStorageKeys.delete(key);if(box)box.checked=false;}else{selectedStorageKeys.add(key);if(box)box.checked=true;}});updateStorageSelectionUI();break;}
    case 'storage-clear-selection':selectedStorageKeys.clear();$$('input[data-action="storage-select-item"]').forEach(box=>box.checked=false);updateStorageSelectionUI();break;
    case 'storage-delete-selected':bulkDeleteStorageSelected();break;
    case 'storage-fullscreen':toggleStorageFullscreen();break;
    case 'recycle-select-item':if(el.checked)selectedRecycleIds.add(id);else selectedRecycleIds.delete(id);updateRecycleSelectionUI();break;
    case 'recycle-select-visible':{const visible=$$('[data-recycle-row]').filter(row=>!row.classList.contains('hidden'));const allChecked=visible.length>0&&visible.every(row=>selectedRecycleIds.has(row.dataset.id));visible.forEach(row=>{const rid=row.dataset.id,box=row.querySelector('input[data-action="recycle-select-item"]');if(allChecked){selectedRecycleIds.delete(rid);if(box)box.checked=false;}else{selectedRecycleIds.add(rid);if(box)box.checked=true;}});updateRecycleSelectionUI();break;}
    case 'recycle-clear-selection':selectedRecycleIds.clear();$$('input[data-action="recycle-select-item"]').forEach(box=>box.checked=false);updateRecycleSelectionUI();break;
    case 'restore-recycle-selected':restoreDeletedItemsBatch();break;
    case 'purge-recycle-selected':permanentlyDeleteItemsBatch();break;
    case 'storage-open':{const type=el.dataset.type;const map={note:'notes',document:'documents',flashcard:'flashcards',quiz:'quiz',examQuestion:'exam',task:'planner',deadline:'deadlines',completedTask:'planner',resource:'vault'};if(type==='document')activeDocumentId=id;if(type==='note')editingNoteId=id;navigate(map[type]||'storage');break;}
    case 'storage-delete':{const type=el.dataset.type;const map={note:['notes','ghi chú'],document:['documents','tài liệu'],flashcard:['flashcards','flashcard'],quiz:['customQuizzes','bộ quiz'],examQuestion:['examQuestionBank','câu hỏi trong ngân hàng'],task:['tasks','nhiệm vụ'],deadline:['tasks','deadline'],completedTask:['completedTasks','việc đã hoàn thành'],resource:['resources','tài nguyên']};const [collection,label]=map[type]||[];const item=collection?state[collection]?.find(x=>x.id===id):null;if(item)requestConfirmation({eyebrow:'STORAGE · LỊCH SỬ XÓA',title:`Chuyển ${label} vào lịch sử xóa?`,message:`“${item.title||item.front||'Mục đã chọn'}” sẽ được chuyển vào Lịch sử xóa để có thể khôi phục.`,confirmLabel:'Chuyển vào lịch sử xóa',cancelLabel:'Hủy',danger:true},()=>{if(softDeleteItem(type,item,collection)){selectedStorageKeys.delete(storageSelectionKey(type,id));renderPage('storage');showToast('Đã chuyển mục vào Lịch sử xóa.','success');}});break;}
    case 'restore-deleted':restoreDeletedItem(id);break;
    case 'purge-deleted':permanentlyDeleteItem(id);break;
    case 'purge-selected-recycle':{const count=state.deletedItems.length;if(count)requestConfirmation({eyebrow:'LỊCH SỬ XÓA · DỌN DẸP',title:'Xóa vĩnh viễn toàn bộ lịch sử?',message:`${count} mục sẽ bị xóa vĩnh viễn và không thể khôi phục.`,detail:'Hãy xuất bản sao lưu nếu cần giữ dữ liệu.',confirmLabel:'Xóa vĩnh viễn tất cả',cancelLabel:'Giữ lại',danger:true},()=>{const old=state.deletedItems;state.deletedItems=[];if(!saveState()){state.deletedItems=old;return;}renderPage('recycle');showToast('Đã xóa vĩnh viễn toàn bộ lịch sử xóa.','success');});break;}
    case 'reset-data':requestConfirmation({eyebrow:'CÀI ĐẶT · ĐẶT LẠI DỮ LIỆU',title:'Đặt lại toàn bộ dữ liệu?',message:'Ghi chú, tài liệu, kế hoạch, quiz, flashcard và tiến trình hiện tại sẽ bị thay thế bằng dữ liệu ban đầu.',detail:'Tài khoản vẫn được giữ lại. Hãy xuất bản sao lưu JSON trước khi tiếp tục.',confirmLabel:'Đặt lại dữ liệu',cancelLabel:'Hủy, giữ dữ liệu',danger:true},()=>{let users;try{users=readUsers();}catch(err){showToast(authStorageError(err,'Không thể đọc hồ sơ tài khoản.'),'error');return;}if(activePage==='documents'&&documentDirty&&!saveActiveDocument(true))return;const before=snapshotStudyState(),user=Object.hasOwn(users,currentUsername)?users[currentUsername]:null,display=user?.displayName||currentUsername;state=emptyState(display,user?.avatar||'🌙',user?.avatarImage||null);if(!saveMutationOrRollback(before))return;pageHistory=[];renderPage('dashboard',{recordHistory:false});showToast('Đã tạo lại dữ liệu học tập ban đầu.');});break;
    case 'copy-game-link':copyText('https://blackdragon-xd.itch.io/echo-collapse','Đã sao chép đường dẫn.','Không thể sao chép tự động; hãy mở trang game từ nút Chơi.');break;
    default:break;
  }
}
async function copyText(text,successMessage='Đã sao chép vào bộ nhớ tạm.',fallbackMessage='Không thể sao chép tự động.') { try{if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(text);showToast(successMessage,'success');}catch{const temp=document.createElement('textarea');temp.value=text;temp.setAttribute('readonly','');temp.style.position='fixed';temp.style.opacity='0';document.body.appendChild(temp);temp.select();let ok=false;try{ok=document.execCommand('copy');}catch(fallbackError){console.debug('Legacy clipboard command failed.',fallbackError);}temp.remove();showToast(ok?successMessage:fallbackMessage,ok?'success':'error');} }

/* Delegated events keep rerendered pages interactive. */
document.addEventListener('toggle',event=>{
  if(event.target.id!=='accentColorDetails'||!state?.settings)return;
  const expanded=event.target.open;
  if(state.settings.appearancePanelExpanded===expanded)return;
  const previous=state.settings.appearancePanelExpanded;
  state.settings.appearancePanelExpanded=expanded;
  if(!saveState())state.settings.appearancePanelExpanded=previous;
},{capture:true});
document.addEventListener('keydown',event=>{
  if(activePage!=='exam'||!getActiveExamSession()||event.repeat||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.target.closest('input,textarea,select,[contenteditable="true"],dialog')||$('#confirmOverlay')||$('#examIntegrityDialog'))return;
  const tag=event.target.tagName;
  if(tag==='BUTTON'&&(event.key===' '||event.key==='Enter'))return;
  const key=event.key.toLowerCase(),session=getActiveExamSession(),q=session?.questions[session.currentIndex||0];
  if(!q)return;
  if(event.key==='ArrowRight'){event.preventDefault();moveExamQuestion(1);}
  else if(event.key==='ArrowLeft'){event.preventDefault();moveExamQuestion(-1);}
  else if(key==='f'){event.preventDefault();toggleExamMarkForReview();}
  else if(key==='n'){event.preventDefault();examJumpNextUnanswered();}
  else if(/^[1-8]$/.test(key)&&!['short-answer','fill-blank'].includes(q.type)){
    const choice=Number(key)-1;if(choice<(q.options||[]).length){event.preventDefault();if(q.type==='multiple-select')toggleExamMultiAnswer(q.id,choice);else setExamOptionAnswer(q.id,choice);}
  }
});
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el)return;if(el.matches('button:disabled'))return;handleAction(el.dataset.action,el);});
$('#notificationOverlay').addEventListener('click',event=>{if(event.target===event.currentTarget)closeNotifications();});
$('#flashStudyOverlay').addEventListener('click',event=>{if(event.target===event.currentTarget)closeFlashStudyModal();});
document.addEventListener('keydown',event=>{
  if($('#writerRecallDialog')?.open||$('#masteryReviewDialog')?.open)return;
  if(event.altKey&&event.key==='ArrowLeft'&&!event.target.closest?.('input,textarea,[contenteditable="true"]')){event.preventDefault();goBack();return;}
  if((event.ctrlKey||event.metaKey)&&event.key==='Enter'&&activePage==='notes'&&event.target.closest?.('#noteForm')){const form=$('#noteForm');if(form){event.preventDefault();if(form.reportValidity())form.requestSubmit();}return;}
  const integrityDialog=$('#examIntegrityDialog');
  if(integrityDialog){
    if(event.key==='Escape'){event.preventDefault();closeExamIntegrityDialog();return;}
    if(event.key==='Tab'){
      const controls=$$('button:not([disabled]),a[href],[tabindex="0"]',integrityDialog).filter(node=>node.getClientRects().length);
      if(!controls.length){event.preventDefault();integrityDialog.querySelector('.exam-integrity-dialog')?.focus();return;}
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===integrityDialog.querySelector('.exam-integrity-dialog'))){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===integrityDialog.querySelector('.exam-integrity-dialog'))){event.preventDefault();first.focus();}
      return;
    }
  }
  const confirmation=$('#confirmOverlay'),notifications=$('#notificationOverlay'),notificationsOpen=notifications&&!notifications.classList.contains('hidden'),flashOverlay=$('#flashStudyOverlay'),flashStudyVisible=flashStudyOpen&&flashOverlay&&!flashOverlay.classList.contains('hidden');
  if(event.key==='Escape'){
    if(documentFocusMode&&!document.fullscreenElement&&!confirmation){event.preventDefault();setDocumentFocus(false);}
    else if(storageFullscreenMode&&!document.fullscreenElement){event.preventDefault();storageFullscreenMode=false;renderPage('storage',{recordHistory:false});}
    else if(confirmation){event.preventDefault();closeConfirmation(false);}
    else if(flashStudyVisible){event.preventDefault();closeFlashStudyModal();}
    else if(notificationsOpen)closeNotifications();
    else closeNoteViewer();
  } else if(event.key==='Tab'&&(confirmation||notificationsOpen||flashStudyVisible)){
    const overlay=confirmation||flashOverlay||notifications;
    const focusables=$$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',overlay).filter(el=>el.getClientRects().length);
    if(focusables.length){const first=focusables[0],last=focusables[focusables.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
  }
  if((event.key==='Enter'||event.key===' ')&&event.target.matches('[data-action="flip-card"]')){event.preventDefault();handleAction('flip-card',event.target);}
});
document.addEventListener('submit',event=>{
  const form=event.target;if(!(form instanceof HTMLFormElement))return;const formId=form.getAttribute('id')||'';
  if(formId==='flashDeckCreateForm'){event.preventDefault();saveFlashDeckForm(form);return;}if(formId==='flashCardCreateForm'){event.preventDefault();saveFlashcardForm(form);return;}if(formId==='examBankQuestionForm'){event.preventDefault();saveExamBankQuestion(form);return;}if(formId==='loginForm'){handleLogin(event);return;}if(formId==='signupForm'){handleSignup(event);return;}if(formId==='deadlineForm'){event.preventDefault();saveDeadline(form);return;}if(formId==='noteForm'){event.preventDefault();saveNote(form);return;}if(formId==='taskForm'){event.preventDefault();addTask(form);return;}if(formId==='resourceForm'){event.preventDefault();addResource(form);return;}if(formId==='focusForm'){event.preventDefault();const fd=new FormData(form),minutes=Number(fd.get('minutes'));if(!Number.isFinite(minutes)||minutes<1||minutes>180){showToast('Thời gian Focus Room phải từ 1 đến 180 phút.','error');return;}beginFocus(minutes,fd.get('subject'),fd.get('mode'),fd.get('ambient'),state.settings.focusTheme);return;}if(formId==='focusQuickTaskForm'){event.preventDefault();addFocusQuickTask(form);return;}if(formId==='profileForm'){
  event.preventDefault();const name=$('#profileDisplayName').value.trim();if(name.length<2){showToast('Tên hiển thị cần có ít nhất 2 ký tự.','error');return;}
  const before=snapshotStudyState();let usersBefore,users;
  try{usersBefore=readUsers();users=JSON.parse(JSON.stringify(usersBefore));}
  catch(err){showToast(authStorageError(err,'Không thể đọc hồ sơ tài khoản. Dữ liệu chưa thay đổi.'),'error');return;}
  state.profile.displayName=name;if(Object.hasOwn(users,currentUsername))users[currentUsername].displayName=name;
  try{writeUsers(users);}catch(err){state=JSON.parse(before);showToast('Không thể lưu hồ sơ vào bộ nhớ trình duyệt. Hãy kiểm tra dung lượng và thử lại.','error');console.error(err);return;}
  if(!saveMutationOrRollback(before)){try{writeUsers(usersBefore);}catch(err){console.error('Could not roll back profile metadata:',err);}return;}
  renderPage('profile');showToast('Đã cập nhật hồ sơ.','success');return;
}if(formId==='passwordForm'){event.preventDefault();changePassword(form);return;}
});
document.addEventListener('input',event=>{
  if(event.target.id==='customAccentPicker'){
    const hex=$('#customAccentHex');if(hex)hex.value=event.target.value.toUpperCase();
  }
  if(event.target.id==='customAccentHex'){
    const valid=normalizeAccentHex(event.target.value),picker=$('#customAccentPicker');
    event.target.setAttribute('aria-invalid',valid?'false':'true');if(valid&&picker)picker.value=valid;
  }
});
document.addEventListener('change',event=>{if(event.target.id==='customAccentPicker')saveCustomAccent(event.target.value);});
document.addEventListener('keydown',event=>{if(event.target.id==='customAccentHex'&&event.key==='Enter'){event.preventDefault();saveCustomAccent(event.target.value);}});
document.addEventListener('input',event=>{if(event.target.id==='quizTextAnswer')quizTextAnswer=event.target.value;if(event.target.id==='resourceSearch')filterResources();if(event.target.id==='storageSearch')filterStorage();if(event.target.id==='recycleSearch')filterRecycleBin();if(event.target.id==='noteSearch')filterNotes();if(event.target.id==='noteContent')updateNoteWritingStats();if(event.target.id==='documentSearch')filterDocumentLibrary();if(event.target.id==='documentTitle'){const doc=state.documents.find(d=>d.id===activeDocumentId);if(doc)doc.autoTitle=false;const toggle=$('#writerAutoTitle');if(toggle)toggle.checked=false;}if(['documentTitle','documentSubject','documentTags','wordEditor'].includes(event.target.id))queueDocumentSave();if(event.target.id==='wordEditor')updateDocumentOutline();});
document.addEventListener('change',event=>{if(event.target.id==='defaultStudySubject')applySetting('defaultSubject',SUBJECTS.includes(event.target.value)?event.target.value:'Khác');if(event.target.id==='examBankQuestionType'){const holder=$('#examBankQuestionTypeFields');if(holder)holder.innerHTML=quizQuestionTypeEditor(event.target.value);}if(event.target.id==='flashDeckFilter'){currentFlashcardDeckId=event.target.value||'all';flashIndex=0;flashRevealed=false;selectedFlashIds.clear();renderPage('flashcards',{recordHistory:false});}if(event.target.id==='quizSubjectFilter'){const filter=event.target.value||'all';$$('#quizLibraryList .quiz-card').forEach(card=>{const subject=card.querySelector('.quiz-card-top .pill')?.textContent||'Khác';card.classList.toggle('hidden',filter!=='all'&&subject!==filter);});}if(event.target.id==='notificationCategoryFilter'){notificationCategoryFilter=String(event.target.value||'all');renderNotificationCenter();}if(['resourceSubjectFilter','resourceTypeFilter','resourceSort'].includes(event.target.id))filterResources();if(['storageTypeFilter','storageSort'].includes(event.target.id))filterStorage();if(['recycleTypeFilter'].includes(event.target.id))filterRecycleBin();if(['noteSubjectFilter','noteSort'].includes(event.target.id))filterNotes();if(event.target.id==='docFontSize')applyDocumentFontSize(event.target.value);if(event.target.id==='docFontFamily')applyDocumentFontFamily(event.target.value);if(event.target.id==='documentImageInput'){const file=event.target.files?.[0];if(file)insertDocumentImageFile(file);event.target.value='';}if(event.target.id==='profileAvatarInput'){const file=event.target.files?.[0];if(file)void handleAvatarFile(file);event.target.value='';}if(event.target.id==='docBlockFormat'){const v=event.target.value;if(['P','H1','H2','H3','BLOCKQUOTE','PRE'].includes(v)){const editor=$('#wordEditor');if(editor){editor.focus();restoreDocumentSelection();document.execCommand('formatBlock',false,v);rememberDocumentSelection();queueDocumentSave();}}}if(event.target.id==='docTextColor'){const editor=$('#wordEditor');if(editor){editor.focus();restoreDocumentSelection();document.execCommand('foreColor',false,event.target.value);rememberDocumentSelection();queueDocumentSave();}}if(event.target.id==='docHighlightColor'){const editor=$('#wordEditor');if(editor){editor.focus();restoreDocumentSelection();document.execCommand('hiliteColor',false,event.target.value);rememberDocumentSelection();queueDocumentSave();}}if(event.target.id==='documentSubject'||event.target.id==='documentTags')queueDocumentSave();if(event.target.id==='documentTemplateSelect'&&event.target.value){const key=event.target.value;event.target.value='';createStudyDocument(key);}if(event.target.id==='importFileInput'){const file=event.target.files?.[0];if(file)importDataFile(file);}});
document.addEventListener('click',event=>{const menu=$('#documentActionsDropdown');if(menu&&!event.target.closest('.doc-actions-menu')){menu.classList.add('hidden');documentActionsOpen=false;$('.doc-actions-trigger')?.setAttribute('aria-expanded','false');}});
document.addEventListener('selectionchange',()=>{rememberDocumentSelection();});
document.addEventListener('mousedown',event=>{if(event.target.closest('.word-tool,.doc-icon-action,.doc-add-mini'))rememberDocumentSelection();if(event.target.closest('.word-tool'))event.preventDefault();});
document.addEventListener('paste',event=>{const editor=event.target.closest('#wordEditor');if(!editor)return;event.preventDefault();const clip=event.clipboardData,html=clip?.getData('text/html'),plain=clip?.getData('text/plain')||'';const safe=html?sanitizeDocumentHtml(html):escapeHtml(plain).replace(/\r?\n/g,'<br>');document.execCommand('insertHTML',false,safe);rememberDocumentSelection();queueDocumentSave();});
document.addEventListener('keyup',event=>{if(event.target.closest?.('#wordEditor'))rememberDocumentSelection();});
document.addEventListener('mouseup',event=>{if(event.target.closest?.('#wordEditor'))rememberDocumentSelection();});
document.addEventListener('keydown',event=>{
  if($('#writerRecallDialog')?.open||$('#masteryReviewDialog')?.open)return;
  if(activePage==='documents'&&$('#wordEditor')&&(event.ctrlKey||event.metaKey)){
    const key=event.key.toLowerCase();
    if(key==='s'){event.preventDefault();const ok=saveActiveDocument(true);showToast(ok?'Đã lưu tài liệu.':'Không thể lưu tài liệu.',ok?'success':'error');}
    else if(key==='f'){event.preventDefault();if(!documentToolsOpen)toggleWriterTools();$('#documentFindInput')?.focus();}
    else if(key==='h'){event.preventDefault();if(!documentToolsOpen)toggleWriterTools();$('#documentReplaceInput')?.focus();}
  }
  if(event.key==='Escape'&&documentActionsOpen){documentActionsOpen=false;$('#documentActionsDropdown')?.classList.add('hidden');$('.doc-actions-trigger')?.focus();}
});
window.addEventListener('pagehide',()=>{stopExamLockoutCountdown();if(activePage==='documents')saveActiveDocument(true);const session=getActiveExamSession();if(session?.status==='IN_PROGRESS'){if(session.strictFullscreen&&examFullscreenEstablished&&activePage==='exam'){handleExamIntegrityViolation(session,'PAGEHIDE');return;}const before=snapshotStudyState();session.status='INTERRUPTED';session.endedAt=Date.now();session.endReason='PAGEHIDE';if(!saveState()&&before){try{state=JSON.parse(before);}catch(err){console.error('Could not restore in-memory exam after interruption persistence failed:',err);}}}});
document.addEventListener('fullscreenchange',()=>{if(storageNativeFullscreen&&!document.fullscreenElement&&storageFullscreenMode){storageNativeFullscreen=false;storageFullscreenMode=false;if(activePage==='storage')renderPage('storage',{recordHistory:false});}const session=getActiveExamSession();if(session?.status==='IN_PROGRESS'&&session.strictFullscreen&&activePage==='exam'){if(document.fullscreenElement){examFullscreenEstablished=true;}else if(examFullscreenEstablished){examFullscreenEstablished=false;startExamExitPenalty(session);}}syncExamStrictLayout();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='hidden')return;const session=getActiveExamSession();if(session?.status==='IN_PROGRESS'&&session.strictFullscreen&&activePage==='exam'&&examFullscreenEstablished)handleExamIntegrityViolation(session,'TAB_HIDDEN');});
function registerOfflineAppShell(){
  // Service workers are available on HTTPS and localhost only. Keep the app fully
  // usable when unavailable, and never treat a failed registration as a data error.
  if(!('serviceWorker' in navigator)||!window.isSecureContext||location.protocol==='file:')return;
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js')
      .catch(error=>console.warn('Offline shell registration unavailable; normal browser caching remains active.',error));
  },{once:true});
}

$('#yearFooter').textContent=new Date().getFullYear();
registerOfflineAppShell();
startWallClock();
void watchBrowserNotificationPermission();

/* Restore the remembered local session until the user explicitly signs out.
   This is a convenience for this browser profile, not server-side authentication. */
try {
  const previous=String(localStorage.getItem(ACTIVE_KEY)||'').toLowerCase();
  const knownUsers=readUsers();
  if(previous&&Object.hasOwn(knownUsers,previous))enterApp(previous).catch(err=>{try{localStorage.removeItem(ACTIVE_KEY);}catch(storageError){console.error('Could not clear an invalid remembered local session.',storageError);}setAuthMessage(err?.message||'Không thể khôi phục phiên đăng nhập. Dữ liệu gốc được giữ nguyên.',true);});
  else if(previous)localStorage.removeItem(ACTIVE_KEY);
} catch(err) { if(err?.message)setAuthMessage(err.message,true); }
window.addEventListener('storage',event=>{
  if(currentUsername&&event.key===userDataKey(currentUsername)&&event.newValue!==lastPersistedStateRaw){
    showToast('Một tab khác đã cập nhật dữ liệu học tập. Tab này sẽ không ghi đè bản mới; hãy xuất dữ liệu cần giữ rồi tải lại trang.','warning');
  }
  if(event.key===USERS_KEY&&currentUsername){try{if(!Object.hasOwn(readUsers(),currentUsername))logout();}catch(err){logout();setAuthMessage(err?.message||'Kho tài khoản cục bộ không đọc được. Dữ liệu được giữ nguyên.',true);}}
  if(currentUsername&&event.key===focusSessionKey(currentUsername)&&focusStarted){
    const stored=readStoredFocusSession();if(stored&&stored.owner!==FOCUS_TAB_ID)releaseFocusToOtherTab();
  }
});

function autoSaveExamText(){
  const session=getActiveExamSession(),input=$('#examTextAnswer');
  if(!input||!session||session.status!=='IN_PROGRESS')return;
  const q=session.questions[session.currentIndex];if(!q||!['short-answer','fill-blank'].includes(q.type))return;
  const value=input.value.trim().slice(0,1000);
  const saved=saveExamSessionMutation(session,()=>{if(value)session.responses[q.id]=value;else delete session.responses[q.id];});
  const hint=input.closest('.exam-answer-text')?.querySelector('small');if(hint)hint.textContent=saved?(value?'Đã tự lưu câu trả lời.':'Đã xóa câu trả lời; câu này đang bỏ trống.'):'Chưa lưu được. Hãy sao chép câu trả lời trước khi rời trang.';
  const count=Object.keys(session.responses||{}).length,total=session.questions.length;
  if(saved){
    const bar=$('.exam-live-progress span'),progress=$('.exam-live-progress'),remaining=$('.exam-submit-box small');
    if(bar)bar.style.width=`${count/total*100}%`;
    if(progress)progress.setAttribute('aria-valuenow',String(count));
    const answered=$('.exam-v32-stats>div:nth-child(2) strong'),pending=$('.exam-v32-stats>div:nth-child(3) strong'),summary=$('.exam-map-count'),label=$('.exam-v32-progress-label b');
    if(answered)answered.textContent=String(count);if(pending)pending.textContent=String(total-count);
    if(summary)summary.textContent=`${count}/${total}`;
    if(label)label.textContent=`${Math.round(count/total*100)}%`;
    const unansweredFilter=$('[data-action="exam-filter"][data-value="unanswered"] b');
    if(unansweredFilter)unansweredFilter.textContent=String(total-count);
    if(remaining)remaining.textContent=total===count?'Đã trả lời hết. Hãy kiểm tra lại trước khi nộp.':`Còn ${total-count} câu chưa trả lời. Bạn vẫn có thể nộp bài.`;
    const next=$('[data-action="exam-next-unanswered"]');if(next)next.disabled=total===count;
  }
  const map=$(`.exam-number[data-index="${session.currentIndex}"]`);if(saved&&map)map.classList.toggle('is-answered',!!value);if(!$('.exam-map-tabs'))refreshStudioExamMap();
}
document.addEventListener('input',event=>{if(event.target.id==='examTextAnswer')autoSaveExamText();});
document.addEventListener('change',event=>{if(event.target.id==='webFontFamily'&&Object.hasOwn(WEB_FONTS,event.target.value)){applySetting('fontFamily',event.target.value);$('#webFontFamily')?.focus({preventScroll:true});}});

// Word workspace: mirror autosave feedback while auxiliary panels are hidden.
function enhanceWriterWorkspace(){
  writerStatusObserver?.disconnect();writerStatusObserver=null;
  if(activePage!=='documents'){$('#writerPrintStyle')?.remove();return;}
  const status=$('#documentSaveStatus'),live=$('#writerLiveStatus');
  if(status&&live){const sync=()=>{live.textContent=status.textContent;live.classList.toggle('is-error',/Chưa|chưa|vượt|Lỗi/.test(status.textContent));};sync();writerStatusObserver=new MutationObserver(sync);writerStatusObserver.observe(status,{childList:true,characterData:true,subtree:true});}
  if(documentFocusMode)setDocumentFocus(true);
  applyWriterPaper();
}
document.addEventListener('change',event=>{if(event.target.id==='writerZoom')setDocumentZoom(event.target.value);if(['writerPaperSize','writerOrientation','writerMargin'].includes(event.target.id)){applyWriterPaper();queueDocumentSave();}});
window.addEventListener('resize',()=>{const value=$('#writerZoom')?.value;if(value==='fit'||value==='page')setDocumentZoom(value);});
document.addEventListener('fullscreenchange',()=>{if(documentNativeFocus&&!document.fullscreenElement){documentNativeFocus=false;setDocumentFocus(false);}});

// 2.8: compact review panels and a local recall exercise based on the user's text.
function writerTitleFromText(text){
  const lines=String(text||'').normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g,'').split(/\r?\n/);
  const line=lines.map(x=>x.replace(/^\s{0,3}#{1,6}\s+/,'').replace(/\s+/g,' ').trim()).find(x=>/[\p{L}\p{N}]/u.test(x)&&!/^Bắt đầu viết tại đây[.…]*$/i.test(x))||'';
  const letters=Array.from(line);if(letters.length<=80)return line;
  const short=letters.slice(0,79).join(''),space=short.lastIndexOf(' ');return short.slice(0,space>45?space:short.length).trim()+'…';
}
function applyWriterAutoTitle(doc,editor,field){
  if(!field||doc.autoTitle===false||doc.autoTitleSeeded)return;
  if(doc.autoTitle!==true&&!['Tài liệu mới','Tài liệu chưa có tiêu đề'].includes(doc.title))return;
  const headings=editor.querySelectorAll?Array.from(editor.querySelectorAll('h1,h2,h3')).map(n=>n.textContent):[editor.querySelector('h1,h2,h3')?.textContent];
  const heading=headings.map(writerTitleFromText).find(Boolean);
  const title=writerTitleFromText(heading||editor.innerText||editor.textContent);
  // Wait for a meaningful first phrase; never rewrite accents or guess spelling.
  if(title&&Array.from(title).length>=8){doc.autoTitle=true;doc.autoTitleSeeded=true;field.value=title;}
}
function enhanceRefine28(){
  const panels=[{node:$('.exam-history'),key:'examHistory',rows:'.exam-history-row'},{node:$$('.review-section').find(n=>n.querySelector('h2')?.textContent==='Ôn lại câu từng sai'),key:'weakReview',rows:'.review-weak-row'}];
  for(const {node,key,rows} of panels){
    if(!node||node.querySelector('[data-fold-key]'))continue;
    const heading=node.querySelector('.section-heading');if(!heading)continue;
    const body=document.createElement('div');body.id='fold-'+key;body.className='study-fold-body';
    for(const child of [...node.childNodes])if(child!==heading)body.append(child);node.append(body);
    const button=document.createElement('button');button.type='button';button.className='button button-soft button-small study-fold-toggle';button.dataset.foldKey=key;button.setAttribute('aria-controls',body.id);
    const count=node.querySelectorAll(rows).length;button.dataset.count=String(count);heading.append(button);
    const collapsed=state.settings.collapsedStudyPanels?.[key]!==false;paintStudyFold(button,body,collapsed);
  }
}
function paintStudyFold(button,body,collapsed){body.hidden=collapsed;button.setAttribute('aria-expanded',String(!collapsed));button.textContent=collapsed?`Mở rộng (${button.dataset.count}) ▾`:'Thu gọn ▴';}
function writerRecallCards(blocks){
  const cards=[];let title='Phần mở đầu',lines=[];
  const flush=()=>{const text=lines.join('\n').trim();if(text)cards.push({title,text});lines=[];};
  for(const block of blocks){const text=String(block.text||'').trim();if(!text)continue;if(/^H[1-3]$/.test(block.tag)){flush();title=text;}else lines.push(text);}
  flush();return cards;
}
function openWriterRecall(){
  if($('#writerRecallDialog'))return;
  const editor=$('#wordEditor');if(!editor)return;
  let blocks=[...editor.children].map(n=>({tag:n.tagName,text:n.innerText||n.textContent||''}));
  if(!blocks.length)blocks=[{tag:'P',text:editor.innerText||editor.textContent||''}];
  const cards=writerRecallCards(blocks);if(!cards.length)return showToast('Hãy viết nội dung trước khi tự kiểm tra.','info');
  const dialog=document.createElement('dialog');dialog.id='writerRecallDialog';dialog.className='writer-recall-dialog';dialog.setAttribute('aria-labelledby','recallTitle');
  let index=0;const answers=cards.map(()=>''),revealed=new Set(),ratings=new Map();
  const render=()=>{const card=cards[index],show=revealed.has(index);dialog.innerHTML=`<header><div><p class="eyebrow">GHI NHỚ TỪ TRANG VIẾT</p><h2 id="recallTitle">Nhớ trước · Đối chiếu sau</h2></div><button type="button" class="button button-ghost" data-recall="close" aria-label="Đóng bài tự kiểm tra">Đóng ×</button></header><p class="text-muted">Nhắc lại ý chính bằng lời của bạn, rồi mở nội dung để tự đối chiếu. Không chấm điểm bằng AI; không sửa tài liệu gốc. Ghi chép ôn tập chỉ giữ trong cửa sổ này.</p><div class="recall-progress" role="status">Phần ${index+1}/${cards.length} · Đã tự đánh giá ${ratings.size}/${cards.length}</div><h3>${escapeHtml(card.title)}</h3><label for="recallAnswer">Bạn nhớ những ý nào?</label><textarea id="recallAnswer" class="text-area" rows="5" placeholder="Viết lại trước khi xem nội dung…">${escapeHtml(answers[index])}</textarea><button type="button" class="button button-primary" data-recall="reveal">${show?'Ẩn nội dung gốc':'Đối chiếu nội dung gốc'}</button>${show?`<div class="recall-source">${escapeHtml(card.text)}</div><div class="recall-ratings"><span>Tự đánh giá:</span><button type="button" class="button button-soft" data-recall="again" aria-pressed="${ratings.get(index)==='again'}">Cần ôn thêm</button><button type="button" class="button button-soft" data-recall="known" aria-pressed="${ratings.get(index)==='known'}">Đã nhớ ý chính</button></div>`:''}<footer><button type="button" class="button button-ghost" data-recall="prev" ${index===0?'disabled':''}>← Trước</button><button type="button" class="button button-soft" data-recall="weak" ${![...ratings.values()].includes('again')?'disabled':''}>Ôn phần chưa nhớ</button><button type="button" class="button button-ghost" data-recall="next" ${index===cards.length-1?'disabled':''}>Tiếp →</button></footer>`;};
  dialog.addEventListener('input',event=>{if(event.target.id==='recallAnswer')answers[index]=event.target.value;});
  dialog.addEventListener('click',event=>{const action=event.target.closest('[data-recall]')?.dataset.recall;if(!action)return;if(action==='close'){dialog.close();return;}if(action==='reveal'){if(revealed.has(index))revealed.delete(index);else revealed.add(index);}if(action==='again'||action==='known')ratings.set(index,action);if(action==='prev')index=Math.max(0,index-1);if(action==='next')index=Math.min(cards.length-1,index+1);if(action==='weak'){for(let n=1;n<=cards.length;n++){const target=(index+n)%cards.length;if(ratings.get(target)==='again'){index=target;revealed.delete(index);break;}}}render();dialog.querySelector(action==='prev'||action==='next'||action==='weak'?'textarea':'[data-recall="reveal"]')?.focus();});
  dialog.addEventListener('close',()=>{dialog.remove();$('[data-action="writer-recall"]')?.focus();},{once:true});
  ($('.document-studio')||document.body).append(dialog);render();dialog.showModal();
}
document.addEventListener('click',event=>{
  const fold=event.target.closest('[data-fold-key]');if(fold){const key=fold.dataset.foldKey,body=document.getElementById(fold.getAttribute('aria-controls'));if(!body)return;const collapsed=!body.hidden;if(aevoraSettings({collapsedStudyPanels:{...state.settings.collapsedStudyPanels,[key]:collapsed}}))paintStudyFold(fold,body,collapsed);}
  if(event.target.closest('[data-action="writer-recall"]'))openWriterRecall();
});
document.addEventListener('change',event=>{if(event.target.id==='writerAutoTitle'){const doc=state.documents.find(d=>d.id===activeDocumentId);if(doc){doc.autoTitle=event.target.checked;doc.autoTitleSeeded=false;queueDocumentSave();}}});
