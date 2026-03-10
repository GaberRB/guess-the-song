export const CONFIG = {
    API: '',
    WORD_LENGTH: 5,
    MAX_ATTEMPTS: 6,
};

// Stage definitions: { id, name, wordCount, maxAttempts, emoji }
export const STAGES = [
    { id: 'solo',     name: 'Solo',     wordCount: 1, maxAttempts: 6,  emoji: '🟩'          },
    { id: 'duo',      name: 'Duo',      wordCount: 2, maxAttempts: 7,  emoji: '🟩🟩'        },
    { id: 'quarteto', name: 'Quarteto', wordCount: 4, maxAttempts: 9,  emoji: '🟩🟩🟩🟩'    },
    { id: 'desafio',  name: 'Desafio',  wordCount: 6, maxAttempts: 12, emoji: '🟩🟩🟩🟩🟩🟩'},
];
