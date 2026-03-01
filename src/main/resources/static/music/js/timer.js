import { state } from './state.js';
import { CONFIG } from './config.js';

export function startTimer(onTimeUp) {
    const circle        = document.getElementById('timer-circle');
    const display       = document.getElementById('timer-display');
    const circumference = 283; // 2π × 45

    function render() {
        const ratio = state.timeLeft / CONFIG.QUESTION_TIME;
        circle.style.strokeDashoffset = circumference * (1 - ratio);
        display.textContent = state.timeLeft;

        if (state.timeLeft <= 5) {
            circle.style.stroke = 'var(--error)';
            display.style.color = 'var(--error)';
        } else if (state.timeLeft <= 10) {
            circle.style.stroke = 'var(--warning)';
            display.style.color = 'var(--warning)';
        } else {
            circle.style.stroke = 'var(--accent)';
            display.style.color = 'var(--text-primary)';
        }
    }

    render();

    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        render();

        if (state.timeLeft <= 0) {
            stopTimer();
            onTimeUp();
        }
    }, 1000);
}

export function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
}
