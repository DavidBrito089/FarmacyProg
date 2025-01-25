document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevenir recarga de la página

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://farmacyprog.onrender.com/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
            document.getElementById('registerSuccess').style.display = 'block';
            document.getElementById('registerError').style.display = 'none';
        } else {
            const data = await response.json();
            document.getElementById('registerError').textContent = data.message;
            document.getElementById('registerError').style.display = 'block';
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        document.getElementById('registerError').textContent = 'Hubo un error. Inténtalo de nuevo.';
        document.getElementById('registerError').style.display = 'block';
    }
});
