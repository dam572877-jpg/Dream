
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const money=n=>n==null||n===''?'—':Number(n).toLocaleString('en-US')+' جنيه';
const WA_SVG='<svg viewBox="0 0 32 32" width="15" height="15"><path fill="#25D366" d="M16.001 3C9.383 3 4 8.383 4 15c0 2.386.703 4.605 1.918 6.464L4 29l7.75-1.868A11.94 11.94 0 0016 27c6.617 0 12-5.383 12-12S22.618 3 16.001 3zm.001 21.818c-1.94 0-3.76-.51-5.34-1.4l-.383-.219-4.598 1.107 1.127-4.482-.245-.397A9.77 9.77 0 015.818 15c0-5.615 4.567-10.182 10.183-10.182 5.615 0 10.182 4.567 10.182 10.182s-4.567 10.182-10.182 10.182zm5.579-7.62c-.306-.153-1.809-.892-2.089-.994-.28-.102-.484-.153-.688.153-.204.306-.789.994-.967 1.198-.178.204-.357.229-.663.076-.306-.153-1.293-.477-2.463-1.522-.911-.812-1.527-1.815-1.705-2.121-.178-.306-.019-.472.134-.624.138-.137.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.051-.382-.026-.535-.076-.153-.688-1.658-.943-2.27-.248-.596-.5-.516-.688-.526l-.586-.01c-.204 0-.535.076-.815.382-.28.306-1.068 1.044-1.068 2.546 0 1.502 1.093 2.955 1.245 3.159.153.204 2.15 3.283 5.209 4.603.728.314 1.296.502 1.739.642.731.232 1.396.199 1.922.121.586-.087 1.809-.74 2.064-1.454.255-.714.255-1.325.178-1.454-.076-.128-.28-.204-.586-.357z"/></svg>';
function waHref(phone){let d=String(phone||'').replace(/[٠-٩]/g,x=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(x))).replace(/\D/g,'');if(!d)return'';if(d.startsWith('0'))d='2'+d;else if(!d.startsWith('20'))d='20'+d;return'https://wa.me/'+d}
function waBtn(phone){return phone?` <a class="wa-btn" href="${waHref(phone)}" target="_blank" rel="noopener" title="مراسلة واتساب">${WA_SVG}</a>`:''}
const KEY='dream_house_static_v1', AUTH='dream_house_auth_v1';
let props=[],clients=[];
let selectedPropertyIds=new Set();
const EMPTY_DB=()=>({properties:[],clients:[],seq:1});
function db(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return EMPTY_DB();
    const d=JSON.parse(raw);
    return {
      properties:Array.isArray(d.properties)?d.properties:[],
      clients:Array.isArray(d.clients)?d.clients:[],
      seq:Number(d.seq)||1
    };
  }catch{return EMPTY_DB();}
}
function saveDB(d){
  try{localStorage.setItem(KEY,JSON.stringify(d));return true}
  catch(err){toast('مساحة التخزين ممتلئة. احذف صورًا قديمة أو استخدم النسخة الاحتياطية.');return false}
}
function showLogin(){$('#app').classList.add('hidden');$('#login').classList.remove('hidden')}
function showApp(){$('#login').classList.add('hidden');$('#app').classList.remove('hidden');loadAll()}
function toast(t){const x=$('#toast');x.textContent=t;x.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove('show'),2400)}
function auth(){return sessionStorage.getItem(AUTH)==='1'}
function boot(){if(auth()){showApp()}else showLogin()}
boot();
const togglePassword=$('#togglePassword');
if(togglePassword) togglePassword.onclick=()=>{const p=$('#password');const show=p.type==='password';p.type=show?'text':'password';togglePassword.textContent=show?'◌':'◉';};
$('#loginForm').onsubmit=e=>{e.preventDefault();$('#loginError').textContent='';const btn=document.querySelector('.login-submit');if(btn){btn.disabled=true;btn.classList.add('is-loading');setTimeout(()=>btn.classList.remove('is-loading'),500)}if($('#username').value.trim()==='admin'&&$('#password').value==='112203'){sessionStorage.setItem(AUTH,'1');$('#who').textContent='Engineer Ahmed Galal';showApp()}else{if(btn)btn.disabled=false;$('#loginError').textContent='Incorrect username or password'}};
$('#logout').onclick=()=>{sessionStorage.removeItem(AUTH);showLogin()};
const titles={dashboard:'لوحة المكتب',properties:'إدارة العقارات',clients:'إدارة العملاء',requests:'طلبات العملاء',reports:'البيانات و PDF'};
$$('.nav button').forEach(b=>b.onclick=()=>{$$('.section').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.page).classList.add('active');$$('.nav button').forEach(x=>x.classList.toggle('active',x===b));$('#pageTitle').textContent=titles[b.dataset.page];if(b.dataset.page==='dashboard')renderDash();if(b.dataset.page==='properties')loadProps();if(b.dataset.page==='clients')loadClients();if(b.dataset.page==='requests')loadRequestDesk()});
function loadAll(){renderDash();loadProps();loadClients();loadRequestDesk()}
function renderDash(){const d=db();props=d.properties;clients=d.clients;$('#sp').textContent=props.length;$('#sa').textContent=props.filter(x=>x.status==='متاح').length;$('#sc').textContent=clients.length;$('#sf').textContent=clients.filter(x=>x.status==='متابعة').length;$('#dashProps').innerHTML=props.slice(-6).reverse().map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.area)}</td><td>${x.size||'—'} م²</td><td>${money(x.price)}</td><td><span class="badge ${x.status!=='متاح'?'red':''}">${esc(x.status)}</span></td></tr>`).join('')||'<tr><td colspan="5">لا توجد بيانات</td></tr>';$('#dashClients').innerHTML=clients.slice(-6).reverse().map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.phone)}</td><td>${esc(x.need||'—')}</td></tr>`).join('')||'<tr><td colspan="3">لا توجد بيانات</td></tr>'}
let timer;function scheduleProps(){clearTimeout(timer);timer=setTimeout(loadProps,120)}['q','area','minPrice','maxPrice','minSize','maxSize','rooms','status'].forEach(id=>{const e=$('#'+id);if(e)e.addEventListener(e.tagName==='SELECT'?'change':'input',scheduleProps)});
function quickArea(v){document.querySelector('[data-page=properties]').click();$('#area').value=v;loadProps()}function quickType(v){document.querySelector('[data-page=properties]').click();const q=$('#q');q.value=v;loadProps()}function quickPrice(v){$('#maxPrice').value=v;loadProps()}function clearFilters(){['q','area','minPrice','maxPrice','minSize','maxSize','rooms','status'].forEach(id=>$('#'+id).value='');loadProps()}
function updateSelectedCount(){const el=$('#selectedCount');if(el){const total=db().properties.length;el.textContent=`${selectedPropertyIds.size} عقار محدد من ${total}`;}const badge=$('#selectedBadge');if(badge)badge.textContent=String(selectedPropertyIds.size);}
function togglePropertySelection(id){id=Number(id);if(selectedPropertyIds.has(id))selectedPropertyIds.delete(id);else selectedPropertyIds.add(id);loadProps();}
function clearPropertySelection(){selectedPropertyIds.clear();loadProps();toast('تم إلغاء اختيار العقارات');}
function selectVisibleProperties(){const visible=Array.isArray(props)?props:[];visible.forEach(x=>selectedPropertyIds.add(Number(x.id)));loadProps();toast(`تم اختيار ${visible.length} عقار ظاهر`);}
function selectAllProperties(){const all=db().properties||[];all.forEach(x=>selectedPropertyIds.add(Number(x.id)));loadProps();toast(`تم اختيار كل العقارات — ${all.length}`);}
function syncSelectedWithDatabase(){const ids=new Set((db().properties||[]).map(x=>Number(x.id)));selectedPropertyIds.forEach(id=>{if(!ids.has(Number(id)))selectedPropertyIds.delete(Number(id))});}
function reportSelectedProperties(mode='pdf'){syncSelectedWithDatabase();if(!selectedPropertyIds.size){toast('اختار عقارًا واحدًا على الأقل أولاً');return}const ids=Array.from(selectedPropertyIds);toast(`جاري تجهيز ${ids.length} عقار في تقرير واحد…`);report('properties',mode,ids);}
function loadProps(){syncSelectedWithDatabase();const d=db();let p=d.properties;const q=$('#q').value.trim().toLowerCase(),area=$('#area').value.trim().toLowerCase(),minP=Number($('#minPrice').value)||0,maxP=Number($('#maxPrice').value)||Infinity,minS=Number($('#minSize').value)||0,maxS=Number($('#maxSize').value)||Infinity,rooms=Number($('#rooms').value)||0,status=$('#status').value;p=p.filter(x=>(!q||[x.name,x.code,x.area,x.type,x.locationDetail,x.license,x.meters,x.landShare,x.delivery,x.payment,x.notes].join(' ').toLowerCase().includes(q))&&(!area||String(x.area).toLowerCase().includes(area))&&Number(x.price||0)>=minP&&Number(x.price||0)<=maxP&&Number(x.size||0)>=minS&&Number(x.size||0)<=maxS&&(!rooms||Number(x.rooms||0)===rooms)&&(!status||x.status===status));props=p;$('#propertyGrid').innerHTML=p.map(x=>`<article class="card property selectable ${selectedPropertyIds.has(Number(x.id))?'selected':''}"><button type="button" class="property-select" onclick="event.stopPropagation();togglePropertySelection(${x.id})" title="اختيار للتقرير"><svg viewBox="0 0 24 24"><path d="M5 12.5 9.5 17 19 7.5"/></svg></button>${x.image_url?`<img src="${x.image_url}" alt="${esc(x.name)}">`:'<div class="ph">DREAM HOUSE</div>'}<div class="body"><div class="code">${esc(x.code||'PROPERTY')}</div><h4>${esc(x.name)}</h4><div class="muted">${esc(x.area)} • ${x.size||'—'} م² • الدور ${esc(x.floor||'—')}</div><div class="muted">${x.rooms||'—'} غرف • ${x.baths||'—'} حمام • ${x.totalFloors?`عدد الأدوار ${x.totalFloors} • `:''}${esc(x.finish||'—')}</div><div class="property-meta-line">${esc(x.locationDetail||'')} ${x.license&&x.license!=='غير محدد'?`• ${esc(x.license)}`:''} ${esc(x.meters||'')}</div><div class="price">${money(x.price)}</div><span class="badge ${x.status!=='متاح'?'red':''}">${esc(x.status)}</span><div class="actions"><button class="btn dark" onclick="event.stopPropagation();editProperty(${x.id})">تعديل</button><button class="btn danger" onclick="event.stopPropagation();deleteProperty(${x.id})">حذف</button></div></div></article>`).join('')||'<div class="panel empty" style="grid-column:1/-1">لا توجد عقارات مطابقة للبحث</div>';updateSelectedCount();}
$('#cq').addEventListener('input',loadClients);function loadClients(){const q=$('#cq').value.trim().toLowerCase();clients=db().clients.filter(x=>[x.name,x.phone,x.area,x.need].join(' ').toLowerCase().includes(q));$('#clientBody').innerHTML=clients.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td><div class="phone-cell">${esc(x.phone)}${waBtn(x.phone)}</div></td><td>${esc(x.need||'—')}</td><td>${esc(x.area||'—')}</td><td>${money(x.budget)}</td><td><span class="badge gold">${esc(x.status)}</span></td><td><button class="btn soft" onclick="matchClient(${x.id})">مطابقة</button> <button class="btn dark" onclick="editClient(${x.id})">تعديل</button> <button class="btn danger" onclick="deleteClient(${x.id})">حذف</button></td></tr>`).join('')||'<tr><td colspan="7" style="text-align:center">لا توجد بيانات</td></tr>';const cm=$('#clientCards');if(cm)cm.innerHTML=clients.map(x=>`<article class="client-mobile-card"><div class="client-mobile-top"><div><div class="client-mobile-name">${esc(x.name)}</div><div class="client-mobile-phone">${esc(x.phone||'—')}</div></div><span class="badge gold">${esc(x.status||'جديد')}</span></div><div class="client-mobile-grid"><div><span>الطلب</span><b>${esc(x.need||'—')}</b></div><div><span>المنطقة</span><b>${esc(x.area||'—')}</b></div><div><span>الميزانية</span><b>${money(x.budget)}</b></div></div><div class="client-mobile-actions">${x.phone?`<a class="wa-mobile" href="${waHref(x.phone)}" target="_blank" rel="noopener">${WA_SVG} واتساب</a>`:''}<button class="btn dark" onclick="matchClient(${x.id})">مطابقة عقار</button><button class="btn soft" onclick="editClient(${x.id})">تعديل</button><button class="btn danger" onclick="deleteClient(${x.id})">حذف</button></div></article>`).join('')||'<div class="empty">لا توجد بيانات عملاء</div>'}

/* V10 Smart Client Requests — natural Arabic office queries */
function normalizeArabic(v=''){
  return String(v).toLowerCase().replace(/[٠-٩]/g,d=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[إأآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/ؤ/g,'و').replace(/ئ/g,'ي').replace(/[،,]/g,' ').replace(/\s+/g,' ').trim();
}
function parseMoneyFromRequest(raw){
  const s=normalizeArabic(raw);
  const digit=s.match(/(?:\d+(?:\.\d+)?)\s*(?:مليون|مليونه|مليونين)/i);
  if(digit){
    const n=parseFloat(digit[1]);
    return n*(/مليونين/.test(digit[0])?2000000:1000000);
  }
  const words={
    'نص مليون':500000,'نصف مليون':500000,'مليون':1000000,'مليونين':2000000,'اتنين مليون':2000000,'اثنين مليون':2000000,
    'تلاته مليون':3000000,'ثلاثه مليون':3000000,'ثلاثة مليون':3000000,'تلات مليون':3000000,
    'اربعه مليون':4000000,'اربعة مليون':4000000,'خمس مليون':5000000,'خمسه مليون':5000000,
    'ست مليون':6000000,'سته مليون':6000000,'سبع مليون':7000000,'سبعه مليون':7000000,
    'تمان مليون':8000000,'تمانيه مليون':8000000,'تسع مليون':9000000,'تسعه مليون':9000000,
    'عشره مليون':10000000,'عشرة مليون':10000000,'عشر مليون':10000000
  };
  for(const [k,val] of Object.entries(words)) if(s.includes(normalizeArabic(k))) return val;
  const plain=s.match(/\b\d{3,}(?:\.\d+)?\b/); if(plain) return Number(plain[0]);
  return 0;
}
function requestType(raw){
  const s=normalizeArabic(raw);
  if(/شقق|شقه/.test(s))return 'شقه';
  if(/عمارات|عماره/.test(s))return 'عماره';
  if(/بيوت|بيت/.test(s))return 'بيت';
  if(/فلل|فيلا/.test(s))return 'فيلا';
  if(/محلات|محل/.test(s))return 'محل';
  if(/اراضي|ارض/.test(s))return 'ارض';
  return '';
}
function clientMatchesRequest(c, raw){
  const q=normalizeArabic(raw), type=requestType(q), budget=parseMoneyFromRequest(q), need=normalizeArabic(c.need||'');
  const typeOK=!type||need.includes(type);
  if(!typeOK)return false;
  if(!budget)return true;
  const cb=Number(c.budget||0);
  if(!cb)return false;
  return cb>=budget*0.9 && cb<=budget*1.1;
}
function requestMatchLabel(raw){
  const type=requestType(raw), budget=parseMoneyFromRequest(raw);
  return [type?`نوع: ${type}`:'كل الأنواع',budget?`ميزانية: ${money(budget)}`:'كل الميزانيات'].join('  •  ');
}
function setClientRequest(v){$('#rq').value=v;runClientRequest()}
function runClientRequest(){
  const raw=$('#rq')?.value?.trim()||'';
  const all=db().clients||[];
  const result=raw?all.filter(c=>clientMatchesRequest(c,raw)):all;
  const box=$('#requestResults'),count=$('#rqCount');
  if(count)count.textContent=`${result.length} عميل`;
  if(box)box.innerHTML=result.map((c,i)=>`<div class="request-result"><span class="rq-mark">${String(i+1).padStart(2,'0')}</span><div><b>${esc(c.name||'بدون اسم')}</b><small>${esc(c.need||'—')} • ${esc(c.area||'كل المناطق')} • ${esc(c.phone||'بدون هاتف')}</small></div><span class="rq-budget">${money(c.budget)}</span></div>`).join('')||'<div class="request-empty">لا يوجد عميل مطابق لهذا الطلب. جرّب نوعًا أو ميزانية مختلفة.</div>';
  if(raw)toast(`تم العثور على ${result.length} عميل — ${requestMatchLabel(raw)}`);
}
function loadRequestDesk(){
  const all=db().clients||[],body=$('#requestAllClients');
  if(body)body.innerHTML=all.map(c=>`<tr><td><b>${esc(c.name||'—')}</b></td><td>${esc(c.phone||'—')}</td><td>${esc(c.need||'—')}</td><td>${esc(c.area||'—')}</td><td>${money(c.budget)}</td><td><span class="badge gold">${esc(c.status||'جديد')}</span></td></tr>`).join('')||'<tr><td colspan="6" style="text-align:center">لا توجد بيانات عملاء</td></tr>';
  if($('#rq')&&!$('#rq').value) {$('#rqCount').textContent='0 عميل';$('#requestResults').innerHTML='<div class="request-empty">اكتب طلبًا أو اختر مثالًا جاهزًا للبدء.</div>'}
}
function openProperty(x=null){$('#pmTitle').textContent=x?'تعديل العقار':'إضافة عقار';$('#pf').reset();$('#pf [name=id]').value=x?.id||'';if(x)Object.keys(x).forEach(k=>{const e=$(`#pf [name="${k}"]`);if(e&&k!=='image_url')e.value=x[k]??''});$('#propertyModal').classList.add('show')}
function openClient(x=null){$('#cmTitle').textContent=x?'تعديل العميل':'إضافة عميل';$('#cf').reset();$('#cf [name=id]').value=x?.id||'';if(x)Object.keys(x).forEach(k=>{const e=$(`#cf [name="${k}"]`);if(e)e.value=x[k]??''});$('#clientModal').classList.add('show')}
function closeModal(id){$('#'+id).classList.remove('show')}
function editProperty(id){const x=db().properties.find(p=>p.id===id);if(x)openProperty(x)}function editClient(id){const x=db().clients.find(p=>p.id===id);if(x)openClient(x)}
function readImage(file){
  return new Promise((resolve,reject)=>{
    if(!file||!file.size)return resolve('');
    if(file.size>12*1024*1024)return reject(new Error('الصورة كبيرة جدًا — اختار صورة أقل من 12MB'));
    const r=new FileReader();
    r.onerror=()=>reject(new Error('تعذر قراءة الصورة'));
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=1400, scale=Math.min(1,max/Math.max(img.width,img.height));
        const c=document.createElement('canvas');
        c.width=Math.max(1,Math.round(img.width*scale));
        c.height=Math.max(1,Math.round(img.height*scale));
        const ctx=c.getContext('2d',{alpha:false});
        ctx.drawImage(img,0,0,c.width,c.height);
        const out=c.toDataURL('image/jpeg',0.78);
        resolve(out);
      };
      img.onerror=()=>reject(new Error('الصورة غير صالحة'));
      img.src=r.result;
    };
    r.readAsDataURL(file);
  });
}
$('#pf').onsubmit=async e=>{e.preventDefault();try{const f=e.target,fd=new FormData(f),d=db(),id=fd.get('id');let image='';const file=f.querySelector('[name=image]').files[0];if(file)image=await readImage(file);let x=Object.fromEntries(fd.entries());delete x.id;delete x.image;x.size=Number(x.size)||0;x.price=Number(x.price)||0;x.rooms=Number(x.rooms)||0;x.baths=Number(x.baths)||0;x.floor=String(x.floor||'').trim();x.totalFloors=Number(x.totalFloors)||0;if(image)x.image_url=image;let item;if(id){const i=d.properties.findIndex(p=>p.id===Number(id));item={...d.properties[i],...x};d.properties[i]=item}else{item={...x,id:Date.now(),code:x.code||'DH-'+String(d.seq++).padStart(4,'0'),createdAt:new Date().toISOString()};d.properties.push(item)}if(!saveDB(d))return;closeModal('propertyModal');toast('تم حفظ العقار بنجاح');loadAll()}catch(err){toast(err.message)}};
$('#cf').onsubmit=e=>{e.preventDefault();const f=e.target,d=db(),id=f.id.value,x=Object.fromEntries(new FormData(f).entries());delete x.id;x.budget=Number(x.budget)||0;x.min_size=Number(x.min_size)||0;x.max_size=Number(x.max_size)||0;x.rooms=Number(x.rooms)||0;if(id){const i=d.clients.findIndex(p=>p.id===Number(id));d.clients[i]={...d.clients[i],...x}}else d.clients.push({...x,id:Date.now(),createdAt:new Date().toISOString()});if(!saveDB(d))return;closeModal('clientModal');toast('تم حفظ العميل بنجاح');loadAll()};
function deleteProperty(id){if(!confirm('حذف هذا العقار نهائياً؟'))return;selectedPropertyIds.delete(Number(id));const d=db();d.properties=d.properties.filter(x=>x.id!==id);if(!saveDB(d))return;toast('تم حذف العقار');loadAll()}
function deleteClient(id){if(!confirm('حذف هذا العميل نهائياً؟'))return;const d=db();d.clients=d.clients.filter(x=>x.id!==id);if(!saveDB(d))return;toast('تم حذف العميل');loadAll()}
function matchClient(id){const c=db().clients.find(x=>x.id===id);if(!c)return;$$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='properties'));$$('.section').forEach(x=>x.classList.remove('active'));$('#properties').classList.add('active');$('#pageTitle').textContent='العقارات المطابقة';$('#area').value=c.area||'';$('#maxPrice').value=c.budget||'';$('#minSize').value=c.min_size||'';$('#maxSize').value=c.max_size||'';$('#rooms').value=c.rooms||'';loadProps();toast('تم تطبيق شروط العميل على البحث')}
async function report(type, mode='pdf', selectedIds=null){
  const d=db(), allProperties=Array.isArray(d.properties)?d.properties:[], clients=Array.isArray(d.clients)?d.clients:[], now=new Date();
  const selectedSet=Array.isArray(selectedIds)?new Set(selectedIds.map(Number)):null;
  const properties=selectedSet?Array.from(selectedSet).map(id=>allProperties.find(p=>Number(p.id)===id)).filter(Boolean):allProperties;
  if(type==='properties'&&!properties.length){toast('لا توجد عقارات محددة للتقرير');return}
  if(type==='clients'&&!clients.length){toast('لا توجد بيانات عملاء للتقرير');return}

  const reportNo='DH-'+now.getFullYear()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0')+'-'+String(Date.now()).slice(-5);
  const stamp=now.toLocaleDateString('ar-EG',{day:'2-digit',month:'long',year:'numeric'});
  const W=1240,H=1754,MM=70;
  const pages=[];
  const C={navy:'#17283a',navy2:'#263c50',gold:'#b08b50',gold2:'#d2b37c',ivory:'#f5f1e8',paper:'#fffdf8',ink:'#25313c',muted:'#77808a',line:'#ddd5c7',green:'#456f59',red:'#9a5b61'};
  const round=(ctx,x,y,w,h,r,fill,stroke)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}};
  const line=(ctx,x1,y1,x2,y2,color,width=1)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
  const fit=(ctx,str,max,font)=>{ctx.font=font;let s=String(str??'—');while(s.length>2&&ctx.measureText(s).width>max)s=s.slice(0,-2)+'…';return s};
  const moneyLong=v=>Number(v||0)?money(v):'حسب الاتفاق';
  const loadImg=src=>new Promise(resolve=>{if(!src)return resolve(null);const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>resolve(null);im.src=src});
  const images=new Map();
  await Promise.all(properties.map(async p=>{if(p.image_url)images.set(Number(p.id),await loadImg(p.image_url))}));

  const basePage=(kind,section,sub)=>{
    const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.textBaseline='top';x.direction='rtl';
    x.fillStyle=C.ivory;x.fillRect(0,0,W,H);
    x.fillStyle=C.navy;x.fillRect(0,0,W,18);
    x.fillStyle=C.gold;x.fillRect(0,18,190,4);
    x.textAlign='left';x.fillStyle=C.navy;x.font='800 18px Georgia';x.fillText('DREAM HOUSE',MM,48);
    x.fillStyle=C.muted;x.font='500 12px Arial';x.fillText('REAL ESTATE MANAGEMENT',MM,76);
    x.textAlign='right';x.fillStyle=C.navy;x.font='700 14px Arial';x.fillText('Engineer Ahmed Galal',W-MM,48);
    x.fillStyle=C.muted;x.font='500 12px Arial';x.fillText('01035032020',W-MM,76);
    line(x,MM,105,W-MM,105,C.line,1);
    x.textAlign='right';x.fillStyle=C.navy;x.font='900 30px Arial';x.fillText(section,W-MM,142);
    x.fillStyle=C.muted;x.font='500 14px Arial';x.fillText(sub,W-MM,184);
    x.textAlign='left';x.fillStyle=C.gold;x.font='700 11px Arial';x.fillText(kind,MM,147);
    return {c,x,y:230};
  };
  const footer=(page,i,total)=>{const {c,x}=page;line(x,MM,H-82,W-MM,H-82,C.line,1);x.textAlign='left';x.fillStyle=C.muted;x.font='500 11px Arial';x.fillText(`DREAM HOUSE  •  ${reportNo}`,MM,H-58);x.textAlign='center';x.fillStyle=C.gold;x.font='700 11px Arial';x.fillText(`${i+1} / ${total}`,W/2,H-58);x.textAlign='right';x.fillStyle=C.muted;x.font='500 11px Arial';x.fillText('Engineer Ahmed Galal  •  01035032020',W-MM,H-58)};

  // Premium cover page — intentionally sparse for a client-facing first impression.
  const cover=document.createElement('canvas');cover.width=W;cover.height=H;const cx=cover.getContext('2d');cx.fillStyle=C.navy;cx.fillRect(0,0,W,H);
  const glow=cx.createRadialGradient(930,430,20,930,430,700);glow.addColorStop(0,'rgba(210,179,124,.16)');glow.addColorStop(1,'rgba(210,179,124,0)');cx.fillStyle=glow;cx.fillRect(0,0,W,H);
  cx.strokeStyle='rgba(210,179,124,.20)';cx.lineWidth=2;cx.strokeRect(42,42,W-84,H-84);
  cx.fillStyle=C.gold;cx.fillRect(70,92,130,4);cx.fillRect(70,108,78,2);
  cx.textAlign='left';cx.fillStyle='#fff';cx.font='800 31px Georgia';cx.fillText('DREAM HOUSE',70,145);cx.fillStyle='#c8cdd2';cx.font='500 13px Arial';cx.fillText('REAL ESTATE MANAGEMENT',70,185);
  cx.textAlign='right';cx.fillStyle=C.gold2;cx.font='700 13px Arial';cx.fillText('PRIVATE CLIENT REPORT',W-70,150);cx.fillStyle='#c8cdd2';cx.font='500 12px Arial';cx.fillText(stamp,W-70,178);
  cx.textAlign='right';cx.fillStyle='#fff';cx.font='900 55px Arial';cx.fillText(type==='clients'?'دليل العملاء':type==='all'?'التقرير التنفيذي':'ملف العقارات',W-70,420);
  cx.fillStyle=C.gold2;cx.font='700 20px Arial';cx.fillText('PROPERTY PORTFOLIO',W-70,500);
  cx.fillStyle='#d8dde2';cx.font='500 17px Arial';cx.fillText(selectedSet?`تقرير مخصص يضم ${properties.length} عقار`:`تقرير معد خصيصًا لبيانات المكتب`,W-70,558);
  const totalCount=(type==='clients'?clients.length:properties.length)+(type==='all'?clients.length:0);
  round(cx,70,720,W-140,170,18,'rgba(255,255,255,.055)','rgba(210,179,124,.24)');
  cx.textAlign='center';cx.fillStyle='#fff';cx.font='900 38px Arial';cx.fillText(type==='clients'?clients.length:properties.length,240,760);cx.fillStyle='#aeb7bf';cx.font='500 13px Arial';cx.fillText(type==='clients'?'عميل':'عقار',240,815);
  cx.fillStyle='rgba(210,179,124,.35)';cx.fillRect(400,752,1,105);
  cx.fillStyle='#fff';cx.font='900 30px Arial';cx.fillText('Engineer Ahmed Galal',660,760);cx.fillStyle='#aeb7bf';cx.font='500 13px Arial';cx.fillText('OFFICE DIRECT • 01035032020',660,815);
  cx.fillStyle='rgba(210,179,124,.35)';cx.fillRect(880,752,1,105);
  cx.fillStyle='#fff';cx.font='800 28px Arial';cx.fillText(reportNo,1010,760);cx.fillStyle='#aeb7bf';cx.font='500 13px Arial';cx.fillText('REPORT REFERENCE',1010,815);
  cx.textAlign='left';cx.fillStyle='#89949e';cx.font='500 11px Arial';cx.fillText('Prepared by DREAM HOUSE • Confidential office document',70,H-105);cx.textAlign='right';cx.fillStyle=C.gold2;cx.font='700 12px Arial';cx.fillText('CLASSIC EXECUTIVE EDITION',W-70,H-105);
  pages.push(cover);

  const drawProperty=(page,p,index)=>{
    const {c:x}=page;const y=page.y;const cardH=820;round(x,MM,y,W-MM*2,cardH,22,C.paper,C.line);
    const img=images.get(Number(p.id));
    if(img){x.save();x.beginPath();x.roundRect(MM+22,y+22,470,776,17);x.clip();const ratio=Math.max(470/img.width,776/img.height);const iw=img.width*ratio,ih=img.height*ratio;x.drawImage(img,MM+22+(470-iw)/2,y+22+(776-ih)/2,iw,ih);x.restore()}else{round(x,MM+22,y+22,470,776,17,C.navy2,null);x.textAlign='center';x.fillStyle=C.gold2;x.font='800 44px Georgia';x.fillText('DH',MM+257,y+365);x.fillStyle='#b9c0c6';x.font='500 12px Arial';x.fillText('DREAM HOUSE',MM+257,y+420)}
    x.textAlign='right';x.fillStyle=C.gold;x.font='700 12px Arial';x.fillText(fit(x,p.code||'PROPERTY',520,'700 12px Arial'),W-MM-28,y+32);
    x.fillStyle=C.navy;x.font='900 31px Arial';x.fillText(fit(x,p.name||'عقار',520,'900 31px Arial'),W-MM-28,y+78);
    x.fillStyle=C.gold;x.font='900 28px Arial';x.fillText(moneyLong(p.price),W-MM-28,y+130);
    x.fillStyle=C.muted;x.font='500 13px Arial';x.fillText(`${p.area||'—'}  •  ${p.type||'عقار'}`,W-MM-28,y+174);if(p.locationDetail){x.fillStyle=C.ink;x.font='600 12px Arial';x.fillText(fit(x,p.locationDetail,520,'600 12px Arial'),W-MM-28,y+198)}
    const rows=[['المساحة',`${p.size||'—'} م²`],['الغرف',p.rooms||'—'],['الحمامات',p.baths||'—'],['الدور',p.floor||'—'],['التشطيب',p.finish||'—'],['الترخيص',p.license||'—'],['العدادات',p.meters||'—'],['نسبة الأرض',p.landShare||'—'],['التسليم',p.delivery||'—'],['الحالة',p.status||'متاح']];
    rows.forEach((r,j)=>{const yy=y+214+j*55;line(x,W-MM-28,yy+47,640,yy+47,C.line,1);x.fillStyle=C.muted;x.font='600 11px Arial';x.fillText(r[0],W-MM-28,yy);x.fillStyle=r[0]==='الحالة'?(r[1]==='متاح'?C.green:C.red):C.ink;x.font='800 16px Arial';x.fillText(fit(x,r[1],330,'800 16px Arial'),W-MM-150,yy-1)});
    if(p.notes){round(x,640,y+740,530,42,10,'#f3eee5',null);x.fillStyle=C.muted;x.font='500 10px Arial';x.fillText(fit(x,p.notes,480,'500 10px Arial'),W-MM-28,y+754)}
  };
  const buildPropertyPages=()=>{for(let start=0;start<properties.length;start++){const p=properties[start],page=basePage('PROPERTY '+String(start+1).padStart(2,'0'),'ملف العقار',`${start+1} من ${properties.length}  •  ${selectedSet?'تقرير عقارات محددة':'ملف العرض العقاري'}`);drawProperty(page,p,start);footer(page,pages.length,pages.length+1);pages.push(page.c)}};
  const drawClient=(page,c,index)=>{const {c:x}=page;const gap=22,cw=(W-MM*2-gap)/2,ch=600,col=index%2,row=Math.floor(index/2),px=MM+col*(cw+gap),py=page.y+row*(ch+25);round(x,px,py,cw,ch,20,C.paper,C.line);x.textAlign='right';x.fillStyle=C.gold;x.font='700 12px Arial';x.fillText('CLIENT PROFILE',px+cw-28,py+28);x.fillStyle=C.navy;x.font='900 27px Arial';x.fillText(fit(x,c.name||'عميل',cw-56,'900 27px Arial'),px+cw-28,py+72);x.fillStyle=C.gold;x.font='800 17px Arial';x.fillText(c.phone||'—',px+cw-28,py+118);const rows=[['الطلب',c.need||'—'],['المنطقة',c.area||'—'],['الميزانية',moneyLong(c.budget)],['الحالة',c.status||'جديد']];rows.forEach((r,j)=>{const yy=py+176+j*75;line(x,px+28,yy+48,px+cw-28,yy+48,C.line,1);x.fillStyle=C.muted;x.font='600 10px Arial';x.fillText(r[0],px+cw-28,yy);x.fillStyle=C.ink;x.font='800 15px Arial';x.fillText(fit(x,r[1],cw-70,'800 15px Arial'),px+cw-145,yy-1)});if(c.notes){x.fillStyle=C.muted;x.font='500 11px Arial';x.fillText(fit(x,c.notes,cw-56,'500 11px Arial'),px+cw-28,py+500)}};
  if(type!=='clients'){for(let start=0;start<properties.length;start++){const page=basePage('PROPERTY PORTFOLIO','العقارات المتاحة',`${start+1} من ${properties.length}`);drawProperty(page,properties[start],start);pages.push(page.c)}}
  if(type!=='properties'){for(let start=0;start<clients.length;start+=4){const chunk=clients.slice(start,start+4);const page=basePage('CLIENT DIRECTORY','دليل العملاء',`${start+1}–${start+chunk.length} من ${clients.length}`);chunk.forEach((c,i)=>drawClient(page,c,i));pages.push(page.c)}}
  pages.forEach((c,i)=>footer({c,x:c.getContext('2d')},i,pages.length));
  const canvases=pages.map(c=>c.toDataURL('image/jpeg',.96));
  if(mode==='images'){
    const files=[];for(let i=0;i<canvases.length;i++){const blob=await (await fetch(canvases[i])).blob();files.push(new File([blob],`DREAM-HOUSE-${reportNo}-${String(i+1).padStart(2,'0')}.jpg`,{type:'image/jpeg'}))}
    try{if(navigator.share&&navigator.canShare&&navigator.canShare({files})){await navigator.share({title:'DREAM HOUSE — Executive Report',text:`${reportNo} • Engineer Ahmed Galal • 01035032020`,files});toast(`تم تجهيز ${pages.length} صفحات للمشاركة`);return}}catch(err){if(err?.name==='AbortError'){toast('تم إلغاء المشاركة');return}}
    canvases.forEach((data,i)=>{const a=document.createElement('a');a.href=data;a.download=`DREAM-HOUSE-${reportNo}-${String(i+1).padStart(2,'0')}.jpg`;document.body.appendChild(a);a.click();a.remove()});toast(`تم تنزيل ${pages.length} صفحات التقرير كصور JPG`);return;
  }
  const objects=['<< /Type /Catalog /Pages 2 0 R >>',''];const binaries=[];let objNum=3,pageRefs=[];canvases.forEach(()=>{pageRefs.push({page:objNum,content:objNum+1,image:objNum+2});objNum+=3});objects[1]=`<< /Type /Pages /Kids [${pageRefs.map(r=>r.page+' 0 R').join(' ')}] /Count ${pageRefs.length} >>`;
  canvases.forEach((data,idx)=>{const b=atob(data.split(',')[1]),arr=new Uint8Array(b.length);for(let i=0;i<b.length;i++)arr[i]=b.charCodeAt(i);const r=pageRefs[idx];objects[r.page-1]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im1 ${r.image} 0 R >> >> /Contents ${r.content} 0 R >>`;const stream='q 595 0 0 842 0 0 cm /Im1 Do Q';objects[r.content-1]=`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;binaries[r.image-1]={header:`<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${arr.length} >>`,bytes:arr}});
  const enc=new TextEncoder();const header=enc.encode('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');let total=header.length;const parts=[header],offs=[0],maxObj=objNum-1;for(let n=1;n<=maxObj;n++){offs[n]=total;const head=enc.encode(`${n} 0 obj\n`);parts.push(head);total+=head.length;const bi=binaries[n-1];if(bi){const h=enc.encode(bi.header+'\nstream\n');parts.push(h);total+=h.length;parts.push(bi.bytes);total+=bi.bytes.length;const tail=enc.encode('\nendstream\nendobj\n');parts.push(tail);total+=tail.length}else{const q=enc.encode((objects[n-1]||'')+'\nendobj\n');parts.push(q);total+=q.length}}
  const xref=total;let x=`xref\n0 ${maxObj+1}\n0000000000 65535 f \n`;for(let n=1;n<=maxObj;n++)x+=String(offs[n]).padStart(10,'0')+' 00000 n \n';x+=`trailer\n<< /Size ${maxObj+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;parts.push(enc.encode(x));
  const blob=new Blob(parts,{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`DREAM-HOUSE-Executive-${reportNo}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);toast(`تم إنشاء PDF Executive ثابت للطباعة — ${pages.length} ${pages.length===1?'صفحة':'صفحات'}`);
}

