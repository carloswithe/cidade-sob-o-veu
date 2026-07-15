# Spec — Sistema Foundry VTT: A Cidade Sob o Véu

> Documento de handoff para implementação via Claude Code. Escopo definido: **sistema completo** (ficha + rolador automatizado + compêndios), ficha baseada no layout de `ficha-interativa.html`, compêndios incluídos já na v1.

---

## 1. Visão geral do que será construído

Um **system package** do Foundry VTT (não um module) chamado `cidade-sob-o-veu`, instalável em qualquer instância Foundry v12/v13 via URL de manifest apontando para o `system.json` no GitHub (raw). Ele vai conter:

1. Data Models de Actor (Personagem, Adversário, Lendário) e Item (Tag, Arquétipo, Ancestralidade, Profissão, Trauma, Item Mágico/Aprimorado, Relíquia)
2. Fichas em Handlebars, reaproveitando o layout/CSS de `ficha-interativa.html`
3. Um rolador de dados customizado que implementa a mecânica de Ação vs. Risco com anulação e Ampliações
4. Compêndios prontos: Arquétipos, Ancestralidades, Profissões, Traumas, Adversários, Ameaças/Relíquias
5. `system.json` configurado para instalação e atualização via manifest URL no GitHub

---

## 2. Estrutura de pastas do repositório

```
cidade-sob-o-veu/
├── system.json
├── template.json              # (opcional, legado — hoje usamos DataModel em JS)
├── LICENSE.txt
├── README.md
├── CHANGELOG.md
├── module/
│   ├── cidade-sob-o-veu.mjs   # entry point, registra tudo
│   ├── data/
│   │   ├── actor-personagem.mjs
│   │   ├── actor-adversario.mjs
│   │   ├── actor-lendario.mjs
│   │   ├── item-tag.mjs
│   │   ├── item-arquetipo.mjs
│   │   ├── item-ancestralidade.mjs
│   │   ├── item-profissao.mjs
│   │   ├── item-trauma.mjs
│   │   ├── item-mitem.mjs      # item mágico/aprimorado
│   │   └── item-relíquia.mjs
│   ├── documents/
│   │   ├── actor.mjs           # classe CVActor com métodos de vida/dano
│   │   └── item.mjs
│   ├── sheets/
│   │   ├── actor-personagem-sheet.mjs
│   │   ├── actor-adversario-sheet.mjs
│   │   ├── actor-lendario-sheet.mjs
│   │   └── item-sheet.mjs
│   ├── dice/
│   │   └── roller.mjs          # motor de Ação vs. Risco
│   ├── apps/
│   │   └── roll-dialog.mjs     # diálogo de negociação (monta o bolo antes de rolar)
│   └── helpers/
│       └── handlebars-helpers.mjs
├── templates/
│   ├── actor/
│   │   ├── personagem-sheet.hbs
│   │   ├── adversario-sheet.hbs
│   │   └── lendario-sheet.hbs
│   ├── item/
│   │   └── item-sheet.hbs
│   ├── dialogs/
│   │   └── roll-dialog.hbs
│   └── partials/
│       ├── tag-list.hbs
│       └── vida-trilha.hbs
├── styles/
│   └── cidade-sob-o-veu.css    # portado do CSS da ficha-interativa.html
├── lang/
│   └── pt-BR.json               # idioma nativo (não precisa de en.json na v1)
├── assets/
│   ├── icons/
│   └── cidade-sob-o-veu-icon.png
└── packs/
    ├── arquetipos.db           # compêndio, formato LevelDB (Foundry v10+)
    ├── ancestralidades.db
    ├── profissoes.db
    ├── traumas.db
    ├── adversarios.db
    └── ameacas-relíquias.db
```

---

## 3. `system.json` (manifest)

