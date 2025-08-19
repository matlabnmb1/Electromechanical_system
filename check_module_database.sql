-- 机电管理系统 - 日常检查模块数据库表结构
-- 此脚本创建用于存储表格模板和记录的表

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 使用现有数据库
USE `electromechanical_system`;

-- ----------------------------
-- Table structure for check_templates
-- 存储表格模板（管理员和超级管理员创建）
-- ----------------------------
DROP TABLE IF EXISTS `check_templates`;
CREATE TABLE `check_templates` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板名称',
  `team` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所属区队',
  `structure` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '表格结构（JSON格式）',
  `created_by` int NOT NULL COMMENT '创建者ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_team`(`team` ASC) USING BTREE,
  INDEX `idx_created_by`(`created_by` ASC) USING BTREE,
  CONSTRAINT `fk_check_templates_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for check_records
-- 存储表格记录（普通用户填写）
-- ----------------------------
DROP TABLE IF EXISTS `check_records`;
CREATE TABLE `check_records` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `template_id` int NOT NULL COMMENT '模板ID',
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '表格数据（JSON格式）',
  `created_by` int NOT NULL COMMENT '创建者ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_template_id`(`template_id` ASC) USING BTREE,
  INDEX `idx_created_by`(`created_by` ASC) USING BTREE,
  CONSTRAINT `fk_check_records_template_id` FOREIGN KEY (`template_id`) REFERENCES `check_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_check_records_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;

-- 显示创建结果
SELECT '日常检查模块表格创建完成！' AS message;
SELECT '表名：' AS info, 'check_templates' AS value;
SELECT '表名：' AS info, 'check_records' AS value;