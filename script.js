document.addEventListener('DOMContentLoaded', () => {
  // GAVETA (MENU)
  const menuButton = document.getElementById('menuButton');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const abrirCarrinho = document.getElementById('abrirCarrinho');

  if (menuButton) {
    menuButton.addEventListener('click', () => {
      drawer.classList.remove('hidden');
      drawer.classList.add('open');
      overlay.style.display = 'block';
      overlay.style.opacity = '0.5';
      document.body.style.overflow = 'hidden';
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      drawer.classList.remove('open');
      overlay.style.opacity = '0';
      setTimeout(() => {
        drawer.classList.add('hidden');
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
      }, 300);
    });
  }

  if (abrirCarrinho) {
    abrirCarrinho.addEventListener('click', () => {
      window.location.href = 'carrinho.html';
    });
  }

  // CARRINHO
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let allProducts = [];
  let allLoaded = false;

  function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      cartCount.textContent = totalItems;
    }
  }

  function adicionarAoCarrinho(produto) {
    const index = cart.findIndex(item => item.id === produto.id);
    if (index >= 0) {
      cart[index].quantity += 1;
    } else {
      cart.push({ ...produto, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    mostrarFeedback(`${produto.nome} adicionado ao carrinho!`);

    const event = new Event('cartUpdated');
    window.dispatchEvent(event);
  }

  function mostrarFeedback(mensagem) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-message show';
    feedback.textContent = mensagem;
    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.classList.remove('show');
      setTimeout(() => feedback.remove(), 500);
    }, 2000);
  }

  // PRODUTOS
  function carregarProdutos() {
    const categorias = [
      { nome: "Chuteiras", arquivo: "json/chuteiras.json" },
      { nome: "Luvas", arquivo: "json/luvas.json" },
      { nome: "Camisas", arquivo: "json/camisas.json" },
      { nome: "Caneleiras", arquivo: "json/caneleiras.json" },
      { nome: "Meiões", arquivo: "json/meioes.json" },
      { nome: "Bolas", arquivo: "json/bolas.json" }
    ];

    categorias.forEach(categoria => {
      fetch(categoria.arquivo)
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(produtos => {
          const secao = [...document.querySelectorAll("section.categoria")].find(sec => {
            return sec.querySelector("h3").textContent.trim() === categoria.nome;
          });

          if (secao) {
            const container = secao.querySelector('.produtos');
            container.innerHTML = '';

            const limitados = produtos.slice(0, 7);
            limitados.forEach(produto => {
              container.appendChild(criarCardProduto(produto));
            });

            const botao = document.createElement('button');
            botao.textContent = 'Ver mais produtos';
            botao.className = 'btn-ver-mais';
            botao.addEventListener('click', () => {
              localStorage.setItem('categoriaSelecionada', categoria.nome);
              window.location.href = 'verMaisProdutos.html';
            });

            secao.appendChild(botao);
          }
        })
        .catch(err => console.error(`Erro ao carregar ${categoria.nome}:`, err));
    });
  }

  function criarCardProduto(produto) {
    const card = document.createElement('div');
    card.className = 'produto';
    card.dataset.id = produto.id;

    card.innerHTML = `
      <div class="produto-imagem">
        <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='imagem/placeholder.png'">
      </div>
      <div class="produto-info">
        <h4>${produto.nome}</h4>
        <p class="descricao">${produto.descricao}</p>
        <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
        <button class="btn-adicionar">Adicionar ao Carrinho</button>
      </div>
    `;

    card.querySelector('.btn-adicionar').addEventListener('click', (e) => {
      e.stopPropagation();
      adicionarAoCarrinho(produto);
    });

    card.addEventListener('click', () => {
      localStorage.setItem('produtoSelecionado', JSON.stringify(produto));
      window.location.href = 'verproduto.html';
    });

    return card;
  }

  function carregarTodosProdutos(callback) {
    const categorias = [
      { nome: "Chuteiras", arquivo: "json/chuteiras.json" },
      { nome: "Luvas", arquivo: "json/luvas.json" },
      { nome: "Camisas", arquivo: "json/camisas.json" },
      { nome: "Caneleiras", arquivo: "json/caneleiras.json" },
      { nome: "Meiões", arquivo: "json/meioes.json" },
      { nome: "Bolas", arquivo: "json/bolas.json" }
    ];

    let carregados = 0;
    categorias.forEach(cat => {
      fetch(cat.arquivo)
        .then(res => res.json())
        .then(produtos => {
          produtos.forEach(p => allProducts.push({ ...p, categoria: cat.nome }));
          carregados++;
          if (carregados === categorias.length) {
            allLoaded = true;
            if (callback) callback();
          }
        });
    });
  }

  function mostrarResultadosBusca(filtro) {
    const main = document.querySelector('main');
    main.innerHTML = `
      <div class="barra-pesquisa">
        <input type="text" id="pesquisaInput" placeholder="Buscar produtos pelo nome..." value="${filtro}">
        <button id="pesquisaBtn">Buscar</button>
      </div>
      <h2 class="titulo-categoria">Resultados da busca: "${filtro}"</h2>
      <div class="ResultadosProdutos" id="todosProdutos"></div>
    `;

    const container = document.getElementById('todosProdutos');
    const filtrados = allProducts.filter(p =>
      p.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    if (filtrados.length === 0) {
      container.innerHTML = "<p>Nenhum produto encontrado.</p>";
      return;
    }

    filtrados.forEach(produto => {
      const card = document.createElement('div');
      card.className = 'produto';
      card.innerHTML = `
        <div class="produto-imagem">
          <img src="${produto.imagem}" alt="${produto.nome}" onerror="this.src='imagem/placeholder.png'">
        </div>
        <div class="produto-info">
          <h4>${produto.nome}</h4>
          <p class="descricao">${produto.descricao}</p>
          <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
          <button class="btn-adicionar">Adicionar ao Carrinho</button>
        </div>
      `;

      card.querySelector('.btn-adicionar').addEventListener('click', (e) => {
        e.stopPropagation();
        adicionarAoCarrinho(produto);
      });

      card.addEventListener('click', () => {
        localStorage.setItem('produtoSelecionado', JSON.stringify(produto));
        window.location.href = 'verproduto.html';
      });

      container.appendChild(card);
    });

    const novaInput = document.getElementById('pesquisaInput');
    const novoBtn = document.getElementById('pesquisaBtn');
    if (novaInput) {
      novaInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') executarBusca();
      });
    }
    if (novoBtn) {
      novoBtn.addEventListener('click', executarBusca);
    }
  }

  function executarBusca() {
    const valor = document.getElementById('pesquisaInput').value.trim();
    if (valor.length > 0) {
      if (!allLoaded) {
        carregarTodosProdutos(() => mostrarResultadosBusca(valor));
      } else {
        mostrarResultadosBusca(valor);
      }
    } else {
      window.location.reload();
    }
  }

  const pesquisaInput = document.getElementById('pesquisaInput');
  const pesquisaBtn = document.getElementById('pesquisaBtn');
  if (pesquisaInput) {
    pesquisaInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') executarBusca();
    });
  }
  if (pesquisaBtn) {
    pesquisaBtn.addEventListener('click', executarBusca);
  }

  window.addEventListener('cartUpdated', updateCartCount);
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart') updateCartCount();
  });

  carregarProdutos();
  updateCartCount();
});
