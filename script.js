const birthDate = new Date(2007, 2, 10); 
const singleSinceDate = new Date(2025, 3, 10); 
const words = ["System Optimizer", "Low-Level Engineer", "Performance Enthusiast", "Future Senior Dev"]; 

let player;
let isPlaying = false;
let isPlayerReady = false;
let progressInterval;
let checkDurationInterval;

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function onYouTubeIframeAPIReady() {
    console.log("YouTube API đang khởi tạo...");
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'rel': 0,
            'modestbranding': 1,
            'enablejsapi': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    console.log("Trình phát nhạc đã sẵn sàng.");
    isPlayerReady = true;
    player.setVolume(50);
    
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) volumeSlider.value = 50;

    const firstSong = document.querySelector('#musicList li:first-child');
    if (firstSong) {
        const firstId = firstSong.getAttribute('data-id');
        player.cueVideoById(firstId);
        firstSong.classList.add('playing');
        document.getElementById('currentSong').innerText = firstSong.innerText;
    }
}

function onPlayerError(e) {
    console.error("Lỗi trình phát YouTube:", e.data);
    alert("Không thể tải video từ YouTube. Vui lòng kiểm tra kết nối mạng.");
}

function onPlayerStateChange(event) {
    const playIcon = document.getElementById('playIcon');
    const vinylDisk = document.getElementById('vinylDisk');
    const vinylGlow = document.querySelector('.vinyl-glow');

    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        if (playIcon) playIcon.className = 'fa-solid fa-pause';
        if (vinylDisk) vinylDisk.classList.add('spinning');
        if (vinylGlow) vinylGlow.style.opacity = '1';
        
        startProgressTracking();
    } 
    else {
        isPlaying = false;
        if (playIcon) playIcon.className = 'fa-solid fa-play';
        if (vinylDisk) vinylDisk.classList.remove('spinning');
        if (vinylGlow) vinylGlow.style.opacity = '0.7';
        stopProgressTracking();
    }

    if (event.data === YT.PlayerState.ENDED) {
        console.log("Bài hát đã kết thúc.");
    }
}

function playSong(element) {
    if (!isPlayerReady || !player) {
        alert("Hệ thống nhạc đang khởi động, vui lòng đợi vài giây!");
        return;
    }

    const videoId = element.getAttribute('data-id');
    const songName = element.innerText;

    if (!videoId) return;

    console.log("Đang phát bài:", songName);

    document.querySelectorAll('#musicList li').forEach(li => li.classList.remove('playing'));
    element.classList.add('playing');

    const currentSongNameEl = document.getElementById('currentSong');
    if (currentSongNameEl) currentSongNameEl.innerText = songName;
    
    const statusTextEl = document.getElementById('currentPlaying');
    if (statusTextEl) statusTextEl.innerText = `(Đang phát: ${songName})`;

    player.loadVideoById(videoId);
    player.playVideo();

    updateDurationInfo();
}

function updateDurationInfo() {
    clearInterval(checkDurationInterval);
    checkDurationInterval = setInterval(() => {
        const duration = player.getDuration();
        if (duration > 0) {
            const durationDisplay = document.getElementById('durationTime');
            const progressBar = document.getElementById('progressBar');
            if (durationDisplay) durationDisplay.innerText = formatSeconds(duration);
            if (progressBar) progressBar.max = Math.floor(duration);
            clearInterval(checkDurationInterval);
        }
    }, 500);
}

function togglePlay() {
    if (!player || !isPlayerReady) return;
    if (isPlaying) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

function startProgressTracking() {
    clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (player && isPlaying) {
            const currentTime = player.getCurrentTime();
            const progressBar = document.getElementById('progressBar');
            const timeDisplay = document.getElementById('currentTime');
            
            if (progressBar) progressBar.value = Math.floor(currentTime);
            if (timeDisplay) timeDisplay.innerText = formatSeconds(currentTime);
        }
    }, 1000);
}

function stopProgressTracking() {
    clearInterval(progressInterval);
}

function seekTo(value) {
    if (player) player.seekTo(value, true);
}

function changeVolume(value) {
    if (player) player.setVolume(value);
}

function formatSeconds(s) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

function updateLoveTimer() {
    const daysContainer = document.getElementById('loveDays');
    if (!daysContainer) return;

    const now = new Date();
    const diff = now - singleSinceDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    daysContainer.innerText = days.toLocaleString('en-US');

    const units = document.querySelectorAll('.time-unit span');
    if (units.length >= 3) {
        units[0].innerText = hours.toString().padStart(2, '0');
        units[1].innerText = mins.toString().padStart(2, '0');
        units[2].innerText = secs.toString().padStart(2, '0');
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
    document.querySelectorAll('.page-section').forEach(p => {
        p.classList.remove('active-page');
        p.style.display = 'none';
    });
    
    const target = document.getElementById('page-' + pageId);
    if (target) {
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active-page'), 20);
    }

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


window.onload = function() {

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.className = 'fa-solid fa-sun';
    }

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            document.body.style.opacity = '0';
            setTimeout(() => {
                window.location.reload();
            }, 300);
        });
    }
    // ------------------------------

    setInterval(() => {
        updateClock();
        updateLoveTimer();
    }, 1000);

    displayDOBInfo();
    typeEffect();
};

window.onscroll = () => {
    document.querySelectorAll('.reveal').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 150) {
            el.classList.add('active');
        }
    });

    const scrollBtn = document.querySelector('.scroll-up-btn');
    if (scrollBtn) {
        window.scrollY > 300 ? scrollBtn.classList.add('show') : scrollBtn.classList.remove('show');
    }
};


function toggleTheme() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        document.getElementById('themeIcon').className = 'fa-solid fa-moon';
    } else {
        document.body.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        document.getElementById('themeIcon').className = 'fa-solid fa-sun';
    }
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
function toggleZaloQR() { document.getElementById('zaloModal').classList.toggle('active'); }
function togglePlayerControls() { document.getElementById('playerControls').classList.toggle('active'); }

const avatarWrapper = document.querySelector('.avatar-wrapper');

if (avatarWrapper) {
    avatarWrapper.addEventListener('click', function() {
        this.classList.toggle('zoomed');
    });
}

document.addEventListener('click', function(event) {
    if (!avatarWrapper.contains(event.target)) {
        avatarWrapper.classList.remove('zoomed');
    }
});