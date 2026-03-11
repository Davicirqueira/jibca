const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'fazer2011ybr';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('\n=== HASH GERADO ===');
  console.log(`Senha: ${password}`);
  console.log(`Hash:  ${hash}`);
  console.log('\n');
}

generateHash();
