const $ = s => document.querySelector(s);

const tabs = [...document.querySelectorAll('.tab')];
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.toggle('active', x === t));
  document.querySelectorAll('.panel').forEach(p =>
    p.classList.toggle('active', p.id === 'panel-' + t.dataset.tab)
  );
  if (t.dataset.tab === 'library') renderLibrary();
}));

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

function getWorks() {
  try {
    return JSON.parse(localStorage.getItem('rshadWorks') || '[]');
  } catch {
    return [];
  }
}

function saveWork(item) {
  const a = getWorks();
  a.unshift({ ...item, date: new Date().toLocaleString('ar') });
  localStorage.setItem('rshadWorks', JSON.stringify(a.slice(0, 50)));
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}
// توليد الصور باستخدام Pollinations
$('#makeImage')?.addEventListener('click', async () => {
  const prompt = $('#imagePrompt')?.value.trim();

  if (!prompt) {
    toast('اكتب وصف الصورة أولاً.');
    return;
  }

  const btn = $('#makeImage');
  const box = $('#imageResult');
  const originalText = btn.textContent;

  btn.disabled = true;
  btn.textContent = 'جارٍ توليد الصورة...';

  box.innerHTML =
    '<div class="empty">جارٍ الاتصال بخدمة الصور، يرجى الانتظار...</div>';

  const style = $('#imageStyle')?.value || '';
  const ratio = $('#imageRatio')?.value || '1024x1024';

  const [w, h] = ratio.split('x');

  const width = Math.min(1536, Math.max(256, parseInt(w) || 1024));
  const height = Math.min(1536, Math.max(256, parseInt(h) || 1024));

  const fullPrompt = [
    prompt,
    style,
    'high quality, realistic, detailed'
  ].filter(Boolean).join(', ');

  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    nologo: 'true',
    seed: String(Math.floor(Math.random() * 1000000))
  });

  const url =
    'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(fullPrompt) +
    '?' + params.toString();

  const img = new Image();
  img.alt = 'الصورة الناتجة';

  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    btn.disabled = false;
    btn.textContent = originalText || 'توليد الصورة';
  }

  const timeout = setTimeout(() => {
    if (finished) return;

    box.innerHTML =
      '<div class="empty">تأخر توليد الصورة. تحقق من الإنترنت وحاول مجدداً.</div>';

    finish();
    toast('انتهت مهلة الانتظار.');
  }, 180000);

  img.onload = () => {
    if (finished) return;

    box.innerHTML = '';

    img
    // إنشاء طلب فيديو
$('#makeVideo')?.addEventListener('click', () => {
  const prompt = $('#videoPrompt').value.trim();

  if (!prompt) {
    toast('اكتب وصف الفيديو أولاً.');
    return;
  }

  const duration = $('#videoDuration').value;
  const ratio = $('#videoRatio').value;

  saveWork({
    type: 'طلب فيديو',
    prompt,
    details: duration + ' — ' + ratio
  });

  $('#videoResult').innerHTML = `
    <div>
      <b>تم تجهيز طلب الفيديو</b>
      <p>${esc(prompt)}</p>
      <small>${esc(duration)} · ${esc(ratio)}</small>
      <div class="actions">
        <button id="copyVideo">نسخ الوصف</button>
      </div>
      <p class="empty">
        هذا طلب نصي فقط وليس ملف فيديو.
        يلزم ربط محرك توليد فيديو فعلي لإنتاج الفيديو.
      </p>
    </div>
  `;

  $('#copyVideo').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast('تم نسخ وصف الفيديو.');
    } catch {
      toast('تعذر النسخ تلقائياً.');
    }
  });

  toast('تم حفظ طلب الفيديو.');
});


// اختيار صورة لتحريكها
let selectedPhoto = null;

$('#photoFile')?.addEventListener('change', e => {
  const file = e.target.files?.[0];

  if (!file) return;

  selectedPhoto = file;

  const url = URL.createObjectURL(file);

  $('#photoPreview').innerHTML = `
    <img
      src="${url}"
      alt="معاينة الصورة"
      style="max-width:100%;border-radius:12px;"
    >
  `;
});


// تجهيز طلب تحريك الصورة
$('#prepareMotion')?.addEventListener('click', () => {
  const prompt = $('#motionPrompt').value.trim();

  if (!selectedPhoto) {
    toast('اختر صورة من هاتفك أولاً.');
    return;
  }

  if (!prompt) {
    toast('اكتب وصف الحركة أولاً.');
    return;
  }

  saveWork({
    type: 'طلب تحريك صورة',
    prompt,
    details: selectedPhoto.name
  });

  $('#motionResult').innerHTML = `
    <div>
      <b>تم تجهيز مشهد التحريك</b>
      <p>${esc(prompt)}</p>
      <small>الصورة: ${esc(selectedPhoto.name)}</small>
      <p class="empty">
        هذه خطوة تجهيز للطلب فقط.
        يلزم ربط محرك image-to-video لإنتاج الفيديو.
      </p>
    </div>
  `;

  toast('تم حفظ طلب التحريك.');
});
    // عرض المكتبة
function renderLibrary() {
  const works = getWorks();
  const box = $('#libraryList');

  if (!box) return;

  if (!works.length) {
    box.innerHTML =
      '<div class="empty">لم تحفظ أي أعمال بعد.</div>';
    return;
  }

  box.innerHTML = works.map(item => `
    <article class="work-item">
      <b>${esc(item.type)}</b>
      <p>${esc(item.prompt)}</p>
      <small>
        ${esc(item.details || '')}
        ·
        ${esc(item.date || '')}
      </small>
    </article>
  `).join('');
}


// مسح المكتبة
$('#clearLibrary')?.addEventListener('click', () => {
  if (confirm('هل تريد مسح سجل الأعمال من هذا الجهاز؟')) {
    localStorage.removeItem('rshadWorks');
    renderLibrary();
    toast('تم مسح السجل.');
  }
});


// تثبيت التطبيق
let deferredPrompt;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;

  if ($('#installBtn')) {
    $('#installBtn').hidden = false;
  }
});

$('#installBtn')?.addEventListener('click', async () => {
  if (!deferredPrompt) {
    toast('استخدم قائمة المتصفح ثم إضافة إلى الشاشة الرئيسية.');
    return;
  }

  deferredPrompt.prompt();

  await deferredPrompt.userChoice;

  deferredPrompt = null;

  $('#installBtn').hidden = true;
});


// تشغيل Service Worker
if (
  'serviceWorker' in navigator &&
  location.protocol.startsWith('http')
) {
  navigator.serviceWorker
    .register('./sw.js')
    .catch(error => console.log('Service Worker:', error));
}


// تحميل المكتبة عند فتح التطبيق
renderLibrary();

console.log('AI RSHAD PRO جاهز للعمل.');
