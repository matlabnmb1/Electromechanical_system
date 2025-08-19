/* Excel风格表格填写界面 */

class ExcelStyleForm {
    constructor(templateStructure, initialData = [{}]) {
        this.templateStructure = templateStructure;
        this.data = Array.isArray(initialData) ? initialData : [initialData]; // 确保是数组格式
        this.init();
    }

    init() {
        // 获取DOM元素
        this.container = document.getElementById('table-fields');
        this.dataInput = document.getElementById('data');
        this.form = this.container.closest('form');
        
        // 渲染Excel风格表格
        this.renderExcelTable();
        
        // 绑定表单提交事件
        if (this.form) {
            this.form.addEventListener('submit', () => {
                this.updateHiddenDataField();
            });
        }
        
        // 初始化数据字段
        this.updateHiddenDataField();
    }

    // 渲染Excel风格表格
    renderExcelTable() {
        if (!this.container || !this.templateStructure || !this.templateStructure.columns) {
            console.error('无法渲染表格：缺少必要元素或数据');
            return;
        }

        // 清空容器
        while (this.container.firstChild) {
            if (this.container.firstChild === this.dataInput) {
                break;
            }
            this.container.removeChild(this.container.firstChild);
        }

        // 创建表格容器
        const tableContainer = document.createElement('div');
        tableContainer.className = 'overflow-x-auto';
        
        // 创建表格
        const table = document.createElement('table');
        table.className = 'min-w-full border-collapse bg-white shadow-sm excel-table';
        
        // 创建表头
        const thead = document.createElement('thead');
        
        const headerRow = document.createElement('tr');
        
        // 添加操作列头
        const actionTh = document.createElement('th');
        actionTh.className = 'px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider border border-blue-700';
        actionTh.textContent = '操作';
        headerRow.appendChild(actionTh);
        
        // 添加行号列头
        const cornerTh = document.createElement('th');
        cornerTh.className = 'px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider border border-blue-700';
        cornerTh.textContent = '#';
        headerRow.appendChild(cornerTh);
        
        // 添加数据列头
        this.templateStructure.columns.forEach((column, index) => {
            const th = document.createElement('th');
            th.className = 'px-3 py-2 text-left text-xs font-medium text-white uppercase tracking-wider border border-blue-700';
            th.textContent = column.name;
            
            // 如果有必填标记
            if (column.required) {
                const requiredMark = document.createElement('span');
                requiredMark.className = 'text-red-300 ml-1';
                requiredMark.textContent = '*';
                th.appendChild(requiredMark);
            }
            
            // 设置列宽
            if (column.width) {
                th.style.width = `${column.width}px`;
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 创建表格主体
        const tbody = document.createElement('tbody');
        
        // 创建数据行
        this.data.forEach((rowData, index) => {
            this.createDataRow(tbody, rowData, index);
        });
        
        table.appendChild(tbody);
        tableContainer.appendChild(table);
        
        // 添加添加新行按钮
        this.addAddRowButton(tableContainer);
        
        // 将表格容器添加到页面，放在数据输入字段前面
        this.container.insertBefore(tableContainer, this.dataInput);
    }

    // 添加新行按钮
    addAddRowButton(container) {
        const addRowBtn = document.createElement('button');
        addRowBtn.type = 'button';
        addRowBtn.className = 'mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors';
        addRowBtn.textContent = '添加新行';
        addRowBtn.addEventListener('click', () => this.addNewRow());
        container.appendChild(addRowBtn);
    }

    // 添加新行
    addNewRow() {
        // 创建新的空数据行
        const newRowData = {};
        this.data.push(newRowData);

        // 获取表格主体
        const tbody = document.querySelector('.excel-table tbody');
        
        // 创建新的数据行
        this.createDataRow(tbody, newRowData, this.data.length - 1);
    }

    // 删除行
    deleteRow(rowIndex) {
        // 至少保留一行数据
        if (this.data.length <= 1) {
            return;
        }
        
        // 从数据中移除
        this.data.splice(rowIndex, 1);
        
        // 重新渲染表格
        this.renderExcelTable();
    }

    // 创建数据行
    createDataRow(tbody, rowData, rowIndex) {
        const dataRow = document.createElement('tr');
        dataRow.dataset.index = rowIndex;
        
        // 添加操作单元格（删除按钮）
        const actionTd = document.createElement('td');
        actionTd.className = 'px-3 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-200';
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'text-red-500 hover:text-red-700 transition-colors';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> 删除';
        deleteBtn.addEventListener('click', () => this.deleteRow(rowIndex));
        actionTd.appendChild(deleteBtn);
        dataRow.appendChild(actionTd);
        
        // 添加行号
        const rowNumTd = document.createElement('td');
        rowNumTd.className = 'px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-200';
        rowNumTd.textContent = (rowIndex + 1).toString();
        dataRow.appendChild(rowNumTd);
        
        // 添加数据单元格
        this.templateStructure.columns.forEach(column => {
            const td = document.createElement('td');
            td.className = 'px-3 py-2 whitespace-nowrap text-sm text-gray-500 border border-gray-200';
            
            // 设置列宽
            if (column.width) {
                td.style.width = `${column.width}px`;
            }
            
            // 根据列类型创建不同的输入控件
            this.createInputControl(column, td, rowData, rowIndex);
            
            dataRow.appendChild(td);
        });
        
        tbody.appendChild(dataRow);
    }

    // 创建输入控件
    createInputControl(column, td, rowData, rowIndex) {
        let input;
        const currentValue = rowData[column.name] || '';
        
        switch (column.type) {
            case 'text':
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'excel-input';
                input.value = currentValue;
                input.addEventListener('input', (e) => this.updateData(rowIndex, column.name, e.target.value));
                break;
            
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.className = 'excel-input text-right';
                input.value = currentValue;
                input.addEventListener('input', (e) => this.updateData(rowIndex, column.name, e.target.value));
                break;
            
            case 'datetime':
                input = document.createElement('input');
                input.type = 'datetime-local';
                input.className = 'excel-input';
                input.value = currentValue;
                input.addEventListener('input', (e) => this.updateData(rowIndex, column.name, e.target.value));
                break;
            
            case 'select':
                input = document.createElement('select');
                input.className = 'excel-select';
                
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '请选择';
                input.appendChild(defaultOption);
                
                if (column.options && Array.isArray(column.options)) {
                    column.options.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option;
                        opt.textContent = option;
                        if (currentValue === option) {
                            opt.selected = true;
                        }
                        input.appendChild(opt);
                    });
                }
                
                input.addEventListener('change', (e) => this.updateData(rowIndex, column.name, e.target.value));
                break;
            
            case 'textarea':
                input = document.createElement('textarea');
                input.rows = 1;
                input.className = 'excel-textarea';
                input.value = currentValue;
                input.addEventListener('input', (e) => {
                    // 自动调整文本框高度
                    e.target.style.height = 'auto';
                    e.target.style.height = (e.target.scrollHeight) + 'px';
                    this.updateData(rowIndex, column.name, e.target.value);
                });
                
                // 初始化高度
                input.style.height = 'auto';
                input.style.height = (input.scrollHeight) + 'px';
                break;
            
            case 'checkbox':
                const checkboxContainer = document.createElement('div');
                checkboxContainer.className = 'flex items-center justify-center';
                
                input = document.createElement('input');
                input.type = 'checkbox';
                input.className = 'excel-checkbox';
                input.checked = !!currentValue;
                input.addEventListener('change', (e) => this.updateData(rowIndex, column.name, e.target.checked));
                
                checkboxContainer.appendChild(input);
                td.appendChild(checkboxContainer);
                return; // 提前返回，因为已经添加了控件
            
            case 'image':
                // 图片上传预览控件
                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-preview-container';
                
                // 预览区域
                const preview = document.createElement('div');
                preview.className = 'image-preview';
                
                if (currentValue) {
                    const img = document.createElement('img');
                    img.src = currentValue;
                    img.className = 'max-w-full max-h-full object-contain';
                    preview.appendChild(img);
                } else {
                    const placeholder = document.createElement('span');
                    placeholder.className = 'text-gray-400 text-sm';
                    placeholder.textContent = '预览区域';
                    preview.appendChild(placeholder);
                }
                
                // 文件上传控件
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                
                // 上传按钮
                const uploadBtn = document.createElement('button');
                uploadBtn.type = 'button';
                uploadBtn.className = 'text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors';
                uploadBtn.textContent = '上传图片';
                uploadBtn.addEventListener('click', () => fileInput.click());
                
                // 监听文件上传
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            // 这里仅作预览，实际项目中应该上传到服务器
                            preview.innerHTML = '';
                            const img = document.createElement('img');
                            img.src = event.target.result;
                            img.className = 'max-w-full max-h-full object-contain';
                            preview.appendChild(img);
                            this.updateData(rowIndex, column.name, event.target.result);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                    }
                });
                
