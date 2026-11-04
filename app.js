const PAYMENT_ID = "53d2865bb42bf1a2c714a5239f7e2aad";
const plans = {
  weekly: { price: 3, days: 7 },
  monthly: { price: 9, days: 30 },
  yearly: { price: 79, days: 365 }
};

const languages = [
  ["ar","العربية","Arabic"],["en","English","English"],["fr","Français","French"],
  ["de","Deutsch","German"],["es","Español","Spanish"],["tr","Türkçe","Turkish"],
  ["nl","Nederlands","Dutch"],["zh","中文","Chinese"],["ja","日本語","Japanese"],
  ["ru","Русский","Russian"],["pt","Português","Portuguese"],["hi","हिन्दी","Hindi"]
];

const translations = {
  en: {
    eyebrow:"DISCOVER. COMPARE. CREATE.",welcomeTitle:'Welcome to <span>RSHAD AI</span>',welcomeText:"Your guide to AI tools around the world.",
    howTitle:"A smarter way to find AI services",disclaimer:"RSHAD AI is an independent intermediary and recommendation platform. We help members discover and compare third-party AI services. The services are provided by their respective companies, not by RSHAD AI.",
    affiliateNote:"Some recommendations may include partner or referral links. We may earn a commission if you use them, at no extra cost to you. Partner status does not guarantee that a service is the best fit.",
    continue:"Continue",membership:"MEMBERSHIP",choosePlan:"Choose your plan",planSub:"Select the membership period that suits you.",
    weekly:"Weekly",monthly:"Monthly",yearly:"Yearly",perWeek:" / 7 days",perMonth:" / 30 days",perYear:" / 365 days",
    weeklyDesc:"A short introduction to member recommendations.",monthlyDesc:"Explore recommendations throughout the month.",yearlyDesc:"Best value for regular AI tool discovery.",
    select:"Select plan",popular:"POPULAR",priceNote:"Prices are displayed in USD. Confirm that your payment provider accepts the required currency before collecting payments.",
    checkout:"CHECKOUT",completeMembership:"Complete your membership",paymentIntro:"Follow the instructions below, then submit your payment notification.",
    selectedPlan:"Selected plan",shamCashId:"Sham Cash payment identifier",copyId:"Copy identifier",demoNoticeTitle:"Experimental payment flow",
    demoNotice:"This prototype does not connect to Sham Cash or verify transfers. For testing only, submitting the form below opens the member area immediately. Do not use this flow to collect real payments until server-side payment verification is implemented.",
    transferReference:"Transfer reference (optional)",proofLabel:"Payment notification / receipt image (optional in demo)",submitNotice:"Submit payment notification",backPlans:"Back to plans",
    memberArea:"MEMBER AREA",memberWelcome:"Welcome, member",memberPrompt:"What would you like to do today?",demoMembership:"DEMO MEMBERSHIP — NOT PAYMENT VERIFIED",
    chooseService:"Choose a service",serviceSub:"Select what you want to achieve. We’ll suggest suitable tools.",
    images:"AI images",imagesDesc:"Generate and edit images",video:"AI video",videoDesc:"Create and edit videos",audio:"AI audio",audioDesc:"Voice, speech and sound",
    writing:"Writing",writingDesc:"Text, ideas and marketing",music:"AI music",musicDesc:"Create music and songs",coding:"Coding",codingDesc:"Build and develop software",
    translation:"Translation",translationDesc:"Translate text and media",assistants:"AI assistants",assistantsDesc:"Research and productivity",
    recommendations:"RECOMMENDATIONS",recommendationDisclaimer:"These are sample directory entries for the prototype, not live rankings or verified endorsements. Partner links must be added only after a real agreement.",
    restart:"Restart demo",footerText:"RSHAD AI is an independent discovery platform.",copied:"Payment identifier copied.",submitted:"Demo access opened. No payment was verified.",
    selected:"Selected",bestOverall:"Suggested option",budget:"Budget-friendly option",capabilities:"Feature-rich option",partner:"Partner link",standard:"Website",noPartner:"No verified partner relationship",
    services:{images:"AI image tools",video:"AI video tools",audio:"AI audio tools",writing:"AI writing tools",music:"AI music tools",coding:"AI coding tools",translation:"AI translation tools",assistants:"AI assistants"}
  },
  ar: {
    eyebrow:"اكتشف. قارن. أنجز.",welcomeTitle:'مرحباً بك في <span>RSHAD AI</span>',welcomeText:"دليلك لاكتشاف أدوات الذكاء الاصطناعي حول العالم.",
    howTitle:"طريقة أذكى لاكتشاف خدمات الذكاء الاصطناعي",disclaimer:"RSHAD AI منصة مستقلة للوساطة والترشيح. نساعد المشتركين على اكتشاف خدمات الذكاء الاصطناعي التابعة لشركات أخرى ومقارنتها. الشركات المزودة هي التي تقدم الخدمات، وليست RSHAD AI.",
    affiliateNote:"قد تتضمن بعض الترشيحات روابط شراكة أو إحالة. قد نحصل على عمولة عند استخدامك لها دون تكلفة إضافية عليك. ولا يعني وجود شراكة أن الخدمة هي الأنسب دائماً.",
    continue:"متابعة",membership:"الاشتراكات",choosePlan:"اختر اشتراكك",planSub:"اختر مدة العضوية المناسبة لك.",
    weekly:"أسبوعي",monthly:"شهري",yearly:"سنوي",perWeek:" / 7 أيام",perMonth:" / 30 يوماً",perYear:" / 365 يوماً",
    weeklyDesc:"تعرّف سريعاً على ترشيحات الأعضاء.",monthlyDesc:"اكتشف الترشيحات طوال الشهر.",yearlyDesc:"أفضل قيمة للاستخدام المنتظم.",
    select:"اختيار الاشتراك",popular:"الأكثر اختياراً",priceNote:"الأسعار معروضة بالدولار الأمريكي. يجب التأكد من قبول مزود الدفع لهذه العملة قبل تحصيل الأموال.",
    checkout:"الدفع",completeMembership:"إكمال الاشتراك",paymentIntro:"اتبع التعليمات أدناه ثم أرسل إشعار الدفع.",
    selectedPlan:"الاشتراك المختار",shamCashId:"معرّف الدفع عبر شام كاش",copyId:"نسخ المعرّف",demoNoticeTitle:"نظام دفع تجريبي",
    demoNotice:"هذه النسخة لا تتصل بشام كاش ولا تتحقق من التحويلات. لأغراض التجربة فقط، يؤدي إرسال النموذج إلى فتح صفحة المشترك فوراً. لا تستخدم هذا المسار لتحصيل أموال حقيقية قبل إضافة تحقق آمن عبر الخادم.",
    transferReference:"رقم الحوالة (اختياري)",proofLabel:"إشعار الدفع / صورة الإيصال (اختياري في التجربة)",submitNotice:"إرسال إشعار الدفع",backPlans:"العودة إلى الاشتراكات",
    memberArea:"منطقة المشتركين",memberWelcome:"أهلاً بك أيها المشترك",memberPrompt:"ما الخدمة التي تبحث عنها اليوم؟",demoMembership:"عضوية تجريبية — لم يتم التحقق من الدفع",
    chooseService:"اختر الخدمة",serviceSub:"حدد ما تريد إنجازه وسنقترح عليك أدوات مناسبة.",
    images:"الصور بالذكاء الاصطناعي",imagesDesc:"إنشاء الصور وتعديلها",video:"الفيديو بالذكاء الاصطناعي",videoDesc:"إنشاء الفيديو وتحريره",audio:"الصوت بالذكاء الاصطناعي",audioDesc:"الأصوات والكلام والمؤثرات",
    writing:"الكتابة",writingDesc:"النصوص والأفكار والتسويق",music:"الموسيقى",musicDesc:"إنشاء الموسيقى والأغاني",coding:"البرمجة",codingDesc:"بناء البرامج وتطويرها",
    translation:"الترجمة",translationDesc:"ترجمة النصوص والوسائط",assistants:"المساعدات الذكية",assistantsDesc:"البحث والإنتاجية",
    recommendations:"الترشيحات",recommendationDisclaimer:"هذه أمثلة تجريبية في دليل المنصة وليست تصنيفات مباشرة أو توصيات موثقة. لا تُضاف روابط الشركاء إلا بعد اتفاق حقيقي.",
    restart:"إعادة التجربة",footerText:"RSHAD AI منصة مستقلة لاكتشاف الخدمات.",copied:"تم نسخ معرّف الدفع.",submitted:"تم فتح صفحة التجربة. لم يتم التحقق من أي دفعة.",
    selected:"الخيار المقترح",bestOverall:"الخيار المقترح",budget:"خيار اقتصادي",capabilities:"خيار غني بالميزات",partner:"رابط شريك",standard:"الموقع الرسمي",noPartner:"لا توجد شراكة موثقة",
    services:{images:"أدوات الصور",video:"أدوات الفيديو",audio:"أدوات الصوت",writing:"أدوات الكتابة",music:"أدوات الموسيقى",coding:"أدوات البرمجة",translation:"أدوات الترجمة",assistants:"المساعدات الذكية"}
  }
};

