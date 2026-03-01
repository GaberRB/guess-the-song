import { PLAYLISTS } from './config.js';
import { state } from './state.js';
import { escapeHtml } from './utils.js';
import { startGame } from './quiz.js';
import { loadWelcomeRanking, openRankingFromWelcome } from './ranking.js';

export function initWelcomeScreen() {
    const grid = document.getElementById('genre-grid');
    grid.innerHTML = '';

    PLAYLISTS.forEach(pl => {
        const card = document.createElement('div');
        card.className  = 'genre-card';
        card.dataset.id = pl.id;
        card.innerHTML  = `
            <span class="genre-icon">${pl.icon}</span>
            <span>${pl.name}</span>
        `;
        card.addEventListener('click', () => selectGenre(pl.id));
        grid.appendChild(card);
    });

    document.getElementById('player-name').addEventListener('input', validatePlayForm);

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

    document.getElementById('btn-play').addEventListener('click', startGame);

    loadWelcomeRanking();
    document.getElementById('btn-welcome-ranking').addEventListener('click', () => openRankingFromWelcome());
}

export function selectGenre(id) {
    state.selectedPlaylist = id;
    state.searchQuery = null;
    document.getElementById('search-input').value = '';
    setSearchStatus('');
    document.querySelectorAll('.genre-card').forEach(card => {
        card.classList.toggle('selected', card.dataset.id === id);
    });
    validatePlayForm();
}

export function validatePlayForm() {
    const name = document.getElementById('player-name').value.trim();
    const btn  = document.getElementById('btn-play');
    btn.disabled = !(name.length >= 2 && (state.selectedPlaylist || state.searchQuery));
}

export function setSearchStatus(html) {
    document.getElementById('search-status').innerHTML = html;
}
