import { state } from './state.js';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

export function initBoards() {
    initBoard('board-1');
    initBoard('board-2');
}

function initBoard(id) {
    const board = document.getElementById(id);
    board.innerHTML = '';
    for (let r = 0; r < MAX_ATTEMPTS; r++) {
        const row = document.createElement('div');
        row.className = 'board-row';
        row.id = `${id}-row-${r}`;
        for (let c = 0; c < WORD_LENGTH; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `${id}-tile-${r}-${c}`;
            row.appendChild(tile);
        }
        board.appendChild(row);
    }
}

export function setTileLetter(boardId, row, col, letter) {
    const tile = document.getElementById(`${boardId}-tile-${row}-${col}`);
    if (!tile) return;
    tile.textContent = letter;
    tile.className = 'tile' + (letter ? ' tile--filled' : '');
}

export function revealRow(boardId, rowIndex, results) {
    return new Promise(resolve => {
        results.forEach((status, col) => {
            const tile = document.getElementById(`${boardId}-tile-${rowIndex}-${col}`);
            if (!tile) return;
            const delay = col * 300;
            setTimeout(() => {
                tile.classList.add('tile--flip');
                setTimeout(() => {
                    tile.classList.remove('tile--flip');
                    tile.classList.remove('tile--filled');
                    tile.classList.add(`tile--${status}`);
                }, 250);
            }, delay);
        });
        setTimeout(resolve, results.length * 300 + 300);
    });
}

export function shakeRow(rowIndex) {
    ['board-1', 'board-2'].forEach(boardId => {
        const row = document.getElementById(`${boardId}-row-${rowIndex}`);
        if (!row) return;
        row.classList.add('board-row--shake');
        setTimeout(() => row.classList.remove('board-row--shake'), 400);
    });
}

export function bounceRow(boardId, rowIndex) {
    for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.getElementById(`${boardId}-tile-${rowIndex}-${c}`);
        if (!tile) continue;
        setTimeout(() => {
            tile.classList.add('tile--bounce');
            setTimeout(() => tile.classList.remove('tile--bounce'), 500);
        }, c * 100);
    }
}

export function restoreBoards() {
    const rows1 = state.solved1 ? state.currentRow : state.currentRow;
    const rows2 = state.solved2 ? state.currentRow : state.currentRow;
    const totalRows = Math.max(rows1, rows2);

    for (let r = 0; r < state.currentRow; r++) {
        for (let c = 0; c < WORD_LENGTH; c++) {
            restoreTile('board-1', r, c, state.board1[r][c]);
            restoreTile('board-2', r, c, state.board2[r][c]);
        }
    }
    if (!state.gameOver) {
        for (let c = 0; c < state.currentCol; c++) {
            const cell1 = state.board1[state.currentRow][c];
            const cell2 = state.board2[state.currentRow][c];
            if (cell1 && cell1.letter) {
                const t1 = document.getElementById(`board-1-tile-${state.currentRow}-${c}`);
                if (t1) { t1.textContent = cell1.letter; t1.className = 'tile tile--filled'; }
            }
            if (cell2 && cell2.letter) {
                const t2 = document.getElementById(`board-2-tile-${state.currentRow}-${c}`);
                if (t2) { t2.textContent = cell2.letter; t2.className = 'tile tile--filled'; }
            }
        }
    }
}

function restoreTile(boardId, r, c, cell) {
    if (!cell || !cell.letter) return;
    const tile = document.getElementById(`${boardId}-tile-${r}-${c}`);
    if (tile) {
        tile.textContent = cell.letter;
        tile.className = `tile tile--${cell.status}`;
    }
}
