const { StringField, NumberField, HTMLField, ArrayField, SchemaField, BooleanField } = foundry.data.fields;

/**
 * Personagem jogador. Reflete o Capítulo 2 (criação: 7 Tags positivas + 7
 * negativas), o Capítulo 6 (progressão por nível 1-10) e o Capítulo 8
 * (trilha de vida de 4 ferimentos). As 14+ Tags em si não vivem aqui — são
 * Items embutidos do tipo "tag", organizados pelo campo `origem` de cada um.
 */
export default class PersonagemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      conceito: new StringField({ initial: "" }),
      jogador: new StringField({ initial: "" }),
      nivel: new NumberField({ initial: 1, min: 1, max: 10, integer: true }),
      ancestralidadeNome: new StringField({ initial: "" }),
      ancestralidadeNotas: new StringField({ initial: "" }),
      arquetipoNome: new StringField({ initial: "" }),
      profissaoNome: new StringField({ initial: "" }),
      xp: new SchemaField({
        atual: new NumberField({ initial: 0, min: 0, max: 10, integer: true })
      }),
      estiloDeVida: new StringField({
        initial: "Modesto",
        choices: ["Miserável", "Precário", "Modesto", "Confortável", "Abastado", "Milionário"]
      }),
      vida: new SchemaField({
        pontos: new NumberField({ initial: 0, min: 0, max: 4, integer: true }),
        ferimentos: new ArrayField(
          new SchemaField({
            nome: new StringField({ initial: "" }),
            nivel: new StringField({
              choices: ["Leve", "Moderado", "Severo", "Fatal"],
              initial: "Leve"
            })
          })
        )
      }),
      tokenSorte: new BooleanField({ initial: true }),
      equipamento: new HTMLField({ initial: "" }),
      protecao: new StringField({ initial: "" }),
      notas: new HTMLField({ initial: "" })
    };
  }

  /** XP total acumulado necessário para o próximo nível (sempre 10 por nível, Cap. 6). */
  get xpProximoNivel() {
    return 10;
  }

  /** Nível de ferimento mais grave atual, derivado dos pontos de dano acumulados. */
  get nivelFerimento() {
    const tabela = ["Ileso", "Leve", "Moderado", "Severo", "Fatal"];
    return tabela[Math.min(4, this.vida.pontos)];
  }
}
