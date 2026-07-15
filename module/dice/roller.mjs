import { danoSofrido, danoCausado, NOMES_CATEGORIA } from "./tabelas.mjs";

/**
 * Motor de rolagem — Capítulo 1 (Mecânica de Rolagem).
 *
 * `resolverAcaoRisco` é lógica pura (sem I/O, sem Foundry), fácil de testar
 * isoladamente (ver scripts/test-roller.mjs) e é o coração do que
 * `rolarAcaoRisco` (que efetivamente rola os dados e posta no chat) usa por
 * baixo dos panos.
 */

const TABELA_RESULTADO = {
  6: { chave: "espetacular", nome: "Sucesso Espetacular" },
  5: { chave: "parcial", nome: "Sucesso Parcial" },
  4: { chave: "parcial", nome: "Sucesso Parcial" },
  3: { chave: "falhaParcial", nome: "Falha Parcial" },
  2: { chave: "falhaParcial", nome: "Falha Parcial" },
  1: { chave: "falhaCritica", nome: "Falha Crítica" }
};

/**
 * Resolve o confronto entre dados de Ação e de Risco já rolados.
 * @param {number[]} acaoValores   Valores dos dados de Ação (1-6 cada).
 * @param {number[]} riscoValores  Valores dos dados de Risco (1-6 cada).
 */
export function resolverAcaoRisco(acaoValores, riscoValores) {
  const vivos = acaoValores.map((_, i) => i); // índices de dados de Ação ainda em jogo
  const anuladoMask = acaoValores.map(() => false);
  const anulados = [];
  const riscoOrdenado = [...riscoValores].sort((a, b) => b - a);

  for (const r of riscoOrdenado) {
    let melhorIdx = -1;
    for (const i of vivos) {
      if (acaoValores[i] <= r && (melhorIdx === -1 || acaoValores[i] > acaoValores[melhorIdx])) {
        melhorIdx = i;
      }
    }
    if (melhorIdx !== -1) {
      anuladoMask[melhorIdx] = true;
      anulados.push({ risco: r, acao: acaoValores[melhorIdx] });
      vivos.splice(vivos.indexOf(melhorIdx), 1);
    } else {
      anulados.push({ risco: r, acao: null });
    }
  }

  const restantes = vivos.map((i) => acaoValores[i]).sort((a, b) => b - a);

  if (!restantes.length) {
    return {
      resultadoChave: "falhaCritica",
      resultado: "Falha Crítica",
      detalhe: "Anulação total",
      ampliacoes: 0,
      restantes: [],
      anulados,
      anuladoMask,
      anulacaoTotal: true,
      maior: null
    };
  }

  const maior = restantes[0];
  const seis = restantes.filter((v) => v === 6).length;
  const ampliacoes = Math.max(0, seis - 1);
  const { chave, nome } = TABELA_RESULTADO[maior];

  return {
    resultadoChave: chave,
    resultado: nome,
    ampliacoes,
    restantes,
    anulados,
    anuladoMask,
    anulacaoTotal: false,
    maior
  };
}

/**
 * Aplica o Token de Sorte (regra opcional, Cap. 1): ajusta em ±1 um único
 * dado do bolo já rolado (Ação ou Risco), antes da anulação/leitura, e
 * re-resolve tudo.
 */
export function aplicarTokenDeSorte(acaoValores, riscoValores, { tipo, index, delta }) {
  const acao = [...acaoValores];
  const risco = [...riscoValores];
  const alvo = tipo === "acao" ? acao : risco;
  if (index < 0 || index >= alvo.length) throw new Error("Índice de dado inválido.");
  alvo[index] = Math.min(6, Math.max(1, alvo[index] + delta));
  return { acaoValores: acao, riscoValores: risco, resolucao: resolverAcaoRisco(acao, risco) };
}

/**
 * Rola `acao` dados de Ação contra `risco` dados de Risco usando a Roll API
 * do Foundry (para integração com Dice So Nice e histórico de chat) e
 * posta o resultado como ChatMessage.
 *
 * @param {object} opts
 * @param {number} opts.acao      Número de dados de Ação (mínimo 1).
 * @param {number} opts.risco     Número de dados de Risco (mínimo 0).
 * @param {Actor}  [opts.actor]   Actor que está rolando (para o speaker e tokens de dano).
 * @param {string} [opts.flavor]  Descrição da ação tentada.
 * @param {string[]} [opts.tagsPositivas]  Nomes das Tags positivas usadas.
 * @param {string[]} [opts.tagsNegativas]  Nomes das Tags/riscos negativos usados.
 * @param {"sofrido"|"causado"|null} [opts.modoDano]  Se definido, calcula dano automaticamente.
 * @param {string} [opts.categoriaArma]  "I" a "IV", necessário se modoDano estiver definido.
 */
