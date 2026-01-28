require('dotenv').config();
const bcrypt = require('bcrypt');
const { query } = require('../config/database');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Verificar se já existem dados
    const userCount = await query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 1) {
      console.log('📊 Banco já possui dados, pulando seed...');
      return;
    }

    // Hash da senha padrão
    const defaultPassword = await bcrypt.hash('jibca2024', 10);

    // Inserir usuário líder se não existir
    const leaderExists = await query(
      'SELECT id FROM users WHERE email = $1',
      ['chris@jibca.org']
    );

    if (leaderExists.rows.length === 0) {
      await query(`
        INSERT INTO users (name, email, password_hash, role, phone) VALUES
        ($1, $2, $3, $4, $5)
      `, ['Tio Chris', 'chris@jibca.org', defaultPassword, 'leader', '(19) 99999-9999']);
      
      console.log('👤 Usuário líder criado: chris@jibca.org / jibca2024');
    }

    // Inserir alguns membros de exemplo
    const members = [
      { name: 'João Silva', email: 'joao@exemplo.com', phone: '(19) 98888-8888' },
      { name: 'Maria Santos', email: 'maria@exemplo.com', phone: '(19) 97777-7777' },
      { name: 'Pedro Oliveira', email: 'pedro@exemplo.com', phone: '(19) 96666-6666' },
      { name: 'Ana Costa', email: 'ana@exemplo.com', phone: '(19) 95555-5555' }
    ];

    for (const member of members) {
      const memberExists = await query(
        'SELECT id FROM users WHERE email = $1',
        [member.email]
      );

      if (memberExists.rows.length === 0) {
        await query(`
          INSERT INTO users (name, email, password_hash, role, phone) VALUES
          ($1, $2, $3, $4, $5)
        `, [member.name, member.email, defaultPassword, 'member', member.phone]);
        
        console.log(`👥 Membro criado: ${member.email} / jibca2024`);
      }
    }

    // Inserir alguns eventos de exemplo
    const leaderResult = await query(
      'SELECT id FROM users WHERE role = $1 LIMIT 1',
      ['leader']
    );
    const leaderId = leaderResult.rows[0].id;

    // Buscar tipos de evento
    const eventTypesResult = await query('SELECT id, name FROM event_types');
    const eventTypes = eventTypesResult.rows;

    const events = [
      {
        title: 'Culto da Juventude',
        description: 'Culto especial da juventude com louvor e palavra',
        type: 'Culto',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // próxima semana
        time: '19:00',
        location: 'Templo Principal',
        duration: 120
      },
      {
        title: 'Retiro de Carnaval',
        description: 'Retiro espiritual durante o feriado de carnaval',
        type: 'Retiro',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // próximo mês
        time: '08:00',
        location: 'Sítio Bethel',
        duration: 1440 // 24 horas
      },
      {
        title: 'Estudo Bíblico - Jovens',
        description: 'Estudo sobre o livro de Provérbios',
        type: 'Estudo Bíblico',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // em 2 semanas
        time: '20:00',
        location: 'Sala da Juventude',
        duration: 90
      }
    ];

    for (const event of events) {
      const eventType = eventTypes.find(type => type.name === event.type);
      if (eventType) {
        const eventExists = await query(
          'SELECT id FROM events WHERE title = $1 AND date = $2',
          [event.title, event.date.toISOString().split('T')[0]]
        );

        if (eventExists.rows.length === 0) {
          await query(`
            INSERT INTO events (title, description, event_type_id, date, time, location, duration_minutes, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            event.title,
            event.description,
            eventType.id,
            event.date.toISOString().split('T')[0],
            event.time,
            event.location,
            event.duration,
            leaderId
          ]);
          
          console.log(`📅 Evento criado: ${event.title}`);
        }
      }
    }

    console.log('🎉 Seed do banco de dados concluído com sucesso!');
    console.log('');
    console.log('📋 Credenciais de acesso:');
    console.log('   Líder: chris@jibca.org / jibca2024');
    console.log('   Membros: joao@exemplo.com, maria@exemplo.com, etc. / jibca2024');
    console.log('');

  } catch (error) {
    console.error('❌ Erro no seed do banco:', error);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };