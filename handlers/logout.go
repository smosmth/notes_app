package handlers

import (
    "net/http"
    "time"
)

func Logout(w http.ResponseWriter, r *http.Request) {
    // "Удаляем" куку — устанавливаем с истекшим сроком
    http.SetCookie(w, &http.Cookie{
        Name:     "token",
        Value:    "",
        Path:     "/",
        HttpOnly: true,
        Expires:  time.Unix(0, 0),
        MaxAge:   -1,
    })

    // Редиректим на главную страницу
    http.Redirect(w, r, "/index", http.StatusSeeOther)
}
