#!/usr/bin/env node

/**
 * Script para executar as migrations de modernização
 * Executa as migrations 004 e 005 que foram criadas para melhorar performance e integridade
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query } = require('./src/config/database');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function runMigration(filename) {
  try {
    console.log(`\n🔄 Executando migration: ${filename}`);
    
    const migrationPath = path.join(MIGRATIONS_DIR, filename);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Arquivo de migration não encontrado: ${migrationPath}`);
      return false;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar a migration
    await query(migrationSQL);
    
    console.log(`✅ Migration ${filename} executada com sucesso!`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro ao executar migration ${filename}:`, error.message);
    
    // Se for erro de constraint já existente, não é crítico
    if (error.message.includes('already exists') || 
        error.message.includes('já existe') ||
        error.message.includes('duplicate key')) {
      console.log(`⚠️  Migration ${filename} já foi aplicada anteriormente`);
      return true;
    }
    
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando execução das migrations de modernização...\n');
  
  try {
    // Verificar conexão com banco
    await query('SELECT NOW() as current_time');
    console.log('✅ Conexão com banco de dados estabelecida');
    
    // Lista das migrations de modernização
    const migrations = [
      '004_performance_indexes.sql',
      '005_integrity_constraints.sql'
    ];
    
    let successCount = 0;
    
    for (const migration of migrations) {
      const success = await runMigration(migration);
      if (success) {
        successCount++;
      }
    }
    
    console.log(`\n📊 Resumo da execução:`);
    console.log(`   Total de migrations: ${migrations.length}`);
    console.log(`   Executadas com sucesso: ${successCount}`);
    console.log(`   Falharam: ${migrations.length - successCount}`);
    
    if (successCount === migrations.length) {
      console.log('\n🎉 Todas as migrations de modernização foram executadas com sucesso!');
      console.log('\n📈 Melhorias aplicadas:');
      console.log('   • Índices de performance adicionados');
      console.log('   • Constraints de integridade criadas');
      console.log('   • Otimizações de query implementadas');
      console.log('   • Validações de dados reforçadas');
    } else {
      console.log('\n⚠️  Algumas migrations falharam. Verifique os logs acima.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Erro fatal durante execução das migrations:', error.message);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro não tratado:', error);
    process.exit(1);
  });
}

module.exports = { runMigration, main };