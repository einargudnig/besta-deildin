import db from '../src/config/database';

async function seedMockData() {
  try {
    // Insert teams
    const teams = [
      { name: 'Valur Reykjavík', short_name: 'VAL', logo_url: 'https://example.com/valur.png' },
      { name: 'KR Reykjavík', short_name: 'KR', logo_url: 'https://example.com/kr.png' },
      {
        name: 'Víkingur Reykjavík',
        short_name: 'VIK',
        logo_url: 'https://example.com/vikingur.png',
      },
      { name: 'Breiðablik', short_name: 'BRE', logo_url: 'https://example.com/breidablik.png' },
      { name: 'FH Hafnarfjörður', short_name: 'FH', logo_url: 'https://example.com/fh.png' },
      { name: 'Stjarnan', short_name: 'STJ', logo_url: 'https://example.com/stjarnan.png' },
      { name: 'ÍA Akranes', short_name: 'IA', logo_url: 'https://example.com/ia.png' },
      { name: 'Keflavík', short_name: 'KEF', logo_url: 'https://example.com/keflavik.png' },
      { name: 'Fram Reykjavík', short_name: 'FRA', logo_url: 'https://example.com/fram.png' },
      { name: 'Fylkir', short_name: 'FYL', logo_url: 'https://example.com/fylkir.png' },
      { name: 'HK Kópavogur', short_name: 'HK', logo_url: 'https://example.com/hk.png' },
      { name: 'Leiknir Reykjavík', short_name: 'LEI', logo_url: 'https://example.com/leiknir.png' },
    ];

    for (const team of teams) {
      await db.query(
        'INSERT INTO teams (name, short_name, logo_url) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [team.name, team.short_name, team.logo_url]
      );
    }
    console.log(`Inserted ${teams.length} teams`);

    // Get team IDs
    const teamResult = await db.query('SELECT id, name FROM teams');
    const teamMap = teamResult.rows.reduce((acc, team) => {
      acc[team.name] = team.id;
      return acc;
    }, {});

    // Insert players (5 per team for now)
    const positions = ['GK', 'DEF', 'MID', 'FWD'];
    let playerCount = 0;

    for (const [teamName, teamId] of Object.entries(teamMap)) {
      for (let i = 0; i < 5; i++) {
        const position = positions[Math.min(i, positions.length - 1)];
        const price = 4.0 + Math.random() * 6.0; // Random price between 4.0 and 10.0

        await db.query(
          'INSERT INTO players (first_name, last_name, team_id, position, price, total_points) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (first_name, last_name, team_id) DO NOTHING',
          [
            `Player${i + 1}`,
            teamName.split(' ')[0],
            teamId,
            position,
            Number.parseFloat(price.toFixed(1)),
            Math.floor(Math.random() * 50), // Random points between 0 and 49
          ]
        );
        playerCount++;
      }
    }
    console.log(`Inserted ${playerCount} players`);

    // Insert gameweeks
    const currentDate = new Date();
    for (let i = 1; i <= 22; i++) {
      const startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() + (i - 1) * 7);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 2);

      const deadlineDate = new Date(startDate);
      deadlineDate.setHours(deadlineDate.getHours() - 1);

      const isCurrent = i === 1; // First gameweek is current

      await db.query(
        'INSERT INTO gameweeks (name, start_date, end_date, deadline_date, is_current, is_finished) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (name) DO NOTHING',
        [`Gameweek ${i}`, startDate, endDate, deadlineDate, isCurrent, false]
      );
    }
    console.log('Inserted 22 gameweeks');

    // Insert some matches for the first gameweek
    const gameweekResult = await db.query('SELECT id FROM gameweeks WHERE is_current = true');
    if (gameweekResult.rows.length > 0) {
      const currentGameweekId = gameweekResult.rows[0].id;
      const teamIds = Object.values(teamMap);

      // Create 6 matches (12 teams = 6 matches)
      for (let i = 0; i < teamIds.length; i += 2) {
        if (i + 1 < teamIds.length) {
          const homeTeamId = teamIds[i];
          const awayTeamId = teamIds[i + 1];
          const kickoffTime = new Date(currentDate);
          kickoffTime.setDate(kickoffTime.getDate() + 1);
          kickoffTime.setHours(19, 15, 0, 0); // 19:15 kickoff

          await db.query(
            'INSERT INTO matches (gameweek_id, home_team_id, away_team_id, kickoff_time, is_finished) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (gameweek_id, home_team_id, away_team_id) DO NOTHING',
            [currentGameweekId, homeTeamId, awayTeamId, kickoffTime, false]
          );
        }
      }
      console.log('Inserted matches for current gameweek');
    }

    console.log('Mock data seeded successfully');
  } catch (error) {
    console.error('Error seeding mock data:', error);
  } finally {
    process.exit(0);
  }
}

seedMockData();
