require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const getDbConfig = require('./dbConfig');

async function runMigrations() {
  const client = new Client(getDbConfig());

  await client.connect();

  // Bootstrap mínimo: só garante o schema
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.DB_SCHEMA}`);
  await client.query(`SET search_path TO ${process.env.DB_SCHEMA}`);

  // Verifica se a tabela de controle já existe
  const { rows: check } = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = $1 AND table_name = '_migrations'
    )
  `, [process.env.DB_SCHEMA]);

  let jaRodaram = new Set();
  if (check[0].exists) {
    const { rows } = await client.query('SELECT nome FROM _migrations ORDER BY nome');
    jaRodaram = new Set(rows.map((r) => r.nome));
  }

  const dir = path.join(__dirname, '../sql/migrations');
  const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  console.log('\nMigrações:');

  let pendentes = 0;
  for (const arquivo of arquivos) {
    if (jaRodaram.has(arquivo)) {
      console.log(`  ✓ ${arquivo}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, arquivo), 'utf8');
    const statements = sql.split(';').map((s) => s.trim()).filter((s) => s.length > 0);
    for (const stmt of statements) {
      await client.query(stmt);
    }

    await client.query('INSERT INTO _migrations (nome) VALUES ($1)', [arquivo]);
    console.log(`  → ${arquivo} (executado)`);
    pendentes++;
  }

  if (pendentes === 0) {
    console.log('  Nenhuma migração pendente.\n');
  } else {
    console.log(`\n  ${pendentes} migração(ões) aplicada(s).\n`);
  }

  await client.end();
}

module.exports = runMigrations;
