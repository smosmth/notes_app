package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Регистрация пользователя
func Register(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Println("Invalid request method")
		w.Header().Set("Content-Type", "application/json")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding request body: %v", err)
		w.Header().Set("Content-Type", "application/json")
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Проверка обязательных полей
	if req.Username == "" || req.Email == "" || req.Password == "" {
		log.Println("Missing required fields")
		w.Header().Set("Content-Type", "application/json")
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	// Проверка уникальности имени пользователя
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1", req.Username).Scan(&count)
	if err != nil {
		log.Printf("Database error checking username: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		log.Println("Username already exists")
		http.Error(w, "Username already exists", http.StatusConflict)
		return
	}

	// Проверка уникальности email
	err = db.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", req.Email).Scan(&count)
	if err != nil {
		log.Printf("Database error checking email: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if count > 0 {
		log.Println("Email already exists")
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	}

	// Хэширование пароля
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Error hashing password: %v", err)
		http.Error(w, "Failed to hash password", http.StatusInternalServerError)
		return
	}

	// Сохранение пользователя в базу данных
	_, err = db.Exec(`INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)`,
		req.Username, req.Email, string(hash))
	if err != nil {
		log.Printf("Error inserting user into database: %v", err)
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Ответ с успешной регистрацией
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Логин пользователя
func Login(db *sql.DB, jwtSecret string, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		log.Println("Invalid request method")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding login request: %v", err)
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Проверка обязательных полей
	if req.Email == "" || req.Password == "" {
		log.Println("Missing required fields")
		http.Error(w, "Username/Email and password are required", http.StatusBadRequest)
		return
	}

	// Поиск пользователя в базе данных
	var id int
	var passwordHash string
	err := db.QueryRow(`SELECT id, password_hash FROM users WHERE email = $1 OR username = $1`, req.Email).Scan(&id, &passwordHash)
	if err != nil {
		log.Printf("Error finding user in database: %v", err)
		http.Error(w, "Invalid username/email or password", http.StatusUnauthorized)
		return
	}

	// Сравнение паролей
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		log.Println("Invalid password")
		http.Error(w, "Invalid username/email or password", http.StatusUnauthorized)
		return
	}

	// Генерация JWT токена
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": id,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		log.Printf("Error signing JWT token: %v", err)
		http.Error(w, "Failed to create token", http.StatusInternalServerError)
		return
	}

	// Отправка токена в ответе
	http.SetCookie(w, &http.Cookie{
	Name:     "token",
	Value:    tokenString,
	Path:     "/",
	HttpOnly: true,
	Secure:   false, // если HTTPS — ставь true
	SameSite: http.SameSiteLaxMode,
})
w.Write([]byte("Login successful"))

}

// Настройка OAuth для Google
var googleOauthConfig = &oauth2.Config{
	ClientID:     "840864995903-ruure2egfrtnf6gfe5dust4fj30s2nlm.apps.googleusercontent.com",
	ClientSecret: "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",
	RedirectURL:  "http://localhost:8080/auth/google/callback",
	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	Endpoint:     google.Endpoint,
}

// Начало процесса входа через Google
func GoogleLogin(w http.ResponseWriter, r *http.Request) {
	url := googleOauthConfig.AuthCodeURL("state-token")
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// Обработка ответа от Google после авторизации
func GoogleCallback(db *sql.DB, jwtSecret string, w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	token, err := googleOauthConfig.Exchange(oauth2.NoContext, code)
	if err != nil {
		log.Printf("Error exchanging code for token: %v", err)
		http.Error(w, "Failed to exchange token", http.StatusInternalServerError)
		return
	}

	client := googleOauthConfig.Client(oauth2.NoContext, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		log.Printf("Error fetching user info from Google: %v", err)
		http.Error(w, "Failed to fetch user info", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	var userInfo struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		log.Printf("Error decoding Google user info: %v", err)
		http.Error(w, "Failed to parse user info", http.StatusInternalServerError)
		return
	}

	// Проверка и добавление пользователя в базу данных
	_, err = db.Exec(`
		INSERT INTO users (email, username, password_hash) 
		VALUES ($1, $2, $3) 
		ON CONFLICT (email) DO NOTHING`,
		userInfo.Email, userInfo.ID, "")
	if err != nil {
		log.Printf("Error inserting Google user into database: %v", err)
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	// Генерация JWT токена
	tokenStr, err := generateJWT(userInfo.ID, jwtSecret)
	if err != nil {
		log.Printf("Error generating JWT token: %v", err)
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	// Перенаправление на страницу main с передачей токена в URL
	redirectURL := fmt.Sprintf("http://localhost:8080/main?token=%s", tokenStr)
	http.Redirect(w, r, redirectURL, http.StatusFound)
}

// Генерация JWT токена для пользователя
func generateJWT(userID string, jwtSecret string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(jwtSecret))
	if err != nil {
		log.Printf("Error signing JWT token: %v", err)
		return "", err
	}

	return signedToken, nil
}
