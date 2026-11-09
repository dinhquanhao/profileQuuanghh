const sections = [...document.querySelectorAll('.page-section')];
const navigation = [...document.querySelectorAll('.nav-btn')];
const themeToggle = document.querySelector('.theme-toggle');
const avatar = document.querySelector('[data-avatar]');
const qrDialog = document.querySelector('#zaloModal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function showSection(hash, focusHeading = false) {
    const id = hash.replace(/^#/, '') || 'home';
    const target = document.getElementById(id);
    const section = target?.closest('.page-section') || sections[0];
    if (!section) return;
    sections.forEach(item => item.classList.toggle('active-page', item === section));
    navigation.forEach(link => {
        const active = link.hash === `#${section.id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
    if (focusHeading) {
        const heading = target === section || !target
            ? section.querySelector('h1, h2') : target;
        if (heading && !heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading?.focus({ preventScroll: true });
        (target || section).scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    }
}

// Keep real anchors usable without JavaScript; enhance only local section links.
document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target?.closest('.page-section')) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    showSection(link.hash, true);
});
window.addEventListener('hashchange', () => showSection(location.hash, true));

function applyTheme(theme) {
    if (theme === 'dark') document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
    themeToggle?.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Bật giao diện sáng' : 'Bật giao diện tối');
}
let savedTheme;
try { savedTheme = localStorage.getItem('theme'); } catch { /* Storage is optional. */ }
applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
themeToggle?.addEventListener('click', () => {
    const theme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try { localStorage.setItem('theme', theme); } catch { /* The toggle still works. */ }
});

function updateClock() {
    const clock = document.getElementById('clock');
    if (clock) clock.textContent = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
updateClock();
setInterval(updateClock, 1000);
const year = document.getElementById('currentYear');
if (year) year.textContent = String(new Date().getFullYear());

function closeAvatar() {
    avatar?.classList.remove('zoomed');
    avatar?.setAttribute('aria-pressed', 'false');
    avatar?.setAttribute('aria-label', 'Phóng to ảnh đại diện');
}
avatar?.addEventListener('click', () => {
    const zoomed = avatar.classList.toggle('zoomed');
    avatar.setAttribute('aria-pressed', String(zoomed));
    avatar.setAttribute('aria-label', zoomed ? 'Thu nhỏ ảnh đại diện' : 'Phóng to ảnh đại diện');
});
document.addEventListener('click', event => { if (avatar && !avatar.contains(event.target)) closeAvatar(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAvatar(); });
document.querySelector('[data-open-qr]')?.addEventListener('click', () => qrDialog?.showModal());
qrDialog?.addEventListener('click', event => { if (event.target === qrDialog) qrDialog.close(); });

const scrollButton = document.querySelector('.scroll-up-btn');
function updateScrollButton() { scrollButton?.classList.toggle('show', window.scrollY > 300); }
window.addEventListener('scroll', updateScrollButton, { passive: true });
scrollButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
showSection(location.hash);
document.documentElement.classList.add('js');
updateScrollButton();
