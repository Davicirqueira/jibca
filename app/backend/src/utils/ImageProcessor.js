const sharp = require('sharp');

class ImageProcessor {
  /**
   * Redimensiona imagem para dimensões especificadas
   * @param {Buffer} imageBuffer - Buffer da imagem
   * @param {number} width - Largura desejada
   * @param {number} height - Altura desejada
   * @returns {Promise<Buffer>} Buffer da imagem redimensionada
   */
  static async resize(imageBuffer, width, height) {
    try {
      return await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center'
        })
        .toBuffer();
    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error);
      throw new Error('Falha ao processar imagem');
    }
  }

  /**
   * Otimiza qualidade da imagem
   * @param {Buffer} imageBuffer - Buffer da imagem
   * @param {string} format - Formato da imagem (jpeg, png, webp)
   * @returns {Promise<Buffer>} Buffer da imagem otimizada
   */
  static async optimize(imageBuffer, format = 'jpeg') {
    try {
      const sharpInstance = sharp(imageBuffer);

      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          return await sharpInstance
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
        
        case 'png':
          return await sharpInstance
            .png({ compressionLevel: 8 })
            .toBuffer();
        
        case 'webp':
          return await sharpInstance
            .webp({ quality: 85 })
            .toBuffer();
        
        default:
          return await sharpInstance
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
      }
    } catch (error) {
      console.error('Erro ao otimizar imagem:', error);
      throw new Error('Falha ao otimizar imagem');
    }
  }

  /**
   * Processa imagem completa: redimensiona e otimiza
   * @param {Buffer} imageBuffer - Buffer da imagem
   * @param {number} width - Largura desejada
   * @param {number} height - Altura desejada
   * @param {string} format - Formato da imagem
   * @returns {Promise<Buffer>} Buffer da imagem processada
   */
  static async process(imageBuffer, width, height, format = 'jpeg') {
    try {
      const resized = await this.resize(imageBuffer, width, height);
      const optimized = await this.optimize(resized, format);
      return optimized;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      throw new Error('Falha ao processar imagem');
    }
  }

  /**
   * Obtém metadados da imagem
   * @param {Buffer} imageBuffer - Buffer da imagem
   * @returns {Promise<Object>} Metadados da imagem
   */
  static async getMetadata(imageBuffer) {
    try {
      return await sharp(imageBuffer).metadata();
    } catch (error) {
      console.error('Erro ao obter metadados da imagem:', error);
      throw new Error('Falha ao ler metadados da imagem');
    }
  }
}

module.exports = ImageProcessor;
