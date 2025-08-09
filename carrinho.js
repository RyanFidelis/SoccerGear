document.addEventListener('DOMContentLoaded', () => {
  const carrinhoItens = document.getElementById('carrinhoItens');
  const cartCount = document.getElementById('cartCount');
  const subtotalElement = document.getElementById('subtotal');
  const totalElement = document.getElementById('total');
  const finalizarCompraBtn = document.getElementById('finalizarCompra');

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Atualizar contagem
  function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
  }

  // Calcular 
  function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.preco * item.quantity), 0);
    subtotalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    totalElement.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
  }

  // Renderizar
  function renderCartItems() {
    if (cart.length === 0) {
      carrinhoItens.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio</p>';
      return;
    }

    carrinhoItens.innerHTML = cart.map(item => `
      <div class="carrinho-item" data-nome="${item.nome}">
        <img src="${item.imagem}" alt="${item.nome}">
        <div class="item-info">
          <h4>${item.nome}</h4>
          <p>R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
          ${item.tamanho ? `<p>Tamanho: ${item.tamanho}</p>` : ''}
          <div class="item-quantidade">
            <button class="quantidade-btn menos">-</button>
            <span>${item.quantity}</span>
            <button class="quantidade-btn mais">+</button>
          </div>
        </div>
        <button class="remover-item">×</button>
      </div>
    `).join('');

    document.querySelectorAll('.quantidade-btn.menos').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.carrinho-item');
        const nome = itemElement.dataset.nome;
        const tamanho = itemElement.querySelector('p:nth-child(3)')?.textContent.replace('Tamanho: ', '');
        const item = cart.find(i => i.nome === nome && (i.tamanho === tamanho || !i.tamanho));
        
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          cart = cart.filter(i => !(i.nome === nome && (i.tamanho === tamanho || !i.tamanho)));
        }
        
        updateCart();
      });
    });

    document.querySelectorAll('.quantidade-btn.mais').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.carrinho-item');
        const nome = itemElement.dataset.nome;
        const tamanho = itemElement.querySelector('p:nth-child(3)')?.textContent.replace('Tamanho: ', '');
        const item = cart.find(i => i.nome === nome && (i.tamanho === tamanho || !i.tamanho));
        item.quantity++;
        updateCart();
      });
    });

    document.querySelectorAll('.remover-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.carrinho-item');
        const nome = itemElement.dataset.nome;
        const tamanho = itemElement.querySelector('p:nth-child(3)')?.textContent.replace('Tamanho: ', '');
        cart = cart.filter(i => !(i.nome === nome && (i.tamanho === tamanho || !i.tamanho)));
        updateCart();
      });
    });
  }

  function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    calculateTotals();
    updateCartCount();
  }

  finalizarCompraBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
    
    alert('Compra finalizada com sucesso!');
    cart = [];
    updateCart();
  });


  updateCartCount();
  renderCartItems();
  calculateTotals();
});
