import { state, makeStageState } from './state.js';
import { STAGES } from './config.js';
import { validateWord, checkGuessStage, saveScore, getWordsOfDay } from './api.js';
import { setTileLetter, revealRow, shakeAllRows, bounceRow, markBoardSolved, initStageBoards, restoreStageBoards, setCursorCol, clearCursor, setTileClickHandler } from './board.js';
import { updateKey, disableKeyboard, enableKeyboard, restoreKeys } from './keyboard.js';
import { showToast } from './utils.js';

const WORD_LENGTH = 5;
const PRIORITY = { correct: 3, present: 2, absent: 1 };

function ss() { return state.stages[state.currentStage]; }
function stg() { return STAGES[state.currentStage]; }

export function handleKey(key) {
    const s = ss();
    if (!state.playerName || !s || s.gameOver) return;
    if (key === '⌫' || key === 'BACKSPACE') deleteLetter();
    else if (key === 'ENTER') submitGuess();
    else if (/^[A-ZÇÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÑ]$/i.test(key) && key.length === 1) addLetter(key.toUpperCase());
}

function addLetter(letter) {
    const s = ss();
    if (s.currentCol >= WORD_LENGTH) return;
    for (let w = 0; w < stg().wordCount; w++) {
        if (s.solved[w]) continue;
        s.boards[w][s.currentRow][s.currentCol] = { letter, status: '' };
        setTileLetter(w, s.currentRow, s.currentCol, letter);
    }
    // Advance cursor to next empty column; if none, move past end (no cursor)
    const nextCol = findNextEmptyCol(s, s.currentCol + 1);
    s.currentCol = nextCol !== null ? nextCol : WORD_LENGTH;
    updateCursor();
    updateAttemptsCounter();
    saveLocal();
}

function deleteLetter() {
    const s = ss();
    // Delete the letter at currentCol (or previous if current is empty)
    let targetCol = s.currentCol;
    const activeBoard = s.boards.find((b, i) => !s.solved[i]);
    if (!activeBoard) return;

    if (targetCol >= WORD_LENGTH || !activeBoard[s.currentRow][targetCol]?.letter) {
        // current col is empty or past end — delete previous
        if (targetCol > 0) targetCol--;
        else return;
    }

    for (let w = 0; w < stg().wordCount; w++) {
        if (s.solved[w]) continue;
        s.boards[w][s.currentRow][targetCol] = { letter: '', status: '' };
        setTileLetter(w, s.currentRow, targetCol, '');
    }
    s.currentCol = targetCol;
    updateCursor();
    saveLocal();
}

/** Select a specific column by clicking a tile */
export function selectCol(row, col) {
    const s = ss();
    if (!s || s.gameOver) return;
    if (row !== s.currentRow) return; // only current row is interactive
    s.currentCol = col;
    updateCursor();
}

function findNextEmptyCol(s, fromCol) {
    const activeBoard = s.boards.find((b, i) => !s.solved[i]);
    if (!activeBoard) return null;
    for (let c = fromCol; c < WORD_LENGTH; c++) {
        if (!activeBoard[s.currentRow][c]?.letter) return c;
    }
    return null;
}

function updateCursor() {
    const s = ss();
    if (s.currentCol >= WORD_LENGTH) {
        clearCursor(stg().wordCount, s.currentRow);
    } else {
        setCursorCol(stg().wordCount, s.currentRow, s.currentCol, s.solved);
    }
}

