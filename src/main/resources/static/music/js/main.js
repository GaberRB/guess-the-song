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
    const PIX_LINK = 'https://nubank.com.br/cobrar/49kxc/69a5674a-8e2f-4baf-a284-93d0ba76f583';
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
