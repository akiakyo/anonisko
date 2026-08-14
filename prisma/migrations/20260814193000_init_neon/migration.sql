DO $$ BEGIN
  CREATE TYPE "Gender" AS ENUM ('male', 'female');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MatchPreference" AS ENUM ('anyone', 'male', 'female');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ReportReason" AS ENUM ('harassment', 'sexual_content', 'spam', 'hate', 'personal_info', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_uuid UUID NOT NULL UNIQUE,
  nickname VARCHAR(24) NOT NULL,
  gender "Gender" NOT NULL,
  campus VARCHAR(100) NOT NULL,
  preference "MatchPreference" NOT NULL DEFAULT 'anyone',
  about_me VARCHAR(120),
  interests TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  vibe VARCHAR(30),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_anonymous_sessions_last_seen ON anonymous_sessions(last_seen_at);

CREATE TABLE IF NOT EXISTS matches (
  id BIGSERIAL PRIMARY KEY,
  match_uuid UUID NOT NULL UNIQUE,
  session_a UUID NOT NULL,
  session_b UUID NOT NULL,
  ended_by UUID,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_matches_session_a ON matches(session_a);
CREATE INDEX IF NOT EXISTS idx_matches_session_b ON matches(session_b);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  match_uuid UUID NOT NULL,
  sender_session_uuid UUID NOT NULL,
  message_text VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_messages_match_created ON messages(match_uuid, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_session_uuid);

CREATE TABLE IF NOT EXISTS reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_session_uuid UUID NOT NULL,
  reported_session_uuid UUID NOT NULL,
  match_uuid UUID,
  reason "ReportReason" NOT NULL,
  details VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_session_uuid);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

CREATE TABLE IF NOT EXISTS blocks (
  id BIGSERIAL PRIMARY KEY,
  blocker_session_uuid UUID NOT NULL,
  blocked_session_uuid UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_blocks_pair UNIQUE (blocker_session_uuid, blocked_session_uuid)
);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_session_uuid);
