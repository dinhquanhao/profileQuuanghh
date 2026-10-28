const birthDate = new Date(2007, 2, 10); 
const words = ["System Optimizer", "Low-Level Engineer", "Performance Enthusiast", "Future Senior Dev"]; 

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function updateLifeTimer(){

    const now = new Date();
    const diff = now - birthDate;

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor(diff / (1000*60*60)) % 24;
    const minutes = Math.floor(diff / (1000*60)) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    document.getElementById("lifeDays").innerText = days;
    document.getElementById("lifeHours").innerText = hours;
    document.getElementById("lifeMinutes").innerText = minutes;
    document.getElementById("lifeSeconds").innerText = seconds;

}

function updateClock() {
    const clockEl = document.getElementById('clock');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString('vi-VN', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
}

function displayDOBInfo() {
    const dobEl = document.getElementById('dob-info');
    if (dobEl) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        if (today.getMonth() < birthDate.getMonth() || 
           (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
            age--;
        }
        dobEl.innerHTML = `Ngày sinh: <b>10/03/2007</b> | Tuổi: <b>${age}</b>`;
    }
}


function typeEffect() {
    const textEl = document.querySelector(".typing-text");
    if (!textEl) return;

    const currentWord = words[wordIndex];
    if (isDeleting) {
        textEl.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textEl.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 100 : 200;

    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
    }

    setTimeout(typeEffect, typeSpeed);
}

function switchPage(pageId, btn) {
    const target = document.getElementById('page-' + pageId);
    if (!target) return;
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.toggle('active-page', page === target);
    });
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.classList.toggle('active', button === btn);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    revealVisibleSections();
}

function revealVisibleSections() {
    document.querySelectorAll('.active-page .reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('active');
    });
}

function saveTheme(value) {
    try { localStorage.setItem('theme', value); } catch { /* Storage may be disabled. */ }
}

window.onload = function() {

    let savedTheme;
    try { savedTheme = localStorage.getItem('theme'); } catch { /* Use default theme. */ }
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.className = 'fa-solid fa-sun';
    }

    updateClock();
    updateLifeTimer();
    setInterval(updateClock, 1000);
    setInterval(updateLifeTimer, 1000);
    revealVisibleSections();

    displayDOBInfo();
    typeEffect();
};

window.onscroll = () => {
    revealVisibleSections();

    const scrollBtn = document.querySelector('.scroll-up-btn');
    if (scrollBtn) {
        window.scrollY > 300 ? scrollBtn.classList.add('show') : scrollBtn.classList.remove('show');
    }
};


function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        saveTheme('light');
        document.getElementById('themeIcon').className = 'fa-solid fa-moon';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        saveTheme('dark');
        document.getElementById('themeIcon').className = 'fa-solid fa-sun';
    }
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function toggleZaloQR() { document.getElementById('zaloModal').classList.toggle('active'); }

const avatarWrapper = document.querySelector('.avatar-wrapper');

if (avatarWrapper) {
    avatarWrapper.addEventListener('click', function() {
        this.classList.toggle('zoomed');
    });
}

document.addEventListener('click', function(event) {
    if (avatarWrapper && !avatarWrapper.contains(event.target)) {
        avatarWrapper.classList.remove('zoomed');
    }
});
