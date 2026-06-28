/**
 * ENGINE HIỆU ỨNG ĐỒ HỌA ĐA SẮC & ĐA CHÂN THỰC V7.0
 */

function startMatrixCyberRain() {
    const canvas = document.createElement('canvas');
    canvas.id = 'cyber-matrix-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.07';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const columns = Math.floor(w / 24);
    const yPositions = Array(columns).fill(1);
    const symbols = "010101METADATASECURITYGOVERNMENTROBLOXV7";

    function draw() {
        ctx.fillStyle = 'rgba(2, 5, 14, 0.18)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#06b6d4';
        ctx.font = '12px Courier New';

        for (let i = 0; i < yPositions.length; i++) {
            const character = symbols[Math.floor(Math.random() * symbols.length)];
            ctx.fillText(character, i * 24, yPositions[i] * 24);
            if (yPositions[i] * 24 > h && Math.random() > 0.98) {
                yPositions[i] = 0;
            }
            yPositions[i]++;
        }
    }
    setInterval(draw, 35);
    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });
}

const MatrixAudio = {
    ctx: null,
    initCtx() {
        if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    },
    beep(freq, type, duration, vol) {
        this.initCtx();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch(e) {}
    },
    click() { this.beep(800, 'sine', 0.05, 0.04); },
    success() {
        this.beep(523.25, 'sine', 0.08, 0.1);
        setTimeout(() => this.beep(659.25, 'sine', 0.08, 0.1), 50);
        setTimeout(() => this.beep(783.99, 'sine', 0.12, 0.1), 100);
    },
    alert() {
        this.beep(950, 'sawtooth', 0.15, 0.05);
        setTimeout(() => this.beep(950, 'sawtooth', 0.15, 0.05), 150);
    },
    stamp() {
        this.beep(100, 'triangle', 0.25, 0.5);
        this.beep(300, 'sawtooth', 0.06, 0.15);
    },
    lock() {
        this.beep(400, 'square', 0.12, 0.1);
        setTimeout(() => this.beep(250, 'square', 0.2, 0.1), 120);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    startMatrixCyberRain();
    document.addEventListener('click', (e) => {
        if(e.target.closest('button') || e.target.closest('select') || e.target.closest('nav button')) {
            MatrixAudio.click();
        }
    });
});
