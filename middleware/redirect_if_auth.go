package middleware

import (
    "net/http"
    "notes_app/utils"
)

func RedirectIfAuthenticated(secret string, next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        _, err := utils.ValidateTokenFromRequest(r, secret)
        if err == nil {
            // Токен валиден — редиректим на /main
            http.Redirect(w, r, "/main", http.StatusFound)
            return
        }
        // Токена нет или он невалиден — пускаем на страницу
        next.ServeHTTP(w, r)
    })
}