```json
{
  "id": "cidade-sob-o-veu",
  "title": "A Cidade Sob o Véu",
  "description": "Sistema de RPG de fantasia urbana sobrenatural baseado em Tags e Dados de Ação/Risco.",
  "authors": [{ "name": "Carlos" }],
  "url": "https://github.com/SEU_USUARIO/cidade-sob-o-veu",
  "license": "LICENSE.txt",
  "readme": "README.md",
  "bugs": "https://github.com/SEU_USUARIO/cidade-sob-o-veu/issues",
  "changelog": "CHANGELOG.md",
  "version": "0.1.0",
  "compatibility": { "minimum": 12, "verified": "13" },
  "esmodules": ["module/cidade-sob-o-veu.mjs"],
  "styles": ["styles/cidade-sob-o-veu.css"],
  "languages": [
    { "lang": "pt-BR", "name": "Português (Brasil)", "path": "lang/pt-BR.json" }
  ],
  "packs": [
    { "name": "arquetipos", "label": "Arquétipos", "path": "packs/arquetipos.db", "type": "Item", "system": "cidade-sob-o-veu" },
    { "name": "ancestralidades", "label": "Ancestralidades", "path": "packs/ancestralidades.db", "type": "Item", "system": "cidade-sob-o-veu" },
    { "name": "profissoes", "label": "Profissões", "path": "packs/profissoes.db", "type": "Item", "system": "cidade-sob-o-veu" },
    { "name": "traumas", "label": "Traumas", "path": "packs/traumas.db", "type": "Item", "system": "cidade-sob-o-veu" },
    { "name": "adversarios", "label": "Adversários", "path": "packs/adversarios.db", "type": "Actor", "system": "cidade-sob-o-veu" },
    { "name": "ameacas-reliquias", "label": "Ameaças e Relíquias", "path": "packs/ameacas-reliquias.db", "type": "Item", "system": "cidade-sob-o-veu" }
  ],
  "primaryTokenAttribute": "vida.valor",
  "gridDistance": 1,
  "gridUnits": "m",
  "manifest": "https://raw.githubusercontent.com/SEU_USUARIO/cidade-sob-o-veu/main/system.json",
  "download": "https://github.com/SEU_USUARIO/cidade-sob-o-veu/releases/download/0.1.0/cidade-sob-o-veu-0.1.0.zip"
}
```

**Pontos de atenção:**
- Substitua `SEU_USUARIO` pelo seu handle do GitHub em todos os campos.
- `manifest` sempre aponta pra `main` (rolling), `download` sempre aponta pra uma **tag de release** específica. É assim que o Foundry detecta atualizações sem quebrar quem está numa versão antiga.
- Depois do primeiro release, toda atualização = subir `version`, criar uma nova tag/release no GitHub com o zip, e o `manifest` já vai refletir a mudança automaticamente porque ele lê direto do `main`.

---

## 4. Data Models — Actor: Personagem

Reflete exatamente o Capítulo 2 (7 Tags positivas + 7 negativas) e o Capítulo 8 (vida/ferimentos):

```js
// module/data/actor-personagem.mjs
export default class PersonagemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { StringField, NumberField, HTMLField, ArrayField, SchemaField } = foundry.data.fields;
    return {
      conceito: new StringField({ initial: "" }),
      jogador: new StringField({ initial: "" }),
      nivel: new NumberField({ initial: 1, min: 1 }),
      xp: new SchemaField({
        atual: new NumberField({ initial: 0 }),
        proximoNivel: new NumberField({ initial: 5 })
      }),
      // 4 blocos de criação — cada Tag é referenciada por Item embutido (tipo "tag"),
      // mas os campos abaixo guardam a relação de origem para a ficha organizar visualmente
      estiloDeVida: new StringField({
        initial: "Modesto",
        choices: ["Miserável","Precário","Modesto","Confortável","Abastado","Milionário"]
      }),
      vida: new SchemaField({
        pontos: new NumberField({ initial: 0, min: 0, max: 4 }), // dano acumulado
        ferimentos: new ArrayField(new SchemaField({
          nome: new StringField({ initial: "" }),
          nivel: new StringField({ choices: ["Leve","Moderado","Severo","Fatal"] })
        }))
      }),
      tokenSorte: new NumberField({ initial: 1, min: 0, max: 1 }),
      equipamento: new HTMLField({ initial: "" }),
      protecao: new StringField({ initial: "" }), // descrição da proteção comum ativa
      notas: new HTMLField({ initial: "" })
    };
  }
}
```

As **7+7 Tags** não vivem como texto solto: cada uma é um **Item embutido do tipo `tag`**, com um campo `origem` (`caracteristica`, `ancestralidade`, `arquetipo`, `antecedente`, `ferimento`, `item-magico`) e `polaridade` (`positiva`/`negativa`). Isso é o que permite ao rolador **listar tags clicáveis** no diálogo de rolagem — exatamente a UX que você já tem na ficha HTML com os contadores `qCount`/`vCount`/`eCount`.

```js
// module/data/item-tag.mjs
export default class TagData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { StringField, BooleanField } = foundry.data.fields;
    return {
      polaridade: new StringField({ choices: ["positiva","negativa"], initial: "positiva" }),
      origem: new StringField({
        choices: ["caracteristica","ancestralidade","arquetipo","antecedente","ferimento","item-magico"],
        initial: "caracteristica"
      }),
      descricao: new StringField({ initial: "" }),
      ativa: new BooleanField({ initial: true }) // permite "desligar" uma Tag temporariamente
    };
  }
}
```

---

