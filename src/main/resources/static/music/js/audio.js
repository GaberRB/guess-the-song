import { state } from './state.js';

export function loadAudio(url, autoplay = false) {
    const audio = document.getElementById('audio-player');
    const btn   = document.getElementById('btn-toggle-audio');
    const bars  = document.getElementById('audio-bars');

    audio.pause();
    audio.src = url;

    state.audioPlaying = false;
    btn.textContent = '▶';
    btn.classList.remove('pulse-play');
    bars.classList.remove('playing');

    audio.onended = () => {
        state.audioPlaying = false;
        btn.textContent = '▶';
        bars.classList.remove('playing');
    };

    // Remove handler anterior antes de registrar novo (evita acúmulo)
    btn.onclick = null;
    if (navigator.maxTouchPoints > 0) {
        // iOS: usa touchend + preventDefault para não gerar click sintético 300ms depois
        // que poderia cair em um botão de resposta abaixo
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleAudio();
        };
        btn._touchHandler && btn.removeEventListener('touchend', btn._touchHandler);
        btn._touchHandler = handler;
        btn.addEventListener('touchend', handler, { passive: false });
    } else {
        btn.onclick = toggleAudio;
    }

    if (autoplay) {
        // Usa oncanplay (propriedade) em vez de addEventListener para evitar acúmulo de listeners entre questões
        audio.oncanplay = () => {
            audio.oncanplay = null;
            audio.play()
                .then(() => {
                    state.audioPlaying = true;
                    btn.textContent = '⏸';
                    btn.classList.remove('pulse-play');
                    bars.classList.add('playing');
                })
                .catch(() => {
                    // Navegador bloqueou o autoplay — pulsa o botão para avisar o usuário
                    btn.classList.add('pulse-play');
                });
        };
        audio.load();
    } else {
        audio.oncanplay = null;
        audio.load();
    }
}

export function toggleAudio() {
    const audio = document.getElementById('audio-player');
    const btn   = document.getElementById('btn-toggle-audio');
    const bars  = document.getElementById('audio-bars');

    if (state.audioPlaying) {
        audio.pause();
        state.audioPlaying = false;
        btn.textContent = '▶';
        bars.classList.remove('playing');
    } else {
        audio.play()
            .then(() => {
                state.audioPlaying = true;
                btn.textContent = '⏸';
                bars.classList.add('playing');
            })
            .catch(() => {
                // Navegador pode bloquear auto-play
            });
    }
}

export function pauseAudio() {
    const audio = document.getElementById('audio-player');
    if (!audio.paused) {
        audio.pause();
        state.audioPlaying = false;
        document.getElementById('btn-toggle-audio').textContent = '▶';
        document.getElementById('audio-bars').classList.remove('playing');
    }
}

export function stopAudio() {
    const audio = document.getElementById('audio-player');
    audio.pause();
    audio.src = '';
    state.audioPlaying = false;
}
