/* ==========================================
   GUESS THE SONG — Lógica do Jogo
   ==========================================

   ⚙️  CONFIGURAÇÃO
   ─────────────────
   Se a API estiver rodando na MESMA origem (padrão Spring Boot),
   deixe API_BASE_URL vazio ''.

   Se quiser apontar para outro servidor, coloque o endereço completo.
   Exemplo: 'http://localhost:8080'  ou  'https://meu-site.com'
*/

const CONFIG = {
    API_BASE_URL:   '',        // '' = mesma origem do site
    QUESTION_TIME:  30,        // segundos por pergunta
    TOTAL_QUESTIONS: 10,
    FEEDBACK_DELAY: 2000,      // ms para avançar após responder
};

/* ==========================================
   PLAYLISTS — Mapeamento amigável
   ========================================== */

const PLAYLISTS = [
    { id: 'WORLD',       name: 'World Music',     icon: '🌍' },
    { id: 'DOSE_POP',    name: 'Dose de Pop',      icon: '✨' },
    { id: 'POP_BRASIL',  name: 'Pop Brasil',       icon: '🇧🇷' },
    { id: 'POP_OLD',     name: 'Pop Clássico',     icon: '📻' },
    { id: 'POP_90',      name: 'Pop Anos 90',      icon: '💿' },
    { id: 'POP_00',      name: 'Pop Anos 2000',    icon: '📱' },
    { id: 'ALTERNATIVO', name: 'Alternativo',      icon: '🎸' },
    { id: 'DANCE',       name: 'Dance',            icon: '🕺' },
    { id: 'ROCK',        name: 'Rock',             icon: '🎵' },
    { id: 'HARD_ROCK',   name: 'Hard Rock',        icon: '🤘' },
    { id: 'METAL',       name: 'Metal',            icon: '💀' },
    { id: 'METAL_80',    name: 'Metal Anos 80',    icon: '🔥' },
    { id: 'METAL_90',    name: 'Metal Anos 90',    icon: '⚡' },
    { id: 'METAL_00',    name: 'Metal Anos 2000',  icon: '🌪️' },
    { id: 'METAL_10',    name: 'Metal Anos 2010',  icon: '🎶' },
    { id: 'METAL_HITS',  name: 'Metal Hits',       icon: '🏆' },
];

/* ==========================================
   ESTADO GLOBAL DO JOGO
   ========================================== */

let state = {
    playerName:       '',
    selectedPlaylist: null,
    searchQuery:      null,
    questions:        [],
    currentIndex:     0,
    score:            0,
    correctCount:     0,
    wrongCount:       0,
    timerInterval:    null,
    timeLeft:         CONFIG.QUESTION_TIME,
    answered:         false,
    audioPlaying:     false,
};

/* ==========================================
   GERENCIAMENTO DE TELAS
   ========================================== */

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
}

/* ==========================================
   TELA DE BOAS-VINDAS
   ========================================== */

function initWelcomeScreen() {
    // Renderiza o grid de gêneros
    const grid = document.getElementById('genre-grid');
    grid.innerHTML = '';

    PLAYLISTS.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'genre-card';
        card.dataset.id = pl.id;
        card.innerHTML = `
            <span class="genre-icon">${pl.icon}</span>
            <span>${pl.name}</span>
        `;
        card.addEventListener('click', () => selectGenre(pl.id));
        grid.appendChild(card);
    });

    // Valida formulário quando o nome muda
    document.getElementById('player-name').addEventListener('input', validatePlayForm);

    // Campo de busca livre com debounce
    let searchDebounce = null;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        const query = e.target.value.trim();
        if (query.length === 0) {
            state.searchQuery = null;
            setSearchStatus('');
            validatePlayForm();
            return;
        }
        if (query.length < 2) return;
        setSearchStatus('🔍 Buscando...');
        searchDebounce = setTimeout(() => {
            state.searchQuery = query;
            state.selectedPlaylist = null;
            document.querySelectorAll('.genre-card').forEach(c => c.classList.remove('selected'));
            setSearchStatus(`✅ Quiz para: <strong>${escapeHtml(query)}</strong>`);
            validatePlayForm();
        }, 600);
    });

    // Botão play
    document.getElementById('btn-play').addEventListener('click', startGame);

    // Mini ranking
    loadWelcomeRanking();
    document.getElementById('btn-welcome-ranking').addEventListener('click', () => openRankingFromWelcome());
}