// Quality-of-life safeguards
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));
});
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')});
});
window.addEventListener('storage',e=>{
  if(e.key===KEY){try{loadAll()}catch{}}
});

function backupData(){
  const blob=new Blob([JSON.stringify(db(),null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='DREAM_HOUSE_Backup_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  toast('تم تنزيل النسخة الاحتياطية');
}
function restoreData(input){
  const file=input.files?.[0]; if(!file)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!Array.isArray(d.properties)||!Array.isArray(d.clients))throw new Error();
      d.seq=Number(d.seq)||1;
      if(confirm('سيتم استبدال البيانات الحالية بهذه النسخة. هل تريد المتابعة؟')){
        if(!saveDB(d))return;
        loadAll();toast('تم استرجاع البيانات بنجاح');
      }
    }catch{toast('ملف النسخة الاحتياطية غير صالح')}
    input.value='';
  };
  r.onerror=()=>{toast('تعذر قراءة ملف النسخة الاحتياطية');input.value=''};
  r.readAsText(file);
}


// Ultra 3D micro-interactions: subtle, desktop-only, touch-safe.
(function(){
  const fine = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  const selectors = '.stat,.premium-panel,.property,.report-card,.client-mobile-card';
  function bind(root=document){
    root.querySelectorAll?.(selectors).forEach(el=>{
      if(el.dataset.tiltBound) return; el.dataset.tiltBound='1';
      el.addEventListener('pointermove', e=>{
        const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        const rx=Math.max(-4,Math.min(4,-y*6)), ry=Math.max(-5,Math.min(5,x*7));
        el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      });
      el.addEventListener('pointerleave', ()=>{el.style.transform='';});
    });
  }
  bind();
  const mo=new MutationObserver(()=>bind()); mo.observe(document.body,{childList:true,subtree:true});
})();

