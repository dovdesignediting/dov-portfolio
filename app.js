let currentLang = 'he';
let currentFilter = 'all';
let selectedServices = [];
// SHA-256 of the admin access code. The code itself is no longer stored in the page.
// This only hides the panel: it runs in the visitor's browser and is not server-side security.
const ACCESS_HASH = "9f68e938a98631d27834e5d770bf5e4b6a3a09f1eb6ef4e5d9bea74c4c13113b";

function readStore(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : fallback;
    } catch (e) {
        return fallback;
    }
}
function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}
// Only http(s) links are allowed, so a stored link can never run script (javascript:, data:).
function safeUrl(value) {
    try {
        const url = new URL(String(value || '').trim(), location.href);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch (e) {
        return '';
    }
}

let siteAds = readStore('dov_ads', []);

// טעינת גלריית העבודות מזיכרון הדפדפן, אם ריק - טוען את עבודות ברירת המחדל
let siteWorks = readStore('dov_works', null);
if (!siteWorks) {
    siteWorks = [
        {url: 'https://i.postimg.cc/fT3SF1hz/Picsart-25-08-30-21-41-32-973.png', cat: 'ads'},
        {url: 'https://i.postimg.cc/66bGMtFN/1767556230317.png', cat: 'ads'},
        {url: 'https://i.postimg.cc/QxRKrSXB/1755407066547.png', cat: 'ads'},
        {url: 'https://i.postimg.cc/wTtRPndv/1756004839008.png', cat: 'branding'},
        {url: 'https://i.postimg.cc/05XJVPh1/IMG-20251228-WA0014.jpg', cat: 'branding'},
        {url: 'https://i.postimg.cc/BZ71m4kd/Picsart-26-01-07-17-32-32-551.png', cat: 'branding'},
        {url: 'https://i.postimg.cc/rsB29YTx/Picsart-26-01-19-19-13-14-199.png', cat: 'branding'},
        {url: 'https://i.postimg.cc/y8XCnYW8/Picsart-26-01-20-05-54-51-529.jpg', cat: 'business_cards'},
        {url: 'https://i.postimg.cc/7ZMrXYbY/Picsart-26-01-20-05-51-57-093.png', cat: 'business_cards'}
    ];
    writeStore('dov_works', siteWorks);
}

const services = [
    { id: 'logo', he: 'חבילת לוגו ומיתוג', en: 'Logo & Branding Package', es: 'Paquete Logo y Branding', price: 500, desc: 'מחקר שוק ואפיון שפה ויזואלית ייחודית לעסק. עיצוב לוגו מקורי (3 סקיצות לבחירה). התאמת פלטת צבעים וגופנים. מסירת כל קבצי המקור (Vector, PNG, PDF).', desc_en: 'Market research & unique visual language. Original logo design (3 sketches). Color palette & typography. All source files included (Vector, PNG, PDF).', desc_es: 'Investigación de mercado y lenguaje visual. Diseño de logo original (3 bocetos). Paleta de colores y tipografía. Archivos fuente.' },
    { id: 'card', he: 'חבילת "כרטיס מנצח"', en: 'Winning Card Package', es: 'Paquete Tarjeta Ganadora', price: 150, desc: 'עיצוב כרטיס ביקור דו-צדדי בקו נקי ומקצועי. התאמה מלאה למיתוג הקיים. הכנה לדפוס (בלידים וסימני חיתוך).', desc_en: 'Professional double-sided business card. Fully aligned with existing branding. Print-ready files with bleeds and crop marks.', desc_es: 'Diseño de tarjeta de doble cara. Alineado con su marca. Archivos listos para imprimir con sangrados.' },
    { id: 'allinprint', he: 'חבילת "הכל כלול" פרינט', en: 'All-Inclusive Print', es: 'Todo Incluido Impresión', price: 250, desc: 'לוגו + כרטיס ביקור + מודעת פרסום. אחידות ויזואלית בין כל מוצרי הפרסום. חיסכון משמעותי לעומת הזמנה נפרדת.', desc_en: 'Logo + Business Card + Advertisement. Visual consistency across all print assets. Great value vs. ordering separately.', desc_es: 'Logo + Tarjeta + Anuncio. Consistencia visual. Gran valor.' },
    { id: 'digital', he: 'חבילת "נוכחות דיגיטלית"', en: 'Digital Presence Package', es: 'Paquete Presencia Digital', price: 250, desc: 'פלייר דיגיטלי לוואטסאפ ורשתות חברתיות. תמונות פרופיל וקאברים לפלטפורמות. מיקוד שיווקי לפעולה מהירה.', desc_en: 'Digital flyer for WhatsApp and Social Media. Profile pictures & covers for all platforms. Marketing focus on CTA.', desc_es: 'Flyer digital para WhatsApp y redes. Fotos de perfil y portadas.' },
    { id: 'email_sig', he: 'עיצוב חתימה למייל', en: 'Email Signature Design', es: 'Firma de Correo', price: 80, desc: 'חתימה מקצועית שמעלה אמינות. לינקים קליקביליים (אתר, טלפון, רשתות). קוד HTML להטמעה ב-Gmail ו-Outlook.', desc_en: 'Professional signature for high credibility. Clickable links. HTML code for Gmail/Outlook.', desc_es: 'Firma profesional con enlaces. Código HTML.' },
    { id: 'landing', he: 'דף נחיתה', en: 'Landing Page', es: 'Landing Page', price: 500, desc: 'עמוד מכירתי ממוקד למקסום המרות. מותאם לקמפיינים ממומנים. טופס לידים ישיר למייל/וואטסאפ. רספונסיבי מלא.', desc_en: 'Focused sales page for max conversions. Optimized for paid campaigns. Direct lead form to Email/WhatsApp. Fully responsive.', desc_es: 'Página de ventas enfocada. Optimizada para anuncios. Formulario directo.' },
    { id: 'website_basic', he: 'אתר תדמית', en: 'Portfolio / Business Website', es: 'Sitio Web Corporativo', price: 800, desc: 'אתר תדמיתי עד 5 עמודים. גלריית עבודות מרשימה. דגש על UI/UX ומהירות טעינה.', desc_en: 'Business site up to 5 pages. Stunning gallery. Focus on UI/UX and fast loading speeds.', desc_es: 'Sitio hasta 5 páginas. Galería impresionante. UX/UI y carga rápida.' },
    { id: 'website_pro', he: 'אתר עסקי פרו', en: 'Pro Business Website', es: 'Sitio Web Pro', price: 2500, desc: 'פיתוח קוד מלא ללא תבניות. ניהול גרסאות ב-GitHub. ביצועים מקסימליים והתאמה אישית מלאה.', desc_en: 'Full custom-code (HTML/CSS/JS). GitHub version control. Max performance & full customization.', desc_es: 'Código personalizado (HTML/CSS/JS). Máximo rendimiento.' },
    { id: 'ecommerce', he: 'חנות אונליין', en: 'E-Commerce Store', es: 'Tienda en Línea', price: 1500, desc: 'חנות וירטואלית מלאה. חיבור למסלקות תשלום מאובטחות. מערכת ניהול נוחה לסדרי מוצרים ומלאי.', desc_en: 'Full online store. Secure payment gateway. Easy management for products & orders.', desc_es: 'Tienda virtual completa. Pasarela de pago segura.' },
    { id: 'premium', he: 'חבילת פרימיום', en: 'Premium Package', es: 'Paquete Premium', price: 5000, desc: 'מערכות אישיות מורכבות. חיבורי API חיצוניים (CRM, אוטומציות). ליווי SEO ואבטחת מידע ברמה גבוהה.', desc_en: 'Complex custom systems. API integrations (CRM, Automations). Full SEO & high-level security.', desc_es: 'Sistemas complejos. Integraciones API. SEO y alta seguridad.' },
    { id: 'maintenance', he: 'תחזוקה חודשית ריטיינר', en: 'Monthly Maintenance', es: 'Mantenimiento Mensual', price: 250, desc: '"ראש שקט" לבעל העסק. גיבויים שבועיים מלאים וניטור אבטחה. עד שעתיים שינויי תוכן קלים בחודש.', desc_en: 'Peace of mind — site always live. Weekly backups & security monitoring. 2 monthly hours for content updates.', desc_es: 'Sitio siempre activo. Copias de seguridad y monitoreo. 2 horas mensuales.' },
    { id: 'hosting', he: 'אחסון ודומיין שנתי', en: 'Yearly Hosting & Domain', es: 'Hosting y Dominio', price: 200, desc: 'שטח אחסון בשרתים מהירים. רישום וניהול דומיין. הגדרות DNS וניהול טכני מלא.', desc_en: 'High-speed hosting & domain registration. DNS settings & full technical management.', desc_es: 'Hosting rápido y registro de dominio. Gestión técnica.' },
    { id: 'hourly', he: 'שעת ייעוץ / תיקונים', en: 'Consulting / Fixes (Hourly)', es: 'Consultoría / Por Hora', price: 100, desc: 'פתרון בעיות טכניות באתרים קיימים. ייעוץ אסטרטגי לשיווק דיגיטלי. עבודה לפי שעה על שינויים חורגים.', desc_en: 'Technical fixes for existing sites. Digital marketing consulting. Hourly rate for extra requests.', desc_es: 'Soluciones técnicas y marketing. Tarifa por hora.' }
];
const root = document.documentElement;

// Interface text that has no visible translation in the page markup:
// form validation messages and screen-reader labels.
const UI_TEXT = {
    he: { nameRequired: 'נא למלא שם מלא.', emailInvalid: 'נא להזין כתובת אימייל תקינה.', captchaRequired: 'נא לאשר שאינך רובוט.', sending: 'שולח...', close: 'סגירה', menu: 'תפריט', previous: 'הקודם', next: 'הבא', scroll: 'גלילה למטה', language: 'שפה', filter: 'סינון', services: 'שירותים', home: 'דף הבית', quickActions: 'פעולות מהירות', main: 'ניווט ראשי', portfolio: 'תיק עבודות', imageUnavailable: 'התמונה לא זמינה' },
    en: { nameRequired: 'Please enter your full name.', emailInvalid: 'Please enter a valid email address.', captchaRequired: 'Please confirm you are not a robot.', sending: 'Sending...', close: 'Close', menu: 'Menu', previous: 'Previous', next: 'Next', scroll: 'Scroll down', language: 'Language', filter: 'Filter', services: 'Services', home: 'Home', quickActions: 'Quick actions', main: 'Main navigation', portfolio: 'Portfolio', imageUnavailable: 'Image unavailable' },
    es: { nameRequired: 'Introduzca su nombre completo.', emailInvalid: 'Introduzca un correo electrónico válido.', captchaRequired: 'Confirme que no es un robot.', sending: 'Enviando...', close: 'Cerrar', menu: 'Menú', previous: 'Anterior', next: 'Siguiente', scroll: 'Desplazar hacia abajo', language: 'Idioma', filter: 'Filtrar', services: 'Servicios', home: 'Inicio', quickActions: 'Acciones rápidas', main: 'Navegación principal', portfolio: 'Portafolio', imageUnavailable: 'Imagen no disponible' }
};
function ui(key) { return (UI_TEXT[currentLang] || UI_TEXT.he)[key] || UI_TEXT.en[key] || key; }

// The markup keeps English aria-labels; each is mapped to a UI_TEXT key and translated.
const ARIA_KEYS = { 'Close': 'close', 'Menu': 'menu', 'Previous': 'previous', 'Next': 'next', 'Scroll': 'scroll', 'Language': 'language', 'Filter': 'filter', 'Services': 'services', 'Home': 'home', 'Quick actions': 'quickActions', 'Main': 'main', 'Portfolio': 'portfolio', 'Image unavailable': 'imageUnavailable' };
function translateAriaLabels() {
    document.querySelectorAll('[aria-label]').forEach(el => {
        if (!el.dataset.ariaKey) {
            const key = ARIA_KEYS[el.getAttribute('aria-label')];
            if (!key) return;
            el.dataset.ariaKey = key;
        }
        el.setAttribute('aria-label', ui(el.dataset.ariaKey));
    });
}

function placeholderMarkup() {
    return `<span class="placeholder" role="img" aria-label="${ui('imageUnavailable')}"><svg class="ic"><use href="#i-image-off"/></svg></span>`;
}

// ── CONTACT FORM ──
// The form still posts straight to Formspree (unchanged), so success is Formspree's own
// confirmation page; nothing on this page ever claims a message was sent.
function setFieldError(input, key) {
    const err = document.getElementById(input.id + '-err');
    input.setAttribute('aria-invalid', key ? 'true' : 'false');
    err.dataset.errKey = key || '';
    err.textContent = key ? ui(key) : '';
}

// reCAPTCHA (~350 KB) loads only when the visitor nears the form, instead of on every page view.
// api.js renders the existing .g-recaptcha widget by itself once it loads.
let recaptchaState = 'idle';
function loadRecaptcha() {
    if (recaptchaState !== 'idle') return;
    recaptchaState = 'loading';
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => { recaptchaState = 'ready'; };
    script.onerror = () => { recaptchaState = 'failed'; };
    document.head.appendChild(script);
}
function watchContactForRecaptcha() {
    const form = document.getElementById('contact-form');
    form.addEventListener('focusin', loadRecaptcha, { once: true });
    if (!('IntersectionObserver' in window)) return loadRecaptcha();
    const io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { io.disconnect(); loadRecaptcha(); }
    }, { rootMargin: '900px 0px' });
    io.observe(document.getElementById('contact-section'));
}

