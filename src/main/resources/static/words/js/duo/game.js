import { state } from './state.js';
import { validateWord, checkBothGuesses, saveScore } from './api.js';
import { setTileLetter, revealRow, shakeRow, bounceRow } from './board.js';
import { updateKey, disableKeyboard } from './keyboard.js';
import { showToast } from '../utils.js';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

export function handleKey(key) {
    if (!state.playerName || state.gameOver) return;
    if (key === '⌫' || key === 'BACKSPACE') {
        deleteLetter();
    } else if (key === 'ENTER') {
        submitGuess();
    } else if (/^[A-ZÇ]$/i.test(key) && key.length === 1) {
        addLetter(key.toUpperCase());
    }
}

function addLetter(letter) {
    if (state.currentCol >= WORD_LENGTH) return;
    if (!state.solved1) {
        state.board1[state.currentRow][state.currentCol] = { letter, status: '' };
        setTileLetter('board-1', state.currentRow, state.currentCol, letter);
    }
    if (!state.solved2) {
        state.board2[state.currentRow][state.currentCol] = { letter, status: '' };
        setTileLetter('board-2', state.currentRow, state.currentCol, letter);
    }
    state.currentCol++;
    saveLocalState();
}

function deleteLetter() {
    if (state.currentCol <= 0) return;
    state.currentCol--;
    if (!state.solved1) {
        state.board1[state.currentRow][state.currentCol] = { letter: '', status: '' };
        setTileLetter('board-1', state.currentRow, state.currentCol, '');
    }
    if (!state.solved2) {
        state.board2[state.currentRow][state.currentCol] = { letter: '', status: '' };
        setTileLetter('board-2', state.currentRow, state.currentCol, '');
    }
    saveLocalState();
}

async function submitGuess() {
    if (state.currentCol < WORD_LENGTH) {
        showToast('Palavra incompleta!');
        shakeRow(state.currentRow);
        return;
    }

    const activeBoard = state.solved1 ? state.board2 : state.board1;
    const guess = activeBoard[state.currentRow].map(c => c.letter).join('');

    let valid;
    try {
        valid = await validateWord(guess);
    } catch {
        showToast('Erro de conexao. Tente novamente.');
        return;
    }

    if (!valid) {
        showToast('Palavra nao encontrada!');
        shakeRow(state.currentRow);
        return;
    }

    let data;
    try {
        data = await checkBothGuesses(guess);
    } catch {
        showToast('Erro de conexao. Tente novamente.');
        return;
    }

    const results1 = data.r1.result;
    const results2 = data.r2.result;

    if (!results1 || !results2) {
        showToast('Erro ao verificar. Tente novamente.');
        return;
    }

    // Store words if revealed (on win)
    if (data.r1.word) state.word1 = data.r1.word;
    if (data.r2.word) state.word2 = data.r2.word;

    // Update board state
    results1.forEach((status, col) => {
        state.board1[state.currentRow][col] = { letter: guess[col], status };
    });
    results2.forEach((status, col) => {
        state.board2[state.currentRow][col] = { letter: guess[col], status };
    });

    // Animate both boards in parallel
    await Promise.all([
        revealRow('board-1', state.currentRow, results1),
        revealRow('board-2', state.currentRow, results2),
    ]);

    // Update keyboard: use best color between the two boards
    guess.split('').forEach((letter, i) => {
        const s1 = results1[i];
        const s2 = results2[i];
        const best = bestStatus(s1, s2);
        updateKey(letter, best);
    });

    const won1 = results1.every(r => r === 'correct');
    const won2 = results2.every(r => r === 'correct');

    if (won1) {
        state.solved1 = true;
        bounceRow('board-1', state.currentRow);
        document.getElementById('label-board-1').classList.add('solved');
    }
    if (won2) {
        state.solved2 = true;
        bounceRow('board-2', state.currentRow);
        document.getElementById('label-board-2').classList.add('solved');
    }

    const attemptNumber = state.currentRow + 1;

    if (state.solved1 && state.solved2) {
        // Won both!
        state.gameOver = true;
        state.currentRow++;
        state.currentCol = 0;
        if (!state.scoreSaved) {
            state.scoreSaved = true;
            saveScore(state.playerName, attemptNumber, true).catch(() => {});
        }
        saveLocalState();
        setTimeout(() => showResultModal(true), 1800);
    } else {
        state.currentRow++;
        state.currentCol = 0;

        if (state.currentRow >= MAX_ATTEMPTS) {
            state.gameOver = true;
            if (!state.scoreSaved) {
                state.scoreSaved = true;
                saveScore(state.playerName, 7, false).catch(() => {});
            }
            saveLocalState();
            setTimeout(() => showResultModal(false), 600);
        } else {
            // Show progress toast if one board is done
            if (state.solved1 && !state.solved2) showToast('Primeira palavra! Falta uma! 💪', 1500);
            if (state.solved2 && !state.solved1) showToast('Segunda palavra! Falta uma! 💪', 1500);
            saveLocalState();
        }
    }
}

