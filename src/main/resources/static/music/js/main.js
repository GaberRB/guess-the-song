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
    const PIX_PAYLOAD = '00020126410014BR.GOV.BCB.PIX0119grios0311@gmail.com5204000053039865802BR5920Gabriel Rios Belmiro6009SAO PAULO62140510kHaanMhl7Z6304A556';
    const modal        = document.getElementById('donate-modal');
    let qrGenerated    = false;

    document.getElementById('btn-donate').addEventListener('click', () => {
        modal.classList.remove('hidden');
        if (!qrGenerated) {
            QRCode.toCanvas(document.createElement('canvas'), PIX_PAYLOAD, { width: 200, margin: 1 }, (err, canvas) => {
                if (!err) {
                    const container = document.getElementById('donate-qrcode');
                    container.innerHTML = '';
                    container.appendChild(canvas);
                    qrGenerated = true;
                }
            });
        }
    });

    document.getElementById('donate-backdrop').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.getElementById('btn-donate-close').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.getElementById('btn-copy-pix').addEventListener('click', () => {
        navigator.clipboard.writeText(PIX_PAYLOAD).then(() => {
            showToast('✅ Código Pix copiado!');
        }).catch(() => {
            showToast('❌ Não foi possível copiar.');
        });
    });
});
