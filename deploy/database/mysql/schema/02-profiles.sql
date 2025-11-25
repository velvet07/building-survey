-- =============================================================================
-- PROFILES TABLE
-- =============================================================================
-- User profiles with roles
-- =============================================================================

-- Role enum type
CREATE TABLE IF NOT EXISTS user_role_enum (
  value ENUM('admin', 'user', 'viewer') NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert enum values
INSERT IGNORE INTO user_role_enum (value) VALUES ('admin'), ('user'), ('viewer');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role ENUM('admin', 'user', 'viewer') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_profiles_role (role),
  INDEX idx_profiles_email (email),
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