export async function rolarAcaoRisco({
  acao = 1,
  risco = 0,
  actor = null,
  flavor = "",
  tagsPositivas = [],
  tagsNegativas = [],
  modoDano = null,
  categoriaArma = null
} = {}) {
  const nAcao = Math.max(1, acao);
  const nRisco = Math.max(0, risco);

  const rollAcao = await new Roll(`${nAcao}d6`).evaluate();
  const rollRisco = nRisco > 0 ? await new Roll(`${nRisco}d6`).evaluate() : null;

  const acaoValores = rollAcao.dice[0].results.map((r) => r.result);
  const riscoValores = rollRisco ? rollRisco.dice[0].results.map((r) => r.result) : [];

  const resolucao = resolverAcaoRisco(acaoValores, riscoValores);

  let dano = null;
  if (modoDano && categoriaArma) {
    const pontos = modoDano === "sofrido"
      ? danoSofrido(categoriaArma, resolucao.resultadoChave)
      : danoCausado(categoriaArma, resolucao.resultadoChave);
    dano = { pontos, categoria: categoriaArma, categoriaLabel: NOMES_CATEGORIA[categoriaArma], modo: modoDano };
  }

  const pool = { acaoValores, riscoValores };

  const content = await renderTemplate("systems/cidade-sob-o-veu/templates/chat/rolagem.hbs", {
    flavor,
    tagsPositivas,
    tagsNegativas,
    acaoValores,
    riscoValores,
    resolucao,
    dano,
    actorId: actor?.id ?? null,
    tokenDisponivel: !!actor?.system?.tokenSorte,
    pool: JSON.stringify(pool)
  });

  const speaker = actor ? ChatMessage.getSpeaker({ actor }) : ChatMessage.getSpeaker();
  const rolls = [rollAcao, rollRisco].filter(Boolean);

  const msg = await ChatMessage.create({
    speaker,
    content,
    rolls,
    sound: CONFIG.sounds.dice,
    flags: {
      "cidade-sob-o-veu": {
        pool,
        resolucao,
        dano,
        actorId: actor?.id ?? null,
        flavor,
        tagsPositivas,
        tagsNegativas,
        modoDano,
        categoriaArma,
        tokenUsado: false
      }
    }
  });

  return { rollAcao, rollRisco, resolucao, dano, message: msg };
}

/**
 * Re-renderiza o card de chat depois do Token de Sorte ajustar um dado.
 */
export async function reprocessarComToken(message, { tipo, index, delta }) {
  const flags = message.flags["cidade-sob-o-veu"];
  if (!flags || flags.tokenUsado) return;

  const { acaoValores, riscoValores, resolucao } = aplicarTokenDeSorte(
    flags.pool.acaoValores,
    flags.pool.riscoValores,
    { tipo, index, delta }
  );

  let dano = null;
  if (flags.modoDano && flags.categoriaArma) {
    const pontos = flags.modoDano === "sofrido"
      ? danoSofrido(flags.categoriaArma, resolucao.resultadoChave)
      : danoCausado(flags.categoriaArma, resolucao.resultadoChave);
    dano = { pontos, categoria: flags.categoriaArma, categoriaLabel: NOMES_CATEGORIA[flags.categoriaArma], modo: flags.modoDano };
  }

  const content = await renderTemplate("systems/cidade-sob-o-veu/templates/chat/rolagem.hbs", {
    flavor: flags.flavor,
    tagsPositivas: flags.tagsPositivas,
    tagsNegativas: flags.tagsNegativas,
    acaoValores,
    riscoValores,
    resolucao,
    dano,
    actorId: flags.actorId,
    tokenDisponivel: false,
    tokenUsado: true,
    pool: JSON.stringify({ acaoValores, riscoValores })
  });

  await message.update({
    content,
    "flags.cidade-sob-o-veu.pool": { acaoValores, riscoValores },
    "flags.cidade-sob-o-veu.resolucao": resolucao,
    "flags.cidade-sob-o-veu.dano": dano,
    "flags.cidade-sob-o-veu.tokenUsado": true
  });
}
