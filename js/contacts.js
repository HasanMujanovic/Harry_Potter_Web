const PATTERNS = {
    name: /^[A-Za-zÀ-ÖØ-öø-ÿČčĆćŠšŽžĐđ]{2,50}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    message: /^[\s\S]{10,1000}$/
};

const validationMsgs = {
    sr: {
        name: { empty: 'Ime je obavezno.', invalid: 'Ime mora imati 2–50 slova, bez brojeva.', valid: '✓ Ispravno' },
        surname: { empty: 'Prezime je obavezno.', invalid: 'Prezime mora imati 2–50 slova, bez brojeva.', valid: '✓ Ispravno' },
        email: { empty: 'Email adresa je obavezna.', invalid: 'Unesite ispravnu email adresu (npr. a@b.com).', valid: '✓ Ispravna adresa' },
        message: { empty: 'Poruka je obavezna.', invalid: 'Poruka mora imati najmanje 10 znakova.', valid: '✓ Poruka je u redu' },
    },
    en: {
        name: { empty: 'First name is required.', invalid: 'Name must be 2–50 letters, no numbers.', valid: '✓ Valid' },
        surname: { empty: 'Last name is required.', invalid: 'Surname must be 2–50 letters, no numbers.', valid: '✓ Valid' },
        email: { empty: 'Email address is required.', invalid: 'Enter a valid email address (e.g. a@b.com).', valid: '✓ Valid address' },
        message: { empty: 'Message is required.', invalid: 'Message must be at least 10 characters.', valid: '✓ Message looks good' },
    }
};

const tooltipHints = {
    sr: {
        'fg-name': { title: 'Ime', body: 'Unesite vaše ime. Minimalno 2 slova, bez brojeva ili specijalnih znakova.' },
        'fg-surname': { title: 'Prezime', body: 'Unesite vaše prezime. Minimalno 2 slova, bez brojeva ili specijalnih znakova.' },
        'fg-email': { title: 'Email adresa', body: 'Unesite valjanu email adresu u formatu: sova@hogvorts.uk' },
        'fg-message': { title: 'Poruka', body: 'Napišite poruku (10–1000 znakova). Opisite vaš upit što detaljnije.' },
    },
    en: {
        'fg-name': { title: 'First Name', body: 'Enter your first name. At least 2 letters, no numbers or special characters.' },
        'fg-surname': { title: 'Last Name', body: 'Enter your last name. At least 2 letters, no numbers or special characters.' },
        'fg-email': { title: 'Email Address', body: 'Enter a valid email address in the format: owl@hogwarts.uk' },
        'fg-message': { title: 'Message', body: 'Write your message (10–1000 characters). Describe your query in detail.' },
    }
};

function fieldKey(inputId) {
    if (inputId === 'contactName') return 'name';
    if (inputId === 'contactSurname') return 'surname';
    if (inputId === 'contactEmail') return 'email';
    if (inputId === 'contactMessage') return 'message';
    return inputId;
}

function validateField(inputId, groupId, type) {
    const input = document.getElementById(inputId);
    const group = document.getElementById(groupId);
    const fb = document.getElementById('fb-' + groupId.replace('fg-', ''));
    const lang = localStorage.getItem('lang') || 'sr';
    const key = fieldKey(inputId);
    const msgs = validationMsgs[lang][key];
    const val = input.value.trim();
    const pattern = type === 'name' ? PATTERNS.name : PATTERNS[type];

    group.classList.remove('is-valid', 'is-invalid');
    fb.className = 'contact-feedback';
    fb.textContent = '';

    if (!val) {
        group.classList.add('is-invalid');
        fb.classList.add('error');
        fb.textContent = msgs.empty;
        return false;
    }

    if (!pattern.test(val)) {
        group.classList.add('is-invalid');
        fb.classList.add('error');
        fb.textContent = msgs.invalid;
        return false;
    }

    group.classList.add('is-valid');
    fb.classList.add('valid');
    fb.textContent = msgs.valid;
    return true;
}

const touchedFields = new Set();

function liveValidate(inputId, groupId, type) {
    if (touchedFields.has(groupId)) {
        validateField(inputId, groupId, type);
    }
}

function setFocused(groupId) {
    const group = document.getElementById(groupId);
    group.classList.add('is-focused');
    const tooltip = group.querySelector('.field-tooltip');
    if (tooltip) {
        const lang = localStorage.getItem('lang') || 'sr';
        const hint = (tooltipHints[lang] || tooltipHints['sr'])[groupId];
        if (hint) {
            const titleEl = tooltip.querySelector('.field-tooltip-title');
            const bodyEl = tooltip.querySelector('.field-tooltip-body');
            if (titleEl) titleEl.textContent = hint.title;
            if (bodyEl) bodyEl.textContent = hint.body;
        }
        tooltip.classList.add('is-visible');
    }
}

function setBlurred(groupId, inputId, type) {
    const group = document.getElementById(groupId);
    group.classList.remove('is-focused');
    const tooltip = group.querySelector('.field-tooltip');
    if (tooltip) tooltip.classList.remove('is-visible');
    touchedFields.add(groupId);
    validateField(inputId, groupId, type);
}

function updateMsgCount() {
    const val = document.getElementById('contactMessage').value;
    document.getElementById('msgCount').textContent = val.length;
}

function submitContact() {
    touchedFields.add('fg-name');
    touchedFields.add('fg-surname');
    touchedFields.add('fg-email');
    touchedFields.add('fg-message');

    const v1 = validateField('contactName', 'fg-name', 'name');
    const v2 = validateField('contactSurname', 'fg-surname', 'name');
    const v3 = validateField('contactEmail', 'fg-email', 'email');
    const v4 = validateField('contactMessage', 'fg-message', 'message');

    if (!v1 || !v2 || !v3 || !v4) {
        const firstError = document.querySelector('.is-invalid .form-control-dark');
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const data = {
        name: document.getElementById('contactName').value.trim(),
        surname: document.getElementById('contactSurname').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        message: document.getElementById('contactMessage').value.trim(),
    };

    sessionStorage.setItem('contactData', JSON.stringify(data));
    window.location.href = 'success.html';
}
