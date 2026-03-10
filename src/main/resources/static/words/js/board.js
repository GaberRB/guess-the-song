import { STAGES } from './config.js';

const WORD_LENGTH = 5;

let tileClickHandler = null;
export function setTileClickHandler(fn) { tileClickHandler = fn; }

/** Build DOM for a stage: N boards inside #boards-container */
export function initStageBoards(stageIndex) {
    const stage = STAGES[stageIndex];
    const container = document.getElementById('boards-container');
    container.innerHTML = '';
    container.className = `boards-container boards-count-${stage.wordCount}`;

    for (let w = 0; w < stage.wordCount; w++) {
        const wrap = document.createElement('div');
        wrap.className = 'board-wrap';
        wrap.id = `board-wrap-${w}`;

        const label = document.createElement('div');
        label.className = 'board-label';
        label.id = `board-label-${w}`;
        label.textContent = stage.wordCount > 1 ? `Palavra ${w + 1}` : '';

        const board = document.createElement('div');
        board.className = 'board';
        board.id = `board-${w}`;

        for (let r = 0; r < stage.maxAttempts; r++) {
            const row = document.createElement('div');
            row.className = 'board-row';
            row.id = `board-${w}-row-${r}`;
            for (let c = 0; c < WORD_LENGTH; c++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.id = `tile-${w}-${r}-${c}`;
                tile.dataset.col = c;
                tile.addEventListener('click', () => {
                    if (tileClickHandler) tileClickHandler(r, c);
                });
                row.appendChild(tile);
            }
            board.appendChild(row);
        }

        wrap.appendChild(label);
        wrap.appendChild(board);
        container.appendChild(wrap);
    }
}

export function setTileLetter(wordIndex, row, col, letter) {
    const tile = document.getElementById(`tile-${wordIndex}-${row}-${col}`);
    if (!tile) return;
    tile.textContent = letter;
    // preserve cursor class if present
    const hasCursor = tile.classList.contains('tile--cursor');
    tile.className = 'tile' + (letter ? ' tile--filled' : '') + (hasCursor ? ' tile--cursor' : '');
}

/** Move the cursor highlight to a specific column in the current row */
export function setCursorCol(wordCount, currentRow, newCol, solvedBoards) {
    // Remove cursor from all tiles in current row
    for (let w = 0; w < wordCount; w++) {
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = document.getElementById(`tile-${w}-${currentRow}-${c}`);
            if (tile) tile.classList.remove('tile--cursor');
        }
    }
    // Add cursor to new col on unsolved boards
    for (let w = 0; w < wordCount; w++) {
        if (solvedBoards[w]) continue;
        const tile = document.getElementById(`tile-${w}-${currentRow}-${newCol}`);
        if (tile) tile.classList.add('tile--cursor');
    }
}

export function clearCursor(wordCount, currentRow) {
    for (let w = 0; w < wordCount; w++) {
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = document.getElementById(`tile-${w}-${currentRow}-${c}`);
            if (tile) tile.classList.remove('tile--cursor');
        }
    }
}

export function revealRow(wordIndex, rowIndex, results) {
    return new Promise(resolve => {
        results.forEach((status, col) => {
            const tile = document.getElementById(`tile-${wordIndex}-${rowIndex}-${col}`);
            if (!tile) return;
            setTimeout(() => {
                tile.classList.add('tile--flip');
                setTimeout(() => {
                    tile.classList.remove('tile--flip', 'tile--filled');
                    tile.classList.add(`tile--${status}`);
                }, 250);
            }, col * 300);
        });
        setTimeout(resolve, results.length * 300 + 300);
    });
}

export function shakeAllRows(wordCount, rowIndex) {
    for (let w = 0; w < wordCount; w++) {
        const row = document.getElementById(`board-${w}-row-${rowIndex}`);
        if (!row) continue;
        row.classList.add('board-row--shake');
        setTimeout(() => row.classList.remove('board-row--shake'), 400);
    }
}

export function bounceRow(wordIndex, rowIndex) {
    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.getElementById(`tile-${wordIndex}-${rowIndex}-${c}`);
        if (!tile) continue;
        setTimeout(() => {
            tile.classList.add('tile--bounce');
            setTimeout(() => tile.classList.remove('tile--bounce'), 500);
        }, c * 100);
    }
}

export function markBoardSolved(wordIndex) {
    const label = document.getElementById(`board-label-${wordIndex}`);
    if (label) label.classList.add('solved');
    const wrap = document.getElementById(`board-wrap-${wordIndex}`);
    if (wrap) wrap.classList.add('board-solved');
}

export function restoreStageBoards(ss) {
    for (let w = 0; w < ss.boards.length; w++) {
        for (let r = 0; r < ss.currentRow; r++) {
            for (let c = 0; c < WORD_LENGTH; c++) {
                const cell = ss.boards[w][r][c];
                const tile = document.getElementById(`tile-${w}-${r}-${c}`);
                if (tile && cell && cell.letter) {
                    tile.textContent = cell.letter;
                    tile.className = `tile tile--${cell.status}`;
                }
            }
        }
        if (!ss.gameOver) {
            for (let c = 0; c < ss.currentCol; c++) {
                const cell = ss.boards[w][ss.currentRow]?.[c];
                const tile = document.getElementById(`tile-${w}-${ss.currentRow}-${c}`);
                if (tile && cell && cell.letter) {
                    tile.textContent = cell.letter;
                    tile.className = 'tile tile--filled';
                }
            }
        }
        if (ss.solved[w]) markBoardSolved(w);
    }
}
