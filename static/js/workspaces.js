document.addEventListener("DOMContentLoaded", () => {
    // === Показать все пространства ===
    document.querySelector(".icons img[src*='ellipsis']")?.addEventListener("click", () => {
        alert("Открыть список всех пространств (будет модалка)");
    });

    // === Поиск пространств ===
    document.querySelector(".icons img[src*='search']")?.addEventListener("click", () => {
        const search = prompt("Введите название пространства для поиска:");
        if (search) {
            alert(`Поиск пространства: ${search}`);
            // TODO: добавить поиск по DOM или отправку на сервер
        }
    });

    // === Пригласить пользователя в пространство ===
    document.querySelectorAll(".team .icons_right .add_btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const email = prompt("Введите email для приглашения в пространство:");
            if (email) {
                alert(`Отправлено приглашение на ${email}`);
                // TODO: отправка на бэкенд через fetch('/api/invite', { method: 'POST', ... })
            }
        });
    });

    // === Показать/скрыть проекты в пространстве ===
    document.querySelectorAll(".team .icons_right button:first-child").forEach((btn) => {
        btn.addEventListener("click", () => {
            alert("Открыть список проектов (развернуть)");
            // TODO: добавить/удалить элемент со списком проектов
        });
    });

    // === Добавить элемент внутрь проекта ===
    document.querySelectorAll(".projects .icons_right button:last-child").forEach((btn) => {
        btn.addEventListener("click", () => {
            alert("Открыть форму создания заметки или файла в проекте");
            // TODO: отобразить модалку или redirect в редактор
        });
    });

    // === Создание нового пространства ===
    document.querySelector(".every_txt")?.addEventListener("click", () => {
        const name = prompt("Введите название нового пространства:");
        if (name) {
            alert(`Создано новое пространство: ${name}`);
            // TODO: отправка на сервер и перерендер списка
        }
    });
});

// === Показать/скрыть проекты в пространстве ===
document.querySelectorAll(".team .icons_right button:first-child").forEach((btn) => {
    btn.addEventListener("click", () => {
        const teamBlock = btn.closest(".team");
        const projectList = teamBlock.nextElementSibling;
        if (projectList && projectList.classList.contains("project_list")) {
            projectList.classList.toggle("hidden");
        }
    });
});