function validateContact(form) {
    const name = form.querySelector('#cf-name');
    const email = form.querySelector('#cf-email');
    const status = document.getElementById('cf-status');
    const invalid = [];
    setFieldError(name, name.value.trim() ? '' : 'nameRequired');
    if (!name.value.trim()) invalid.push(name);
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    setFieldError(email, emailOk ? '' : 'emailInvalid');
    if (!emailOk) invalid.push(email);
    status.dataset.errKey = '';
    status.textContent = '';
    let captchaMissing = false;
    try {
        if (window.grecaptcha && typeof grecaptcha.getResponse === 'function' && form.querySelector('.g-recaptcha iframe')) {
            captchaMissing = !grecaptcha.getResponse();
        } else if (recaptchaState === 'idle' || recaptchaState === 'loading') {
            // Widget not on screen yet: start it and ask the visitor to tick it. If it failed to
            // load (blocked), the form is still sent and Formspree applies its own check.
            loadRecaptcha();
            captchaMissing = true;
        }
    } catch (e) { captchaMissing = false; }
    if (captchaMissing) { status.dataset.errKey = 'captchaRequired'; status.textContent = ui('captchaRequired'); }
    if (invalid.length) invalid[0].focus();
    return !invalid.length && !captchaMissing;
}

function resetContactButton() {
    const btn = document.getElementById('cf-submit');
    btn.classList.remove('is-sending');
    btn.textContent = btn.getAttribute('data-' + currentLang) || btn.getAttribute('data-he');
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    form.noValidate = true;
    form.addEventListener('submit', e => {
        if (!validateContact(form)) { e.preventDefault(); return; }
        const btn = document.getElementById('cf-submit');
        btn.classList.add('is-sending');
        btn.textContent = ui('sending');
    });
    form.querySelectorAll('#cf-name, #cf-email').forEach(input => input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') setFieldError(input, '');
    }));
    // Coming back from Formspree's page (back button) must not leave the button stuck on "Sending".
    window.addEventListener('pageshow', resetContactButton);
}

