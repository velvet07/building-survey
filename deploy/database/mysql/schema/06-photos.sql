-- =============================================================================
-- PHOTOS TABLE
-- =============================================================================
-- Photos module schema
-- =============================================================================

CREATE TABLE IF NOT EXISTS photos (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) DEFAULT '',
  local_file_path VARCHAR(500),
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INT,
  height INT,
  thumbnail_path VARCHAR(500),
  caption TEXT,
  description TEXT,
  uploaded_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_photos_project_id (project_id),
  INDEX idx_photos_uploaded_by (uploaded_by),
  INDEX idx_photos_created_at (created_at),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- PHOTOS TRIGGERS
-- =============================================================================
-- Note: These triggers will be created programmatically by the installer
-- to avoid DELIMITER issues with mysql2 library

