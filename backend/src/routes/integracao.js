const express = require('express');
const pool = require('../db');
const apiKeyAuthMiddleware = require('../middleware/apiKeyAuth');

const router = express.Router();
router.use(apiKeyAuthMiddleware);

// GET /api/integracao/profissionais?especialidade=&ativo=true
router.get('/profissionais', async (req, res) => {
  try {
    const { especialidade, ativo } = req.query;
    let query = 'SELECT id, nome, crm, especialidade, telefone, email, ativo FROM profissionais WHERE 1=1';
    const params = [];

    if (especialidade) {
      params.push(`%${especialidade}%`);
      query += ` AND especialidade ILIKE $${params.length}`;
    }
    if (ativo === 'true' || ativo === 'false') {
      params.push(ativo === 'true');
      query += ` AND ativo = $${params.length}`;
    }

    query += ' ORDER BY nome';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar profissionais' });
  }
});

// GET /api/integracao/profissionais/:id
router.get('/profissionais/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, crm, especialidade, telefone, email, ativo FROM profissionais WHERE id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Profissional não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
});

module.exports = router;
