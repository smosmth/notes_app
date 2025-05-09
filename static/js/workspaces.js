// === Основная инициализация ===
document.addEventListener("DOMContentLoaded", () => {
  // === Показ всех пространств ===
  document.querySelector(".icons img[src*='ellipsis']")?.addEventListener("click", () => {
    alert("Открыть список всех пространств (будет модалка)");
  });

  // === Поиск пространств ===
  document.querySelector(".icons img[src*='search']")?.addEventListener("click", () => {
    const search = prompt("Введите название пространства для поиска:");
    if (search) {
      alert(`Поиск пространства: ${search}`);
    }
  });

  // === Показ/скрытие проектов в существующих пространствах ===
  document.querySelectorAll(".team .icons_right button:first-child").forEach((btn) => {
    btn.addEventListener("click", () => {
      const teamBlock = btn.closest(".team");
      const projectList = teamBlock.nextElementSibling;
      if (projectList?.classList.contains("project_list")) {
        projectList.classList.toggle("hidden");
      }
    });
  });

  // === Добавление нового проекта в существующее пространство ===
  document.querySelectorAll(".team .icons_right .add_btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const projectName = prompt("Введите название нового проекта:");
      if (projectName) {
        const projectList = btn.closest(".team").nextElementSibling;
        const newProject = document.createElement("div");
        newProject.classList.add("project_item");
        newProject.innerHTML = `📁 ${projectName}
          <div class="project_controls">
            <button class="edit_project_btn">
              <img src="/static/img/main_img/cu-3-icon-ellipsis-regular6.svg" />
            </button>
          </div>`;
        projectList.appendChild(newProject);
        bindProjectClick(newProject);
      }
    });
  });

  // === Создание нового пространства ===
  const createSpaceBtn = document.getElementById("create_space_btn");
  createSpaceBtn?.addEventListener("click", () => {
    const name = prompt("Введите название нового пространства:");
    if (!name) return;

    const infoList = document.querySelector(".info_list");
    const spaceId = "space_" + Date.now();

    const spaceBlock = document.createElement("div");
    spaceBlock.classList.add("team");
    spaceBlock.innerHTML = `
      <div class="team_wrapper">
        <div class="team_ico">
          <img src="/static/img/main_img/fa-icon-img1.svg" />
        </div>
        <div class="team_txt">${name}</div>
      </div>
      <div class="icons_right">
        <button class="toggle_projects_btn" data-target="${spaceId}">
          <img class="icon_r" src="/static/img/main_img/cu-3-icon-ellipsis-regular6.svg" />
        </button>
        <button class="add_project_btn" data-target="${spaceId}">
          <img class="icon_r" src="/static/img/main_img/cu-3-icon-add-small3.svg" />
        </button>
      </div>`;

    const projectList = document.createElement("div");
    projectList.classList.add("project_list", "hidden");
    projectList.id = spaceId;
    projectList.innerHTML = `
      <div class="project_item">
        📁 Новый проект
        <div class="project_controls">
          <button class="edit_project_btn">
            <img src="/static/img/main_img/cu-3-icon-ellipsis-regular6.svg" />
          </button>
        </div>
      </div>`;

    const createBlock = document.querySelector(".every");
    infoList.insertBefore(spaceBlock, createBlock);
    infoList.insertBefore(projectList, createBlock);

    spaceBlock.querySelector(".toggle_projects_btn")?.addEventListener("click", () => {
      document.getElementById(spaceId)?.classList.toggle("hidden");
    });

    spaceBlock.querySelector(".add_project_btn")?.addEventListener("click", () => {
      const newProjectName = prompt("Введите название проекта:");
      if (!newProjectName) return;
      const projectItem = document.createElement("div");
      projectItem.classList.add("project_item");
      projectItem.innerHTML = `📁 ${newProjectName}
        <div class="project_controls">
          <button class="edit_project_btn">
            <img src="/static/img/main_img/cu-3-icon-ellipsis-regular6.svg" />
          </button>
        </div>`;
      projectList.appendChild(projectItem);
      bindProjectClick(projectItem);
    });

    bindProjectClick(projectList.querySelector(".project_item"));
  });

  // === Навешивание действий на существующие элементы ===
  document.querySelectorAll(".project_item").forEach(bindProjectClick);
});

