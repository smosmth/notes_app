package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type Note struct {
	ID        int       `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	UserID    int       `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

// Получение userID из JWT
func getUserIDFromRequest(r *http.Request, jwtSecret string) (int, error) {
	cookie, err := r.Cookie("token")
	if err != nil {
		log.Println("Ошибка получения cookie:", err)
		return 0, err
	}
	tokenStr := cookie.Value

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})
	if err != nil || !token.Valid {
		log.Println("Ошибка валидации токена:", err)
		return 0, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		log.Println("Ошибка парсинга claims")
		return 0, fmt.Errorf("invalid user_id in claims")
	}

	userIDFloat, ok := claims["user_id"].(float64)
	if !ok {
		log.Println("Ошибка получения user_id из claims")
		return 0, fmt.Errorf("invalid user_id in claims")
	}
	return int(userIDFloat), nil
}

// Получение всех заметок пользователя
func GetNotes(db *sql.DB, jwtSecret string, w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromRequest(r, jwtSecret)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.Query("SELECT id, title, content, user_id, created_at FROM notes WHERE user_id = $1", userID)
	if err != nil {
		log.Println("Ошибка получения заметок:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var notes []Note
	for rows.Next() {
		var note Note
		if err := rows.Scan(&note.ID, &note.Title, &note.Content, &note.UserID, &note.CreatedAt); err != nil {
			log.Println("Ошибка чтения строки:", err)
			continue
		}
		notes = append(notes, note)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

// Добавление новой заметки
func AddNote(db *sql.DB, jwtSecret string, w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromRequest(r, jwtSecret)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var note Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	err = db.QueryRow(
		"INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, created_at",
		userID, note.Title, note.Content).Scan(&note.ID, &note.CreatedAt)
	if err != nil {
		log.Println("Ошибка вставки заметки:", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	note.UserID = userID
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}

// Обновление заметки
func UpdateNote(db *sql.DB, jwtSecret string, w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromRequest(r, jwtSecret)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var note Note
	if err := json.NewDecoder(r.Body).Decode(&note); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	result, err := db.Exec(
		"UPDATE notes SET title = $1, content = $2 WHERE id = $3 AND user_id = $4",
		note.Title, note.Content, note.ID, userID)
	if err != nil {
		log.Println("Ошибка обновления заметки:", err)
		http.Error(w, "Update failed", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Удаление заметки
func DeleteNote(db *sql.DB, jwtSecret string, w http.ResponseWriter, r *http.Request) {
	userID, err := getUserIDFromRequest(r, jwtSecret)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	noteIDStr := r.URL.Query().Get("id")
	noteID, err := strconv.Atoi(noteIDStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	result, err := db.Exec("DELETE FROM notes WHERE id = $1 AND user_id = $2", noteID, userID)
	if err != nil {
		log.Println("Ошибка удаления заметки:", err)
		http.Error(w, "Delete failed", http.StatusInternalServerError)
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		http.Error(w, "Note not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusOK)
}
