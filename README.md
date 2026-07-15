# A Cidade Sob o Véu — Sistema para Foundry VTT

Sistema de RPG de fantasia urbana sobrenatural para [Foundry Virtual Tabletop](https://foundryvtt.com/), baseado inteiramente em **Tags** e num motor de dados **Ação vs. Risco** (d6). Sem atributos, sem classes de personagem tradicionais — só o que o personagem *é* (Tags positivas) contra o que está *contra ele* (Tags negativas), decidido num bolo de dados só.

## Instalação

No Foundry, em **Game Systems → Install System**, cole o manifest:

```
https://raw.githubusercontent.com/carloswithe/cidade-sob-o-veu/main/system.json
```

Requer Foundry VTT **v12** ou **v13**.

## O que o sistema traz

- **Fichas completas** de Personagem, Adversário e Lendário, com o visual "dossiê sobrenatural" (preto, branco e roxo) definido em `diretrizes-de-design.md`.
- **Rolador automático** do motor de Ação vs. Risco: monta o bolo a partir das Tags ativas do personagem, resolve anulação, lê o resultado e calcula Ampliações — tudo com um clique.
- **Trilha de Ferimentos** interativa (4 níveis: Leve/Moderado/Severo/Fatal) com aplicação automática de dano por categoria de arma (Capítulo 8).
- **Suporte a Lendários**: Fases, Limiar (dano capado exceto por Fraqueza), Presença (Risco automático) e Retaliação (Avanços de Agenda em Falha Crítica).
- **Seis compêndios prontos**: Arquétipos, Ancestralidades, Profissões, Traumas, Adversários e Cem Ameaças da Cidade.

## Estrutura do repositório

```
cidade-sob-o-veu/
├── system.json              # manifest do sistema
├── module/                   # código-fonte (ESM)
│   ├── cidade-sob-o-veu.mjs  # entry point
│   ├── data/                 # Data Models (Actor e Item)
│   ├── documents/            # classes de documento (CVActor, CVItem)
│   ├── sheets/                # ApplicationV2 sheets
│   ├── dice/                  # motor de rolagem Ação vs. Risco
│   ├── apps/                  # diálogo de negociação de rolagem
│   └── helpers/                # helpers de Handlebars
├── templates/                # .hbs das fichas e diálogos
├── styles/                   # CSS portado de ficha-interativa.html
├── lang/pt-BR.json           # localização
├── packs/_source/            # dados-fonte dos compêndios (JSON, editável)
├── packs/                    # compêndios compilados (LevelDB — gerado)
├── scripts/build-packs.mjs   # compila packs/_source → packs/*.db
└── reference/                 # capítulos de regras usados como fonte da verdade
```

## Compilando os compêndios

Os compêndios são versionados como **JSON legível** em `packs/_source/` (um array por pacote) e compilados para o formato LevelDB que o Foundry espera. Isso não foi executado neste ambiente de desenvolvimento por falta de Node.js instalado — rode localmente antes do primeiro uso ou de cada release:

```bash
npm install
npm run build:packs
```

Isso lê cada `packs/_source/<nome>.json` e gera `packs/<nome>.db/`. Depois de compilar, `packs/*.db` deve ser commitado normalmente — são os pacotes que o Foundry carrega.

Se editar qualquer entrada de compêndio (uma Ancestralidade, um Adversário, etc.), edite o JSON em `packs/_source/` e rode `npm run build:packs` de novo — nunca edite o `.db` compilado diretamente.

## Publicando uma nova versão

1. Suba o número de `version` em `system.json`.
2. Rode `npm run build:packs` se os compêndios mudaram.
3. Compacte o conteúdo do repositório (exceto `.git`, `node_modules`, `packs/_source`) em `cidade-sob-o-veu-<versão>.zip`.
4. Crie uma tag e uma release no GitHub (`vX.Y.Z`) com esse zip anexado.
5. Atualize o campo `download` em `system.json` para apontar para essa release e faça `git push`.

O campo `manifest` sempre aponta para `main`, então quem já instalou o sistema recebe o aviso de atualização automaticamente.

## Créditos

Regras, cenário e conteúdo de "A Cidade Sob o Véu" por Carlos Withe. Implementação do sistema para Foundry VTT gerada com Claude Code.
