// Função para carregar componentes HTML
function loadComponent(url, placeholderId) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      document.getElementById(placeholderId).innerHTML = html;
      if (placeholderId === 'header-placeholder') {
        initHeaderEvents();
      }
    })
    .catch(error => console.error(`Erro ao carregar ${url}:`, error));
}

// Função para atualizar o contador do carrinho
function updateCartCount() {
  const cartCountElements = document.querySelectorAll('#cartCount');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  cartCountElements.forEach(element => {
    element.textContent = totalItems;
  });
}

// Função para inicializar eventos do header
function initHeaderEvents() {
  const menuButton = document.getElementById('menuButton');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const abrirCarrinho = document.getElementById('abrirCarrinho');
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');

  if (menuButton && drawer && overlay) {
    menuButton.addEventListener('click', () => {
      drawer.classList.remove('hidden');
      drawer.classList.add('open');
      overlay.style.display = 'block';
      document.body.classList.add('no-scroll');
    });

    overlay.addEventListener('click', () => {
      drawer.classList.remove('open');
      overlay.style.display = 'none';
      document.body.classList.remove('no-scroll');
    });
  }

  if (abrirCarrinho) {
    abrirCarrinho.addEventListener('click', () => {
      window.location.href = 'carrinho.html';
    });
  }

  if (searchButton && searchInput) {
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performSearch();
    });
  }

  // Configurar clique no logo
  const logo = document.querySelector('.marca');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Atualizar contador do carrinho
  updateCartCount();

  // Ouvir mudanças no carrinho
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
      updateCartCount();
    }
  });
}

function performSearch() {
  const searchTerm = document.getElementById('searchInput').value.trim();
  if (searchTerm) {
    localStorage.setItem('searchTerm', searchTerm);
    window.location.href = 'index.html';
  }
}

// Carregar componentes quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header.html', 'header-placeholder');
  loadComponent('footer.html', 'footer-placeholder');
  updateCartCount();
});