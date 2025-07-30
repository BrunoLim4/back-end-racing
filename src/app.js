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

// --- Conexão com o MongoDB (Adicionado) ---
// É crucial conectar ao banco de dados logo no início da sua aplicação
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true, // Removido, deprecated no Mongoose 6+
    // useFindAndModify: false, // Removido, deprecated no Mongoose 6+
})
.then(() => console.log('Conectado ao MongoDB!'))
.catch(err => console.error('Erro de conexão com o MongoDB:', err));

// --- Middlewares Essenciais ---
app.use(cors()); // Permite requisições de diferentes origens (importante para o frontend)
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
