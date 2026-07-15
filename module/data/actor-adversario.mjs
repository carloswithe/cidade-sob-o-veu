const { StringField, NumberField, HTMLField, SchemaField } = foundry.data.fields;

export const PORTE_VITALIDADE_MAX = {
  Capanga: 1,
  Ameaça: 2,
  "Adversário à Altura": 4,
  Colosso: 6
};

export const CATEGORIAS_ARMA = {
  "I": "I — Impacto",
  "II": "II — Letal Leve",
  "III": "III — Letal",
  "IV": "IV — Devastadora"
};

/**
 * Adversário (Capítulo 11). Descrito em três linhas: Porte (vitalidade),
 * Tags (Items embutidos tipo "tag") e Arma (categoria I-IV). Dano sofrido
 * e causado são calculados pelo roller a partir da categoria + resultado.
 */
export default class AdversarioData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      porte: new StringField({
        choices: ["Capanga", "Ameaça", "Adversário à Altura", "Colosso"],
        initial: "Capanga"
      }),
      vitalidade: new SchemaField({
        max: new NumberField({ initial: 1, min: 1, max: 6, integer: true }),
        atual: new NumberField({ initial: 1, min: 0, integer: true })
      }),
      categoriaArma: new StringField({
        choices: Object.keys(CATEGORIAS_ARMA),
        initial: "I"
      }),
      protecao: new StringField({ initial: "" }),
      comoAparece: new HTMLField({ initial: "" }),
      comoLuta: new HTMLField({ initial: "" }),
      descricao: new HTMLField({ initial: "" })
    };
  }

  get foraDeCombate() {
    return this.vitalidade.atual <= 0;
  }
}
