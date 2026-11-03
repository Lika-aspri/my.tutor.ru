// ==========================================
// ЛОГИКА СТРАНИЦЫ ЗАДАНИЙ (tasks.js)
// ==========================================

window.onload = function() {
    // 1. Проверяем, что зашел ученик
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        window.location.href = '../index.html';
        return;
    }

    // 2. Запускаем отрисовку заданий
    renderTasks(user.login);
};

function renderTasks(studentLogin) {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = ''; // Очищаем экран

    // 3. Получаем ID карточек, которые ВЫДАЛ УЧИТЕЛЬ (из auth.js)
    const assignedIds = getAssignedTasks(studentLogin);

    // Если учитель ничего не выдал
    if (assignedIds.length === 0) {
        container.innerHTML = `
            <div class="empty-tasks">
                <h2>У вас пока нет заданий</h2>
                <p>Учитель скоро выдаст вам карточки для тренировки.</p>
            </div>`;
        return;
    }

    // 4. Фильтруем базу: берем только те задания, которые есть в списке
    const myTasks = tasksDatabase.filter(task => assignedIds.includes(task.id));

    // 5. Группируем по темам (lesson)
    const groups = {};
    myTasks.forEach(task => {
        const lessonName = task.lesson || "Разное";
        if (!groups[lessonName]) groups[lessonName] = [];
        groups[lessonName].push(task);
    });

    // 6. Отрисовываем каждую тему
    for (const [lessonName, tasks] of Object.entries(groups)) {
        const block = document.createElement('div');
        block.className = 'lesson-group';
        block.innerHTML = `<h2 class="lesson-title">📚 Урок: ${lessonName}</h2>`;

        tasks.forEach(task => {
            block.appendChild(createTaskElement(task));
        });

        container.appendChild(block);
    }
}

// Функция создания HTML для одной карточки
function createTaskElement(task) {
    const widget = document.createElement('div');
    widget.className = 'task-widget';
    widget.id = `task-${task.id}`;

    // --- 1. ТЕОРИЯ ---
    if (task.type === 'theory') {
        widget.className = 'theory-card';
        let img = task.imageUrl ? `<img src="${task.imageUrl}" class="theory-image" alt="Схема">` : '';
        widget.innerHTML = `
            <div class="theory-title">💡 ${task.title}</div>
            <div class="theory-text">${task.text}</div>
            ${img}
        `;
        return widget;
    }

    // --- 2. ПРАКТИКА ---
    let html = `<div class="task-question">${task.question}</div>`;

    // Ввод текста (Input) и Исправление (Correction)
    if (task.type === 'input' || task.type === 'correction') {
        html += `
            <input type="text" class="task-input" id="in-${task.id}" placeholder="Введите ответ...">
            <button class="task-btn" onclick="checkInput(${task.id}, '${task.correctAnswer}', '${task.type}')">Проверить</button>
        `;
    } 
    // Выбор варианта (Choice)
    else if (task.type === 'choice') {
        html += `<div class="task-options">`;
        task.options.forEach(opt => {
            html += `<button class="option-btn" onclick="checkChoice(${task.id}, '${opt}', '${task.correctAnswer}', this)">${opt}</button>`;
        });
        html += `</div>`;
    } 
    // Выпадающие списки (Dropdown)
    else if (task.type === 'dropdown') {
        task.items.forEach((item, i) => {
            let sel = `<select class="task-input" id="dd-${task.id}-${i}" style="width:auto; display:inline-block; padding:5px; margin:0 5px;">
                        <option value="">---</option>`;
            item.options.forEach(opt => {
                sel += `<option value="${opt}">${opt}</option>`;
            });
            sel += `</select>`;
            
            const textWithSelect = item.text.replace('___', sel);
            html += `<div style="margin-bottom:15px; font-size:16px;">${textWithSelect}</div>`;
        });
        html += `<button class="task-btn" onclick="checkDropdown(${task.id})">Проверить</button>`;
    } 
    // Галочки (Checkbox)
    else if (task.type === 'checkbox') {
        html += `<div class="task-options">`;
        task.options.forEach((opt, i) => {
            html += `
                <label style="padding:12px; border:1px solid #ddd; border-radius:8px; display:flex; gap:10px; cursor:pointer; align-items:flex-start;">
                    <input type="checkbox" class="cb-${task.id}" value="${i + 1}" style="margin-top:4px; width:18px; height:18px;">
                    <span>${opt}</span>
                </label>
            `;
        });
        html += `</div><button class="task-btn" style="margin-top:15px;" onclick="checkCheckbox(${task.id}, '${task.correctAnswer}')">Проверить</button>`;
    }

    html += `<div class="task-feedback" id="fb-${task.id}"></div>`;
    widget.innerHTML = html;
    return widget;
}

