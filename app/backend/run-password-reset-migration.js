const fs = require('fs');
const path = require('path');
const { query } = require('./src/config/database');

async function runMigration() {
  try {
    console.log('🔄 Executando migration: Criar tabela password_reset_tokens...\n');

    // Ler o arquivo de migration
    const migrationPath = path.join(__dirname, 'migrations', '003_password_reset_tokens.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Conteúdo da migration:');
    console.log(migrationSQL);
    console.log('\n' + '='.repeat(50) + '\n');

    // Executar a migration
    console.log('⚡ Executando migration...');
    await query(migrationSQL);

    // Verificar se a tabela foi criada
    console.log('🔍 Verificando tabela password_reset_tokens...');
    const tableCheck = await query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'password_reset_tokens'
      ORDER BY ordinal_position
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ Tabela password_reset_tokens criada com sucesso!');
      console.log('\n📊 Estrutura da tabela:');
      tableCheck.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });

      // Verificar índices
      const indexCheck = await query(`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'password_reset_tokens'
      `);

      if (indexCheck.rows.length > 0) {
        console.log('\n📑 Índices criados:');
        indexCheck.rows.forEach(row => {
          console.log(`   - ${row.indexname}`);
        });
      }
    } else {
      console.log('❌ Tabela password_reset_tokens não foi encontrada após migration');
    }

    console.log('\n🎉 Migration executada com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('   1. Testar endpoints de recuperação de senha');
    console.log('   2. Implementar frontend para fluxo de recuperação');
    console.log('   3. Configurar envio de emails (opcional)');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tabela password_reset_tokens já existe. Migration já foi executada anteriormente.');
      console.log('✅ Nenhuma ação necessária.');
    } else {
      console.error('❌ Erro ao executar migration:', error.message);
      console.error('Stack trace:', error.stack);
      process.exit(1);
    }
  }
}

// Executar a migration
runMigration().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
