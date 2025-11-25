-- =============================================================================
-- PROJECTS TABLE
-- =============================================================================
-- Projects management
-- =============================================================================

CREATE TABLE IF NOT EXISTS projects (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  auto_identifier VARCHAR(50) UNIQUE NOT NULL,
  owner_id CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_projects_owner_id (owner_id),
  INDEX idx_projects_deleted_at (deleted_at),
  INDEX idx_projects_auto_identifier (auto_identifier),
  INDEX idx_projects_created_at (created_at),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (CHAR_LENGTH(name) >= 3 AND CHAR_LENGTH(name) <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

