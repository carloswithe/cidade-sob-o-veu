/** Helpers de Handlebars usados pelas fichas, diálogos e cards de chat. */
export function registrarHandlebarsHelpers() {
  Handlebars.registerHelper("eq", (a, b) => a === b);
  Handlebars.registerHelper("neq", (a, b) => a !== b);
  Handlebars.registerHelper("gt", (a, b) => a > b);
  Handlebars.registerHelper("gte", (a, b) => a >= b);
  Handlebars.registerHelper("lt", (a, b) => a < b);
  Handlebars.registerHelper("or", (...args) => args.slice(0, -1).some(Boolean));
  Handlebars.registerHelper("and", (...args) => args.slice(0, -1).every(Boolean));
  Handlebars.registerHelper("not", (a) => !a);
  Handlebars.registerHelper("add", (a, b) => Number(a) + Number(b));
  Handlebars.registerHelper("sub", (a, b) => Number(a) - Number(b));
  Handlebars.registerHelper("times", (n, block) => {
    let out = "";
    for (let i = 0; i < n; i++) out += block.fn(i);
    return out;
  });
  Handlebars.registerHelper("range", (start, end) => {
    const out = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  });
  Handlebars.registerHelper("capitalize", (s) => (typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : s));
  Handlebars.registerHelper("selecionado", (valorAtual, valorOpcao) => (valorAtual === valorOpcao ? "selected" : ""));
  Handlebars.registerHelper("marcado", (valor) => (valor ? "checked" : ""));
  Handlebars.registerHelper("classeAtiva", (valor, classe) => (valor ? classe : ""));
  Handlebars.registerHelper("porcentagem", (atual, max) => (max > 0 ? Math.round((atual / max) * 100) : 0));
  Handlebars.registerHelper("array", (...args) => args.slice(0, -1));
}
