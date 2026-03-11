const fs = require('fs').promises;
const path = require('path');
const ImageProcessor = require('../utils/ImageProcessor');

class UploadService {
  // Tipos de arquivo permitidos
  static ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ];

  // Tamanho máximo: 5MB
  static MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Dimensões padrão para avatares
  static AVATAR_WIDTH = 400;
  static AVATAR_HEIGHT = 400;

  /**
   * Valida arquivo de imagem
   * @param {Object} file - Arquivo enviado via multer
   * @returns {Object} Resultado da validação { valid: boolean, error?: string }
   */
  static validateImageFile(file) {
    if (!file) {
      return {
        valid: false,
        error: 'Nenhum arquivo foi enviado'
      };
    }

    // Validar tipo MIME
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        valid: false,
        error: 'Tipo de arquivo inválido. Apenas JPG, PNG e GIF são permitidos'
      };
    }

    // Validar tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB'
      };
    }

    return { valid: true };
  }

  /**
   * Processa upload de avatar
   * @param {Object} file - Arquivo enviado via multer
   * @param {number} userId - ID do usuário
   * @returns {Promise<string>} URL do avatar salvo
   */
  static async uploadAvatar(file, userId) {
    try {
      // Validar arquivo
      const validation = this.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Processar imagem (redimensionar e otimizar)
      const processedImage = await ImageProcessor.process(
        file.buffer,
        this.AVATAR_WIDTH,
        this.AVATAR_HEIGHT,
        this.getFormatFromMimetype(file.mimetype)
      );

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const extension = this.getExtensionFromMimetype(file.mimetype);
      const filename = `user-${userId}-${timestamp}.${extension}`;
      const filepath = path.join('uploads', 'avatars', filename);

      // Salvar arquivo
      await fs.writeFile(filepath, processedImage);

      // Retornar URL relativa
      return `/uploads/avatars/${filename}`;

    } catch (error) {
      console.error('Erro ao fazer upload de avatar:', error);
      throw error;
    }
  }

  /**
   * Remove avatar antigo do usuário
   * @param {string} avatarUrl - URL do avatar a ser removido
   * @returns {Promise<boolean>} True se removido com sucesso
   */
  static async deleteAvatar(avatarUrl) {
    try {
      if (!avatarUrl) {
        return true; // Nada para deletar
      }

      // Extrair caminho do arquivo da URL
      // avatarUrl formato: /uploads/avatars/user-123-1234567890.jpg
      const filename = path.basename(avatarUrl);
      const filepath = path.join('uploads', 'avatars', filename);

      // Verificar se arquivo existe
      try {
        await fs.access(filepath);
        // Deletar arquivo
        await fs.unlink(filepath);
        console.log(`✅ Avatar deletado: ${filepath}`);
        return true;
      } catch (error) {
        if (error.code === 'ENOENT') {
          // Arquivo não existe, não é erro crítico
          console.log(`⚠️  Arquivo de avatar não encontrado: ${filepath}`);
          return true;
        }
        throw error;
      }

    } catch (error) {
      console.error('Erro ao deletar avatar:', error);
      throw new Error('Falha ao deletar avatar');
    }
  }

  /**
   * Obtém extensão do arquivo a partir do MIME type
   * @param {string} mimetype - MIME type do arquivo
   * @returns {string} Extensão do arquivo
   */
  static getExtensionFromMimetype(mimetype) {
    const mimeMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif'
    };
    return mimeMap[mimetype] || 'jpg';
  }

  /**
   * Obtém formato para sharp a partir do MIME type
   * @param {string} mimetype - MIME type do arquivo
   * @returns {string} Formato para sharp
   */
  static getFormatFromMimetype(mimetype) {
    const formatMap = {
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpeg',
      'image/png': 'png',
      'image/gif': 'gif'
    };
    return formatMap[mimetype] || 'jpeg';
  }
}

module.exports = UploadService;