function bestStatus(s1, s2) {
    const PRIORITY = { correct: 3, present: 2, absent: 1 };
    return (PRIORITY[s1] || 0) >= (PRIORITY[s2] || 0) ? s1 : s2;
}

export function showResultModal(won) {
    const modal    = document.getElementById('modal-result');
    const icon     = document.getElementById('result-icon');
    const title    = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');
    const wordsEl  = document.getElementById('duo-result-words');
    const emojiEl  = document.getElementById('result-emoji');

    icon.textContent  = won ? '🎉' : '😔';
    title.textContent = won ? 'Incrivel! Acertou as duas!' : 'Que pena!';

    if (won) {
        const attempts = state.currentRow - 1;
        subtitle.textContent = `Voce acertou em ${attempts} tentativa${attempts !== 1 ? 's' : ''}!`;
    } else {
        const parts = [];
        if (!state.solved1) parts.push('palavra 1');
        if (!state.solved2) parts.push('palavra 2');
        subtitle.textContent = `Nao acertou a ${parts.join(' e a ')}. Tente amanha!`;
    }

    wordsEl.innerHTML = `
        <div class="duo-result-word">
            <span class="duo-result-word-label">Palavra 1</span>
            <span class="duo-result-word-value ${state.solved1 ? 'solved' : ''}" id="rw1">${state.word1 || '?????'}</span>
        </div>
        <div class="duo-result-word">
            <span class="duo-result-word-label">Palavra 2</span>
            <span class="duo-result-word-value ${state.solved2 ? 'solved' : ''}" id="rw2">${state.word2 || '?????'}</span>
        </div>
    `;

    emojiEl.textContent = buildEmojiGrid();
    modal.classList.remove('hidden');
    disableKeyboard();

    // If words not yet loaded, poll
    if (!state.word1 || !state.word2) {
        import('../api.js').then(({ getWordOfDay }) => {
            // Fallback: fetch word1 only; word2 would need a dedicated endpoint
            // For now words revealed only on win; on loss show ?????
        });
    }
}

function buildEmojiGrid() {
    const EMOJI = { correct: '🟩', present: '🟨', absent: '⬛' };
    const rows = [];
    for (let r = 0; r < state.currentRow; r++) {
        const row1 = state.board1[r].map(c => EMOJI[c.status] || '⬛').join('');
        const row2 = state.board2[r].map(c => EMOJI[c.status] || '⬛').join('');
        rows.push(`${row1}  ${row2}`);
    }
    const attemptsStr = (state.solved1 && state.solved2) ? `${state.currentRow - 1}/6` : 'X/6';
    return `Palavras BR DUO ${state.date}\n${attemptsStr}\n\n${rows.join('\n')}`;
}

export function getEmojiGrid() {
    return buildEmojiGrid();
}

export function saveLocalState() {
    try {
        localStorage.setItem(`palavras-br-duo-${state.date}`, JSON.stringify({
            board1:     state.board1,
            board2:     state.board2,
            currentRow: state.currentRow,
            currentCol: state.currentCol,
            keyStates:  state.keyStates,
            solved1:    state.solved1,
            solved2:    state.solved2,
            gameOver:   state.gameOver,
            word1:      state.word1,
            word2:      state.word2,
            scoreSaved: state.scoreSaved,
        }));
    } catch (_) {}
}

export function loadLocalState() {
    try {
        const raw = localStorage.getItem(`palavras-br-duo-${state.date}`);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        Object.assign(state, saved);
        return true;
    } catch (_) {
        return false;
    }
}
