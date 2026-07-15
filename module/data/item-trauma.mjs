const { StringField } = foundry.data.fields;

/**
 * Um Trauma do Capítulo 10 — Tag negativa de Antecedente.
 */
export default class TraumaData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      quandoPesa: new StringField({ initial: "" })
    };
  }
}
