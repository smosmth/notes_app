// --- Инициализация элементов DOM ---
const addBtns = document.querySelectorAll(".cont_add");
const saveBtn = document.querySelector(".textarea_save");
const listItems = document.querySelector(".list_items");
const selectedItem = document.querySelector(".selected_item");
const backBtn = document.querySelector(".back_btn");
const titleList = document.querySelector(".title_info");
const countTask = document.querySelector(".count_task");
const content = document.querySelector(".add_content");
const val = document.getElementById("textarea-info");
const fileInput = document.getElementById("fileInput");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Функция сохранения в localStorage
function saveToStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Функция отображения списка задач
function renderList() {
  listItems.innerHTML = "";
  titleList.innerHTML = "";
  countTask.innerHTML = "";

  tasks.forEach((task, index) => {
    listItems.innerHTML += `
      <div class="main_list_item" data-index="${index}">
        <div class="main_list_item-1">
          <div class="list_index">
            <div class="list_index-txt">Task ${index + 1}</div>
          </div>
          <h2 class="list_title">${task.title}</h2>
          <p class="list_descr">${task.subtitle}</p>
        </div>
        <button class="delete_btn" data-index="${index}">Delete</button>
      </div>
    `;

    titleList.innerHTML += `
      <div class="title_item">
        <img class="title_item-icon" src="img/main_img/cu-3-icon-sidebar-doc1.svg">
        <h2 class="title_item-text">${task.title}</h2>
      </div>
    `;
  });

  countTask.innerHTML = `<div>Count ${tasks.length}</div>`;

  document.querySelectorAll(".main_list_item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const index = item.getAttribute("data-index");
      if (e.target.classList.contains("delete_btn")) {
        deleteTask(index);
      } else {
        showSelectedItem(index);
      }
    });
  });
}

// Функция удаления задачи
function deleteTask(index) {
  index = parseInt(index);
  if (index >= 0 && index < tasks.length) {
    tasks.splice(index, 1);
    saveToStorage();
    renderList();
  }
}

// Функция отображения выбранной задачи
function showSelectedItem(index) {
  const task = tasks[index];

  listItems.style.display = "none";
  selectedItem.style.display = "block";
  backBtn.style.display = "block";

  selectedItem.innerHTML = `
    <h2 class="edit_task">Edit a task</h2>
    <div class="edit_title">
      <div>Title:</div>
      <input type="text" id="editTitle" value="${task.title}">
    </div>
    <div class="edit_title">
      <div>Info:</div>
      <textarea id="editSubtitle">${task.subtitle}</textarea>
    </div>
    <button id="saveEditBtn">Save changes</button>
  `;

  document.getElementById("saveEditBtn").addEventListener("click", () => {
    saveEditedItem(index);
  });
}

// Функция сохранения изменений задачи
function saveEditedItem(index) {
  const newTitle = document.getElementById("editTitle").value.trim();
  const newSubtitle = document.getElementById("editSubtitle").value.trim();

  if (newTitle) {
    tasks[index] = { title: newTitle, subtitle: newSubtitle };
    saveToStorage();
    renderList();
    selectedItem.style.display = "none";
    backBtn.style.display = "none";
    listItems.style.display = "block";
  } else {
    alert("Заголовок не может быть пустым.");
  }
}

// Обработчик кнопки "Назад"
if (backBtn) {
  backBtn.addEventListener("click", () => {
    selectedItem.style.display = "none";
    backBtn.style.display = "none";
    listItems.style.display = "block";
  });
}

// Функция для отправки заметки на сервер
function addNoteToServer(title, subtitle) {
  const noteData = {
    title: title,
    content: subtitle || ""
  };

  fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(noteData)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Заметка добавлена на сервер:", data);
      // Если заметка успешно добавлена, можно обновить интерфейс или список
      tasks.push(data); // Добавить новую заметку в локальный список
      saveToStorage(); // Сохранить обновленный список в localStorage
      renderList(); // Перерисовать список заметок
      content.style.display = "none"; // Скрыть форму добавления заметки
    })
    .catch((error) => {
      console.error("Ошибка при добавлении заметки:", error);
    });
}

