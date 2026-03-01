/* ==========================================
   CRIAR QUIZ — Entry point (ES Module)
   ========================================== */

const API = '';

let selectedTracks = [];   // { title, artist, previewUrl }
let adminQuizId    = null;
let adminToken     = null;

/* ==========================================
   INICIALIZAÇÃO
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    adminQuizId  = params.get('admin');
    adminToken   = params.get('token');

    if (adminQuizId && adminToken) {
        loadEditMode();
    } else {
        initCreateMode();
    }
});

/* ==========================================
   MODO CRIAÇÃO
   ========================================== */

function initCreateMode() {
    showScreen('screen-create');

    document.getElementById('quiz-name').addEventListener('input', validateCreateForm);
    document.getElementById('creator-name').addEventListener('input', validateCreateForm);

    let debounce = null;
    document.getElementById('track-search').addEventListener('input', (e) => {
        clearTimeout(debounce);
        const q = e.target.value.trim();
        if (q.length < 2) {
            document.getElementById('search-results').classList.add('hidden');
            document.getElementById('track-search-status').innerHTML = '';
            return;
        }
        document.getElementById('track-search-status').innerHTML = '🔍 Buscando...';
        debounce = setTimeout(() => searchTracks(q, 'search-results', 'track-search-status', addTrack), 600);
    });

    document.getElementById('btn-create-quiz').addEventListener('click', createQuiz);
}

function validateCreateForm() {
    const name    = document.getElementById('quiz-name').value.trim();
    const creator = document.getElementById('creator-name').value.trim();
    const btn     = document.getElementById('btn-create-quiz');
    btn.disabled  = !(name.length >= 2 && creator.length >= 2 && selectedTracks.length === 10);
}

/* ==========================================
   BUSCA DE TRACKS
   ========================================== */

async function searchTracks(query, resultsId, statusId, onAdd) {
    try {
        const res    = await fetch(`${API}/api/quiz/v1/tracks?q=${encodeURIComponent(query)}`);
        const tracks = await res.json();
        document.getElementById(statusId).innerHTML = '';

        const container = document.getElementById(resultsId);
        if (!tracks || tracks.length === 0) {
            container.innerHTML = '<p class="criar-empty">Nenhuma música encontrada.</p>';
            container.classList.remove('hidden');
            return;
        }

        container.innerHTML = tracks.slice(0, 15).map((t) => `
            <div class="criar-result-item">
                <div class="criar-result-info">
                    <span class="criar-result-title">${escapeHtml(t.title)}</span>
                    <span class="criar-result-artist">${escapeHtml(t.artist)}</span>
                </div>
                <button class="criar-add-btn" onclick='handleAddClick(${JSON.stringify(t)}, "${resultsId}", "${statusId}")'>+</button>
            </div>
        `).join('');
        container.classList.remove('hidden');
    } catch (_) {
        document.getElementById(statusId).innerHTML = '❌ Erro na busca.';
    }
}

function handleAddClick(track, resultsId, statusId) {
    if (resultsId === 'edit-search-results') {
        addTrackEdit(track);
    } else {
        addTrack(track);
    }
}

/* ==========================================
   GERENCIAR LISTA DE TRACKS (CRIAÇÃO)
   ========================================== */

function addTrack(track) {
    if (selectedTracks.length >= 10) { showToast('Limite de 10 músicas atingido.'); return; }
    const dup = selectedTracks.find(t => t.title === track.title && t.artist === track.artist);
    if (dup) { showToast('Música já adicionada.'); return; }
    selectedTracks.push(track);
    renderTrackList();
    validateCreateForm();
}

function removeTrack(index) {
    selectedTracks.splice(index, 1);
    renderTrackList();
    validateCreateForm();
}

function renderTrackList() {
    const list    = document.getElementById('track-list');
    const counter = document.getElementById('track-counter');
    counter.textContent = `${selectedTracks.length}/10`;
    counter.className   = 'criar-counter' + (selectedTracks.length === 10 ? ' criar-counter--full' : '');

    if (selectedTracks.length === 0) {
        list.innerHTML = '<p class="criar-empty">Nenhuma música adicionada ainda.</p>';
        return;
    }
    list.innerHTML = selectedTracks.map((t, i) => `
        <div class="criar-track-item">
            <div class="criar-track-info">
                <span class="criar-track-title">${escapeHtml(t.title)}</span>
                <span class="criar-track-artist">${escapeHtml(t.artist)}</span>
            </div>
            <button class="criar-remove-btn" onclick="removeTrack(${i})">✕</button>
        </div>
    `).join('');
}

/* ==========================================
   CRIAR QUIZ
   ========================================== */