function translateFormMessages() {
    document.querySelectorAll('#contact-form [data-err-key]').forEach(el => { el.textContent = el.dataset.errKey ? ui(el.dataset.errKey) : ''; });
    const btn = document.getElementById('cf-submit');
    if (btn.classList.contains('is-sending')) btn.textContent = ui('sending');
}

// ── SCROLL LOCK ──
function syncScrollLock() {
    const overlay = document.querySelector('.overlay.active');
    const menuOpen = root.classList.contains('menu-open');
    root.classList.toggle('is-locked', !!(overlay || menuOpen));
    // Content behind an open dialog or menu can't be reached by keyboard or screen readers.
    document.querySelectorAll('main, footer, .dock').forEach(el => { el.inert = !!(overlay || menuOpen); });
    document.getElementById('site-header').inert = !!overlay;
    document.getElementById('mobile-menu').inert = !!overlay || !menuOpen;
}
// ── DIALOG FOCUS ──
const FOCUSABLE = 'button:not([disabled]), a[href], input:not([type="hidden"]):not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])';
function focusInto(container) {
    container._returnFocus = document.activeElement;
    setTimeout(() => {
        const target = container.querySelector('[data-autofocus]') || container.querySelector(FOCUSABLE);
        if (target) target.focus({ preventScroll: true });
    }, 60);
}
function returnFocus(container) {
    const el = container._returnFocus;
    container._returnFocus = null;
    if (el && el.focus && document.contains(el) && !el.closest('[inert]')) el.focus({ preventScroll: true });
}
function topLayer() {
    const overlays = [...document.querySelectorAll('.overlay.active')];
    if (overlays.length) return overlays[overlays.length - 1];
    if (root.classList.contains('menu-open')) return document.getElementById('mobile-menu');
    return null;
}
document.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const layer = topLayer();
    if (!layer) return;
    const scope = layer.id === 'mobile-menu' ? [document.getElementById('menu-btn'), ...layer.querySelectorAll(FOCUSABLE)] : [...layer.querySelectorAll(FOCUSABLE)];
    const items = scope.filter(el => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !items.includes(document.activeElement))) { e.preventDefault(); first.focus(); }
});

// ── BUDGET MODAL ──
function openBudgetModal() {
    toggleMobileMenu(false);
    closeLangMenu();
    const modal = document.getElementById('budget-modal');
    if (modal.classList.contains('active')) return;
    modal.classList.add('active');
    renderBudgetServices();
    syncScrollLock();
    focusInto(modal);
}
function closeBudgetModal() {
    const modal = document.getElementById('budget-modal');
    if (!modal.classList.contains('active')) return;
    modal.classList.remove('active');
    syncScrollLock();
    returnFocus(modal);
}

// ── ADMIN MODAL ──
async function checkAccessCode(code) {
    if (!window.crypto || !crypto.subtle || !window.TextEncoder) return false;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
    const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
    return hex === ACCESS_HASH;
}
async function openAdminModal() {
    const code = prompt("נא להזין קוד גישה לניהול האתר:");
    if (code === null) return;
    if (await checkAccessCode(code.trim())) {
        const modal = document.getElementById('admin-ads-modal');
        modal.classList.add('active');
        renderAdminAds();
        renderAdminWorks();
        syncScrollLock();
        focusInto(modal);
    } else {
        alert("קוד שגוי.");
    }
}
function closeAdminModal() {
    const modal = document.getElementById('admin-ads-modal');
    if (!modal.classList.contains('active')) return;
    modal.classList.remove('active');
    syncScrollLock();
    returnFocus(modal);
}

