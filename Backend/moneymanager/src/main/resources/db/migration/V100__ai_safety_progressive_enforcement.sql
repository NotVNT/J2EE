-- ============================================================
-- V100: AI Safety Progressive Enforcement Schema
-- Run manually if Flyway is disabled (spring.flyway.enabled=false)
-- Safe to run multiple times (uses IF NOT EXISTS / column checks)
-- ============================================================

-- Add ai_violation_score column if not exists
SET @col_exists = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'tbl_profiles'
      AND COLUMN_NAME = 'ai_violation_score'
      AND TABLE_SCHEMA = DATABASE()
);
SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tbl_profiles ADD COLUMN ai_violation_score INT NULL DEFAULT 0 COMMENT ''Tong diem vi pham AI tich luy''',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add ai_blocked_reason column if not exists
SET @col_exists2 = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'tbl_profiles'
      AND COLUMN_NAME = 'ai_blocked_reason'
      AND TABLE_SCHEMA = DATABASE()
);
SET @sql2 = IF(@col_exists2 = 0,
    'ALTER TABLE tbl_profiles ADD COLUMN ai_blocked_reason VARCHAR(500) NULL COMMENT ''Ly do khoa AI (null = khong bi khoa)''',
    'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Add ai_blocked_at column if not exists
SET @col_exists3 = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'tbl_profiles'
      AND COLUMN_NAME = 'ai_blocked_at'
      AND TABLE_SCHEMA = DATABASE()
);
SET @sql3 = IF(@col_exists3 = 0,
    'ALTER TABLE tbl_profiles ADD COLUMN ai_blocked_at DATETIME NULL COMMENT ''Thoi diem khoa AI''',
    'SELECT 1');
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- Create tbl_ai_violations table if not exists
CREATE TABLE IF NOT EXISTS tbl_ai_violations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    profile_id BIGINT NOT NULL COMMENT 'FK den tbl_profiles',
    violation_type VARCHAR(50) NOT NULL COMMENT 'Loai vi pham',
    violation_score INT NOT NULL COMMENT 'Diem vi pham cua lan nay',
    message_snippet VARCHAR(500) NULL COMMENT 'Doan message vi pham',
    source VARCHAR(100) NOT NULL COMMENT 'Nguon: CHAT_MODE, AGENT_MODE, ...',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_violations_profile
        FOREIGN KEY (profile_id) REFERENCES tbl_profiles(id) ON DELETE CASCADE,
    INDEX idx_profile_violations (profile_id, created_at DESC)
) COMMENT='Lich su vi pham su dung AI cua tung user';
