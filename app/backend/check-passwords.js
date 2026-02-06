require('dotenv').config();
const { query } = require('./src/config/database');
const bcrypt = require('bcrypt');

async function checkPasswords() {
  try {
    console.log('🔍 Verificando senhas dos usuários...');
    
    const users = await query('SELECT id, name, email, password_hash FROM users WHERE role = $1', ['leader']);
    
    for (const user of users.rows) {
      console.log(`\n👤 Usuário: ${user.name} (${user.email})`);
      console.log(`🔑 Hash: ${user.password_hash}`);
      
      // Testar senhas comuns
      const commonPasswords = ['123456', 'admin123', 'password', 'admin', user.name.toLowerCase()];
      
      for (const password of commonPasswords) {
        try {
          const isMatch = await bcrypt.compare(password, user.password_hash);
          if (isMatch) {
            console.log(`✅ Senha encontrada: "${password}"`);
            break;
          }
        } catch (error) {
          console.log(`❌ Erro ao testar senha "${password}":`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

checkPasswords();