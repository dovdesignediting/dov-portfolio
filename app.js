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
        if (!value || typeof value !== 'string') return '';
        const trimmed = value.trim();
        const url = new URL(trimmed, location.href);
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
    span.textContent = l