// ==========================================
// ФУНКЦИИ ПРОВЕРКИ ОТВЕТОВ
// ==========================================

// 1. Проверка ввода текста (и исправления ошибок)
function checkInput(id, correctAnswer, type) {
    const input = document.getElementById(`in-${id}`).value.trim().toLowerCase();
    const widget = document.getElementById(`task-${id}`);
    const feedback = document.getElementById(`fb-${id}`);
    const correct = correctAnswer.toLowerCase();

    widget.classList.remove('correct', 'incorrect');

    let isCorrect = (input === correct);
    // Для исправления ошибок: если ученик ввел только правильное слово, тоже засчитываем
    if (type === 'correction' && !isCorrect && correct.includes(input) && input.length > 2) {
        isCorrect = true;
    }

    if (isCorrect) {
        widget.classList.add('correct');
        feedback.innerText = "✅ Верно! Отличная работа.";
    } else {
        widget.classList.add('incorrect');
        feedback.innerText = `❌ Ошибка. Правильный ответ: ${correctAnswer}`;
    }
}

// 2. Проверка выбора варианта
function checkChoice(id, selected, correctAnswer, btn) {
    const widget = document.getElementById(`task-${id}`);
    const feedback = document.getElementById(`fb-${id}`);
    
    widget.classList.remove('correct', 'incorrect');

    if (selected === correctAnswer) {
        widget.classList.add('correct');
        btn.style.borderColor = '#10B981';
        feedback.innerText = "✅ Верно!";
    } else {
        widget.classList.add('incorrect');
        btn.style.borderColor = '#EF4444';
        feedback.innerText = `❌ Ошибка. Правильный ответ: ${correctAnswer}`;
    }
}

// 3. Проверка выпадающих списков
function checkDropdown(id) {
    const task = tasksDatabase.find(t => t.id === id);
    const widget = document.getElementById(`task-${id}`);
    const feedback = document.getElementById(`fb-${id}`);
    let allCorrect = true;

    task.items.forEach((item, i) => {
        const select = document.getElementById(`dd-${id}-${i}`);
        if (select.value !== item.correct) {
            allCorrect = false;
            select.style.borderColor = '#EF4444'; // Красная рамка
        } else {
            select.style.borderColor = '#10B981'; // Зеленая рамка
        }
    });

    widget.classList.remove('correct', 'incorrect');
    if (allCorrect) {
        widget.classList.add('correct');
        feedback.innerText = "✅ Все ответы верны!";
    } else {
        widget.classList.add('incorrect');
        feedback.innerText = "❌ Есть ошибки. Проверьте выделенные списки.";
    }
}

// 4. Проверка галочек (Checkbox)
function checkCheckbox(id, correctAnswerStr) {
    const widget = document.getElementById(`task-${id}`);
    const feedback = document.getElementById(`fb-${id}`);
    const checkboxes = document.querySelectorAll(`.cb-${id}`);
    
    let selected = [];
    checkboxes.forEach(cb => {
        if (cb.checked) selected.push(cb.value);
    });
    
    // Сортируем и объединяем в строку (например "1,3" превращается в "13")
    const userAnswer = selected.sort().join('');
    const correct = correctAnswerStr.split('').sort().join('');

    widget.classList.remove('correct', 'incorrect');
    if (userAnswer === correct) {
        widget.classList.add('correct');
        feedback.innerText = "✅ Верно!";
    } else {
        widget.classList.add('incorrect');
        feedback.innerText = `❌ Ошибка. Правильные варианты: ${correctAnswerStr}`;
    }
}