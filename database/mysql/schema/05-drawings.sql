-- =============================================================================
-- DRAWINGS TABLE
-- =============================================================================
-- Drawing module schema
-- =============================================================================

-- Drawings table
CREATE TABLE IF NOT EXISTS drawings (
  id CHAR(36) PRIMARY KEY,
  project_id CHAR(36) NOT NULL,
  name VARCHAR(200) NOT NULL DEFAULT 'Alaprajz',
  canvas_data JSON NOT NULL,
  paper_size ENUM('a4', 'a3') NOT NULL DEFAULT 'a4',
  orientation ENUM('portrait', 'landscape') NOT NULL DEFAULT 'portrait',
  slug VARCHAR(255),
  created_by CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  INDEX idx_drawings_project_id (project_id),
  INDEX idx_drawings_deleted_at (deleted_at),
  INDEX idx_drawings_created_by (created_by),
  INDEX idx_drawings_project_active (project_id, deleted_at),
  INDEX idx_drawings_created_at (created_at),
  INDEX idx_drawings_slug (slug),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  CHECK (CHAR_LENGTH(name) >= 1 AND CHAR_LENGTH(name) <= 200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DRAWINGS TRIGGERS
-- =============================================================================

DELIMITER //

-- Trigger: Auto-generate drawing name
DROP TRIGGER IF EXISTS auto_name_drawing //
CREATE TRIGGER auto_name_drawing
BEFORE INSERT ON drawings
FOR EACH ROW
BEGIN
  DECLARE drawing_count INT;

  -- Generate UUID if not provided
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;

  -- Auto-generate name if default
  IF NEW.name = 'Alaprajz' THEN
    SELECT COUNT(*) INTO drawing_count
    FROM drawings
    WHERE project_id = NEW.project_id AND deleted_at IS NULL;

    IF drawing_count = 0 THEN
      SET NEW.name = 'Alaprajz';
    ELSE
      SET NEW.name = CONCAT('Alaprajz ', drawing_count + 1);
    END IF;
  END IF;
END //

-- Trigger: Auto-generate drawing UUID
DROP TRIGGER IF EXISTS trigger_generate_drawing_id //
CREATE TRIGGER trigger_generate_drawing_id
BEFORE INSERT ON drawings
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DELIMITER ;

