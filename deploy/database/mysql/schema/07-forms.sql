-- =============================================================================
-- FORMS TABLE
-- =============================================================================
-- Forms module schema
-- =============================================================================

CREATE TABLE IF NOT EXISTS project_form_responses (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  form_slug VARCHAR(100) NOT NULL,
  data JSON NOT NULL DEFAULT (JSON_OBJECT()),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  updated_by CHAR(36),
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_project_form (project_id, form_slug),
  INDEX idx_project_form_responses_project_id (project_id),
  INDEX idx_project_form_responses_form_slug (form_slug),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

