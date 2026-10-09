-- SQLite schema for a future persistent Briefly document library.
-- The current static browser app does not connect to this database.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT,
    size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
    word_count INTEGER NOT NULL DEFAULT 0 CHECK (word_count >= 0),
    status TEXT NOT NULL DEFAULT 'ready'
        CHECK (status IN ('processing', 'ready', 'error')),
    summary TEXT NOT NULL DEFAULT '',
    extracted_text TEXT NOT NULL DEFAULT '',
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_file_name
    ON documents (file_name COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS idx_documents_status
    ON documents (status);

CREATE TABLE IF NOT EXISTS document_keywords (
    document_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    rank INTEGER NOT NULL CHECK (rank > 0),
    PRIMARY KEY (document_id, keyword),
    UNIQUE (document_id, rank),
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS page_summaries (
    document_id TEXT NOT NULL,
    page_number INTEGER NOT NULL CHECK (page_number > 0),
    summary TEXT NOT NULL DEFAULT '',
    extracted_text TEXT NOT NULL DEFAULT '',
    PRIMARY KEY (document_id, page_number),
    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
