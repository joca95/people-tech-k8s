const apiUrl = 'http://localhost:61183/api/products'; // Cambia esta URL si es necesario

// Función para obtener los productos y actualizarlos en la tabla
function loadProducts() {
  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      const productList = document.getElementById('product-list');
      productList.innerHTML = ''; // Limpiar la tabla antes de agregar productos

      data.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.description}</td>
          <td>${product.category}</td>
          <td>${product.model}</td>
        `;
        productList.appendChild(row);
      });
    });
}

// Función para agregar un nuevo producto
function addProduct() {
  const name = document.getElementById('name').value;
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const model = document.getElementById('model').value;

  const product = { name, description, category, model };

  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
    .then(() => {
      // Limpiar los campos después de agregar el producto
      document.getElementById('name').value = '';
      document.getElementById('description').value = '';
      document.getElementById('category').value = '';
      document.getElementById('model').value = '';

      // Recargar los productos
      loadProducts();
    })
    .catch(err => console.error('Error adding product:', err));
}

// Cargar los productos cuando se carga la página
document.addEventListener('DOMContentLoaded', loadProducts);
