document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signup-form');
    const errorBox = document.getElementById('error-box');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError('All fields are required.');
            return;
        }

        if (password.length < 4) {
            showError('Password should be at least 4 characters long.');
            return;
        }

        const lowerUsername = username.toLowerCase();

        // Check if username already exists
        if (localStorage.getItem('user_' + lowerUsername)) {
            showError('Username already exists. Please choose another.');
            return;
        }

        // Store credentials
        localStorage.setItem('user_' + lowerUsername, password);
        
        // Redirect to login page
        alert('Account created successfully! Please log in.');
        window.location.href = 'login.html';
    });

    function showError(message) {
        errorBox.textContent = message;
        errorBox.classList.remove('hidden');
    }
});