function selectGenre(id) {
    state.selectedPlaylist = id;
    state.searchQuery = null;
    document.getElementById('search-input').value = '';
    setSearchStatus('');
    document.querySelectorAll('.genre-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.id === id);
    });
    validatePlayForm();
}

function validatePlayForm() {
    const name = document.getElementById('player-name').value.trim();
    const btn  = document.getElementById('btn-play');
    btn.disabled = !(name.length >= 2 && (state.selectedPlaylist || state.searchQuery));
}

function setSearchStatus(html) {
    document.getElementById('search-status').innerHTML = html;
}

/* ==========================================
   INICIAR JOGO — BUSCA AS PERGUNTAS NA API
   ========================================== */

async function startGame() {
    state.playerName = document.getElementById('player-name').value.trim();
    showScreen('screen-loading');
    stopAudio();

    try {
        const url = state.searchQuery
            ? `${CONFIG.API_BASE_URL}/api/quiz/v1/search?q=${encodeURIComponent(state.searchQuery)}`
            : `${CONFIG.API_BASE_URL}/api/quiz/v1/${state.selectedPlaylist}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`O servidor retornou erro ${response.status}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error('A API não retornou perguntas. Tente outro gênero.');
        }

        // Reseta estado para nova partida
        state.questions     = data.results;
        state.currentIndex  = 0;
        state.score         = 0;
        state.correctCount  = 0;
        state.wrongCount    = 0;

        loadQuestion();
        showScreen('screen-quiz');

    } catch (err) {
        showScreen('screen-welcome');
        alert(
            `❌ Erro ao carregar as músicas!\n\n` +
            `${err.message}\n\n` +
            `Verifique se a API está rodando e tente novamente.`
        );
    }
}

/* ==========================================
   CARREGAR PERGUNTA
   ========================================== */

function loadQuestion() {
    // Fim do quiz
    if (state.currentIndex >= state.questions.length) {
        showResults();
        return;
    }

    const q = state.questions[state.currentIndex];
    state.answered = false;
    state.timeLeft = CONFIG.QUESTION_TIME;

    // Atualiza header
    document.getElementById('display-player-name').textContent = state.playerName;
    document.getElementById('display-score').textContent       = state.score;
    document.getElementById('display-question-num').textContent = state.currentIndex + 1;

    // Barra de progresso
    const pct = ((state.currentIndex + 1) / CONFIG.TOTAL_QUESTIONS) * 100;
    document.getElementById('progress-bar').style.width = `${pct}%`;

    // Texto da pergunta
    document.getElementById('question-text').textContent =
        `Questão ${state.currentIndex + 1} — Qual é essa música?`;

    // Monta e embaralha as 4 respostas
    const allAnswers = shuffle([q.correct_answer, ...q.incorrect_answers]);
    const letters    = ['A', 'B', 'C', 'D'];
    const container  = document.getElementById('options-container');
    container.innerHTML = '';

    allAnswers.forEach((answer, index) => {
        const btn = document.createElement('button');
        btn.className       = 'option-btn';
        btn.dataset.answer  = answer;
        btn.innerHTML = `
            <span class="option-letter">${letters[index]}</span>
            <span>${answer}</span>
        `;
        btn.addEventListener('click', () => handleAnswer(btn, answer, q.correct_answer));
        container.appendChild(btn);
    });

    // Carrega o áudio e tenta autoplay
    loadAudio(q.mp3_link, true);

    // Inicia o timer
    startTimer();
}

/* ==========================================
   PROCESSAR RESPOSTA
   ========================================== */

function handleAnswer(clickedBtn, selected, correct) {
    if (state.answered) return;
    state.answered = true;

    stopTimer();
    pauseAudio();

    const isCorrect = (selected === correct);

    // Marca visual de todas as opções
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.answer === correct) {
            btn.classList.add('correct');
        } else if (btn === clickedBtn && !isCorrect) {
            btn.classList.add('wrong');
        }
    });

    // Pontuação: 100 base + (tempo restante × 5)  →  mesma fórmula da API Java
    if (isCorrect) {
        const points   = 100 + (state.timeLeft * 5);
        state.score   += points;
        state.correctCount++;
        showFeedback(true, correct, false, points);
    } else {
        state.wrongCount++;
        showFeedback(false, correct, false, 0);
    }

    setTimeout(() => {
        hideFeedback();
        state.currentIndex++;
        loadQuestion();
    }, CONFIG.FEEDBACK_DELAY);
}

