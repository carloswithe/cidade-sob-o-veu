const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

/** Caminho, no system data, de cada campo de lista editável por tipo de Item. */
const CAMPOS_LISTA = {
  arquetipo: ["especialidades", "vicios"],
  ancestralidade: ["virtudes", "vulnerabilidades"],
  mitem: ["dadivas", "maldicoes"]
};

export default class CVItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["cidade-sob-o-veu", "sheet", "item"],
    position: { width: 480, height: "auto" },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      "add-linha": CVItemSheet.#onAddLinha,
      "delete-linha": CVItemSheet.#onDeleteLinha
    }
  };

  static PARTS = {
    form: { template: "systems/cidade-sob-o-veu/templates/item/item-sheet.hbs" }
  };

  async _prepareContext() {
    const item = this.item;
    return {
      item,
      system: item.system,
      isTag: item.type === "tag",
      isArquetipo: item.type === "arquetipo",
      isAncestralidade: item.type === "ancestralidade",
      isProfissao: item.type === "profissao",
      isTrauma: item.type === "trauma",
      isMItem: item.type === "mitem"
    };
  }

  static async #onAddLinha(event, target) {
    const campo = target.dataset.campo;
    const lista = foundry.utils.deepClone(foundry.utils.getProperty(this.item.system, campo) ?? []);
    lista.push(campo === "dadivas" || campo === "maldicoes" ? { nome: "" } : { nome: "", descricao: "" });
    await this.item.update({ [`system.${campo}`]: lista });
  }

  static async #onDeleteLinha(event, target) {
    const el = target.closest("[data-campo]");
    const campo = el.dataset.campo;
    const i = Number(el.dataset.index);
    const lista = foundry.utils.deepClone(foundry.utils.getProperty(this.item.system, campo) ?? []);
    lista.splice(i, 1);
    await this.item.update({ [`system.${campo}`]: lista });
  }
}
