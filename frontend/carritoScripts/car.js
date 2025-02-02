document.getElementById('checkout-btn').addEventListener('click', function() {
    const cartContainer = document.getElementById('cart-container');
    const paymentContainer = document.getElementById('payment-container');

    // Desplazar el carrito hacia la derecha
    cartContainer.style.transform = 'translateX(100%)';
    cartContainer.style.opacity = '0';

    // Mostrar la pantalla de pago después de la animación
    setTimeout(() => {
        cartContainer.style.display = 'none';
        paymentContainer.style.display = 'block';
    }, 500);
});

document.getElementById('back-arrow').addEventListener('click', function() {
    const cartContainer = document.getElementById('cart-container');
    const paymentContainer = document.getElementById('payment-container');

    // Ocultar la pantalla de pago y mostrar el carrito
    paymentContainer.style.display = 'none';
    cartContainer.style.display = 'block';

    // Restaurar la posición del carrito
    setTimeout(() => {
        cartContainer.style.transform = 'translateX(0)';
        cartContainer.style.opacity = '1';
    }, 10);
});

document.getElementById('payment-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const paymentContainer = document.getElementById('payment-container');
    const loadingContainer = document.getElementById('loading-container');

    // Ocultar la pantalla de pago y mostrar la animación de carga
    paymentContainer.style.display = 'none';
    loadingContainer.style.display = 'block';

    // Simular un proceso de pago de 3 segundos
    setTimeout(() => {
        loadingContainer.style.display = 'none';
        const invoiceContainer = document.getElementById('invoice-container');
        invoiceContainer.style.display = 'block';
    }, 3000);
});

document.getElementById('close-invoice-btn').addEventListener('click', function() {
    const invoiceContainer = document.getElementById('invoice-container');
    const cartContainer = document.getElementById('cart-container');

    // Ocultar la factura y volver a mostrar el carrito
    invoiceContainer.style.display = 'none';
    cartContainer.style.display = 'block';
    cartContainer.style.transform = 'translateX(0)';
    cartContainer.style.opacity = '1';
});