/* Identify KakaoTalk webview without changing browser zoom. */
if (/KAKAOTALK/i.test(navigator.userAgent || '')) document.documentElement.classList.add('kakao-inapp');
(()=>{
  'use strict';
  const toggle=document.querySelector('.menu-button');
  const nav=document.getElementById('primary-nav');
  if(toggle&&nav){
    const close=()=>{
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','메뉴 열기');
      const symbol=toggle.querySelector('span');
      if(symbol)symbol.textContent='☰';
      nav.classList.remove('open');
    };
    toggle.addEventListener('click',()=>{
      const open=toggle.getAttribute('aria-expanded')!=='true';
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
      const symbol=toggle.querySelector('span');
      if(symbol)symbol.textContent=open?'✕':'☰';
      nav.classList.toggle('open',open);
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))close()});
  }

  const host=document.getElementById('schedule-calendar');
  const status=document.getElementById('schedule-status');
  if(!host)return;
  const section=document.getElementById('schedule');
  const setMode=mode=>section&&section.setAttribute('data-schedule-validation',mode);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colorNames=s=>escape(s).replace(/김성수|박세운|최영재/g,n=>'<span style="color:'+({'김성수':'#245b99','박세운':'#79529B','최영재':'#111111'}[n])+';font-weight:600">'+n+'</span>');
  const stale=message=>{
    setMode('stale');
    if(status)status.innerHTML='<strong>최신 일정 확인이 필요합니다</strong><p>'+escape(message)+'</p>';
    host.hidden=false;
    host.innerHTML='<p class="calendar-empty">급한 일정 확인이 필요한 경우 한의원으로 전화 문의해 주세요.</p>';
  };
  // Clinic time: KST (UTC+09:00). This is independent of the visitor's phone timezone.
  const todayKST=new Date(Date.now()+9*60*60*1000).toISOString().slice(0,10);
  const thisMonth=todayKST.slice(0,7);

  fetch('schedule.json',{cache:'no-cache'})
    .then(response=>{if(!response.ok)throw Error('fetch failed');return response.json()})
    .then(d=>{
      const names=['김성수','박세운','최영재'];
      if(!d.weekly||![0,1,2,3,4,5,6].every(i=>Array.isArray(d.weekly[i])&&d.weekly[i].every(n=>names.includes(n))))throw Error('invalid weekly schedule');
      const days=[1,2,3,4,5,6,0];
      const cells=section.querySelectorAll('.weekly-table tbody td');
      const mobile=section.querySelectorAll('.weekly-mobile div span');
      days.forEach((day,i)=>{
        const doctors=d.weekly[day];
        if(cells[i])cells[i].innerHTML=doctors.length?doctors.map(colorNames).join('<br>'):'휴진';
        if(mobile[i])mobile[i].innerHTML=doctors.map(colorNames).join(' · ')||'휴진';
      });
      setMode('loaded');
      const changes=Object.entries(d.overrides||{}).filter(([date,entry])=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&date>=todayKST&&entry&&typeof entry==='object').sort(([a],[b])=>a.localeCompare(b));
      if(status)status.innerHTML='<strong>진료 일정 변경 안내</strong><p>'+(changes.length?'예정된 휴진·대진 등 변경 일정을 확인해 주세요.':'현재 등록된 예정 변경 일정이 없습니다. 방문 전 전화로 확인하실 수 있습니다.')+'</p>';
      host.hidden=!changes.length;
      const markup=changes.length?'<div class="calendar-changes"><strong>예정된 변경 일정</strong>'+changes.map(([date,entry])=>'<p><b>'+escape(date.slice(0,4)+'년 '+Number(date.slice(5,7))+'월 '+Number(date.slice(8,10))+'일')+'</b> · '+colorNames(entry.note||(Array.isArray(entry.doctors)?entry.doctors.join(', ')||'휴진':'일정 변경'))+'</p>').join('')+'</div>':'';
      host.innerHTML=markup;
    })
    .catch(()=>stale('월별 일정을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.'));
})();

/* FAQ: keep every question in the HTML, reveal the first five initially. */
(()=>{
  const init=()=>{
    document.querySelectorAll('.detail-faq').forEach((faq,index)=>{
      if(faq.querySelector('.faq-more-toggle'))return;
      const questions=Array.from(faq.children).filter(el=>el.tagName==='DETAILS');
      const limit=5;
      if(questions.length<=limit)return;
      const remaining=questions.slice(limit);
      const group=document.createElement('div');
      let id='faq-extra-'+(index+1);
      while(document.getElementById(id))id+='-more';
      group.id=id;
      group.className='faq-extra';
      group.hidden=true;
      const button=document.createElement('button');
      button.type='button';
      button.className='faq-more-toggle';
      button.setAttribute('aria-controls',id);
      button.setAttribute('aria-expanded','false');
      const label=document.createElement('span');
      label.textContent='질문 더 보기 ('+remaining.length+'개)';
      const arrow=document.createElement('span');
      arrow.className='faq-more-arrow';
      arrow.setAttribute('aria-hidden','true');
      button.append(label,arrow);
      faq.append(group,button);
      remaining.forEach(question=>group.appendChild(question));
      button.addEventListener('click',()=>{
        const expand=group.hidden;
        group.hidden=!expand;
        button.setAttribute('aria-expanded',String(expand));
        label.textContent=expand?'질문 접기':'질문 더 보기 ('+remaining.length+'개)';
        if(!expand){
          const rect=button.getBoundingClientRect();
          if(rect.top<0||rect.bottom>window.innerHeight)button.scrollIntoView({block:'nearest'});
        }
      });
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
