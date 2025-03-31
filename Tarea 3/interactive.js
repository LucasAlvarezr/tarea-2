// Selección de elementos
const taskInput = document.querySelector('.task-input');
const addButton = document.querySelector('.category.add');
const tasksWrapper = document.querySelector('.tasks');
const clearCompletedButton = document.querySelector('.clear');

// Función para agregar el ícono de eliminar a una tarea
function addDeleteIcon(taskDiv) {
    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'tacho de basura.png'; // Ruta de la imagen
    deleteIcon.alt = 'Eliminar tarea';
    deleteIcon.classList.add('delete-icon');
    deleteIcon.addEventListener('click', () => {
        tasksWrapper.removeChild(taskDiv); // Elimina la tarea al hacer clic en el ícono
    });
    taskDiv.appendChild(deleteIcon); // Agregar el ícono al final de la tarea
}

// Función para inicializar las tareas existentes
function initializeExistingTasks() {
    const existingTasks = document.querySelectorAll('.task'); // Selecciona todas las tareas existentes
    existingTasks.forEach(taskDiv => {
        addDeleteIcon(taskDiv); // Agrega el ícono de eliminar a cada tarea

        // Agregar funcionalidad de completar/descompletar a las tareas existentes
        const statusCircle = taskDiv.querySelector('.status-circle');
        const taskTextNode = taskDiv.childNodes[1]; // El texto de la tarea
        statusCircle.addEventListener('click', () => {
            taskDiv.classList.toggle('completed');
            statusCircle.classList.toggle('completed-circle');
            statusCircle.textContent = taskDiv.classList.contains('completed') ? '✔' : '';
            taskTextNode.classList.toggle('task-completed'); // Tachar o destachar el texto
        });
    });
}

// Función para agregar una nueva tarea
function addTask(taskText) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');

    const statusCircle = document.createElement('span');
    statusCircle.classList.add('status-circle', 'pending-circle');
    statusCircle.addEventListener('click', () => {
        taskDiv.classList.toggle('completed');
        statusCircle.classList.toggle('completed-circle');
        statusCircle.textContent = taskDiv.classList.contains('completed') ? '✔' : '';
        taskTextNode.classList.toggle('task-completed'); // Tachar o destachar el texto
    });

    const taskTextNode = document.createElement('span'); // Cambiado a <span> para aplicar estilos
    taskTextNode.textContent = taskText;

    taskDiv.appendChild(statusCircle);
    taskDiv.appendChild(taskTextNode);

    addDeleteIcon(taskDiv); // Agregar el ícono de eliminar a la nueva tarea

    tasksWrapper.appendChild(taskDiv);
    tasksWrapper.appendChild(clearCompletedButton); // Mover el botón "Clear completed" al final
}

// Función para manejar el evento de agregar tarea
function handleAddTask(event) {
    if (event.type === 'click' || (event.type === 'keypress' && event.key === 'Enter')) {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        addTask(taskText);
        taskInput.value = '';
    }
}

// Inicializar las tareas existentes al cargar la página
initializeExistingTasks();

// Eventos para agregar tareas
addButton.addEventListener('click', handleAddTask);
taskInput.addEventListener('keypress', handleAddTask);

// Evento para eliminar todas las tareas completadas
clearCompletedButton.addEventListener('click', () => {
    const completedTasks = document.querySelectorAll('.task.completed');
    completedTasks.forEach(task => task.remove());
});