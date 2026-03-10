import { state } from './state.js';

const ROWS = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L','Ç'],
    ['ENTER','Z','X','C','V','B','N','M','⌫'],
];

// Priority: correct > present > absent (higher = better)
const PRIORITY = { correct: 3, present: 2, absent: 1 };

export function initKeyboard(onKey) {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    ROWS.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row';
        row.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key' + (key.length > 1 ? ' key--wide' : '');
            btn.textContent = key;
            btn.dataset.key = key;
            btn.addEventListener('click', () => onKey(key));
            rowEl.appendChild(btn);
        });
        kb.appendChild(rowEl);
    });
}

export function updateKey(letter, status) {
    const btn = document.querySelector(`.key[data-key="${letter}"]`);
    if (!btn) return;
    const current = state.keyStates[letter];
    if (current && PRIORITY[current] >= PRIORITY[status]) return;
    state.keyStates[letter] = status;
    btn.classList.remove('key--correct', 'key--present', 'key--absent');
    btn.classList.add(`key--${status}`);
}

export function restoreKeys() {
    Object.entries(state.keyStates).forEach(([letter, status]) => {
        const btn = document.querySelector(`.key[data-key="${letter}"]`);
        if (btn) {
            btn.classList.remove('key--correct', 'key--present', 'key--absent');
            btn.classList.add(`key--${status}`);
        }
    });
}

export function disableKeyboard() {
    document.querySelectorAll('.key').forEach(k => k.disabled = true);
}
