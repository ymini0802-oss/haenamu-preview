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
    host.innerHTML='<p class="calendar-empty">원장별 진료 일정은 네이버 예약 또는 전화로 확인해 주세요.</p>';
  };
  // Clinic time: KST (UTC+09:00). This is independent of the visitor's phone timezone.
  const todayKST=new Date(Date.now()+9*60*60*1000).toISOString().slice(0,10);
  const thisMonth=todayKST.slice(0,7);

  fetch('schedule.json',{cache:'no-cache'})
    .then(response=>{if(!response.ok)throw Error('fetch failed');return response.json()})
    .then(d=>{
      if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(d.month)||!d.weekly||
        typeof d.weekly!=='object'||!Object.values(d.weekly).every(Array.isArray)){
        throw Error('invalid schedule');
      }
      const yearMonth=d.month;
      if(thisMonth>yearMonth){
        stale('등록된 일정은 '+yearMonth.replace('-','년 ')+'월 기준입니다. 현재 일정은 네이버 예약에서 확인해 주세요.');
        return;
      }
      setMode('loaded');
      const [year,month]=yearMonth.split('-').map(Number);
      if(status){
        const prefix=thisMonth===yearMonth?'이번 달':'등록된';
        status.innerHTML='<strong>'+year+'년 '+month+'월 진료 일정</strong><p>'+prefix+' 일정은 변경될 수 있습니다. 방문 전 네이버 예약에서 확인해 주세요.</p>';
      }
      const first=(new Date(year,month-1,1).getDay()+6)%7;
      const days=new Date(year,month,0).getDate();
      let markup='<div class="calendar-title"><strong>'+year+'년 '+month+'월</strong><span>진료 일정은 변경될 수 있습니다.</span></div>';
      markup+='<div class="calendar-grid" role="grid" aria-label="'+year+'년 '+month+'월 진료 달력">';
      ['월','화','수','목','금','토','일'].forEach(w=>markup+='<div class="calendar-head" role="columnheader">'+w+'</div>');
      for(let i=0;i<first;i++)markup+='<div class="calendar-cell empty" aria-hidden="true"></div>';
      for(let day=1;day<=days;day++){
        const date=yearMonth+'-'+String(day).padStart(2,'0');
        const weekday=new Date(year,month-1,day).getDay();
        const override=d.overrides&&d.overrides[date];
        const doctors=(override&&Array.isArray(override.doctors)?override.doctors:d.weekly[String(weekday)])||[];
        const today=date===todayKST;
        markup+='<div class="calendar-cell'+(override?' changed':'')+(today?' today':'')+'" role="gridcell" aria-label="'+escape(date+' '+doctors.join(' '))+'">';
        markup+='<strong>'+day+'</strong><span>'+doctors.map(escape).join('<br>')+'</span>';
        if(override&&override.note)markup+='<small>'+escape(override.note)+'</small>';
        markup+='</div>';
      }
      markup+='</div>';
      const changes=Object.entries(d.overrides||{}).filter(([date])=>
        date.startsWith(yearMonth+'-')&&date>=todayKST).sort(([a],[b])=>a.localeCompare(b));
      if(changes.length){
        markup+='<div class="calendar-changes" aria-label="앞으로의 진료 일정 변경"><strong>예정된 일정 변경</strong>';
        markup+=changes.map(([date,entry])=>
          '<p><b>'+Number(date.slice(-2))+'일</b> · '+
          escape(entry.note||(Array.isArray(entry.doctors)?entry.doctors.join(', '):'일정 변경'))+'</p>').join('');
        markup+='</div>';
      }
      host.innerHTML=markup;
    })
    .catch(()=>stale('월별 일정을 불러오지 못했습니다. 최신 일정은 네이버 예약에서 확인해 주세요.'));
})();
