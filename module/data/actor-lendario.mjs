const { StringField, NumberField, HTMLField, ArrayField, SchemaField, BooleanField } = foundry.data.fields;

/**
 * Lendário (Capítulo 12). Acima do Colosso: Fases com vitalidade própria,
 * Fraquezas que destravam dano integral sob o Limiar (máx. 2 dano/rolagem),
 * Presença (Risco automático contra ele) e Agenda com Avanços por
 * Retaliação (Falha Crítica do grupo).
 */
export default class LendarioData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      natureza: new StringField({ initial: "" }),
      descricao: new HTMLField({ initial: "" }),
      faseAtual: new NumberField({ initial: 0, min: 0, integer: true }),
      fases: new ArrayField(
        new SchemaField({
          nome: new StringField({ initial: "" }),
          forma: new StringField({ initial: "" }),
          vitalidade: new SchemaField({
            max: new NumberField({ initial: 5, min: 1, integer: true }),
            atual: new NumberField({ initial: 5, min: 0, integer: true })
          }),
          categoriaArma: new StringField({
            choices: ["I", "II", "III", "IV"],
            initial: "III"
          }),
          protecao: new StringField({ initial: "" }),
          tags: new StringField({ initial: "" }), // texto livre, referência rápida (Tags reais são Items embutidos)
          presencaExtra: new BooleanField({ initial: false }), // +2 em vez de +1 nesta fase
          transicao: new HTMLField({ initial: "" })
        })
      ),
      fraquezas: new ArrayField(
        new SchemaField({
          nome: new StringField({ initial: "" }),
          descricao: new HTMLField({ initial: "" })
        })
      ),
      presenca: new NumberField({ initial: 1, min: 0, integer: true }),
      agenda: new ArrayField(
        new SchemaField({
          texto: new StringField({ initial: "" }),
          completo: new BooleanField({ initial: false })
        })
      ),
      derrota: new HTMLField({ initial: "" })
    };
  }

  get faseAtiva() {
    return this.fases[this.faseAtual] ?? null;
  }

  get avancosConquistados() {
    return this.agenda.filter((a) => a.completo).length;
  }
}
