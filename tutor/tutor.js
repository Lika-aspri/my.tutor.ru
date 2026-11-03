// ==========================================
// ЛОГИКА КАБИНЕТА УЧИТЕЛЯ (tutor.js)
// ==========================================

// 1. Проверяем авторизацию при загрузке страницы
window.onload = function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    // Если зашел не учитель — выкидываем на главную
    if (!user || user.role !== 'tutor') {
        window.location.href = '../index.html';
        return;
    }
    
    // Если всё ок — рисуем список учеников
    renderStudents();
};

// 2. Функция отрисовки списка учеников
function renderStudents() {
    // Получаем массив учеников из базы данных (auth.js)
    const students = getStudents(); 
    const container = document.getElementById('studentsList');
    
    // Очищаем контейнер перед новой отрисовкой
    container.innerHTML = ''; 

    // Если учеников нет, показываем заглушку
    if (students.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #6B7280;">
                <h3 style="margin-bottom: 10px;">У вас пока нет учеников</h3>
                <p>Нажмите «+ Добавить ученика», чтобы создать первый аккаунт.</p>
            </div>`;
        return;
    }

    // Если ученики есть, выводим их карточки
    container.innerHTML = students.map(s => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #E5E7EB;">
            <div>
                <div style="font-weight: 700; font-size: 18px; margin-bottom: 5px; color: #111827;">
                    ${s.name} 
                    <span style="background: #E0E7FF; color: #4338CA; padding: 3px 10px; border-radius: 6px; font-size: 12px; margin-left: 10px;">${s.subject}</span>
                </div>
                <div style="font-size: 14px; color: #6B7280;">
                    Логин: <b style="color: #374151;">${s.login}</b> | Пароль: <b style="color: #374151;">${s.password}</b>
                </div>
            </div>
            <button onclick="deleteStudent('${s.login}')" style="background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s;" onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FEF2F2'">
                Удалить
            </button>
        </div>
    `).join('');
}

// 3. Функция удаления ученика
function deleteStudent(login) {
    // Спрашиваем подтверждение, чтобы случайно не удалить
    if (confirm(`Вы уверены, что хотите удалить ученика (${login}) и все его данные?`)) {
        removeStudent(login); // Вызываем функцию из auth.js
        renderStudents(); // Перерисовываем список, чтобы удаленный исчез
    }
}

// 4. Функция выхода из системы
function logout() {
    localStorage.removeItem('currentUser'); // Удаляем данные о текущем пользователе
    window.location.href = '../index.html'; // Отправляем на страницу входа
}