// ==========================================
// БАЗА ДАННЫХ ПЛАТФОРМЫ (auth.js)
// ==========================================

// 1. УМНАЯ ОЧИСТКА СТАРОЙ БАЗЫ
// Если в памяти браузера застрял старый 'admin', мы принудительно всё стираем,
// чтобы вы могли зайти под своим новым паролем.
let currentUsers = JSON.parse(localStorage.getItem('users'));
if (currentUsers && currentUsers.some(u => u.login === 'admin')) {
    console.log("Обнаружена старая база. Очищаем данные для обновления...");
    localStorage.clear(); 
}

// 2. ИНИЦИАЛИЗАЦИЯ ПОЛЬЗОВАТЕЛЕЙ
// Если база пустая, создаем ваш аккаунт учителя
if (!localStorage.getItem('users')) {
    const initialUsers = [
        { 
            login: 'Nika1', 
            password: '1234spear', 
            role: 'tutor', 
            name: 'Учитель' 
        }
    ];
    localStorage.setItem('users', JSON.stringify(initialUsers));
}

// 3. ИНИЦИАЛИЗАЦИЯ БАЗЫ ЗАДАНИЙ И ССЫЛОК
if (!localStorage.getItem('assignedTasks')) {
    localStorage.setItem('assignedTasks', JSON.stringify({}));
}
if (!localStorage.getItem('meetLinks')) {
    localStorage.setItem('meetLinks', JSON.stringify({}));
}

// ==========================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ
// ==========================================

// Авторизация (вход в систему)
function authenticate(login, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    return users.find(u => u.login === login && u.password === password);
}

// Получить список всех учеников (для кабинета учителя)
function getStudents() {
    const users = JSON.parse(localStorage.getItem('users'));
    return users.filter(u => u.role === 'student');
}

// Создать нового ученика
function createStudent(name, login, password, language) {
    let users = JSON.parse(localStorage.getItem('users'));
    
    // Проверяем, не занят ли логин
    if (users.find(u => u.login === login)) {
        return { success: false, message: 'Этот логин уже занят другим учеником!' };
    }

    // Добавляем ученика
    users.push({ 
        login: login, 
        password: password, 
        role: 'student', 
        name: name, 
        subject: language 
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true };
}

// Удалить ученика (и все его данные)
function removeStudent(login) {
    let users = JSON.parse(localStorage.getItem('users'));
    users = users.filter(u => u.login !== login);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Удаляем его задания
    let assigned = JSON.parse(localStorage.getItem('assignedTasks'));
    delete assigned[login];
    localStorage.setItem('assignedTasks', JSON.stringify(assigned));

    // Удаляем его ссылки на Meet
    let links = JSON.parse(localStorage.getItem('meetLinks'));
    delete links[login];
    localStorage.setItem('meetLinks', JSON.stringify(links));
}

// ==========================================
// ФУНКЦИИ ДЛЯ ВЫДАЧИ ЗАДАНИЙ
// ==========================================

// Сохранить выбранные карточки для конкретного ученика
function assignTasksToStudent(login, taskIds) {
    let assigned = JSON.parse(localStorage.getItem('assignedTasks'));
    assigned[login] = taskIds; 
    localStorage.setItem('assignedTasks', JSON.stringify(assigned));
}

// Получить список выданных карточек для ученика
function getAssignedTasks(login) {
    const assigned = JSON.parse(localStorage.getItem('assignedTasks'));
    return assigned[login] || []; 
}

// ==========================================
// ФУНКЦИИ ДЛЯ ССЫЛОК НА УРОК (GOOGLE MEET / ZOOM)
// ==========================================

// Сохранить ссылку на урок для ученика
function saveMeetLink(login, link) {
    let links = JSON.parse(localStorage.getItem('meetLinks'));
    links[login] = link;
    localStorage.setItem('meetLinks', JSON.stringify(links));
}

// Получить ссылку на урок
function getMeetLink(login) {
    const links = JSON.parse(localStorage.getItem('meetLinks'));
    return links[login] || null;
}