require('dotenv').config();
const { query } = require('./src/config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testando conexão com o banco...');
    
    // Teste 1: Conexão básica
    const timeResult = await query('SELECT NOW() as current_time');
    console.log('✅ Conexão OK:', timeResult.rows[0].current_time);
    
    // Teste 2: Verificar se tabela users existe
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log('📋 Tabela users existe:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Teste 3: Contar usuários
      const userCount = await query('SELECT COUNT(*) as count FROM users');
      console.log('👥 Total de usuários:', userCount.rows[0].count);
      
      // Teste 4: Listar usuários
      const users = await query('SELECT id, name, email, role, phone, is_active FROM users LIMIT 5');
      console.log('📝 Usuários cadastrados:');
      users.rows.forEach(user => {
        console.log(`  - ID: ${user.id}, Nome: ${user.name}, Email: ${user.email}, Role: ${user.role}, Phone: ${user.phone}, Ativo: ${user.is_active}`);
      });
      
      // Teste 5: Testar update de um usuário específico
      if (users.rows.length > 0) {
        const testUser = users.rows[0];
        console.log(`\n🧪 Testando UPDATE no usuário ID ${testUser.id}...`);
        
        const updateResult = await query(`
          UPDATE users 
          SET phone = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING id, name, phone, updated_at
        `, ['(11) 99999-9999', testUser.id]);
        
        if (updateResult.rows.length > 0) {
          console.log('✅ UPDATE funcionou:', updateResult.rows[0]);
        } else {
          console.log('❌ UPDATE falhou - nenhuma linha retornada');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();