import { rolarAcaoRisco } from "../dice/roller.mjs";
import { NOMES_CATEGORIA } from "../dice/tabelas.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Diálogo de negociação (Cap. 1): lista as Tags ativas do Actor, permite
 * somar dados extras "da cena" concedidos pelo mestre, e opcionalmente
 * calcula dano sofrido/causado automaticamente antes de rolar.
 */
export default class CVRollDialog extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    tag: "form",
    classes: ["cidade-sob-o-veu", "cv-roll-dialog"],
    window: { title: "Rolar Ação vs. Risco", icon: "fa-solid fa-dice-d6", contentClasses: ["cv-dialog-content"] },
    position: { width: 520, height: "auto" },
    form: { handler: CVRollDialog.#onSubmit, submitOnChange: false, closeOnSubmit: true },
    actions: {}
  };

  static PARTS = {
    form: { template: "systems/cidade-sob-o-veu/templates/dialogs/roll-dialog.hbs" }
  };

  /**
   * @param {Actor} actor
   * @param {object} [preset]  Ex.: { tagIdsPreMarcadas: [...], flavor: "..." }
   */
  constructor(actor, preset = {}, options = {}) {
    super(options);
    this.actor = actor;
    this.preset = preset;
  }

  get title() {
    return `Rolar — ${this.actor.name}`;
  }

  async _prepareContext() {
    const tags = this.actor.items.filter((i) => i.type === "tag" && i.system.ativa);
    const preMarcadas = new Set(this.preset.tagIdsPreMarcadas ?? []);

    return {
      actor: this.actor,
      flavor: this.preset.flavor ?? "",
      tagsPositivas: tags
        .filter((t) => t.system.polaridade === "positiva")
        .map((t) => ({ id: t.id, name: t.name, origem: t.system.origem, marcada: preMarcadas.has(t.id) })),
      tagsNegativas: tags
        .filter((t) => t.system.polaridade === "negativa")
        .map((t) => ({ id: t.id, name: t.name, origem: t.system.origem, marcada: preMarcadas.has(t.id) })),
      categorias: Object.entries(NOMES_CATEGORIA).map(([chave, label]) => ({ chave, label })),
      categoriaArma: this.actor.system.categoriaArma ?? "I",
      tokenDisponivel: !!this.actor.system.tokenSorte
    };
  }

  static async #onSubmit(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);
    const tagsMarcadas = data.tags ?? {};
    const tagIds = Object.entries(tagsMarcadas)
      .filter(([, v]) => v)
      .map(([id]) => id);

    const tagsSelecionadas = this.actor.items.filter((i) => tagIds.includes(i.id));
    const positivasSelecionadas = tagsSelecionadas.filter((t) => t.system.polaridade === "positiva");
    const negativasSelecionadas = tagsSelecionadas.filter((t) => t.system.polaridade === "negativa");

    const extraAcao = Number(data.extraAcao ?? 0) || 0;
    const extraRisco = Number(data.extraRisco ?? 0) || 0;

    const nAcao = 1 + positivasSelecionadas.length + extraAcao;
    const nRisco = negativasSelecionadas.length + extraRisco;

    const modoDano = data.modoDano && data.modoDano !== "nenhum" ? data.modoDano : null;

    await rolarAcaoRisco({
      acao: nAcao,
      risco: nRisco,
      actor: this.actor,
      flavor: data.flavor ?? "",
      tagsPositivas: positivasSelecionadas.map((t) => t.name),
      tagsNegativas: negativasSelecionadas.map((t) => t.name),
      modoDano,
      categoriaArma: modoDano ? data.categoriaArma : null
    });
  }
}