// DREAM HOUSE MASTER 3D micro-interactions — desktop only, never blocks touch.
(function(){
  const fine = matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  const hero = document.querySelector('.hero3d');
  const cards = [...document.querySelectorAll('.stat, .property, .report-card')];
  const tilt = (el, strength=7) => {
    if(!el) return;
    el.addEventListener('pointermove', e=>{
      const r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      el.style.transform=`perspective(1200px) rotateX(${(-y*strength).toFixed(2)}deg) rotateY(${(x*strength).toFixed(2)}deg) translateZ(7px)`;
    });
    el.addEventListener('pointerleave',()=>{el.style.transform=''});
  };
  tilt(hero,2.4);
  cards.forEach(c=>tilt(c,3.2));
})();

// SIGNATURE 3D — restrained pointer depth for desktop, disabled on touch.
(function(){
  const fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  const shell=document.querySelector('.login-shell');
  const visual=document.querySelector('.showcase-visual');
  if(shell){
    shell.addEventListener('pointermove',e=>{
      const r=shell.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      shell.style.transform=`perspective(1600px) rotateX(${(-y*1.15).toFixed(2)}deg) rotateY(${(x*1.4).toFixed(2)}deg)`;
    });
    shell.addEventListener('pointerleave',()=>shell.style.transform='');
  }
  if(visual){
    visual.addEventListener('pointermove',e=>{
      const r=visual.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      visual.style.transform=`translateX(50%) rotateX(${(-y*1.2).toFixed(2)}deg) rotateY(${(x*1.6).toFixed(2)}deg)`;
    });
    visual.addEventListener('pointerleave',()=>visual.style.transform='translateX(50%)');
  }
})();


