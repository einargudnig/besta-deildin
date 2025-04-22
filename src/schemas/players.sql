CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    api_id INTEGER UNIQUE NOT NULL,
    team_id INTEGER REFERENCES teams(api_id),
    name VARCHAR(255) NOT NULL,
    age INTEGER,
    number INTEGER,
    position VARCHAR(50),
    photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on team_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id); 