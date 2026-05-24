let allSpells = [];
let state = {
    search: '',
    filter: 'all',
    sort: 'name'
};

async function loadSpells() {
    try {
        const res = await fetch('spells.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        allSpells = data.spells || [];
        render();
    } catch (err) {
        console.error('Failed to load spells.json', err);
        document.getElementById('spellsGrid').innerHTML =
            '<div class="col-12"><div class="no-results">spells.json failed to load.</div></div>';
    }
}

function tr(key) {
    const lang = localStorage.getItem('lang') || 'sr';
    return (translations[lang] && translations[lang][key]) || key;
}

function getEffect(spell) {
    const lang = localStorage.getItem('lang') || 'sr';
    return lang === 'en' ? spell.effect_en : spell.effect_sr;
}

function getOrigin(spell) {
    const lang = localStorage.getItem('lang') || 'sr';
    return lang === 'en' ? spell.origin_en : spell.origin_sr;
}

function difficultyDots(level) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += `<span class="dot${i <= level ? ' filled' : ''}"></span>`;
    }
    return html;
}

function applyFilters() {
    const q = state.search.trim().toLowerCase();
    let list = allSpells.slice();

    if (state.filter !== 'all') {
        list = list.filter(s => s.type === state.filter);
    }

    if (q) {
        list = list.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.incantation.toLowerCase().includes(q) ||
            getEffect(s).toLowerCase().includes(q)
        );
    }

    if (state.sort === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (state.sort === 'difficulty') {
        list.sort((a, b) => a.difficulty - b.difficulty || a.name.localeCompare(b.name));
    }

    return list;
}

function spellCardHTML(spell) {
    const typeLabel = tr('type-' + spell.type);
    return `
        <div class="col-md-6 col-lg-4">
            <div class="spell-card" onclick="openModal('${spell.id}')">
                <div class="spell-card-header">
                    <h3 class="spell-card-name">${escapeHtml(spell.name)}</h3>
                    <span class="spell-type-badge spell-type-${spell.type}">${escapeHtml(typeLabel)}</span>
                </div>
                <p class="spell-card-effect">${escapeHtml(getEffect(spell))}</p>
                <div class="spell-card-footer">
                    <span>${tr('spells-difficulty')}</span>
                    <span class="difficulty-dots">${difficultyDots(spell.difficulty)}</span>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function render() {
    const list = applyFilters();
    const grid = document.getElementById('spellsGrid');
    const noResults = document.getElementById('noResults');
    const count = document.getElementById('resultCount');

    count.textContent = list.length;

    if (list.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('d-none');
    } else {
        noResults.classList.add('d-none');
        grid.innerHTML = list.map(spellCardHTML).join('');
    }
}

function onSearchChange() {
    state.search = document.getElementById('searchInput').value;
    render();
}

function onSortChange() {
    state.sort = document.getElementById('sortSelect').value;
    render();
}

function setFilter(filter) {
    state.filter = filter;
    document.querySelectorAll('#filterPills .filter-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-filter') === filter);
    });
    render();
}

function resetFilters() {
    state.search = '';
    state.filter = 'all';
    state.sort = 'name';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'name';
    document.querySelectorAll('#filterPills .filter-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-filter') === 'all');
    });
    render();
}

function openModal(id) {
    const spell = allSpells.find(s => s.id === id);
    if (!spell) return;

    document.getElementById('modalName').textContent = spell.name;
    document.getElementById('modalIncantation').textContent = '"' + spell.incantation + '"';
    document.getElementById('modalEffect').textContent = getEffect(spell);
    document.getElementById('modalOrigin').textContent = getOrigin(spell);
    document.getElementById('modalCategory').textContent = tr('cat-' + spell.category);

    const badge = document.getElementById('modalTypeBadge');
    badge.textContent = tr('type-' + spell.type);
    badge.className = 'spell-type-badge spell-type-' + spell.type;

    document.getElementById('modalDifficulty').innerHTML = difficultyDots(spell.difficulty);

    document.getElementById('spellModal').classList.add('is-visible');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('spellModal').classList.remove('is-visible');
    document.body.style.overflow = '';
}

function closeModalOnBackdrop(e) {
    if (e.target.id === 'spellModal') closeModal();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#filterPills .filter-pill').forEach(pill => {
        pill.addEventListener('click', () => setFilter(pill.getAttribute('data-filter')));
    });
    loadSpells();
});

document.addEventListener('languagechange', () => {
    if (allSpells.length) render();
});
