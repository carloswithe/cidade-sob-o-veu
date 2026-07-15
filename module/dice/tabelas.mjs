/**
 * Tabelas de referência do Capítulo 8 (Vida, Dano e Consequências) e do
 * Capítulo 11 (Adversários). Centralizadas aqui porque tanto o roller
 * quanto os documentos de Actor (para aplicar dano) precisam delas.
 */

/** Dano Menor / Médio / Máximo por categoria de arma (Cap. 8). */
export const DANO_POR_CATEGORIA = {
  I: { menor: 0, medio: 1, maximo: 2 },
  II: { menor: 1, medio: 2, maximo: 3 },
  III: { menor: 2, medio: 3, maximo: 4 },
  IV: { menor: 3, medio: 4, maximo: 4 }
};

export const NOMES_CATEGORIA = {
  I: "I — Impacto",
  II: "II — Letal Leve",
  III: "III — Letal",
  IV: "IV — Devastadora"
};

export const NIVEIS_FERIMENTO = ["Ileso", "Leve", "Moderado", "Severo", "Fatal"];

/**
 * Dano sofrido pelo personagem, conforme o resultado da própria rolagem de
 * reação (Cap. 8).
 */
export function danoSofrido(categoria, resultadoChave) {
  const tabela = DANO_POR_CATEGORIA[categoria];
  if (!tabela) return 0;
  switch (resultadoChave) {
    case "espetacular": return 0;
    case "parcial": return tabela.menor;
    case "falhaParcial": return tabela.medio;
    case "falhaCritica": return tabela.maximo;
    default: return 0;
  }
}

/**
 * Dano causado a um adversário, conforme o resultado da rolagem do
 * personagem que ataca (Cap. 11 — espelho do Cap. 8).
 */
export function danoCausado(categoria, resultadoChave) {
  const tabela = DANO_POR_CATEGORIA[categoria];
  if (!tabela) return 0;
  switch (resultadoChave) {
    case "espetacular": return tabela.maximo;
    case "parcial": return tabela.medio;
    case "falhaParcial": return 0;
    case "falhaCritica": return 0;
    default: return 0;
  }
}
