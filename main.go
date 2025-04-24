package main

import (
    "html/template"
    "log"
    "net/http"

    "notes_app/handlers"
    "notes_app/middleware"
    "notes_app/utils"

    "github.com/gorilla/mux"
)

func renderTemplate(w http.ResponseWriter, tmpl string, data interface{}) {
    w.Header().Set("Content-Type", "text/html; charset=utf-8")
    tmplPath := "templates/" + tmpl
    t, err := template.ParseFiles(tmplPath)
    if err != nil {
        http.Error(w, "Template parsing error: "+err.Error(), http.StatusInternalServerError)
        return
    }
    err = t.Execute(w, data)
    if err != nil {
        http.Error(w, "Template execution error: "+err.Error(), http.StatusInternalServerError)
    }
}

func main() {
    // Конфигурация базы данных и JWT
    cfg := utils.Config{
        DBUser:     "postgres",
        DBPassword: "Aqwertium2546",
        DBName:     "notes_app",
        DBHost:     "localhost",
        DBPort:     "5432",
        JWTSecret:  "Melon11M",
    }

    // Подключение к базе данных
    db, err := utils.GetDBConnection(cfg)
    if err != nil {
        log.Fatal("Ошибка подключения к базе данных:", err)
    }
    defer db.Close()
    utils.SetDBInstance(db)

    // Маршрутизатор
    router := mux.NewRouter()

    // Статические файлы
    router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir("static/"))))

    // Аутентификация
    router.HandleFunc("/auth/register", func(w http.ResponseWriter, r *http.Request) {
        handlers.Register(db, w, r)
    }).Methods("POST")

    router.HandleFunc("/auth/login", func(w http.ResponseWriter, r *http.Request) {
        handlers.Login(db, cfg.JWTSecret, w, r)
    }).Methods("POST")

    router.HandleFunc("/auth/google/login", handlers.GoogleLogin).Methods("GET")

    router.HandleFunc("/auth/google/callback", func(w http.ResponseWriter, r *http.Request) {
        handlers.GoogleCallback(db, cfg.JWTSecret, w, r)
    }).Methods("GET")
	
	router.HandleFunc("/logout", handlers.Logout).Methods("GET")

    // API для заметок (защищённый доступ)
    notesHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case http.MethodGet:
            handlers.GetNotes(db, cfg.JWTSecret, w, r)
        case http.MethodPost:
            handlers.AddNote(db, cfg.JWTSecret, w, r)
        case http.MethodPut:
            handlers.UpdateNote(db, cfg.JWTSecret, w, r)
        case http.MethodDelete:
            handlers.DeleteNote(db, cfg.JWTSecret, w, r)
        default:
            http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
        }
    })
    router.Handle("/api/notes", middleware.AuthMiddleware(cfg.JWTSecret, notesHandler))

    // Защищённые HTML-страницы
    router.Handle("/main", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "main.html", nil)
    }))).Methods("GET")

    router.Handle("/profile", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "profile.html", nil)
    }))).Methods("GET")

    router.Handle("/docs", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "docs.html", nil)
    }))).Methods("GET")

    // Публичные HTML-страницы
    router.Handle("/", middleware.RedirectIfAuthenticated(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    renderTemplate(w, "index.html", nil)
}))).Methods("GET")

    router.Handle("/index", middleware.RedirectIfAuthenticated(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    renderTemplate(w, "index.html", nil)
}))).Methods("GET")

    router.Handle("/login", middleware.RedirectIfAuthenticated(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    renderTemplate(w, "login.html", nil)
}))).Methods("GET")


    router.Handle("/signup", middleware.RedirectIfAuthenticated(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    renderTemplate(w, "signup.html", nil)
}))).Methods("GET")

    // Запуск сервера
    log.Println("Сервер запущен на http://localhost:8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