function saveOrWarn(key, value) {
    if (!writeStore(key, value)) alert("השמירה נכשלה: הדפדפן חוסם שמירה מקומית (למשל בגלישה בסתר).");
}

// ── ADMIN: ADS ──
function addNewAd() {
    const imgInput = document.getElementById('ad-image-input').value.trim();
    const text = document.getElementById('ad-text-input').value.trim().slice(0, 160);
    const linkInput = document.getElementById('ad-link-input').value.trim();
    if (!imgInput || !text) return alert("נא למלא שדות תמונה וטקסט");
    const img = safeUrl(imgInput);
    const link = linkInput ? safeUrl(linkInput) : '';
    if (!img || (linkInput && !link)) return alert("נא להזין קישור תקין שמתחיל ב-https://");
    siteAds.push({ img, text, link });
    saveOrWarn('dov_ads', siteAds);
    document.getElementById('ad-image-input').value = '';
    document.getElementById('ad-text-input').value = '';
    document.getElementById('ad-link-input').value = '';
    renderAdminAds();
    renderSiteAds();
}

function removeAd(index) {
    siteAds.splice(index, 1);
    saveOrWarn('dov_ads', siteAds);
    renderAdminAds();
    renderSiteAds();
}

// Admin rows and partner cards are built with DOM APIs (textContent, safe URLs),
// never by putting stored values into HTML strings.
function adminRow(imgUrl, label, onDelete) {
    const row = document.createElement('div');
    row.className = 'admin-row';
    const img = document.createElement('img');
    img.alt = '';
    img.onerror = () => { img.style.display = 'none'; };
    const src = safeUrl(imgUrl);
    if (src) img.src = src; else img.style.display = 'none';
    const span = document.createElement('span');
    span.textContent = label;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'admin-del';
    del.textContent = 'מחק';
    del.onclick = onDelete;
    row.append(img, span, del);
    return row;
}

function adminEmpty(list, text) {
    list.innerHTML = '';
    const p = document.createElement('p');
    p.className = 'admin-empty';
    p.textContent = text;
    list.appendChild(p);
}

function renderAdminAds() {
    const list = document.getElementById('admin-ads-list');
    if (siteAds.length === 0) return adminEmpty(list, 'אין פרסומות עדיין');
    list.innerHTML = '';
    siteAds.forEach((ad, i) => list.appendChild(adminRow(ad.img, ad.text, () => removeAd(i))));
}

function renderSiteAds() {
    const container = document.getElementById('dynamic-ads-container');
    const section = document.getElementById('ads-section');
    if (!siteAds.length) { section.classList.add('hidden'); return; }
    section.classList.remove('hidden');
    container.innerHTML = '';
    siteAds.forEach(ad => {
        const link = safeUrl(ad.link);
        const card = document.createElement(link ? 'a' : 'div');
        card.className = 'ad-card';
        if (link) { card.href = link; card.target = '_blank'; card.rel = 'noopener noreferrer'; }
        const img = document.createElement('img');
        img.alt = 'Ad';
        img.loading = 'lazy';
        img.onerror = () => { img.onerror = null; img.src = 'https://placehold.co/400x160/111/444?text=Ad'; };
        img.src = safeUrl(ad.img) || 'https://placehold.co/400x160/111/444?text=Ad';
        const p = document.createElement('p');
        p.className = 'ad-card-content';
        p.textContent = ad.text;
        card.append(img, p);
        container.appendChild(card);
    });
}

// ── ADMIN: GALLERY ──
function addNewWork() {
    const input = document.getElementById('work-image-input').value.trim();
    const cat = document.getElementById('work-cat-input').value;
    if (!input) return alert("נא להזין לינק לתמונה");
    const url = safeUrl(input);
    if (!url) return alert("נא להזין קישור תקין שמתחיל ב-https://");

    siteWorks.unshift({ url, cat }); // מוסיף את התמונה החדשה לראש הרשימה
    saveOrWarn('dov_works', siteWorks);

    document.getElementById('work-image-input').value = '';
    renderAdminWorks();
    refreshWorks();
}
function removeWork(index) {
    siteWorks.splice(index, 1);
    saveOrWarn('dov_works', siteWorks);
    renderAdminWorks();
    refreshWorks();
}

// רענון כל התצוגות של העבודות אחרי שינוי בפאנל הניהול
function refreshWorks() {
    if (document.getElementById('gallery-page').classList.contains('active')) renderGallery();
    renderShowcase();
    updateChipCounts();
}

function renderAdminWorks() {
    const list = document.getElementById('admin-works-list');
    if (siteWorks.length === 0) return adminEmpty(list, 'אין עבודות בגלריה');

    list.innerHTML = '';
    siteWorks.forEach((work, i) => {
        const catName = work.cat === 'branding' ? 'מיתוג' : work.cat === 'business_cards' ? 'כרטיסי ביקור' : 'מודעות';
        list.appendChild(adminRow(work.url, catName, () => removeWork(i)));
    });
}

// ── BUDGET SERVICES ──
// Prices are always shown as $1,234: toLocaleString() without a locale followed the
// visitor's device (es-ES showed $12.500, ar showed Arabic digits).
function usd(amount) {
    return '$' + amount.toLocaleString('en-US');
}

function budgetTotal() {
    return services.filter(s => selectedServices.includes(s.id)).reduce((a, c) => a + c.price, 0);
}

function renderBudgetServices() {
    const list = document.getElementById('services-list');
    list.innerHTML = '';
    services.forEach(s => {
        const isSelected = selectedServices.includes(s.id);
        const item = document.createElement('button');
        item.type = 'button';
        item.className = `option${isSelected ? ' selected' : ''}`;
        item.dataset.id = s.id;
        item.setAttribute('aria-pressed', isSelected);
        item.onclick = () => toggleService(s.id);
        const name = s[currentLang] || s.he;
        const desc = s['desc_' + currentLang] || s.desc;
        item.innerHTML = `
            <span class="option-check"><svg class="ic"><use href="#i-check"/></svg></span>
            <span class="option-main">
                <span class="option-name">${name}</span>
                <span class="option-desc">${desc}</span>
            </span>
            <span class="option-price">${usd(s.price)}</span>
        `;
        list.appendChild(item);
    });
    updateTotal();
}

