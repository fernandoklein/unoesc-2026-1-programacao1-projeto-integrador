CREATE TABLE IF NOT EXISTS _migrations (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR(255) UNIQUE NOT NULL,
  executado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profissionais (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR(100) NOT NULL,
  crm          VARCHAR(20) UNIQUE NOT NULL,
  especialidade VARCHAR(100) NOT NULL,
  telefone     VARCHAR(20),
  email        VARCHAR(150),
  ativo        BOOLEAN DEFAULT TRUE,
  criado_em    TIMESTAMPTZ DEFAULT NOW()
);
