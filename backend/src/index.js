require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const runMigrations = require('./migrate');
const swaggerSpec = require('./swagger');

const authRoutes = require('./routes/auth');
const profissionaisRoutes = require('./routes/profissionais');
const usuariosRoutes = require('./routes/usuarios');
const integracaoRoutes = require('./routes/integracao');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'G2 - API Profissionais de Saúde' }));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/profissionais', profissionaisRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/integracao', integracaoRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

runMigrations()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Falha nas migrações:', err.message);
    process.exit(1);
  });
