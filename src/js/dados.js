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
      id: 1, nome: 'Forno da Vila', categoria: 'pizza', nota: 4.7, tempo: [30, 40], taxa: 599, imagem: 'img/pizza.svg', foto: 'img/restaurante-1-forno-da-vila', alt: 'Pizza margherita de borda alta e tostada, com muçarela derretida e manjericão',
      secoes: [
        { nome: 'Pizzas salgadas', pratos: [
          { id: 101, nome: 'Pizza Margherita', descricao: 'Molho de tomate, muçarela de búfala e manjericão fresco.', preco: 4990, imagem: 'img/pizza.svg', foto: 'img/prato-101-pizza-margherita', alt: 'Pizza margherita com molho de tomate, muçarela derretida e folhas de manjericão' },
          { id: 102, nome: 'Pizza Calabresa', descricao: 'Calabresa fatiada, cebola roxa e azeitonas pretas.', preco: 4590, imagem: 'img/pizza.svg', foto: 'img/prato-102-pizza-calabresa', alt: 'Pizza de calabresa fatiada com azeitonas verdes sobre tábua de madeira' },
          { id: 103, nome: 'Pizza Quatro Queijos', descricao: 'Muçarela, provolone, parmesão e gorgonzola.', preco: 5490, imagem: 'img/pizza.svg', foto: 'img/prato-103-pizza-quatro-queijos', alt: 'Pizza de quatro queijos de massa napolitana com bordas tostadas' },
          { id: 104, nome: 'Pizza Portuguesa', descricao: 'Presunto, ovos, ervilha, cebola e muçarela.', preco: 5190, imagem: 'img/pizza.svg', foto: 'img/prato-104-pizza-portuguesa', alt: 'Pizza portuguesa com presunto, ovos cozidos, pimentão verde e azeitonas' }
        ] },
        { nome: 'Pizzas doces', pratos: [
          { id: 105, nome: 'Pizza de Chocolate', descricao: 'Chocolate ao leite com morangos frescos.', preco: 4290, imagem: 'img/doce.svg', foto: 'img/prato-105-pizza-de-chocolate', alt: 'Pizza doce de chocolate com pedaços de chocolate branco e bola de sorvete' }
        ] },
        { nome: 'Bebidas', pratos: [
          { id: 106, nome: 'Refrigerante lata', descricao: 'Lata de 350 ml, sabores variados.', preco: 690, imagem: 'img/bebida.svg', foto: 'img/prato-106-refrigerante-lata', alt: 'Copo de refrigerante de cola com gelo e rodela de limão' }
        ] }
      ]
    },
    {
      id: 2, nome: 'Burger do Bairro', categoria: 'lanches', nota: 4.5, tempo: [25, 35], taxa: 0, imagem: 'img/lanche.svg', foto: 'img/restaurante-2-burger-do-bairro', alt: 'Hambúrguer com queijo, alface e tomate servido com batatas fritas',
      secoes: [
        { nome: 'Hambúrgueres', pratos: [
          { id: 201, nome: 'Clássico da Casa', descricao: 'Pão brioche, blend de 160 g, queijo prato, alface e tomate.', preco: 3290, imagem: 'img/lanche.svg', foto: 'img/prato-201-classico-da-casa', alt: 'Hambúrguer em pão brioche com alface, tomate e queijo' },
          { id: 202, nome: 'Duplo Cheddar', descricao: 'Dois blends de 120 g, cheddar cremoso e cebola caramelizada.', preco: 3890, imagem: 'img/lanche.svg', foto: 'img/prato-202-duplo-cheddar', alt: 'Hambúrguer duplo com duas carnes e fatias de queijo cheddar' },
          { id: 203, nome: 'Vegetariano de Grão-de-bico', descricao: 'Hambúrguer de grão-de-bico, rúcula e maionese de ervas.', preco: 3190, imagem: 'img/lanche.svg', foto: 'img/prato-203-vegetariano-de-grao-de-bico', alt: 'Hambúrguer vegetariano empanado com salada e batatas fritas' }
        ] },
        { nome: 'Acompanhamentos', pratos: [
          { id: 204, nome: 'Batata frita média', descricao: 'Batatas crocantes com sal e páprica.', preco: 1490, imagem: 'img/batata.svg', foto: 'img/prato-204-batata-frita-media', alt: 'Batatas fritas crocantes temperadas com salsinha' },
          { id: 205, nome: 'Anéis de cebola', descricao: 'Porção com 10 anéis empanados.', preco: 1690, imagem: 'img/batata.svg', foto: 'img/prato-205-aneis-de-cebola', alt: 'Anéis de cebola empanados com potinho de molho' }
        ] },
        { nome: 'Bebidas', pratos: [
          { id: 206, nome: 'Milk-shake de baunilha', descricao: 'Copo de 400 ml com calda de caramelo.', preco: 1890, imagem: 'img/bebida.svg', foto: 'img/prato-206-milk-shake-de-baunilha', alt: 'Milk-shake de baunilha com chantili em copo' }
        ] }
      ]
    },
    {
      id: 3, nome: 'Sushi Kaori', categoria: 'japonesa', nota: 4.8, tempo: [40, 55], taxa: 899, imagem: 'img/sushi.svg', foto: 'img/restaurante-3-sushi-kaori', alt: 'Travessa de sushi variado com niguiris de atum, salmão, camarão e polvo',
      secoes: [
        { nome: 'Combinados', pratos: [
          { id: 301, nome: 'Combinado 20 peças', descricao: 'Sashimi, niguiri, uramaki e hossomaki do chef.', preco: 7990, imagem: 'img/sushi.svg', foto: 'img/prato-301-combinado-20-pecas', alt: 'Combinado de sushi com uramaki e niguiris de atum, salmão, camarão e peixe branco' },
          { id: 302, nome: 'Combinado salmão 12 peças', descricao: 'Niguiri, sashimi e uramaki de salmão.', preco: 5490, imagem: 'img/sushi.svg', foto: 'img/prato-302-combinado-salmao-12-pecas', alt: 'Niguiri de salmão fresco sobre bolinho de arroz' }
        ] },
        { nome: 'Quentes', pratos: [
          { id: 303, nome: 'Hot Philadelphia', descricao: '10 peças empanadas com salmão e cream cheese.', preco: 3690, imagem: 'img/sushi.svg', foto: 'img/prato-303-hot-philadelphia', alt: 'Uramaki com cobertura dourada e molho, em prato escuro' },
          { id: 304, nome: 'Guioza de porco', descricao: '6 unidades com molho ponzu.', preco: 2890, imagem: 'img/sushi.svg', foto: 'img/prato-304-guioza-de-porco', alt: 'Guiozas douradas na chapa servidas em prato branco' },
          { id: 305, nome: 'Yakisoba de legumes', descricao: 'Macarrão salteado com legumes e molho shoyu.', preco: 3990, imagem: 'img/salada.svg', foto: 'img/prato-305-yakisoba-de-legumes', alt: 'Yakisoba com legumes, gengibre em conserva e limão em chapa de ferro' }
        ] },
        { nome: 'Sobremesas', pratos: [
          { id: 306, nome: 'Harumaki de banana', descricao: '4 unidades com canela e açúcar.', preco: 1990, imagem: 'img/doce.svg', foto: 'img/prato-306-harumaki-de-banana', alt: 'Rolinhos fritos de banana caramelizados com flor comestível' }
        ] }
      ]
    },
    {
      id: 4, nome: 'Verde Vivo', categoria: 'saudavel', nota: 4.6, tempo: [20, 30], taxa: 499, imagem: 'img/salada.svg', foto: 'img/restaurante-4-verde-vivo', alt: 'Salada colorida com folhas, pimentões, mirtilos e brotos em tigela de cerâmica',
      secoes: [
        { nome: 'Saladas', pratos: [
          { id: 401, nome: 'Salada Caesar com frango', descricao: 'Alface romana, frango grelhado, parmesão e croutons.', preco: 3290, imagem: 'img/salada.svg', foto: 'img/prato-401-salada-caesar-com-frango', alt: 'Salada Caesar com frango grelhado, bacon, parmesão e alface romana' },
          { id: 402, nome: 'Bowl de quinoa', descricao: 'Quinoa, grão-de-bico, abacate, tomate-cereja e tahine.', preco: 3590, imagem: 'img/salada.svg', foto: 'img/prato-402-bowl-de-quinoa', alt: 'Bowl de quinoa com abacate, tomate e coentro' }
        ] },
        { nome: 'Pratos', pratos: [
          { id: 403, nome: 'Salmão com legumes', descricao: 'Filé grelhado com brócolis, cenoura e abobrinha.', preco: 4890, imagem: 'img/salada.svg', foto: 'img/prato-403-salmao-com-legumes', alt: 'Salmão grelhado com brócolis, legumes e folhas' },
          { id: 404, nome: 'Wrap integral de frango', descricao: 'Frango desfiado, cenoura, rúcula e cream cheese light.', preco: 2690, imagem: 'img/lanche.svg', foto: 'img/prato-404-wrap-integral-de-frango', alt: 'Wrap de frango cortado ao meio com alface e tomate, e salada ao lado' }
        ] },
        { nome: 'Bebidas', pratos: [
          { id: 405, nome: 'Suco verde', descricao: 'Couve, maçã, limão e gengibre, 500 ml.', preco: 1390, imagem: 'img/bebida.svg', foto: 'img/prato-405-suco-verde', alt: 'Copo de suco verde com gelo' },
          { id: 406, nome: 'Água de coco', descricao: 'Garrafa de 300 ml.', preco: 890, imagem: 'img/bebida.svg', foto: 'img/prato-406-agua-de-coco', alt: 'Coco jovem aberto com canudo para beber a água' }
        ] }
      ]
    },
    {
      id: 5, nome: 'Doce Encontro', categoria: 'doces', nota: 4.9, tempo: [30, 45], taxa: 699, imagem: 'img/doce.svg', foto: 'img/restaurante-5-doce-encontro', alt: 'Fatia de bolo de chocolate com cobertura e chantili em prato de metal',
      secoes: [
        { nome: 'Bolos e tortas', pratos: [
          { id: 501, nome: 'Fatia de bolo de cenoura', descricao: 'Com cobertura generosa de brigadeiro.', preco: 1490, imagem: 'img/doce.svg', foto: 'img/prato-501-fatia-de-bolo-de-cenoura', alt: 'Bolo de cenoura com cobertura de chocolate, já cortado' },
          { id: 502, nome: 'Torta de limão', descricao: 'Massa amanteigada, creme de limão e merengue.', preco: 1690, imagem: 'img/doce.svg', foto: 'img/prato-502-torta-de-limao', alt: 'Torta de limão com merengue tostado em prato branco' },
          { id: 503, nome: 'Cheesecake de frutas vermelhas', descricao: 'Base crocante e calda de frutas vermelhas.', preco: 1890, imagem: 'img/doce.svg', foto: 'img/prato-503-cheesecake-de-frutas-vermelhas', alt: 'Fatia de cheesecake com framboesas, mirtilos e calda vermelha' }
        ] },
        { nome: 'Docinhos', pratos: [
          { id: 504, nome: 'Caixa com 12 brigadeiros', descricao: 'Brigadeiros gourmet sortidos.', preco: 3990, imagem: 'img/doce.svg', foto: 'img/prato-504-caixa-com-12-brigadeiros', alt: 'Brigadeiros com granulado de chocolate em forminhas douradas' },
          { id: 505, nome: 'Brownie com nozes', descricao: 'Brownie úmido de chocolate meio amargo.', preco: 1290, imagem: 'img/doce.svg', foto: 'img/prato-505-brownie-com-nozes', alt: 'Brownies de chocolate com nozes empilhados em prato' }
        ] },
        { nome: 'Bebidas', pratos: [
          { id: 506, nome: 'Café coado', descricao: 'Copo de 250 ml, grãos do sul de Minas.', preco: 790, imagem: 'img/bebida.svg', foto: 'img/prato-506-cafe-coado', alt: 'Xícara de café preto com pires e colher' },
          { id: 507, nome: 'Chocolate quente', descricao: 'Chocolate cremoso com canela.', preco: 1290, imagem: 'img/bebida.svg', foto: 'img/prato-507-chocolate-quente', alt: 'Chocolate quente cremoso com desenho de espuma na xícara' }
        ] }
      ]
    },
    {
      id: 6, nome: 'Pizzaria Napolitana Bella Notte', categoria: 'pizza', nota: 4.4, tempo: [35, 50], taxa: 0, imagem: 'img/pizza.svg', foto: 'img/restaurante-6-pizzaria-napolitana-bella-notte', alt: 'Pizza napolitana com bordas tostadas, tomates, muçarela de búfala e manjericão',
      secoes: [
        { nome: 'Pizzas', pratos: [
          { id: 601, nome: 'Napolitana de Pepperoni', descricao: 'Massa de fermentação natural e pepperoni artesanal.', preco: 5690, imagem: 'img/pizza.svg', foto: 'img/prato-601-napolitana-de-pepperoni', alt: 'Pizza napolitana de pepperoni com bordas tostadas e cortador ao lado' },
          { id: 602, nome: 'Napolitana de Abobrinha', descricao: 'Abobrinha grelhada, ricota e hortelã.', preco: 4990, imagem: 'img/pizza.svg', foto: 'img/prato-602-napolitana-de-abobrinha', alt: 'Pizza com fatias finas de abobrinha, tomate e cebola sobre tábua' },
          { id: 603, nome: 'Marinara', descricao: 'Molho de tomate, alho, orégano e azeite.', preco: 3990, imagem: 'img/pizza.svg', foto: 'img/prato-603-marinara', alt: 'Pizza marinara com molho de tomate, alho e orégano' }
        ] },
        { nome: 'Entradas', pratos: [
          { id: 604, nome: 'Bruschetta de tomate', descricao: '4 fatias de pão italiano com tomate e manjericão.', preco: 2290, imagem: 'img/salada.svg', foto: 'img/prato-604-bruschetta-de-tomate', alt: 'Fatias de pão italiano tostado cobertas com tomate fresco picado' },
          { id: 605, nome: 'Burrata com pesto', descricao: 'Burrata cremosa, pesto de manjericão e torradas.', preco: 4490, imagem: 'img/salada.svg', foto: 'img/prato-605-burrata-com-pesto', alt: 'Burrata cremosa com pesto de manjericão e folhas verdes' }
        ] },
        { nome: 'Sobremesas', pratos: [
          { id: 606, nome: 'Tiramisù', descricao: 'Receita tradicional com mascarpone e café.', preco: 2190, imagem: 'img/doce.svg', foto: 'img/prato-606-tiramisu', alt: 'Fatia de tiramisù polvilhada com cacau em prato branco' }
        ] }
      ]
    }
  ]
};
