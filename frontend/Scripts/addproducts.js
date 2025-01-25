document.addEventListener('DOMContentLoaded', () => {
    const showProductsBtn = document.getElementById('show-products');
    const showOffersBtn = document.getElementById('show-offers');
    const productsSection = document.getElementById('products-section');
    const offersSection = document.getElementById('offers-section');
    const productList = document.getElementById('product-list');
    const offersList = document.getElementById('offers-list');

    // Mostrar productos
    showProductsBtn.addEventListener('click', async () => {
        
        productsSection.classList.remove('hidden');        
        offersSection.classList.add('hidden');

        const response = await fetch(`https://farmacyprog.onrender.com/products`);
        const products = await response.json();

        productList.innerHTML = products.map(product =>`
            <div class="col-md-4">
                        <div class="card product-card">
                            <img src="${product.image_url}" alt="Producto">
                            <div class="card-body">
                                <h5 class="card-title">${product.product_name}</h5>
                                <p class="card-text">${product.description}</p>
                                <p><strong>Precio:</strong> $${product.price}</p>
                                <p><strong>Categoría:</strong> ${product.category_name}</p>
                                <button class="btn btn-primary open-modal-btn" >Agregar al carrito</button>
                            </div>
                        </div>
                    </div>
        `).join('');
        document.querySelectorAll('.open-modal-btn').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const modal = document.getElementById('modal');
                modal.classList.add('show');
            });
        });
    });

    // Mostrar ofertas
    showOffersBtn.addEventListener('click', async () => {
        offersSection.classList.remove('hidden');
        productsSection.classList.add('hidden');
        
        // Obtener ofertas del día desde el backend
        const response = await fetch(`https://farmacyprog.onrender.com/offers`);
        const offers = await response.json();
        // Renderizar ofertas
        offersList.innerHTML = offers.map(offer => `
            <div class="col-md-4">
                        <div class="card product-card">
                            <img src="${offer.image_url}" alt="Producto">
                            <div class="card-body">
                                <h5 class="card-title">${offer.product_name}</h5>
                                <p class="card-text">${offer.description}</p>
                                <p><strong>Precio:</strong></p>
                                <span style="text-decoration: line-through; color: gray;">$${offer.price}</span>
                                <span style="color: red; font-weight: bold;"> $${offer.descount}</span>
                                <p><strong>Categoría:</strong> ${offer.category_name}</p>
                                <button class="btn btn-primary open-modal-btn">Agregar al carrito</button>
                            </div>
                        </div>
                    </div>
        `).join('');
        document.querySelectorAll('.open-modal-btn').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const modal = document.getElementById('modal');
                modal.classList.add('show');
            });
        });
    });
});
fetch('https://farmacyprog.onrender.com/products')
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('product-list');
            products.forEach(product => {
                const productCard = `
                    <div class="col-md-4">
                        <div class="card product-card">
                            <img src="${product.image_url}" alt="Producto">
                            <div class="card-body">
                                <h5 class="card-title">${product.product_name}</h5>
                                <p class="card-text">${product.description}</p>
                                <p><strong>Precio:</strong> $${product.price}</p>
                                <p><strong>Categoría:</strong> ${product.category_name}</p>
                                <button class="btn btn-primary open-modal-btn">Agregar al carrito</button>
                            </div>
                        </div>
                    </div>
                `;
                productList.innerHTML += productCard;
            });
            document.querySelectorAll('.open-modal-btn').forEach(button => {
                button.addEventListener('click', function(event) {
                    event.preventDefault();
                    const modal = document.getElementById('modal');
                    modal.classList.add('show');
                });
            });
        })
        .catch(error => {
            console.error('Error al obtener los productos:', error);
        });