// Additional language labels are selectable now; translations can be expanded without changing the app flow.
const fallbackNames = Object.fromEntries(languages.map(([code,label]) => [code,label]));
let currentLanguage = localStorage.getItem("rshadLanguage") || "";
let selectedPlan = "monthly";
let toastTimer;

const directory = {
  images: [
    {name:"Adobe Firefly",url:"https://www.adobe.com/products/firefly.html",desc:"Image generation and creative editing tools.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Leonardo AI",url:"https://leonardo.ai/",desc:"Image creation tools and creative workflows.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Ideogram",url:"https://ideogram.ai/",desc:"Image generation with a focus on text rendering.",tag:"Official website · Verify current features and pricing",partner:false}
  ],
  video: [
    {name:"Runway",url:"https://runwayml.com/",desc:"AI video creation and editing tools.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Pika",url:"https://pika.art/",desc:"AI-powered video creation.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Luma AI",url:"https://lumalabs.ai/",desc:"Generative video and creative tools.",tag:"Official website · Verify current features and pricing",partner:false}
  ],
  audio: [
    {name:"ElevenLabs",url:"https://elevenlabs.io/",desc:"AI voice generation and speech tools.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Adobe Podcast",url:"https://podcast.adobe.com/",desc:"Audio enhancement and speech workflows.",tag:"Official website · Verify current features and pricing",partner:false}
  ],
  writing: [
    {name:"ChatGPT",url:"https://chatgpt.com/",desc:"Writing, brainstorming, analysis and assistance.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Claude",url:"https://claude.ai/",desc:"Writing, analysis and long-form assistance.",tag:"Official website · Verify current features and pricing",partner:false}
  ],
  music: [
    {name:"Suno",url:"https://suno.com/",desc:"AI-assisted music and song generation.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Udio",url:"https://www.udio.com/",desc:"AI music creation platform.",tag:"Official website · Verify current features and pricing",partner:false}
  ],
  coding: [
    {name:"GitHub Copilot",url:"https://github.com/features/copilot",desc:"AI coding assistance integrated into developer workflows.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Replit",url:"https://replit.com/",desc:"Online development environment with AI features.",tag:"Official website · Verify current features and pricing",partner:false}
  ],
  translation: [
    {name:"DeepL",url:"https://www.deepl.com/translator",desc:"Machine translation for text and supported files.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Google Translate",url:"https://translate.google.com/",desc:"Translation across many languages and formats.",tag:"Official website · Verify current features and pricing",partner:false}
  ],
  assistants: [
    {name:"ChatGPT",url:"https://chatgpt.com/",desc:"General-purpose AI assistant for research and productivity.",tag:"Official website · Verify current features and pricing",partner:false},
    {name:"Perplexity",url:"https://www.perplexity.ai/",desc:"AI-powered research and answer engine.",tag:"Official website · Verify current features and pricing",partner:false}
  ]
};

