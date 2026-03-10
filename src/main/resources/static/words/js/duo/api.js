const API = '';

export async function getDailyInfo() {
    const res = await fetch(`${API}/api/wordle/v1/daily`);
    return res.json();
}

export async function validateWord(word) {
    const res = await fetch(`${API}/api/wordle/v1/validate?word=${encodeURIComponent(word)}`);
    const data = await res.json();
    return data.valid;
}

export async function checkBothGuesses(guess) {
    const [r1, r2] = await Promise.all([
        fetch(`${API}/api/wordle/v1/guess`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guess }),
        }).then(r => r.json()),
        fetch(`${API}/api/wordle/v1/guess2`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guess }),
        }).then(r => r.json()),
    ]);
    return { r1, r2 };
}

export async function saveScore(playerName, attempts, solved) {
    await fetch(`${API}/api/wordle/v1/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, attempts, solved }),
    });
}

export async function getDailyRanking(date) {
    const res = await fetch(`${API}/api/wordle/v1/ranking?date=${date}`);
    return res.json();
}