/* ==========================================
   TIMER CIRCULAR
   ========================================== */

function startTimer() {
    const circle       = document.getElementById('timer-circle');
    const display      = document.getElementById('timer-display');
    const circumference = 283; // 2π × 45

    function render() {
        const ratio  = state.timeLeft / CONFIG.QUESTION_TIME;
        circle.style.strokeDashoffset = circumference * (1 - ratio);
        display.textContent = state.timeLeft;

        if (state.timeLeft <= 5) {
            circle.style.stroke  = 'var(--error)';
            display.style.color  = 'var(--error)';
        } else if (state.timeLeft <= 10) {
            circle.style.stroke  = 'var(--warning)';
            display.style.color  = 'var(--warning)';
        } else {
            circle.style.stroke  = 'var(--accent)';
            display.style.color  = 'var(--text-primary)';
        }
    }

    render();

    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        render();

        if (state.timeLeft <= 0) {
            stopTimer();
            handleTimeUp();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
}

function handleTimeUp() {
    if (state.answered) return;
    state.answered = true;

    state.wrongCount++;
    pauseAudio();

    const correct = state.questions[state.currentIndex].correct_answer;

    // Destaca a resposta correta
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.answer === correct) btn.classList.add('correct');
    });

    showFeedback(false, correct, true, 0);

    setTimeout(() => {
        hideFeedback();
        state.currentIndex++;
        loadQuestion();
    }, CONFIG.FEEDBACK_DELAY);
}

/* ==========================================
   FEEDBACK (OVERLAY CORRETO/ERRADO)
   ========================================== */

function showFeedback(isCorrect, correctAnswer, timedOut, points) {
    const overlay = document.getElementById('feedback-overlay');
    const icon    = document.getElementById('feedback-icon');
    const text    = document.getElementById('feedback-text');
    const answer  = document.getElementById('feedback-answer');

    if (timedOut) {
        icon.textContent   = '⏰';
        icon.className     = 'feedback-icon error';
        text.textContent   = 'Tempo esgotado!';
        text.className     = 'feedback-text error';
        answer.textContent = `Resposta: ${correctAnswer}`;
    } else if (isCorrect) {
        icon.textContent   = '✓';
        icon.className     = 'feedback-icon success';
        text.textContent   = `+${points} pontos!`;
        text.className     = 'feedback-text success';
        answer.textContent = '';
    } else {
        icon.textContent   = '✗';
        icon.className     = 'feedback-icon error';
        text.textContent   = 'Errado!';
        text.className     = 'feedback-text error';
        answer.textContent = `Resposta: ${correctAnswer}`;
    }

    overlay.classList.remove('hidden');
}

function hideFeedback() {
    document.getElementById('feedback-overlay').classList.add('hidden');
}

/* ==========================================
   PLAYER DE ÁUDIO
   ========================================== */

function loadAudio(url, autoplay = false) {
    const audio = document.getElementById('audio-player');
    const btn   = document.getElementById('btn-toggle-audio');
    const bars  = document.getElementById('audio-bars');

    audio.pause();
    audio.src = url;

    state.audioPlaying = false;
    btn.textContent = '▶';
    btn.classList.remove('pulse-play');
    bars.classList.remove('playing');

    audio.onended = () => {
        state.audioPlaying = false;
        btn.textContent = '▶';
        bars.classList.remove('playing');
    };

    btn.onclick = toggleAudio;

    if (autoplay) {
        // Tenta autoplay assim que houver dados suficientes para reproduzir
        audio.addEventListener('canplay', () => {
            audio.play()
                .then(() => {
                    state.audioPlaying = true;
                    btn.textContent = '⏸';
                    btn.classList.remove('pulse-play');
                    bars.classList.add('playing');
                })
                .catch(() => {
                    // Navegador bloqueou o autoplay — pulsa o botão para avisar o usuário
                    btn.classList.add('pulse-play');
                });
        }, { once: true });
        audio.load();
    } else {
        audio.load();
    }
}

