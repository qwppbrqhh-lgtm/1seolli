// Sound Manager for Synthesized SFX
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.1; // Default volume
        this.isMuted = true; // Start muted by default
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (!this.isMuted && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.isMuted;
    }

    playTone(freq, type, duration) {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playBootSound() {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        [220, 330, 440, 550, 660, 880].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            osc.type = 'square';
            gain.gain.setValueAtTime(0.05, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.2);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
        });
    }

    playHoverSound() {
        this.playTone(800, 'sine', 0.05);
    }

    playClickSound() {
        this.playTone(1200, 'triangle', 0.1);
    }
}

const sfx = new SoundManager();

document.addEventListener('DOMContentLoaded', () => {
    // Sound Toggle
    const soundBtn = document.getElementById('sound-toggle');
    if (soundBtn) {
        const icon = soundBtn.querySelector('span');
        soundBtn.addEventListener('click', () => {
            const muted = sfx.toggleMute();
            if (icon) icon.textContent = muted ? 'volume_off' : 'volume_up';
            if (!muted) sfx.playClickSound();
        });
    }

    // Run Boot Sequence
    runBootSequence();

    // 3D Tilt Effect
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.pageX) / 25;
        const y = (window.innerHeight / 2 - e.pageY) / 25;

        const heroAvatar = document.querySelector('.hero-avatar');
        if (heroAvatar) {
            heroAvatar.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
        }

        document.querySelectorAll('.video-card').forEach(card => {
            card.style.transform = `rotateY(${x / 2}deg) rotateX(${y / 2}deg)`;
        });
    });

    // Interactive Hover Sounds
    document.querySelectorAll('a, button, .video-card').forEach(el => {
        el.addEventListener('mouseenter', () => sfx.playHoverSound());
        el.addEventListener('click', () => sfx.playClickSound());
    });

    // Scroll Animations with Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const animateElements = document.querySelectorAll('.video-card, .stat-card, footer');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    initParticles();
    console.log("LP Animations Initialized");
});

function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.classList.add('particle-bg');
    document.body.prepend(canvas);

    // Style canvas to be fixed background
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-999';
    canvas.style.pointerEvents = 'none';

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;
            this.color = Math.random() > 0.5 ? '#00f3ff' : '#bc13fe';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = Math.random() * 0.5 + 0.3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
}

function runBootSequence() {
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.getElementById('boot-text');
    const bootBar = document.querySelector('.boot-bar');
    const mainContent = document.getElementById('main-content');

    const lines = [
        "INITIALIZING CORE SYSTEMS...",
        "LOADING KERNEL 2.0.77...",
        "CHECKING NEURAL LINK...",
        "CONNECTING TO NETWORK... [SECURE]",
        "DOWNLOADING ASSETS...",
        "SYSTEM OPTIMIZED.",
        "WELCOME, USER."
    ];

    let lineIndex = 0;

    function typeLine() {
        if (lineIndex >= lines.length) {
            finishBoot();
            return;
        }

        const p = document.createElement('div');
        p.textContent = "> " + lines[lineIndex];
        bootText.appendChild(p);
        bootText.scrollTop = bootText.scrollHeight;

        // Progress bar update
        const progress = ((lineIndex + 1) / lines.length) * 100;
        bootBar.style.width = `${progress}%`;

        // Random typing sound
        if (Math.random() > 0.5) sfx.playHoverSound();

        lineIndex++;
        setTimeout(typeLine, 300 + Math.random() * 400);
    }

    setTimeout(typeLine, 500);

    function finishBoot() {
        setTimeout(() => {
            sfx.playBootSound();
            bootScreen.style.opacity = '0';
            bootScreen.style.pointerEvents = 'none';

            mainContent.classList.remove('hidden');

            // Allow scroll again
            document.body.style.overflow = 'auto'; // (Actually CSS handles hidden on main, body scrolls)
            // But we had #main-content.hidden { height: 0; overflow: hidden } 
            // So removing .hidden fixes it.

            setTimeout(() => {
                bootScreen.style.display = 'none';
            }, 1000);
        }, 800);
    }
}
