-- Execute este script no banco1, schema integrador

CREATE SCHEMA IF NOT EXISTS integrador;
SET search_path TO integrador;

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profissionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  crm VARCHAR(20) UNIQUE NOT NULL,
  especialidade VARCHAR(100) NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(150),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

