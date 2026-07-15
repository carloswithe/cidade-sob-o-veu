const { StringField, BooleanField, HTMLField } = foundry.data.fields;

/**
 * Uma Tag — a unidade central do sistema. Toda Qualidade, Defeito, Virtude,
 * Vulnerabilidade, Especialidade, Vício, Aprendizado ou Trauma do personagem
 * vive como um Item embutido deste tipo.
 */
export default class TagData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      polaridade: new StringField({
        required: true,
        choices: ["positiva", "negativa"],
        initial: "positiva"
      }),
      origem: new StringField({
        required: true,
        choices: [
          "caracteristica",
          "ancestralidade",
          "arquetipo",
          "antecedente",
          "ferimento",
          "item-magico",
          "cena"
        ],
        initial: "caracteristica"
      }),
      grupo: new StringField({ initial: "" }), // Mental/Social/Física, quando origem = caracteristica
      descricao: new HTMLField({ initial: "" }),
      ativa: new BooleanField({ initial: true })
    };
  }

  get sinal() {
    return this.polaridade === "positiva" ? "+" : "−";
  }
}
