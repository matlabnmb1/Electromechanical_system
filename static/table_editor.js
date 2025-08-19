/* Excel风格表格可视化编辑器 - 更接近Excel的用户体验 */

class TableEditor {
    constructor() {
        this.columns = [];
        this.draggingColumnIndex = -1;
        this.draggingDirection = null;
        this.init();
    }

    init() {
        // 获取DOM元素
        this.templateNameInput = document.getElementById('template_name');
        this.structureTextarea = document.getElementById('structure');
        this.columnsContainer = document.getElementById('columns_container');
        this.addColumnBtn = document.getElementById('add_column_btn');
        this.saveBtn = document.querySelector('button[type="submit"]');
        this.previewBtn = document.getElementById('preview_table_btn');
        this.previewContainer = document.getElementById('table_preview');

        // 绑定事件
        if (this.addColumnBtn) {
            this.addColumnBtn.addEventListener('click', () => this.addColumn());
        }

        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.updateStructure());
        }

        if (this.previewBtn) {
            this.previewBtn.addEventListener('click', () => this.previewTable());
        }

        // 如果有现有的结构数据，加载它
        if (this.structureTextarea && this.structureTextarea.value.trim() !== '') {
            try {
                const structure = JSON.parse(this.structureTextarea.value);
                if (structure.columns && Array.isArray(structure.columns)) {
                    this.columns = structure.columns;
                    this.renderColumns();
                }
            } catch (e) {
                console.error('解析结构数据失败:', e);
            }
        }
    }

    // 添加新列
    addColumn() {
        const newColumn = {
            name: `列${this.columns.length + 1}`,
            type: 'text',
            width: 120 // 默认列宽，更接近Excel
        };
        this.columns.push(newColumn);
        this.renderColumns();
        this.previewTable(); // 添加列后自动刷新预览
    }

    // 删除列
    deleteColumn(index) {
        if (confirm('确定要删除这一列吗？')) {
            this.columns.splice(index, 1);
            this.renderColumns();
            this.previewTable();
        }
    }

    // 更新列属性
    updateColumn(index, property, value) {
        this.columns[index][property] = value;
        
        // 对于select类型，需要特殊处理选项
        if (property === 'type' && value === 'select') {
            this.columns[index].options = ['选项1', '选项2'];
        } else if (property === 'type' && value !== 'select' && this.columns[index].options) {
            delete this.columns[index].options;
        }
        
        this.renderColumns();
        if (property === 'name' || property === 'width') {
            this.previewTable(); // 列名或宽度变更时自动刷新预览
        }
    }

    // 更新选项
    updateOptions(index, optionsStr) {
        const options = optionsStr.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
        if (options.length > 0) {
            this.columns[index].options = options;
        } else {
            // 如果没有选项，默认为select类型添加两个选项
            this.columns[index].options = ['选项1', '选项2'];
        }
        this.previewTable(); // 选项变更时自动刷新预览
    }

    // 渲染所有列
    renderColumns() {
        if (!this.columnsContainer) return;
        
        this.columnsContainer.innerHTML = '';
        
        // 添加表头
        const header = document.createElement('div');
        header.className = 'grid grid-cols-6 gap-4 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg shadow-sm';
        header.innerHTML = `
            <div class="text-white font-medium text-sm">列名</div>
            <div class="text-white font-medium text-sm">类型</div>
            <div class="text-white font-medium text-sm">选项</div>
            <div class="text-white font-medium text-sm">必填</div>
            <div class="text-white font-medium text-sm">宽度</div>
            <div class="text-white font-medium text-sm">操作</div>
        `;
        this.columnsContainer.appendChild(header);
        
        // 渲染每一列
        this.columns.forEach((column, index) => {
            const columnEl = document.createElement('div');
            columnEl.className = 'grid grid-cols-6 gap-4 p-4 border-b border-gray-100 items-center hover:bg-blue-50 transition-colors shadow-sm';
            columnEl.dataset.index = index; // 用于拖拽功能
            
            // 列名
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = column.name || '';
            nameInput.className = 'px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all';
            nameInput.addEventListener('input', (e) => this.updateColumn(index, 'name', e.target.value));
            nameInput.placeholder = '输入列名（如：设备编号）';
            
            // 类型选择
            const typeSelect = document.createElement('select');
            typeSelect.className = 'px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all bg-white';
            typeSelect.innerHTML = `
                <option value="text">文本</option>
                <option value="number">数字</option>
                <option value="datetime">日期时间</option>
                <option value="select">下拉选择</option>
                <option value="textarea">多行文本</option>
                <option value="checkbox">复选框</option>
                <option value="image">图片</option>
                <option value="file">文件</option>
            `;
            typeSelect.value = column.type || 'text';
            typeSelect.addEventListener('change', (e) => this.updateColumn(index, 'type', e.target.value));
            
            // 选项输入
            const optionsInput = document.createElement('input');
            optionsInput.type = 'text';
            optionsInput.placeholder = '选项1,选项2,选项3';
            optionsInput.className = 'px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all';
            if (column.options && Array.isArray(column.options)) {
                optionsInput.value = column.options.join(',');
            }
            optionsInput.addEventListener('input', (e) => this.updateOptions(index, e.target.value));
            
            // 控制选项输入的显示/隐藏
            if (column.type !== 'select') {
                optionsInput.style.display = 'none';
            }
            
            // 必填复选框
            const requiredCheckbox = document.createElement('input');
            requiredCheckbox.type = 'checkbox';
            requiredCheckbox.className = 'rounded text-blue-600 focus:ring-blue-500 h-5 w-5';
            requiredCheckbox.checked = column.required || false;
            requiredCheckbox.addEventListener('change', (e) => this.updateColumn(index, 'required', e.target.checked));
            
            // 宽度输入
            const widthInput = document.createElement('input');
            widthInput.type = 'number';
            widthInput.placeholder = '默认';
            widthInput.min = '50';
            widthInput.max = '500';
            widthInput.className = 'px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all';
            if (column.width) {
                widthInput.value = column.width;
            }
            widthInput.addEventListener('change', (e) => this.updateColumn(index, 'width', parseInt(e.target.value)));
            
            // 操作按钮容器
            const actionContainer = document.createElement('div');
            actionContainer.className = 'flex space-x-2';
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors';
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt mr-1"></i> 删除';
            deleteBtn.addEventListener('click', () => this.deleteColumn(index));
            
            // 向上/向下移动按钮
            const moveBtns = document.createElement('div');
            moveBtns.className = 'flex space-x-1';
            
            const moveUpBtn = document.createElement('button');
            moveUpBtn.type = 'button';
            moveUpBtn.className = 'inline-flex items-center px-2 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors';
            moveUpBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
            moveUpBtn.title = '上移';
            moveUpBtn.disabled = index === 0;
            moveUpBtn.style.opacity = index === 0 ? '0.5' : '1';
                            moveUpBtn.addEventListener('click', () => this.moveColumn(index, -1));
                            
                            const moveDownBtn = document.createElement('button');
                            moveDownBtn.type = 'button';
                            moveDownBtn.className = 'inline-flex items-center px-2 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors';
                            moveDownBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
                            moveDownBtn.title = '下移';
                            moveDownBtn.disabled = index === this.columns.length - 1;
                            moveDownBtn.style.opacity = index === this.columns.length - 1 ? '0.5' : '1';
                            moveDownBtn.addEventListener('click', () => this.moveColumn(index, 1));
                            
                            moveBtns.appendChild(moveUpBtn);
                            moveBtns.appendChild(moveDownBtn);
                            actionContainer.appendChild(moveBtns);
                            actionContainer.appendChild(deleteBtn);
                            
                            // 将所有元素添加到列容器
                            const elementsContainer = document.createElement('div');
                            elementsContainer.appendChild(nameInput);
                            columnEl.appendChild(elementsContainer);
                            columnEl.appendChild(typeSelect);
                            columnEl.appendChild(optionsInput);
                            columnEl.appendChild(requiredCheckbox);
                            columnEl.appendChild(widthInput);
                            columnEl.appendChild(actionContainer);
            
            // 添加拖拽功能，使列可以直接拖动排序
            columnEl.draggable = true;
            columnEl.addEventListener('dragstart', (e) => {
                this.draggingColumnIndex = index;
                e.dataTransfer.effectAllowed = 'move';
            });
            
            columnEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                const targetIndex = parseInt(e.currentTarget.dataset.index);
                const rect = e.currentTarget.getBoundingClientRect();
                const midpoint = rect.width / 2;
                const isBefore = e.clientX < rect.left + midpoint;
                
                // 确定拖拽方向
                if (targetIndex !== this.draggingColumnIndex) {
                    this.draggingDirection = isBefore ? 'before' : 'after';
                }
            });
            
            columnEl.addEventListener('drop', (e) => {
                e.preventDefault();
                const targetIndex = parseInt(e.currentTarget.dataset.index);
                
                if (targetIndex !== this.draggingColumnIndex && this.draggingDirection) {
                    // 计算新的索引位置
                    const newIndex = this.draggingDirection === 'before' 
                        ? targetIndex
                        : targetIndex + 1;
                    
                    // 执行移动
                    if (newIndex >= 0 && newIndex < this.columns.length && newIndex !== this.draggingColumnIndex) {
                        const temp = this.columns[this.draggingColumnIndex];
                        this.columns.splice(this.draggingColumnIndex, 1);
                        this.columns.splice(newIndex, 0, temp);
                        this.renderColumns();
                        this.previewTable();
                    }
                }
                
                this.draggingColumnIndex = -1;
                this.draggingDirection = null;
            });
            
            // 监听类型变化以控制选项输入的显示
            typeSelect.addEventListener('change', (e) => {
                if (e.target.value === 'select') {
                    optionsInput.style.display = 'block';
                } else {
                    optionsInput.style.display = 'none';
                }
            });
            
            this.columnsContainer.appendChild(columnEl);
        });
    }

    // 移动列
    moveColumn(index, direction) {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < this.columns.length) {
            const temp = this.columns[index];
            this.columns[index] = this.columns[newIndex];
            this.columns[newIndex] = temp;
            this.renderColumns();
            this.previewTable();
        }
    }

    // 更新表格结构JSON
    updateStructure() {
        if (!this.structureTextarea) return;
        
        const structure = {
            columns: this.columns
        };
        
        this.structureTextarea.value = JSON.stringify(structure, null, 2);
        
        // 添加简单的成功提示
        if (this.saveBtn) {
            const originalText = this.saveBtn.innerHTML;
            this.saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i>保存成功';
            this.saveBtn.classList.add('bg-green-600');
            this.saveBtn.classList.remove('bg-blue-600');
            
            setTimeout(() => {
                this.saveBtn.innerHTML = originalText;
                this.saveBtn.classList.remove('bg-green-600');
                this.saveBtn.classList.add('bg-blue-600');
            }, 2000);
        }
    }

    // 预览表格
    previewTable() {
        if (!this.previewContainer) return;
        
        // 清空预览容器
        this.previewContainer.innerHTML = '';
        
        if (this.columns.length === 0) {
            this.previewContainer.innerHTML = '<p class="text-gray-500 text-center py-4">请先添加列</p>';
            return;
        }
        
        // 创建表格预览容器，模拟Excel界面
        const excelContainer = document.createElement('div');
        excelContainer.className = 'bg-gray-100 border border-gray-300 rounded-lg overflow-hidden';
        
        // 创建表格预览标题
        const tableHeader = document.createElement('div');
        tableHeader.className = 'bg-gray-200 px-4 py-2 border-b border-gray-300 font-medium';
        tableHeader.innerHTML = `<i class="fas fa-table mr-2"></i>表格预览（点击表头可编辑列名）`;
        excelContainer.appendChild(tableHeader);
        
        // 创建表格预览
        const table = document.createElement('table');
        table.className = 'min-w-full border-collapse bg-white';
        
        // 创建表头
        const thead = document.createElement('thead');
        thead.className = 'bg-blue-50';
        const headerRow = document.createElement('tr');
        
        // 空单元格，用于Excel左上角
        const cornerTh = document.createElement('th');
        cornerTh.className = 'px-2 py-2 border border-gray-300 bg-gray-200 text-xs text-gray-500';
        cornerTh.textContent = ' ';
        headerRow.appendChild(cornerTh);
        
        // 列字母（如A, B, C）
        this.columns.forEach((column, idx) => {
            const letterTh = document.createElement('th');
            letterTh.className = 'px-2 py-1 border border-gray-300 bg-gray-200 text-xs font-medium text-gray-500 text-center';
            letterTh.textContent = this.getExcelColumnLabel(idx);
            if (column.width) {
                letterTh.style.width = `${column.width}px`;
            }
            headerRow.appendChild(letterTh);
        });
        
        thead.appendChild(headerRow);
        
        // 创建第二行表头（列名）
        const headerRow2 = document.createElement('tr');
        
        // 行号
        const rowNumberTh = document.createElement('th');
        rowNumberTh.className = 'px-2 py-2 border border-gray-300 bg-gray-200 text-xs font-medium text-gray-500 text-center';
        rowNumberTh.textContent = '1';
        headerRow2.appendChild(rowNumberTh);
        
        // 列名
        this.columns.forEach((column, index) => {
            const th = document.createElement('th');
            th.className = 'px-3 py-2 text-left border border-gray-300 text-sm font-medium text-gray-800 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors';
            if (column.width) {
                th.style.width = `${column.width}px`;
            }
            th.textContent = column.name;
            
            // 添加点击编辑列名功能
            th.addEventListener('click', () => this.editColumnNameInPreview(index, th));
            
            // 添加拖拽调整列宽功能
            this.makeResizableColumn(th, index);
            
            headerRow2.appendChild(th);
        });
        
        thead.appendChild(headerRow2);
        table.appendChild(thead);
        
        // 创建表格内容预览
        const tbody = document.createElement('tbody');
        
        // 添加三行示例数据，更接近Excel的预览效果
        for (let rowNum = 0; rowNum < 3; rowNum++) {
            const dataRow = document.createElement('tr');
            dataRow.className = rowNum % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            dataRow.classList.add('hover:bg-blue-50');
            
            // 行号
            const rowNumTd = document.createElement('td');
            rowNumTd.className = 'px-2 py-2 border border-gray-300 bg-gray-200 text-xs font-medium text-gray-500 text-center';
            rowNumTd.textContent = (rowNum + 2).toString();
            dataRow.appendChild(rowNumTd);
            
            // 单元格数据
            this.columns.forEach(column => {
                const td = document.createElement('td');
                td.className = 'px-3 py-2 border border-gray-300 text-sm text-gray-700';
                if (column.width) {
                    td.style.width = `${column.width}px`;
                }
                
                // 根据列类型显示不同的示例内容，增加一些变化使预览更真实
                switch(column.type) {
                    case 'text':
                        td.textContent = rowNum === 0 ? '示例文本' : rowNum === 1 ? '测试数据' : '点击填写内容';
                        break;
                    case 'number':
                        td.textContent = (123 + rowNum).toString();
                        td.style.textAlign = 'right';
                        break;
                    case 'datetime':
                        const date = new Date();
                        date.setDate(date.getDate() + rowNum);
                        td.textContent = date.toLocaleString();
                        break;
                    case 'select':
                        const select = document.createElement('select');
                        select.className = 'border border-gray-300 rounded-md p-1 text-sm w-full';
                        if (column.options && Array.isArray(column.options)) {
                            column.options.forEach((option, optIndex) => {
                                const opt = document.createElement('option');
                                opt.value = option;
                                opt.textContent = option;
                                opt.selected = optIndex === rowNum % column.options.length;
                                select.appendChild(opt);
                            });
                        }
                        td.appendChild(select);
                        break;
                    case 'textarea':
                        const textarea = document.createElement('textarea');
                        textarea.className = 'border border-gray-300 rounded-md p-1 text-sm w-full resize-none';
                        textarea.rows = 1;
                        textarea.textContent = rowNum === 0 ? '这是一段多行文本示例...' : rowNum === 1 ? '可以输入更多内容' : '';
                        td.appendChild(textarea);
                        break;
                    case 'checkbox':
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.className = 'rounded text-blue-600 focus:ring-blue-500 mx-auto';
                        checkbox.checked = rowNum === 0;
                        td.style.textAlign = 'center';
                        td.appendChild(checkbox);
                        break;
                    case 'image':
                        td.innerHTML = '<div class="text-center text-gray-400">[图片]</div>';
                        break;
                    case 'file':
                        td.innerHTML = '<div class="text-center text-blue-600">[点击上传文件]</div>';
                        break;
                    default:
                        td.textContent = '示例';
                }
                
                dataRow.appendChild(td);
            });
            
            tbody.appendChild(dataRow);
        }
        
        table.appendChild(tbody);
        excelContainer.appendChild(table);
        this.previewContainer.appendChild(excelContainer);
    }
    
    // 获取Excel风格的列标签（A, B, C, ... Z, AA, AB等）
    getExcelColumnLabel(index) {
        let label = '';
        let remaining = index;
        
        while (true) {
            const modulo = remaining % 26;
            label = String.fromCharCode(65 + modulo) + label; // 65是'A'的ASCII码
            remaining = Math.floor(remaining / 26) - 1;
            
            if (remaining < 0) {
                break;
            }
        }
        
        return label;
    }
    
    // 在预览表格中编辑列名
    editColumnNameInPreview(index, thElement) {
        const originalName = this.columns[index].name;
        
        // 创建输入框
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalName;
        input.className = 'border border-blue-500 rounded-md px-2 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-300';
        
        // 替换文本为输入框
        thElement.innerHTML = '';
        thElement.appendChild(input);
        
        // 自动聚焦并全选
        input.focus();
        input.select();
        
        // 处理失去焦点和回车键
        const finishEditing = () => {
            const newName = input.value.trim() || originalName;
            this.updateColumn(index, 'name', newName);
        };
        
        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.renderColumns();
                this.previewTable();
            }
        });
    }
    
    // 使列可以调整宽度（类似Excel的拖拽调整列宽）
    makeResizableColumn(column, index) {
        const resizer = document.createElement('div');
        resizer.className = 'absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500';
        resizer.style.opacity = '0';
        
        column.style.position = 'relative';
        column.appendChild(resizer);
        
        let startX, startWidth;
        
        const mouseDownHandler = (e) => {
            startX = e.pageX;
            startWidth = column.offsetWidth;
            
            // 添加临时样式
            resizer.style.opacity = '1';
            document.body.style.cursor = 'col-resize';
            
            // 添加事件监听器
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };
        
        const mouseMoveHandler = (e) => {
            const width = startWidth + (e.pageX - startX);
            if (width > 50) { // 最小宽度限制
                column.style.width = `${width}px`;
                this.columns[index].width = width;
            }
        };
        
        const mouseUpHandler = () => {
            // 移除临时样式
            resizer.style.opacity = '0';
            document.body.style.cursor = '';
            
            // 移除事件监听器
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            
            // 更新结构
            this.updateStructure();
        };
        
        // 添加事件监听
        resizer.addEventListener('mousedown', mouseDownHandler);
        
        // 悬停时显示调整器
        column.addEventListener('mouseenter', () => {
            resizer.style.opacity = '0.5';
        });
        
        column.addEventListener('mouseleave', () => {
            if (!resizer.classList.contains('active')) {
                resizer.style.opacity = '0';
            }
        });
    }
}

// DOM加载完成后初始化表格编辑器
document.addEventListener('DOMContentLoaded', function() {
    const tableEditor = new TableEditor();
});