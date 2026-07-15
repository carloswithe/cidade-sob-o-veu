import CVRollDialog from "../apps/roll-dialog.mjs";
import { PORTE_VITALIDADE_MAX, CATEGORIAS_ARMA } from "../data/actor-adversario.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class ActorAdversarioSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cidade-sob-o-veu", "sheet", "actor", "adversario"],
    position: { width: 640, height: 720 },
    window: { resizable: true, icon: "fa-solid fa-mask" },
    form: { submitOnChange: true },
    actions: {
      "rolar-livre": ActorAdversarioSheet.#onRolarLivre,
      "rolar-tag": ActorAdversarioSheet.#onRolarTag,
      "toggle-vitalidade": ActorAdversarioSheet.#onToggleVitalidade,
      "add-tag-pos": ActorAdversarioSheet.#onAddTagPos,
      "add-tag-neg": ActorAdversarioSheet.#onAddTagNeg,
      "edit-item": ActorAdversarioSheet.#onEditItem,
      "delete-item": ActorAdversarioSheet.#onDeleteItem,
      "toggle-ativa": ActorAdversarioSheet.#onToggleAtiva,
      "aplicar-dano-self": ActorAdversarioSheet.#onAplicarDanoSelf,
      "edit-img": ActorAdversarioSheet.#onEditImg
    }
  };

  static PARTS = {
    form: { template: "systems/cidade-sob-o-veu/templates/actor/adversario-sheet.hbs" }
  };

  async _prepareContext() {
    const actor = this.actor;
    const tags = actor.items.filter((i) => i.type === "tag");
    return {
      actor,
      system: actor.system,
      portes: Object.keys(PORTE_VITALIDADE_MAX),
      categorias: Object.entries(CATEGORIAS_ARMA).map(([chave, label]) => ({ chave, label })),
      vitalidadePips: Array.from({ length: actor.system.vitalidade.max }, (_, i) => i),
      tagsPositivas: tags.filter((t) => t.system.polaridade === "positiva"),
      tagsNegativas: tags.filter((t) => t.system.polaridade === "negativa")
    };
  }

  static async #onRolarLivre() {
    new CVRollDialog(this.actor).render(true);
  }

  static async #onRolarTag(event, target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    new CVRollDialog(this.actor, { tagIdsPreMarcadas: id ? [id] : [] }).render(true);
  }

  static async #onEditImg() {
    new FilePicker({
      type: "image",
      current: this.actor.img,
      callback: (path) => this.actor.update({ img: path })
    }).render(true);
  }

  static async #onToggleVitalidade(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    const atual = this.actor.system.vitalidade.atual;
    const novo = atual === i + 1 ? i : i + 1;
    await this.actor.update({ "system.vitalidade.atual": novo });
  }

  static async #onAddTagPos() {
    await this.actor.createEmbeddedDocuments("Item", [
      { name: "Nova Tag", type: "tag", system: { polaridade: "positiva", origem: "caracteristica" } }
    ]);
  }

  static async #onAddTagNeg() {
    await this.actor.createEmbeddedDocuments("Item", [
      { name: "Nova Fraqueza", type: "tag", system: { polaridade: "negativa", origem: "caracteristica" } }
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

  static async #onAplicarDanoSelf(event, target) {
    const input = this.element.querySelector('input[name="dano-manual"]');
    const pontos = Number(input?.value) || 0;
    if (pontos <= 0) return;
    await this.actor.aplicarDano(pontos);
    input.value = "";
  }
}
