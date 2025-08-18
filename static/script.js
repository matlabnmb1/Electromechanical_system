/* 机电管理系统 - 交互功能和动画效果 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initSmoothScroll();
    initButtonEffects();
    initFormValidation();
    initTableInteractions();
    initSearchAndFilter();
    initRoleChangeConfirmation();
    initNotificationSystem();
    initResponsiveMenu();
    initCardHoverEffects();
    initInputFocusEffects();
});

// 平滑滚动功能
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 按钮悬停效果
function initButtonEffects() {
    const buttons = document.querySelectorAll('button:not([type="submit"]), .btn');
    
    buttons.forEach(button => {
        // 波纹效果
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.width = ripple.style.height = '200px';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'translate(-50%, -50%) scale(0)';
            ripple.style.opacity = '1';
            ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.style.transform = `translate(-50%, -50%) scale(1)`;
                ripple.style.opacity = '0';
            }, 10);
            
            setTimeout(() => {
                ripple.remove();
            }, 700);
        });
        
        // 悬停缩放效果
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// 表单验证功能
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
        });
        
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('请填写所有必填字段', 'error');
            }
        });
    });
    
    function validateField(field) {
        const value = field.value.trim();
        const parent = field.parentElement;
        
        if (!value) {
            parent.classList.add('has-error');
            return false;
        } else {
            parent.classList.remove('has-error');
            return true;
        }
    }
}

// 表格交互增强
function initTableInteractions() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
        // 行悬停高亮
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'var(--hover-color)';
                this.style.transform = 'translateZ(5px)';
                this.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                this.style.transition = 'all 0.2s ease';
            });
            
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
                this.style.transform = '';
                this.style.boxShadow = '';
            });
            
            // 行点击选中效果
            row.addEventListener('click', function() {
                rows.forEach(r => r.classList.remove('selected'));
                this.classList.add('selected');
            });
        });
        
        // 表头排序提示
        const headers = table.querySelectorAll('thead th');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.setAttribute('title', '点击排序');
        });
    });
}

// 搜索和过滤功能
function initSearchAndFilter() {
    const searchInput = document.getElementById('search');
    const roleFilter = document.getElementById('role-filter');
    const userRows = document.querySelectorAll('.user-row');
    
    if (searchInput && roleFilter && userRows.length > 0) {
        // 搜索输入动画
        searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
            this.style.width = '100%';
            this.style.transition = 'width 0.3s ease';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            this.style.width = '';
        });
        
        // 过滤功能
        function filterUsers() {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedRole = roleFilter.value;
            let visibleCount = 0;
            
            userRows.forEach(row => {
                const name = row.dataset.name || '';
                const employeeId = row.dataset.employeeId || '';
                const phone = row.dataset.phone || '';
                const role = row.dataset.role || 'user';
                
                const matchesSearch = name.includes(searchTerm) || 
                                    employeeId.includes(searchTerm) || 
                                    phone.includes(searchTerm);
                const matchesRole = !selectedRole || role === selectedRole;
                
                if (matchesSearch && matchesRole) {
                    row.style.display = '';
                    // 添加出现动画
                    setTimeout(() => {
                        row.style.opacity = '1';
                        row.style.transform = 'translateY(0)';
                        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    }, 50);
                    visibleCount++;
                } else {
                    row.style.opacity = '0';
                    row.style.transform = 'translateY(10px)';
                    row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    setTimeout(() => {
                        row.style.display = 'none';
                    }, 300);
                }
            });
            
            // 显示搜索结果数量
            updateSearchResultCount(visibleCount);
        }
        
        searchInput.addEventListener('input', debounce(filterUsers, 300));
        roleFilter.addEventListener('change', filterUsers);
        
        // 初始化搜索结果计数显示
        updateSearchResultCount(userRows.length);
    }
    
    function updateSearchResultCount(count) {
        let resultCountElement = document.getElementById('search-result-count');
        
        if (!resultCountElement) {
            // 创建结果计数元素
            resultCountElement = document.createElement('div');
            resultCountElement.id = 'search-result-count';
            resultCountElement.style.fontSize = '0.875rem';
            resultCountElement.style.color = 'var(--text-secondary)';
            resultCountElement.style.marginTop = '0.5rem';
            
            // 插入到搜索框下方
            const searchContainer = searchInput ? searchInput.closest('.search-filter') : null;
            if (searchContainer) {
                searchContainer.appendChild(resultCountElement);
            }
        }
        
        resultCountElement.textContent = `找到 ${count} 个用户`;
        
        // 计数动画
        resultCountElement.style.opacity = '0';
        resultCountElement.style.transform = 'translateY(-5px)';
        setTimeout(() => {
            resultCountElement.style.opacity = '1';
            resultCountElement.style.transform = 'translateY(0)';
            resultCountElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        }, 100);
    }
}

// 角色变更确认功能
function initRoleChangeConfirmation() {
    const roleForms = document.querySelectorAll('form[action*="change_user_role"]');
    
    roleForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userName = this.closest('tr').querySelector('.text-gray-900').textContent.trim();
            const selectElement = this.querySelector('select[name="role"]');
            const currentRole = selectElement.options[selectElement.selectedIndex].textContent;
            const originalRole = selectElement.dataset.originalRole || currentRole;
            
            if (currentRole === originalRole) {
                showNotification('用户角色没有发生变化', 'info');
                return;
            }
            
            // 美化的确认对话框
            if (window.confirm(`确定要将用户 "${userName}" 的角色更改为 ${currentRole} 吗？\n\n此操作将立即生效！`)) {
                // 添加提交动画
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>处理中...';
                
                // 提交表单
                setTimeout(() => {
                    this.submit();
                }, 500);
            }
        });
        
        // 记录原始角色
        const selectElement = form.querySelector('select[name="role"]');
        selectElement.dataset.originalRole = selectElement.options[selectElement.selectedIndex].textContent;
        
        // 选项变更动画
        selectElement.addEventListener('change', function() {
            this.style.borderColor = '#6e41e2';
            this.style.boxShadow = '0 0 0 3px rgba(110, 65, 226, 0.1)';
            
            setTimeout(() => {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }, 1000);
        });
    });
}

// 通知消息系统
function initNotificationSystem() {
    // 自动关闭通知消息
    const flashMessages = document.querySelectorAll('.flash-message, .alert');
    
    flashMessages.forEach(message => {
        // 添加进入动画
        message.style.opacity = '0';
        message.style.transform = 'translateY(-20px)';
        message.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        setTimeout(() => {
            message.style.opacity = '1';
            message.style.transform = 'translateY(0)';
        }, 100);
        
        // 设置自动关闭
        setTimeout(() => {
            message.style.opacity = '0';
            message.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
}

// 响应式菜单
function initResponsiveMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            const isOpen = mobileMenu.classList.contains('open');
            
            if (isOpen) {
                mobileMenu.classList.remove('open');
                mobileMenu.style.height = '0';
                mobileMenu.style.opacity = '0';
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            } else {
                mobileMenu.classList.add('open');
                mobileMenu.style.height = mobileMenu.scrollHeight + 'px';
                mobileMenu.style.opacity = '1';
                menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
        
        // 窗口大小变化时重置菜单
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                mobileMenu.classList.remove('open');
                mobileMenu.style.height = '';
                mobileMenu.style.opacity = '';
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
}

// 卡片悬浮效果
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.card, .stat-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
}

// 输入框焦点效果
function initInputFocusEffects() {
    const inputs = document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
    
    inputs.forEach(input => {
        // 聚焦效果
        input.addEventListener('focus', function() {
            this.style.borderColor = '#6e41e2';
            this.style.boxShadow = '0 0 0 3px rgba(110, 65, 226, 0.1)';
            this.style.transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
        });
        
        // 失焦效果
        input.addEventListener('blur', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
        
        // 输入动画
        if (input.tagName === 'INPUT' && input.type !== 'checkbox' && input.type !== 'radio') {
            let oldValue = input.value;
            
            input.addEventListener('input', function() {
                const newValue = this.value;
                
                // 只有在实际内容变化时才添加动画
                if (oldValue.length !== newValue.length) {
                    this.style.transform = 'scale(1.01)';
                    
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                }
                
                oldValue = newValue;
            });
        }
    });
}

// 辅助函数：防抖
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// 辅助函数：显示通知
function showNotification(message, type = 'info') {
    // 检查是否已存在通知容器
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        // 创建通知容器
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '10000';
        notificationContainer.style.display = 'flex';
        notificationContainer.style.flexDirection = 'column';
        notificationContainer.style.gap = '10px';
        
        document.body.appendChild(notificationContainer);
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'alert alert-' + type;
    notification.style.padding = '12px 16px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    notification.style.cursor = 'pointer';
    notification.style.maxWidth = '350px';
    notification.style.wordWrap = 'break-word';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '8px';
    
    // 设置通知类型样式
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#dcfce7';
            notification.style.color = '#166534';
            notification.style.border = '1px solid #bbf7d0';
            notification.innerHTML = '<i class="fas fa-check-circle"></i> ' + message;
            break;
        case 'error':
            notification.style.backgroundColor = '#fee2e2';
            notification.style.color = '#991b1b';
            notification.style.border = '1px solid #fecaca';
            notification.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
            break;
        case 'warning':
            notification.style.backgroundColor = '#fef3c7';
            notification.style.color = '#92400e';
            notification.style.border = '1px solid #fde68a';
            notification.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + message;
            break;
        default:
            notification.style.backgroundColor = '#dbeafe';
            notification.style.color = '#1e40af';
            notification.style.border = '1px solid #bfdbfe';
            notification.innerHTML = '<i class="fas fa-info-circle"></i> ' + message;
    }
    
    // 添加到容器
    notificationContainer.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // 点击关闭
    notification.addEventListener('click', function() {
        this.style.opacity = '0';
        this.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            this.remove();
        }, 300);
    });
    
    // 自动关闭
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// 页面加载动画
window.addEventListener('load', function() {
    // 移除加载覆盖层
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.remove();
        }, 500);
    }
    
    // 页面元素进入动画
    const pageElements = document.querySelectorAll('header, main section, .card, .stat-card');
    
    pageElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
});

// 暗色模式切换（如果有）
function initDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (darkModeToggle) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // 初始化暗色模式
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        // 切换暗色模式
        darkModeToggle.addEventListener('click', function() {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', isDark);
            
            darkModeToggle.innerHTML = isDark ? 
                '<i class="fas fa-sun"></i>' : 
                '<i class="fas fa-moon"></i>';
            
            // 添加切换动画
            this.style.transform = 'rotate(180deg)';
            setTimeout(() => {
                this.style.transform = 'rotate(0)';
            }, 300);
        });
    }
}

// 图片懒加载
function initImageLazyLoad() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window && lazyImages.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    
                    // 图片加载动画
                    image.style.opacity = '0';
                    image.style.transform = 'scale(0.95)';
                    image.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    
                    image.onload = function() {
                        image.style.opacity = '1';
                        image.style.transform = 'scale(1)';
                    };
                    
                    observer.unobserve(image);
                }
            });
        });
        
        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });
    }
}

// 执行额外的初始化
setTimeout(() => {
    initDarkModeToggle();
    initImageLazyLoad();
}, 1000);

// 导出公共函数
window.showNotification = showNotification;