// === Обработчик клика по проекту ===
function bindProjectClick(item) {
  item.addEventListener("click", () => {
    const block2 = document.getElementById("workspace_view");
    const spaceName =
      item.closest(".project_list")?.previousElementSibling?.querySelector(".team_txt")?.textContent || "Workspace";
    const projectName = item.textContent.trim().split("\n")[0] || "Project";

    block2.innerHTML = `
      <div class="workspace-header">
        <div class="header-left">
          <h2>${spaceName} / ${projectName}</h2>
        </div>
        <div class="header-right">
          <button class="header-btn">
            <img src="/static/img/main_img/settings.svg" alt="Settings" />
            <span>Workspace settings</span>
          </button>
          <button class="header-btn">
            <img src="/static/img/main_img/edit.svg" alt="Edit Project" />
            <span>Project settings</span>
          </button>
          <button class="header-btn">
            <img src="/static/img/main_img/add.svg" alt="Add Participants" />
            <span>Add participants</span>
          </button>
        </div>
      </div>

      <div class="workspace-container">
        <div class="workspace-chat">
          <div id="chat_messages" class="chat-messages"></div>
          <div class="chat-input-bar">
            <label for="fileInput" class="chat-attach-button">📎</label>
            <input type="file" id="fileInput" class="hidden" />
            <input type="text" id="chatInput" class="chat-input-field" placeholder="Введите сообщение..." />
            <button class="chat-ai-button" disabled>🤖 AI</button>
            <button class="chat-tasks-button" disabled>📝 Tasks</button>
            <button class="chat-emoji-button">😊</button>
            <button class="chat-send-button" id="sendMessageBtn">Send</button>
          </div>
        </div>
        <div class="workspace-notes">
          <h3>Notes</h3>
          <div class="notes-list">
            <div class="note">
              <div class="note-header">
                <span class="note-title">Meeting Notes</span>
                <div class="note-actions">
                  <button class="pin-note" title="Pin">📌</button>
                  <button class="edit-note" title="Edit">✏️</button>
                </div>
              </div>
              <div class="note-preview">Discuss team tasks...</div>
              <div class="note-body hidden">
                <textarea>Discuss team tasks...</textarea>
                <div class="note-tools">
                  <button title="Attach image">📎</button>
                  <button title="Background color">🎨</button>
                  <button title="AI help" disabled>🤖</button>
                  <button title="Save">💾</button>
                </div>
                <input type="file" accept="image/*" />
              </div>
            </div>
          </div>
          <button onclick="addNote()" style="margin-top: 10px;">+ Add Note</button>
        </div>
      </div>`;

    setupWorkspaceListeners();
  });

  item.querySelector(".edit_project_btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const currentName = item.textContent.trim();
    const action = prompt(`Проект: ${currentName}\n1. Переименовать\n2. Изменить иконку\n3. Удалить`);

    if (action === "1") {
      const newName = prompt("Новое название проекта:");
      if (newName) item.childNodes[0].textContent = `📁 ${newName}`;
    } else if (action === "2") {
      const icon = prompt("Введите emoji или символ:", "📁");
      if (icon) {
        const nameOnly = item.childNodes[0].textContent.replace(/^.\s/, "");
        item.childNodes[0].textContent = `${icon} ${nameOnly}`;
      }
    } else if (action === "3") {
      if (confirm("Удалить проект?")) item.remove();
    }
  });
}

function setupWorkspaceListeners() {
  const input = document.getElementById("chatInput");
  const sendButton = document.getElementById("sendMessageBtn");
  const fileInput = document.getElementById("fileInput");
  const chatBox = document.getElementById("chat_messages");

  sendButton?.addEventListener("click", () => {
    const text = input.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) return;

    const message = document.createElement("div");
    message.className = "message";
    if (file) {
      message.innerHTML = `👤 You: <span>${text}</span><br/><strong>📎 ${file.name}</strong>`;
    } else {
      message.textContent = `👤 You: ${text}`;
    }

    chatBox.prepend(message); // Новые сверху
    input.value = "";
    fileInput.value = "";
  });

  // === Нотация: раскрытие и редактирование заметок ===
  document.querySelectorAll(".note").forEach((note) => {
    const header = note.querySelector(".note-header");
    const preview = note.querySelector(".note-preview");
    const body = note.querySelector(".note-body");
    const editBtn = note.querySelector(".edit-note");
    const tools = note.querySelector(".note-tools");

    header.addEventListener("click", (e) => {
      if (e.target === editBtn) return; // не раскрывать при клике на кнопку редактирования
      preview.classList.toggle("hidden");
      body.classList.toggle("hidden");
    });

    editBtn.addEventListener("click", () => {
      tools?.classList.toggle("hidden");
    });
  });
}

function addNote() {
  const container = document.querySelector(".notes-list");
  const note = document.createElement("div");
  note.className = "note";
  note.innerHTML = `
      <div class="note-header">
        <span class="note-title">New Note</span>
        <div class="note-actions">
          <button class="pin-note" title="Pin">📌</button>
          <button class="edit-note" title="Edit">✏️</button>
        </div>
      </div>
      <div class="note-preview">Click to edit...</div>
      <div class="note-body hidden">
        <textarea></textarea>
        <div class="note-tools hidden">
          <button title="Attach image">📎</button>
          <button title="Background color">🎨</button>
          <button title="AI help" disabled>🤖</button>
          <button title="Save">💾</button>
        </div>
        <input type="file" accept="image/*" />
      </div>`;

  container.prepend(note);
  setupWorkspaceListeners();
}