## 5. Data Models — Actor: Adversário e Lendário

Reflete o Capítulo 11 (Porte/Vitalidade/Arma/Tags) e o Capítulo 12 (Fases, Limiar, Presença, Retaliação):

```js
// module/data/actor-adversario.mjs
export default class AdversarioData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const { StringField, NumberField, HTMLField } = foundry.data.fields;
    return {
      porte: new StringField({
        choices: ["Capanga","Ameaça","Adversário à Altura","Colosso"],
        initial: "Capanga"
      }),
      vitalidade: new SchemaField({
        max: new NumberField({ initial: 1, min: 1, max: 6 }),
        atual: new NumberField({ initial: 1, min: 0 })
      }),
      categoriaArma: new StringField({
        choices: ["I — Impacto","II — Letal Leve","III — Letal","IV — Devastadora"],
        initial: "I — Impacto"
      }),
      protecao: new StringField({ initial: "" }),
      descricao: new HTMLField({ initial: "" })
      // Tags também como Items embutidos tipo "tag" (positiva = risco pro jogador, negativa = fraqueza)
    };
  }
}
```

Lendário (`actor-lendario.mjs`) estende essa base e adiciona `fases` (array de `{nome, limiar, habilidades, presenca}`) e `retaliacao`, seguindo `capitulo-lendarios.md` / `capitulo-lendarios-da-cidade.md`.

---

## 6. Motor de rolagem (o coração do sistema)

Implementação literal do Capítulo 1. Fluxo:

1. **Diálogo de negociação** (`roll-dialog.hbs`): lista as Tags ativas do Actor com checkbox, permite adicionar dados de Ação/Risco extras "da cena" (que o mestre concede na negociação) e mostra o total antes de rolar.
2. **Rolagem**: rola `nAção` d6 + `nRisco` d6 usando o `Roll` API do Foundry (`new Roll("{nAção}d6 + {nRisco}d6")` com fórmulas separadas por cor/flavor).
3. **Anulação**: cada dado de Risco anula o maior dado de Ação de valor **igual ou menor**, um-para-um.
4. **Leitura**: maior dado de Ação restante → tabela de resultado; 6s extras → Ampliações.
5. **Token de Sorte** (opcional, regra de mesa): botão no chat card pra ajustar ±1 um dado antes da leitura, consumindo o token do Actor.

```js
// module/dice/roller.mjs (pseudocódigo funcional)
export async function rolarAcaoRisco({ acao = 1, risco = 0, flavor = "" } = {}) {
  const roll = await new Roll(`${acao}d6 + ${risco}d6`).evaluate();
  const dados = roll.dice; // [0] = Ação, [1] = Risco, conforme ordem da fórmula
  let acaoVals = dados[0]?.results.map(r => r.result) ?? [];
  const riscoVals = dados[1]?.results.map(r => r.result).sort((a,b) => b - a) ?? [];

  for (const r of riscoVals) {
    // anula o maior dado de Ação <= r
    const alvos = acaoVals.filter(v => v <= r).sort((a,b) => b - a);
    if (alvos.length) {
      const alvo = alvos[0];
      acaoVals.splice(acaoVals.indexOf(alvo), 1);
    }
  }

  if (!acaoVals.length) {
    return { resultado: "Falha Crítica", detalhe: "Anulação total", ampliacoes: 0, roll };
  }

  acaoVals.sort((a,b) => b - a);
  const maior = acaoVals[0];
  const seis = acaoVals.filter(v => v === 6).length;
  const ampliacoes = Math.max(0, seis - 1);

  const tabela = {
    6: "Sucesso Espetacular",
    5: "Sucesso Parcial", 4: "Sucesso Parcial",
    3: "Falha Parcial", 2: "Falha Parcial",
    1: "Falha Crítica"
  };

  return { resultado: tabela[maior], ampliacoes, restantes: acaoVals, roll };
}
```

O chat card resultante mostra: dados de Ação (cor 1) x dados de Risco (cor 2), quais foram anulados (riscados visualmente), o resultado final e quantas Ampliações sobraram — exatamente a "leitura instantânea na mesa" que o capítulo pede.

Dano (Capítulo 8/11) é uma segunda função que consulta a categoria de arma + resultado da rolagem e devolve o valor de dano, com botão de aplicar direto na vitalidade do alvo selecionado (token).

---

## 7. Ficha (Character Sheet)

