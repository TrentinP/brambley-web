(async()=>{
const RAW='https://raw.githubusercontent.com/TrentinP/brambley-weather/main/',$=id=>document.getElementById(id),num=v=>v==null||v===''?null:(Number.isFinite(Number(v))?Number(v):null),n=(v,d=1)=>num(v)==null?'--':Number(v).toFixed(d);
async function text(path){const r=await fetch(RAW+path+'?v='+Date.now());if(!r.ok)throw Error(path);return r.text()}
function csv(s){const [h,...rs]=s.trim().split(/\r?\n/).map(x=>x.split(','));return rs.map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])))}
function clock(s){return new Date(s).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/Los_Angeles'})}
const LIVE='https://brambley-live-weather.trentin.workers.dev/current';
let current;
try{
  const archived=JSON.parse(await text('data/current.json'));
  let live=null;
  try{
    const lr=await fetch(LIVE+'?v='+Date.now(),{cache:'no-store'});
    if(lr.ok){const payload=await lr.json();if(payload&&payload.status==='ok')live=payload}
  }catch(e){console.warn('Live weather endpoint unavailable; using archive fallback.',e)}
  current=live?{...archived,...live,today:archived.today||{},measurements:live.measurements||archived.measurements}:archived;
  const m=current.measurements||{},today=current.today||{};
  $('brw-temp').textContent=n(m.temperature_c)+'°C';
  $('brw-feels').textContent='Feels like '+n(m.feels_like_c)+'°C';
  $('brw-daytemp').textContent='High '+n(today.temperature_high_c)+'°C · Low '+n(today.temperature_low_c)+'°C';
  $('brw-daytemp-mean').textContent='Mean '+n(today.temperature_mean_c)+'°C';
  $('brw-wind').textContent=n(m.wind_speed_kn)+' kn '+(m.wind_direction_compass||'');
  $('brw-gust').textContent=n(m.wind_gust_kn)+' kn';
  $('brw-humidity').textContent=n(m.humidity_pct,0)+'%';
  $('brw-rain').textContent=n(m.rain_daily_mm)+' mm';
  $('brw-rainrate').textContent=n(m.rain_rate_mm_hr)+' mm/hr';
  $('brw-dew').textContent=n(m.dew_point_c)+'°C';
  $('brw-pressure').textContent=n(m.pressure_relative_hpa)+' hPa';
  $('brw-solar').textContent=n(m.solar_radiation_w_m2,0)+' W/m²';
  $('brw-uv').textContent=n(m.uv_index);
  $('brw-time').textContent=current.observed_at_utc?clock(current.observed_at_utc):'--';
  const age=Date.now()-new Date(current.observed_at_utc).getTime();
  $('brw-status').textContent=age<20*60000?(live?'Station online':'Station online · archive feed'):'Data delayed';
}catch(e){$('brw-status').textContent='Data unavailable';console.error(e)}

try{const stamp=current?.observed_at_utc||new Date().toISOString(),parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(stamp)),pv=Object.fromEntries(parts.map(p=>[p.type,p.value])),day=pv.year+'-'+pv.month+'-'+pv.day,ym=day.slice(0,7),rows=csv(await text('data/observations/'+ym+'.csv')).filter(r=>(r.timestamp_local||'').slice(0,10)===day),labels=rows.map(r=>clock(r.timestamp_local)),axis={x:{ticks:{maxTicksLimit:4,color:'#51534c',font:{size:9}},grid:{display:false}}};
new Chart($('brw-rainrate-chart'),{type:'line',data:{labels,datasets:[{data:rows.map(r=>num(r.rain_rate_mm_hr)),borderColor:'#55728a',backgroundColor:'rgba(85,114,138,.12)',fill:true,borderWidth:1.6,pointRadius:0,tension:.15}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...axis,y:{beginAtZero:true,title:{display:true,text:'mm/hr'},ticks:{maxTicksLimit:5}}}}});
const ps=rows.map(r=>num(r.pressure_relative_hpa)).filter(v=>v!==null),pmin=ps.length?Math.floor(Math.min(...ps)-1):980,pmax=ps.length?Math.ceil(Math.max(...ps)+1):1040;new Chart($('brw-pressure-chart'),{type:'line',data:{labels,datasets:[{data:rows.map(r=>num(r.pressure_relative_hpa)),borderColor:'#5f6658',borderWidth:1.6,pointRadius:0,tension:.2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...axis,y:{min:pmin,max:pmax,title:{display:true,text:'hPa'},ticks:{maxTicksLimit:5}}}}});
new Chart($('brw-humidity-chart'),{type:'line',data:{labels,datasets:[{data:rows.map(r=>num(r.humidity_pct)),borderColor:'#66808a',backgroundColor:'rgba(102,128,138,.08)',fill:true,borderWidth:1.6,pointRadius:0,tension:.2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...axis,y:{min:0,max:100,title:{display:true,text:'%'},ticks:{maxTicksLimit:5}}}}});
const rains=rows.map(r=>num(r.rain_rate_mm_hr)).filter(v=>v!==null), hums=rows.map(r=>num(r.humidity_pct)).filter(v=>v!==null), winds=rows.map(r=>num(r.wind_speed_kn)).filter(v=>v!==null), suns=rows.map(r=>num(r.solar_radiation_w_m2)).filter(v=>v!==null);
$('brw-rain-stat').innerHTML='<b>MAX '+n(rains.length?Math.max(...rains):null,1)+'</b> mm/hr';
$('brw-pressure-stat').innerHTML='<b>HIGH '+n(ps.length?Math.max(...ps):null,1)+'</b> hPa<br><b>LOW '+n(ps.length?Math.min(...ps):null,1)+'</b> hPa';
$('brw-humidity-stat').innerHTML='<b>HIGH '+n(hums.length?Math.max(...hums):null,0)+'</b>%<br><b>LOW '+n(hums.length?Math.min(...hums):null,0)+'</b>%';
$('brw-wind-stat').innerHTML='<b>MAX '+n(winds.length?Math.max(...winds):null,1)+'</b> kn';
$('brw-sun-stat').innerHTML='<b>PEAK '+n(suns.length?Math.max(...suns):null,0)+'</b> W/m²';
new Chart($('brw-wind-chart'),{type:'line',data:{labels,datasets:[{data:rows.map(r=>num(r.wind_speed_kn)),borderColor:'#6e7168',backgroundColor:'rgba(110,113,104,.08)',fill:true,borderWidth:1.6,pointRadius:0,tension:.2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...axis,y:{beginAtZero:true,title:{display:true,text:'kn'},ticks:{maxTicksLimit:5}}}}});
new Chart($('brw-winddir-chart'),{type:'line',data:{labels,datasets:[{data:rows.map(r=>num(r.wind_direction_deg)),borderColor:'#77705f',borderWidth:1.5,pointRadius:0,tension:0,spanGaps:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...axis,y:{min:0,max:360,title:{display:true,text:'Direction'},ticks:{stepSize:90,callback:v=>({0:'N',90:'E',180:'S',270:'W',360:'N'}[v]||v)}}}}});
new Chart($('brw-sun-chart'),{type:'line',data:{labels,datasets:[{data:rows.map(r=>num(r.solar_radiation_w_m2)),borderColor:'#9a7b45',backgroundColor:'rgba(154,123,69,.10)',fill:true,borderWidth:1.6,pointRadius:0,tension:.18}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{...axis,y:{beginAtZero:true,title:{display:true,text:'W/m²'},ticks:{maxTicksLimit:5}}}}});}catch(e){console.error('Intraday charts:',e)}

try{
const all=csv(await text('data/historical/monthly_temperature_2007_2026.csv'));
let chart;
function renderTemp(range){
  const rows=range==='all'?all:all.slice(-12*Number(range));
  const rh=rows.map(x=>num(x.max_c)),ah=rows.map(x=>num(x.avg_high_c)),al=rows.map(x=>num(x.avg_low_c)),rl=rows.map(x=>num(x.min_c));
  const vals=[...rh,...ah,...al,...rl].filter(v=>v!==null);
  if(!vals.length)return;
  const lo=Math.floor(Math.min(...vals)/5)*5-5,hi=Math.ceil(Math.max(...vals)/5)*5+5;
  const data={labels:rows.map(x=>x.month),datasets:[
    {label:'Record high',data:rh,borderColor:'#a43b32',backgroundColor:'#a43b32',borderWidth:1.5,pointRadius:0,spanGaps:true},
    {label:'Average high',data:ah,borderColor:'#d28a3a',backgroundColor:'#d28a3a',borderWidth:2.5,pointRadius:0,spanGaps:true},
    {label:'Average low',data:al,borderColor:'#5683a6',backgroundColor:'#5683a6',borderWidth:2.5,pointRadius:0,spanGaps:true},
    {label:'Record low',data:rl,borderColor:'#315b85',backgroundColor:'#315b85',borderWidth:1.5,pointRadius:0,spanGaps:true}
  ]};
  if(chart){chart.data=data;chart.options.scales.y.min=lo;chart.options.scales.y.max=hi;chart.update()}
  else chart=new Chart($('brw-temp-chart'),{type:'line',data,options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{color:'#3f413b'}}},scales:{x:{ticks:{maxTicksLimit:10}},y:{min:lo,max:hi,title:{display:true,text:'Temperature (°C)'},ticks:{stepSize:5}}}}});
}
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
const byMonth=Array.from({length:12},()=>[]);
all.forEach(x=>{const hi=num(x.avg_high_c),lo=num(x.avg_low_c),mi=Number((x.month||'').slice(5,7))-1;if(mi>=0&&hi!==null&&lo!==null)byMonth[mi].push((hi+lo)/2)});
const means=byMonth.map(a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null),usable=means.filter(v=>v!==null);
if(usable.length){
 const warm=Math.max(...usable),cold=Math.min(...usable),wi=means.indexOf(warm),ci=means.indexOf(cold);
 $('brw-warm-month').textContent=monthNames[wi];$('brw-warm-detail').textContent=n(warm,1)+'°C mean · 2007–2026 monthly record';
 $('brw-cold-month').textContent=monthNames[ci];$('brw-cold-detail').textContent=n(cold,1)+'°C mean · 2007–2026 monthly record';
}
renderTemp('5');
$('brw-temp-range').onclick=e=>{const b=e.target.closest('button[data-years]');if(!b)return;$('brw-temp-range').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));renderTemp(b.dataset.years)};
}catch(e){console.error('Temperature chart:',e)}

