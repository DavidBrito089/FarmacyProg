document.querySelectorAll('.open-modal-btn').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        const modal = document.getElementById('modal');
        modal.classList.add('show');
    });
});

document.getElementById('closeModalBtn').addEventListener('click', function() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
});

document.getElementById('toRegister').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

document.getElementById('toLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});
