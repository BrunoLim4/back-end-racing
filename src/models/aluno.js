// backend/src/models/Aluno.js

const mongoose = require('mongoose');

// Definição do Schema do Aluno
const alunoSchema = new mongoose.Schema({
  nomeCompleto: { type: String, required: true },
  dataNascimento: { type: Date, required: true },
  genero: { type: String, required: true },
  foto: { type: String, default: '' }, // URL ou caminho da imagem
  nomeResponsavel: { type: String, required: true },
  cpfResponsavel: { type: String, required: true },
  nomeMae: { type: String, required: true },
  contato1: { type: String, required: true },
  contato2: { type: String, default: '' },
  categoria: { type: String, required: true }, // Ex: Sub6, Sub8, Sub10, Sub14
  statusPagamento: { type: String, default: 'Pendente' }, // Ex: Pago, Pendente
}, { timestamps: true }); // Adiciona campos createdAt e updatedAt

// Cria e exporta o modelo Aluno
const Aluno = mongoose.model('Aluno', alunoSchema);

module.exports = Aluno;
