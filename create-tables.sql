
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      short_name VARCHAR(3) NOT NULL,
      logo_url TEXT
    );

    CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      team_id INTEGER REFERENCES teams(id),
      position VARCHAR(20) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      total_points INTEGER DEFAULT 0,
      UNIQUE(first_name, last_name, team_id)
    );

    CREATE TABLE IF NOT EXISTS gameweeks (
      id SERIAL PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
      is_current BOOLEAN DEFAULT FALSE,
      is_finished BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      gameweek_id INTEGER REFERENCES gameweeks(id),
      home_team_id INTEGER REFERENCES teams(id),
      away_team_id INTEGER REFERENCES teams(id),
      kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      is_finished BOOLEAN DEFAULT FALSE,
      UNIQUE(gameweek_id, home_team_id, away_team_id)
    );

    CREATE TABLE IF NOT EXISTS player_performances (
      id SERIAL PRIMARY KEY,
      player_id INTEGER REFERENCES players(id),
      match_id INTEGER REFERENCES matches(id),
      gameweek_id INTEGER REFERENCES gameweeks(id),
      minutes_played INTEGER DEFAULT 0,
      goals INTEGER DEFAULT 0,
      assists INTEGER DEFAULT 0,
      clean_sheet BOOLEAN DEFAULT FALSE,
      yellow_cards INTEGER DEFAULT 0,
      red_cards INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      bonus_points INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      UNIQUE(player_id, match_id)
    );

    CREATE TABLE IF NOT EXISTS fantasy_teams (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      name VARCHAR(100) NOT NULL,
      budget DECIMAL(10,2) DEFAULT 100.0,
      total_points INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS team_selections (
      id SERIAL PRIMARY KEY,
      fantasy_team_id INTEGER REFERENCES fantasy_teams(id),
      gameweek_id INTEGER REFERENCES gameweeks(id),
      player_id INTEGER REFERENCES players(id),
      is_captain BOOLEAN DEFAULT FALSE,
      is_vice_captain BOOLEAN DEFAULT FALSE,
      is_on_bench BOOLEAN DEFAULT FALSE,
      UNIQUE(fantasy_team_id, gameweek_id, player_id)
    );

    CREATE TABLE IF NOT EXISTS leagues (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      created_by INTEGER REFERENCES users(id),
      join_code VARCHAR(10) UNIQUE,
      is_public BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS league_memberships (
      id SERIAL PRIMARY KEY,
      league_id INTEGER REFERENCES leagues(id),
      fantasy_team_id INTEGER REFERENCES fantasy_teams(id),
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(league_id, fantasy_team_id)
    );
    