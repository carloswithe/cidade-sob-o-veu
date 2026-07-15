import PersonagemData from "./data/actor-personagem.mjs";
import AdversarioData from "./data/actor-adversario.mjs";
import LendarioData from "./data/actor-lendario.mjs";
import TagData from "./data/item-tag.mjs";
import ArquetipoData from "./data/item-arquetipo.mjs";
import AncestralidadeData from "./data/item-ancestralidade.mjs";
import ProfissaoData from "./data/item-profissao.mjs";
import TraumaData from "./data/item-trauma.mjs";
import MItemData from "./data/item-mitem.mjs";

import CVActor from "./documents/actor.mjs";
import CVItem from "./documents/item.mjs";

import ActorPersonagemSheet from "./sheets/actor-personagem-sheet.mjs";
import ActorAdversarioSheet from "./sheets/actor-adversario-sheet.mjs";
import ActorLendarioSheet from "./sheets/actor-lendario-sheet.mjs";
import CVItemSheet from "./sheets/item-sheet.mjs";

import { registrarHandlebarsHelpers } from "./helpers/handlebars-helpers.mjs";
import { reprocessarComToken } from "./dice/roller.mjs";
import CVRollDialog from "./apps/roll-dialog.mjs";
import { rolarAcaoRisco } from "./dice/roller.mjs";

Hooks.once("init", () => {
  console.log("A Cidade Sob o Véu | Inicializando sistema");

  game.cidadeSobOVeu = { rolarAcaoRisco, CVRollDialog };

  // Document classes
  CONFIG.Actor.documentClass = CVActor;
  CONFIG.Item.documentClass = CVItem;

  // Data Models
  CONFIG.Actor.dataModels.personagem = PersonagemData;
  CONFIG.Actor.dataModels.adversario = AdversarioData;
  CONFIG.Actor.dataModels.lendario = LendarioData;

  CONFIG.Item.dataModels.tag = TagData;
  CONFIG.Item.dataModels.arquetipo = ArquetipoData;
  CONFIG.Item.dataModels.ancestralidade = AncestralidadeData;
  CONFIG.Item.dataModels.profissao = ProfissaoData;
  CONFIG.Item.dataModels.trauma = TraumaData;
  CONFIG.Item.dataModels.mitem = MItemData;

  // Sheets
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cidade-sob-o-veu", ActorPersonagemSheet, { types: ["personagem"], makeDefault: true, label: "Ficha de Personagem" });
  Actors.registerSheet("cidade-sob-o-veu", ActorAdversarioSheet, { types: ["adversario"], makeDefault: true, label: "Ficha de Adversário" });
  Actors.registerSheet("cidade-sob-o-veu", ActorLendarioSheet, { types: ["lendario"], makeDefault: true, label: "Ficha de Lendário" });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cidade-sob-o-veu", CVItemSheet, {
    types: ["tag", "arquetipo", "ancestralidade", "profissao", "trauma", "mitem"],
    makeDefault: true,
    label: "Ficha de Item"
  });

  registrarHandlebarsHelpers();
});

Hooks.once("setup", async () => {
  const loadTemplates = foundry.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;
  await loadTemplates({
    "cidade-sob-o-veu.tag-row": "systems/cidade-sob-o-veu/templates/partials/tag-row.hbs"
  });
});

/* -------------------------------------------- */
/*  Chat listeners: Token de Sorte, Aplicar Dano */
/* -------------------------------------------- */

function anexarListenersDeChat(message, html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || root.dataset.cvBound) return;
  root.dataset.cvBound = "1";

  root.querySelector(".cv-btn-token-sorte")?.addEventListener("click", async (ev) => {
    const flags = message.flags?.["cidade-sob-o-veu"];
    const actor = flags?.actorId ? game.actors.get(flags.actorId) : null;
    if (!actor) return ui.notifications.warn("Actor não encontrado para este Token de Sorte.");
    if (!actor.system.tokenSorte) return ui.notifications.warn("Este personagem não tem Token de Sorte disponível.");

    const pool = flags.pool;
    const opcoes = [
      ...pool.acaoValores.map((v, i) => ({ label: `Ação (${v})`, tipo: "acao", index: i, valor: v })),
      ...pool.riscoValores.map((v, i) => ({ label: `Risco (${v})`, tipo: "risco", index: i, valor: v }))
    ];

    const content = `
      <div class="cv-token-picker">
        <p>Escolha um dado e o ajuste (±1):</p>
        <select name="dado">
          ${opcoes.map((o, i) => `<option value="${i}">${o.label}</option>`).join("")}
        </select>
        <select name="delta">
          <option value="1">+1</option>
          <option value="-1">−1</option>
        </select>
      </div>`;

    const escolha = await foundry.applications.api.DialogV2.wait({
      window: { title: "Usar Token de Sorte" },
      content,
      buttons: [
        {
          action: "ok",
          label: "Aplicar",
          default: true,
          callback: (event, button) => {
            const form = button.form;
            return { index: Number(form.dado.value), delta: Number(form.delta.value) };
          }
        },
        { action: "cancel", label: "Cancelar" }
      ]
    });

    if (!escolha || escolha === "cancel") return;
    const alvo = opcoes[escolha.index];
    await actor.gastarTokenSorte();
    await reprocessarComToken(message, { tipo: alvo.tipo, index: alvo.index, delta: escolha.delta });
  });

  root.querySelector(".cv-btn-aplicar-dano")?.addEventListener("click", async (ev) => {
    const pontos = Number(ev.currentTarget.dataset.pontos) || 0;
    if (pontos <= 0) return ui.notifications.info("Sem dano a aplicar (resultado Ileso).");

    const alvos = [...game.user.targets].map((t) => t.actor).filter(Boolean);
    let atores = alvos;
    if (!atores.length) {
      const flags = message.flags?.["cidade-sob-o-veu"];
      const rolador = flags?.actorId ? game.actors.get(flags.actorId) : null;
      if (rolador) atores = [rolador];
    }
    if (!atores.length) return ui.notifications.warn("Nenhum alvo selecionado (marque um token ou role com um Actor).");

    for (const actor of atores) await actor.aplicarDano(pontos);
    ui.notifications.info(`${pontos} de dano aplicado a ${atores.map((a) => a.name).join(", ")}.`);
  });
}

Hooks.on("renderChatMessageHTML", (message, html) => anexarListenersDeChat(message, html));
Hooks.on("renderChatMessage", (message, html) => anexarListenersDeChat(message, html));
