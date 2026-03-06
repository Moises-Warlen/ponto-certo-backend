// C:\Projetos\ponto-certo-backend\src\middleware\upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração de armazenamento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    // Definir pasta baseada no tipo de arquivo
    if (file.fieldname === 'foto') {
      uploadPath += 'fotos/';
    } else if (file.fieldname === 'biometria') {
      uploadPath += 'biometria/';
    } else if (file.fieldname === 'comprovante') {
      uploadPath += 'comprovantes/';
    } else if (file.fieldname === 'documento') {
      uploadPath += 'documentos/';
    } else {
      uploadPath += 'outros/';
    }

    // Criar pasta se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas.'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware para upload único
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          sucesso: false,
          erro: `Erro no upload: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          sucesso: false,
          erro: err.message
        });
      }
      next();
    });
  };
};

// Middleware para upload múltiplo
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);

    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          sucesso: false,
          erro: `Erro no upload: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          sucesso: false,
          erro: err.message
        });
      }
      next();
    });
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple
};