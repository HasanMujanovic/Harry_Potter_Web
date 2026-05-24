document.addEventListener('DOMContentLoaded', () => {

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const loggedUser = sessionStorage.getItem('loggedUser');
    const loginBtn = document.querySelector('.nav-login-btn');

    if (loggedUser && loginBtn) {
        const lang = localStorage.getItem('lang') || 'sr';
        const logoutLabel = lang === 'sr' ? 'Odjava' : 'Logout';

        loginBtn.innerHTML = `
            <span class="nav-user-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </span>
            <span class="nav-user-name">${loggedUser}</span>
            <span class="nav-user-divider">|</span>
            <span class="nav-user-logout">${logoutLabel}</span>
        `;
        loginBtn.classList.add('nav-user-pill');
        loginBtn.href = '#';
        loginBtn.removeAttribute('data-i18n');

        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (e.target.classList.contains('nav-user-logout') ||
                e.target.closest('.nav-user-logout')) {
                sessionStorage.removeItem('loggedUser');
                window.location.href = 'login.html';
            }
        });
    }

});