function toggleService(id) {
    selectedServices = selectedServices.includes(id)
        ? selectedServices.filter(sid => sid !== id)
        : [...selectedServices, id];
    const on = selectedServices.includes(id);
    document.querySelectorAll(`.option[data-id="${id}"], .deck-card[data-id="${id}"]`).forEach(el => {
        el.classList.toggle('selected', on);
        el.setAttribute('aria-pressed', on);
    });
    updateTotal();
}

function updateTotal() {
    const total = budgetTotal();
    const count = selectedServices.length;
    document.getElementById('total-price-display').innerText = usd(total);
    document.getElementById('deck-total').innerText = usd(total);
    document.getElementById('deck-summary').classList.toggle('has-selection', total > 0);
    document.getElementById('wa-budget-btn').disabled = total === 0;
    document.querySelectorAll('[data-selected-count]').forEach(el => {
        el.textContent = count;
        el.classList.toggle('hidden', count === 0);
    });
}

// ── SERVICE DECK ──
function renderServiceDeck() {
    const deck = document.getElementById('service-deck');
    deck.innerHTML = '';
    services.forEach((s, i) => {
        const isSelected = selectedServices.includes(s.id);
        const card = document.createElement('button');
        card.type = 'button';
        card.className = `deck-card${isSelected ? ' selected' : ''}`;
        card.dataset.id = s.id;
        card.setAttribute('aria-pressed', isSelected);
        card.onclick = () => toggleService(s.id);
        card.innerHTML = `
            <span class="deck-top">
                <span class="deck-index">${String(i + 1).padStart(2, '0')}</span>
                <span class="option-check"><svg class="ic"><use href="#i-check"/></svg></span>
            </span>
            <span class="deck-name">${s[currentLang] || s.he}</span>
            <bdi class="deck-price">${usd(s.price)}</bdi>
            <span class="deck-desc">${s['desc_' + currentLang] || s.desc}</span>
        `;
        deck.appendChild(card);
    });
    updateTotal();
    updateDeckProgress();
}

function updateDeckProgress() {
    const deck = document.getElementById('service-deck');
    const max = deck.scrollWidth - deck.clientWidth;
    const visible = deck.clientWidth / deck.scrollWidth;
    const done = max > 0 ? Math.abs(deck.scrollLeft) / max : 1;
    document.getElementById('deck-progress-bar').style.width = `${Math.min(100, (visible + (1 - visible) * done) * 100)}%`;
}

function scrollDeck(dir) {
    const deck = document.getElementById('service-deck');
    const step = deck.querySelector('.deck-card').offsetWidth + 12;
    deck.scrollBy({ left: dir * step * (root.dir === 'rtl' ? -1 : 1), behavior: 'smooth' });
}

let deckFrame = 0;
document.getElementById('service-deck').addEventListener('scroll', () => {
    if (!deckFrame) deckFrame = requestAnimationFrame(() => { deckFrame = 0; updateDeckProgress(); });
}, { passive: true });

// Same wording as before, with one line per service and its price so the quote is itemized.
function buildWhatsAppQuote() {
    const selected = services.filter(s => selectedServices.includes(s.id));
    const total = selected.reduce((a, c) => a + c.price, 0);
    const lines = selected.map(s => `• ${s[currentLang] || s.he} – ${usd(s.price)}`).join('\n');
    if (currentLang === 'he') return `היי דוב, בניתי חבילה באתר!\nבחרתי:\n${lines}\nסה"כ: ${usd(total)}.`;
    if (currentLang === 'es') return `¡Hola Dov, armé un paquete en el sitio!\nSeleccionado:\n${lines}\nTotal: ${usd(total)}.`;
    return `Hi Dov, I built a package on the site!\nSelected:\n${lines}\nTotal: ${usd(total)}.`;
}

function sendBudgetToWhatsApp() {
    if (!selectedServices.length) return;
    const url = `https://wa.me/972559646422?text=${encodeURIComponent(buildWhatsAppQuote())}`;
    const win = window.open(url, '_blank');
    // If a popup blocker stopped the new tab, open WhatsApp in this tab instead.
    if (win) win.opener = null;
    else location.href = url;
}

// ── NAVIGATION ──
function toggleMobileMenu(force) {
    const open = typeof force === 'boolean' ? force : !root.classList.contains('menu-open');
    const wasOpen = root.classList.contains('menu-open');
    const menu = document.getElementById('mobile-menu');
    root.classList.toggle('menu-open', open);
    document.getElementById('menu-btn').setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    syncScrollLock();
    if (open && !wasOpen) focusInto(menu);
    if (!open && wasOpen && menu.contains(document.activeElement)) document.getElementById('menu-btn').focus({ preventScroll: true });
}

function showPage(pageId, fromHistory) {
    toggleMobileMenu(false);
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId + '-page');
    if (target) target.classList.add('active');
    if (!fromHistory) {
        if (pageId === 'gallery' && location.hash !== '#works') history.pushState(null, '', '#works');
        if (pageId === 'home' && location.hash) history.pushState(null, '', location.pathname + location.search);
    }
    window.scrollTo(0, 0);
    if (pageId === 'gallery') renderGallery();
    initReveal();
    onScroll();
    const hero = document.getElementById('hero');
    if (hero.syncIdle) hero.syncIdle();
}
function scrollToSection(id) {
    toggleMobileMenu(false);
    const wasHome = document.getElementById('home-page').classList.contains('active');
    if (!wasHome) showPage('home');
    setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - document.getElementById('site-header').offsetHeight;
        window.scrollTo({ top, behavior: 'smooth' });
    }, wasHome ? 0 : 220);
}

window.addEventListener('popstate', () => {
    // Back while the viewer is open only closes the viewer and keeps the page and its scroll position.
    if (lightboxEl.classList.contains('active')) { hideViewer(); return; }
    const target = location.hash === '#works' ? 'gallery' : 'home';
    if (!document.getElementById(target + '-page').classList.contains('active')) showPage(target, true);
});

