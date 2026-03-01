import { CONFIG } from './config.js';
import { state } from './state.js';
import { showScreen, escapeHtml, showToast } from './utils.js';
import { startGame } from './quiz.js';

export async function initCustomQuiz(quizId) {
    state.customQuizId = quizId;

    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/api/custom-quiz/v1/${quizId}`);
        if (res.status === 410) {
            showScreen('screen-welcome');
            showToast('❌ Este quiz expirou ou não existe.');
            return;
        }
        const quiz = await res.json();

        document.getElementById('custom-quiz-title').textContent   = quiz.name;
        document.getElementById('custom-quiz-creator').textContent = quiz.creatorName;
        document.getElementById('custom-player-name').value        = '';

        showScreen('screen-custom-welcome');
        loadCustomRanking(quizId);

        document.getElementById('custom-player-name').addEventListener('input', () => {
            const val = document.getElementById('custom-player-name').value.trim();
            document.getElementById('btn-custom-play').disabled = val.length < 2;
        });

        document.getElementById('btn-custom-play').onclick = () => {
            state.playerName = document.getElementById('custom-player-name').value.trim();
            startGame();
        };

    } catch (_) {
        showScreen('screen-welcome');
        showToast('❌ Não foi possível carregar o quiz.');
    }
}

export async function loadCustomRanking(quizId) {
    const list = document.getElementById('custom-ranking-list');
    try {
        const res    = await fetch(`${CONFIG.API_BASE_URL}/api/custom-quiz/v1/${quizId}/ranking`);
        const scores = await res.json();
        const medals = ['🥇', '🥈', '🥉'];

        if (!scores || scores.length === 0) {
            list.innerHTML = '<p style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:8px 0">Nenhuma pontuação ainda. Seja o primeiro!</p>';
            return;
        }

        list.innerHTML = scores.map((s, i) => `
            <div class="welcome-rank-item">
                <span class="welcome-rank-pos">${medals[i] ?? i + 1}</span>
                <span class="welcome-rank-name">${escapeHtml(s.playerName)}</span>
                <span class="welcome-rank-score">${s.totalScore}</span>
            </div>
        `).join('');
    } catch (_) {
        list.innerHTML = '';
    }
}
