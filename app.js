
const $ = s => document.querySelector(s);

const tabs = [...document.querySelectorAll('.tab')];

tabs.forEach(t => {
  t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.toggle('active', x === t));
    document.querySelectorAll('.panel').forEach(p =>
      p.classList.toggle('active', p.id === 'panel-' + t.dataset.tab)
    );
    if (t.dataset.tab === 'library') renderLibrary();
  });
});

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

/* =========================
   توليد الصور
========================= */

$('#makeImage').addEventListener('click', async () => {
  const prompt = $('#imagePrompt').value.trim();

  if (!prompt) {
    toast('اكتب وصف الصورة أولاً.');
    return;
  }

  const btn = $('#makeImage');
  const box = $('#imageResult');

  btn.disabled = true;
  btn.textContent = 'جارٍ توليد الصورة...';

  box.innerHTML =
    '<div class="empty">جارٍ الاتصال بمحرك الصور المجاني، يرجى الانتظار...</div>';

  const style = $('#imageStyle').value;
  const ratio = $('#imageRatio').value;

  const dimensions = ratio.split('x');
  const width = Number(dimensions[0]) || 1024;
  const height = Number(dimensions[1]) || 1024;

  const fullPrompt =
    prompt + ', ' + style + ', highly detailed, realistic, professional quality';

  const seed = Math.floor(Math.random() * 999999);

  const url =
    'https://image.pollinations.ai/prompt/' +
    encodeURIComponent(fullPrompt) +
    '?width=' + width +
    '&height=' + height +
    '&seed=' + seed +
    '&nologo=true';

  const img = new Image();

  img.alt = 'الصورة الناتجة من AI RSHAD PRO';

  img.onload = () => {
    box.innerHTML = '';

    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '12px';

    box.appendChild(img);

    const actions = document.createElement('div');
    actions.className = 'actions';

    actions.innerHTML = `
      <a href="${url}" download="AI-RSHAD-PRO.jpg">
        حفظ الصورة
      </a>
      <button type="button" id="saveImagePrompt">
        حفظ الطلب في مكتبتي
      </button>
    `;

    box.appendChild(actions);

    $('#saveImagePrompt').onclick = () => {
      saveWork({
        type: 'صورة',
        prompt: prompt,
        details: style
      });

      toast('تم حفظ الطلب في مكتبتك.');
    };

    btn.disabled = false;
    btn.textContent = '✦ توليد الصورة';
  };

  img.onerror = () => {
    box.innerHTML = `
      <div class="empty">
        تعذر توليد الصورة حالياً.
        قد تكون الخدمة مشغولة أو غير متاحة.
        حاول مرة أخرى لاحقاً.
      </div>
    `;

    btn.disabled = false;
    btn.textContent = '✦ توليد الصورة';

    toast('تعذر الاتصال بمحرك الصور.');
  };

  img.src = url;
});


/* =========================
   تجهيز الفيديو
========================= */

$('#makeVideo').addEventListener('click', () => {

  const prompt = $('#videoPrompt').value.trim();

  if (!prompt) {
    toast('اكتب وصف الفيديو أولاً.');
    return;
  }

  const duration = $('#videoDuration').value;
  const ratio = $('#videoRatio').value;

  saveWork({
    type: 'طلب فيديو',
    prompt: prompt,
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
        تم تجهيز الوصف وحفظه.
        يلزم ربط محرك توليد فيديو فعلي لإنشاء الفيديو.
      </p>
    </div>
  `;

  $('#copyVideo').onclick = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast('تم نسخ وصف الفيديو.');
    } catch {
      toast('تعذر النسخ.');
    }
  };

  toast('تم حفظ طلب الفيديو في مكتبتك.');
});


/* =========================
   اختيار الصور من الهاتف
========================= */

let selectedPhoto = null;

$('#photoFile').addEventListener('change', e => {

  const f = e.target.files[0];

  if (!f) return;

  if (!f.type.startsWith('image/')) {
    toast('الرجاء اختيار صورة.');
    return;
  }

  selectedPhoto = f;

  const url = URL.createObjectURL(f);

  $('#photoPreview').innerHTML =
    '<img src="' + url + '" alt="معاينة الصورة">';
});


/* =========================
   تحريك الصور
========================= */

$('#prepareMotion').addEventListener('click', () => {

  const p = $('#motionPrompt').value.trim();

  if (!selectedPhoto) {
    toast('اختر صورة من هاتفك أولاً.');
    return;
  }

  if (!p) {
    toast('اكتب وصف الحركة أولاً.');
    return;
  }

  saveWork({
    type: 'طلب تحريك صورة',
    prompt: p,
    details: selectedPhoto.name
  });

  $('#motionResult').innerHTML = `
    <div>
      <b>تم تجهيز مشهد التحريك</b>
      <p>${esc(p)}</p>
      <small>الصورة: ${esc(selectedPhoto.name)}</small>

      <p class="empty">
        تم تجهيز الطلب.
        يلزم ربط محرك image-to-video لإنتاج الفيديو.
      </p>
    </div>
  `;

  toast('تم حفظ طلب التحريك.');
});


/* =========================
   مكتبة الأعمال
========================= */

function renderLibrary() {

  const a = getWorks();
  const box = $('#libraryList');

  if (!a.length) {
    box.innerHTML =
      '<div class="empty">لم تحفظ أي أعمال بعد.</div>';
    return;
  }

  box.innerHTML = a.map(x => `
    <article class="work-item">
      <b>${esc(x.type)}</b>
      <p>${esc(x.prompt)}</p>
      <small>
        ${esc(x.details || '')} · ${esc(x.date)}
      </small>
    </article>
  `).join('');
}


/* =========================
   مسح المكتبة
========================= */

$('#clearLibrary').addEventListener('click', () => {

  if (confirm('هل تريد مسح سجل الطلبات من هذا الجهاز؟')) {

    localStorage.removeItem('rshadWorks');

    renderLibrary();

    toast('تم مسح السجل.');
  }
});


/* =========================
   تثبيت التطبيق
========================= */

let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {

  e.preventDefault();

  deferredPrompt = e;

  $('#installBtn').hidden = false;
});


$('#installBtn').addEventListener('click', async () => {

  if (!deferredPrompt) {
    toast('استخدم قائمة المتصفح ثم إضافة إلى الشاشة الرئيسية.');
    return;
  }

  deferredPrompt.prompt();

  await deferredPrompt.userChoice;

  deferredPrompt = null;

  $('#installBtn').hidden = true;
});


/* =========================
   تشغيل Service Worker
========================= */

if (
  'serviceWorker' in navigator &&
  location.protocol.startsWith('http')
) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
