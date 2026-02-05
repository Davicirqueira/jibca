const fs = require('fs');
const path = require('path');
const { query } = require('./src/config/database');

async function runMigration() {
  try {
    console.log('🔄 Executando migration: Adicionar tipo de evento "Passeio"...\n');

    // Ler o arquivo de migration
    const migrationPath = path.join(__dirname, 'migrations', '002_add_passeio_event_type.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Conteúdo da migration:');
    console.log(migrationSQL);
    console.log('\n' + '='.repeat(50) + '\n');

    // Executar a migration
    console.log('⚡ Executando migration...');
    await query(migrationSQL);

    // Verificar se o tipo foi adicionado
    console.log('🔍 Verificando tipos de evento após migration...');
    const result = await query('SELECT id, name, color, icon FROM event_types ORDER BY id');
    
    console.log('📊 Tipos de evento disponíveis:');
    result.rows.forEach(row => {
      console.log(`   - ID: ${row.id}, Nome: ${row.name}, Cor: ${row.color}, Ícone: ${row.icon}`);
    });

    // Verificar especificamente o tipo "Passeio"
    const passeioResult = await query('SELECT * FROM event_types WHERE name = $1', ['Passeio']);
    
    if (passeioResult.rows.length > 0) {
      const passeio = passeioResult.rows[0];
      console.log('\n✅ Tipo "Passeio" adicionado com sucesso!');
      console.log(`   - ID: ${passeio.id}`);
      console.log(`   - Nome: ${passeio.name}`);
      console.log(`   - Cor: ${passeio.color}`);
      console.log(`   - Ícone: ${passeio.icon}`);
      console.log(`   - Criado em: ${passeio.created_at}`);
    } else {
      console.log('❌ Tipo "Passeio" não foi encontrado após migration');
    }

    console.log('\n🎉 Migration executada com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao executar migration:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Executar a migration
runMigration().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});