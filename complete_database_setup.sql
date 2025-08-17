-- 机电管理系统完整数据库设置
-- 此脚本将直接覆盖现有数据库结构，请谨慎使用

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 删除现有数据库（如果存在）
DROP DATABASE IF EXISTS `electromechanical_system`;

-- 创建新数据库
CREATE DATABASE `electromechanical_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用新数据库
USE `electromechanical_system`;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `employee_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '工号，唯一',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '手机号',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user' COMMENT '用户角色：admin-管理员，user-普通用户',
  `team` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '所属区队',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `employee_id`(`employee_id` ASC) USING BTREE,
  UNIQUE INDEX `phone`(`phone` ASC) USING BTREE,
  INDEX `idx_employee_id`(`employee_id` ASC) USING BTREE,
  INDEX `idx_phone`(`phone` ASC) USING BTREE,
  INDEX `idx_role`(`role` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users (示例数据)
-- ----------------------------
-- 插入超级管理员
INSERT INTO `users` VALUES 
(1, 'admin001', '超级管理员', '13800138000', 
'$2b$12$uwP93ptdaG30MXIfUVnS0uT59kzIhYBLsu..Imo5QQUD7oqNHllKC', 
'super_admin', NULL, 
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入系统管理员
INSERT INTO `users` VALUES 
(2, '11104', '何子越', '15797707252', 
'$2b$12$uwP93ptdaG30MXIfUVnS0uT59kzIhYBLsu..Imo5QQUD7oqNHllKC', 
'admin', '第一区队', 
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 插入普通用户
INSERT INTO `users` VALUES 
(3, 'user001', '张三', '13900139000', 
'$2b$12$uwP93ptdaG30MXIfUVnS0uT59kzIhYBLsu..Imo5QQUD7oqNHllKC', 
'user', '第二区队', 
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO `users` VALUES 
(4, 'user002', '李四', '13700137000', 
'$2b$12$uwP93ptdaG30MXIfUVnS0uT59kzIhYBLsu..Imo5QQUD7oqNHllKC', 
'user', '第三区队', 
CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 重置自增ID
ALTER TABLE `users` AUTO_INCREMENT = 5;

SET FOREIGN_KEY_CHECKS = 1;

-- 显示创建结果
SELECT '数据库创建完成！' AS message;
SELECT '数据库名：' AS info, 'electromechanical_system' AS value;
SELECT '表名：' AS info, 'users' AS value;
SELECT '用户总数：' AS info, COUNT(*) AS value FROM users;
SELECT '管理员数量：' AS info, COUNT(*) AS value FROM users WHERE role = 'admin';
SELECT '普通用户数量：' AS info, COUNT(*) AS value FROM users WHERE role = 'user';

-- 显示用户列表
SELECT 
    id,
    name,
    employee_id,
    phone,
    CASE role 
        WHEN 'admin' THEN '管理员' 
        WHEN 'user' THEN '普通用户' 
        ELSE '未知' 
    END AS role_text,
    created_at,
    updated_at
FROM users 
ORDER BY id;