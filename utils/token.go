// utils/token.go
package utils

import (
    "net/http"
    "github.com/golang-jwt/jwt/v4"
)

// ValidateTokenFromRequest проверяет токен из куки в запросе
func ValidateTokenFromRequest(r *http.Request, secret string) (*jwt.Token, error) {
    // Получаем куки с именем "token"
    cookie, err := r.Cookie("token")
    if err != nil {
        return nil, err
    }
    // Извлекаем значение токена
    tokenStr := cookie.Value
    // Парсим токен с использованием секретного ключа
    token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        return []byte(secret), nil
    })
    return token, err
}
