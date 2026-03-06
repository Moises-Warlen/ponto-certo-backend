// C:\Projetos\ponto-certo-backend\scripts\backup.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

async function backup() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 PONTO-CERTO - Backup do Banco de Dados');
    console.log('='.repeat(50));
    console.log('');

    // Criar pasta de backup se não existir
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Nome do arquivo
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);

    // Comando pg_dump
    const command = `pg_dump "${process.env.DATABASE_URL}" > "${filepath}"`;

    console.log('📡 Executando backup...');
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
      }

      console.log(`✅ Backup salvo em: ${filepath}`);

      // Comprimir arquivo
      const gzipCommand = `gzip "${filepath}"`;
      exec(gzipCommand, (gzipError) => {
        if (gzipError) {
          console.error('❌ Erro ao comprimir:', gzipError);
        } else {
          console.log(`✅ Arquivo comprimido: ${filepath}.gz`);
        }
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

backup();