async function createQuiz() {
    const name    = document.getElementById('quiz-name').value.trim();
    const creator = document.getElementById('creator-name').value.trim();
    const btn     = document.getElementById('btn-create-quiz');

    btn.disabled    = true;
    btn.textContent = '⏳ Criando...';

    try {
        const res  = await fetch(`${API}/api/custom-quiz/v1`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ name, creatorName: creator, tracks: selectedTracks }),
        });
        const data = await res.json();

        const base      = window.location.origin;
        const shareLink = `${base}/?quiz=${data.quizId}`;
        const adminLink = `${base}/criar?admin=${data.quizId}&token=${data.adminToken}`;

        document.getElementById('share-link').value = shareLink;
        document.getElementById('admin-link').value = adminLink;

        document.getElementById('btn-share-quiz').onclick = () => {
            const text = `🎵 Testa seus conhecimentos no quiz "${name}"!\n👉 ${shareLink}`;
            if (navigator.share) {
                navigator.share({ title: name, text, url: shareLink }).catch(() => {});
            } else {
                navigator.clipboard.writeText(shareLink);
                showToast('✅ Link copiado!');
            }
        };

        showScreen('screen-success');
    } catch (_) {
        showToast('❌ Erro ao criar o quiz. Tente novamente.');
        btn.disabled    = false;
        btn.textContent = '🎮 Criar Quiz';
    }
}

/* ==========================================
   MODO EDIÇÃO
   ========================================== */

async function loadEditMode() {
    showScreen('screen-edit');

    try {
        const res  = await fetch(`${API}/api/custom-quiz/v1/${adminQuizId}`);
        if (res.status === 410) { showToast('❌ Este quiz expirou.'); return; }
        const quiz = await res.json();

        document.getElementById('edit-quiz-name').textContent    = quiz.name;
        document.getElementById('edit-quiz-creator').textContent = `Criado por ${quiz.creatorName} · expira em ${formatDate(quiz.expiresAt)}`;

        await loadEditTracks();
    } catch (_) {
        showToast('❌ Não foi possível carregar o quiz.');
    }

    let debounce = null;
    document.getElementById('edit-track-search').addEventListener('input', (e) => {
        clearTimeout(debounce);
        const q = e.target.value.trim();
        if (q.length < 2) {
            document.getElementById('edit-search-results').classList.add('hidden');
            document.getElementById('edit-search-status').innerHTML = '';
            return;
        }
        document.getElementById('edit-search-status').innerHTML = '🔍 Buscando...';
        debounce = setTimeout(() => searchTracks(q, 'edit-search-results', 'edit-search-status', addTrackEdit), 600);
    });
}

async function loadEditTracks() {
    const list    = document.getElementById('edit-track-list');
    const counter = document.getElementById('edit-track-counter');
    try {
        const res    = await fetch(`${API}/api/custom-quiz/v1/${adminQuizId}/tracks`, {
            headers: { 'X-Admin-Token': adminToken },
        });
        const tracks = await res.json();
        counter.textContent = `${tracks.length}/10`;

        list.innerHTML = tracks.map(t => `
            <div class="criar-track-item">
                <div class="criar-track-info">
                    <span class="criar-track-title">${escapeHtml(t.title)}</span>
                    <span class="criar-track-artist">${escapeHtml(t.artist)}</span>
                </div>
                <button class="criar-remove-btn" onclick="removeTrackEdit(${t.id})">✕</button>
            </div>
        `).join('');
    } catch (_) {
        list.innerHTML = '<p class="criar-empty">Erro ao carregar músicas.</p>';
    }
}

async function addTrackEdit(track) {
    const status = document.getElementById('edit-save-status');
    status.innerHTML = '⏳ Adicionando...';
    try {
        await fetch(`${API}/api/custom-quiz/v1/${adminQuizId}/track`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminToken },
            body:    JSON.stringify(track),
        });
        status.innerHTML = '';
        await loadEditTracks();
        showToast('✅ Música adicionada!');
    } catch (_) {
        status.innerHTML = '❌ Erro ao adicionar.';
    }
}

async function removeTrackEdit(trackId) {
    const status = document.getElementById('edit-save-status');
    status.innerHTML = '⏳ Removendo...';
    try {
        await fetch(`${API}/api/custom-quiz/v1/${adminQuizId}/track/${trackId}`, {
            method:  'DELETE',
            headers: { 'X-Admin-Token': adminToken },
        });
        status.innerHTML = '';
        await loadEditTracks();
        showToast('✅ Música removida!');
    } catch (_) {
        status.innerHTML = '❌ Erro ao remover.';
    }
}

/* ==========================================
   UTILITÁRIOS
   ========================================== */

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
}

function copyLink(inputId) {
    const input = document.getElementById(inputId);
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => showToast('✅ Copiado!'));
}

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

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDate(isoStr) {
    if (!isoStr) return '';
    return isoStr.substring(0, 10).split('-').reverse().join('/');
}

// Expõe funções usadas em onclick inline no HTML
window.removeTrack     = removeTrack;
window.removeTrackEdit = removeTrackEdit;
window.handleAddClick  = handleAddClick;
window.copyLink        = copyLink;
