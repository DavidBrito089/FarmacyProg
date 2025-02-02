async function loadCartItems() {
    // Supongamos que el ID del usuario se guarda en localStorage

    const token = localStorage.getItem('token');
    const response1 = await fetch('https://farmacyprog.onrender.com/profile', {
        headers: { Authorization: `Bearer ${token}` }
    });    
    
    const data = await response1.json();

    const userId = data.decoded.userId;
    if (!userId) {
      alert('Debes iniciar sesión para ver tu carrito.');
      return;
    }
  
    try {
      const response = await fetch(`https://farmacyprog.onrender.com/cart-items/${userId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los productos del carrito');
      }
      const cartItems = await response.json();
  
      // Selecciona el contenedor donde se mostrarán los productos del carrito
      const cartContainer = document.querySelector('.cart-items');
      cartContainer.innerHTML = ''; // Limpia contenido previo
  
      let subtotal = 0;
  
      cartItems.forEach(item => {
        // Calcula el subtotal sumando precio * cantidad
        subtotal += item.price * item.quantity;
  
        // Crea un elemento para el producto
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
          <img src="${item.image_url}" alt="${item.name}">
          <div class="item-details">
            <h2>${item.name}</h2>
            <p>${item.description}</p>
            <div class="quantity">
                <button class="decrease" onclick="updateQuantity(${item.cart_item_id}, -1)">-</button>
                <input type="text" value="${item.quantity}" class="quantity-input" readonly>
                <button class="increase" onclick="updateQuantity(${item.cart_item_id}, 1)">+</button>
            </div>
            <p class="price">$${(item.price * item.quantity).toFixed(2)}</p>
            <button class="remove-item" onclick="removeFromCart(${item.cart_item_id})">Eliminar</button>
          </div>
        `;
        cartContainer.appendChild(cartItem);
      });
  
      // Actualiza el resumen del carrito
      document.querySelector('.subtotal').textContent = `$${subtotal.toFixed(2)}`;
      const shipping = subtotal > 0 ? 5.00 : 0;
      document.querySelector('.shipping').textContent = `$${shipping.toFixed(2)}`;
      document.querySelector('.total').textContent = `$${(subtotal + shipping).toFixed(2)}`;
  
    } catch (error) {
      console.error('Error al cargar el carrito:', error);
      alert('Error al cargar los productos del carrito.');
    }
  }

  async function updateQuantity(cartItemId, change) {
    try {
      await fetch(`https://farmacyprog.onrender.com/cart/update/${cartItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ change })
      });
      loadCartItems(); // Recarga el carrito tras actualizar
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
    }
  }

  async function removeFromCart(cartItemId) {
    try {
      await fetch(`https://farmacyprog.onrender.com/cart/remove/${cartItemId}`, {
        method: 'DELETE'
      });
      loadCartItems(); // Recarga el carrito tras eliminar
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  }
  
  
  document.addEventListener('DOMContentLoaded', loadCartItems);