/**
 * MA TRẬN ĐỒ HỌA & ÂM THANH NÂNG CAO v6.0 - CENTRAL CORE SYSTEM
 */

// 1. Khởi tạo hiệu ứng hạt Matrix ảo diệu phía nền Canvas
function initCyberBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'cyber-matrix-bg';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.04';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const columns = Math.floor(width / 20);
    const drops = Array(columns).fill(1);
    const chars = "010101ABCDEFGHIJKLMNOPQRSTUVWXYZ全国務デジタル";

    function draw() {
        ctx.fillStyle = 'rgba(2, 5, 14, 0.1)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#00ffcc';
        ctx.font = '14px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 20, drops[i] * 20);
            if (drops[i] * 20 > height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 33);
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
}

// 2. Kênh phát tín hiệu âm thanh cảnh báo dạng đa âm tần chuyên nghiệp
const AudioCentral = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    play(freq, type, duration, vol) {
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gainNode.gain.setValueAtTime(vol, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { console.log("Audio Error context:", e); }
    },
    click() { this.play(700, 'sine', 0.05, 0.06); },
    success() {
        this.play(523.25, 'sine', 0.08, 0.1);
        setTimeout(() => this.play(659.25, 'sine', 0.1, 0.1), 50);
        setTimeout(() => this.play(783.99, 'sine', 0.12, 0.1), 100);
    },
    alert() {
        this.play(880, 'sawtooth', 0.2, 0.05);
        setTimeout(() => this.play(880, 'sawtooth', 0.2, 0.05), 150);
    },
    stamp() {
        this.play(130, 'triangle', 0.25, 0.4);
        this.play(260, 'sawtooth', 0.08, 0.15);
    },
    lock() {
        this.play(330, 'square', 0.15, 0.1);
        setTimeout(() => this.play(220, 'square', 0.2, 0.1), 120);
    }
};

// Kích hoạt khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    initCyberBackground();
    document.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('select') || e.target.closest('nav button')) {
            AudioCentral.click();
        }
    });
});