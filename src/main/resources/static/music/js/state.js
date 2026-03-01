import { CONFIG } from './config.js';

export const state = {
    playerName:       '',
    selectedPlaylist: null,
    searchQuery:      null,
    questions:        [],
    currentIndex:     0,
    score:            0,
    correctCount:     0,
    wrongCount:       0,
    answerHistory:    [],   // { num, song, selected, hit } — revisão completa no final
    timerInterval:    null,
    timeLeft:         CONFIG.QUESTION_TIME,
    answered:         false,
    audioPlaying:     false,
    customQuizId:     null,   // UUID do quiz personalizado (modo custom)
};
