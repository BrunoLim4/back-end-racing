// backend/index.js

const dotenv = require('dotenv');
// Não é necessário importar mongoose, bcrypt, fs, path, cloudinary.v2 aqui diretamente
// pois eles são usados ou configurados em outros módulos ou dentro de app.js

// Importa o 'app' do seu arquivo central de configuração da aplicação
const { app } = require('./src/app');

// Importa a função setHashedAdminPassword e router do seu módulo de login
const { setHashedAdminPassword } = require('./src/login'); // setHashedAdminPassword
const bcrypt = require('bcryptjs'); // Apenas para hash da senha
const cloudinary = require('cloudinary').v2; // Para upload da imagem do admin
const fs = require('fs'); // Para verificar a imagem local
const path = require('path'); // Para resolver caminhos de arquivo

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD_PLAIN = process.env.ADMIN_PASSWORD;

// --- Configuração do Cloudinary (Pode ser mantida aqui, ou em um config/cloudinary.js) ---
// É bom que esteja aqui se você precisa dela para o setup do admin antes de iniciar o app.
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Setup Admin com hash + upload de imagem ---
const setupAdminPassword = async () => {
    if (!ADMIN_PASSWORD_PLAIN) {
        console.error('ERRO: Variável ADMIN_PASSWORD não definida no .env. O admin não será configurado.');
        // Não use process.exit(1) aqui, para não parar a aplicação se o admin não for estritamente necessário para iniciar
        return; // Retorna para que o servidor possa tentar iniciar de qualquer forma
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD_PLAIN, salt);
        console.log('Senha de administrador hash gerada.');

        // Define o hash da senha no módulo de login
        setHashedAdminPassword(hashedPassword);

        // Caminho da imagem padrão do admin
        // Certifique-se de que o caminho está correto em relação a index.js
        // Se index.js está em 'backend/' e 'admin_default.jpg' está em 'backend/src/public/',
        // então o caminho deve ser assim:
        const imagePath = path.join(__dirname, 'src', 'public', 'admin_default.jpg');

        if (!fs.existsSync(imagePath)) {
            console.warn(`Aviso: Imagem padrão do admin não encontrada em ${imagePath}. Pulando upload de imagem para o Cloudinary.`);
            return; // Continua sem a imagem do admin
        }

        // Upload para o Cloudinary
        const uploadResult = await cloudinary.uploader.upload(imagePath, {
            folder: 'racing_dashboard/admins', // Pasta no Cloudinary
            public_id: 'admin_profile',       // Nome do arquivo no Cloudinary
            overwrite: true
        });

        console.log('Imagem do admin enviada ao Cloudinary com sucesso:');
        console.log('URL:', uploadResult.secure_url);

        // Se você tiver um modelo de Admin no MongoDB, pode salvar aqui:
        // const Admin = require('./src/models/Admin'); // Exemplo: importe seu modelo de Admin
        // await Admin.findOneAndUpdate(
        //     { username: 'admin' }, // Ou um ID fixo para o admin
        //     { password: hashedPassword, imageUrl: uploadResult.secure_url },
        //     { upsert: true, new: true, setDefaultsOnInsert: true }
        // );
        // console.log('Dados do admin atualizados/criados no DB.');

    } catch (error) {
        console.error('Erro fatal ao configurar senha e imagem do admin:', error);
        // Em um ambiente de produção, talvez você queira parar a aplicação aqui se o admin é crítico
        // process.exit(1);
    }
};

// Inicia o servidor e configura o admin APÓS a conexão do MongoDB (que acontece em app.js)
// Seu app.js já está configurando a conexão com o MongoDB.
// Então, o ideal é que setupAdminPassword seja chamado antes do app.listen.
setupAdminPassword().then(() => {
    // IMPORTANTE: As rotas de login (e todas as outras) já devem ser registradas em src/app.js.
    // Remover a linha `app.use('/login', loginRouter);` daqui, pois ela já está ou deve estar em `app.js`.
    // Se você usa '/api' como prefixo para login, mantenha isso consistente.

    app.listen(PORT, () => {
        console.log(`Servidor backend rodando em http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Falha ao iniciar a aplicação devido a erro na configuração do admin:', err);
    process.exit(1); // Sai se a configuração do admin falhar criticamente
});