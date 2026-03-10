const ROWS = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L','Ç'],
    ['ENTER','Z','X','C','V','B','N','M','⌫'],
    ['Á','À','Â','Ã','É','Ê','Í','Ó','Ô','Õ','Ú','Ü'],
];

const PRIORITY = { correct: 3, present: 2, absent: 1 };

export function initKeyboard(onKey) {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    ROWS.forEach((row, rowIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'keyboard-row';
        const isAccentRow = rowIdx === ROWS.length - 1;
        row.forEach(key => {
            const btn = document.createElement('button');
            if (isAccentRow) {
                btn.className = 'key key--accent';
            } else {
                btn.className = 'key' + (key.length > 1 ? ' key--wide' : '');
            }
            btn.textContent = key;
            btn.dataset.key = key;
            btn.addEventListener('click', () => onKey(key));
            rowEl.appendChild(btn);
        });
        kb.appendChild(rowEl);
    });
}

export function updateKey(keyStates, letter, status) {
    const btn = document.querySelector(`.key[data-key="${letter}"]`);
    if (!btn) return;
    const current = keyStates[letter];
    if (current && PRIORITY[current] >= PRIORITY[status]) return;
    keyStates[letter] = status;
    btn.classList.remove('key--correct', 'key--present', 'key--absent');
    btn.classList.add(`key--${status}`);
}

export function restoreKeys(keyStates) {
    document.querySelectorAll('.key').forEach(btn => {
        btn.classList.remove('key--correct', 'key--present', 'key--absent');
        btn.disabled = false;
    });
    Object.entries(keyStates).forEach(([letter, status]) => {
        const btn = document.querySelector(`.key[data-key="${letter}"]`);
        if (btn) btn.classList.add(`key--${status}`);
    });
}

export function disableKeyboard() {
    document.querySelectorAll('.key').forEach(k => k.disabled = true);
}

export function enableKeyboard() {
    document.querySelectorAll('.key').forEach(k => k.disabled = false);
}
