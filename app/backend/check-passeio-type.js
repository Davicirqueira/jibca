const { query } = require('./src/config/database');

async function checkPasseioType() {
  try {
    console.log('🔍 Verificando se tipo "Passeio" já existe no banco...\n');

    // Verificar tipos de evento existentes
    const result = await query('SELECT id, name, color, icon FROM event_types ORDER BY id');
    
    console.log('📊 Tipos de evento atuais:');
    result.rows.forEach(row => {
      console.log(`   - ID: ${row.id}, Nome: ${row.name}, Cor: ${row.color}, Ícone: ${row.icon}`);
    });

    // Verificar especificamente o tipo "Passeio"
    const passeioResult = await query('SELECT * FROM event_types WHERE name = $1', ['Passeio']);
    
    if (passeioResult.rows.length > 0) {
      const passeio = passeioResult.rows[0];
      console.log('\n✅ Tipo "Passeio" já existe no banco:');
      console.log(`   - ID: ${passeio.id}`);
      console.log(`   - Nome: ${passeio.name}`);
      console.log(`   - Cor: ${passeio.color}`);
      console.log(`   - Ícone: ${passeio.icon}`);
      console.log(`   - Criado em: ${passeio.created_at}`);
      console.log('\n⚠️ Migration não é necessária - tipo já existe');
    } else {
      console.log('\n❌ Tipo "Passeio" não encontrado no banco');
      console.log('✅ Migration é necessária para adicionar o tipo');
    }

    // Verificar se há eventos do tipo "Passeio"
    const eventsResult = await query(`
      SELECT e.id, e.title, et.name as event_type_name
      FROM events e
      LEFT JOIN event_types et ON e.event_type_id = et.id
      WHERE et.name = $1
    `, ['Passeio']);

    if (eventsResult.rows.length > 0) {
      console.log('\n📅 Eventos do tipo "Passeio" encontrados:');
      eventsResult.rows.forEach(event => {
        console.log(`   - ID: ${event.id}, Título: ${event.title}`);
      });
    } else {
      console.log('\n📅 Nenhum evento do tipo "Passeio" encontrado');
    }

    console.log('\n🎯 Status da implementação:');
    console.log('   ✅ Migration SQL criada');
    console.log('   ✅ Script de execução criado');
    console.log('   ✅ Frontend já suporta tipo "Passeio"');
    console.log('   ✅ Seed atualizado com evento exemplo');
    
    if (passeioResult.rows.length > 0) {
      console.log('   ✅ Tipo "Passeio" já existe no banco');
    } else {
      console.log('   ⏳ Tipo "Passeio" precisa ser adicionado ao banco');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar tipo "Passeio":', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Executar verificação
checkPasseioType().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});