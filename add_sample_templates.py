#!/usr/bin/env python3
"""
添加示例表格模板数据到数据库的脚本

使用方法：
1. 确保Flask应用已经正确配置数据库连接
2. 在命令行中运行：python add_sample_templates.py

此脚本将添加3个示例表格模板：
1. 设备日常检查记录表 - 用于记录设备的日常检查情况
2. 安全隐患排查表 - 用于记录安全隐患排查结果
3. 维护保养记录表 - 用于记录设备的维护保养情况
"""

from app import app, mysql
from datetime import datetime

# 示例表格模板数据
sample_templates = [
    {
        "name": "设备日常检查记录表",
        "team": "机电一队",
        "structure": '''{
          "columns": [
            {"name": "设备名称", "type": "text", "required": true},
            {"name": "检查时间", "type": "datetime", "required": true},
            {"name": "检查人", "type": "text", "required": true},
            {"name": "运行状态", "type": "select", "options": ["正常", "异常"], "required": true},
            {"name": "异常情况", "type": "textarea"},
            {"name": "处理措施", "type": "textarea"}
          ]
        }''',
        "created_by": 1  # 假设超级管理员用户ID为1
    },
    {
        "name": "安全隐患排查表",
        "team": "机电二队",
        "structure": '''{
          "columns": [
            {"name": "排查区域", "type": "text", "required": true},
            {"name": "排查日期", "type": "datetime", "required": true},
            {"name": "排查人员", "type": "text", "required": true},
            {"name": "隐患等级", "type": "select", "options": ["一般", "较大", "重大"], "required": true},
            {"name": "隐患描述", "type": "textarea", "required": true},
            {"name": "整改责任人", "type": "text", "required": true},
            {"name": "整改期限", "type": "datetime", "required": true}
          ]
        }''',
        "created_by": 2  # 假设普通管理员用户ID为2
    },
    {
        "name": "维护保养记录表",
        "team": "机电三队",
        "structure": '''{
          "columns": [
            {"name": "设备编号", "type": "text", "required": true},
            {"name": "维护日期", "type": "datetime", "required": true},
            {"name": "维护人员", "type": "text", "required": true},
            {"name": "维护内容", "type": "textarea", "required": true},
            {"name": "更换部件", "type": "text"},
            {"name": "维护结果", "type": "select", "options": ["合格", "不合格", "待观察"], "required": true},
            {"name": "备注", "type": "textarea"}
          ]
        }''',
        "created_by": 3  # 假设普通用户ID为3
    }
]

def add_sample_templates():
    with app.app_context():
        cursor = mysql.connection.cursor()
        
        try:
            # 插入示例模板数据
            for template in sample_templates:
                # 检查模板是否已存在
                cursor.execute('SELECT id FROM check_templates WHERE name = %s AND team = %s',
                              (template["name"], template["team"]))
                result = cursor.fetchone()
                
                if not result:
                    # 插入新模板
                    cursor.execute('''
                        INSERT INTO check_templates (name, team, structure, created_by, created_at)
                        VALUES (%s, %s, %s, %s, %s)
                    ''', (
                        template["name"],
                        template["team"],
                        template["structure"],
                        template["created_by"],
                        datetime.now()
                    ))
                    print(f"已添加模板: {template['name']} (区队: {template['team']})")
                else:
                    print(f"模板已存在: {template['name']} (区队: {template['team']})")
            
            # 提交事务
            mysql.connection.commit()
            print("\n所有示例模板数据已成功添加到数据库！")
            print("\n请访问系统的'日常检查'页面查看示例表格模板。")
            
        except Exception as e:
            print(f"添加示例模板数据时出错: {str(e)}")
            mysql.connection.rollback()
        finally:
            cursor.close()

if __name__ == '__main__':
    print("正在添加示例表格模板数据...\n")
    add_sample_templates()