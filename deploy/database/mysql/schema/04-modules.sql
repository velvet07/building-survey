-- =============================================================================
-- MODULES TABLE
-- =============================================================================
-- Available modules and user module activations
-- =============================================================================

CREATE TABLE IF NOT EXISTS modules (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_modules_slug (slug),
  INDEX idx_modules_is_system (is_system),
  CHECK (slug REGEXP '^[a-z0-9-]+$')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User module activations
CREATE TABLE IF NOT EXISTS user_module_activations (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  module_id CHAR(36) NOT NULL,
  activated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_module (user_id, module_id),
  INDEX idx_user_module_activations_user_id (user_id),
  INDEX idx_user_module_activations_module_id (module_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Installed modules tracking (for installer)
CREATE TABLE IF NOT EXISTS installed_modules (
  id CHAR(36) PRIMARY KEY,
  module_slug VARCHAR(100) NOT NULL UNIQUE,
  installed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_installed_modules_slug (module_slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

