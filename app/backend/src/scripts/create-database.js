require('dotenv').config();
const { Client } = require('pg');

async function createDatabase() {
  // Conectar no PostgreSQL sem especificar um banco (conecta no postgres padrão)
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Conecta no banco padrão para criar o novo banco
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL');

    // Verificar se o banco já existe
    const checkResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME]
    );

    if (checkResult.rows.length > 0) {
      console.log(`✅ Banco de dados '${process.env.DB_NAME}' já existe`);
    } else {
      // Criar o banco de dados
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`🎉 Banco de dados '${process.env.DB_NAME}' criado com sucesso!`);
    }

  } catch (error) {
    console.error('❌ Erro ao criar banco de dados:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };