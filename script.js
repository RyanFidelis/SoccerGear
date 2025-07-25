document.addEventListener('DOMContentLoaded', () => {
  //  GAVETA (MENU)
  const menuButton = document.getElementById('menuButton');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const abrirCarrinho = document.getElementById('abrirCarrinho');

  menuButton.addEventListener('click', () => {
    drawer.classList.remove('hidden');
    drawer.classList.add('open');
    overlay.style.display = 'block';
    overlay.style.opacity = '0.5';
    document.body.style.overflow = 'hidden';
  });

  overlay.addEventListener('click', () => {
    drawer.classList.remove('open');
    overlay.style.opacity = '0';
    setTimeout(() => {
      drawer.classList.add('hidden');
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 300);
  });

  if (abrirCarrinho) {
    abrirCarrinho.addEventListener('click', () => {
      window.location.href = 'carrinho.html';
    });
  }

  //  CARRINHO
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  updateCartCount();

  function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function adicionarAoCarrinho(produto) {
    const index = cart.findIndex(item => item.nome === produto.nome);
    if (index >= 0) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...produto, quantity: 1 });
    }
    updateCartCount();
    mostrarFeedback(produto.nome);
  }

  function mostrarFeedback(nome) {
    const feedback = document.createElement('div');
    feedback.textContent = `${nome} adicionado ao carrinho!`;
    feedback.style.position = 'fixed';
    feedback.style.bottom = '20px';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    feedback.style.backgroundColor = '#4CAF50';
    feedback.style.color = 'white';
    feedback.style.padding = '10px 20px';
    feedback.style.borderRadius = '5px';
    feedback.style.zIndex = '1000';
    feedback.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.style.opacity = '0';
      feedback.style.transition = 'opacity 0.5s';
      setTimeout(() => feedback.remove(), 500);
    }, 2000);
  }

  //  PRODUTOS
  const categorias = [
    { nome: "Chuteiras", arquivo: "chuteiras.json" },
    { nome: "Luvas", arquivo: "luvas.json" },
    { nome: "Camisas", arquivo: "camisas.json" },
    { nome: "Caneleiras", arquivo: "caneleiras.json" },
    { nome: "Meiões", arquivo: "meioes.json" }
  ];

  categorias.forEach(categoria => carregarProdutos(categoria));

  function carregarProdutos(categoria) {
    fetch(`json/${categoria.arquivo}`)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ao carregar ${categoria.arquivo}`);
        return res.json();
      })
      .then(produtos => {
        const secoes = document.querySelectorAll("section.categoria");
        const secao = Array.from(secoes).find(sec => {
          const h3 = sec.querySelector("h3");
          return h3 && h3.textContent.trim() === categoria.nome;
        });

        if (!secao) return;

        const container = secao.querySelector('.produtos');
        container.innerHTML = '';

        produtos.forEach(produto => {
          const card = criarCardProduto(produto);
          container.appendChild(card);
        });
      })
      .catch(err => {
        console.error(`Erro ao carregar produtos de ${categoria.nome}:`, err);
      });
  }

  function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.className = 'produto';
    card.dataset.id = produto.id;

    const precoFormatado = produto.preco.toFixed(2).replace('.', ',');

    card.innerHTML = `
      <div class="produto-imagem">
        <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='imagem/placeholder.png'">
      </div>
      <div class="produto-info">
        <h4>${produto.nome}</h4>
        <p class="descricao">${produto.descricao}</p>
        <p class="preco">R$ ${precoFormatado}</p>
        <button class="btn-adicionar">Adicionar ao Carrinho</button>
      </div>
    `;

    const botao = card.querySelector('.btn-adicionar');
    botao.addEventListener('click', () => {
      adicionarAoCarrinho({
        nome: produto.nome,
        preco: produto.preco,
        imagem: produto.imagem
      });
    });

    return card;
  }
});
