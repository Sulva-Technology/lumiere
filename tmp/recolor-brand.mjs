// One-off recolor: leftover green/sage/moss admin theme -> brand brown/gold.
// Palette source of truth: app/globals.css (forest-950 #4a2109, forest-700 #8B4411,
// moss-light #c99361, admin cream #F7E7C1, admin gold rgba(212,168,71,...)).
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['app', 'components', 'lib'];
const EXTS = new Set(['.ts', '.tsx']);

const REPLACEMENTS = [
  // greens -> brand
  ['rgba(154,177,143,', 'rgba(201,147,97,'],   // sage border -> gold
  ['rgba(108,139,103,', 'rgba(139,68,17,'],    // moss fill -> brand brown
  ['rgba(58,77,57,', 'rgba(74,33,9,'],         // deep moss -> forest-950
  ['rgba(22,33,26,', 'rgba(38,22,10,'],        // green panel -> brown panel
  ['rgba(12,21,16,', 'rgba(20,13,5,'],         // green ground -> brown ground
  ['rgba(16,24,16,', 'rgba(20,13,5,'],
  ['#0c1510', '#140d05'],
  ['#d7e0d0', '#e8d3bd'],                      // secondary text
  ['#eef2ea', '#F7E7C1'],                      // primary text
  ['#e4eadf', '#F7E7C1'],
  // semantic green -> gold (keeps paid/delivered/completed readable on dark brown)
  ['border border-emerald-300/20 bg-emerald-400/12 text-emerald-100',
   'border border-[rgba(212,168,71,0.22)] bg-[rgba(212,168,71,0.12)] text-[#f4ddb2]'],
  ['bg-emerald-500/15 text-emerald-300',
   'bg-[rgba(212,168,71,0.16)] text-[#F7E7C1]'],
  ['text-emerald-300', 'text-[#c99361]'],
  // availability slot chip (light card, needs text contrast)
  ['bg-green-100 text-green-700', 'bg-[#f6e7d3] text-[#713813]'],
];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) walk(full);
    else if (EXTS.has(extname(entry))) process_(full);
  }
}

const changed = [];
function process_(file) {
  const original = readFileSync(file, 'utf8');
  let next = original;
  const hits = [];
  for (const [from, to] of REPLACEMENTS) {
    if (!next.includes(from)) continue;
    const count = next.split(from).length - 1;
    hits.push(`${from} -> ${to} (${count})`);
    next = next.split(from).join(to);
  }
  if (next === original) return;
  writeFileSync(file, next);
  changed.push({ file, hits });
}

for (const root of ROOTS) walk(root);

for (const { file, hits } of changed) {
  console.log(`\n${file}`);
  for (const hit of hits) console.log(`  ${hit}`);
}
console.log(`\n${changed.length} files updated`);
