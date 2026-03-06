// scripts/migrate.js
const { execSync } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

console.log('='.repeat(50));
console.log('🚀 PONTO-CERTO - Migrações');
console.log('='.repeat(50));
console.log('');

try {
  console.log('📡 Gerando cliente Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente Prisma gerado!\n');

  console.log('🔄 Executando migrações...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('✅ Migrações executadas!\n');

  console.log('🌱 Criando seed inicial...');
  execSync('node scripts/criar-admin.js', { stdio: 'inherit' });
  console.log('✅ Seed executada!\n');

  console.log('='.repeat(50));
  console.log('🎉 MIGRAÇÕES CONCLUÍDAS COM SUCESSO!');
  console.log('='.repeat(50));

} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}