                imageContainer.appendChild(preview);
                imageContainer.appendChild(fileInput);
                imageContainer.appendChild(uploadBtn);
                td.appendChild(imageContainer);
                return; // 提前返回，因为已经添加了控件
            
            case 'file':
                // 文件上传控件
                const fileContainer = document.createElement('div');
                fileContainer.className = 'flex flex-col items-center';
                
                // 文件名显示
                const fileNameDisplay = document.createElement('div');
                fileNameDisplay.className = 'w-full text-center mb-2 text-sm text-gray-700 truncate';
                fileNameDisplay.textContent = currentValue ? '已上传文件' : '未上传文件';
                
                // 文件上传控件
                const fileInputEl = document.createElement('input');
                fileInputEl.type = 'file';
                fileInputEl.style.display = 'none';
                
                // 上传按钮
                const fileUploadBtn = document.createElement('button');
                fileUploadBtn.type = 'button';
                fileUploadBtn.className = 'text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors';
                fileUploadBtn.textContent = '上传文件';
                fileUploadBtn.addEventListener('click', () => fileInputEl.click());
                
                // 监听文件上传
                fileInputEl.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        // 这里仅作演示，实际项目中应该上传到服务器
                        fileNameDisplay.textContent = e.target.files[0].name;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            this.updateData(rowIndex, column.name, event.target.result);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                    }
                });
                
                fileContainer.appendChild(fileNameDisplay);
                fileContainer.appendChild(fileInputEl);
                fileContainer.appendChild(fileUploadBtn);
                td.appendChild(fileContainer);
                return; // 提前返回，因为已经添加了控件
            
            default:
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'excel-input';
                input.value = currentValue;
                input.addEventListener('input', (e) => this.updateData(rowIndex, column.name, e.target.value));
        }
        
        // 添加输入控件到单元格
        if (input) {
            td.appendChild(input);
        }
    }

    // 更新数据
    updateData(rowIndex, fieldName, value) {
        this.data[rowIndex][fieldName] = value;
        this.updateHiddenDataField();
    }

    // 更新隐藏的数据字段
    updateHiddenDataField() {
        if (this.dataInput) {
            this.dataInput.value = JSON.stringify(this.data);
        }
    }

    // 初始化
    init() {
        // 获取DOM元素
        this.container = document.getElementById('table-fields');
        this.dataInput = document.getElementById('data');
        this.form = this.container ? this.container.closest('form') : null;
        
        // 如果找不到必要元素，尝试备选方案
        if (!this.container || !this.dataInput) {
            this.container = document.getElementById('excel_form_container') || document.body;
            this.dataInput = document.getElementById('record_data') || document.createElement('input');
            if (!this.dataInput.id) {
                this.dataInput.id = 'record_data';
                this.dataInput.type = 'hidden';
                this.dataInput.name = 'record_data';
                this.container.appendChild(this.dataInput);
            }
        }
        
        // 渲染Excel风格表格
        this.renderExcelTable();
        
        // 绑定表单提交事件
        if (this.form) {
            this.form.addEventListener('submit', () => {
                this.updateHiddenDataField();
            });
        }
        
        // 初始化数据字段
        this.updateHiddenDataField();
    }
}

// DOM加载完成后初始化Excel风格表单
function initExcelStyleForm() {
    // 等待DOM完全加载
    document.addEventListener('DOMContentLoaded', function() {
        // 检查是否有模板结构数据
        if (window.templateStructure) {
            // 检查是否有记录数据（编辑页面）
            // 确保initialData是数组格式
            const initialData = Array.isArray(window.recordData) ? window.recordData : (window.recordData ? [window.recordData] : [{}]);
            
            try {
                // 创建Excel风格表单
                const excelForm = new ExcelStyleForm(window.templateStructure, initialData);
                
                // 暴露到全局，方便调试
                window.excelForm = excelForm;
            } catch (error) {
                console.error('初始化Excel风格表单失败:', error);
                // 显示错误信息给用户
                const errorContainer = document.createElement('div');
                errorContainer.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4';
                errorContainer.innerHTML = `
                    <strong class="font-bold">错误:</strong>
                    <span class="block sm:inline"> 表格加载失败，请刷新页面重试。</span>
                `;
                document.body.appendChild(errorContainer);
            }
        }
    });
}

// 初始化
initExcelStyleForm();