// ── LANGUAGE ──
function toggleLangMenu(force) {
    const box = document.getElementById('lang');
    const open = typeof force === 'boolean' ? force : !box.classList.contains('is-open');
    box.classList.toggle('is-open', open);
    document.getElementById('lang-btn').setAttribute('aria-expanded', open);
}
function closeLangMenu() { toggleLangMenu(false); }

function setLang(lang) {
    currentLang = lang;
    root.lang = lang;
    root.dir = currentLang === 'he' ? 'rtl' : 'ltr';
    const labels = { 'he': 'עברית', 'en': 'English', 'es': 'Español' };
    document.getElementById('lang-label').innerText = labels[lang];
    document.querySelectorAll('[data-lang]').forEach(b => b.classList.toggle('is-current', b.dataset.lang === lang));
    document.querySelectorAll('[data-he]').forEach(el => {
        const text = el.getAttribute('data-' + currentLang);
        if (!text) return;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { el.placeholder = text; el.setAttribute('aria-label', text); }
        else el.innerHTML = text;
    });
    if (document.getElementById('budget-modal').classList.contains('active')) {
        const scroller = document.querySelector('#budget-modal .sheet-body');
        const keep = scroller.scrollTop;
        renderBudgetServices();
        scroller.scrollTop = keep;
    }
    translateAriaLabels();
    translateFormMessages();
    renderServiceDeck();
    renderShowcase();
    updateChipCounts();
    if (document.getElementById('gallery-page').classList.contains('active')) renderGallery();
    if (lightboxEl.classList.contains('active')) showLightboxImage(lightboxIndex, true);
    try { localStorage.setItem('dov_lang', lang); } catch (e) {}
    closeLangMenu();
}

document.addEventListener('click', e => {
    if (!e.target.closest('#lang')) closeLangMenu();
});

// ── GALLERY ──
function catLabel(cat) {
    const chip = document.querySelector(`.chip[data-cat="${cat}"]`);
    return (chip && chip.getAttribute('data-' + currentLang)) || cat;
}

function updateChipCounts() {
    document.querySelectorAll('.chip').forEach(chip => {
        const cat = chip.dataset.cat;
        const count = siteWorks.filter(w => cat === 'all' || w.cat === cat).length;
        let badge = chip.querySelector('.chip-count');
        if (!badge) { badge = document.createElement('span'); badge.className = 'chip-count'; chip.appendChild(badge); }
        badge.textContent = count;
    });
}

function filterWorks(cat) {
    if (cat === currentFilter) return;
    currentFilter = cat;
    document.querySelectorAll('.chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
        btn.setAttribute('aria-pressed', btn.dataset.cat === cat);
    });
    const grid = document.getElementById('gallery-grid');
    if (reducedMotion.matches) return renderGallery();
    grid.classList.add('is-switching');
    setTimeout(() => { renderGallery(); grid.classList.remove('is-switching'); }, 180);
}

// Images get their src only when they come near the screen. Native loading="lazy" did not
// defer images created in JS before insertion, and horizontal rails need their own margin.
const lazyImages = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const img = e.target;
            lazyImages.unobserve(img);
            img.src = img.dataset.src;
        });
    }, { rootMargin: '300px 200px' })
    : null;

// Builds the image part of a work card: a shimmer while loading and a clearly marked
// placeholder (to be replaced in the admin panel) if the image link is broken.
function workMedia(work, eager) {
    const media = document.createElement('span');
    media.className = 'tile-media is-loading';
    const img = document.createElement('img');
    img.alt = catLabel(work.cat);
    img.decoding = 'async';
    img.draggable = false;
    img.onload = () => { img.classList.add('is-loaded'); media.classList.remove('is-loading'); media.classList.add('is-loaded'); };
    img.onerror = () => {
        media.classList.remove('is-loading');
        media.classList.add('is-missing');
        media.innerHTML = placeholderMarkup();
    };
    const src = safeUrl(work.url);
    if (!src) { setTimeout(img.onerror, 0); }
    else if (eager || !lazyImages) img.src = src;
    else { img.dataset.src = src; lazyImages.observe(img); }
    media.appendChild(img);
    return media;
}

function workMeta(index, total, cat) {
    const meta = document.createElement('span');
    meta.className = 'tile-meta';
    meta.innerHTML = `<span class="tile-index">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span><span class="tile-cat"></span>`;
    meta.querySelector('.tile-cat').textContent = catLabel(cat);
    return meta;
}

function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const filtered = siteWorks.filter(w => currentFilter === 'all' || w.cat === currentFilter);
    filtered.forEach((w, i) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'tile';
        item.style.setProperty('--d', `${Math.min(i * 0.06, 0.5)}s`);
        item.setAttribute('aria-label', `${catLabel(w.cat)} ${i + 1}`);
        item.onclick = () => openLightbox(filtered, i);
        item.append(workMedia(w, i < 4), workMeta(i, filtered.length, w.cat));
        grid.appendChild(item);
    });
}

function renderShowcase() {
    const rail = document.getElementById('showcase');
    rail.innerHTML = '';
    siteWorks.forEach((w, i) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'show-card';
        card.setAttribute('aria-label', `${catLabel(w.cat)} ${i + 1}`);
        card.onclick = () => openLightbox(siteWorks, i);
        card.append(workMedia(w, false), workMeta(i, siteWorks.length, w.cat));
        rail.appendChild(card);
    });
}
// ── PROJECT VIEWER ──
const lightboxEl = document.getElementById('lightbox');
const viewerTrack = document.getElementById('viewer-track');
const viewerStage = document.getElementById('viewer-stage');
let lightboxList = [];
let lightboxIndex = 0;

function openLightbox(works, index) {
    lightboxList = works.slice();
    viewerTrack.innerHTML = '';
    const thumbs = document.getElementById('viewer-thumbs');
    thumbs.innerHTML = '';
    lightboxList.forEach((w, i) => {
        const slide = document.createElement('div');
        slide.className = 'viewer-slide';
        viewerTrack.appendChild(slide);
        const thumb = document.createElement('button');
        thumb.type = 'button';
        thumb.className = 'viewer-thumb';
        thumb.setAttribute('aria-label', `${catLabel(w.cat)} ${i + 1}`);
        const thumbImg = document.createElement('img');
        thumbImg.alt = '';
        thumbImg.loading = 'lazy';
        thumbImg.decoding = 'async';
        thumbImg.src = safeUrl(w.url);
        thumb.appendChild(thumbImg);
        thumb.onclick = () => showLightboxImage(i);
        thumbs.appendChild(thumb);
    });
    thumbs.classList.toggle('hidden', lightboxList.length < 2);
    const wasOpen = lightboxEl.classList.contains('active');
    lightboxEl.classList.add('active');
    if (!(history.state && history.state.viewer)) history.pushState({ viewer: true }, '', location.href);
    showLightboxImage(index || 0, true);
    syncScrollLock();
    if (!wasOpen) focusInto(lightboxEl);
}

