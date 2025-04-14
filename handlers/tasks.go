package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"notes_app/utils"
	"strconv"

	"github.com/gorilla/mux"
)

type Task struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
	Hidden   bool   `json:"hidden"`
}

// Получение всех задач
func GetTasks(w http.ResponseWriter, r *http.Request) {
	db := utils.GetDB()
	rows, err := db.Query("SELECT id, title, subtitle, hidden FROM tasks WHERE hidden = false")
	if err != nil {
		log.Printf("Error fetching tasks: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []Task
	for rows.Next() {
		var task Task
		if err := rows.Scan(&task.ID, &task.Title, &task.Subtitle, &task.Hidden); err != nil {
			log.Printf("Error scanning task: %v", err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		tasks = append(tasks, task)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// Добавление новой задачи
func AddTask(w http.ResponseWriter, r *http.Request) {
	var task Task
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		log.Printf("Error decoding task: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	db := utils.GetDB()
	err = db.QueryRow("INSERT INTO tasks (title, subtitle) VALUES ($1, $2) RETURNING id, title, subtitle, hidden", task.Title, task.Subtitle).Scan(&task.ID, &task.Title, &task.Subtitle, &task.Hidden)
	if err != nil {
		log.Printf("Error inserting task: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

// Редактирование задачи
func UpdateTask(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	var task Task
	err := json.NewDecoder(r.Body).Decode(&task)
	if err != nil {
		log.Printf("Error decoding task: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	db := utils.GetDB()
	err = db.QueryRow("UPDATE tasks SET title = $1, subtitle = $2 WHERE id = $3 RETURNING id, title, subtitle, hidden", task.Title, task.Subtitle, id).Scan(&task.ID, &task.Title, &task.Subtitle, &task.Hidden)
	if err != nil {
		log.Printf("Error updating task: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

// Удаление задачи
func DeleteTask(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	db := utils.GetDB()
	_, err := db.Exec("DELETE FROM tasks WHERE id = $1", id)
	if err != nil {
		log.Printf("Error deleting task: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Скрытие задачи
func HideTask(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	db := utils.GetDB()
	_, err := db.Exec("UPDATE tasks SET hidden = true WHERE id = $1", id)
	if err != nil {
		log.Printf("Error hiding task: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Возврат скрытой задачи
func UnhideTask(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(mux.Vars(r)["id"])
	db := utils.GetDB()
	_, err := db.Exec("UPDATE tasks SET hidden = false WHERE id = $1", id)
	if err != nil {
		log.Printf("Error unhiding task: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
