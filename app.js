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
// AI RSHAD PRO - AI Horde Image Generator
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
  btn.textContent = 'جارٍ إرسال طلب التوليد...';

  box.innerHTML =
    '<div class="empty">جارٍ الاتصال بمحرك AI Horde...</div>';

  const style = $('#imageStyle')?.value || '';
  const ratio = $('#imageRatio')?.value || '1024x1024';

  const [rw, rh] = ratio.split('x').map(Number);

  const width = Math.min(1024,
    Math.max(256, Math.round((rw || 1024) / 64) * 64));

  const height = Math.min(1024,
    Math.max(256, Math.round((rh || 1024) / 64) * 64));

  const fullPrompt = [
    prompt,
    style,
    'highly detailed, accurate composition, sharp focus'
  ].filter(Boolean).join(', ');

  const headers = {
    'Content-Type': 'application/json',
    'apikey': '0000000000',
    'Client-Agent': 'AI-RSHAD-PRO:1.0:github.com/yyazn3799-cmd/AI-RSHAD-PRO'
  };

  let finished = false;
  let timeout;

  function finish() {
    if (finished) return;

    finished = true;
    clearTimeout(timeout);

    btn.disabled = false;
    btn.textContent = originalText || 'توليد الصورة';
  }

  timeout = setTimeout(() => {
    box.innerHTML =
      '<div class="empty">انتهت مهلة الانتظار. حاول مرة أخرى لاحقاً.</div>';

    finish();
  }, 600000);

  try {

    // إرسال طلب التوليد

    const response = await fetch(
      'https://aihorde.net/api/v2/generate/async',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({

          prompt: fullPrompt,

          params: {
            width,
            height,
            steps: 25,
            cfg_scale: 7,
            sampler_name: 'k_euler',
            n: 1
          },

          nsfw: false,
          censor_nsfw: true,
          r2: true,
          shared: false

        })
      }
    );

    if (!response.ok) {
      throw new Error('تعذر إرسال طلب التوليد: ' + response.status);
    }

    const data = await response.json();

    if (!data.id) {
      throw new Error(data.message || 'لم يتم استلام رقم الطلب.');
    }

    const requestId = data.id;

    box.innerHTML =
      '<div class="empty">تم إرسال الطلب بنجاح. جارٍ انتظار دور التوليد...</div>';

    // انتظار الصورة

    let imageUrl = null;

    while (!finished) {

      await new Promise(resolve => setTimeout(resolve, 5000));

      if (finished) break;

      const checkResponse = await fetch(
        'https://aihorde.net/api/v2/generate/check/' + requestId,
        { headers }
      );

      if (!checkResponse.ok) {
        throw new Error('تعذر متابعة حالة التوليد.');
      }

      const status = await checkResponse.json();

      if (status.faulted) {
        throw new Error('تعذر توليد الصورة. حاول مجدداً.');
      }

      if (status.done) {

        const resultResponse = await fetch(
          'https://aihorde.net/api/v2/generate/status/' + requestId,
          { headers }
        );

        if (!resultResponse.ok) {
          throw new Error('تعذر استلام الصورة الناتجة.');
        }

        const result = await resultResponse.json();

        imageUrl = result.generations?.[0]?.img;

        break;
      }

      box.innerHTML =
        '<div class="empty">جارٍ توليد الصورة... يرجى الانتظار.</div>';

    }

    if (finished) return;

    if (!imageUrl) {
      throw new Error('لم تصل الصورة من محرك التوليد.');
    }

    // عرض الصورة

    const img = new Image();

    img.alt = 'الصورة الناتجة من AI RSHAD PRO';

    img.style.cssText =
      'width:100%;height:auto;border-radius:14px;display:block;';

    img.onload = () => {

      if (finished) return;

      box.innerHTML = '';
      box.appendChild(img);

      const saveBtn = document.createElement('button');

      saveBtn.textContent = 'تحميل الصورة';

      saveBtn.addEventListener('click', async () => {

        try {

          const link = document.createElement('a');

          link.href = imageUrl;
          link.target = '_blank';
          link.rel = 'noopener';

          link.download = 'AI-RSHAD-PRO.png';

          document.body.appendChild(link);
          link.click();
          link.remove();

        } catch (error) {

          window.open(imageUrl, '_blank');

        }

      });

      box.appendChild(saveBtn);

      if (typeof saveWork === 'function') {
        saveWork({
          type: 'صورة مولدة',
          prompt,
          details: 'AI Horde'
        });
      }

      toast('تم توليد الصورة بنجاح.');

      finish();

    };

    img.onerror = () => {

      box.innerHTML =
        '<div class="empty">تم التوليد لكن تعذر عرض الصورة. حاول مجدداً.</div>';

      finish();

    };

    img.src = imageUrl;

  } catch (error) {

    console.error('AI Horde Error:', error);

    box.innerHTML =
      '<div class="empty">' +
      esc(error.message || 'حدث خطأ أثناء توليد الصورة.') +
      '</div>';

    toast('تعذر توليد الصورة.');

    finish();

  }

});

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
