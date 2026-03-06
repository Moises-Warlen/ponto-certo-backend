// C:\Projetos\ponto-certo-backend\src\services\BiometriaService.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');

// Simulação de biometria facial (em produção usar face-api.js ou serviço externo)
class BiometriaService {
  constructor() {
    this.confidenceThreshold = 0.7;
  }

  // Verificar identidade
  async verificarIdentidade(funcionarioId, fotoPath, fotosCadastradas = []) {
    try {
      // Simular processamento de imagem
      const imageBuffer = await sharp(fotoPath)
        .resize(640, 480)
        .normalize()
        .toBuffer();

      // Simular detecção facial
      const faceDetected = await this.detectFace(imageBuffer);

      if (!faceDetected) {
        return {
          verificado: false,
          pontuacao: 0,
          livenessScore: 0,
          mensagem: 'Nenhum rosto detectado na imagem'
        };
      }

      // Simular liveness (anti-spoofing)
      const livenessScore = await this.checkLiveness(imageBuffer);

      // Se não tem fotos cadastradas, retorna apenas liveness
      if (!fotosCadastradas || fotosCadastradas.length === 0) {
        return {
          verificado: livenessScore > 0.6,
          pontuacao: livenessScore,
          livenessScore,
          mensagem: livenessScore > 0.6 ? 'Rosto detectado' : 'Possível fraude detectada'
        };
      }

      // Simular comparação com fotos cadastradas
      const matchScore = await this.compareWithStored(imageBuffer, fotosCadastradas);

      // Pontuação final (média entre match e liveness)
      const finalScore = (matchScore + livenessScore) / 2;
      const verificado = finalScore >= this.confidenceThreshold && livenessScore > 0.5;

      return {
        verificado,
        pontuacao: finalScore,
        matchScore,
        livenessScore,
        mensagem: verificado ? 'Identidade verificada' : 'Verificação falhou'
      };

    } catch (error) {
      console.error('Erro na verificação biométrica:', error);
      return {
        verificado: false,
        pontuacao: 0,
        livenessScore: 0,
        mensagem: 'Erro no processamento da imagem',
        erro: error.message
      };
    }
  }

  // Detectar rosto na imagem
  async detectFace(imageBuffer) {
    // Simular detecção (em produção usar face-api.js)
    return Math.random() > 0.1; // 90% de chance de detectar
  }

  // Verificar se é uma pessoa real (anti-spoofing)
  async checkLiveness(imageBuffer) {
    // Simular análise de liveness
    // Em produção: verificar textura, movimento, profundidade, etc
    return 0.7 + (Math.random() * 0.3);
  }

  // Comparar com fotos cadastradas
  async compareWithStored(imageBuffer, fotosCadastradas) {
    // Simular comparação facial
    // Em produção: extrair descritores e calcular distância euclidiana
    return 0.6 + (Math.random() * 0.4);
  }

  // Extrair características faciais
  async extractFeatures(imageBuffer) {
    // Simular extração de features
    const hash = crypto.createHash('sha256');
    hash.update(imageBuffer);
    return hash.digest('hex');
  }

  // Cadastrar nova face
  async registerFace(funcionarioId, fotos) {
    try {
      const features = [];

      for (const foto of fotos) {
        const imageBuffer = await sharp(foto)
          .resize(640, 480)
          .normalize()
          .toBuffer();

        const faceDetected = await this.detectFace(imageBuffer);

        if (!faceDetected) {
          continue;
        }

        const faceFeatures = await this.extractFeatures(imageBuffer);
        features.push(faceFeatures);
      }

      if (features.length < 3) {
        throw new Error('Forneça pelo menos 3 fotos válidas do rosto');
      }

      return {
        funcionarioId,
        features,
        dataCadastro: new Date(),
        versao: 1
      };

    } catch (error) {
      console.error('Erro ao cadastrar face:', error);
      throw error;
    }
  }
}

module.exports = new BiometriaService();