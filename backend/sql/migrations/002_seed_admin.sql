-- Cria o usuario admin padrao (admin@g2.com / admin123) se ainda nao existir
INSERT INTO usuarios (nome, email, senha_hash)
VALUES ('Administrador', 'admin@g2.com', '$2b$10$OSwatDbvrE4EttEqvhyay.RR48xo05GD5LUCIxMYqIJwe9qhjtHQG')
ON CONFLICT (email) DO NOTHING;
