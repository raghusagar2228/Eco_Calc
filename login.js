document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to index
    if (sessionStorage.getItem('logged_in') === 'true') {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('login-form');
    const errorBox = document.getElementById('error-box');
    const guestBtn = document.getElementById('guest-btn');

    // Handle standard login
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError('Username and password are required.');
            return;
        }

        // Check in localStorage
        const storedPassword = localStorage.getItem('user_' + username.toLowerCase());

        if (storedPassword && storedPassword === password) {
            // Success! Set session state
            sessionStorage.setItem('logged_in', 'true');
            sessionStorage.setItem('is_guest', 'false');
            sessionStorage.setItem('username', username);
            window.location.href = 'index.html';
        } else {
            showError('Invalid username or password.');
        }
    });

    // Handle guest access
    guestBtn.addEventListener('click', () => {
        sessionStorage.setItem('logged_in', 'true');
        sessionStorage.setItem('is_guest', 'true');
        sessionStorage.setItem('username', 'Guest');
        window.location.href = 'index.html';
    });

    function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
    }
});
