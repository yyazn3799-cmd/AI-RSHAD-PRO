const $ = s => document.querySelector(s);
const tabs = [...document.querySelectorAll('.tab')];
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.toggle('active', x === t));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + t.dataset.tab));
  if (t.dataset.tab === 'library') renderLibrary();
}));

let toastTimer;
function toast(msg) {
  const el = $('#toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 3800);
}
function getWorks() { try { return JSON.parse(localStorage.getItem('rshadWorks') || '[]'); } catch { return []; } }
function saveWork(item) {
  const a = getWorks(); a.unshift({ ...item, date: new Date().toLocaleString() });
  try { localStorage.setItem('rshadWorks', JSON.stringify(a.slice(0, 50))); } catch { toast('مساحة التخزين ممتلئة؛ لم يُحفظ السجل.'); }
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function translateText(text, from, to) {
  if (from === to) return text;
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', `${from}|${to}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`خدمة الترجمة غير متاحة (${response.status})`);
  const data = await response.json();
  if (data.responseStatus && Number(data.responseStatus) !== 200) throw new Error(data.responseDetails || 'تعذرت الترجمة.');
  const translated = data.responseData?.translatedText;
  if (!translated) throw new Error('لم تُرجع خدمة الترجمة نصاً.');
  return translated;
}

// Image generation: AI Horde volunteer network. Anonymous access is low priority.
let imageRequestId = null;
$('#makeImage')?.addEventListener('click', async () => {
  const prompt = $('#imagePrompt').value.trim();
  if (!prompt) return toast('اكتب وصف الصورة أولاً.');
  const btn = $('#makeImage'), box = $('#imageResult'), original = btn.textContent;
  btn.disabled = true; btn.textContent = 'جارٍ تجهيز الطلب...';
  box.innerHTML = '<div class="empty">جارٍ ترجمة الوصف وتجهيز طلب AI Horde...</div>';
  let completed = false;
  const headers = {'Content-Type':'application/json','apikey':'0000000000','Client-Agent':'AI-RSHAD-PRO:2.0:github.com/yyazn3799-cmd/AI-RSHAD-PRO'};
  const finish = () => { completed = true; btn.disabled = false; btn.textContent = original; };
  try {
    let promptEnglish = prompt;
    const lang = $('#promptLanguage').value;
    if (lang !== 'en') {
      try { promptEnglish = await translateText(prompt, lang, 'en'); }
      catch (translationError) { console.warn('Prompt translation fallback:', translationError); }
    }
    const styles = {
      photorealistic:'photorealistic professional photograph, natural realistic details',
      cinematic:'cinematic film still, dramatic composition, cinematic lighting',
      anime:'high quality anime illustration, clean detailed line art',
      illustration:'detailed digital illustration, refined visual composition',
      fantasy:'fantasy concept art, imaginative atmosphere, intricate details'
    };
    const fullPrompt = `${promptEnglish}. ${styles[$('#imageStyle').value]}. Follow the requested subject, gender, objects, colors, count, and location exactly. Make every explicitly requested object clearly visible. One coherent scene, accurate composition, sharp focus. ### wrong subject, wrong gender, missing requested objects, missing flowers, wrong location, text, watermark, blurry, duplicate limbs`;
    const [w,h] = $('#imageRatio').value.split('x').map(Number);
    const response = await fetch('https://aihorde.net/api/v2/generate/async', {
      method:'POST', headers,
      body:JSON.stringify({prompt:fullPrompt,params:{width:w,height:h,steps:Number($('#imageSteps').value),cfg_scale:7,sampler_name:'k_euler',n:1},nsfw:false,censor_nsfw:true,r2:true,shared:false})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.id) throw new Error(data.message || `رفض محرك الصور الطلب (${response.status}).`);
    imageRequestId = data.id;
    box.innerHTML = `<div class="progress"><b>تم إرسال الطلب إلى AI Horde</b><p>رقم الطلب: ${esc(data.id)}</p><p id="imageProgress">ننتظر جهازاً متطوعاً لتنفيذ الصورة. قد يستغرق الانتظار وقتاً.</p><button id="cancelImage" class="secondary">إيقاف الانتظار</button></div>`;
    $('#cancelImage').addEventListener('click', async () => {
      try { await fetch(`https://aihorde.net/api/v2/generate/status/${imageRequestId}`, {method:'DELETE',headers}); } catch {}
      imageRequestId = null; finish(); box.innerHTML = '<div class="empty">تم إيقاف متابعة الطلب. قد يكون الإلغاء غير متاح بعد بدء التنفيذ.</div>';
    });
    const deadline = Date.now() + 15 * 60 * 1000;
    let imageUrl = null;
    while (!completed && Date.now() < deadline) {
      await wait(5000); if (completed) return;
      const check = await fetch(`https://aihorde.net/api/v2/generate/check/${data.id}`, {headers});
      if (!check.ok) throw new Error('تعذر متابعة حالة الطلب.');
      const status = await check.json();
      const progress = $('#imageProgress');
      if (progress) progress.textContent = `حالة الطلب: ${status.done ? 'اكتمل' : 'قيد الانتظار أو التنفيذ'} · في الطابور: ${status.waiting ?? '—'} · قيد التنفيذ: ${status.processing ?? '—'}`;
      if (status.faulted) throw new Error('تعذر تنفيذ الطلب لدى العمال المتطوعين. جرّب لاحقاً أو غيّر الوصف.');
      if (status.done) {
        const resultResponse = await fetch(`https://aihorde.net/api/v2/generate/status/${data.id}`, {headers});
        if (!resultResponse.ok) throw new Error('اكتمل الطلب لكن تعذر استلام الصورة.');
        const result = await resultResponse.json(); imageUrl = result.generations?.[0]?.img; break;
      }
    }
    if (completed) return;
    if (!imageUrl) throw new Error('انتهت مهلة الانتظار بعد 15 دقيقة. الطلبات المجهولة قد تكون بطيئة؛ حاول لاحقاً.');
    const img = new Image(); img.alt = 'الصورة الناتجة من AI RSHAD PRO'; img.loading = 'lazy';
    img.onload = () => {
      box.innerHTML = ''; box.appendChild(img);
      const actions = document.createElement('div'); actions.className = 'actions';
      const download = document.createElement('button'); download.textContent = 'تحميل الصورة';
      download.onclick = async () => {
        try { const r = await fetch(imageUrl); const blob = await r.blob(); const local = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = local; a.download = 'RSHAD-PRO-image.png'; a.click(); setTimeout(() => URL.revokeObjectURL(local), 3000); }
        catch { window.open(imageUrl, '_blank', 'noopener'); }
      };
      const open = document.createElement('a'); open.href = imageUrl; open.target = '_blank'; open.rel = 'noopener'; open.textContent = 'فتح الصورة الأصلية';
      actions.append(download, open); box.appendChild(actions);
      saveWork({type:'صورة مولدة',prompt,details:'AI Horde'}); toast('اكتمل توليد الصورة.'); finish(); imageRequestId = null;
    };
    img.onerror = () => { box.innerHTML = '<div class="empty">اكتمل التوليد لكن تعذر تحميل الصورة للعرض. افتح رابط النتيجة من جديد إن توفر.</div>'; finish(); };
    img.src = imageUrl;
  } catch (error) {
    console.error(error); box.innerHTML = `<div class="empty error">${esc(error.message || 'حدث خطأ أثناء توليد الصورة.')}</div>`;
    toast('تعذر إكمال توليد الصورة.'); finish(); imageRequestId = null;
  }
});

// Video prompt preparation only; no video engine is falsely advertised as connected.
$('#saveVideoPrompt')?.addEventListener('click', async () => {
  const prompt = $('#videoPrompt').value.trim(); if (!prompt) return toast('اكتب وصف الفيديو أولاً.');
  const details = `${$('#videoDuration').value} ثوانٍ · ${$('#videoRatio').value}`;
  saveWork({type:'وصف فيديو (غير مولّد)',prompt,details});
  $('#videoResult').innerHTML = `<div><b>تم حفظ وصف الفيديو</b><p>${esc(prompt)}</p><small>${esc(details)}</small><div class="actions"><button id="copyVideoPrompt">نسخ الوصف</button></div><p class="small muted">هذا وصف نصي فقط، وليس ملف فيديو.</p></div>`;
  $('#copyVideoPrompt').onclick = async () => { try { await navigator.clipboard.writeText(prompt); toast('تم نسخ الوصف.'); } catch { toast('تعذر النسخ؛ يمكنك تحديد النص ونسخه.'); } };
  toast('تم حفظ الوصف في مكتبتك.');
});
$('#prepareExtension')?.addEventListener('click', () => {
  const file = $('#extendVideoFile').files?.[0], prompt = $('#extendPrompt').value.trim();
  if (!file) return toast('اختر ملف الفيديو أولاً.'); if (!prompt) return toast('اكتب وصف الجزء الجديد.');
  saveWork({type:'طلب تمديد فيديو (غير منفذ)',prompt,details:file.name});
  $('#extensionResult').innerHTML = `<div><b>تم تجهيز طلب التمديد</b><p>الفيديو: ${esc(file.name)}</p><p>${esc(prompt)}</p><p class="small muted">لم يتم تعديل ملف الفيديو أو إنشاء جزء جديد؛ نحتاج محركاً يدعم Video Extension.</p></div>`;
  toast('تم حفظ طلب التمديد فقط.');
});

let selectedPhoto = null, selectedPhotoUrl = null;
$('#photoFile')?.addEventListener('change', e => {
  const file = e.target.files?.[0]; if (!file) return;
  selectedPhoto = file; if (selectedPhotoUrl) URL.revokeObjectURL(selectedPhotoUrl);
  selectedPhotoUrl = URL.createObjectURL(file);
  $('#photoPreview').innerHTML = `<img src="${selectedPhotoUrl}" alt="معاينة الصورة المختارة">`;
});
$('#prepareMotion')?.addEventListener('click', () => {
  const prompt = $('#motionPrompt').value.trim();
  if (!selectedPhoto) return toast('اختر صورة من هاتفك أولاً.'); if (!prompt) return toast('اكتب وصف الحركة أولاً.');
  saveWork({type:'طلب تحريك صورة (غير منفذ)',prompt,details:selectedPhoto.name});
  $('#motionResult').innerHTML = `<div><b>تم تجهيز وصف الحركة</b><p>${esc(prompt)}</p><small>الصورة: ${esc(selectedPhoto.name)}</small><p class="small muted">لم يتم إنشاء فيديو؛ يلزم محرك image-to-video.</p></div>`;
  toast('تم حفظ طلب التحريك فقط.');
});

// Speech synthesis: uses voices available on the user's device/browser.
$('#speakText')?.addEventListener('click', () => {
  const text = $('#speechText').value.trim(); if (!text) return toast('اكتب النص أولاً.');
  if (!('speechSynthesis' in window)) return toast('قراءة النص غير مدعومة في هذا المتصفح.');
  speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = $('#speechLanguage').value; utterance.rate = Number($('#speechRate').value);
  utterance.onerror = e => toast('تعذر تشغيل الصوت: ' + (e.error || 'خطأ غير معروف'));
  speechSynthesis.speak(utterance); saveWork({type:'نص مقروء صوتياً',prompt:text.slice(0,300),details:utterance.lang});
});
$('#stopSpeech')?.addEventListener('click', () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); toast('تم إيقاف القراءة.'); });
$('#startDictation')?.addEventListener('click', () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return toast('التعرف على الكلام غير مدعوم في هذا المتصفح. جرّب Chrome مع HTTPS.');
  const recognition = new Recognition(); recognition.lang = $('#speechLanguage').value; recognition.continuous = true; recognition.interimResults = true;
  const btn = $('#startDictation'); btn.disabled = true; btn.textContent = 'جارٍ الاستماع...';
  $('#dictationResult').innerHTML = '<div class="empty">تحدث الآن. قد يطلب المتصفح إذن استخدام الميكروفون.</div>';
  recognition.onresult = event => {
    let transcript = ''; for (let i=0;i<event.results.length;i++) transcript += event.results[i][0].transcript + (event.results[i].isFinal ? ' ' : '');
    $('#dictationResult').innerHTML = `<p>${esc(transcript)}</p><div class="actions"><button id="copyDictation">نسخ النص</button></div>`;
    $('#copyDictation').onclick = async () => { try { await navigator.clipboard.writeText(transcript); toast('تم نسخ النص.'); } catch { toast('تعذر النسخ.'); } };
  };
  recognition.onerror = event => toast('مشكلة في التعرف على الكلام: ' + event.error);
  recognition.onend = () => { btn.disabled = false; btn.textContent = '🎙 بدء التحدث'; };
  try { recognition.start(); } catch (e) { btn.disabled = false; btn.textContent = '🎙 بدء التحدث'; toast('تعذر بدء الميكروفون.'); }
  $('#stopDictation').onclick = () => { try { recognition.stop(); } catch {} };
});

