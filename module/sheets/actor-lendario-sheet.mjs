import CVRollDialog from "../apps/roll-dialog.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

function novaFase(n) {
  return {
    nome: `Fase ${n}`,
    forma: "",
    vitalidade: { max: 5, atual: 5 },
    categoriaArma: "III",
    protecao: "",
    tags: "",
    presencaExtra: false,
    transicao: ""
  };
}

export default class ActorLendarioSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cidade-sob-o-veu", "sheet", "actor", "lendario"],
    position: { width: 760, height: 860 },
    window: { resizable: true, icon: "fa-solid fa-dragon" },
    form: { submitOnChange: true },
    actions: {
      "rolar-livre": ActorLendarioSheet.#onRolarLivre,
      "add-fase": ActorLendarioSheet.#onAddFase,
      "delete-fase": ActorLendarioSheet.#onDeleteFase,
      "set-fase-atual": ActorLendarioSheet.#onSetFaseAtual,
      "toggle-vitalidade-fase": ActorLendarioSheet.#onToggleVitalidadeFase,
      "add-fraqueza": ActorLendarioSheet.#onAddFraqueza,
      "delete-fraqueza": ActorLendarioSheet.#onDeleteFraqueza,
      "add-avanco": ActorLendarioSheet.#onAddAvanco,
      "delete-avanco": ActorLendarioSheet.#onDeleteAvanco,
      "toggle-avanco": ActorLendarioSheet.#onToggleAvanco,
      "edit-img": ActorLendarioSheet.#onEditImg
    }
  };

  static PARTS = {
    form: { template: "systems/cidade-sob-o-veu/templates/actor/lendario-sheet.hbs" }
  };

  async _prepareContext() {
    const actor = this.actor;
    return {
      actor,
      system: actor.system,
      categorias: ["I", "II", "III", "IV"],
      fases: actor.system.fases.map((f, i) => ({
        ...f,
        i,
        pips: Array.from({ length: f.vitalidade.max }, (_, p) => p),
        ativa: i === actor.system.faseAtual
      }))
    };
  }

  static async #onRolarLivre() {
    new CVRollDialog(this.actor).render(true);
  }

  static async #onEditImg() {
    new FilePicker({
      type: "image",
      current: this.actor.img,
      callback: (path) => this.actor.update({ img: path })
    }).render(true);
  }

  static async #onAddFase() {
    const fases = foundry.utils.deepClone(this.actor.system.fases);
    fases.push(novaFase(fases.length + 1));
    await this.actor.update({ "system.fases": fases });
  }

  static async #onDeleteFase(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    const fases = foundry.utils.deepClone(this.actor.system.fases);
    fases.splice(i, 1);
    const faseAtual = Math.min(this.actor.system.faseAtual, Math.max(0, fases.length - 1));
    await this.actor.update({ "system.fases": fases, "system.faseAtual": faseAtual });
  }

  static async #onSetFaseAtual(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    await this.actor.update({ "system.faseAtual": i });
  }

  static async #onToggleVitalidadeFase(event, target) {
    const el = target.closest("[data-fase-index]");
    const faseIdx = Number(el.dataset.faseIndex);
    const pipIdx = Number(el.dataset.pipIndex);
    const fases = foundry.utils.deepClone(this.actor.system.fases);
    const atual = fases[faseIdx].vitalidade.atual;
    fases[faseIdx].vitalidade.atual = atual === pipIdx + 1 ? pipIdx : pipIdx + 1;
    await this.actor.update({ "system.fases": fases });
  }

  static async #onAddFraqueza() {
    const fraquezas = foundry.utils.deepClone(this.actor.system.fraquezas);
    fraquezas.push({ nome: "Nova Fraqueza", descricao: "" });
    await this.actor.update({ "system.fraquezas": fraquezas });
  }

  static async #onDeleteFraqueza(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    const fraquezas = foundry.utils.deepClone(this.actor.system.fraquezas);
    fraquezas.splice(i, 1);
    await this.actor.update({ "system.fraquezas": fraquezas });
  }

  static async #onAddAvanco() {
    const agenda = foundry.utils.deepClone(this.actor.system.agenda);
    agenda.push({ texto: "", completo: false });
    await this.actor.update({ "system.agenda": agenda });
  }

  static async #onDeleteAvanco(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    const agenda = foundry.utils.deepClone(this.actor.system.agenda);
    agenda.splice(i, 1);
    await this.actor.update({ "system.agenda": agenda });
  }

  static async #onToggleAvanco(event, target) {
    const i = Number(target.closest("[data-index]").dataset.index);
    const agenda = foundry.utils.deepClone(this.actor.system.agenda);
    agenda[i].completo = !agenda[i].completo;
    await this.actor.update({ "system.agenda": agenda });
  }
}