try{const a=csv(await text('data/historical/monthly_rainfall_2020_2026.csv')),av=csv(await text('data/historical/rainfall_average_2020_2025.csv')),avg=Object.fromEntries(av.map(x=>[Number(x.month),num(x.average_rain_mm)])),normal=[10.91,6.65,7.74,5.35,2.99,2.01,.85,1.35,2.53,6.91,10.95,10.52].map(v=>v*25.4);const wet=a.filter(x=>num(x.monthly_rain_mm)!==null).reduce((p,x)=>num(x.monthly_rain_mm)>num(p.monthly_rain_mm)?x:p);$('brw-wet-month').textContent=n(wet.monthly_rain_mm,1)+' mm';$('brw-wet-detail').textContent=new Date(wet.month+'-02T12:00:00').toLocaleDateString('en-US',{month:'long',year:'numeric'})+' · monthly total';new Chart($('brw-rain-chart'),{data:{labels:a.map(x=>x.month),datasets:[{type:'bar',label:'Observed rainfall',data:a.map(x=>num(x.monthly_rain_mm)),backgroundColor:'rgba(79,98,56,.62)',borderColor:'#4f6238',borderWidth:1},{type:'line',label:'Brambley average (2020–2025)',data:a.map(x=>avg[Number(x.month.slice(5,7))]),borderColor:'#596451',backgroundColor:'#596451',pointRadius:0,borderWidth:2.2},{type:'line',label:'NOAA normal (1991–2020)',data:a.map(x=>normal[Number(x.month.slice(5,7))-1]),borderColor:'#9b603e',backgroundColor:'#9b603e',borderDash:[8,5],pointRadius:0,borderWidth:2.5}]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'index',intersect:false},plugins:{legend:{labels:{color:'#3f413b'}}},scales:{x:{ticks:{maxTicksLimit:14}},y:{beginAtZero:true,title:{display:true,text:'Rainfall (mm)'}}}}})}catch(e){console.error('Rainfall chart:',e)}

