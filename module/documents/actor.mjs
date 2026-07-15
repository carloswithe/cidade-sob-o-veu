import { NIVEIS_FERIMENTO } from "../dice/tabelas.mjs";

/**
 * Classe de documento Actor do sistema. Concentra a lógica de vida, dano e
 * XP que os três tipos de Actor (personagem, adversário, lendário)
 * compartilham ou especializam.
 */
export default class CVActor extends Actor {
  /** Tags (Items embutidos tipo "tag") atualmente ativas neste Actor. */
  get tagsAtivas() {
    return this.items.filter((i) => i.type === "tag" && i.system.ativa);
  }

  get tagsPositivas() {
    return this.tagsAtivas.filter((i) => i.system.polaridade === "positiva");
  }

  get tagsNegativas() {
    return this.tagsAtivas.filter((i) => i.system.polaridade === "negativa");
  }

  /**
   * Aplica dano a este Actor de acordo com o Capítulo 8 (Personagem, trilha
   * de 4 pontos) ou o Capítulo 11 (Adversário/Lendário, vitalidade).
   * @param {number} pontos  Dano já com proteção comum descontada.
   * @param {string} [nomeFerimento]  Nome do ferimento, só para Personagem.
   */
  async aplicarDano(pontos, nomeFerimento = "") {
    if (pontos <= 0) return;

    if (this.type === "personagem") {
      const atual = this.system.vida.pontos;
      const novo = Math.min(4, atual + pontos);
      const ferimentos = foundry.utils.deepClone(this.system.vida.ferimentos);
      if (novo > atual) {
        ferimentos.push({
          nome: nomeFerimento || NIVEIS_FERIMENTO[novo],
          nivel: NIVEIS_FERIMENTO[novo]
        });
      }
      await this.update({ "system.vida.pontos": novo, "system.vida.ferimentos": ferimentos });
      return novo;
    }

    if (this.type === "adversario") {
      const novo = Math.max(0, this.system.vitalidade.atual - pontos);
      await this.update({ "system.vitalidade.atual": novo });
      return novo;
    }

    if (this.type === "lendario") {
      // Limiar Lendário: no máximo 2 de dano por rolagem, salvo Fraqueza
      // explorada — isso é decidido no diálogo de dano, então `pontos` já
      // deve chegar aqui pré-limitado quando aplicável.
      const idx = this.system.faseAtual;
      const fases = foundry.utils.deepClone(this.system.fases);
      const fase = fases[idx];
      if (!fase) return;
      fase.vitalidade.atual = Math.max(0, fase.vitalidade.atual - pontos);
      await this.update({ "system.fases": fases });
      return fase.vitalidade.atual;
    }
  }

  /** Recupera um nível de ferimento do Personagem (some da trilha e some a Tag). */
  async recuperarFerimento(index) {
    if (this.type !== "personagem") return;
    const ferimentos = foundry.utils.deepClone(this.system.vida.ferimentos);
    if (index < 0 || index >= ferimentos.length) return;
    ferimentos.splice(index, 1);
    const novoPontos = Math.max(0, this.system.vida.pontos - 1);
    await this.update({ "system.vida.pontos": novoPontos, "system.vida.ferimentos": ferimentos });
  }

  /** Adiciona XP (Cap. 6): 10 XP = 1 nível, até o nível 10. */
  async adicionarXP(quantidade) {
    if (this.type !== "personagem") return;
    let xp = this.system.xp.atual + quantidade;
    let nivel = this.system.nivel;
    while (xp >= 10 && nivel < 10) {
      xp -= 10;
      nivel += 1;
    }
    if (nivel >= 10) xp = Math.min(xp, 10);
    await this.update({ "system.xp.atual": xp, "system.nivel": nivel });
  }

  /** Gasta o Token de Sorte (regra opcional, Cap. 1). Renova a critério do mestre no início da sessão. */
  async gastarTokenSorte() {
    if (!this.system.tokenSorte) return false;
    await this.update({ "system.tokenSorte": false });
    return true;
  }

  async renovarTokenSorte() {
    await this.update({ "system.tokenSorte": true });
  }
}
