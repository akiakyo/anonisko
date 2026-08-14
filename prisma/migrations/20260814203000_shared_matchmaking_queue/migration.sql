CREATE TABLE IF NOT EXISTS match_queue (
  session_uuid UUID PRIMARY KEY,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_match_queue_last_seen ON match_queue(last_seen_at);
CREATE INDEX IF NOT EXISTS idx_match_queue_joined ON match_queue(joined_at);
