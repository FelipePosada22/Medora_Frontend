#!/usr/bin/env node
import { createInterface } from 'readline';
import { spawn }           from 'child_process';

const ENVS = [
  {
    key:    'local',
    label:  'Local',
    apiUrl: 'http://localhost:3000',
    ngConf: 'local',
  },
  {
    key:    'dev',
    label:  'Dev (Railway)',
    apiUrl: 'https://joyful-trust-dev.up.railway.app',
    ngConf: 'development',
  },
];

// ── UI ───────────────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const CYAN   = '\x1b[36m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM    = '\x1b[2m';

console.log(`\n${BOLD}${CYAN}  Medora Frontend — Selección de ambiente${RESET}\n`);

ENVS.forEach((env, i) => {
  console.log(`  ${BOLD}${i + 1}.${RESET} ${env.label.padEnd(14)} ${DIM}${env.apiUrl}${RESET}`);
});

console.log('');

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question(`${BOLD}  ¿Con qué ambiente quieres iniciar? [1-${ENVS.length}]: ${RESET}`, (answer) => {
  rl.close();

  const idx = parseInt(answer.trim(), 10) - 1;

  if (isNaN(idx) || idx < 0 || idx >= ENVS.length) {
    console.error(`\n  ${YELLOW}Opción inválida. Usando ambiente por defecto: dev${RESET}\n`);
    run(ENVS[1]);
    return;
  }

  run(ENVS[idx]);
});

// ── Runner ───────────────────────────────────────────────────────────────────

function run(env) {
  console.log(`\n  ${GREEN}✔ Iniciando con: ${BOLD}${env.label}${RESET}`);
  console.log(`  ${DIM}API → ${env.apiUrl}${RESET}\n`);

  const args  = ['ng', 'serve', `--configuration=${env.ngConf}`];
  const child = spawn('npx', args, { stdio: 'inherit', shell: true });

  child.on('error', (err) => {
    console.error(`Error al ejecutar ng serve: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => process.exit(code ?? 0));
}
