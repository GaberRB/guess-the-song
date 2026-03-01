import { CONFIG, PLAYLISTS } from './config.js';
import { state } from './state.js';
import { showScreen, escapeHtml, showToast } from './utils.js';
import { stopTimer } from './timer.js';
import { stopAudio } from './audio.js';
import { startGame } from './quiz.js';
import { openRanking } from './ranking.js';
import { saveScore } from './score.js';

export function showResults() {
    stopTimer();
    stopAudio();
    showScreen('screen-results');

    const accuracy = Math.round((state.correctCount / CONFIG.TOTAL_QUESTIONS) * 100);

    document.getElementById('results-player-name').textContent = `${state.playerName}, você terminou!`;
    document.getElementById('results-score').textContent       = state.score;
    document.getElementById('stat-correct').textContent        = state.correctCount;
    document.getElementById('stat-wrong').textContent          = state.wrongCount;
    document.getElementById('stat-accuracy').textContent       = `${accuracy}%`;

    const levels = [
        { min: 100, trophy: '🏆', msg: '🎤 Incrível! Você é um mestre da música!' },
        { min: 80,  trophy: '🥇', msg: '🎸 Excelente! Você arrasou!' },
        { min: 60,  trophy: '🥈', msg: '🎵 Muito bom! Continue praticando!' },
        { min: 40,  trophy: '🥉', msg: '🎶 Boa tentativa! Tente de novo!' },
        { min: 0,   trophy: '🎧', msg: '👂 Continue treinando seus ouvidos!' },
    ];

    const level = levels.find(l => accuracy >= l.min);
    document.getElementById('results-trophy').textContent  = level.trophy;
    document.getElementById('results-message').textContent = level.msg;

    // Revisão questão a questão
    const reviewContainer = document.getElementById('results-review');
    reviewContainer.innerHTML = `
        <h3 class="review-title">Resumo das questões</h3>
        ${state.answerHistory.map(a => `
            <div class="review-item ${a.hit ? 'review-item--hit' : 'review-item--miss'}">
                <div class="review-row">
                    <span class="review-num">Q${a.num}</span>
                    <span class="review-badge ${a.hit ? 'review-badge--hit' : 'review-badge--miss'}">
                        ${a.hit ? '✓ Acertou' : '✗ Errou'}
                    </span>
                </div>
                <span class="review-song">${escapeHtml(a.song)}</span>
                ${!a.hit ? `<span class="review-selected">${a.selected ? `Sua resposta: ${escapeHtml(a.selected)}` : '⏰ Tempo esgotado'}</span>` : ''}
            </div>
        `).join('')}
    `;

    saveScore();

    document.getElementById('btn-play-again').onclick   = () => startGame();
    document.getElementById('btn-change-genre').onclick = () => {
        if (state.customQuizId) showScreen('screen-custom-welcome');
        else showScreen('screen-welcome');
    };
    document.getElementById('btn-view-ranking').onclick = () => openRanking();
    document.getElementById('btn-share').onclick        = () => shareResult();
}

export function shareResult() {
    const genreName = state.searchQuery
        ? state.searchQuery
        : (PLAYLISTS.find(p => p.id === state.selectedPlaylist)?.name ?? state.selectedPlaylist);
    const accuracy  = Math.round((state.correctCount / CONFIG.TOTAL_QUESTIONS) * 100);
    const trophy    = document.getElementById('results-trophy').textContent;

    document.getElementById('share-trophy').textContent   = trophy;
    document.getElementById('share-name').textContent     = state.playerName;
    document.getElementById('share-score').textContent    = state.score;
    document.getElementById('share-correct').textContent  = `${state.correctCount}/10`;
    document.getElementById('share-accuracy').textContent = `${accuracy}%`;
    document.getElementById('share-genre').textContent    = genreName;

    const modal = document.getElementById('share-modal');
    modal.classList.remove('hidden');

    modal.querySelector('.share-modal-backdrop').onclick = closeShareModal;
    document.getElementById('btn-share-close').onclick   = closeShareModal;

    const viralText =
        `🎵 Acabei de jogar Guess The Song!\n\n` +
        `👤 ${state.playerName}\n` +
        `⭐ ${state.score} pontos\n` +
        `🎯 ${state.correctCount}/10 acertos (${accuracy}%)\n` +
        `🎶 Gênero/Artista: ${genreName}\n\n` +
        `Você consegue me superar? 🏆\n` +
        `👉 https://music.quizminigames.com`;

    document.getElementById('btn-share-image').onclick = async () => {
        const card = document.getElementById('share-card');
        const btn  = document.getElementById('btn-share-image');
        btn.disabled = true;
        btn.textContent = '⏳ Gerando...';

        try {
            const canvas = await html2canvas(card, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
            });

            if (navigator.canShare) {
                const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
                const file = new File([blob], 'guess-the-song.png', { type: 'image/png' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Guess The Song 🎵',
                        text:  viralText,
                    });
                    btn.disabled = false;
                    btn.textContent = '📤 Compartilhar';
                    return;
                }
            }

            if (navigator.share) {
                await navigator.share({ title: 'Guess The Song 🎵', text: viralText });
                btn.disabled = false;
                btn.textContent = '📤 Compartilhar';
                return;
            }

            // Fallback desktop: baixa a imagem
            const link = document.createElement('a');
            link.download = 'guess-the-song-resultado.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast('✅ Imagem salva! Compartilhe nas redes.');

        } catch (err) {
            if (err.name !== 'AbortError') {
                showToast('❌ Não foi possível compartilhar.');
            }
        } finally {
            btn.disabled = false;
            btn.textContent = '📤 Compartilhar';
        }
    };

    document.getElementById('btn-share-text').onclick = async () => {
        try {
            await navigator.clipboard.writeText(viralText);
            showToast('✅ Copiado! Cole no WhatsApp, Instagram ou onde quiser.');
        } catch (_) {
            showToast('❌ Não foi possível copiar.');
        }
    };
}

export function closeShareModal() {
    document.getElementById('share-modal').classList.add('hidden');
}
