import { STAGES } from './config.js';

function makeBoard(rows) {
    return Array.from({ length: rows }, () =>
        Array(5).fill(null).map(() => ({ letter: '', status: '' }))
    );
}

export function makeStageState(stageIndex) {
    const stage = STAGES[stageIndex];
    return {
        stageIndex,
        currentRow: 0,
        currentCol: 0,
        boards: Array.from({ length: stage.wordCount }, () => makeBoard(stage.maxAttempts)),
        solved: Array(stage.wordCount).fill(false),
        keyStates: {},
        gameOver: false,
        allSolved: false,
        scoreSaved: false,
        words: Array(stage.wordCount).fill(''),
    };
}

export const state = {
    date: '',
    playerName: '',
    currentStage: 0,
    stages: [],
};
