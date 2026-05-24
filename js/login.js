async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function validateFields() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const lang = localStorage.getItem('lang') || 'sr';
    let valid = true;

    const errors = {
        sr: { emptyUser: 'Korisničko ime je obavezno.', emptyPass: 'Lozinka je obavezna.' },
        en: { emptyUser: 'Username is required.', emptyPass: 'Password is required.' }
    };

    if (!username) {
        setFieldError('fg-username', 'err-username', errors[lang].emptyUser);
        valid = false;
    }

    if (!password) {
        setFieldError('fg-password', 'err-password', errors[lang].emptyPass);
        valid = false;
    }

    return valid;
}

function setFieldError(groupId, errId, message) {
    const group = document.getElementById(groupId);
    const err = document.getElementById(errId);
    group.classList.add('field-error');
    err.textContent = message;
}

function clearFieldError(groupId) {
    document.getElementById(groupId).classList.remove('field-error');
    document.getElementById('loginErrorGlobal').classList.add('d-none');
}

function setLoading(isLoading) {
    const btn = document.getElementById('loginSubmitBtn');
    const loading = document.getElementById('loginLoading');
    btn.classList.toggle('d-none', isLoading);
    loading.classList.toggle('d-none', !isLoading);
}

function showGlobalError(message) {
    const el = document.getElementById('loginErrorGlobal');
    document.getElementById('errorGlobalText').textContent = message;
    el.classList.remove('d-none');
}

function showSuccess(username) {
    const lang = localStorage.getItem('lang') || 'sr';
    document.getElementById('loginForm').classList.add('d-none');
    document.getElementById('loginSuccess').classList.remove('d-none');

    const msgs = {
        sr: `Prijavljeni ste kao <strong>${username}</strong>. Dobrodošli u Veliku Dvoranu.`,
        en: `You are logged in as <strong>${username}</strong>. Welcome to the Great Hall.`
    };
    document.getElementById('successMsg').innerHTML = msgs[lang];

    sessionStorage.setItem('loggedUser', username);

    setTimeout(() => {
        window.location.href = 'spellbook.html';
    }, 3000);
}

function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eye-icon');
    const isHidden = input.type === 'password';

    input.type = isHidden ? 'text' : 'password';

    icon.innerHTML = isHidden
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
           <line x1="1" y1="1" x2="23" y2="23"/>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
           <circle cx="12" cy="12" r="3"/>`;
}

function fillDemo(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    clearFieldError('fg-username');
    clearFieldError('fg-password');
    document.getElementById('loginErrorGlobal').classList.add('d-none');
}

async function handleLogin() {
    document.getElementById('loginErrorGlobal').classList.add('d-none');

    if (!validateFields()) return;

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const lang = localStorage.getItem('lang') || 'sr';

    setLoading(true);

    try {
        const hashedPassword = await hashPassword(password);

        const response = await fetch('users.json');
        if (!response.ok) throw new Error('Cannot load users.json');

        const data = await response.json();

        const user = data.users.find(u =>
            u.username === username && u.password === hashedPassword
        );

        setLoading(false);

        if (user) {
            showSuccess(username);
        } else {
            const errMsgs = {
                sr: 'Pogrešno korisničko ime ili lozinka.',
                en: 'Incorrect username or password.'
            };
            showGlobalError(errMsgs[lang]);
        }

    } catch (err) {
        setLoading(false);
        const errMsgs = {
            sr: 'Greška pri učitavanju podataka. Pokušaj ponovo.',
            en: 'Error loading user data. Please try again.'
        };
        showGlobalError(errMsgs[lang]);
        console.error('Login error:', err);
    }
}
