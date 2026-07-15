/**
 * Testes unitários da lógica pura do roller (Capítulo 1 — Mecânica de
 * Rolagem). Não depende do Foundry: só exercita `resolverAcaoRisco` e
 * `aplicarTokenDeSorte`, reproduzindo os exemplos literais do capítulo.
 *
 * Rodar com: node scripts/test-roller.mjs
 */
import assert from "node:assert/strict";
import { resolverAcaoRisco, aplicarTokenDeSorte } from "../module/dice/roller.mjs";

let passou = 0;
function teste(nome, fn) {
  try {
    fn();
    passou++;
    console.log(`✔ ${nome}`);
  } catch (err) {
    console.error(`✘ ${nome}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// "Ação: 6 e 4 | Risco: 6" → o Risco 6 anula o 6, resta o 4 (Sucesso Parcial).
teste("1 Risco anula o maior dado de Ação igual", () => {
  const r = resolverAcaoRisco([6, 4], [6]);
  assert.equal(r.resultadoChave, "parcial");
  assert.deepEqual(r.restantes, [4]);
});

// "Ação: 5 e 4 | Risco: 6 e 5" → anulação total (Falha Crítica).
teste("2 Risco anulam os 2 Ação → anulação total", () => {
  const r = resolverAcaoRisco([5, 4], [6, 5]);
  assert.equal(r.anulacaoTotal, true);
  assert.equal(r.resultadoChave, "falhaCritica");
});

// Exemplo completo do salto de Kai: Ação 6 e 3 | Risco 4 e 2 → sobra o 6 (Espetacular).
teste("Risco não alcança dados de Ação maiores que ele", () => {
  const r = resolverAcaoRisco([6, 3], [4, 2]);
  assert.equal(r.resultadoChave, "espetacular");
  assert.deepEqual(r.restantes, [6]);
  assert.equal(r.ampliacoes, 0);
});

// Dois 6 sobreviventes → Espetacular + 1 Ampliação.
teste("6 extra além do primeiro vira Ampliação", () => {
  const r = resolverAcaoRisco([6, 6], []);
  assert.equal(r.resultadoChave, "espetacular");
  assert.equal(r.ampliacoes, 1);
});

// Três 6 sobreviventes → 2 Ampliações.
teste("Três 6 sobreviventes → 2 Ampliações", () => {
  const r = resolverAcaoRisco([6, 6, 6], []);
  assert.equal(r.ampliacoes, 2);
});

// Cada dado de Ação só pode ser anulado uma vez; risco sobrando sem alvo não faz nada.
teste("Risco sem alvo elegível não anula nada", () => {
  const r = resolverAcaoRisco([6, 5], [2]);
  assert.equal(r.resultadoChave, "espetacular");
  assert.deepEqual(r.restantes.sort(), [5, 6]);
});

// Token de Sorte: Ação 5 | Risco 5 seria anulação total; reduzir o Risco para 4 salva o 5.
teste("Token de Sorte reduz Risco de 5 para 4 e salva o dado de Ação", () => {
  const base = resolverAcaoRisco([5], [5]);
  assert.equal(base.anulacaoTotal, true);

  const ajustado = aplicarTokenDeSorte([5], [5], { tipo: "risco", index: 0, delta: -1 });
  assert.equal(ajustado.riscoValores[0], 4);
  assert.equal(ajustado.resolucao.resultadoChave, "parcial");
  assert.deepEqual(ajustado.resolucao.restantes, [5]);
});

// Token de Sorte nunca ultrapassa os limites do dado (1 a 6).
teste("Token de Sorte não passa de 6 nem cai abaixo de 1", () => {
  const acimaDoLimite = aplicarTokenDeSorte([6], [], { tipo: "acao", index: 0, delta: 1 });
  assert.equal(acimaDoLimite.acaoValores[0], 6);

  const abaixoDoLimite = aplicarTokenDeSorte([1], [], { tipo: "acao", index: 0, delta: -1 });
  assert.equal(abaixoDoLimite.acaoValores[0], 1);
});

console.log(`\n${passou} teste(s) passaram.`);
if (process.exitCode) {
  console.error("Alguns testes falharam.");
} else {
  console.log("Todos os testes passaram.");
}
