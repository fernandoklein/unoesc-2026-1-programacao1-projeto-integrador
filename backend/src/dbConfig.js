// Monta a config de conexão pg: usa DATABASE_URL (Render Postgres, com SSL)
// quando disponível, ou as variáveis DB_* individuais para desenvolvimento local.
function getDbConfig(extra = {}) {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      ...extra,
    };
  }

  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ...extra,
  };
}

module.exports = getDbConfig;
