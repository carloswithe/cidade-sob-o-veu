# Changelog

Todas as mudanças notáveis deste sistema serão documentadas aqui.

## [0.1.3] — 2026-07-15

### Alterado (experimental)
- Compêndios recompilados no formato **NeDB** (um arquivo por pacote) em vez de LevelDB (uma pasta com vários arquivos binários). Tentativa de contornar um relato de instância no The Forge onde `game.packs` não carregava nenhum compêndio (nem de outros sistemas) mesmo com o system.json e os dados corretos e verificados. `scripts/build-packs.mjs` agora aceita `NEDB=1 npm run build:packs` para escolher o formato. Se isso não resolver no Forge, o próximo passo é revisar os logs de servidor da instância.

## [0.1.2] — 2026-07-15

### Corrigido
- Corrige a ordem das regras em `.gitattributes` (a genérica `* text=auto` vinha depois da específica `packs/**/* -text` e a sobrescrevia, então o `-text` nunca era aplicado de verdade). Esse era o bug real por trás dos dropdowns de Ancestralidade/Arquétipo/Profissão/Trauma aparecerem vazios: o `git archive` convertia `\n` em `\r\n` dentro do arquivo interno `CURRENT` do LevelDB (de 16 para 17 bytes), fazendo o Foundry procurar um arquivo de manifesto que não existia e tratar o compêndio como vazio. Compêndios recompilados e verificados byte a byte após a correção.

## [0.1.1] — 2026-07-15

### Corrigido
- Adicionado `template.json` declarando os tipos de Actor (`personagem`, `adversario`, `lendario`) e Item (`tag`, `arquetipo`, `ancestralidade`, `profissao`, `trauma`, `mitem`). Sem ele, o Foundry não sabia que tipos existiam e a criação de qualquer Actor falhava com `DataModelValidationError: type: may not be undefined` — o registro em `CONFIG.Actor.dataModels` via código dá o *schema*, mas o `template.json` é o que declara a *lista de tipos* em si.

## [0.1.0] — 2026-07-15

### Adicionado
- Primeira versão pública do sistema **A Cidade Sob o Véu** para Foundry VTT.
- Data Models de Actor: Personagem, Adversário, Lendário.
- Data Models de Item: Tag, Arquétipo, Ancestralidade, Profissão, Trauma, Item Mágico/Aprimorado.
- Motor de rolagem Ação vs. Risco com anulação, Ampliações e Token de Sorte.
- Diálogo de negociação de rolagem com seleção de Tags.
- Fichas de Personagem, Adversário e Lendário em Handlebars, portando o visual de `ficha-interativa.html`.
- Compêndios: Arquétipos (10), Ancestralidades (8), Profissões (100), Traumas (100), Adversários (20), Cem Ameaças da Cidade (100).
- Automação de dano sofrido/causado por categoria de arma (Capítulos 8 e 11).
- Suporte a Lendários com Fases, Limiar, Presença e Retaliação (Capítulo 12).