function toggleAudio() {
    const audio = document.getElementById('audio-player');
    const btn   = document.getElementById('btn-toggle-audio');
    const bars  = document.getElementById('audio-bars');

    if (state.audioPlaying) {
        audio.pause();
        state.audioPlaying = false;
        btn.textContent = '▶';
        bars.classList.remove('playing');
    } else {
        audio.play()
            .then(() => {
                state.audioPlaying = true;
                btn.textContent = '⏸';
                bars.classList.add('playing');
            })
            .catch(() => {
                // Navegador pode bloquear auto-play — o usuário precisa interagir antes
            });
    }
}

function pauseAudio() {
    const audio = document.getElementById('audio-player');
    if (!audio.paused) {
        audio.pause();
        state.audioPlaying = false;
        document.getElementById('btn-toggle-audio').textContent = '▶';
        document.getElementById('audio-bars').classList.remove('playing');
    }
}

function stopAudio() {
    const audio = document.getElementById('audio-player');
    audio.pause();
    audio.src = '';
    state.audioPlaying = false;
}

/* ==========================================
   TELA DE RESULTADOS
   ========================================== */

function showResults() {
    stopTimer();
    stopAudio();
    showScreen('screen-results');

    const accuracy = Math.round((state.correctCount / CONFIG.TOTAL_QUESTIONS) * 100);

    document.getElementById('results-player-name').textContent =
        `${state.playerName}, você terminou!`;
    document.getElementById('results-score').textContent  = state.score;
    document.getElementById('stat-correct').textContent   = state.correctCount;
    document.getElementById('stat-wrong').textContent     = state.wrongCount;
    document.getElementById('stat-accuracy').textContent  = `${accuracy}%`;

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

    // Salva pontuação no banco (não bloqueia a tela caso falhe)
    saveScore();

    document.getElementById('btn-play-again').onclick    = () => startGame();
    document.getElementById('btn-change-genre').onclick  = () => showScreen('screen-welcome');
    document.getElementById('btn-view-ranking').onclick  = () => openRanking();
    document.getElementById('btn-share').onclick         = () => shareResult();
}

/* ==========================================
   SALVAR PONTUAÇÃO NA API
   ========================================== */

async function saveScore() {
    const genreName = state.searchQuery
        ? state.searchQuery
        : (PLAYLISTS.find(p => p.id === state.selectedPlaylist)?.name ?? state.selectedPlaylist);

    try {
        await fetch(`${CONFIG.API_BASE_URL}/api/score/v1`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerName:   state.playerName,
                totalScore:   state.score,
                correctCount: state.correctCount,
                genre:        genreName,
            }),
        });
    } catch (_) {
        // Falha silenciosa — não interrompe a experiência
    }
}

/* ==========================================
   RANKING
   ========================================== */

