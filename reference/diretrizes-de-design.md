# Diretrizes de Design — Identidade Visual do Sistema

## O Conceito: "A Cidade Sob o Véu"

Toda decisão visual deste projeto parte de uma única imagem: **a cidade comum à noite, vista por quem enxerga o oculto**. O preto é o concreto e a madrugada; o branco é a luz fria dos postes e a página do dossiê; o roxo é o véu — a frequência que só os iniciados percebem, o neon do clube que não está em nenhum mapa.

Isso significa que o design nunca é "fantasia medieval" (nada de pergaminhos, floreios, bordas ornamentadas) nem "cyberpunk puro" (nada de glitch excessivo, HUDs, verde-matrix). O tom é **dossiê sobrenatural**: sóbrio, urbano, moderno — com o roxo aparecendo como uma presença que não deveria estar ali.

**Três palavras-guia para qualquer decisão:** *urbano, oculto, contido.*
Na dúvida, remova um enfeite.

---

## 1. Paleta de Cores

A paleta inteira vive no eixo branco–preto–roxo. Nenhuma outra família de cor entra — sem dourados, sem vermelhos, sem azuis. Quando algo precisar de destaque, a resposta é sempre um dos roxos.

### Tokens

| Token | Hex | Papel |
|:---|:---|:---|
| **Noite** | `#0B0A10` | O preto-base. Fundos no modo escuro. Não é preto puro: tem um sopro de roxo. |
| **Concreto** | `#1C1824` | Superfícies elevadas sobre o Noite: caixas, cartões, células de tabela. |
| **Névoa** | `#8E8A99` | Cinza-arroxeado para texto secundário, legendas, metadados. |
| **Véu** | `#F6F4FA` | O "branco" do sistema. Fundos no modo claro, texto sobre o escuro. Nunca `#FFFFFF` puro. |
| **Roxo Ritual** | `#5B21B6` | O roxo profundo. Títulos no modo claro, fundos de destaque, elementos densos. |
| **Roxo Neon** | `#8B5CF6` | O roxo vivo. Links, marcadores, bordas de destaque, o "brilho" do oculto. |
| **Lilás Espectral** | `#C9B8F0` | O roxo etéreo. Detalhes sutis, texto de destaque sobre fundo escuro, estados suaves. |

### Regras de uso

- **O roxo é presença, não papel de parede.** Proporção-alvo: ~80% preto/branco, ~15% roxos em estrutura (bordas, títulos, marcadores), ~5% Roxo Neon em pontos focais. Uma página inteiramente roxa perdeu o mistério.
- **Dois modos, um mundo:**
  - **Modo Noturno** (padrão para telas, PDF de leitura, apresentações): fundo Noite, texto Véu, estrutura em roxos;
  - **Modo Diurno** (padrão para impressão e para a ficha de personagem): fundo Véu, texto Noite, estrutura em Roxo Ritual. Economiza tinta e mantém a identidade.
- **Contraste é inegociável:** texto corrido só em Véu-sobre-Noite ou Noite-sobre-Véu. Roxo Neon e Lilás nunca em texto pequeno sobre Véu (contraste insuficiente); Roxo Ritual nunca em texto pequeno sobre Noite.
- **Gradientes:** permitidos apenas entre roxos (Ritual → Neon) e apenas em elementos finos — divisores, bordas, barras. Nunca em fundos de texto.

---

## 2. Tipografia

Três vozes, três papéis. Todas disponíveis no Google Fonts:

| Papel | Fonte | Personalidade |
|:---|:---|:---|
| **Display** — títulos de capítulo, logotipo, números grandes | **Unbounded** | Geométrica, expansiva, com cara de letreiro de neon. É a voz do sobrenatural invadindo a página. |
| **Corpo** — texto corrido, descrições, narrativa | **Lora** | Serifada, calorosa, excelente em leitura longa. É a voz do livro. |
| **Utilitária** — tabelas, tags, fichas, dados, legendas | **Space Mono** | Monoespaçada, com cara de dossiê policial e arquivo confidencial. É a voz da mecânica. |