function loadSlide(i) {
    const slide = viewerTrack.children[i];
    if (!slide || slide.dataset.loaded) return;
    slide.dataset.loaded = '1';
    const work = lightboxList[i];
    const img = document.createElement('img');
    img.alt = `${catLabel(work.cat)} ${i + 1}`;
    img.decoding = 'async';
    img.draggable = false;
    img.onload = () => img.classList.add('is-loaded');
    img.onerror = () => { slide.innerHTML = placeholderMarkup(); };
    const src = safeUrl(work.url);
    if (src) img.src = src; else setTimeout(img.onerror, 0);
    slide.appendChild(img);
}

function trackOffset(dx) {
    const w = viewerStage.clientWidth;
    return (root.dir === 'rtl' ? lightboxIndex * w : -lightboxIndex * w) + (dx || 0);
}

function showLightboxImage(index, instant) {
    const n = lightboxList.length;
    if (!n) return;
    lightboxIndex = Math.max(0, Math.min(n - 1, index));
    [lightboxIndex, lightboxIndex + 1, lightboxIndex - 1].forEach(loadSlide);
    viewerTrack.classList.toggle('is-dragging', !!instant);
    viewerTrack.style.transform = `translate3d(${trackOffset()}px, 0, 0)`;
    if (instant) requestAnimationFrame(() => viewerTrack.classList.remove('is-dragging'));
    [...viewerTrack.children].forEach((s, i) => s.classList.toggle('is-current', i === lightboxIndex));
    document.getElementById('lb-count').textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    document.getElementById('lb-cat').textContent = catLabel(lightboxList[lightboxIndex].cat);
    document.querySelector('.viewer-prev').disabled = lightboxIndex === 0;
    document.querySelector('.viewer-next').disabled = lightboxIndex === n - 1;
    const thumbs = document.querySelectorAll('.viewer-thumb');
    thumbs.forEach((t, i) => t.classList.toggle('is-current', i === lightboxIndex));
    const current = thumbs[lightboxIndex];
    if (current) {
        // Scroll only the strip; scrollIntoView would also move the locked page behind the viewer.
        const strip = current.parentElement;
        const a = current.getBoundingClientRect(), b = strip.getBoundingClientRect();
        strip.scrollBy({ left: (a.left + a.width / 2) - (b.left + b.width / 2), behavior: instant ? 'auto' : 'smooth' });
    }
}

function stepLightbox(dir) { showLightboxImage(lightboxIndex + dir); }

function hideViewer() {
    if (!lightboxEl.classList.contains('active')) return;
    lightboxEl.classList.remove('active', 'is-dragging-y');
    setTimeout(() => { if (!document.querySelector('.overlay.active')) returnFocus(lightboxEl); }, 0);
    lightboxEl.style.removeProperty('--drag-y');
    lightboxEl.style.removeProperty('--drag-amount');
    lightboxEl.style.removeProperty('background-color');
    syncScrollLock();
    setTimeout(() => { if (!lightboxEl.classList.contains('active')) viewerTrack.innerHTML = ''; }, 400);
}

function closeLightbox() {
    if (!lightboxEl.classList.contains('active')) return;
    if (history.state && history.state.viewer) history.back();
    else hideViewer();
}

window.addEventListener('resize', () => { if (lightboxEl.classList.contains('active')) showLightboxImage(lightboxIndex, true); });

// Swipe sideways to move between projects, swipe down to close.
(function initViewerGestures() {
    let start = null;
    viewerStage.addEventListener('pointerdown', e => {
        if (e.target.closest('button') || (e.pointerType === 'mouse' && e.button !== 0)) return;
        start = { x: e.clientX, y: e.clientY, t: performance.now(), axis: null };
        try { viewerStage.setPointerCapture(e.pointerId); } catch (err) { /* pointer already released */ }
    });
    viewerStage.addEventListener('pointermove', e => {
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (!start.axis && Math.hypot(dx, dy) > 8) start.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (start.axis === 'x') {
            const atEdge = (dx > 0 && (root.dir === 'rtl' ? lightboxIndex === lightboxList.length - 1 : lightboxIndex === 0))
                || (dx < 0 && (root.dir === 'rtl' ? lightboxIndex === 0 : lightboxIndex === lightboxList.length - 1));
            viewerTrack.classList.add('is-dragging');
            viewerStage.classList.add('is-dragging');
            viewerTrack.style.transform = `translate3d(${trackOffset(atEdge ? dx * 0.3 : dx)}px, 0, 0)`;
        } else if (start.axis === 'y' && dy > 0) {
            lightboxEl.classList.add('is-dragging-y');
            lightboxEl.style.setProperty('--drag-y', dy + 'px');
            lightboxEl.style.setProperty('--drag-amount', (dy / 900).toFixed(3));
            lightboxEl.style.backgroundColor = `rgba(3,3,5,${Math.max(0.35, 0.97 - dy / 500)})`;
        }
    });
    function end(e) {
        if (!start) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        const fast = performance.now() - start.t < 260;
        viewerTrack.classList.remove('is-dragging');
        viewerStage.classList.remove('is-dragging');
        if (start.axis === 'x' && (Math.abs(dx) > viewerStage.clientWidth * 0.18 || (fast && Math.abs(dx) > 30))) {
            stepLightbox((dx < 0 ? 1 : -1) * (root.dir === 'rtl' ? -1 : 1));
        } else if (start.axis === 'y' && (dy > 110 || (fast && dy > 50))) {
            closeLightbox();
        } else {
            showLightboxImage(lightboxIndex);
        }
        lightboxEl.classList.remove('is-dragging-y');
        lightboxEl.style.removeProperty('--drag-y');
        lightboxEl.style.removeProperty('--drag-amount');
        lightboxEl.style.removeProperty('background-color');
        start = null;
    }
    viewerStage.addEventListener('pointerup', end);
    viewerStage.addEventListener('pointercancel', end);
})();
// ── SCROLL REVEAL ──
// Masked titles start fully clipped, which IntersectionObserver reports as never visible,
// so they are revealed through their parent instead.
const revealProxies = new Map();
const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            (revealProxies.get(e.target) || [e.target]).forEach(el => el.classList.add('vis'));
            revealProxies.delete(e.target);
            revealObserver.unobserve(e.target);
        });
    }, { threshold: 0.12 })
    : null;