async function submitGuess() {
    const s = ss();
    // Find first unsolved board to read the guess from
    const activeBoardIdx = s.solved.findIndex(v => !v);
    const activeBoard = activeBoardIdx >= 0 ? s.boards[activeBoardIdx] : s.boards[0];
    const guess = activeBoard[s.currentRow].map(c => c.letter).join('');

    if (guess.length < WORD_LENGTH || activeBoard[s.currentRow].some(c => !c.letter)) {
        showToast('Palavra incompleta!');
        shakeAllRows(stg().wordCount, s.currentRow);
        return;
    }

    clearCursor(stg().wordCount, s.currentRow);

    let valid;
    try { valid = await validateWord(guess); }
    catch { showToast('Erro de conexao.'); return; }
    if (!valid) {
        showToast('Palavra nao encontrada!');
        shakeAllRows(stg().wordCount, s.currentRow);
        return;
    }

    const offset = getStageWordOffset();
    const checks = [];
    for (let w = 0; w < stg().wordCount; w++) {
        if (s.solved[w]) { checks.push(Promise.resolve(null)); continue; }
        checks.push(checkGuessStage(guess, offset + w));
    }

    let results;
    try { results = await Promise.all(checks); }
    catch { showToast('Erro de conexao.'); return; }

    const reveals = [];
    for (let w = 0; w < stg().wordCount; w++) {
        if (s.solved[w]) continue;
        const data = results[w];
        if (!data || data.error) continue;
        const res = data.result;
        res.forEach((status, col) => {
            s.boards[w][s.currentRow][col] = { letter: guess[col], status };
        });
        if (data.word) s.words[w] = data.word;
        reveals.push(revealRow(w, s.currentRow, res));
    }
    await Promise.all(reveals);

    // Update keyboard: best color across all active boards
    for (let i = 0; i < WORD_LENGTH; i++) {
        let best = 'absent';
        for (let w = 0; w < stg().wordCount; w++) {
            if (s.solved[w]) continue;
            const status = s.boards[w][s.currentRow][i]?.status;
            if (status && PRIORITY[status] > PRIORITY[best]) best = status;
        }
        updateKey(s.keyStates, guess[i], best);
    }

    let newlySolved = 0;
    for (let w = 0; w < stg().wordCount; w++) {
        if (s.solved[w]) continue;
        const data = results[w];
        if (!data) continue;
        if (data.result.every(r => r === 'correct')) {
            s.solved[w] = true;
            newlySolved++;
            bounceRow(w, s.currentRow);
            markBoardSolved(w);
        }
    }

    const attemptNumber = s.currentRow + 1;
    s.currentRow++;
    s.currentCol = 0;
    updateAttemptsCounter();

    const allSolved = s.solved.every(v => v);
    const outOfAttempts = s.currentRow >= stg().maxAttempts;

    if (allSolved) {
        s.allSolved = true;
        s.gameOver = true;
        if (!s.scoreSaved) {
            s.scoreSaved = true;
            saveScore(state.playerName, attemptNumber, true).catch(() => {});
        }
        saveLocal();
        setTimeout(() => showStageResult(true), 1800);
    } else if (outOfAttempts) {
        s.gameOver = true;
        if (!s.scoreSaved) {
            s.scoreSaved = true;
            saveScore(state.playerName, stg().maxAttempts + 1, false).catch(() => {});
        }
        await revealMissingWords();
        saveLocal();
        setTimeout(() => showStageResult(false), 600);
    } else {
        const remaining = s.solved.filter(v => !v).length;
        if (newlySolved > 0 && remaining > 0) {
            showToast(`${newlySolved} palavra${newlySolved > 1 ? 's' : ''} certa! Falta${remaining > 1 ? 'm' : ''} ${remaining}! 💪`, 1800);
        }
        saveLocal();
        updateCursor();
    }
}

async function revealMissingWords() {
    const s = ss();
    try {
        const data = await getWordsOfDay();
        const allWords = data.words;
        const offset = getStageWordOffset();
        for (let w = 0; w < stg().wordCount; w++) {
            if (!s.words[w]) s.words[w] = allWords[offset + w] || '?????';
        }
    } catch { /* show ????? on network error */ }
}

// Stage 0→word 0, Stage 1→words 1-2, Stage 2→words 3-6, Stage 3→words 7-12
// Total 13 unique words per day — no repetition across stages
function getStageWordOffset() {
    return [0, 1, 3, 7][state.currentStage];
}

