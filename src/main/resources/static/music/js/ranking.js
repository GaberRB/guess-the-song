import { CONFIG } from './config.js';
import { state } from './state.js';
import { showScreen, escapeHtml } from './utils.js';

export async function loadWelcomeRanking() {
    const list = document.getElementById('welcome-ranking-list');
    try {
        const res    = await fetch(`${CONFIG.API_BASE_URL}/api/score/v1/top`);
        const scores = await res.json();

        if (!scores || scores.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.82rem;padding:8px 0">Ainda não há pontuações. Seja o primeiro!</p>';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        list.innerHTML = scores.slice(0, 5).map((s, i) => `
            <div class="welcome-rank-item">
                <span class="welcome-rank-pos">${medals[i] ?? i + 1}</span>
                <span class="welcome-rank-name">${escapeHtml(s.playerName)}</span>
                <span class="welcome-rank-genre">${escapeHtml(s.genre)}</span>
                <span class="welcome-rank-score">${s.totalScore}</span>
            </div>
        `).join('');
    } catch (_) {
        list.innerHTML = '';
    }
}

export async function openRankingFromWelcome() {
    showScreen('screen-ranking');
    const list    = document.getElementById('ranking-list');
    const loading = document.getElementById('ranking-loading');
    list.innerHTML = '';
    loading.classList.remove('hidden');
    try {
        const res    = await fetch(`${CONFIG.API_BASE_URL}/api/score/v1/top`);
        const scores = await res.json();
        loading.classList.add('hidden');
        renderRanking(scores);
    } catch (_) {
        loading.classList.add('hidden');
        list.innerHTML = '<p class="ranking-empty">Não foi possível carregar o ranking.</p>';
    }
    document.getElementById('btn-back-ranking').onclick = () => showScreen('screen-welcome');
    document.getElementById('btn-ranking-play').onclick = () => showScreen('screen-welcome');
}

export async function openRanking() {
    showScreen('screen-ranking');

    const list    = document.getElementById('ranking-list');
    const loading = document.getElementById('ranking-loading');

    list.innerHTML = '';
    loading.classList.remove('hidden');

    try {
        const url    = state.customQuizId
            ? `${CONFIG.API_BASE_URL}/api/custom-quiz/v1/${state.customQuizId}/ranking`
            : `${CONFIG.API_BASE_URL}/api/score/v1/top`;
        const res    = await fetch(url);
        const scores = await res.json();
        loading.classList.add('hidden');
        renderRanking(scores);
    } catch (_) {
        loading.classList.add('hidden');
        list.innerHTML = '<p class="ranking-empty">Não foi possível carregar o ranking.</p>';
    }

    document.getElementById('btn-back-ranking').onclick = () => showScreen('screen-results');
    document.getElementById('btn-ranking-play').onclick = () => {
        if (state.customQuizId) showScreen('screen-custom-welcome');
        else showScreen('screen-welcome');
    };
}

export function renderRanking(scores) {
    const list = document.getElementById('ranking-list');

    if (!scores || scores.length === 0) {
        list.innerHTML = '<p class="ranking-empty">Ainda não há pontuações. Seja o primeiro! 🎵</p>';
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];

    list.innerHTML = scores.map((s, i) => {
        const position      = i + 1;
        const medal         = medals[i] ?? `<span class="rank-num">${position}</span>`;
        const isMe          = s.playerName === state.playerName && s.totalScore === state.score;
        const date          = s.createdAt ? s.createdAt.substring(0, 10) : '';
        const dateFormatted = date ? date.split('-').reverse().join('/') : '';

        return `
            <div class="ranking-item ${isMe ? 'ranking-item--me' : ''}">
                <span class="rank-medal">${medal}</span>
                <div class="rank-info">
                    <span class="rank-name">${escapeHtml(s.playerName)}</span>
                    <span class="rank-genre">${escapeHtml(s.genre)} · ${dateFormatted}</span>
                </div>
                <div class="rank-right">
                    <span class="rank-score">${s.totalScore}</span>
                    <span class="rank-correct">${s.correctCount}/10</span>
                </div>
            </div>
        `;
    }).join('');
}
