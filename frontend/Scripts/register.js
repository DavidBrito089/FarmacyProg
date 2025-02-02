const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toRegister = document.getElementById('toRegister');
const toLogin = document.getElementById('toLogin');

toRegister.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

toLogin.addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('rUser').value;
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;

    try {
        // Envía los datos al backend
        const response = await fetch('https://farmacyprog.onrender.com/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        alert('Error del servidor. Inténtalo más tarde.');
    }
});