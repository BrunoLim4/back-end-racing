// controllers/parentController.js
const Aluno = require('../models/Aluno');
const cloudinary = require('../config/cloudinary'); // Certifique-se de que o caminho está correto
const fs = require('fs');
const { calculateCategoryFromBirthDate } = require('../utils/categoryCalculator'); // Importa a função utilitária

// Controlador para cadastrar um novo aluno (para os pais)
exports.createAlunoForParents = async (req, res) => {
    try {
        const {
            nomeCompleto, dataNascimento, genero, nomeResponsavel,
            cpfResponsavel, nomeMae, contato1, contato2, statusPagamento
        } = req.body;

        const parsedDataNascimento = new Date(dataNascimento);

        if (!nomeCompleto || !dataNascimento || !genero || !nomeResponsavel ||
            !cpfResponsavel || !nomeMae || !contato1) {
            return res.status(400).json({ message: 'Por favor, preencha todos os campos obrigatórios.' });
        }

        let categoriaFinal;
        if (genero === 'Feminino') {
            categoriaFinal = 'Feminina';
        } else {
            categoriaFinal = calculateCategoryFromBirthDate(parsedDataNascimento);
            if (categoriaFinal === 'Não Definida' || categoriaFinal === 'Fora de Categoria') {
                return res.status(400).json({ message: 'Data de nascimento inválida ou fora das categorias mapeadas (2010-2020) para o gênero informado.' });
            }
        }

        let fotoUrl = '';
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'racing_dashboard/alunos', // Ajuste o folder se necessário
            });
            fotoUrl = uploadResult.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const newAluno = new Aluno({
            nomeCompleto,
            dataNascimento: parsedDataNascimento,
            genero,
            foto: fotoUrl,
            nomeResponsavel,
            cpfResponsavel,
            nomeMae,
            contato1,
            contato2,
            categoria: categoriaFinal,
            statusPagamento: statusPagamento || 'Pendente', // Pais provavelmente não definirão isso
        });

        await newAluno.save();
        res.status(201).json({ message: 'Aluno cadastrado com sucesso!', aluno: newAluno });
    } catch (error) {
        console.error('Erro ao cadastrar aluno:', error);
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Aluno já cadastrado com os dados fornecidos.' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao cadastrar aluno.', error: error.message });
    }
};