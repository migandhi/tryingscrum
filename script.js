document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('addTask');
    const exportBtn = document.getElementById('exportBoard');
    const importBtn = document.getElementById('importBtn');
    const importInput = document.getElementById('importBoard');

    let draggedTask = null;

    function createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.setAttribute('draggable', 'true');
        taskElement.dataset.id = task.id;

        taskElement.innerHTML = `
            <p>${task.title}</p>
            <div class="description">${task.description}</div>
            <div class="edit-delete-btns">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;

        taskElement.addEventListener('dragstart', handleDragStart);
        taskElement.addEventListener('dragend', handleDragEnd);

        taskElement.querySelector('.edit-btn').addEventListener('click', () => editTask(taskElement, task));
        taskElement.querySelector('.delete-btn').addEventListener('click', () => deleteTask(taskElement));

        return taskElement;
    }

    function addTaskToColumn(columnId, task) {
        const column = document.getElementById(columnId);
        if (column) {
            const tasksContainer = column.querySelector('.tasks');
            const taskElement = createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        }
    }

    addTaskBtn.addEventListener('click', () => {
        const title = prompt('Enter task title:');
        if (title) {
            const description = prompt('Enter task description:');
            const newTask = {
                id: `task-${Date.now()}`,
                title: title,
                description: description
            };
            addTaskToColumn('product-backlog', newTask);
        }
    });

    function editTask(taskElement, task) {
        const newTitle = prompt('Enter new title:', task.title);
        if (newTitle) {
            task.title = newTitle;
            taskElement.querySelector('p').textContent = newTitle;
        }

        const newDescription = prompt('Enter new description:', task.description);
        if (newDescription) {
            task.description = newDescription;
            taskElement.querySelector('.description').textContent = newDescription;
        }
    }

    function deleteTask(taskElement) {
        if (confirm('Are you sure you want to delete this task?')) {
            taskElement.remove();
        }
    }

    function handleDragStart(e) {
        draggedTask = e.target;
        setTimeout(() => {
            e.target.classList.add('dragging');
        }, 0);
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        draggedTask = null;
    }

    window.allowDrop = function(e) {
        e.preventDefault();
    }

    window.drop = function(e) {
        e.preventDefault();
        const column = e.target.closest('.column');
        if (column && draggedTask) {
            const tasksContainer = column.querySelector('.tasks');
            tasksContainer.appendChild(draggedTask);
        }
    }

    exportBtn.addEventListener('click', () => {
        const boardData = {
            columns: []
        };

        document.querySelectorAll('.column').forEach(column => {
            const columnData = {
                id: column.id,
                tasks: []
            };

            column.querySelectorAll('.task').forEach(taskElement => {
                const taskData = {
                    id: taskElement.dataset.id,
                    title: taskElement.querySelector('p').textContent,
                    description: taskElement.querySelector('.description').textContent
                };
                columnData.tasks.push(taskData);
            });
            boardData.columns.push(columnData);
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(boardData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "board.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    importBtn.addEventListener('click', () => {
        importInput.click();
    });

    importInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const boardData = JSON.parse(e.target.result);
                    // Clear existing board
                    document.querySelectorAll('.tasks').forEach(tasksContainer => tasksContainer.innerHTML = '');
                    // Load new data
                    boardData.columns.forEach(columnData => {
                        columnData.tasks.forEach(taskData => {
                            addTaskToColumn(columnData.id, taskData);
                        });
                    });
                } catch (error) {
                    alert('Error importing board: Invalid JSON file.');
                    console.error('Error parsing JSON:', error);
                }
            };
            reader.readAsText(file);
        }
    });

});