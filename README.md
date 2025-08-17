# 机电管理系统

一个基于Flask的机电设备管理系统，支持用户认证、角色管理和基础的系统功能。

## 功能特性

### 🔐 用户认证系统
- 用户注册和登录
- 密码加密存储（bcrypt）
- 会话管理
- 用户角色分类（管理员/普通用户）

### 👥 角色管理
- **管理员角色**：可以访问所有功能，包括用户管理
- **普通用户角色**：只能访问基本系统功能
- 角色权限控制
- 用户角色动态修改

### 🎨 用户界面
- 响应式设计（Tailwind CSS）
- 现代化UI界面
- 图标支持（Font Awesome）
- 模板继承系统

## 技术架构

- **后端**: Flask (Python)
- **数据库**: MySQL
- **前端**: HTML + Tailwind CSS + JavaScript
- **认证**: bcrypt密码加密
- **会话**: Flask Session

## 安装步骤

### 1. 环境要求
- Python 3.8+
- MySQL 5.7+
- pip

### 2. 克隆项目
```bash
git clone <项目地址>
cd Electromechanical_system
```

### 3. 创建虚拟环境
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 4. 安装依赖
```bash
pip install -r requirements.txt
```

### 5. 配置数据库
1. 创建MySQL数据库：
```sql
CREATE DATABASE Electromechanical_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 创建用户表：
```sql
USE Electromechanical_system;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. 运行数据库迁移脚本：
```bash
mysql -u root -p < database_migration.sql
```

### 6. 配置应用
编辑 `app.py` 文件，修改数据库连接信息：
```python
app.config['MYSQL_USER'] = 'your_username'
app.config['MYSQL_PASSWORD'] = 'your_password'
app.config['MYSQL_DB'] = 'Electromechanical_system'
```

### 7. 运行应用
```bash
python app.py
```

应用将在 `http://localhost:5000` 启动。

## 使用说明

### 首次使用
1. 访问注册页面创建第一个用户账户
2. 该用户将自动设置为管理员角色
3. 使用管理员账户登录系统

### 用户管理
- 管理员可以在首页点击"用户管理"按钮
- 查看所有用户信息
- 修改用户角色（管理员/普通用户）
- 监控用户注册时间

### 角色权限
- **管理员**：可以访问所有功能，包括用户管理
- **普通用户**：只能访问基本系统功能

## 数据库结构

### users表
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(100) | 用户姓名 |
| employee_id | VARCHAR(50) | 工号，唯一 |
| phone | VARCHAR(20) | 手机号 |
| password_hash | VARCHAR(255) | 加密后的密码 |
| role | VARCHAR(20) | 用户角色（admin/user） |
| created_at | TIMESTAMP | 创建时间 |

## 安全特性

- 密码使用bcrypt加密存储
- 会话管理防止未授权访问
- 输入数据验证和过滤
- 角色权限控制

## 开发计划

- [ ] 设备管理模块
- [ ] 维护记录管理
- [ ] 故障申报系统
- [ ] 报表统计功能
- [ ] 文件上传功能
- [ ] 日志记录系统

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

本项目采用MIT许可证。

## 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件至：[matlabnm@163.com]

---

**注意**: 这是一个开发中的项目，请在生产环境中使用前进行充分测试。 