function initReveal() {
    document.querySelectorAll('.reveal:not(.vis)').forEach(el => {
        if (!revealObserver) return el.classList.add('vis');
        if (el.classList.contains('mask')) {
            const parent = el.parentElement;
            if (!revealProxies.has(parent)) revealProxies.set(parent, []);
            if (!revealProxies.get(parent).includes(el)) revealProxies.get(parent).push(el);
            revealObserver.observe(parent);
        } else {
            revealObserver.observe(el);
        }
    });
}

// ── HEADER + DOCK ──
let scrollTicking = false;
function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
        const y = window.scrollY;
        document.getElementById('site-header').classList.toggle('is-scrolled', y > 12);
        const onGallery = document.getElementById('gallery-page').classList.contains('active');
        document.getElementById('dock').classList.toggle('is-visible', onGallery || y > window.innerHeight * 0.5);
        scrollTicking = false;
    });
}
window.addEventListener('scroll', onScroll, { passive: true });

// ── ON-SCREEN KEYBOARD ──
function syncViewportHeight() {
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    root.style.setProperty('--vvh', h + 'px');
}
if (window.visualViewport) window.visualViewport.addEventListener('resize', syncViewportHeight);
window.addEventListener('resize', syncViewportHeight);

document.addEventListener('focusin', e => {
    const field = e.target.closest('.sheet .input');
    if (field) setTimeout(() => field.scrollIntoView({ block: 'center', behavior: 'smooth' }), 300);
});

// ── KEYBOARD ──
document.addEventListener('keydown', e => {
    const lightboxOpen = lightboxEl.classList.contains('active');
    if (e.key === 'Escape') {
        if (lightboxOpen) closeLightbox();
        else {
            closeBudgetModal();
            closeAdminModal();
            toggleMobileMenu(false);
        }
        closeLangMenu();
    }
    const forward = root.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const backward = root.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (lightboxOpen && e.key === forward) stepLightbox(1);
    if (lightboxOpen && e.key === backward) stepLightbox(-1);
});

// ── HERO ──
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function initHero() {
    const hero = document.getElementById('hero');
    const visual = document.getElementById('hero-visual');
    const orbit = document.getElementById('orbit');
    const title = hero.querySelector('.grad-text');
    const conn = navigator.connection || {};
    if ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || conn.saveData) hero.classList.add('is-lite');

    let inView = true;
    let frame = 0;
    const tilt = { x: 0, y: 0, tx: 0, ty: 0, b: 0 };

    function setIdle() {
        const homeActive = document.getElementById('home-page').classList.contains('active');
        hero.classList.toggle('is-idle', !inView || document.hidden || !homeActive);
    }

    function render() {
        frame = 0;
        tilt.x += (tilt.tx - tilt.x) * 0.12;
        tilt.y += (tilt.ty - tilt.y) * 0.12;
        tilt.b *= 0.9;
        orbit.style.setProperty('--rx', tilt.x.toFixed(2) + 'deg');
        orbit.style.setProperty('--ry', tilt.y.toFixed(2) + 'deg');
        orbit.style.setProperty('--b', tilt.b.toFixed(3));
        const moving = Math.abs(tilt.tx - tilt.x) > 0.05 || Math.abs(tilt.ty - tilt.y) > 0.05 || tilt.b > 0.005;
        if (moving) frame = requestAnimationFrame(render);
    }
    function kick() { if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(render); }

    function aim(e) {
        const r = visual.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        tilt.ty = Math.max(-1, Math.min(1, dx)) * 22;
        tilt.tx = Math.max(-1, Math.min(1, dy)) * -16;
        kick();
    }
    function release() { tilt.tx = 0; tilt.ty = 0; kick(); }

    hero.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons) aim(e); });
    hero.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') aim(e); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => hero.addEventListener(t, e => { if (e.pointerType !== 'mouse' || t === 'pointerleave') release(); }));

    visual.addEventListener('click', () => {
        tilt.b = 1;
        title.classList.toggle('is-replay');
        kick();
    });

    let scrollFrame = 0;
    function onHeroScroll() {
        if (scrollFrame || !inView || reducedMotion.matches) return;
        scrollFrame = requestAnimationFrame(() => {
            scrollFrame = 0;
            const p = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
            hero.style.setProperty('--p', p.toFixed(3));
        });
    }
    window.addEventListener('scroll', onHeroScroll, { passive: true });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            inView = entries[0].isIntersecting;
            setIdle();
            if (!inView) hero.style.setProperty('--p', '1');
            else onHeroScroll();
        }).observe(hero);
    }
    document.addEventListener('visibilitychange', setIdle);
    window.addEventListener('popstate', setIdle);
    hero.syncIdle = setIdle;
}

function countUp(el) {
    const finalText = el.textContent;
    const match = finalText.match(/^(\d+)(.*)$/);
    if (!match || reducedMotion.matches) return;
    const end = +match[1];
    const suffix = match[2];
    const start = performance.now();
    const duration = 1400;
    function step(now) {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = finalText;
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
}

// ── INIT ──
(function init() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    let savedLang = null;
    try { savedLang = localStorage.getItem('dov_lang'); } catch (e) {}
    setLang(['he', 'en', 'es'].includes(savedLang) ? savedLang : 'he');
    syncViewportHeight();
    renderSiteAds();
    document.querySelectorAll('[data-copy-logo]').forEach(img => { img.src = document.querySelector('.brand-logo').src; });
    initContactForm();
    watchContactForRecaptcha();
    initHero();
    showPage(location.hash === '#works' ? 'gallery' : 'home', true);
    setTimeout(() => document.querySelectorAll('.stat-num bdi').forEach(countUp), 300);
})();