// routes/ownerRoutes.js
const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const upload = require('../middleware/upload'); // Importa a configuração do Multer

// Rota GET para obter todos os alunos (para o Dashboard do dono)
router.get('/alunos', ownerController.getAllAlunosForOwner);

// Rota GET para obter categorias e alunos agrupados (para o Dashboard do dono)
router.get('/categorias', ownerController.getCategoriesAndStudentsForOwner);

// Rota PUT para atualizar um aluno por ID (também permite upload de foto)
router.put('/alunos/:id', upload.single('foto'), ownerController.updateAlunoForOwner);

// Rota DELETE para excluir um aluno por ID
router.delete('/alunos/:id', ownerController.deleteAlunoForOwner);

module.exports = router;