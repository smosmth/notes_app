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
    // Конфигурация для подключения к базе данных
    cfg := utils.Config{
        DBUser:     "postgres",
        DBPassword: "Aqwertium2546",
        DBName:     "notes_app",
        DBHost:     "localhost",
        DBPort:     "5432",
        JWTSecret:  "Melon11M",
    }
    db, err := utils.GetDBConnection(cfg)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Устанавливаем экземпляр базы данных в utils
    utils.SetDBInstance(db)

    // Инициализация маршрутизатора
    router := mux.NewRouter()

    // Статические файлы (например, CSS, JS, изображения)
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

    // Защищённые маршруты для задач
    router.Handle("/tasks", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(handlers.GetTasks))).Methods("GET")
    router.Handle("/task", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(handlers.AddTask))).Methods("POST")
    router.Handle("/task/{id:[0-9]+}", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(handlers.UpdateTask))).Methods("PUT")
    router.Handle("/task/{id:[0-9]+}", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(handlers.DeleteTask))).Methods("DELETE")
    router.Handle("/task/{id:[0-9]+}/hide", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(handlers.HideTask))).Methods("POST")
    router.Handle("/task/{id:[0-9]+}/unhide", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(handlers.UnhideTask))).Methods("POST")

    // Защищённые страницы
    router.Handle("/main", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "main.html", nil)
    }))).Methods("GET")
    router.Handle("/profile", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "profile.html", nil)
    }))).Methods("GET")
    router.Handle("/docs", middleware.AuthMiddleware(cfg.JWTSecret, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "docs.html", nil)
    }))).Methods("GET")

    // Открытые страницы
    router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "index.html", nil)
    }).Methods("GET")
    router.HandleFunc("/index", func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "index.html", nil)
    }).Methods("GET")
    router.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "login.html", nil)
    }).Methods("GET")
    router.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {
        renderTemplate(w, "signup.html", nil)
    }).Methods("GET")

    // Запуск сервера
    log.Println("Server started on :8080")
    log.Fatal(http.ListenAndServe(":8080", router))
}
