#!/usr/bin/env node

// Script para verificar se o ambiente está configurado corretamente
require('dotenv').config();

console.log('🔍 Verificando configuração do ambiente...\n');

// 1. Verificar Node.js version
const nodeVersion = process.version;
console.log(`📦 Node.js: ${nodeVersion}`);

if (parseInt(nodeVersion.slice(1)) < 18) {
  console.error('❌ Node.js 18+ é necessário');
  process.exit(1);
}

// 2. Verificar variáveis de ambiente
const requiredEnvVars = [
  'JWT_SECRET',
  'DB_HOST',
  'DB_NAME', 
  'DB_USER',
  'DB_PASSWORD'
];

console.log('\n🔧 Variáveis de ambiente:');
let missingVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: configurado`);
  } else {
    console.log(`❌ ${varName}: FALTANDO`);
    missingVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.error(`\n❌ Variáveis de ambiente faltando: ${missingVars.join(', ')}`);
  console.log('💡 Verifique o arquivo .env');
  process.exit(1);
}

// 3. Verificar dependências
console.log('\n📚 Verificando dependências...');

const dependencies = [
  'express',
  'pg', 
  'bcrypt',
  'jsonwebtoken',
  'express-validator',
  'cors',
  'helmet',
  'dotenv',
  'node-cron'
];

let missingDeps = [];

dependencies.forEach(dep => {
  try {
    require(dep);
    console.log(`✅ ${dep}: instalado`);
  } catch (error) {
    console.log(`❌ ${dep}: FALTANDO`);
    missingDeps.push(dep);
  }
});

if (missingDeps.length > 0) {
  console.error(`\n❌ Dependências faltando: ${missingDeps.join(', ')}`);
  console.log('💡 Execute: npm install');
  process.exit(1);
}

// 4. Testar conexão com banco (opcional)
console.log('\n🗄️  Testando conexão com banco de dados...');

async function testDatabase() {
  try {
    const { Pool } = require('pg');
    
    const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
      connectionTimeoutMillis: 5000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    await pool.end();
    
    console.log('✅ Conexão com banco de dados: OK');
    console.log(`📅 Timestamp do banco: ${result.rows[0].now}`);
    
  } catch (error) {
    console.log('❌ Conexão com banco de dados: FALHOU');
    console.log(`💡 Erro: ${error.message}`);
    console.log('\n🔧 Possíveis soluções:');
    console.log('   1. Verifique se o PostgreSQL está rodando');
    console.log('   2. Confirme as credenciais no arquivo .env');
    console.log('   3. Crie o banco de dados se não existir:');
    console.log(`      createdb ${process.env.DB_NAME}`);
    return false;
  }
  
  return true;
}

// 5. Executar verificação
testDatabase().then(dbOk => {
  console.log('\n📋 Resumo da verificação:');
  console.log('✅ Node.js: OK');
  console.log('✅ Variáveis de ambiente: OK');
  console.log('✅ Dependências: OK');
  console.log(`${dbOk ? '✅' : '❌'} Banco de dados: ${dbOk ? 'OK' : 'FALHOU'}`);
  
  if (dbOk) {
    console.log('\n🎉 Ambiente configurado corretamente!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. npm run migrate  # Criar tabelas');
    console.log('   2. npm run seed     # Popular dados');
    console.log('   3. npm run dev      # Iniciar servidor');
  } else {
    console.log('\n⚠️  Configure o banco de dados antes de continuar');
  }
}).catch(error => {
  console.error('❌ Erro na verificação:', error.message);
  process.exit(1);
});