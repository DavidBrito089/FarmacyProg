// Seleccionar elementos del formulario
const productForm = document.getElementById('productForm');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const priceInput = document.getElementById('price');
const imageUrlInput = document.getElementById('image_url');
const categorySelect = document.getElementById('category_id');
const messageDiv = document.getElementById('message');

// Función para mostrar mensajes
function showMessage(type, text) {
    messageDiv.className = `alert alert-${type} mt-3`;
    messageDiv.textContent = text;
    setTimeout(() => messageDiv.textContent = '', 5000);
}

// Obtener el token JWT del localStorage (asumiendo que se guardó al hacer login)
const token = localStorage.getItem('jwtToken');

// Manejar el envío del formulario
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!nameInput.value || !priceInput.value || !categorySelect.value) {
        showMessage('danger', 'Por favor complete los campos obligatorios (*)');
        return;
    }

    // Crear objeto con los datos del producto
    const productData = {
        name: nameInput.value,
        description: descriptionInput.value,
        price: parseFloat(priceInput.value),
        image_url: imageUrlInput.value,
        category_id: parseInt(categorySelect.value)
    };

    try {
        const response = await fetch('https://farmacyprog.onrender.com/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al guardar el producto');
        }

        showMessage('success', 'Producto agregado exitosamente!');
        productForm.reset(); // Limpiar el formulario
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('danger', error.message || 'Error en el servidor');
    }
});

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = "index.html";
});