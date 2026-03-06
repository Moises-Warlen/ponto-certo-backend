// C:\Projetos\criar-backend.js
const fs = require('fs');
const path = require('path');

const backendPath = 'C:\\Projetos\\ponto-certo-backend';

// ========================================
// 1. PACKAGE.JSON
// ========================================
const packageJson = {
  "name": "ponto-certo-backend",
  "version": "1.0.0",
  "description": "Backend do Sistema Ponto-Certo",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "migrate": "node scripts/migrate.js",
    "seed:admin": "node scripts/criar-admin.js",
    "seed:teste": "node scripts/criar-teste.js",
    "backup": "node scripts/backup.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "compression": "^1.7.4",
    "dotenv": "^16.0.3",
    "pg": "^8.11.0",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.32.1",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.1",
    "multer": "^1.4.5",
    "sharp": "^0.32.1",
    "exceljs": "^4.4.0",
    "pdfkit": "^0.14.0",
    "nodemailer": "^6.9.3",
    "handlebars": "^4.7.7",
    "uuid": "^9.0.0",
    "cpf-cnpj-validator": "^1.0.3",
    "date-fns": "^2.30.0",
    "express-rate-limit": "^6.7.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
};

fs.writeFileSync(
  path.join(backendPath, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);
console.log('✅ package.json criado');

// ========================================
// 2. .ENV
// ========================================
const envContent = `# ========== CONFIGURAÇÕES GERAIS ==========
NODE_ENV=development
PORT=3000
APP_NAME="Ponto-Certo"
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# ========== BANCO DE DADOS (Neon PostgreSQL) ==========
# Crie em: https://neon.tech
DB_HOST=ep-silent-xxxxx.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=seu_usuario
DB_PASS=sua_senha
DATABASE_URL=postgresql://seu_usuario:sua_senha@ep-silent-xxxxx.neon.tech/neondb?sslmode=require

# ========== AUTENTICAÇÃO ==========
JWT_SECRET=ponto-certo-super-secret-key-2024
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# ========== EMAIL ==========
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=sua-senha-de-app

# ========== UPLOAD ==========
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# ========== ADMIN PADRÃO ==========
ADMIN_NOME=Moises Warlem
ADMIN_EMAIL=moises@ponto-certo.com
ADMIN_SENHA=@1q2w3e4r@
`;

fs.writeFileSync(path.join(backendPath, '.env'), envContent);
console.log('✅ .env criado');

// ========================================
// 3. CONFIG/DATABASE.JS
// ========================================
const databaseConfig = `// src/config/database.js
require('dotenv').config();

module.exports = {
  development: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  },
  production: {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  }
};`;

fs.writeFileSync(
  path.join(backendPath, 'src', 'config', 'database.js'),
  databaseConfig
);
console.log('✅ src/config/database.js criado');

// ========================================
// 4. MODELO EMPRESA
// ========================================
const empresaModel = `// src/models/Empresa.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Empresa = sequelize.define('Empresa', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    razaoSocial: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    nomeFantasia: {
      type: DataTypes.STRING(200)
    },
    cnpj: {
      type: DataTypes.STRING(14),
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefone: DataTypes.STRING(20),
    celular: DataTypes.STRING(20),
    cep: DataTypes.STRING(8),
    endereco: DataTypes.STRING(200),
    numero: DataTypes.STRING(10),
    complemento: DataTypes.STRING(100),
    bairro: DataTypes.STRING(100),
    cidade: DataTypes.STRING(100),
    estado: DataTypes.STRING(2),
    
    // Plano
    plano: {
      type: DataTypes.ENUM('BASICO', 'PROFISSIONAL', 'ENTERPRISE'),
      defaultValue: 'BASICO'
    },
    limiteFuncionarios: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    },
    valorMensal: {
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 97.00
    },
    diaVencimento: {
      type: DataTypes.INTEGER,
      defaultValue: 5
    },
    
    // Status
    status: {
      type: DataTypes.ENUM('ATIVA', 'TESTE', 'INADIMPLENTE', 'SUSPENSA', 'CANCELADA'),
      defaultValue: 'TESTE'
    },
    dataCadastro: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    dataExpiracaoTeste: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(+new Date() + 7*24*60*60*1000)
    },
    
    // Personalização
    logo: DataTypes.STRING,
    corPrimaria: {
      type: DataTypes.STRING(7),
      defaultValue: '#4361ee'
    },
    corSecundaria: {
      type: DataTypes.STRING(7),
      defaultValue: '#3f37c9'
    },
    dominioPersonalizado: DataTypes.STRING,
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  });

  return Empresa;
};`;

fs.writeFileSync(
  path.join(backendPath, 'src', 'models', 'Empresa.js'),
  empresaModel
);
console.log('✅ src/models/Empresa.js criado');

// ========================================
// 5. MODELO USUARIO
// ========================================
const usuarioModel = `// src/models/Usuario.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    empresaId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Empresas',
        key: 'id'
      }
    },
    funcionarioId: {
      type: DataTypes.UUID,
      references: {
        model: 'Funcionarios',
        key: 'id'
      }
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    senha: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefone: DataTypes.STRING(20),
    foto: DataTypes.STRING,
    
    tipo: {
      type: DataTypes.ENUM('MASTER', 'ADMIN_EMPRESA', 'GESTOR', 'FUNCIONARIO'),
      defaultValue: 'FUNCIONARIO'
    },
    
    permissoes: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    
    doisFatoresAtivo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    segredo2FA: DataTypes.STRING,
    
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ultimoAcesso: DataTypes.DATE,
    tentativasLogin: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bloqueadoAte: DataTypes.DATE,
    
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.senha) {
          user.senha = await bcrypt.hash(user.senha, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('senha')) {
          user.senha = await bcrypt.hash(user.senha, 10);
        }
      }
    }
  });

  Usuario.prototype.verificarSenha = function(senha) {
    return bcrypt.compareSync(senha, this.senha);
  };

  return Usuario;
};`;

fs.writeFileSync(
  path.join(backendPath, 'src', 'models', 'Usuario.js'),
  usuarioModel
);
console.log('✅ src/models/Usuario.js criado');

// ========================================
// 6. MODEL INDEX
// ========================================
const modelIndex = `// src/models/index.js
const { Sequelize } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(config);

// Importar modelos
const Empresa = require('./Empresa')(sequelize);
const Usuario = require('./Usuario')(sequelize);

// Relacionamentos
Empresa.hasMany(Usuario, { foreignKey: 'empresaId' });
Usuario.belongsTo(Empresa, { foreignKey: 'empresaId' });

module.exports = {
  sequelize,
  Empresa,
  Usuario
};`;

fs.writeFileSync(
  path.join(backendPath, 'src', 'models', 'index.js'),
  modelIndex
);
console.log('✅ src/models/index.js criado');

// ========================================
// 7. MIDDLEWARE AUTH
// ========================================
const authMiddleware = `// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ erro: 'Usuário não autorizado' });
    }

    req.usuario = usuario;
    next();
    
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};`;

fs.writeFileSync(
  path.join(backendPath, 'src', 'middleware', 'auth.js'),
  authMiddleware
);
console.log('✅ src/middleware/auth.js criado');

// ========================================
// 8. CONTROLLER AUTH
// ========================================
const authController = `// src/controllers/AuthController.js
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario || !usuario.verificarSenha(senha)) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const usuarioJSON = usuario.toJSON();
      delete usuarioJSON.senha;

      res.json({ token, usuario: usuarioJSON });

    } catch (error) {
      res.status(500).json({ erro: 'Erro no login' });
    }
  }
}

module.exports = new AuthController();`;

fs.writeFileSync(
  path.join(backendPath, 'src', 'controllers', 'AuthController.js'),
  authController
);
console.log('✅ src/controllers/AuthController.js criado');

// ========================================
// 9. ROTAS API
// ========================================
const apiRoutes = `// src/routes/api.js
const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

// Rotas públicas
router.post('/auth/login', AuthController.login);

// Rotas protegidas
router.get('/teste', auth, (req, res) => {
  res.json({ mensagem: 'Rota protegida funcionando!' });
});

module.exports = router;`;

fs.writeFileSync(
  path.join(backendPath, 'src', 'routes', 'api.js'),
  apiRoutes
);
console.log('✅ src/routes/api.js criado');

// ========================================
// 10. SERVER.JS
// ========================================
const serverFile = `// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { sequelize } = require('./models');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api', require('./routes/api'));

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado ao PostgreSQL');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados');
    }

    app.listen(PORT, () => {
      console.log(\`🚀 Servidor rodando na porta \${PORT}\`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

start();`;

fs.writeFileSync(
  path.join(backendPath, 'src', 'server.js'),
  serverFile
);
console.log('✅ src/server.js criado');

// ========================================
// 11. SCRIPT CRIAR ADMIN
// ========================================
const criarAdminScript = `// scripts/criar-admin.js
require('dotenv').config();
const { sequelize, Empresa, Usuario } = require('../src/models');

async function criarAdmin() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 PONTO-CERTO - Criando Administrador');
    console.log('='.repeat(50));

    await sequelize.authenticate();
    console.log('✅ Conectado ao banco');

    // Criar empresa Master
    const [empresa] = await Empresa.findOrCreate({
      where: { cnpj: '00000000000000' },
      defaults: {
        razaoSocial: 'Ponto-Certo Sistemas',
        nomeFantasia: 'Ponto-Certo',
        cnpj: '00000000000000',
        email: 'contato@ponto-certo.com',
        telefone: '11999999999',
        plano: 'ENTERPRISE',
        status: 'ATIVA'
      }
    });

    // Criar admin
    const [admin] = await Usuario.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL },
      defaults: {
        empresaId: empresa.id,
        nome: process.env.ADMIN_NOME,
        email: process.env.ADMIN_EMAIL,
        senha: process.env.ADMIN_SENHA,
        tipo: 'MASTER',
        ativo: true,
        permissoes: { todas: true }
      }
    });

    console.log('✅ Administrador criado:');
    console.log(\`   Email: \${process.env.ADMIN_EMAIL}\`);
    console.log(\`   Senha: \${process.env.ADMIN_SENHA}\`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

criarAdmin();`;

fs.writeFileSync(
  path.join(backendPath, 'scripts', 'criar-admin.js'),
  criarAdminScript
);
console.log('✅ scripts/criar-admin.js criado');

// ========================================
// 12. .GITIGNORE
// ========================================
const gitignore = `# Dependências
node_modules/
package-lock.json

# Ambiente
.env
.env.local

# Logs
logs/
*.log

# Uploads
uploads/
uploads/*

# IDE
.vscode/
.idea/

# Sistema
.DS_Store
Thumbs.db`;

fs.writeFileSync(path.join(backendPath, '.gitignore'), gitignore);
console.log('✅ .gitignore criado');

console.log('\n🎉 TODOS OS ARQUIVOS DO BACKEND FORAM CRIADOS!');
console.log('📁 Pasta: C:\\Projetos\\ponto-certo-backend');