function t(key){
  const pack = translations[currentLanguage] || translations.en;
  return pack[key] ?? translations.en[key] ?? key;
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
function toast(message){
  const el=document.getElementById("toast");
  el.textContent=message;el.classList.add("show");
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2800);
}
function applyLanguage(code){
  currentLanguage=code;
  localStorage.setItem("rshadLanguage",code);
  const rtl=code==="ar";
  document.documentElement.lang=code;
  document.documentElement.dir=rtl?"rtl":"ltr";
  document.body.dir=rtl?"rtl":"ltr";
  document.getElementById("currentLang").textContent=fallbackNames[code] || "English";
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key=el.dataset.i18n;
    const value=t(key);
    if(value!==undefined) el.innerHTML=value;
  });
  document.getElementById("languagePrompt").textContent=rtl?"اختر اللغة التي تفضلها للمتابعة.":"Choose your preferred language to continue.";
  document.getElementById("languageScreen").classList.remove("active");
  showScreen("welcomeScreen");
}
function buildLanguageGrid(){
  const grid=document.getElementById("languageGrid");
  grid.innerHTML="";
  languages.forEach(([code,label,english])=>{
    const button=document.createElement("button");
    button.className="language-option";button.type="button";
    button.innerHTML=`${label}<span>${english}</span>`;
    button.addEventListener("click",()=>applyLanguage(code));
    grid.appendChild(button);
  });
}
function planLabel(plan){
  const names={weekly:t("weekly"),monthly:t("monthly"),yearly:t("yearly")};
  return `${names[plan]} — $${plans[plan].price}`;
}
function openPayment(plan){
  selectedPlan=plan;
  document.getElementById("selectedPlanLabel").textContent=planLabel(plan);
  showScreen("paymentScreen");
}
function openMemberArea(){
  const record={plan:selectedPlan,startedAt:new Date().toISOString(),demo:true};
  localStorage.setItem("rshadDemoMembership",JSON.stringify(record));
  showScreen("memberScreen");
  toast(t("submitted"));
}
function renderRecommendations(service){
  const list=document.getElementById("recommendationList");
  const items=directory[service]||[];
  document.getElementById("recommendationTitle").textContent=(t("services")||{})[service]||service;
  list.innerHTML="";
  items.forEach((item,index)=>{
    const row=document.createElement("div");row.className="recommendation-item";
    const info=document.createElement("div");
    const title=document.createElement("h3");title.textContent=item.name;
    const desc=document.createElement("p");desc.textContent=item.desc;
    const tag=document.createElement("span");tag.className="tag";tag.textContent=item.tag;
    info.append(title,desc,tag);
    const link=document.createElement("a");link.href=item.url;link.target="_blank";link.rel="noopener noreferrer";link.textContent=t("standard");
    row.append(info,link);list.appendChild(row);
  });
  document.getElementById("recommendationPanel").classList.remove("hidden");
  document.getElementById("recommendationPanel").scrollIntoView({behavior:"smooth",block:"start"});
}