// Обработчик кнопки "Сохранить" для добавления заметки
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    const inputText = val.value.trim();
    if (inputText) {
      const [title, subtitle] = inputText.split("\n");

      // Отправка заметки на сервер
      addNoteToServer(title || "Untitled", subtitle || "");

      val.value = ""; // Очистить поле ввода
    } else {
      alert("Введите текст в формате: заголовок и подзаголовок через новую строку.");
    }
  });
}

// Обработчик кнопки "Добавить заметку"
if (addBtns.length > 0) {
  addBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      content.style.display = "block";
    });
  });
}

// Функция для загрузки заметок с сервера
function loadNotesFromServer() {
  fetch("/api/notes", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("authToken")}` // Токен из localStorage или cookies
    }
  })
    .then((response) => response.json())
    .then((data) => {
      tasks = data; // Заменить текущие задачи на те, что пришли с сервера
      renderList(); // Перерисовать список задач
    })
    .catch((error) => {
      console.error("Ошибка при загрузке заметок:", error);
    });
}

// Функция для авторизации пользователя
function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("authToken", data.token); // Сохраняем токен в localStorage
        loadNotesFromServer(); // Загружаем заметки после входа
      } else {
        alert("Ошибка авторизации");
      }
    })
    .catch((error) => {
      console.error("Ошибка авторизации:", error);
    });
}

// DRAG & DROP
const dragItems = document.querySelectorAll(".drag_item");
dragItems.forEach((zone) => {
  const zoneId = zone.getAttribute("data-zone");
  const fileList = document.getElementById(`fileList${zoneId}`);

  zone.addEventListener("click", () => {
    fileInput.setAttribute("data-active-zone", zoneId);
    fileInput.click();
  });

  zone.addEventListener("dragover", (event) => {
    event.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => {
    zone.classList.remove("dragover");
  });

  zone.addEventListener("drop", (event) => {
    event.preventDefault();
    zone.classList.remove("dragover");
    handleFiles(event.dataTransfer.files, fileList);
  });
});

if (fileInput) {
  fileInput.addEventListener("change", () => {
    const activeZone = fileInput.getAttribute("data-active-zone");
    const fileList = document.getElementById(`fileList${activeZone}`);
    handleFiles(fileInput.files, fileList);
  });
}

function handleFiles(files, fileList) {
  fileList.innerHTML = "";
  Array.from(files).forEach((file) => {
    const fileItem = document.createElement("div");
    fileItem.classList.add("file-item");
    fileItem.textContent = `Файл: ${file.name} (Размер: ${(file.size / 1024).toFixed(2)} КБ)`;
    fileList.appendChild(fileItem);
  });
}

// Профиль drop-down меню
function initDropdowns() {
  const trigger = document.querySelector(".person_name");
  const dropdownMenu = document.querySelector("#dropdownMenu .dropdown-content");
  if (trigger && dropdownMenu) {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
      if (!trigger.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = "none";
      }
    });
  }

  document.querySelectorAll(".dropdown-container").forEach((dropdown) => {
    const toggleButton = dropdown.querySelector(".toggle-btn");
    const optionsMenu = dropdown.querySelector(".options-list");
    const selectedText = dropdown.querySelector(".selected-text");

    toggleButton?.addEventListener("click", () => {
      document.querySelectorAll(".options-list").forEach((menu) => {
        if (menu !== optionsMenu) menu.classList.remove("show");
      });
      optionsMenu.classList.toggle("show");
    });

    optionsMenu?.addEventListener("click", (event) => {
      if (event.target.tagName === "LI") {
        selectedText.textContent = event.target.textContent;
        optionsMenu.classList.remove("show");
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".dropdown-container")) {
      document.querySelectorAll(".options-list").forEach((menu) => menu.classList.remove("show"));
    }
  });
}

// Инициализация
initDropdowns();
renderList();
