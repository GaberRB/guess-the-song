import { initWelcomeScreen } from './welcome.js';
import { initCustomQuiz } from './customQuiz.js';
import { showToast } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const quizId = new URLSearchParams(window.location.search).get('quiz');
    if (quizId) {
        initCustomQuiz(quizId);
    } else {
        initWelcomeScreen();
    }

    // Modal de doação
    const PIX_LINK = '00020126410014BR.GOV.BCB.PIX0119grios0311@gmail.com5204000053039865802BR5920Gabriel Rios Belmiro6009SAO PAULO62140510kHaanMhl7Z6304A556';
    const modal    = document.getElementById('donate-modal');

    document.getElementById('btn-donate').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    document.getElementById('donate-backdrop').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.getElementById('btn-donate-close').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.getElementById('btn-copy-pix').addEventListener('click', () => {
        navigator.clipboard.writeText(PIX_LINK).then(() => {
            showToast('✅ Link do Pix copiado!');
        }).catch(() => {
            showToast('❌ Não foi possível copiar.');
        });
    });
});