async function loadWelcomeRanking() {
    const list = document.getElementById('welcome-ranking-list');
    try {
        const res    = await fetch(`${CONFIG.API_BASE_URL}/api/score/v1/top`);
        const scores = await res.json();

        if (!scores || scores.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:var(--text-muted);font-size:0.82rem;padding:8px 0">Ainda não há pontuações. Seja o primeiro!</p>';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        list.innerHTML = scores.slice(0, 5).map((s, i) => `
            <div class="welcome-rank-item">
                <span class="welcome-rank-pos">${medals[i] ?? i + 1}</span>
                <span class="welcome-rank-name">${escapeHtml(s.playerName)}</span>
                <span class="welcome-rank-genre">${escapeHtml(s.genre)}</span>
                <span class="welcome-rank-score">${s.totalScore}</span>
            </div>
        `).join('');
    } catch (_) {
        list.innerHTML = '';
    }
}

async function openRankingFromWelcome() {
    showScreen('screen-ranking');
    const list    = document.getElementById('ranking-list');
    const loading = document.getElementById('ranking-loading');
    list.innerHTML = '';
    loading.classList.remove('hidden');
    try {
        const res    = await fetch(`${CONFIG.API_BASE_URL}/api/score/v1/top`);
        const scores = await res.json();
        loading.classList.add('hidden');
        renderRanking(scores);
    } catch (_) {
        loading.classList.add('hidden');
        list.innerHTML = '<p class="ranking-empty">Não foi possível carregar o ranking.</p>';
    }
    document.getElementById('btn-back-ranking').onclick  = () => showScreen('screen-welcome');
    document.getElementById('btn-ranking-play').onclick  = () => showScreen('screen-welcome');
}

async function openRanking() {
    showScreen('screen-ranking');

    const list    = document.getElementById('ranking-list');
    const loading = document.getElementById('ranking-loading');

    list.innerHTML = '';
    loading.classList.remove('hidden');

    try {
        const res    = await fetch(`${CONFIG.API_BASE_URL}/api/score/v1/top`);
        const scores = await res.json();
        loading.classList.add('hidden');
        renderRanking(scores);
    } catch (_) {
        loading.classList.add('hidden');
        list.innerHTML = '<p class="ranking-empty">Não foi possível carregar o ranking.</p>';
    }

    document.getElementById('btn-back-ranking').onclick  = () => showScreen('screen-results');
    document.getElementById('btn-ranking-play').onclick  = () => {
        showScreen('screen-welcome');
    };
}

function renderRanking(scores) {
    const list = document.getElementById('ranking-list');

    if (!scores || scores.length === 0) {
        list.innerHTML = '<p class="ranking-empty">Ainda não há pontuações. Seja o primeiro! 🎵</p>';
        return;
    }

    const medals = ['🥇', '🥈', '🥉'];

    list.innerHTML = scores.map((s, i) => {
        const position    = i + 1;
        const medal       = medals[i] ?? `<span class="rank-num">${position}</span>`;
        const isMe        = s.playerName === state.playerName && s.totalScore === state.score;
        const date        = s.createdAt ? s.createdAt.substring(0, 10) : '';
        const dateFormatted = date ? date.split('-').reverse().join('/') : '';

        return `
            <div class="ranking-item ${isMe ? 'ranking-item--me' : ''}">
                <span class="rank-medal">${medal}</span>
                <div class="rank-info">
                    <span class="rank-name">${escapeHtml(s.playerName)}</span>
                    <span class="rank-genre">${escapeHtml(s.genre)} · ${dateFormatted}</span>
                </div>
                <div class="rank-right">
                    <span class="rank-score">${s.totalScore}</span>
                    <span class="rank-correct">${s.correctCount}/10</span>
                </div>
            </div>
        `;
    }).join('');
}

/* ==========================================
   COMPARTILHAR
   ========================================== */

function shareResult() {
    const genreName = state.searchQuery
        ? state.searchQuery
        : (PLAYLISTS.find(p => p.id === state.selectedPlaylist)?.name ?? state.selectedPlaylist);
    const accuracy  = Math.round((state.correctCount / CONFIG.TOTAL_QUESTIONS) * 100);
    const trophy    = document.getElementById('results-trophy').textContent;

    // Preenche o card
    document.getElementById('share-trophy').textContent   = trophy;
    document.getElementById('share-name').textContent     = state.playerName;
    document.getElementById('share-score').textContent    = state.score;
    document.getElementById('share-correct').textContent  = `${state.correctCount}/10`;
    document.getElementById('share-accuracy').textContent = `${accuracy}%`;
    document.getElementById('share-genre').textContent    = genreName;

    // Abre o modal
    const modal = document.getElementById('share-modal');
    modal.classList.remove('hidden');

    // Fechar ao clicar no backdrop
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

    // Compartilhar nas redes sociais (nativo mobile)
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

            // Tenta compartilhar com imagem via Web Share API (mobile nativo)
            if (navigator.canShare) {
                const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
                const file = new File([blob], 'guess-the-song.png', { type: 'image/png' });

                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: 'Guess The Song 🎵',
                        text: viralText,
                    });
                    btn.disabled = false;
                    btn.textContent = '📤 Compartilhar';
                    return;
                }
            }

            // Fallback: tenta compartilhar só texto (sem imagem)
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

    // Copiar texto para área de transferência
    document.getElementById('btn-share-text').onclick = async () => {
        try {
            await navigator.clipboard.writeText(viralText);
            showToast('✅ Copiado! Cole no WhatsApp, Instagram ou onde quiser.');
        } catch (_) {
            showToast('❌ Não foi possível copiar.');
        }
    };
}

function closeShareModal() {
    document.getElementById('share-modal').classList.add('hidden');
}

/* ==========================================
   TOAST
   ========================================== */

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.classList.add('hidden'), 400);
    }, 3000);
}

/* ==========================================
   UTILITÁRIO: Escapar HTML
   ========================================== */

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ==========================================
   UTILITÁRIO: Embaralhar array
   ========================================== */

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ==========================================
   INICIALIZAÇÃO
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initWelcomeScreen();
});