// SIGNATURE ULTIMATE — iOS-inspired SVG navigation icons.
(function(){
 const icons={
  dashboard:'<path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/><path d="M10 19v-5h4v5"/>',
  properties:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 19v-6h8v6M8 9h.01M12 9h.01M16 9h.01"/>',
  clients:'<circle cx="12" cy="8" r="3"/><path d="M5 19c.8-3.2 3.1-5 7-5s6.2 1.8 7 5"/>',
  reports:'<path d="M6 19V9M12 19V5M18 19v-7"/><path d="M4 19h16"/>',
  logout:'<path d="M9 5H5v14h4"/><path d="M13 8l4 4-4 4M9 12h8"/>'
 };
 document.querySelectorAll('.nav button').forEach(btn=>{
   const key=btn.dataset.page;
   if(!icons[key]||btn.querySelector('.nav-icon'))return;
   const label=btn.textContent.trim();
   btn.innerHTML='<span class="nav-icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+icons[key]+'</svg></span><span>'+label+'</span>';
 });
 const out=document.querySelector('#logout');
 if(out&&!out.querySelector('.logout-icon')){const label=out.textContent.trim();out.innerHTML='<span class="logout-icon"><svg viewBox="0 0 24 24" aria-hidden="true">'+icons.logout+'</svg></span><span>'+label+'</span>'}
})();

