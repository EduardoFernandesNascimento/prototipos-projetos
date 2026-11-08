/* Dados simulados do protótipo Rango (REQ-002).
   Objeto global, sem fetch, para a página abrir por file://.
   Preços em centavos; tempo em minutos; nota de 0 a 5. */
window.RANGO_DADOS = {
  categorias: [
    { id: 'pizza', nome: 'Pizza' },
    { id: 'lanches', nome: 'Lanches' },
    { id: 'japonesa', nome: 'Japonesa' },
    { id: 'saudavel', nome: 'Saudável' },
    { id: 'doces', nome: 'Doces' }
  ],
  restaurantes: [
    {
      id: 1, nome: 'Forno da Vila', categoria: 'pizza', nota: 4.7, tempo: [30, 40], taxa: 599, imagem: 'img/pizza.svg',
      secoes: [
        { nome: 'Pizzas salgadas', pratos: [
          { id: 101, nome: 'Pizza Margherita', descricao: 'Molho de tomate, muçarela de búfala e manjericão fresco.', preco: 4990, imagem: 'img/pizza.svg' },
          { id: 102, nome: 'Pizza Calabresa', descricao: 'Calabresa fatiada, cebola roxa e azeitonas pretas.', preco: 4590, imagem: 'img/pizza.svg' },
          { id: 103, nome: 'Pizza Quatro Queijos', descricao: 'Muçarela, provolone, parmesão e gorgonzola.', preco: 5490, imagem: 'img/pizza.svg' },
          { id: 104, nome: 'Pizza Portuguesa', descricao: 'Presunto, ovos, ervilha, cebola e muçarela.', preco: 5190, imagem: 'img/pizza.svg' }
        ] },
        { nome: 'Pizzas doces', pratos: [
          { id: 105, nome: 'Pizza de Chocolate', descricao: 'Chocolate ao leite com morangos frescos.', preco: 4290, imagem: 'img/doce.svg' }
        ] },
        { nome: 'Bebidas', pratos: [
          { id: 106, nome: 'Refrigerante lata', descricao: 'Lata de 350 ml, sabores variados.', preco: 690, imagem: 'img/bebida.svg' }
        ] }
      ]
    },
    {
      id: 2, nome: 'Burger do Bairro', categoria: 'lanches', nota: 4.5, tempo: [25, 35], taxa: 0, imagem: 'img/lanche.svg',
      secoes: [
        { nome: 'Hambúrgueres', pratos: [
          { id: 201, nome: 'Clássico da Casa', descricao: 'Pão brioche, blend de 160 g, queijo prato, alface e tomate.', preco: 3290, imagem: 'img/lanche.svg' },
          { id: 202, nome: 'Duplo Cheddar', descricao: 'Dois blends de 120 g, cheddar cremoso e cebola caramelizada.', preco: 3890, imagem: 'img/lanche.svg' },
          { id: 203, nome: 'Vegetariano de Grão-de-bico', descricao: 'Hambúrguer de grão-de-bico, rúcula e maionese de ervas.', preco: 3190, imagem: 'img/lanche.svg' }
        ] },
        { nome: 'Acompanhamentos', pratos: [
          { id: 204, nome: 'Batata frita média', descricao: 'Batatas crocantes com sal e páprica.', preco: 1490, imagem: 'img/batata.svg' },
          { id: 205, nome: 'Anéis de cebola', descricao: 'Porção com 10 anéis empanados.', preco: 1690, imagem: 'img/batata.svg' }
        ] },
        { nome: 'Bebidas', pratos: [
          { id: 206, nome: 'Milk-shake de baunilha', descricao: 'Copo de 400 ml com calda de caramelo.', preco: 1890, imagem: 'img/bebida.svg' }
        ] }
      ]
    },
    {
      id: 3, nome: 'Sushi Kaori', categoria: 'japonesa', nota: 4.8, tempo: [40, 55], taxa: 899, imagem: 'img/sushi.svg',
      secoes: [
        { nome: 'Combinados', pratos: [
          { id: 301, nome: 'Combinado 20 peças', descricao: 'Sashimi, niguiri, uramaki e hossomaki do chef.', preco: 7990, imagem: 'img/sushi.svg' },
          { id: 302, nome: 'Combinado salmão 12 peças', descricao: 'Niguiri, sashimi e uramaki de salmão.', preco: 5490, imagem: 'img/sushi.svg' }
        ] },
        { nome: 'Quentes', pratos: [
          { id: 303, nome: 'Hot Philadelphia', descricao: '10 peças empanadas com salmão e cream cheese.', preco: 3690, imagem: 'img/sushi.svg' },
          { id: 304, nome: 'Guioza de porco', descricao: '6 unidades com molho ponzu.', preco: 2890, imagem: 'img/sushi.svg' },
          { id: 305, nome: 'Yakisoba de legumes', descricao: 'Macarrão salteado com legumes e molho shoyu.', preco: 3990, imagem: 'img/salada.svg' }
        ] },
        { nome: 'Sobremesas', pratos: [
          { id: 306, nome: 'Harumaki de banana', descricao: '4 unidades com canela e açúcar.', preco: 1990, imagem: 'img/doce.svg' }
        ] }
      ]
    },
    {
      id: 4, nome: 'Verde Vivo', categoria: 'saudavel', nota: 4.6, tempo: [20, 30], taxa: 499, imagem: 'img/salada.svg',
      secoes: [
        { nome: 'Saladas', pratos: [
          { id: 401, nome: 'Salada Caesar com frango', descricao: 'Alface romana, frango grelhado, parmesão e croutons.', preco: 3290, imagem: 'img/salada.svg' },
          { id: 402, nome: 'Bowl de quinoa', descricao: 'Quinoa, grão-de-bico, abacate, tomate-cereja e tahine.', preco: 3590, imagem: 'img/salada.svg' }
        ] },
        { nome: 'Pratos', pratos: [
          { id: 403, nome: 'Salmão com legumes', descricao: 'Filé grelhado com brócolis, cenoura e abobrinha.', preco: 4890, imagem: 'img/salada.svg' },
          { id: 404, nome: 'Wrap integral de frango', descricao: 'Frango desfiado, cenoura, rúcula e cream cheese light.', preco: 2690, imagem: 'img/lanche.svg' }
        ] },
        { nome: 'Bebidas', pratos: [
          { id: 405, nome: 'Suco verde', descricao: 'Couve, maçã, limão e gengibre, 500 ml.', preco: 1390, imagem: 'img/bebida.svg' },
          { id: 406, nome: 'Água de coco', descricao: 'Garrafa de 300 ml.', preco: 890, imagem: 'img/bebida.svg' }
        ] }
      ]
    },
    {
      id: 5, nome: 'Doce Encontro', categoria: 'doces', nota: 4.9, tempo: [30, 45], taxa: 699, imagem: 'img/doce.svg',
      secoes: [
        { nome: 'Bolos e tortas', pratos: [
          { id: 501, nome: 'Fatia de bolo de cenoura', descricao: 'Com cobertura generosa de brigadeiro.', preco: 1490, imagem: 'img/doce.svg' },
          { id: 502, nome: 'Torta de limão', descricao: 'Massa amanteigada, creme de limão e merengue.', preco: 1690, imagem: 'img/doce.svg' },
          { id: 503, nome: 'Cheesecake de frutas vermelhas', descricao: 'Base crocante e calda de frutas vermelhas.', preco: 1890, imagem: 'img/doce.svg' }
        ] },
        { nome: 'Docinhos', pratos: [
          { id: 504, nome: 'Caixa com 12 brigadeiros', descricao: 'Brigadeiros gourmet sortidos.', preco: 3990, imagem: 'img/doce.svg' },
          { id: 505, nome: 'Brownie com nozes', descricao: 'Brownie úmido de chocolate meio amargo.', preco: 1290, imagem: 'img/doce.svg' }
        ] },
        { nome: 'Bebidas', pratos: [
          { id: 506, nome: 'Café coado', descricao: 'Copo de 250 ml, grãos do sul de Minas.', preco: 790, imagem: 'img/bebida.svg' },
          { id: 507, nome: 'Chocolate quente', descricao: 'Chocolate cremoso com canela.', preco: 1290, imagem: 'img/bebida.svg' }
        ] }
      ]
    },
    {
      id: 6, nome: 'Pizzaria Napolitana Bella Notte', categoria: 'pizza', nota: 4.4, tempo: [35, 50], taxa: 0, imagem: 'img/pizza.svg',
      secoes: [
        { nome: 'Pizzas', pratos: [
          { id: 601, nome: 'Napolitana de Pepperoni', descricao: 'Massa de fermentação natural e pepperoni artesanal.', preco: 5690, imagem: 'img/pizza.svg' },
          { id: 602, nome: 'Napolitana de Abobrinha', descricao: 'Abobrinha grelhada, ricota e hortelã.', preco: 4990, imagem: 'img/pizza.svg' },
          { id: 603, nome: 'Marinara', descricao: 'Molho de tomate, alho, orégano e azeite.', preco: 3990, imagem: 'img/pizza.svg' }
        ] },
        { nome: 'Entradas', pratos: [
          { id: 604, nome: 'Bruschetta de tomate', descricao: '4 fatias de pão italiano com tomate e manjericão.', preco: 2290, imagem: 'img/salada.svg' },
          { id: 605, nome: 'Burrata com pesto', descricao: 'Burrata cremosa, pesto de manjericão e torradas.', preco: 4490, imagem: 'img/salada.svg' }
        ] },
        { nome: 'Sobremesas', pratos: [
          { id: 606, nome: 'Tiramisù', descricao: 'Receita tradicional com mascarpone e café.', preco: 2190, imagem: 'img/doce.svg' }
        ] }
      ]
    }
  ]
};
