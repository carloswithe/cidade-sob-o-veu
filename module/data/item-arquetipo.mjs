const { StringField, ArrayField, SchemaField, HTMLField } = foundry.data.fields;

function tagEntry() {
  return new SchemaField({
    nome: new StringField({ initial: "" }),
    descricao: new StringField({ initial: "" })
  });
}

/**
 * Um Arquétipo do Capítulo 5 — carrega as 20 Especialidades e os 20 Vícios
 * e Limitações da tabela, para que o jogador sorteie (1d20) ou escolha ao
 * criar o personagem ou subir de nível.
 */
export default class ArquetipoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      emUmaFrase: new StringField({ initial: "" }),
      descricao: new HTMLField({ initial: "" }),
      especialidades: new ArrayField(tagEntry()),
      vicios: new ArrayField(tagEntry())
    };
  }
}