export function showStageResult(won) {
    const s = ss();
    const stage = stg();
    disableKeyboard();

    const modal   = document.getElementById('modal-result');
    const icon    = document.getElementById('result-icon');
    const title   = document.getElementById('result-title');
    const sub     = document.getElementById('result-subtitle');
    const wordsEl = document.getElementById('result-words');
    const emojiEl = document.getElementById('result-emoji');
    const nextBtn  = document.getElementById('btn-next-stage');
    const retryBtn = document.getElementById('btn-retry');

    icon.textContent = won ? '🎉' : '😔';
    nextBtn.classList.add('hidden');
    retryBtn.classList.add('hidden');

    if (won) {
        const attempts = s.currentRow - 1;
        if (state.currentStage < STAGES.length - 1) {
            const next = STAGES[state.currentStage + 1];
            title.textContent = `${stage.name} completo! 🔥`;
            sub.textContent = `Acertou em ${attempts} tentativa${attempts !== 1 ? 's' : ''}!`;
            nextBtn.textContent = `Próximo: ${next.name} ${next.emoji}`;
            nextBtn.classList.remove('hidden');
        } else {
            title.textContent = '🏆 Desafio completo!';
            sub.textContent = `Incrível! Completou todos os níveis em ${attempts} tentativas!`;
        }
    } else {
        title.textContent = 'Que pena! 😔';
        const unsolved = s.solved.filter(v => !v).length;
        sub.textContent = `Nao acertou ${unsolved} palavra${unsolved > 1 ? 's' : ''}.`;
        retryBtn.classList.remove('hidden');
    }

    wordsEl.innerHTML = s.words.map((w, i) => `
        <div class="result-word-item ${s.solved[i] ? 'solved' : 'unsolved'}">
            <span class="result-word-num">${stage.wordCount > 1 ? `Palavra ${i + 1}` : 'A palavra era'}</span>
            <span class="result-word-val">${w || '?????'}</span>
        </div>
    `).join('');

    emojiEl.textContent = buildEmojiGrid();
    modal.classList.remove('hidden');
}

function buildEmojiGrid() {
    const s = ss();
    const stage = stg();
    const EMOJI = { correct: '🟩', present: '🟨', absent: '⬛' };
    const rows = [];
    for (let r = 0; r < s.currentRow; r++) {
        if (stage.wordCount === 1) {
            rows.push(s.boards[0][r].map(c => EMOJI[c.status] || '⬛').join(''));
        } else {
            rows.push(
                Array.from({ length: stage.wordCount }, (_, w) =>
                    s.boards[w][r].map(c => EMOJI[c.status] || '⬛').join('')
                ).join(' ')
            );
        }
    }
    const att = s.allSolved ? `${s.currentRow - 1}/${stage.maxAttempts}` : `X/${stage.maxAttempts}`;
    return `Palavras BR — ${stage.name} ${state.date}\n${att}\n\n${rows.join('\n')}`;
}

export function getEmojiGrid() { return buildEmojiGrid(); }

export function retryStage() {
    document.getElementById('modal-result').classList.add('hidden');
    // Reset only the current stage state
    state.stages[state.currentStage] = makeStageState(state.currentStage);
    saveLocal();
    startCurrentStage();
}

export function saveLocal() {
    try {
        localStorage.setItem(`palavras-br-v2-${state.date}`, JSON.stringify({
            currentStage: state.currentStage,
            stages: state.stages,
        }));
    } catch (_) {}
}

export function loadLocal() {
    try {
        const raw = localStorage.getItem(`palavras-br-v2-${state.date}`);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        state.currentStage = saved.currentStage ?? 0;
        state.stages = saved.stages ?? [];
        return true;
    } catch (_) { return false; }
}

export function advanceStage() {
    if (state.currentStage >= STAGES.length - 1) return;
    document.getElementById('modal-result').classList.add('hidden');
    state.currentStage++;
    if (!state.stages[state.currentStage]) {
        state.stages[state.currentStage] = makeStageState(state.currentStage);
    }
    saveLocal();
    startCurrentStage();
}

export function startCurrentStage() {
    const s = ss();
    const stage = stg();

    document.getElementById('stage-badge').textContent = stage.name;
    document.getElementById('stage-badge').className = `stage-badge stage-badge--${stage.id}`;

    initStageBoards(state.currentStage);

    // Register tile click handler for free-column selection
    setTileClickHandler((row, col) => selectCol(row, col));

    restoreKeys(s.keyStates);
    enableKeyboard();
    updateAttemptsCounter();

    if (s.gameOver) {
        disableKeyboard();
        restoreStageBoards(s);
        setTimeout(() => showStageResult(s.allSolved), 400);
    } else if (s.currentRow > 0) {
        restoreStageBoards(s);
        updateCursor();
    } else {
        updateCursor();
    }
}

export function updateAttemptsCounter() {
    const s = ss();
    const stage = stg();
    const el = document.getElementById('attempts-counter');
    if (el) el.textContent = `${s.currentRow} / ${stage.maxAttempts}`;
}
