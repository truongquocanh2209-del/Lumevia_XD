/* Pure, dependency-free import/choice integrity engine. No inferred answers. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ExamImport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function validate(question){
    const q={...question,options:[...(question.options||[])],labels:[...(question.labels||[])]};
    q.question=String(q.question||'').trim();q.rawAnswer=String(q.rawAnswer||'').trim();
    q.type=q.type||'multiple-choice';q.issues=[];q.verified=false;q.answers=[];q.correctOptionIds=[];delete q.answer;delete q.correctAnswer;
    if(q.type==='true-false'&&!q.options.length){q.options=['Đúng','Sai'];q.labels=['A','B'];}
    q.optionIds=q.options.map((_,i)=>`${q.id}-option-${i}`);
    if(!q.question)q.issues.push('Thiếu nội dung câu hỏi.');
    if(['short-answer','fill-blank'].includes(q.type)){
      q.correctAnswer=q.rawAnswer;if(!q.correctAnswer)q.issues.push('Chưa có đáp án: cần xác minh.');
    }else{
      let raw=q.rawAnswer.toUpperCase();
      if(q.type==='true-false')raw=/^(ĐÚNG|TRUE)$/.test(raw)?'A':/^(SAI|FALSE)$/.test(raw)?'B':raw;
      const tokens=raw.split(/[\s,;+]+/).filter(Boolean);
      const valid=tokens.length&&tokens.every(t=>/^[A-H]$/.test(t)&&q.labels.includes(t));
      if(q.options.length<2||q.options.length>8||q.options.some(x=>!String(x).trim()))q.issues.push('Cần 2–8 lựa chọn có nội dung.');
      if(new Set(q.labels).size!==q.labels.length)q.issues.push('Nhãn lựa chọn bị trùng.');
      if(!valid)q.issues.push('Đáp án thiếu hoặc không khớp nhãn lựa chọn.');
      if(valid){q.answers=[...new Set(tokens.map(t=>q.labels.indexOf(t)))];q.answer=q.answers[0];q.correctOptionIds=q.answers.map(i=>q.optionIds[i]);}
      if(q.type==='true-false'&&(q.options.length!==2||q.answers.length!==1))q.issues.push('Câu đúng/sai cần hai lựa chọn và một đáp án.');
      if(q.type!=='true-false')q.type=q.answers.length>1?'multiple-select':'multiple-choice';
    }
    if(q.question.length>3000||q.options.some(x=>x.length>1000)||q.rawAnswer.length>300)q.issues.push('Nội dung vượt giới hạn câu hỏi.');
    return q;
  }
  function cleanLine(line){return line.normalize('NFC').replace(/^\uFEFF/,'').replace(/\u00a0/g,' ').trim().replace(/^#{1,6}\s+/,'').replace(/\*\*/g,'');}
  function splitOptions(line){
    const matches=[...line.matchAll(/(?:^|\s+)([A-H])[.)]\s+/gi)];
    if(!matches.length||matches[0].index!==0)return [];
    return matches.map((m,i)=>({label:m[1].toUpperCase(),text:line.slice(m.index+m[0].length,matches[i+1]?.index??line.length).trim()}));
  }
  function parse(text,source='Tài liệu'){
    if(typeof text!=='string'||text.length>2000000)throw new Error('Tài liệu vượt giới hạn 2.000.000 ký tự. Hãy chia thành các phần nhỏ.');
    const lines=text.replace(/\r\n?/g,'\n').split('\n'),rows=[],keys=new Map();let current=null,inKey=false;
    const flush=()=>{if(!current)return;current.sourceText=lines.slice(current.sourceLine-1,current.endLine).join('\n');delete current.mode;rows.push(current);current=null;if(rows.length>1000)throw new Error('Chỉ xử lý tối đa 1.000 câu mỗi lần.');};
    lines.forEach((original,i)=>{
      const line=cleanLine(original);
      if(/^(?:BẢNG\s+ĐÁP\s+ÁN|ĐÁP\s+ÁN\s+TỔNG\s+HỢP|ANSWER\s+KEY)\s*:?$/i.test(line)){flush();inKey=true;return;}
      if(inKey){
        const re=/(?:^|[\s;|,]+)(?:Câu\s*)?(\d+)\s*[.):-]\s*([A-H](?:\s*[+,]\s*[A-H])*)(?=$|[\s;|,])/gi;
        for(const m of line.matchAll(re)){const n=Number(m[1]),a=m[2].replace(/\s/g,'').toUpperCase();keys.set(n,keys.has(n)&&keys.get(n)!==a?'!CONFLICT':a);}
        return;
      }
      const named=line.match(/^(?:Câu|Question|Q)\s*(\d+)(?:\s*[.):]\s*|\s+)(.*)$/i);
      const numbered=line.match(/^(\d+)[.):](?:\s+|$)(.*)$/);
      const start=named?[named[0],named[1],'',named[2]]:numbered?[numbered[0],'',numbered[1],numbered[2]]:null;
      if(start){flush();let title=start[3].trim(),type='multiple-choice';const marker=title.match(/^\[(ngắn|short|điền|fill|đúng\/sai|true\/false)\]\s*/i);if(marker){type=/^(ngắn|short)$/i.test(marker[1])?'short-answer':/^(điền|fill)$/i.test(marker[1])?'fill-blank':'true-false';title=title.slice(marker[0].length);}current={id:`import-${rows.length+1}`,sourceNumber:Number(start[1]||start[2]),question:title,type,options:[],labels:[],rawAnswer:'',explanation:'',sourceLabel:String(source).slice(0,120),sourceLine:i+1,endLine:i+1,mode:'question'};const inline=title.search(/\s+A[.)]\s+/);if(inline>=0){const options=splitOptions(title.slice(inline).trim());if(options.length>=2){current.question=title.slice(0,inline).trim();current.options=options.map(o=>o.text);current.labels=options.map(o=>o.label);current.mode='option';}}return;}
      if(!current)return;current.endLine=i+1;
      const answer=line.match(/^(?:Đáp\s*án|Answer|ĐA)\s*[:：]\s*(.*)$/i);if(answer){if(current.rawAnswer&&current.rawAnswer!==answer[1])current.answerConflict=true;current.rawAnswer=answer[1];current.mode='answer';return;}
      const explanation=line.match(/^(?:Giải thích|Lời giải|Explanation)\s*[:：]\s*(.*)$/i);if(explanation){current.explanation=explanation[1];current.mode='explanation';return;}
      const options=splitOptions(line);if(options.length&&current.mode!=='explanation'){for(const o of options){current.options.push(o.text);current.labels.push(o.label);}current.mode='option';return;}
      if(line){if(current.mode==='question')current.question+='\n'+line;else if(current.mode==='option')current.options[current.options.length-1]+='\n'+line;else if(current.mode==='explanation')current.explanation+='\n'+line;}
    });flush();
    const counts=new Map();rows.forEach(q=>counts.set(q.sourceNumber,(counts.get(q.sourceNumber)||0)+1));
    return rows.map(row=>{const key=keys.get(row.sourceNumber);if(key&&!row.rawAnswer)row.rawAnswer=key;const q=validate(row);
      if(counts.get(q.sourceNumber)>1)q.issues.push('Số câu bị trùng trong tài liệu; hãy kiểm tra nguồn.');
      if(row.answerConflict||key==='!CONFLICT'||key&&key.replace(/[\s,+;]/g,'')!==row.rawAnswer.toUpperCase().replace(/[\s,+;]/g,''))q.issues.push('Đáp án trong nguồn mâu thuẫn; cần kiểm tra lại.');
      return q;});
  }
  function shuffleChoices(question,random=Math.random){
    const q={...question,options:[...(question.options||[])],answers:[...(question.answers||[])]};
    if(!q.options.length||['short-answer','fill-blank'].includes(q.type))return q;
    const ids=Array.isArray(q.optionIds)&&q.optionIds.length===q.options.length?[...q.optionIds]:q.options.map((_,i)=>`${q.id}-option-${i}`);
    const correct=Array.isArray(q.correctOptionIds)&&q.correctOptionIds.length?[...q.correctOptionIds]:(q.type==='multiple-select'?q.answers:[q.answer]).map(i=>ids[i]);
    const pairs=q.options.map((text,i)=>({text,id:ids[i]}));for(let i=pairs.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pairs[i],pairs[j]]=[pairs[j],pairs[i]];}
    q.options=pairs.map(x=>x.text);q.optionIds=pairs.map(x=>x.id);q.correctOptionIds=correct;q.answers=correct.map(id=>q.optionIds.indexOf(id));q.answer=q.answers[0];return q;
  }
  function gradeChoices(q,response){
    const raw=Array.isArray(response)?response:[response];if(raw.some(x=>!Number.isInteger(x)||x<0||x>=q.optionIds.length))return false;
    const selected=raw.map(i=>q.optionIds[i]);if(new Set(selected).size!==selected.length)return false;
    return selected.length===q.correctOptionIds.length&&selected.every(id=>q.correctOptionIds.includes(id));
  }
  return {parse,validate,splitOptions,shuffleChoices,gradeChoices};
});
