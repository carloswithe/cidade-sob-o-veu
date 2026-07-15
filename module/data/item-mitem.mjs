const { StringField, NumberField, ArrayField, SchemaField, HTMLField } = foundry.data.fields;

/**
 * Item Mágico ou Aprimorado (Capítulo 7). O nível é derivado do número de
 * Dádivas (1 a 3); Maldições/Infortúnios não classificam o item (0 a 3).
 */
export default class MItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: new HTMLField({ initial: "" }),
      dadivas: new ArrayField(
        new SchemaField({ nome: new StringField({ initial: "" }) }),
        { validate: (v) => v.length >= 1 && v.length <= 3 }
      ),
      maldicoes: new ArrayField(
        new SchemaField({ nome: new StringField({ initial: "" }) }),
        { validate: (v) => v.length <= 3 }
      ),
      equipado: new StringField({
        choices: ["portando", "guardado"],
        initial: "portando"
      })
    };
  }

  /** Nível do item = número de Dádivas (1-3). */
  get nivel() {
    return Math.min(3, Math.max(1, this.dadivas?.length || 1));
  }
}
