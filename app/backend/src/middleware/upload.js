const multer = require('multer');

// Configurar multer para usar memória (buffer)
// Isso permite processar a imagem antes de salvar
const storage = multer.memoryStorage();

// Filtro de tipos de arquivo
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Apenas 1 arquivo por vez
  },
  fileFilter: fileFilter
});

// Middleware para upload de avatar (campo 'avatar')
const uploadAvatar = upload.single('avatar');

// Wrapper para tratar erros do multer
const uploadAvatarWithErrorHandling = (req, res, next) => {
  uploadAvatar(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: 'Arquivo muito grande. Tamanho máximo: 5MB'
          }
        });
      }

      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FILE_TYPE',
            message: 'Tipo de arquivo inválido. Apenas JPG, PNG e GIF são permitidos'
          }
        });
      }

      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'UNEXPECTED_FILE',
            message: 'Campo de arquivo inesperado. Use o campo "avatar"'
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: 'Erro ao processar upload'
        }
      });
    }

    next();
  });
};

module.exports = {
  upload,
  uploadAvatar: uploadAvatarWithErrorHandling
};
