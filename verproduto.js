document.addEventListener('DOMContentLoaded', async () => {
  let produtoSelecionado = JSON.parse(localStorage.getItem('produtoSelecionado'));
  if (!produtoSelecionado) {
    window.location.href = 'index.html';
    return;
  }

  const elementos = {
    imagem: document.getElementById('produtoImagem'),
    nome: document.getElementById('produtoNome'),
    descricao: document.getElementById('produtoDescricao'),
    preco: document.getElementById('produtoPreco'),
    tamanho: document.getElementById('tamanho'),
    miniaturas: document.getElementById('miniaturas'),
    btnAdicionar: document.getElementById('adicionarCarrinho'),
    btnComprar: document.getElementById('comprarAgora'),
    avaliacao: document.getElementById('avaliacaoContainer'),
    variacoesContainer: document.getElementById('variacoesContainer')
  };

  // Atualiza contador do carrinho
  function atualizarContadorCarrinho() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const total = cart.reduce((t, i) => t + i.quantity, 0);
      cartCount.textContent = total;
    }
  }

  // Eventos para atualizar o carrinho
  window.addEventListener('cartUpdated', atualizarContadorCarrinho);
  window.addEventListener('storage', (e) => {
    if (e.key === 'cart' || e.key === 'cart-trigger') atualizarContadorCarrinho();
  });

  // Carrega todos os produtos
  async function carregarTodosProdutos() {
    const arquivos = [
      'chuteiras.json', 
      'bolas.json', 
      'meioes.json', 
      'luvas.json', 
      'camisas.json', 
      'caneleiras.json'
    ];
    const promises = arquivos.map(async arquivo => {
      try {
        const res = await fetch(`json/${arquivo}`);
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    });
    const todosProdutosArrays = await Promise.all(promises);
    return todosProdutosArrays.flat();
  }

  // Exibe o produto na tela
  function carregarProduto(produto) {
    elementos.imagem.src = produto.imagem;
    elementos.nome.textContent = produto.nome;
    elementos.descricao.textContent = produto.descricao;
    elementos.preco.textContent = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;

    // Avaliação
    if (produto.avaliacao && produto.numAvaliacoes) {
      const estrelas = '★'.repeat(Math.round(produto.avaliacao)) +
        '☆'.repeat(5 - Math.round(produto.avaliacao));
      elementos.avaliacao.innerHTML = `
        <span class="estrelas">${estrelas}</span>
        <span class="nota">(${produto.avaliacao.toFixed(1)})</span>
        <span class="quantidade"> - ${produto.numAvaliacoes} avaliações</span>
      `;
    } else {
      elementos.avaliacao.innerHTML = '';
    }

    // Tamanhos do JSON
    elementos.tamanho.innerHTML = '<option value="">Selecione</option>';
    if (Array.isArray(produto.tamanhos)) {
      produto.tamanhos.forEach(tam => {
        const opt = document.createElement('option');
        opt.value = tam;
        opt.textContent = tam;
        elementos.tamanho.appendChild(opt);
      });
    }

    // Miniaturas do produto (ângulos)
    elementos.miniaturas.innerHTML = '';
    if (Array.isArray(produto.angulo) && produto.angulo.length > 0) {
      produto.angulo.forEach((img, i) => {
        const miniatura = document.createElement('img');
        miniatura.src = img;
        miniatura.className = `miniatura ${i === 0 ? 'ativo' : ''}`;
        miniatura.addEventListener('click', () => {
          elementos.imagem.src = img;
          document.querySelectorAll('.miniatura').forEach(m => m.classList.remove('ativo'));
          miniatura.classList.add('ativo');
        });
        elementos.miniaturas.appendChild(miniatura);
      });
    }
  }

  // Exibe as variações do produto (mesmo nome)
  function carregarVariacoes(variacoes) {
    const listaVariacoes = document.querySelector('.variacoes-lista');
    if (!listaVariacoes) return;

    listaVariacoes.innerHTML = '';

    variacoes.forEach(variacao => {
      if (variacao.id === produtoSelecionado.id) return;

      const variacaoItem = document.createElement('div');
      variacaoItem.className = 'variacao-item';
      
      const img = document.createElement('img');
      img.src = variacao.imagem;
      img.alt = variacao.nome;
      img.className = 'miniatura-variacao';
      
      const nome = document.createElement('p');
      nome.textContent = variacao.nome;
      nome.className = 'variacao-nome';

      img.addEventListener('click', () => {
        localStorage.setItem('produtoSelecionado', JSON.stringify(variacao));
        window.location.reload();
      });

      variacaoItem.appendChild(img);
      variacaoItem.appendChild(nome);
      listaVariacoes.appendChild(variacaoItem);
    });
  }

  // Adicionar ao carrinho
  function adicionarAoCarrinho() {
    const tamanho = elementos.tamanho.value;
    if (!tamanho) {
      alert('Por favor, selecione um tamanho.');
      return;
    }

    let carrinho = JSON.parse(localStorage.getItem('cart')) || [];
    const existente = carrinho.findIndex(item =>
      item.id === produtoSelecionado.id && item.tamanho === tamanho);

    if (existente >= 0) {
      carrinho[existente].quantity += 1;
    } else {
      carrinho.push({ ...produtoSelecionado, tamanho, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(carrinho));
    mostrarFeedback(`${produtoSelecionado.nome} adicionado ao carrinho!`);

    const event = new Event('cartUpdated');
    window.dispatchEvent(event);
    localStorage.setItem('cart-trigger', Date.now().toString());
  }

  // Comprar agora
  function comprarAgora() {
    adicionarAoCarrinho();
    window.location.href = 'carrinho.html';
  }

  // Mostrar feedback
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

  // Inicialização
  const todosProdutos = await carregarTodosProdutos();
  const variacoes = todosProdutos.filter(p => 
    p.nome === produtoSelecionado.nome && p.id !== produtoSelecionado.id
  );

  carregarProduto(produtoSelecionado);

  if (variacoes.length > 0) {
    elementos.variacoesContainer.style.display = 'block';
    carregarVariacoes([produtoSelecionado, ...variacoes]);
  } else {
    elementos.variacoesContainer.style.display = 'none';
  }

  elementos.btnAdicionar.addEventListener('click', adicionarAoCarrinho);
  elementos.btnComprar.addEventListener('click', comprarAgora);
  atualizarContadorCarrinho();
});