let addBtn = document.querySelectorAll(".add_btn");
let saveBtn = document.querySelector(".textarea_save");

let listItems = document.querySelector(".list_items");
let selectedItem = document.querySelector(".selected_item");
let backBtn = document.querySelector(".back_btn");
let titleList = document.querySelector(".title_info");
let countTask = document.querySelector(".count_task");

let content = document.querySelector(".add_content");
let formTitle = document.querySelector(".form_title");

let val = document.getElementById("textarea-info");

let obj = [
   {
      title: "Фрукты",
      subtitle: "Арбуз, банан",
      hidden: false
   },
   {
      title: "Фильмы",
      subtitle: "Матрица, Социальная сеть",
      hidden: false
   }
];

let count = obj.length;

function renderList() {
   listItems.innerHTML = "";
   titleList.innerHTML = "";
   if (countTask) countTask.innerHTML = "";

   obj.forEach((item, index) => {
      if (!item.hidden) {
         listItems.innerHTML += `
            <div class="main_list_item" data-index="${index}">
               <div class="main_list_item-1">
                  <div class="list_index">
                     <div class="list_index-txt">Task ${index + 1}</div>
                  </div>
                  <h2 class="list_title">${item.title}</h2>
                  <p class="list_descr">${item.subtitle}</p>
               </div>
               <button class="delete_btn" data-index="${index}">Delete</button>
               <button class="edit_btn" data-index="${index}">Edit</button>
               <button class="hide_btn" data-index="${index}">Hide</button>
            </div>
         `;

         titleList.innerHTML += `
            <div class="title_item">
               <img class="title_item-icon" src="img/main_img/cu-3-icon-sidebar-doc1.svg">
               <h2 class="title_item-text">${item.title}</h2>
            </div>
         `;
      }
   });

   if (countTask) countTask.innerHTML += `<div>Count ${obj.length}</div>`;

   document.querySelectorAll(".main_list_item").forEach((item) => {
      item.addEventListener("click", (e) => {
         const index = e.currentTarget.getAttribute("data-index");
         if (e.target.classList.contains("delete_btn")) deleteTask(index);
         else if (e.target.classList.contains("edit_btn")) editTask(index);
         else if (e.target.classList.contains("hide_btn")) hideTask(index);
         else showSelectedItem(index);
      });
   });
}

function deleteTask(index) {
   index = parseInt(index, 10);
   if (index >= 0 && index < obj.length) {
      obj.splice(index, 1);
      renderList();
   }
}

function showSelectedItem(index) {
   const item = obj[index];
   listItems.style.display = "none";
   selectedItem.style.display = "block";
   backBtn.style.display = "block";

   selectedItem.innerHTML = `
      <h2 class="edit_task">Edit a task</h2>
      <div class="edit_title"><div>Title:</div><input type="text" id="editTitle" value="${item.title}"></div>
      <div class="edit_title"><div>Info:</div><textarea id="editSubtitle">${item.subtitle}</textarea></div>
      <button id="saveEditBtn">Save changes</button>
   `;

   document.getElementById("saveEditBtn").addEventListener("click", () => saveEditedItem(index));
}

function saveEditedItem(index) {
   const newTitle = document.getElementById("editTitle").value.trim();
   const newSubtitle = document.getElementById("editSubtitle").value.trim();
   if (newTitle) {
      obj[index].title = newTitle;
      obj[index].subtitle = newSubtitle;
      renderList();
      selectedItem.style.display = "none";
      backBtn.style.display = "none";
      listItems.style.display = "block";
   } else {
      alert("Заголовок не может быть пустым.");
   }
}

if (backBtn) {
   backBtn.addEventListener("click", () => {
      selectedItem.style.display = "none";
      backBtn.style.display = "none";
      listItems.style.display = "block";
   });
}

if (saveBtn) {
   saveBtn.addEventListener("click", () => {
      const inputText = val.value.trim();
      if (inputText) {
         const [title, subtitle] = inputText.split("\n");
         obj.push({
            title: title || "Untitled",
            subtitle: subtitle || "",
            hidden: false
         });
         renderList();
         val.value = "";
         content.style.display = "none";
      } else {
         alert("Пожалуйста, введите текст в формате: заголовок и подзаголовок через новую строку.");
      }
   });
}

