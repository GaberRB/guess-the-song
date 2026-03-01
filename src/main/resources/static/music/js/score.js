import { CONFIG, PLAYLISTS } from './config.js';
import { state } from './state.js';

export async function saveScore() {
    // Quiz personalizado: salva no ranking isolado do quiz
    if (state.customQuizId) {
        try {
            await fetch(`${CONFIG.API_BASE_URL}/api/custom-quiz/v1/${state.customQuizId}/score`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    playerName:   state.playerName,
                    totalScore:   state.score,
                    correctCount: state.correctCount,
                }),
            });
        } catch (_) {}
        return;
    }

    // Quiz normal: salva no ranking global
    const genreName = state.searchQuery
        ? state.searchQuery
        : (PLAYLISTS.find(p => p.id === state.selectedPlaylist)?.name ?? state.selectedPlaylist);

    try {
        await fetch(`${CONFIG.API_BASE_URL}/api/score/v1`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                playerName:   state.playerName,
                totalScore:   state.score,
                correctCount: state.correctCount,
                genre:        genreName,
            }),
        });
    } catch (_) {
        // Falha silenciosa — não interrompe a experiência
    }
}
