/**
 * Capítulo 3 — Características. Não é um compêndio (são só listas de nomes
 * curtos, sem texto longo o bastante para justificar Items separados), mas
 * alimenta os seletores de Qualidade/Defeito na ficha do Personagem —
 * exatamente como o objeto `CAR` de ficha-interativa.html.
 */
export const CARACTERISTICAS = {
  Mental: {
    q: ["Perspicaz", "Memória Prodigiosa", "Raciocínio Rápido", "Sangue-Frio", "Estrategista", "Curioso Incansável", "Intuitivo", "Erudito", "Engenhoso", "Disciplinado", "Observador", "Mente Analítica", "Vontade de Ferro", "Senso de Direção", "Polímata", "Leitor de Pessoas", "Paciente", "Imaginação Fértil", "Pragmático", "Aprendiz Veloz"],
    d: ["Distraído", "Impulsivo", "Memória Falha", "Indeciso", "Obsessivo", "Medroso", "Supersticioso", "Teimoso", "Pensamento Lento", "Pessimista", "Ingênuo", "Mente Dispersa", "Paranoico", "Analfabeto Funcional", "Curiosidade Fatal", "Traumatizável", "Sem Noção de Perigo", "Rígido", "Vive no Passado", "Perfeccionista Paralisante"]
  },
  Social: {
    q: ["Carismático", "Lábia Rápida", "Voz de Comando", "Empático", "Negociador", "Rosto Amigável", "Bem-Relacionado", "Diplomata", "Mentiroso Convincente", "Sedutor", "Contador de Histórias", "Camaleão Social", "Reputação Sólida", "Intimidador", "Bom Ouvinte", "Líder Nato", "Discreto", "Senso de Etiqueta", "Humor Desarmante", "Confiável"],
    d: ["Arrogante", "Desconfiado", "Timidez Paralisante", "Grosseiro", "Má Reputação", "Fofoqueiro", "Provocador", "Mentiroso Compulsivo", "Presunçoso", "Rosto Marcado", "Ranzinza", "Submisso", "Ciumento", "Preconceituoso", "Inconveniente", "Frio e Distante", "Devedor Crônico", "Explosivo", "Manipulável", "Forasteiro Eterno"]
  },
  Física: {
    q: ["Atlético", "Forte como um Touro", "Ágil", "Resistente", "Reflexos Felinos", "Visão de Águia", "Audição Apurada", "Mãos Firmes", "Fôlego Inesgotável", "Silencioso", "Equilibrista", "Nadador Nato", "Recuperação Rápida", "Estômago de Ferro", "Presença Imponente", "Mira Certeira", "Escalador", "Leve como uma Pluma", "Tolerante ao Clima", "Coordenação Perfeita"],
    d: ["Pesado", "Franzino", "Lento", "Desastrado", "Visão Fraca", "Audição Ruim", "Fôlego Curto", "Ferimento Antigo", "Saúde Frágil", "Mãos Trêmulas", "Medo de Altura", "Não Sabe Nadar", "Sono Pesado", "Barulhento", "Dependente Químico", "Cicatrização Lenta", "Alergia Severa", "Baixa Tolerância à Dor", "Sensível ao Clima", "Movimentos Rígidos"]
  }
};

/** Lista achatada de opções { grupo, nome, polaridade } para montar <select>. */
export function listaCaracteristicas(polaridade) {
  const chave = polaridade === "positiva" ? "q" : "d";
  const out = [];
  for (const [grupo, tabelas] of Object.entries(CARACTERISTICAS)) {
    for (const nome of tabelas[chave]) out.push({ grupo, nome });
  }
  return out;
}

export function sortearCaracteristica(polaridade) {
  const lista = listaCaracteristicas(polaridade);
  return lista[Math.floor(Math.random() * lista.length)];
}
