const API_URL = 'https://hp-api.onrender.com/api/characters';

let allCharacters = [];
let charState = {
    search: '',
    filter: 'all',
    sort: 'name'
};

const HOUSE_LABELS = {
    Gryffindor: { sr: 'Grifindor', en: 'Gryffindor' },
    Slytherin: { sr: 'Sliterin', en: 'Slytherin' },
    Ravenclaw: { sr: 'Rejvenklo', en: 'Ravenclaw' },
    Hufflepuff: { sr: 'Haflpaf', en: 'Hufflepuff' }
};

function lang() {
    return localStorage.getItem('lang') || 'sr';
}

function tr(key) {
    const l = lang();
    return (translations[l] && translations[l][key]) || key;
}

function houseLabel(house) {
    if (!house) return tr('char-no-house');
    const entry = HOUSE_LABELS[house];
    return entry ? entry[lang()] : house;
}

function houseClass(house) {
    return house ? 'house-' + house.toLowerCase() : 'house-none';
}

function genderLabel(gender) {
    if (gender === 'male') return tr('char-gender-male');
    if (gender === 'female') return tr('char-gender-female');
    return gender || '—';
}

function aliveLabel(alive) {
    return alive ? tr('char-alive') : tr('char-deceased');
}

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function loadCharacters() {
    const grid = document.getElementById('charactersGrid');
    const loading = document.getElementById('charLoading');
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        // Keep only named characters, prioritise those with a portrait.
        allCharacters = (Array.isArray(data) ? data : [])
            .filter(c => c && c.name)
            .sort((a, b) => (b.image ? 1 : 0) - (a.image ? 1 : 0));
        loading.classList.add('d-none');
        render();
    } catch (err) {
        console.error('Failed to load characters from API', err);
        loading.classList.add('d-none');
        grid.innerHTML =
            `<div class="col-12"><div class="no-results">${escapeHtml(tr('char-load-error'))}</div></div>`;
        document.getElementById('resultCount').textContent = '0';
    }
}

function applyFilters() {
    const q = charState.search.trim().toLowerCase();
    let list = allCharacters.slice();

    if (charState.filter !== 'all') {
        list = list.filter(c => c.house === charState.filter);
    }

    if (q) {
        list = list.filter(c => {
            const names = [c.name].concat(c.alternate_names || []).join(' ').toLowerCase();
            const actor = (c.actor || '').toLowerCase();
            return names.includes(q) || actor.includes(q);
        });
    }

    if (charState.sort === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (charState.sort === 'house') {
        list.sort((a, b) =>
            (a.house || 'zzz').localeCompare(b.house || 'zzz') || a.name.localeCompare(b.name));
    }

    return list;
}

function avatarHTML(c) {
    if (c.image) {
        return `<img class="char-card-avatar" src="${escapeHtml(c.image)}" alt="${escapeHtml(c.name)}"
            loading="lazy" onerror="this.parentNode.innerHTML='<span class=&quot;char-avatar-fallback&quot;>${escapeHtml(initials(c.name))}</span>'">`;
    }
    return `<span class="char-avatar-fallback">${escapeHtml(initials(c.name))}</span>`;
}

function initials(name) {
    return name.split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
}

function characterCardHTML(c) {
    const sub = [c.species ? capitalize(c.species) : '', c.ancestry ? capitalize(c.ancestry) : '']
        .filter(Boolean).join(' · ');
    return `
        <div class="col-sm-6 col-lg-4">
            <div class="char-card ${houseClass(c.house)}" onclick="openCharModal('${escapeHtml(c.id)}')">
                <div class="char-card-avatar-wrap">${avatarHTML(c)}</div>
                <div class="char-card-body">
                    <h3 class="char-card-name">${escapeHtml(c.name)}</h3>
                    <span class="house-badge ${houseClass(c.house)}">${escapeHtml(houseLabel(c.house))}</span>
                    <p class="char-card-sub">${escapeHtml(sub || '—')}</p>
                </div>
            </div>
        </div>
    `;
}

function render() {
    const list = applyFilters();
    const grid = document.getElementById('charactersGrid');
    const noResults = document.getElementById('noResults');
    document.getElementById('resultCount').textContent = list.length;

    if (list.length === 0) {
        grid.innerHTML = '';
        noResults.classList.remove('d-none');
    } else {
        noResults.classList.add('d-none');
        grid.innerHTML = list.map(characterCardHTML).join('');
    }
}

function onCharSearchChange() {
    charState.search = document.getElementById('searchInput').value;
    render();
}

function onCharSortChange() {
    charState.sort = document.getElementById('sortSelect').value;
    render();
}

function setCharFilter(filter) {
    charState.filter = filter;
    document.querySelectorAll('#filterPills .filter-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-filter') === filter);
    });
    render();
}

function resetCharFilters() {
    charState.search = '';
    charState.filter = 'all';
    charState.sort = 'name';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortSelect').value = 'name';
    document.querySelectorAll('#filterPills .filter-pill').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-filter') === 'all');
    });
    render();
}

function detailRow(labelKey, value) {
    if (!value) return '';
    return `
        <div class="char-detail-row">
            <span class="char-detail-label">${escapeHtml(tr(labelKey))}</span>
            <span class="char-detail-value">${escapeHtml(value)}</span>
        </div>`;
}

function openCharModal(id) {
    const c = allCharacters.find(x => x.id === id);
    if (!c) return;

    const wand = c.wand && (c.wand.wood || c.wand.core || c.wand.length)
        ? [c.wand.wood && capitalize(c.wand.wood),
           c.wand.core,
           c.wand.length && (c.wand.length + '"')].filter(Boolean).join(', ')
        : '';

    document.getElementById('charModalAvatar').innerHTML = avatarHTML(c);
    document.getElementById('charModalName').textContent = c.name;

    const altNames = (c.alternate_names || []).join(', ');
    const altEl = document.getElementById('charModalAlt');
    altEl.textContent = altNames ? '"' + altNames + '"' : '';
    altEl.style.display = altNames ? '' : 'none';

    const badge = document.getElementById('charModalHouse');
    badge.textContent = houseLabel(c.house);
    badge.className = 'house-badge ' + houseClass(c.house);

    let rows = '';
    rows += detailRow('char-species', c.species ? capitalize(c.species) : '');
    rows += detailRow('char-gender', genderLabel(c.gender));
    rows += detailRow('char-ancestry', c.ancestry ? capitalize(c.ancestry) : '');
    rows += detailRow('char-dob', c.dateOfBirth);
    rows += detailRow('char-wand', wand);
    rows += detailRow('char-patronus', c.patronus ? capitalize(c.patronus) : '');
    rows += detailRow('char-actor', c.actor);
    rows += detailRow('char-status', aliveLabel(c.alive));
    document.getElementById('charModalDetails').innerHTML = rows;

    document.getElementById('charModal').classList.add('is-visible');
    document.body.style.overflow = 'hidden';
}

function closeCharModal() {
    document.getElementById('charModal').classList.remove('is-visible');
    document.body.style.overflow = '';
}

function closeCharModalOnBackdrop(e) {
    if (e.target.id === 'charModal') closeCharModal();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCharModal();
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#filterPills .filter-pill').forEach(pill => {
        pill.addEventListener('click', () => setCharFilter(pill.getAttribute('data-filter')));
    });
    loadCharacters();
});

document.addEventListener('languagechange', () => {
    if (allCharacters.length) render();
});
