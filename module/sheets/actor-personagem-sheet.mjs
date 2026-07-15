import CVRollDialog from "../apps/roll-dialog.mjs";
import { listaCaracteristicas, sortearCaracteristica } from "../data/tabela-caracteristicas.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

const VIDA_FAIXAS = [
  { max: 4, valor: "Miserável" },
  { max: 8, valor: "Precário" },
  { max: 12, valor: "Modesto" },
  { max: 16, valor: "Confortável" },
  { max: 19, valor: "Abastado" },
  { max: 20, valor: "Milionário" }
];

async function indexDoPack(nomePack) {
  const pack = game.packs.get(`cidade-sob-o-veu.${nomePack}`);
  if (!pack) return [];
  const index = await pack.getIndex();
  return index.contents.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

async function docDoPack(nomePack, id) {
  const pack = game.packs.get(`cidade-sob-o-veu.${nomePack}`);
  if (!pack || !id) return null;
  return pack.getDocument(id);
}

export default class ActorPersonagemSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cidade-sob-o-veu", "sheet", "actor", "personagem"],
    position: { width: 940, height: 900 },
    window: { resizable: true, icon: "fa-solid fa-user" },
    form: { submitOnChange: true },
    actions: {
      "rolar-livre": ActorPersonagemSheet.#onRolarLivre,
      "rolar-tag": ActorPersonagemSheet.#onRolarTag,
      "toggle-ferimento": ActorPersonagemSheet.#onToggleFerimento,
      "recuperar-ferimento": ActorPersonagemSheet.#onRecuperarFerimento,
      "toggle-token": ActorPersonagemSheet.#onToggleToken,
      "set-xp": ActorPersonagemSheet.#onSetXP,
      "set-estilo-vida": ActorPersonagemSheet.#onSetEstiloVida,
      "rolar-estilo-vida": ActorPersonagemSheet.#onRolarEstiloVida,
      "aplicar-ancestralidade": ActorPersonagemSheet.#onAplicarAncestralidade,
      "rolar-ancestralidade": ActorPersonagemSheet.#onRolarAncestralidade,
      "aplicar-arquetipo": ActorPersonagemSheet.#onAplicarArquetipo,
      "rolar-arquetipo": ActorPersonagemSheet.#onRolarArquetipo,
      "add-especialidade": ActorPersonagemSheet.#onAddEspecialidade,
      "add-vicio": ActorPersonagemSheet.#onAddVicio,
      "aplicar-profissao": ActorPersonagemSheet.#onAplicarProfissao,
      "rolar-profissao": ActorPersonagemSheet.#onRolarProfissao,
      "aplicar-trauma": ActorPersonagemSheet.#onAplicarTrauma,
      "rolar-trauma": ActorPersonagemSheet.#onRolarTrauma,
      "add-qualidade": ActorPersonagemSheet.#onAddQualidade,
      "rolar-qualidade": ActorPersonagemSheet.#onRolarQualidade,
      "add-defeito": ActorPersonagemSheet.#onAddDefeito,
      "rolar-defeito": ActorPersonagemSheet.#onRolarDefeito,
      "add-aprendizado": ActorPersonagemSheet.#onAddAprendizadoVazio,
      "add-trauma-narrativo": ActorPersonagemSheet.#onAddTraumaVazio,
      "add-mitem": ActorPersonagemSheet.#onAddMItem,
      "edit-item": ActorPersonagemSheet.#onEditItem,
      "delete-item": ActorPersonagemSheet.#onDeleteItem,
      "toggle-ativa": ActorPersonagemSheet.#onToggleAtiva
    }
  };

  static PARTS = {
    form: { template: "systems/cidade-sob-o-veu/templates/actor/personagem-sheet.hbs" }
  };

  async _prepareContext() {
    const actor = this.actor;
    const sys = actor.system;
    const tags = actor.items.filter((i) => i.type === "tag");

    const porOrigem = (origem, polaridade) =>
      tags.filter((t) => t.system.origem === origem && t.system.polaridade === polaridade);

    let arquetipoOptions = null;
    if (sys.arquetipoNome) {
      const index = await indexDoPack("arquetipos");
      const entry = index.find((e) => e.name === sys.arquetipoNome);
      if (entry) {
        const doc = await docDoPack("arquetipos", entry._id);
        arquetipoOptions = {
          especialidades: doc.system.especialidades.map((e, i) => ({ i, ...e })),
          vicios: doc.system.vicios.map((v, i) => ({ i, ...v }))
        };
      }
    }

    return {
      actor,
      system: sys,
      niveis: Array.from({ length: 10 }, (_, i) => i + 1),
      estilosDeVida: ["Miserável", "Precário", "Modesto", "Confortável", "Abastado", "Milionário"],
      xpPips: Array.from({ length: 10 }, (_, i) => i),
      ferimentosInfo: [
        { nivel: "Leve", efeito: "só narrativo · sara com uma cena de descanso" },
        { nivel: "Moderado", efeito: "Tag negativa quando relevante · dias" },
        { nivel: "Severo", efeito: "Tag negativa em toda ação física · semanas" },
        { nivel: "Fatal", efeito: "fora de ação · estabilizar ou morrer · deixa marca" }
      ],
      qualidades: porOrigem("caracteristica", "positiva"),
      defeitos: porOrigem("caracteristica", "negativa"),
      virtudes: porOrigem("ancestralidade", "positiva"),
      vulnerabilidades: porOrigem("ancestralidade", "negativa"),
      especialidades: porOrigem("arquetipo", "positiva"),
      vicios: porOrigem("arquetipo", "negativa"),
      aprendizados: porOrigem("antecedente", "positiva"),
      traumas: porOrigem("antecedente", "negativa"),
      itensMagicos: actor.items.filter((i) => i.type === "mitem"),
      ancestralidadeIndex: await indexDoPack("ancestralidades"),
      arquetipoIndex: await indexDoPack("arquetipos"),
      profissaoIndex: await indexDoPack("profissoes"),
      traumaIndex: await indexDoPack("traumas"),
      arquetipoOptions,
      caracteristicasPositivas: listaCaracteristicas("positiva"),
      caracteristicasNegativas: listaCaracteristicas("negativa"),
      totalPositivas: tags.filter((t) => t.system.polaridade === "positiva" && t.system.ativa).length,
      totalNegativas: tags.filter((t) => t.system.polaridade === "negativa" && t.system.ativa).length
    };
  }

  // ---------- Rolagens ----------

  static async #onRolarLivre() {
    new CVRollDialog(this.actor).render(true);
  }

  static async #onRolarTag(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    new CVRollDialog(this.actor, { tagIdsPreMarcadas: id ? [id] : [] }).render(true);
  }

  // ---------- Vida / Ferimentos ----------

  static async #onToggleFerimento(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    const atual = this.actor.system.vida.pontos;
    const novo = atual === i + 1 ? i : i + 1;
    await this.actor.update({ "system.vida.pontos": novo });
  }

  static async #onRecuperarFerimento(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    await this.actor.recuperarFerimento(i);
  }

  // ---------- Token de Sorte / XP ----------

  static async #onToggleToken() {
    if (this.actor.system.tokenSorte) await this.actor.gastarTokenSorte();
    else await this.actor.renovarTokenSorte();
  }

  static async #onSetXP(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    const atual = this.actor.system.xp.atual;
    let novo = atual === i + 1 ? i : i + 1;
    let nivel = this.actor.system.nivel;
    if (novo >= 10 && nivel < 10) {
      nivel += 1;
      novo = 0;
      ui.notifications.info(`${this.actor.name} sobe para o nível ${nivel}!`);
    }
    await this.actor.update({ "system.xp.atual": novo, "system.nivel": nivel });
  }

  // ---------- Estilo de Vida ----------

  static async #onSetEstiloVida(event, target) {
    await this.actor.update({ "system.estiloDeVida": target.dataset.valor });
  }

  static async #onRolarEstiloVida() {
    const roll = await new Roll("1d20").evaluate();
    const r = roll.total;
    const faixa = VIDA_FAIXAS.find((f) => r <= f.max);
    await this.actor.update({ "system.estiloDeVida": faixa.valor });
    roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), flavor: `Estilo de Vida (1d20) → ${faixa.valor}` });
  }

  // ---------- Ancestralidade ----------

  static async #onRolarAncestralidade(event, target) {
    const select = this.element.querySelector('select[name="pick-ancestralidade"]');
    const opts = [...select.options].filter((o) => o.value);
    if (!opts.length) return;
    select.value = opts[Math.floor(Math.random() * opts.length)].value;
    return ActorPersonagemSheet.#onAplicarAncestralidade.call(this, event, target);
  }

  static async #onAplicarAncestralidade() {
    const select = this.element.querySelector('select[name="pick-ancestralidade"]');
    const id = select?.value;
    if (!id) return ui.notifications.warn("Escolha uma Ancestralidade primeiro.");
    const doc = await docDoPack("ancestralidades", id);
    if (!doc) return;

    const antigas = this.actor.items.filter((i) => i.type === "tag" && i.system.origem === "ancestralidade");
    if (antigas.length) await this.actor.deleteEmbeddedDocuments("Item", antigas.map((i) => i.id));

    const novas = [
      ...doc.system.virtudes.map((v) => ({ ...tagBase("positiva", "ancestralidade"), name: v.nome, "system.descricao": v.descricao })),
      ...doc.system.vulnerabilidades.map((v) => ({ ...tagBase("negativa", "ancestralidade"), name: v.nome, "system.descricao": v.descricao }))
    ];
    await this.actor.createEmbeddedDocuments("Item", novas);
    await this.actor.update({ "system.ancestralidadeNome": doc.name });
  }

  // ---------- Arquétipo ----------

  static async #onRolarArquetipo(event, target) {
    const select = this.element.querySelector('select[name="pick-arquetipo"]');
    const opts = [...select.options].filter((o) => o.value);
    if (!opts.length) return;
    select.value = opts[Math.floor(Math.random() * opts.length)].value;
    return ActorPersonagemSheet.#onAplicarArquetipo.call(this, event, target);
  }

  static async #onAplicarArquetipo() {
    const select = this.element.querySelector('select[name="pick-arquetipo"]');
    const id = select?.value;
    if (!id) return ui.notifications.warn("Escolha um Arquétipo primeiro.");
    const doc = await docDoPack("arquetipos", id);
    if (!doc) return;
    await this.actor.update({ "system.arquetipoNome": doc.name });
  }

  static async #onAddEspecialidade(event, target) {
    const aleatoria = target.dataset.aleatoria === "true";
    const opts = this.actor.system.arquetipoNome ? await this.#opcoesArquetipo() : null;
    if (!opts) return ui.notifications.warn("Aplique um Arquétipo primeiro.");
    let escolha;
    if (aleatoria) {
      escolha = opts.especialidades[Math.floor(Math.random() * opts.especialidades.length)];
    } else {
      const select = this.element.querySelector('select[name="pick-especialidade"]');
      escolha = opts.especialidades[Number(select.value)];
    }
    if (!escolha) return;
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("positiva", "arquetipo"), name: escolha.nome, "system.descricao": escolha.descricao }
    ]);
  }

  static async #onAddVicio(event, target) {
    const aleatoria = target.dataset.aleatoria === "true";
    const opts = this.actor.system.arquetipoNome ? await this.#opcoesArquetipo() : null;
    if (!opts) return ui.notifications.warn("Aplique um Arquétipo primeiro.");
    let escolha;
    if (aleatoria) {
      escolha = opts.vicios[Math.floor(Math.random() * opts.vicios.length)];
    } else {
      const select = this.element.querySelector('select[name="pick-vicio"]');
      escolha = opts.vicios[Number(select.value)];
    }
    if (!escolha) return;
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("negativa", "arquetipo"), name: escolha.nome, "system.descricao": escolha.descricao }
    ]);
  }

  async #opcoesArquetipo() {
    const index = await indexDoPack("arquetipos");
    const entry = index.find((e) => e.name === this.actor.system.arquetipoNome);
    if (!entry) return null;
    const doc = await docDoPack("arquetipos", entry._id);
    return { especialidades: doc.system.especialidades, vicios: doc.system.vicios };
  }

  // ---------- Profissão / Trauma ----------

  static async #onRolarProfissao(event, target) {
    const select = this.element.querySelector('select[name="pick-profissao"]');
    const opts = [...select.options].filter((o) => o.value);
    if (!opts.length) return;
    select.value = opts[Math.floor(Math.random() * opts.length)].value;
    return ActorPersonagemSheet.#onAplicarProfissao.call(this, event, target);
  }

  static async #onAplicarProfissao() {
    const select = this.element.querySelector('select[name="pick-profissao"]');
    const id = select?.value;
    if (!id) return ui.notifications.warn("Escolha uma Profissão primeiro.");
    const doc = await docDoPack("profissoes", id);
    if (!doc) return;
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("positiva", "antecedente"), name: doc.name, "system.descricao": doc.system.cobre }
    ]);
    await this.actor.update({ "system.profissaoNome": doc.name });
  }

  static async #onRolarTrauma(event, target) {
    const select = this.element.querySelector('select[name="pick-trauma"]');
    const opts = [...select.options].filter((o) => o.value);
    if (!opts.length) return;
    select.value = opts[Math.floor(Math.random() * opts.length)].value;
    return ActorPersonagemSheet.#onAplicarTrauma.call(this, event, target);
  }

  static async #onAplicarTrauma() {
    const select = this.element.querySelector('select[name="pick-trauma"]');
    const id = select?.value;
    if (!id) return ui.notifications.warn("Escolha um Trauma primeiro.");
    const doc = await docDoPack("traumas", id);
    if (!doc) return;
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("negativa", "antecedente"), name: doc.name, "system.descricao": doc.system.quandoPesa }
    ]);
  }

  static async #onAddAprendizadoVazio() {
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("positiva", "antecedente"), name: "Novo Aprendizado" }
    ]);
  }

  static async #onAddTraumaVazio() {
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("negativa", "antecedente"), name: "Novo Trauma" }
    ]);
  }

  // ---------- Características ----------

  static async #onAddQualidade(event, target) {
    const select = this.element.querySelector('select[name="pick-qualidade"]');
    const [grupo, nome] = (select?.value ?? "").split("|");
    if (!nome) return ui.notifications.warn("Escolha uma Qualidade primeiro.");
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("positiva", "caracteristica"), name: nome, "system.grupo": grupo }
    ]);
  }

  static async #onRolarQualidade() {
    const { grupo, nome } = sortearCaracteristica("positiva");
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("positiva", "caracteristica"), name: nome, "system.grupo": grupo }
    ]);
  }

  static async #onAddDefeito(event, target) {
    const select = this.element.querySelector('select[name="pick-defeito"]');
    const [grupo, nome] = (select?.value ?? "").split("|");
    if (!nome) return ui.notifications.warn("Escolha um Defeito primeiro.");
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("negativa", "caracteristica"), name: nome, "system.grupo": grupo }
    ]);
  }

  static async #onRolarDefeito() {
    const { grupo, nome } = sortearCaracteristica("negativa");
    await this.actor.createEmbeddedDocuments("Item", [
      { ...tagBase("negativa", "caracteristica"), name: nome, "system.grupo": grupo }
    ]);
  }

  // ---------- Itens mágicos / gerais ----------

  static async #onAddMItem() {
    await this.actor.createEmbeddedDocuments("Item", [
      { name: "Novo Item Mágico", type: "mitem", system: { dadivas: [{ nome: "" }] } }
    ]);
  }

  static async #onEditItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    this.actor.items.get(id)?.sheet.render(true);
  }

  static async #onDeleteItem(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    if (!id) return;
    await this.actor.deleteEmbeddedDocuments("Item", [id]);
  }

  static async #onToggleAtiva(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(id);
    if (!item) return;
    await item.update({ "system.ativa": !item.system.ativa });
  }
}

function tagBase(polaridade, origem) {
  return { type: "tag", "system.polaridade": polaridade, "system.origem": origem };
}
