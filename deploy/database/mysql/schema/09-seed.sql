-- =============================================================================
-- SEED DATA
-- =============================================================================
-- Initial data for modules
-- =============================================================================

-- Insert default system modules
INSERT IGNORE INTO modules (id, name, slug, description, is_system) VALUES
(UUID(), 'Projekt modul', 'projects', 'Projektek létrehozása és kezelése', TRUE),
(UUID(), 'Dashboard', 'dashboard', 'Főoldal és statisztikák', TRUE);

