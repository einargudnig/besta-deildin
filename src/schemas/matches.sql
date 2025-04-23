CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    api_id INTEGER UNIQUE NOT NULL,
    home_team_id INTEGER NOT NULL REFERENCES teams(api_id),
    away_team_id INTEGER NOT NULL REFERENCES teams(api_id),
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    round VARCHAR(50) NOT NULL,
    season INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on api_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_matches_api_id ON matches(api_id);

-- Create an index on team IDs for faster queries by team
CREATE INDEX IF NOT EXISTS idx_matches_team_ids ON matches(home_team_id, away_team_id);

-- Create an index on date for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 