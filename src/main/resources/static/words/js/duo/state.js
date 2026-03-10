export const state = {
    date: '',
    playerName: '',
    currentRow: 0,
    currentCol: 0,
    // Two independent boards
    board1: Array.from({ length: 6 }, () => Array(5).fill(null).map(() => ({ letter: '', status: '' }))),
    board2: Array.from({ length: 6 }, () => Array(5).fill(null).map(() => ({ letter: '', status: '' }))),
    keyStates: {},
    gameOver: false,
    solved1: false,
    solved2: false,
    scoreSaved: false,
    word1: '',
    word2: '',
};