buildLanguageGrid();
document.getElementById("toPlans").addEventListener("click",()=>showScreen("plansScreen"));
document.querySelectorAll(".choose-plan").forEach(btn=>btn.addEventListener("click",()=>openPayment(btn.dataset.plan)));
document.getElementById("backToPlans").addEventListener("click",()=>showScreen("plansScreen"));
document.getElementById("copyPaymentId").addEventListener("click",async()=>{
  try{await navigator.clipboard.writeText(PAYMENT_ID);toast(t("copied"));}
  catch{toast(PAYMENT_ID);}
});
document.getElementById("paymentIdentifier").textContent=PAYMENT_ID;
document.getElementById("paymentForm").addEventListener("submit",event=>{
  event.preventDefault();
  // Prototype-only behavior: no receipt upload, payment verification, or real entitlement is performed.
  openMemberArea();
});
document.querySelectorAll(".service-card").forEach(card=>card.addEventListener("click",()=>renderRecommendations(card.dataset.service)));
document.getElementById("closeRecommendations").addEventListener("click",()=>document.getElementById("recommendationPanel").classList.add("hidden"));
document.getElementById("restartDemo").addEventListener("click",()=>{
  localStorage.removeItem("rshadDemoMembership");showScreen("languageScreen");
});
document.getElementById("changeLanguage").addEventListener("click",()=>showScreen("languageScreen"));

// Returning demo visitors go through language selection again, as requested for the first screen.
if(currentLanguage){
  document.getElementById("currentLang").textContent=fallbackNames[currentLanguage]||"English";
  document.documentElement.lang=currentLanguage;
  document.documentElement.dir=currentLanguage==="ar"?"rtl":"ltr";
  document.body.dir=currentLanguage==="ar"?"rtl":"ltr";
}
