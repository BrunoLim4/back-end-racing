// backend/src/login.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Importe a biblioteca jsonwebtoken

// Variável para armazenar a senha hash do admin, definida pelo index.js
let HASHED_ADMIN_PASSWORD = '';

// A chave secreta para assinar o token JWT.
// É CRUCIAL que esta chave seja armazenada de forma segura (variável de ambiente).
// Crie uma variável JWT_SECRET no seu arquivo .env do backend.
const JWT_SECRET = process.env.JWT_SECRET;

// Função para definir o hash da senha do admin
function setHashedAdminPassword(hash) {
  HASHED_ADMIN_PASSWORD = hash;
  console.log('Senha hash do administrador definida no módulo de login.');
}

// Rota de login
router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Código de acesso é obrigatório.', authenticated: false });
  }

  if (!HASHED_ADMIN_PASSWORD) {
    console.error('ERRO: HASHED_ADMIN_PASSWORD não definido na rota de login. Verifique a configuração.');
    return res.status(500).json({ message: 'Erro de configuração do servidor: Senha do admin não carregada.', authenticated: false });
  }

  // Verifique se a chave secreta JWT está definida
  if (!JWT_SECRET) {
      console.error('ERRO: JWT_SECRET não definido nas variáveis de ambiente. O token não pode ser gerado.');
      return res.status(500).json({ message: 'Erro de configuração do servidor: Chave secreta JWT ausente.', authenticated: false });
  }

  try {
    const isMatch = await bcrypt.compare(password, HASHED_ADMIN_PASSWORD);

    if (isMatch) {
      // Login bem-sucedido. Agora, gere o token JWT.
      const payload = {
        user: {
          id: 'admin_user_id', // Um ID único para o usuário (pode ser fixo para o admin)
          role: 'owner'       // O papel/perfil do usuário
        }
      };

      // Assina o token JWT com o payload, a chave secreta e uma expiração
      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: '1h' }, // O token expira em 1 hora. Ajuste conforme sua necessidade.
        (err, token) => {
          if (err) {
            console.error('Erro ao gerar token JWT:', err);
            return res.status(500).json({ message: 'Erro ao gerar token de autenticação.', authenticated: false });
          }
          // Retorna o token junto com a mensagem de sucesso
          return res.status(200).json({ message: 'Login bem-sucedido!', authenticated: true, token });
        }
      );
    } else {
      // Credenciais inválidas
      return res.status(401).json({ message: 'Código de acesso incorreto.', authenticated: false });
    }
  } catch (error) {
    console.error('Erro durante a comparação da senha na rota de login:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.', authenticated: false });
  }
});

// Exporta um objeto com o router e a função
module.exports = {
  router,
  setHashedAdminPassword,
};