import { CONFIG } from './config.js';

export async function getDailyInfo() {
    const res = await fetch(`${CONFIG.API}/api/wordle/v1/daily`);
    return res.json();
}

export async function validateWord(word) {
    const res = await fetch(`${CONFIG.API}/api/wordle/v1/validate?word=${encodeURIComponent(word)}`);
    const data = await res.json();
    return data.valid;
}

/** Check guess against word at wordIndex (0-5) in the progression */
export async function checkGuessStage(guess, wordIndex) {
    const res = await fetch(`${CONFIG.API}/api/wordle/v1/guess-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess, wordIndex }),
    });
    return res.json();
}

/** Fetch all 6 daily words — used to reveal on game over */
export async function getWordsOfDay() {
    const res = await fetch(`${CONFIG.API}/api/wordle/v1/words-of-day`);
    return res.json();
}

export async function saveScore(playerName, attempts, solved) {
    await fetch(`${CONFIG.API}/api/wordle/v1/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, attempts, solved }),
    });
}

export async function getDailyRanking(date) {
    const res = await fetch(`${CONFIG.API}/api/wordle/v1/ranking?date=${date}`);
    return res.json();
}
