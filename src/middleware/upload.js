const multer = require('multer');
const path = require('path');
const os = require('os'); // Importa o módulo 'os' para acessar o diretório temporário do sistema

// Configuração do Multer para aceitar apenas imagens temporariamente no servidor
const storage = multer.diskStorage({
  // CORREÇÃO: Define o diretório temporário para salvar os arquivos antes do upload para o Cloudinary
  destination: (req, file, cb) => {
    // Usa o diretório temporário padrão do sistema operacional
    cb(null, os.tmpdir()); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Apenas imagens JPEG, JPG ou PNG são permitidas.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // até 5MB
});

module.exports = upload;
