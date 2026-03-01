import { initWelcomeScreen } from './welcome.js';
import { initCustomQuiz } from './customQuiz.js';

document.addEventListener('DOMContentLoaded', () => {
    const quizId = new URLSearchParams(window.location.search).get('quiz');
    if (quizId) {
        initCustomQuiz(quizId);
    } else {
        initWelcomeScreen();
    }
});