// APEX polish: keep the authentication surface English-only and icon-first.
(function(){
  const t=document.querySelector('#togglePassword');
  if(t){
    t.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>';
    t.onclick=()=>{const p=document.querySelector('#password');const show=p.type==='password';p.type=show?'text':'password';t.classList.toggle('is-open',show)};
  }
})();

// BLACK LABEL ambient intelligence: a single, ultra-light pointer light across the workspace.
(function(){
  const fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  let raf=0,px=50,py=50;
  window.addEventListener('pointermove',e=>{
    px=(e.clientX/innerWidth*100).toFixed(2)+'%';
    py=(e.clientY/innerHeight*100).toFixed(2)+'%';
    if(raf)return;
    raf=requestAnimationFrame(()=>{document.body.style.setProperty('--mx',px);document.body.style.setProperty('--my',py);raf=0});
  },{passive:true});
})();

// App-like navigation: the dock behaves like a native surface, while preserving existing handlers.
(function(){
  const nav=document.querySelector('.nav'); if(!nav)return;
  nav.addEventListener('click',e=>{
    const b=e.target.closest('button[data-page]'); if(!b)return;
    document.body.classList.remove('page-pulse');
    void document.body.offsetWidth;
    document.body.classList.add('page-pulse');
  });
})();

// Give the mobile dock a tiny tactile lift without adding any dependency.
(function(){
  const fine=window.matchMedia&&matchMedia('(pointer:fine)').matches;
  if(fine)return;
  document.querySelectorAll('.nav button').forEach(btn=>{
    btn.addEventListener('touchstart',()=>btn.classList.add('touching'),{passive:true});
    btn.addEventListener('touchend',()=>setTimeout(()=>btn.classList.remove('touching'),140),{passive:true});
  });
})();

