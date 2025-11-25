-- =============================================================================
-- MYSQL FUNCTIONS AND TRIGGERS
-- =============================================================================
-- MySQL stored procedures and triggers
-- =============================================================================

DELIMITER //

-- Function: Generate project identifier
CREATE PROCEDURE IF NOT EXISTS generate_project_identifier(OUT new_identifier VARCHAR(50))
BEGIN
  DECLARE today_date VARCHAR(8);
  DECLARE today_count INT;
  
  -- Format today's date as YYYYMMDD
  SET today_date = DATE_FORMAT(CURRENT_DATE, '%Y%m%d');
  
  -- Count projects created today
  SELECT COUNT(*) INTO today_count
  FROM projects
  WHERE auto_identifier LIKE CONCAT('PROJ-', today_date, '-%');
  
  -- Increment count
  SET today_count = today_count + 1;
  
  -- Generate identifier
  SET new_identifier = CONCAT('PROJ-', today_date, '-', LPAD(today_count, 3, '0'));
END //

-- Trigger: Auto-generate project identifier
DROP TRIGGER IF EXISTS trigger_set_project_auto_identifier //
CREATE TRIGGER trigger_set_project_auto_identifier
BEFORE INSERT ON projects
FOR EACH ROW
BEGIN
  IF NEW.auto_identifier IS NULL OR NEW.auto_identifier = '' THEN
    CALL generate_project_identifier(NEW.auto_identifier);
  END IF;
  
  -- Generate UUID if not provided
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

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

-- Trigger: Auto-generate UUIDs for other tables
DROP TRIGGER IF EXISTS trigger_generate_user_id //
CREATE TRIGGER trigger_generate_user_id
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DROP TRIGGER IF EXISTS trigger_generate_session_id //
CREATE TRIGGER trigger_generate_session_id
BEFORE INSERT ON sessions
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DROP TRIGGER IF EXISTS trigger_generate_module_id //
CREATE TRIGGER trigger_generate_module_id
BEFORE INSERT ON modules
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DROP TRIGGER IF EXISTS trigger_generate_activation_id //
CREATE TRIGGER trigger_generate_activation_id
BEFORE INSERT ON user_module_activations
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DROP TRIGGER IF EXISTS trigger_generate_installed_module_id //
CREATE TRIGGER trigger_generate_installed_module_id
BEFORE INSERT ON installed_modules
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DROP TRIGGER IF EXISTS trigger_generate_drawing_id //
CREATE TRIGGER trigger_generate_drawing_id
BEFORE INSERT ON drawings
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DROP TRIGGER IF EXISTS trigger_generate_photo_id //
CREATE TRIGGER trigger_generate_photo_id
BEFORE INSERT ON photos
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

DROP TRIGGER IF EXISTS trigger_generate_form_response_id //
CREATE TRIGGER trigger_generate_form_response_id
BEFORE INSERT ON project_form_responses
FOR EACH ROW
BEGIN
  IF NEW.id IS NULL OR NEW.id = '' THEN
    SET NEW.id = UUID();
  END IF;
END //

-- Trigger: Auto-create profile on user creation
DROP TRIGGER IF EXISTS trigger_create_profile_on_user //
CREATE TRIGGER trigger_create_profile_on_user
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON DUPLICATE KEY UPDATE email = NEW.email;
END //

DELIMITER ;

