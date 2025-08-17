from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_mysqldb import MySQL
import bcrypt
import re
from functools import wraps

app = Flask(__name__)

# 用户角色常量
SUPER_ADMIN_ROLE = 'super_admin'  # 超级管理员
ADMIN_ROLE = 'admin'              # 系统管理员
USER_ROLE = 'user'                # 普通用户

# 配置数据库
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'  # 替换为你的MySQL用户名
app.config['MYSQL_PASSWORD'] = 'abc123456'  # 替换为你的MySQL密码
app.config['MYSQL_DB'] = 'Electromechanical_system'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
app.secret_key = 'your_secret_key_here'  # 用于session加密

# 初始化MySQL
mysql = MySQL(app)

# 权限检查装饰器
def super_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'role' not in session or session['role'] != SUPER_ADMIN_ROLE:
            flash('权限不足', 'error')
            return redirect(url_for('home'))
        return f(*args, **kwargs)
    return decorated_function

# 首页
@app.route('/')
def home():
    if 'loggedin' in session:
        return render_template('home.html', 
                             name=session['name'], 
                             role=session.get('role', USER_ROLE),
                             team=session.get('team'))  # 传递team到模板
    return redirect(url_for('login'))

# 登录页面
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST' and 'employee_id' in request.form and 'password' in request.form:
        employee_id = request.form['employee_id']
        password = request.form['password'].encode('utf-8')
        
        # 检查用户是否存在
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE employee_id = %s', (employee_id,))
        user = cursor.fetchone()
        
        if user and bcrypt.checkpw(password, user['password_hash'].encode('utf-8')):
            # 登录成功，创建session
            session['loggedin'] = True
            session['id'] = user['id']
            session['employee_id'] = user['employee_id']
            session['name'] = user['name']
            session['role'] = user.get('role', USER_ROLE)
            session['team'] = user.get('team')  # 添加队伍信息到session
            return redirect(url_for('home'))
        else:
            flash('工号或密码不正确', 'error')
    
    return render_template('login.html')

# 注册页面
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        employee_id = request.form['employee_id']
        phone = request.form['phone']
        password = request.form['password'].encode('utf-8')
        confirm_password = request.form['confirm_password'].encode('utf-8')
        team = request.form.get('team')  # 获取区队信息
        
        # 验证表单数据
        cursor = mysql.connection.cursor()
        cursor.execute('SELECT * FROM users WHERE employee_id = %s', (employee_id,))
        account = cursor.fetchone()
        
        # 检查输入是否符合要求
        if account:
            flash('该工号已被注册', 'error')
        elif not re.match(r'^[A-Za-z0-9]+$', employee_id):
            flash('工号只能包含字母和数字', 'error')
        elif not name or not employee_id or not password or not phone or not team:
            flash('请填写所有字段', 'error')
        elif password != confirm_password:
            flash('两次密码输入不一致', 'error')
        elif not re.match(r'^1[3-9]\d{9}$', phone):
            flash('请输入有效的手机号', 'error')
        else:
            # 密码加密
            hash_password = bcrypt.hashpw(password, bcrypt.gensalt())
            
            # 插入新用户，包含队伍信息
            cursor.execute('INSERT INTO users (name, employee_id, phone, password_hash, role, team) VALUES (%s, %s, %s, %s, %s, %s)', 
                          (name, employee_id, phone, hash_password.decode('utf-8'), USER_ROLE, team))
            mysql.connection.commit()
            flash('注册成功，请登录', 'success')
            return redirect(url_for('login'))
    
    return render_template('register.html')

# 登出
@app.route('/logout')
def logout():
    session.pop('loggedin', None)
    session.pop('id', None)
    session.pop('employee_id', None)
    session.pop('name', None)
    session.pop('role', None)
    session.pop('team', None)  # 清除区队信息
    return redirect(url_for('login'))

# 管理员专用路由 - 用户管理
@app.route('/admin/users')
def admin_users():
    if 'loggedin' not in session:
        return redirect(url_for('login'))
    
    if session.get('role') not in [SUPER_ADMIN_ROLE, ADMIN_ROLE]:
        flash('您没有权限访问此页面', 'error')
        return redirect(url_for('home'))
    
    # 获取所有用户信息
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT id, name, employee_id, phone, role, team, created_at FROM users ORDER BY created_at DESC')
    users = cursor.fetchall()
    cursor.close()
    
    return render_template('admin_users.html', users=users)

# 管理员专用路由 - 修改用户角色
@app.route('/admin/change_role/<int:user_id>', methods=['POST'])
@super_admin_required
def change_user_role(user_id):
    new_role = request.form.get('role')
    if new_role not in [SUPER_ADMIN_ROLE, ADMIN_ROLE, USER_ROLE]:
        flash('无效的用户角色', 'error')
        return redirect(url_for('admin_users'))
    
    # 获取要修改的用户信息
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT name, role FROM users WHERE id = %s', (user_id,))
    target_user = cursor.fetchone()
    
    if not target_user:
        flash('用户不存在', 'error')
        return redirect(url_for('admin_users'))
    
    # 防止超级管理员被降级
    if target_user['role'] == SUPER_ADMIN_ROLE and new_role != SUPER_ADMIN_ROLE:
        flash('超级管理员不能被降级', 'error')
        return redirect(url_for('admin_users'))
    
    # 防止自己降级自己
    if session.get('id') == user_id and new_role != SUPER_ADMIN_ROLE:
        flash('不能降级自己的权限', 'error')
        return redirect(url_for('admin_users'))
    
    # 防止创建新的超级管理员
    if new_role == SUPER_ADMIN_ROLE and target_user['role'] != SUPER_ADMIN_ROLE:
        flash('系统只能有一个超级管理员，不能创建新的超级管理员', 'error')
        return redirect(url_for('admin_users'))
    
    # 更新用户角色
    cursor.execute('UPDATE users SET role = %s WHERE id = %s', (new_role, user_id))
    mysql.connection.commit()
    cursor.close()
    
    role_names = {
        'super_admin': '超级管理员',
        'admin': '系统管理员', 
        'user': '普通用户'
    }
    
    flash(f'用户 {target_user["name"]} 的角色已更新为 {role_names.get(new_role, "未知")}', 'success')
    return redirect(url_for('admin_users'))

# 管理员专用路由 - 修改用户区队
@app.route('/admin/change_team/<int:user_id>', methods=['POST'])
@super_admin_required
def change_user_team(user_id):
    new_team = request.form.get('team')
    if not new_team:
        flash('请选择有效的区队', 'error')
        return redirect(url_for('admin_users'))
    
    # 获取要修改的用户信息
    cursor = mysql.connection.cursor()
    cursor.execute('SELECT name, role FROM users WHERE id = %s', (user_id,))
    target_user = cursor.fetchone()
    
    if not target_user:
        flash('用户不存在', 'error')
        return redirect(url_for('admin_users'))
    
    # 超级管理员没有区队
    if target_user['role'] == SUPER_ADMIN_ROLE:
        flash('超级管理员不需要设置区队', 'error')
        return redirect(url_for('admin_users'))
    
    # 更新用户区队
    cursor.execute('UPDATE users SET team = %s WHERE id = %s', (new_team, user_id))
    mysql.connection.commit()
    cursor.close()
    
    flash(f'用户 {target_user["name"]} 的区队已更新为 {new_team}', 'success')
    return redirect(url_for('admin_users'))

if __name__ == '__main__':
    app.run(debug=True)