### Escala e regras

- **H1 (capítulo):** Unbounded, caixa-alta, espaçamento de letras +8%, precedido do número do capítulo em Space Mono pequeno (ex.: `CAP. 08`) em Roxo Neon;
- **H2 (seção):** Unbounded, peso regular, tamanho contido (~60% do H1) — o display cansa rápido, use com parcimônia;
- **H3 e menores:** Lora em negrito, nunca Unbounded — abaixo de H2, o display vira ruído;
- **Corpo:** Lora, 10.5–11.5pt no impresso / 16–18px na tela, entrelinha 1.5–1.6;
- **Tabelas e tags:** sempre Space Mono, corpo menor (85% do texto), caixa-alta para nomes de Tags;
- **Itálico** reservado para nomes de Tags no corpo do texto (*Atlético*, *Maldição do Sol*) e citações de exemplo. **Negrito** para termos mecânicos na primeira ocorrência.

---

## 3. A Assinatura Visual: o Fio do Véu

Todo sistema visual precisa de um elemento que seja só dele. O nosso é o **Fio do Véu**: um divisor horizontal fino (1px) em gradiente Roxo Ritual → Roxo Neon que **se dissolve em pontos** na extremidade direita — como uma linha de realidade se desfazendo.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ─ ─ ‥ ‥ ·  ·   ·
```

- Usado para separar seções principais dentro de um capítulo;
- Sempre dissolvendo para a direita (em páginas espelhadas de livro impresso, dissolve para fora da lombada);
- É o **único** ornamento recorrente do sistema. Nenhum outro floreio compete com ele.

### Sigilos de capítulo

Cada capítulo recebe um **sigilo**: um pequeno glifo geométrico (círculo, traços retos, no máximo 5 linhas), traço fino em Roxo Neon, ao lado do número do capítulo. Estética de símbolo ritual desenhado com régua — oculto, mas moderno. Os sigilos nunca são decorativos soltos: aparecem apenas no cabeçalho do capítulo e, minúsculos, no rodapé das páginas daquele capítulo (funcionando como navegação).

---

## 4. Componentes Padrão

A linguagem dos elementos recorrentes do livro e da ficha:

### Tags
A unidade central do sistema merece tratamento próprio: **chips retangulares de cantos retos**, Space Mono caixa-alta, com borda de 1px.
- **Tags positivas:** borda Roxo Neon, texto Véu (modo escuro) ou borda Roxo Ritual, texto Noite (modo claro);
- **Tags negativas:** mesmo chip, **invertido** — fundo roxo, texto Véu — e precedido do prefixo `−` (positivas usam `+`);
- Nunca usar verde/vermelho para positivo/negativo: o eixo é sempre roxo, o sinal vem do preenchimento e do prefixo.

### Tabelas de rolagem (d20, d100...)
- Cabeçalho em Space Mono caixa-alta sobre fundo Concreto (escuro) ou Roxo Ritual com texto Véu (claro);
- Coluna de número do dado sempre à esquerda, alinhada ao centro, em Roxo Neon;
- Linhas zebradas com variação sutil (Noite/Concreto ou Véu/lilás a 8% de opacidade);
- Sem bordas verticais — só fios horizontais finos em Névoa a 30%.

### Caixas especiais
- **Nota para o Mestre:** caixa com filete esquerdo de 3px em Roxo Neon, fundo Concreto (ou lilás a 10% no claro), título `NOTA PARA O MESTRE` em Space Mono;
- **Exemplos de jogo:** recuados, em Lora itálico, com o nome do personagem-exemplo (Kai) em romano — sem caixa, só o recuo e um fio vertical fino em Névoa;
- **Regra de ouro / destaques:** citação centralizada em Lora itálico, ladeada por dois Fios do Véu curtos.

### Dados e trilhas
- Resultados de dado representados como **quadrados de canto reto** com o número dentro (nunca clipart de dado em perspectiva). Dados de Ação: contorno Roxo Neon; dados de Risco: preenchidos em Roxo Ritual com número em Véu;
- A **trilha de ferimentos** (4 níveis) é a exceção geométrica intencional: **losangos** vazados que se preenchem de roxo conforme o dano — o único elemento não-retangular do sistema, para que o olho o ache instantaneamente na ficha.

---

## 5. Diagramação

- **Grid:** livro em coluna única com margem externa generosa (30–35% da largura) usada para números de dado, sigilos e anotações marginais — estética de dossiê anotado. Ficha em grid de 12 colunas;
- **Cantos retos em tudo.** Nenhum border-radius: a cidade é feita de esquinas. A única curva permitida no sistema inteiro é o círculo dos sigilos;
- **Espaço em branco é o véu.** Diagramação respirada: melhor uma página a mais que uma página abarrotada. Blocos separados por espaço primeiro, Fio do Véu depois, caixa por último;
- **Hierarquia por peso e cor, não por tamanho:** evitar escadas de 6 tamanhos de fonte; preferir 3 tamanhos bem distintos + variações de peso e cor;
- **Numeração de páginas** em Space Mono no canto externo inferior, acompanhada do sigilo do capítulo.

---

## 6. Imagens e Ilustrações

Quando houver imagens, elas seguem uma única receita — **duotone Noite + roxo**:

- **Assunto:** paisagens urbanas contemporâneas (becos, metrôs, coberturas, fiação, letreiros) com **um elemento discretamente errado** — uma silhueta a mais, olhos na sombra, um símbolo no muro. O sobrenatural sugerido, nunca escancarado;
- **Tratamento:** alto contraste, pretos fechados, luz em Roxo Neon/Lilás; granulação sutil de filme (ruído a 3–5%) para textura;
- **Proibido:** fotos realistas sem tratamento, artes de fantasia medieval, renders 3D lustrosos, criaturas em close detalhado (o monstro visto por inteiro perde o poder);
- **Silhuetas e manchas** funcionam melhor que retratos: o leitor completa o horror;
- Em documentos sem orçamento de ilustração, **texturas servem de imagem:** um fundo Noite com grão e um facho de gradiente roxo já carrega o clima.

### Iconografia
Ícones de linha fina (1.5px), cantos vivos, monocromáticos em Roxo Neon ou Névoa. Nada de ícones preenchidos ou emoji.

---

## 7. Aplicações

| Peça | Modo | Observações |
|:---|:---|:---|
| **Livro compacto (PDF/tela)** | Noturno | Capa: Noite + título em Unbounded + um sigilo grande; capítulos abrem com página de respiro. |
| **Livro para impressão** | Diurno | Mesma diagramação, paleta invertida; Fio do Véu e chips mantêm o roxo. |
| **Ficha de personagem** | Diurno | Prioridade absoluta: usabilidade a lápis. Roxo só em estrutura (títulos de bloco, trilha de ferimentos, fios); campos de escrita amplos; os 4 blocos de criação visualmente distintos. |
| **Cartões de referência / telas do mestre** | Noturno | Densidade maior tolerada; Space Mono domina. |

---

## 8. O Que Nunca Fazer

- Introduzir cores fora do eixo branco–preto–roxo (inclusive verde/vermelho para positivo/negativo);
- Usar mais de um ornamento por página além do Fio do Véu;
- Unbounded em texto corrido ou abaixo de H2;
- Border-radius, sombras difusas coloridas, gradientes em fundos de leitura;
- Clichês de fantasia (pergaminho, texturas de couro, capitulares góticas) e clichês cyberpunk (glitch, scanlines, verde-terminal);
- Roxo puro saturado (`#7F00FF`-likes) — nossos roxos têm sempre um pé no azul e no cinza da cidade;
- Encher espaço vazio. O vazio é o véu: ele fica.

---

> **Resumo em uma frase:** um dossiê sóbrio de papel e concreto, atravessado por um fio de neon roxo que não deveria existir — e que só quem joga consegue ver.
