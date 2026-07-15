const { StringField, ArrayField, SchemaField, HTMLField } = foundry.data.fields;

function tagEntry() {
  return new SchemaField({
    nome: new StringField({ initial: "" }),
    descricao: new StringField({ initial: "" })
  });
}

/**
 * Uma Ancestralidade do Capítulo 4 — pacote fixo de 2 Virtudes e
 * 2 Vulnerabilidades.
 */
export default class AncestralidadeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      emUmaFrase: new StringField({ initial: "" }),
      descricao: new HTMLField({ initial: "" }),
      virtudes: new ArrayField(tagEntry()),
      vulnerabilidades: new ArrayField(tagEntry())
    };
  }
}
