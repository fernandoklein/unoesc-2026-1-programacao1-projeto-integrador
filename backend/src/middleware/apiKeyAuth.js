function apiKeyAuthMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.PARTNER_API_KEY) {
    return res.status(401).json({ error: 'Chave de API inválida ou não fornecida' });
  }

  next();
}

module.exports = apiKeyAuthMiddleware;
