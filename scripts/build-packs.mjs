/**
 * Compila os compêndios: lê os arrays de dados legíveis em packs/_source/*.json
 * e gera os pacotes LevelDB que o Foundry espera em packs/<nome>.db.
 *
 * Não foi possível rodar este script no ambiente de desenvolvimento usado para
 * gerar o sistema (sem Node.js instalado) — rode localmente antes do primeiro
 * uso ou de cada release:
 *
 *   npm install
 *   npm run build:packs
 */
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { ClassicLevel } from "classic-level";
import Datastore from "nedb-promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT, "packs", "_source");
const OUT_DIR = path.join(ROOT, "packs");
const TMP_DIR = path.join(SOURCE_DIR, ".tmp");

// NEDB=1 npm run build:packs → compila no formato legado NeDB (um arquivo por
// pacote) em vez do LevelDB padrão (uma pasta por pacote). Usado como
// alternativa em hospedagens onde o armazenamento não lida bem com o
// LevelDB (relatado em algumas instâncias do Forge).
const USE_NEDB = process.env.NEDB === "1";

const ID_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function randomID(length = 16) {
  let id = "";
  for (let i = 0; i < length; i++) id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  return id;
}

const PACKS = [
  { file: "arquetipos.json", pack: "arquetipos", docType: "Item", itemType: "arquetipo", img: "icons/svg/upgrade.svg" },
  { file: "ancestralidades.json", pack: "ancestralidades", docType: "Item", itemType: "ancestralidade", img: "icons/svg/item-bag.svg" },
  { file: "profissoes.json", pack: "profissoes", docType: "Item", itemType: "profissao", img: "icons/svg/item-bag.svg" },
  { file: "traumas.json", pack: "traumas", docType: "Item", itemType: "trauma", img: "icons/svg/terror.svg" },
  { file: "adversarios.json", pack: "adversarios", docType: "Actor", actorType: "adversario", img: "icons/svg/mystery-man.svg" },
  { file: "ameacas-da-cidade.json", pack: "ameacas-da-cidade", docType: "Actor", actorType: "adversario", img: "icons/svg/mystery-man.svg" }
];

function baseFields(name, type, img) {
  return {
    _id: randomID(),
    name,
    type,
    img,
    effects: [],
    folder: null,
    sort: 0,
    ownership: { default: 0 },
    flags: {}
  };
}

function itemSystemFor(itemType, raw) {
  switch (itemType) {
    case "arquetipo":
      return {
        emUmaFrase: raw.emUmaFrase ?? "",
        descricao: raw.descricao ?? "",
        especialidades: raw.especialidades ?? [],
        vicios: raw.vicios ?? []
      };
    case "ancestralidade":
      return {
        emUmaFrase: raw.emUmaFrase ?? "",
        descricao: raw.descricao ?? "",
        virtudes: raw.virtudes ?? [],
        vulnerabilidades: raw.vulnerabilidades ?? []
      };
    case "profissao":
      return { cobre: raw.cobre ?? "" };
    case "trauma":
      return { quandoPesa: raw.quandoPesa ?? "" };
    default:
      return {};
  }
}

function toDocument(raw, def) {
  if (def.docType === "Actor") {
    const doc = baseFields(raw.name, raw.type ?? def.actorType, def.img);
    doc._key = `!actors!${doc._id}`;
    doc.system = raw.system ?? {};
    doc.items = (raw.items ?? []).map((it) => {
      const itemDoc = baseFields(it.name, it.type, "icons/svg/item-bag.svg");
      itemDoc._key = `!actors.items!${doc._id}.${itemDoc._id}`;
      itemDoc.system = it.system ?? {};
      return itemDoc;
    });
    return doc;
  }

  const doc = baseFields(raw.name, def.itemType, def.img);
  doc._key = `!items!${doc._id}`;
  doc.system = itemSystemFor(def.itemType, raw);
  return doc;
}

async function buildPack(def) {
  const sourcePath = path.join(SOURCE_DIR, def.file);
  const raw = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

  const tmpPackDir = path.join(TMP_DIR, def.pack);
  fs.rmSync(tmpPackDir, { recursive: true, force: true });
  fs.mkdirSync(tmpPackDir, { recursive: true });

  for (const entry of raw) {
    const doc = toDocument(entry, def);
    const filename = `${doc.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}_${doc._id}.json`;
    fs.writeFileSync(path.join(tmpPackDir, filename), JSON.stringify(doc, null, 2));
  }

  const destPath = path.join(OUT_DIR, `${def.pack}.db`);
  fs.rmSync(destPath, { recursive: true, force: true });
  await compilePack(tmpPackDir, destPath, { yaml: false, nedb: USE_NEDB });

  let primaryCount;
  if (USE_NEDB) {
    const db = Datastore.create(destPath);
    primaryCount = (await db.find({})).length;
  } else {
    const db = new ClassicLevel(destPath, { keyEncoding: "utf8", valueEncoding: "json" });
    primaryCount = (await db.keys().all()).filter((k) => !k.split("!")[1]?.includes(".")).length;
    await db.close();
  }
  if (primaryCount !== raw.length) {
    throw new Error(`${def.pack}: esperava ${raw.length} documentos primários, mas o pacote compilado tem ${primaryCount}.`);
  }

  console.log(`✔ ${def.pack} (${raw.length} entradas, ${USE_NEDB ? "NeDB" : "LevelDB"}) → packs/${def.pack}.db`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const def of PACKS) await buildPack(def);
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.log("\nTodos os compêndios foram compilados.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