try{const solar=JSON.parse(await text('data/solar-resource.json')),all=(solar.daily||[]).filter(x=>num(x.kwh_m2)!==null&&(!x.complete||Number(x.kwh_m2)>0));
const valid=(solar.daily||[]).filter(x=>num(x.kwh_m2)!==null&&Number(x.kwh_m2)>0.03);
const latest=current?.observed_at_local?.slice(0,10)||valid.at(-1)?.date||'',ymNow=latest.slice(0,7),monthDays=valid.filter(x=>x.date.startsWith(ymNow)),todaySolar=(solar.daily||[]).find(x=>x.date===latest);
$('brw-solar-today').textContent=n(todaySolar?.kwh_m2,2)+' kWh/m²';
$('brw-solar-monthavg').textContent=n(monthDays.length?monthDays.reduce((s,x)=>s+Number(x.kwh_m2),0)/monthDays.length:null,2)+' kWh/m²/day';
const bright=valid.reduce((p,x)=>Number(x.kwh_m2)>Number(p.kwh_m2)?x:p),dark=valid.reduce((p,x)=>Number(x.kwh_m2)<Number(p.kwh_m2)?x:p);
const niceDate=d=>new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
$('brw-solar-bright').textContent=n(bright.kwh_m2,2)+' kWh/m²';$('brw-solar-bright-date').textContent=niceDate(bright.date);
$('brw-solar-dark').textContent=n(dark.kwh_m2,2)+' kWh/m²';$('brw-solar-dark-date').textContent=niceDate(dark.date);
const years={};valid.forEach(x=>{const y=x.date.slice(0,4);(years[y]??=[]).push(x)});
const annual=Object.entries(years).filter(([y,a])=>a.length>=330).map(([y,a])=>a.reduce((s,x)=>s+Number(x.kwh_m2),0)),annualMean=annual.length?annual.reduce((s,v)=>s+v,0)/annual.length:null;
$('brw-solar-annual').textContent=n(annualMean,0)+' kWh/m²/yr';$('brw-solar-power').textContent=n(annualMean===null?null:annualMean*.20,0)+' kWh/m²/yr';
let chart;function render(range){let rows=all;if(range!=='all'){const cutoff=new Date();cutoff.setFullYear(cutoff.getFullYear()-Number(range));rows=all.filter(x=>new Date(x.date+'T12:00:00')>=cutoff)}const data={labels:rows.map(x=>x.date),datasets:[{label:'Daily solar energy',data:rows.map(x=>num(x.kwh_m2)),borderWidth:2,pointRadius:rows.length<45?2:0,spanGaps:false,tension:.12}]};if(chart){chart.data=data;chart.update()}else chart=new Chart($('brw-solar-chart'),{type:'line',data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{maxTicksLimit:12}},y:{beginAtZero:true,title:{display:true,text:'Daily solar energy (kWh/m²)'}}}}})}render('1');$('brw-solar-range').onclick=e=>{const b=e.target.closest('button[data-years]');if(!b)return;$('brw-solar-range').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render(b.dataset.years)};const r=solar.seasonal_records||{};if(r.ready&&r.highest&&r.lowest){$('brw-solar-highmonth').textContent=r.highest.month_name;$('brw-solar-highdetail').textContent=n(r.highest.average_daily_kwh_m2,2)+' kWh/m²/day · '+r.highest.days_observed+' complete days observed.';$('brw-solar-lowmonth').textContent=r.lowest.month_name;$('brw-solar-lowdetail').textContent=n(r.lowest.average_daily_kwh_m2,2)+' kWh/m²/day · '+r.lowest.days_observed+' complete days observed.'}}catch(e){console.error('Solar resource:',e)}
})();
