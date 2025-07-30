// routes/parentRoutes.js
const express = require('express');
const router = express.Router();
const parentController = require('../controllers/parentController');
const upload = require('../middleware/upload'); // Importa a configuração do Multer

// Rota POST para os pais cadastrarem um novo aluno
router.post('/alunos/cadastro', upload.single('foto'), parentController.createAlunoForParents);

module.exports = router;