if (addBtn) {
   addBtn.forEach((item) => {
      item.addEventListener("click", () => {
         content.style.display = "block";
         if (formTitle) formTitle.innerText = "Добавить новую задачу";
      });
   });
}

function editTask(index) {
   const item = obj[index];
   val.value = `${item.title}\n${item.subtitle}`;
   content.style.display = "block";
   if (formTitle) formTitle.innerText = "Редактировать задачу";

   saveBtn.onclick = () => {
      const inputText = val.value.trim();
      if (inputText) {
         const [title, subtitle] = inputText.split("\n");
         obj[index] = {
            title: title || "Untitled",
            subtitle: subtitle || "",
            hidden: item.hidden
         };
         renderList();
         content.style.display = "none";
         val.value = "";
      }
   };
}

function hideTask(index) {
   obj[index].hidden = true;
   renderList();
}

function showHiddenTasks() {
   listItems.innerHTML = "";
   obj.forEach((item, index) => {
      if (item.hidden) {
         listItems.innerHTML += `
            <div class="main_list_item" data-index="${index}">
               <div class="main_list_item-1">
                  <div class="list_index">
                     <div class="list_index-txt">Task ${index + 1} (Hidden)</div>
                  </div>
                  <h2 class="list_title">${item.title}</h2>
                  <p class="list_descr">${item.subtitle}</p>
               </div>
               <button class="unhide_btn" data-index="${index}">Unhide</button>
            </div>
         `;
      }
   });

   document.querySelectorAll(".unhide_btn").forEach((button) => {
      button.addEventListener("click", (e) => {
         const index = e.target.getAttribute("data-index");
         unhideTask(index);
      });
   });
}

function unhideTask(index) {
   obj[index].hidden = false;
   renderList();
}

renderList();

// DRAG DROP
const dragItems = document.querySelectorAll(".drag_item");
const fileInput = document.getElementById("fileInput");

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
      const files = event.dataTransfer.files;
      handleFiles(files, fileList);
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
   if (files.length) {
      fileList.innerHTML = "";
      Array.from(files).forEach((file) => {
         const fileItem = document.createElement("div");
         fileItem.classList.add("file-item");
         fileItem.textContent = `Файл: ${file.name} (Размер: ${(file.size / 1024).toFixed(2)} КБ)`;
         fileList.appendChild(fileItem);
      });
   } else {
      alert("Нет файлов для обработки.");
   }
}

// DROPDOWN
document.addEventListener("DOMContentLoaded", () => {
   const trigger = document.querySelector(".person_name");
   const dropdownMenu = document.querySelector("#dropdownMenu .dropdown-content");

   trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
   });

   document.addEventListener("click", (event) => {
      if (!trigger.contains(event.target) && !dropdownMenu.contains(event.target)) {
         dropdownMenu.style.display = "none";
      }
   });
});

document.querySelectorAll(".dropdown-container").forEach((dropdown) => {
   const toggleButton = dropdown.querySelector(".toggle-btn");
   const optionsMenu = dropdown.querySelector(".options-list");
   const selectedText = dropdown.querySelector(".selected-text");

   toggleButton.addEventListener("click", () => {
      document.querySelectorAll(".options-list").forEach((menu) => {
         if (menu !== optionsMenu) menu.classList.remove("show");
      });
      optionsMenu.classList.toggle("show");
   });

   optionsMenu.addEventListener("click", (event) => {
      if (event.target.tagName === "LI") {
         if (selectedText) {
            selectedText.textContent = event.target.textContent;
         }
         optionsMenu.classList.remove("show");
      }
   });
});

document.addEventListener("click", (event) => {
   if (!event.target.closest(".dropdown-container")) {
      document.querySelectorAll(".options-list").forEach((menu) => menu.classList.remove("show"));
   }
});
