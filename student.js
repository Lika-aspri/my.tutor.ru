// ==========================================
// ЛОГИКА КАБИНЕТА УЧЕНИКА (student.js)
// ==========================================

window.onload = function() {
    // 1. Проверяем, что зашел именно ученик
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        window.location.href = '../index.html';
        return;
    }

    // 2. Подставляем имя и уровень ученика в интерфейс
    document.getElementById('studentName').innerText = `Привет, ${user.name}!`;
    document.getElementById('studentLevel').innerText = user.subject;

    // 3. Проверяем, выдал ли учитель ссылку на видеоурок
    // (Мы используем функцию getMeetLink, которую добавим в auth.js)
    const meetLink = getMeetLink(user.login);
    const meetBtn = document.getElementById('meetBtn');

    if (meetLink) {
        // Если ссылка есть, делаем кнопку активной
        meetBtn.href = meetLink;
        meetBtn.target = "_blank";
        meetBtn.style.opacity = "1";
        meetBtn.style.cursor = "pointer";
        meetBtn.style.background = "#4F46E5";
        meetBtn.style.color = "white";
        meetBtn.innerText = "🎥 Подключиться к уроку";
    } else {
        // Если ссылки нет, оставляем кнопку неактивной
        meetBtn.innerText = "Ссылка появится позже";
    }
};

// Функция выхода из системы
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}