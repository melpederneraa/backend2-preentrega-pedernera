document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', async () => {
    const cartId = button.dataset.cartId;
    const productId = button.dataset.productId;

    try {
      const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo agregar el producto');
      alert('Producto agregado al carrito');
    } catch (error) {
      alert(error.message);
    }
  });
});
