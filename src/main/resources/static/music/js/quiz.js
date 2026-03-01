import { CONFIG } from './config.js';
import { state } from './state.js';
import { showScreen, escapeHtml, shuffle } from './utils.js';
import { loadAudio, pauseAudio, stopAudio } from './audio.js';
import { startTimer, stopTimer } from './timer.js';

/* ==========================================
   INICIAR JOGO — BUSCA AS PERGUNTAS NA API
   ========================================== */

export async function startGame() {
    // No modo custom, playerName já foi setado em initCustomQuiz antes de chamar startGame
    if (!state.customQuizId) {
        state.playerName = document.getElementById('player-name').value.trim();
    }
    showScreen('screen-loading');
    stopAudio();

    try {
        const url = state.customQuizId
            ? `${CONFIG.API_BASE_URL}/api/custom-quiz/v1/${state.customQuizId}/questions`
            : state.searchQuery
                ? `${CONFIG.API_BASE_URL}/api/quiz/v1/search?q=${encodeURIComponent(state.searchQuery)}`
                : `${CONFIG.API_BASE_URL}/api/quiz/v1/${state.selectedPlaylist}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`O servidor retornou erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('A API não retornou perguntas. Tente outro gênero.');
        }

        state.questions     = data.results;
        state.currentIndex  = 0;
        state.score         = 0;
        state.correctCount  = 0;
        state.wrongCount    = 0;
        state.answerHistory = [];

        showScreen('screen-quiz');
        loadQuestion();

    } catch (err) {
        showScreen('screen-welcome');
        alert(
            `❌ Erro ao carregar as músicas!\n\n` +
            `${err.message}\n\n` +
            `Verifique se a API está rodando e tente novamente.`
        );
    }
}

/* ==========================================
   CARREGAR PERGUNTA
   ========================================== */

export function loadQuestion() {
    if (state.currentIndex >= state.questions.length) {
        // Importação dinâmica para evitar circular: results.js → quiz.js → results.js
        import('./results.js').then(m => m.showResults());
        return;
    }

    const q = state.questions[state.currentIndex];
    state.answered = false;
    state.timeLeft = CONFIG.QUESTION_TIME;

    document.getElementById('display-player-name').textContent      = state.playerName;
    document.getElementById('display-score').textContent            = state.score;
    document.getElementById('display-question-num').textContent     = state.currentIndex + 1;

    const pct = ((state.currentIndex + 1) / CONFIG.TOTAL_QUESTIONS) * 100;
    document.getElementById('progress-bar').style.width = `${pct}%`;

    document.getElementById('question-text').textContent =
        `Questão ${state.currentIndex + 1} — Qual é essa música?`;

    const allAnswers = shuffle([q.correct_answer, ...q.incorrect_answers]);
    const letters    = ['A', 'B', 'C', 'D'];
    const container  = document.getElementById('options-container');
    container.innerHTML = '';

    allAnswers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className      = 'option-btn';
        btn.dataset.answer = answer;
        btn.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span>${escapeHtml(answer)}</span>
        `;
        btn.addEventListener('click', () => handleAnswer(btn, answer, q.correct_answer));
        container.appendChild(btn);
    });

    loadAudio(q.mp3_link, true);
    startTimer(handleTimeUp);
}

/* ==========================================
   PROCESSAR RESPOSTA
   ========================================== */

export function handleAnswer(clickedBtn, selected, correct) {
    if (state.answered) return;
    state.answered = true;

    document.getElementById('audio-player').oncanplay = null;

    stopTimer();
    pauseAudio();

    const normalize = s => s.normalize('NFC').trim();
    const isCorrect = normalize(selected) === normalize(correct);

    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (normalize(btn.dataset.answer) === normalize(correct)) {
            btn.classList.add('correct');
        } else if (btn === clickedBtn && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    if (isCorrect) {
        const points = 100 + (state.timeLeft * 5);
        state.score += points;
        state.correctCount++;
        state.answerHistory.push({ num: state.currentIndex + 1, song: correct, selected, hit: true });
        showFeedback(true, correct, false, points);
    } else {
        state.wrongCount++;
        state.answerHistory.push({ num: state.currentIndex + 1, song: correct, selected, hit: false });
        showFeedback(false, correct, false, 0);
    }

    setTimeout(() => {
        hideFeedback();
        state.currentIndex++;
        loadQuestion();
    }, CONFIG.FEEDBACK_DELAY);
}

/* ==========================================
   TEMPO ESGOTADO
   ========================================== */

export function handleTimeUp() {
    if (state.answered) return;
    state.answered = true;

    document.getElementById('audio-player').oncanplay = null;

    state.wrongCount++;
    pauseAudio();

    const correct = state.questions[state.currentIndex].correct_answer;

    state.answerHistory.push({ num: state.currentIndex + 1, song: correct, selected: null, hit: false });

    const normCorrect = correct.normalize('NFC').trim();
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.answer.normalize('NFC').trim() === normCorrect) btn.classList.add('correct');
    });

    showFeedback(false, correct, true, 0);

    setTimeout(() => {
        hideFeedback();
        state.currentIndex++;
        loadQuestion();
    }, CONFIG.FEEDBACK_DELAY);
}

/* ==========================================
   FEEDBACK OVERLAY
   ========================================== */

export function showFeedback(isCorrect, correctAnswer, timedOut, points) {
    const overlay = document.getElementById('feedback-overlay');
    const icon    = document.getElementById('feedback-icon');
    const text    = document.getElementById('feedback-text');
    const answer  = document.getElementById('feedback-answer');

    if (timedOut) {
        icon.textContent   = '⏰';
        icon.className     = 'feedback-icon error';
        text.textContent   = 'Tempo esgotado!';
        text.className     = 'feedback-text error';
        answer.textContent = `Resposta: ${correctAnswer}`;
    } else if (isCorrect) {
        icon.textContent   = '✓';
        icon.className     = 'feedback-icon success';
        text.textContent   = `+${points} pontos!`;
        text.className     = 'feedback-text success';
        answer.textContent = '';
    } else {
        icon.textContent   = '✗';
        icon.className     = 'feedback-icon error';
        text.textContent   = 'Errado!';
        text.className     = 'feedback-text error';
        answer.textContent = `Resposta: ${correctAnswer}`;
    }

    overlay.classList.remove('hidden');
}

export function hideFeedback() {
    document.getElementById('feedback-overlay').classList.add('hidden');
}
