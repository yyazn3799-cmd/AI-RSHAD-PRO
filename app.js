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
   AI HORDE IMAGE ENGINE
========================= */

const HORDE_API = 'https://aihorde.net/api/v2';

const HORDE_HEADERS = {
  'Content-Type': 'application/json',
  'apikey': '0000000000',
  'Client-Agent': 'AI-RSHAD-PRO:1.0:github.com/yyazn3799-cmd/AI-RSHAD-PRO'
};

const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));

async function hordeFetch(url, options = {}) {

  const response = await fetch(url, {
    ...options,
    headers: {
      ...HORDE_HEADERS,
      ...(options.headers || {})
    }
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error('استجابة غير مفهومة من محرك الصور.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'تعذر الاتصال بمحرك الصور.');
  }

  return data;
}

async function generateHordeImage(prompt, width, height, progress) {

  progress('إرسال طلب الصورة إلى محرك الذكاء الاصطناعي...');

  const request = await hordeFetch(
    HORDE_API + '/generate/async',
    {
      method: 'POST',
      body: JSON.stringify({
        prompt: prompt,
        params: {
          width: width,
          height: height,
          steps: 20,
          n: 1,
          cfg_scale: 7.5,
          sampler_name: 'k_euler',
          karras: true
        },
        nsfw: false,
        censor_nsfw: true,
        r2: true,
        allow_downgrade: true
      })
    }
  );

  if (!request.id) {
    throw new Error('لم يتم استلام رقم طلب التوليد.');
  }

  const requestId = request.id;

  progress('تم إرسال الطلب. ننتظر توفر جهاز لتوليد الصورة...');

  for (let i = 0; i < 120; i++) {

    await sleep(5000);

    const status = await hordeFetch(
      HORDE_API + '/generate/check/' + requestId
    );

    if (status.faulted) {
      throw new Error('تعذر إكمال التوليد. جرّب طلباً جديداً.');
    }

    if (status.done) {

      progress('اكتمل التوليد. جارٍ تحميل الصورة...');

      const result = await hordeFetch(
        HORDE_API + '/generate/status/' + requestId
      );

      if (!result.generations || !result.generations.length) {
        throw new Error('لم يستلم التطبيق صورة من المحرك.');
      }

      return result.generations[0].img;
    }

    const waiting = status.waiting || 0;
    const processing = status.processing || 0;

    progress(
      'جارٍ توليد الصورة... الانتظار: ' +
      waiting +
      ' · قيد المعالجة: ' +
      processing
    );
  }

  throw new Error(
    'استغرق التوليد وقتاً طويلاً. يمكنك المحاولة مرة أخرى لاحقاً.'
  );
}

/* =========================
   IMAGE GENERATION BUTTON
========================= */

$('#makeImage').addEventListener('click', async () => {

  const prompt = $('#imagePrompt').value.trim();

  if (!prompt) {
    toast('اكتب وصف الصورة أولاً.');
    return;
  }

  const btn = $('#makeImage');
  const box = $('#imageResult');

  const style = $('#imageStyle').value;
  const ratio = $('#imageRatio').value;

  const [width, height] = ratio.split('x').map(Number);

  const fullPrompt =
    prompt +
    ', ' + style +
    ', highly detailed, professional quality';

  btn.disabled = true;
  btn.textContent = 'جارٍ التوليد...';

  box.innerHTML =
    '<div class="empty">جارٍ الاتصال بمحرك AI Horde...</div>';

  try {

    const imageUrl = await generateHordeImage(
      fullPrompt,
      width,
      height,
      message => {
        box.innerHTML =
          '<div class="empty">' + esc(message) + '</div>';
      }
    );

    const img = new Image();

    img.alt = 'الصورة الناتجة';

    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '12px';

    img.onload = () => {

      box.innerHTML = '';
      box.appendChild(img);

      const actions = document.createElement('div');

      actions.className = 'actions';

      const openLink = document.createElement('a');

      openLink.href = imageUrl;
      openLink.target = '_blank';
      openLink.rel = 'noopener';
      openLink.textContent = 'فتح الصورة وحفظها';

      const saveButton = document.createElement('button');

      saveButton.textContent = 'حفظ الطلب في مكتبتي';

      saveButton.onclick = () => {

        saveWork({
          type: 'صورة مولدة',
          prompt: prompt,
          details: style
        });

        toast('تم حفظ الطلب في مكتبتك.');
      };

      actions.append(openLink, saveButton);
      box.appendChild(actions);

      btn.disabled = false;
      btn.textContent = '✦ توليد الصورة';

      toast('تم توليد الصورة بنجاح!');
    };

    img.onerror = () => {

      box.innerHTML =
        '<div class="empty">تم التوليد لكن تعذر عرض الصورة. افتح الرابط وحاول مرة أخرى.</div>';

      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank';
      link.textContent = 'فتح الصورة';

      box.appendChild(link);

      btn.disabled = false;
      btn.textContent = '✦ توليد الصورة';
    };

    img.src = imageUrl;

  } catch (error) {

    box.innerHTML =
      '<div class="empty">' +
      esc(error.message) +
      '</div>';

    toast(error.message);

    btn.disabled = false;
    btn.textContent = '✦ توليد الصورة';
  }
});


/* =========================
   VIDEO REQUESTS
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
        يلزم ربط محرك فيديو فعلي لإنتاج الملف.
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

  toast('تم حفظ طلب الفيديو.');
});


/* =========================
   PHOTO SELECTION
========================= */

let selectedPhoto = null;

$('#photoFile').addEventListener('change', e => {

  const f = e.target.files[0];

  if (!f) return;

  if (!f.type.startsWith('image/')) {
    toast('اختر صورة صحيحة.');
    return;
  }

  selectedPhoto = f;

  const url = URL.createObjectURL(f);

  $('#photoPreview').innerHTML =
    '<img src="' + url + '" alt="معاينة الصورة">';
});


/* =========================
   IMAGE MOTION
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
        يلزم ربط محرك image-to-video لإنتاج الفيديو.
      </p>
    </div>
  `;

  toast('تم حفظ طلب التحريك.');
});


/* =========================
   LIBRARY
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
   CLEAR LIBRARY
========================= */

$('#clearLibrary').addEventListener('click', () => {

  if (confirm('هل تريد مسح سجل الطلبات من هذا الجهاز؟')) {

    localStorage.removeItem('rshadWorks');

    renderLibrary();

    toast('تم مسح السجل.');
  }
});


/* =========================
   INSTALL APPLICATION
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
   SERVICE WORKER
========================= */

if (
  'serviceWorker' in navigator &&
  location.protocol.startsWith('http')
) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