// MOBILE BLACK LABEL — subtle gyroscope/tilt depth, touch-safe and performance-aware.
(function(){
  if(!window.matchMedia || !window.matchMedia('(max-width:720px)').matches) return;
  const cards=[...document.querySelectorAll('.hero3d,.stat,.property,.report-card')];
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  let ticking=false, tx=0, ty=0;
  function paint(){
    ticking=false;
    const x=Math.max(-1,Math.min(1,tx)), y=Math.max(-1,Math.min(1,ty));
    cards.forEach((el,i)=>{
      if(i===0) el.style.transform=`perspective(1100px) rotateX(${(-y*1.25).toFixed(2)}deg) rotateY(${(x*1.5).toFixed(2)}deg)`;
    });
  }
  window.addEventListener('deviceorientation',e=>{
    if(typeof e.gamma!=='number'||typeof e.beta!=='number') return;
    tx=e.gamma/45; ty=(e.beta-45)/45;
    if(!ticking){ticking=true;requestAnimationFrame(paint)}
  },{passive:true});
  document.addEventListener('touchend',()=>{
    const h=document.querySelector('.hero3d'); if(h) h.style.transform='';
  },{passive:true});
})();

/* BLACK LABEL V4 — restrained 3D pointer depth; disabled for touch devices */
(()=>{
  const fine=window.matchMedia('(pointer:fine)').matches;
  if(!fine) return;
  const targets=['.login-shell','.hero3d','.property','.stat','.report-card'];
  targets.forEach(sel=>document.querySelectorAll(sel).forEach(el=>{
    let raf=0;
    el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{el.style.setProperty('--rx',(-y*2.2).toFixed(2)+'deg');el.style.setProperty('--ry',(x*2.8).toFixed(2)+'deg');});
    });
    el.addEventListener('pointerleave',()=>{el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')});
  }));
  const s=document.createElement('style');s.textContent='.login-shell,.hero3d,.property,.stat,.report-card{transform:perspective(1800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg)) translateZ(0)}';document.head.appendChild(s);
})();

setTimeout(()=>{const r=$('#rq');if(r)r.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();runClientRequest()}})},0);


/* V13 mobile keyboard safety: keep focused fields visible on iOS Safari. */
(function(){
  const scrollFocused=()=>{
    const el=document.activeElement;
    if(!el || !/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    setTimeout(()=>{ try{ el.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'}); }catch{} },120);
  };
  document.addEventListener('focusin',scrollFocused,{passive:true});
  if(window.visualViewport){
    let t;
    window.visualViewport.addEventListener('resize',()=>{
      clearTimeout(t); t=setTimeout(()=>{const el=document.activeElement;if(el&&/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))scrollFocused()},120)
    },{passive:true});
  }
})();
