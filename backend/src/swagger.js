// Especificação OpenAPI 3 da API do G2 - Profissionais de Saúde.
// Servida via Swagger UI em /api/docs (ver index.js).

const SERVER_URL = process.env.SWAGGER_SERVER_URL || 'https://g2-backend-ey8d.onrender.com';

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'G2 - Profissionais de Saúde',
    version: '1.0.0',
    description:
      'API do módulo G2 do Sistema de Saúde Integrado.\n\n' +
      '- Rotas **internas** (`/api/profissionais`, `/api/usuarios`) usam autenticação JWT ' +
      '(`Authorization: Bearer <token>` obtido no login).\n' +
      '- Rotas de **integração** (`/api/integracao/...`), consumidas por outros grupos (Agenda G3, ' +
      'Consultas G4), usam a chave de parceiro no header `x-api-key`.',
  },
  servers: [{ url: SERVER_URL, description: 'Produção (Render)' }],
  tags: [
    { name: 'Autenticação', description: 'Login e logout' },
    { name: 'Profissionais', description: 'CRUD de profissionais (JWT)' },
    { name: 'Usuários', description: 'Gestão de usuários (JWT)' },
    { name: 'Integração', description: 'Consumo por outros módulos (x-api-key)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT retornado por POST /api/auth/login.',
      },
      apiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Chave de parceiro (PARTNER_API_KEY) para integração entre módulos.',
      },
    },
    schemas: {
      Profissional: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Dra. Ana Souza' },
          crm: { type: 'string', example: 'CRM-SC 12345' },
          especialidade: { type: 'string', example: 'Cardiologia' },
          telefone: { type: 'string', nullable: true, example: '(49) 99999-0000' },
          email: { type: 'string', nullable: true, example: 'ana@clinica.com' },
          ativo: { type: 'boolean', example: true },
          criado_em: { type: 'string', format: 'date-time' },
        },
      },
      ProfissionalInput: {
        type: 'object',
        required: ['nome', 'crm', 'especialidade'],
        properties: {
          nome: { type: 'string', example: 'Dra. Ana Souza' },
          crm: { type: 'string', example: 'CRM-SC 12345' },
          especialidade: { type: 'string', example: 'Cardiologia' },
          telefone: { type: 'string', example: '(49) 99999-0000' },
          email: { type: 'string', example: 'ana@clinica.com' },
        },
      },
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nome: { type: 'string', example: 'Administrador' },
          email: { type: 'string', example: 'admin@g2.com' },
          criado_em: { type: 'string', format: 'date-time' },
        },
      },
      Erro: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Credenciais inválidas' } },
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Autenticação'],
        summary: 'Autentica e retorna um token JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                  email: { type: 'string', example: 'admin@g2.com' },
                  senha: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login bem-sucedido',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: { type: 'string' },
                    usuario: { $ref: '#/components/schemas/Usuario' },
                  },
                },
              },
            },
          },
          400: { description: 'Dados ausentes', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          401: { description: 'Credenciais inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Autenticação'],
        summary: 'Encerra a sessão (limpa o cookie)',
        responses: { 200: { description: 'Logout efetuado' } },
      },
    },
    '/api/profissionais': {
      get: {
        tags: ['Profissionais'],
        summary: 'Lista profissionais (interno)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'especialidade', in: 'query', schema: { type: 'string' }, description: 'Filtro por especialidade (parcial)' },
          { name: 'nome', in: 'query', schema: { type: 'string' }, description: 'Filtro por nome (parcial)' },
        ],
        responses: {
          200: { description: 'Lista de profissionais', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Profissional' } } } } },
          401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
      post: {
        tags: ['Profissionais'],
        summary: 'Cadastra um profissional',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfissionalInput' } } } },
        responses: {
          201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profissional' } } } },
          400: { description: 'Campos obrigatórios ausentes', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          409: { description: 'CRM já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/api/profissionais/{id}': {
      get: {
        tags: ['Profissionais'],
        summary: 'Busca um profissional por id',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Profissional', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profissional' } } } },
          404: { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
      put: {
        tags: ['Profissionais'],
        summary: 'Atualiza um profissional',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ProfissionalInput' } } } },
        responses: {
          200: { description: 'Atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profissional' } } } },
          404: { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          409: { description: 'CRM já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/api/profissionais/{id}/status': {
      patch: {
        tags: ['Profissionais'],
        summary: 'Ativa ou inativa um profissional',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['ativo'], properties: { ativo: { type: 'boolean', example: false } } } } },
        },
        responses: {
          200: { description: 'Status atualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profissional' } } } },
          400: { description: 'Campo "ativo" inválido', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          404: { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/api/usuarios': {
      get: {
        tags: ['Usuários'],
        summary: 'Lista usuários',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de usuários', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } } } } },
          401: { description: 'Não autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
      post: {
        tags: ['Usuários'],
        summary: 'Cria um usuário',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                  nome: { type: 'string', example: 'Maria' },
                  email: { type: 'string', example: 'maria@g2.com' },
                  senha: { type: 'string', minLength: 6, example: 'senha123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Criado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Usuario' } } } },
          400: { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          409: { description: 'E-mail já cadastrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/api/integracao/profissionais': {
      get: {
        tags: ['Integração'],
        summary: 'Lista profissionais para outros módulos',
        description: 'Endpoint consumido por Agenda (G3) e Consultas (G4). Requer header `x-api-key`.',
        security: [{ apiKeyAuth: [] }],
        parameters: [
          { name: 'especialidade', in: 'query', schema: { type: 'string' }, description: 'Filtro por especialidade (parcial)' },
          { name: 'ativo', in: 'query', schema: { type: 'string', enum: ['true', 'false'] }, description: 'Filtra por status' },
        ],
        responses: {
          200: { description: 'Lista de profissionais', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Profissional' } } } } },
          401: { description: 'Chave de API inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
    '/api/integracao/profissionais/{id}': {
      get: {
        tags: ['Integração'],
        summary: 'Busca um profissional por id (integração)',
        security: [{ apiKeyAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Profissional', content: { 'application/json': { schema: { $ref: '#/components/schemas/Profissional' } } } },
          401: { description: 'Chave de API inválida', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          404: { description: 'Não encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
