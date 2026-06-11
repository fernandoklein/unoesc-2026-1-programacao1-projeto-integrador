const express = require('express');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { especialidade, nome } = req.query;
    let query = 'SELECT * FROM profissionais WHERE 1=1';
    const params = [];

    if (especialidade) {
      params.push(`%${especialidade}%`);
      query += ` AND especialidade ILIKE $${params.length}`;
    }
    if (nome) {
      params.push(`%${nome}%`);
      query += ` AND nome ILIKE $${params.length}`;
    }

    query += ' ORDER BY nome';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar profissionais' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profissionais WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
});

router.post('/', async (req, res) => {
  const { nome, crm, especialidade, telefone, email } = req.body;
  if (!nome || !crm || !especialidade) {
    return res.status(400).json({ error: 'Nome, CRM e especialidade são obrigatórios' });
  }

  try {
    const existe = await pool.query('SELECT id FROM profissionais WHERE crm = $1', [crm]);
    if (existe.rows[0]) return res.status(409).json({ error: 'CRM já cadastrado' });

    const result = await pool.query(
      'INSERT INTO profissionais (nome, crm, especialidade, telefone, email, ativo) VALUES ($1,$2,$3,$4,$5,true) RETURNING *',
      [nome, crm, especialidade, telefone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao cadastrar profissional' });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, crm, especialidade, telefone, email } = req.body;

  try {
    const atual = await pool.query('SELECT * FROM profissionais WHERE id = $1', [req.params.id]);
    if (!atual.rows[0]) return res.status(404).json({ error: 'Profissional não encontrado' });

    if (crm && crm !== atual.rows[0].crm) {
      const existe = await pool.query('SELECT id FROM profissionais WHERE crm = $1 AND id != $2', [crm, req.params.id]);
      if (existe.rows[0]) return res.status(409).json({ error: 'CRM já cadastrado' });
    }

    const result = await pool.query(
      'UPDATE profissionais SET nome=$1, crm=$2, especialidade=$3, telefone=$4, email=$5 WHERE id=$6 RETURNING *',
      [
        nome || atual.rows[0].nome,
        crm || atual.rows[0].crm,
        especialidade || atual.rows[0].especialidade,
        telefone || atual.rows[0].telefone,
        email || atual.rows[0].email,
        req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar profissional' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { ativo } = req.body;
  if (typeof ativo !== 'boolean') return res.status(400).json({ error: 'Campo "ativo" deve ser boolean' });

  try {
    const result = await pool.query(
      'UPDATE profissionais SET ativo=$1 WHERE id=$2 RETURNING *',
      [ativo, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

module.exports = router;
