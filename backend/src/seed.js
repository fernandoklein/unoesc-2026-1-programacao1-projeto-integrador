require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const getDbConfig = require('./dbConfig');

async function seed() {
  const client = new Client(getDbConfig({ options: `-c search_path=${process.env.DB_SCHEMA}` }));

  await client.connect();
  console.log('Conectado ao banco de dados.');

  const senhaHash = await bcrypt.hash('admin123', 10);

  await client.query(
    `INSERT INTO usuarios (nome, email, senha_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET senha_hash = $3`,
    ['Administrador', 'admin@g2.com', senhaHash]
  );

  console.log('Usuário admin criado: admin@g2.com / admin123');
  await client.end();
}

seed().catch((err) => {
  console.error('Erro no seed:', err.message);
  process.exit(1);
});