Reaproveitando `ficha-interativa.html` como referência **visual e de campos** — os `id`s que você já usa (`qualidades`, `defeitos`, `ancTags`, `especialidades`, `vicios`, `aprendizados`, `traumas`, `f_nome`, `f_jogador`, `f_conceito`, `f_ancestral`, `f_arq`, `f_prof`, `f_equip`, `f_protecao`, `f_notas`, `vidaGrid`, `ferGrid`, `tokenBox`, `xpbar`) mapeiam quase 1:1 para os campos do Data Model acima. Isso significa que o CSS (cores, tipografia, grid da trilha de vida) pode ser **portado quase sem alteração** — só adaptando seletores para a estrutura de `ApplicationV2`/Handlebars do Foundry em vez de um HTML solto.

Estrutura da ficha:
- **Cabeçalho**: nome, conceito, jogador, nível, XP (barra clicável)
- **Trilha de Vida**: 4 quadrados clicáveis (Leve/Moderado/Severo/Fatal), cada um abre um campo de nome de ferimento — replica `vidaGrid`/`ferGrid`
- **Tags positivas/negativas**: duas colunas, cada Tag é um item embutido arrastável, com botão de "rolar com esta Tag" que já abre o diálogo de negociação pré-marcada
- **Estilo de Vida, Equipamento, Proteção, Notas**: campos de texto livre, como hoje
- **Token de Sorte**: checkbox/badge no estilo do `tokenBox` atual

---

## 8. Compêndios (v1 completa)

Cada capítulo de compêndio vira um pacote de Items (ou Actors, no caso de adversários) pré-populados:

| Compêndio | Fonte | Tipo Foundry | Conteúdo |
|:---|:---|:---|:---|
| Arquétipos | `capitulo-arquetipos.md` | Item (`arquetipo`) | cada arquétipo com suas 20 Especialidades + 20 Vícios/Limitações |
| Ancestralidades | `capitulo-ancestralidades.md` | Item (`ancestralidade`) | cada ancestralidade com 2 Virtudes + 2 Vulnerabilidades |
| Profissões | `capitulo-compendio-de-profissoes.md` | Item (`profissao`) | lista de profissões sugeridas |
| Traumas | `capitulo-compendio-de-traumas.md` | Item (`trauma`) | lista de traumas sugeridos |
| Adversários | `capitulo-compendio-de-adversarios.md` + exemplos do Cap. 11 | Actor (`adversario`) | prontos pra arrastar pra cena |
| Ameaças/Relíquias | `capitulo-cem-ameacas.md` | Item (`item-magico`) | as 100 ameaças/relíquias como Itens com Dádivas/Maldições |

Esses compêndios são gerados via **script Node** que faz parsing dos `.md` (já estruturados em tabelas/listas) e produz os arquivos `.db` (formato LevelDB do Foundry) — isso o Claude Code consegue automatizar direto lendo seus arquivos de capítulo.

---

## 9. Passo a passo de execução (o que pedir ao Claude Code)

1. **Criar o repositório** `cidade-sob-o-veu` no seu GitHub (público, pra `raw.githubusercontent.com` funcionar sem autenticação).
2. **Bootstrapping**: gerar a estrutura de pastas da seção 2, com `system.json` da seção 3.
3. **Data Models + Documents**: implementar as classes das seções 4–5.
4. **Roller**: implementar `roller.mjs` + `roll-dialog` conforme seção 6, com testes unitários simples pros casos de anulação (os exemplos do próprio capítulo servem de casos de teste).
5. **Fichas**: portar `ficha-interativa.html` para os templates Handlebars + CSS, seção 7.
6. **Compêndios**: escrever o script de parsing dos `.md` → `.db`, rodar e popular os 6 packs.
7. **Testar localmente**: instalar o Foundry (ou usar uma instância que você já tenha), apontar `Install System` pra pasta local ou pro manifest de um branch de teste.
8. **Primeiro release**: tag `v0.1.0` no GitHub → gera o `.zip` (pode usar GitHub Actions pra automatizar isso a cada tag) → atualizar `download` no `system.json` → dar `git push`.
9. **Instalar via manifest**: no Foundry, `Install System` → colar `https://raw.githubusercontent.com/SEU_USUARIO/cidade-sob-o-veu/main/system.json`.

---

## 10. Decisões em aberto pra quando formos gerar

Isso não trava o início do trabalho, mas vale decidir antes do Claude Code fechar a v1:
- **Automação de dano em combate**: o botão "aplicar dano" no chat card deve mirar automaticamente o token selecionado, ou pedir confirmação manual?
- **Lendários**: as Fases (Cap. 12) merecem uma ficha própria com abas, ou cabem numa extensão da ficha de Adversário?
- **GitHub Actions para release**: quer que cada `git tag` já dispare o build do `.zip` automaticamente, ou prefere fazer isso manualmente no início?

Qualquer uma dessas o Claude Code pode decidir com bom senso e a gente ajusta depois — não é bloqueante.
