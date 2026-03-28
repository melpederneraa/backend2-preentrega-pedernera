const socket = io();
const listContainer = document.getElementById('realtimeList');
const form = document.getElementById('productForm');
const socketMessage = document.getElementById('socketMessage');

const renderProducts = (products) => {
  listContainer.innerHTML = products.map((product) => `
    <article class="card">
      <h2>${product.title}</h2>
      <p><strong>Precio:</strong> $${product.price}</p>
      <p><strong>Categoría:</strong> ${product.category}</p>
      <button class="button danger delete-product" data-id="${product._id}">Eliminar</button>
    </article>
  `).join('');

  document.querySelectorAll('.delete-product').forEach((button) => {
    button.addEventListener('click', () => {
      socket.emit('deleteProduct', button.dataset.id);
    });
  });
};

socket.on('productsUpdated', renderProducts);
socket.on('productError', (message) => {
  socketMessage.textContent = message;
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  socket.emit('addProduct', payload);
  form.reset();
});
