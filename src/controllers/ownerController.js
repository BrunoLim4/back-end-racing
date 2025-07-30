// controllers/ownerController.js
const Aluno = require('../models/Aluno');
const cloudinary = require('../config/cloudinary'); // Certifique-se de que o caminho está correto
const fs = require('fs');
const { calculateCategoryFromBirthDate } = require('../utils/categoryCalculator'); // Importa a função utilitária

// Controlador para obter todos os alunos (para o Dashboard do dono)
exports.getAllAlunosForOwner = async (req, res) => {
    try {
        const alunos = await Aluno.find({});
        res.status(200).json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos para o dono:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao buscar alunos.', error: error.message });
    }
};

// Controlador para obter categorias e alunos agrupados (para o Dashboard do dono)
exports.getCategoriesAndStudentsForOwner = async (req, res) => {
    try {
        const availableCategories = ['Feminina', 'Sub06', 'Sub08', 'Sub10', 'Sub14', 'Fora de Categoria'];
        const allStudents = await Aluno.find({});

        const categoriesWithStudents = availableCategories.map(catName => {
            let studentsInThisCategory;
            if (catName === 'Feminina') {
                studentsInThisCategory = allStudents.filter(student => student.genero === 'Feminino');
            } else {
                studentsInThisCategory = allStudents.filter(student => student.categoria === catName && student.genero !== 'Feminino');
            }

            return {
                id: catName,
                name: catName,
                students: studentsInThisCategory.map(student => ({
                    id: student._id,
                    name: student.nomeCompleto,
                    paid: student.statusPagamento === 'Pago',
                    foto: student.foto,
                    dataNascimento: student.dataNascimento ? student.dataNascimento.toISOString() : '',
                    genero: student.genero,
                    nomeResponsavel: student.nomeResponsavel,
                    cpfResponsavel: student.cpfResponsavel,
                    nomeMae: student.nomeMae,
                    contato1: student.contato1,
                    contato2: student.contato2,
                    categoria: student.categoria,
                    statusPagamento: student.statusPagamento,
                })),
            };
        });

        res.status(200).json(categoriesWithStudents);
    } catch (error) {
        console.error('Erro ao obter categorias e alunos para o dono:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao obter categorias e alunos.', error: error.message });
    }
};

// Controlador para atualizar um aluno existente (para o Dashboard do dono)
exports.updateAlunoForOwner = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const alunoExistente = await Aluno.findById(id);
        if (!alunoExistente) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }

        let fotoUrl = alunoExistente.foto;
        if (req.file) {
            if (alunoExistente.foto) {
                try {
                    const publicId = alunoExistente.foto.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`racing_dashboard/alunos/${publicId}`);
                    console.log(`Foto antiga ${publicId} removida do Cloudinary.`);
                } catch (deleteError) {
                    console.warn('Erro ao remover foto antiga do Cloudinary:', deleteError.message);
                }
            }
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: 'racing_dashboard/alunos', // Ajuste o folder se necessário
            });
            fotoUrl = uploadResult.secure_url;
            fs.unlinkSync(req.file.path);
        }

        const fieldsToUpdate = {
            nomeCompleto: updates.nomeCompleto || alunoExistente.nomeCompleto, // Dono pode querer editar o nome
            dataNascimento: updates.dataNascimento ? new Date(updates.dataNascimento) : alunoExistente.dataNascimento, // Dono pode querer editar a data
            genero: updates.genero || alunoExistente.genero,
            nomeResponsavel: updates.nomeResponsavel || alunoExistente.nomeResponsavel,
            cpfResponsavel: updates.cpfResponsavel || alunoExistente.cpfResponsavel,
            contato1: updates.contato1 || alunoExistente.contato1,
            contato2: updates.contato2 || alunoExistente.contato2,
            statusPagamento: updates.statusPagamento || alunoExistente.statusPagamento,
            foto: fotoUrl,
        };

        // Recalcula a categoria se a data de nascimento ou o gênero for alterado
        if (updates.dataNascimento || updates.genero) {
            const dataNascimentoParaCalculo = updates.dataNascimento ? new Date(updates.dataNascimento) : alunoExistente.dataNascimento;
            const generoParaCalculo = updates.genero || alunoExistente.genero;

            if (generoParaCalculo === 'Feminino') {
                fieldsToUpdate.categoria = 'Feminina';
            } else {
                const categoriaCalculada = calculateCategoryFromBirthDate(dataNascimentoParaCalculo);
                if (categoriaCalculada === 'Não Definida' || categoriaCalculada === 'Fora de Categoria') {
                    return res.status(400).json({ message: 'Data de nascimento inválida ou fora das categorias mapeadas (2010-2020) para o gênero informado.' });
                }
                fieldsToUpdate.categoria = categoriaCalculada;
            }
        } else if (updates.categoria) {
            fieldsToUpdate.categoria = updates.categoria;
        }

        const updatedAluno = await Aluno.findByIdAndUpdate(id, fieldsToUpdate, { new: true, runValidators: true });

        if (!updatedAluno) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }

        res.status(200).json({ message: 'Aluno atualizado com sucesso!', aluno: updatedAluno });
    } catch (error) {
        console.error('Erro ao atualizar aluno para o dono:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao atualizar aluno.', error: error.message });
    }
};

// Controlador para excluir um aluno (para o Dashboard do dono)
exports.deleteAlunoForOwner = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedAluno = await Aluno.findByIdAndDelete(id);

        if (!deletedAluno) {
            return res.status(404).json({ message: 'Aluno não encontrado.' });
        }

        if (deletedAluno.foto) {
            try {
                const publicId = deletedAluno.foto.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`racing_dashboard/alunos/${publicId}`);
                console.log(`Foto ${publicId} removida do Cloudinary.`);
            } catch (deleteError) {
                console.warn('Erro ao remover foto do Cloudinary durante a exclusão do aluno:', deleteError.message);
            }
        }

        res.status(200).json({ message: 'Aluno excluído com sucesso!', aluno: deletedAluno });
    } catch (error) {
        console.error('Erro ao excluir aluno para o dono:', error);
        res.status(500).json({ message: 'Erro interno do servidor ao excluir aluno.', error: error.message });
    }
};