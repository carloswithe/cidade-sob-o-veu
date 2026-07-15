/**
 * Classe de documento Item do sistema. A maior parte dos tipos de Item é
 * só dados (Tag, Arquétipo, Ancestralidade, Profissão, Trauma); o
 * comportamento especial fica concentrado no tipo "tag" para alimentar o
 * diálogo de rolagem.
 */
export default class CVItem extends Item {
  /** Quantos dados (Ação ou Risco) esta Tag contribui — sempre 1, mas centralizado aqui. */
  get valorDado() {
    return this.type === "tag" ? 1 : 0;
  }
}