// Free translation via MyMemory. Anonymous quota is limited to 5,000 chars/day.
$('#translateButton')?.addEventListener('click', async () => {
  const text = $('#translateText').value.trim(); if (!text) return toast('اكتب النص المراد ترجمته.');
  if (new TextEncoder().encode(text).length > 450) return toast('قسّم النص إلى مقاطع أقصر (الحد التقريبي 450 بايت لكل طلب).');
  const from = $('#sourceLang').value, to = $('#targetLang').value, btn = $('#translateButton'), box = $('#translationResult');
  if (from === to) { box.innerHTML = `<p>${esc(text)}</p>`; return; }
  btn.disabled = true; btn.textContent = 'جارٍ الترجمة...'; box.innerHTML = '<div class="empty">نتصل بخدمة الترجمة المجانية...</div>';
  try {
    const translated = await translateText(text, from, to);
    box.innerHTML = `<p>${esc(translated)}</p><div class="actions"><button id="copyTranslation">نسخ الترجمة</button></div>`;
    $('#copyTranslation').onclick = async () => { try { await navigator.clipboard.writeText(translated); toast('تم نسخ الترجمة.'); } catch { toast('تعذر النسخ.'); } };
    saveWork({type:'ترجمة',prompt:text,details:`${from} → ${to}`});
  } catch (error) { box.innerHTML = `<div class="empty error">${esc(error.message || 'تعذرت الترجمة حالياً.')}</div>`; }
  finally { btn.disabled = false; btn.textContent = 'ترجمة النص'; }
});

function renderLibrary() {
  const works = getWorks(), box = $('#libraryList'); if (!box) return;
  if (!works.length) { box.innerHTML = '<div class="empty">لم تحفظ أي أعمال بعد.</div>'; return; }
  box.innerHTML = works.map(item => `<article class="work-item"><b>${esc(item.type)}</b><p>${esc(item.prompt)}</p><small>${esc(item.details || '')} · ${esc(item.date || '')}</small></article>`).join('');
}
$('#clearLibrary')?.addEventListener('click', () => { if (confirm('هل تريد مسح سجل الأعمال من هذا الجهاز؟')) { localStorage.removeItem('rshadWorks'); renderLibrary(); toast('تم مسح السجل.'); } });

let deferredPrompt;
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; if ($('#installBtn')) $('#installBtn').hidden = false; });
$('#installBtn')?.addEventListener('click', async () => {
  if (!deferredPrompt) return toast('استخدم قائمة المتصفح ثم إضافة إلى الشاشة الرئيسية.');
  deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $('#installBtn').hidden = true;
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(error => console.log('Service Worker:', error));
renderLibrary();
console.log('AI RSHAD PRO 2.0 ready.');
