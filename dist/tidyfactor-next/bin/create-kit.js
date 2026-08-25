#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

/* Lightweight Zero-Dependency ANSI formatting */
const chalk = {
  cyan: (str) => `\x1b[36m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  bold: (str) => `\x1b[1m${str}\x1b[0m`,
  dim: (str) => `\x1b[2m${str}\x1b[0m`,
};

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const pkg = require(path.join(PACKAGE_ROOT, 'package.json'));

console.log(chalk.bold(chalk.cyan(`\n======================================================`)));
console.log(chalk.bold(chalk.cyan(`  TidyFactor Next.js SaaS Engine — CLI Setup (v${pkg.version})`)));
console.log(chalk.bold(chalk.cyan(`======================================================\n`)));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (query, defaultVal) =>
  new Promise((resolve) => {
    rl.question(chalk.yellow(`${query} `) + (defaultVal ? chalk.dim(`[${defaultVal}]: `) : ''), (answer) => {
      resolve(answer.trim() || defaultVal);
    });
  });

async function main() {
  const targetDirInput = await ask('1. Target Directory to initialize Next.js SaaS architecture:', './');
  const targetDir = path.resolve(process.cwd(), targetDirInput);

  console.log(chalk.cyan('\nSelect Pluggable Query Layer:'));
  console.log('  1) Supabase JS Client + Raw SQL / RLS');
  console.log('  2) Drizzle ORM + Supabase Postgres');
  console.log('  3) Prisma ORM + Supabase Postgres');
  const queryChoice = await ask('Select query layer (1-3):', '1');

  console.log(chalk.cyan('\nSelect Tenant Resolution Strategy:'));
  console.log('  1) Subdomain (e.g., tenant.app.com)');
  console.log('  2) Custom Domain (e.g., custom.com)');
  console.log('  3) Path Prefix (e.g., app.com/tenant)');
  console.log('  4) Session Claim (Supabase Auth JWT)');
  const tenantChoice = await ask('Select resolution strategy (1-4):', '4');

  console.log(chalk.cyan('\nSelect Role Model:'));
  console.log('  1) Fixed Roles (Owner, Admin, Member)');
  console.log('  2) Custom RBAC (Role-Permissions mapping table)');
  console.log('  3) Attribute-Based Access Control (ABAC)');
  const roleChoice = await ask('Select role model (1-3):', '1');

  console.log(chalk.green(`\nInitializing TidyFactor Next.js SaaS Architecture in: ${targetDir}...`));

  // Copy skill to target directory .agents/skills/tidyfactor-next
  const skillDestDir = path.join(targetDir, '.agents', 'skills', 'tidyfactor-next');
  fs.mkdirSync(skillDestDir, { recursive: true });

  const filesToCopy = ['SKILL.md', 'package.json', 'README.md', 'README.ar.md', 'LICENSE', 'brand.json', '.tidyfactor', 'AGENTS.md', 'SKILL-REGISTRY.md', 'VISION.md'];
  for (const f of filesToCopy) {
    const srcFile = path.join(PACKAGE_ROOT, f);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(skillDestDir, f));
    }
  }

  // Copy references recursively
  const copyDir = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      const srcItem = path.join(src, item);
      const destItem = path.join(dest, item);
      if (fs.statSync(srcItem).isDirectory()) {
        copyDir(srcItem, destItem);
      } else {
        fs.copyFileSync(srcItem, destItem);
      }
    }
  };

  copyDir(path.join(PACKAGE_ROOT, 'references'), path.join(skillDestDir, 'references'));
  if (fs.existsSync(path.join(PACKAGE_ROOT, 'tools'))) {
    copyDir(path.join(PACKAGE_ROOT, 'tools'), path.join(skillDestDir, 'tools'));
  }

  console.log(chalk.bold(chalk.green('\n✅ TidyFactor Next.js Architecture Skill installed successfully!')));
  console.log(chalk.dim(`Installed at: ${skillDestDir}`));
  console.log(chalk.cyan('\n🚀 Available Slash Commands:'));
  console.log('  - /next init          -> Scaffold multi-tenant project & generate ARCHITECTURE.md');
  console.log('  - /next tenant        -> Edge resolution, context propagation & lifecycle');
  console.log('  - /next rls           -> 4-policy RLS templates & isolation leak audit');
  console.log('  - /next auth          -> Supabase Auth, custom JWT hook & RBAC');
  console.log('  - /next perf audit    -> 13-phase dev performance & resource audit');
  console.log('  - /next perf diagnose -> Bottleneck classification & causality models');
  console.log('  - /next perf optimize -> Safe Green-tier optimizations with DELTA benchmarks\n');

  rl.close();
}

main().catch((err) => {
  console.error(chalk.red(`\n❌ Error: ${err.message}`));
  rl.close();
  process.exit(1);
});
