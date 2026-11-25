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
        if(cells[i])cells[i].innerHTML=doctors.length?doctors.map(escape).join('<br>'):'휴진';
        if(mobile[i])mobile[i].textContent=doctors.join(' · ')||'휴진';
      });
      setMode('loaded');
      const changes=Object.entries(d.overrides||{}).filter(([date,entry])=>/^\d{4}-\d{2}-\d{2}$/.test(date)&&date>=todayKST&&entry&&typeof entry==='object').sort(([a],[b])=>a.localeCompare(b));
      if(status)status.innerHTML='<strong>진료 일정 변경 안내</strong><p>'+(changes.length?'예정된 휴진·대진 등 변경 일정을 확인해 주세요.':'현재 등록된 예정 변경 일정이 없습니다. 방문 전 전화로 확인하실 수 있습니다.')+'</p>';
      host.hidden=!changes.length;
      const markup=changes.length?'<div class="calendar-changes"><strong>예정된 변경 일정</strong>'+changes.map(([date,entry])=>'<p><b>'+escape(date.slice(0,4)+'년 '+Number(date.slice(5,7))+'월 '+Number(date.slice(8,10))+'일')+'</b> · '+escape(entry.note||(Array.isArray(entry.doctors)?entry.doctors.join(', ')||'휴진':'일정 변경'))+'</p>').join('')+'</div>':'';
      host.innerHTML=markup;
    })
    .catch(()=>stale('월별 일정을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.'));
})();
