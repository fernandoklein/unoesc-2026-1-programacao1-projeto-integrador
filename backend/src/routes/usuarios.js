const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nome, email, criado_em FROM usuarios ORDER BY nome'
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

router.post('/', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios' });

  if (senha.length < 6)
    return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows[0]) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, criado_em',
      [nome, email, senhaHash]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

module.exports = router;
