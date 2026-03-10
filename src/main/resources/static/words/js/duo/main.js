import { initBoards, restoreBoards } from './board.js';
import { initKeyboard, restoreKeys, disableKeyboard } from './keyboard.js';
import { handleKey, showResultModal, loadLocalState, saveLocalState, getEmojiGrid } from './game.js';
import { getDailyInfo, getDailyRanking } from './api.js';
import { state } from './state.js';
import { showToast, formatDateBR } from '../utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    initBoards();
    initKeyboard(handleKey);

    // Physical keyboard
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (document.querySelector('.modal:not(.hidden)')) return;
        if (e.key === 'Backspace') {
            handleKey('BACKSPACE');
        } else if (e.key === 'Enter') {
            handleKey('ENTER');
        } else if (/^[A-ZÇ]$/i.test(e.key) && e.key.length === 1) {
            handleKey(e.key.toUpperCase());
        }
    });

    // Header buttons
    document.getElementById('btn-ranking').addEventListener('click', openRanking);
    document.getElementById('btn-help').addEventListener('click', () => {
        document.getElementById('modal-help').classList.remove('hidden');
    });
    document.getElementById('btn-help-close').addEventListener('click', () => {
        document.getElementById('modal-help').classList.add('hidden');
    });
    document.getElementById('help-backdrop').addEventListener('click', () => {
        document.getElementById('modal-help').classList.add('hidden');
    });

    // Result modal
    document.getElementById('btn-share').addEventListener('click', shareResult);
    document.getElementById('btn-show-ranking').addEventListener('click', () => {
        document.getElementById('modal-result').classList.add('hidden');
        openRanking();
    });
    document.getElementById('btn-result-close').addEventListener('click', () => {
        document.getElementById('modal-result').classList.add('hidden');
    });
    document.getElementById('result-backdrop').addEventListener('click', () => {
        document.getElementById('modal-result').classList.add('hidden');
    });

    // Ranking modal
    document.getElementById('btn-ranking-close').addEventListener('click', () => {
        document.getElementById('modal-ranking').classList.add('hidden');
    });
    document.getElementById('ranking-backdrop').addEventListener('click', () => {
        document.getElementById('modal-ranking').classList.add('hidden');
    });

    // Name modal
    const nameInput = document.getElementById('player-name-input');
    const btnStart  = document.getElementById('btn-start');

    btnStart.disabled = true;
    nameInput.addEventListener('input', () => {
        btnStart.disabled = nameInput.value.trim().length < 2;
    });
    nameInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') startGame();
    });
    btnStart.addEventListener('click', startGame);

    // Load daily info
    try {
        const daily = await getDailyInfo();
        state.date = daily.date;
        document.getElementById('date-badge').textContent = formatDateBR(state.date);
    } catch {
        showToast('Erro ao carregar o jogo.');
        document.getElementById('date-badge').textContent = '';
    }

    // Restore saved state
    const savedName = localStorage.getItem('palavras-br-player');
    if (savedName && state.date) {
        const restored = loadLocalState();
        if (restored) {
            state.playerName = savedName;
            restoreBoards();
            restoreKeys();

            // Restore board labels
            if (state.solved1) document.getElementById('label-board-1').classList.add('solved');
            if (state.solved2) document.getElementById('label-board-2').classList.add('solved');

            document.getElementById('modal-name').classList.add('hidden');
            if (state.gameOver) {
                disableKeyboard();
                setTimeout(() => showResultModal(state.solved1 && state.solved2), 500);
            }
            return;
        }
    }

    document.getElementById('modal-name').classList.remove('hidden');
    setTimeout(() => nameInput.focus(), 100);
});

function startGame() {
    const name = document.getElementById('player-name-input').value.trim();
    if (name.length < 2) return;
    state.playerName = name;
    localStorage.setItem('palavras-br-player', name);
    document.getElementById('modal-name').classList.add('hidden');
}

async function openRanking() {
    const modal = document.getElementById('modal-ranking');
    const list  = document.getElementById('ranking-list');
    const label = document.getElementById('ranking-date-label');

    label.textContent = formatDateBR(state.date);
    list.innerHTML = '<div class="ranking-loading"><div class="loader-sm"></div></div>';
    modal.classList.remove('hidden');

    try {
        const scores = await getDailyRanking(state.date);
        if (!scores || scores.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:16px">Nenhum resultado ainda hoje.</p>';
            return;
        }
        const medals = ['🥇','🥈','🥉'];
        list.innerHTML = scores.map((s, i) => `
            <div class="ranking-item">
                <span class="ranking-pos">${medals[i] || (i + 1)}</span>
                <span class="ranking-name">${escapeHtml(s.playerName)}</span>
                <span class="ranking-attempts">${s.attempts < 7 ? s.attempts + '/6' : 'X'}</span>
            </div>
        `).join('');
    } catch {
        list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:16px">Erro ao carregar.</p>';
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

async function shareResult() {
    const text = getEmojiGrid() + '\n\n👉 words.quizminigames.com/words-duo.html';
    if (navigator.share) {
        try {
            await navigator.share({ title: 'Palavras BR DUO 🟩🟩', text });
            return;
        } catch (e) {
            if (e.name === 'AbortError') return;
        }
    }
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copiado! Cole no WhatsApp ou Instagram.');
    } catch {
        showToast('Nao foi possivel copiar.');
    }
}
