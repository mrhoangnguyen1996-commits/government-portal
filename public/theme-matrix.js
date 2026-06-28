/**
 * TRỤC QUẢN LÝ HIỆU ỨNG ÂM THANH & GRAPHIC CYBER v6.5
 */

function initCyberMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.id = 'cyber-matrix-rain';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.06';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const cols = Math.floor(w / 22);
    const yPositions = Array(cols).fill(1);
    const cyberTokens = "01GOVERNMENTROLEPLAYMATRIXQUOCVUSO0196";

    function renderRain() {
        ctx.fillStyle = 'rgba(2, 5, 14, 0.15)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#06b6d4'; // Màu Cyan phát quang đặc trưng v6.5
        ctx.font = '13px font-mono-tech, monospace';

        for (let i = 0; i < yPositions.length; i++) {
            const txt = cyberTokens[Math.floor(Math.random() * cyberTokens.length)];
            ctx.fillText(txt, i * 22, yPositions[i] * 22);
            if (yPositions[i] * 22 > h && Math.random() > 0.98) {
                yPositions[i] = 0;
            }
            yPositions[i]++;
        }
    }

    setInterval(renderRain, 30);
    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });
}

const AudioEngine = {
    ctx: null,
    lazyInit() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    trigger(freq, nodeType, duration, volume) {
        this.lazyInit();
        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            osc.type = nodeType;
            osc.frequency.value = freq;
            gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    },
    click() { this.trigger(750, 'sine', 0.04, 0.05); },
    success() {
        this.trigger(523.25, 'sine', 0.08, 0.1);
        setTimeout(() => this.trigger(659.25, 'sine', 0.09, 0.1), 45);
        setTimeout(() => this.trigger(783.99, 'sine', 0.12, 0.1), 90);
    },
    alert() {
        this.trigger(920, 'sawtooth', 0.15, 0.04);
        setTimeout(() => this.trigger(920, 'sawtooth', 0.15, 0.04), 140);
    },
    stamp() {
        this.trigger(120, 'triangle', 0.22, 0.4);
        this.trigger(240, 'sawtooth', 0.07, 0.12);
    },
    lock() {
        this.trigger(380, 'square', 0.12, 0.08);
        setTimeout(() => this.trigger(200, 'square', 0.18, 0.08), 100);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initCyberMatrixRain();
    document.addEventListener('click', (e) => {
        if(e.target.closest('button') || e.target.closest('select') || e.target.closest('nav button')) {
            AudioEngine.click();
        }
    });
});
