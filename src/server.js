// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware para injetar Prisma no req
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Rotas (você pode ir adicionando aos poucos)
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      sucesso: true,
      status: 'OK',
      database: 'connected',
      timestamp: new Date(),
      ambiente: process.env.NODE_ENV,
      versao: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      sucesso: false,
      status: 'ERROR',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Rota de teste da API
app.get('/api/teste', (req, res) => {
  res.json({ mensagem: 'API funcionando!' });
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    console.log('✅ Conectado ao PostgreSQL via Prisma');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});