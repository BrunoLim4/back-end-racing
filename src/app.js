// app.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose'); // Importa o mongoose
require('dotenv').config(); // Carrega variáveis de ambiente (se você tiver um arquivo .env)

// Importa as novas rotas separadas
const parentRoutes = require('./routes/parentRoutes');
const ownerRoutes = require('./routes/ownerRoutes');

// Importa as rotas de login (assumindo que 'login' é um módulo separado que exporta um router)
const { router: loginRoutes } = require('./login'); // Mantenha essa importação se seu arquivo 'login.js' exporta um router dessa forma

const app = express();

// --- Conexão com o MongoDB ---
// Aumentando os tempos limite de conexão para dar mais tempo ao Mongoose
// para estabelecer a conexão e realizar operações, especialmente em ambientes de nuvem.
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Aumenta o tempo limite de seleção do servidor para 30 segundos
    socketTimeoutMS: 45000,         // Aumenta o tempo limite de inatividade do socket para 45 segundos
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro de conexão com o MongoDB:', err));

// --- Middlewares Essenciais ---

// CORREÇÃO: Configuração do CORS para permitir o domínio do seu frontend da Vercel
const corsOptions = {
  origin: 'https://cadastroracing.vercel.app', // Substitua pelo domínio EXATO do seu frontend na Vercel
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos HTTP permitidos
  credentials: true, // Permite o envio de cookies de credenciais (se você usar no futuro)
  optionsSuccessStatus: 204 // Para navegadores mais antigos (IE11, alguns SmartTVs)
};
app.use(cors(corsOptions)); // Aplica o middleware CORS com as opções configuradas

app.use(express.json()); // Para parsear o corpo das requisições JSON
app.use(express.urlencoded({ extended: true })); // Para parsear o corpo das requisições URL-encoded

// --- Servir arquivos estáticos da pasta de uploads ---
// O 'path.join(__dirname, '..', 'uploads'))' é usado porque 'uploads' está um nível acima
// do diretório onde 'app.js' está (assumindo 'backend/src/app.js' e 'backend/uploads')
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// --- Uso das Rotas Separadas ---
// Prefira usar prefixos que identifiquem claramente a quem a rota pertence
app.use('/api/pais', parentRoutes); // Rotas para o fluxo dos pais (ex: POST /api/pais/alunos/cadastro)
app.use('/api/donos', ownerRoutes); // Rotas para o dashboard do dono (ex: GET /api/donos/alunos)

// --- Uso das Rotas de Login ---
// Se suas rotas de login são gerais ou para ambos, mantenha como '/api'
// Se o login for específico para o dono, considere mover para dentro de ownerRoutes ou criar '/api/auth'
app.use('/api', loginRoutes); // Suas rotas de login (ex: POST /api/login)

// --- Rota Raiz (Opcional) ---
app.get('/', (req, res) => {
    res.send('API da Escolinha de Futebol está online e separada!');
});

// Exporta o aplicativo (útil para testes ou se você inicia o servidor em outro arquivo)
module.exports = { app };
