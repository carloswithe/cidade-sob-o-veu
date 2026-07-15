const { StringField } = foundry.data.fields;

/**
 * Uma Profissão do Capítulo 9 — define o primeiro Aprendizado (Tag positiva
 * de Antecedente) do personagem.
 */
export default class ProfissaoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      cobre: new StringField({ initial: "" }) // "o que o Aprendizado cobre"
    };
  }
}
