package utils

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // подключение для PostgreSQL
)

// Конфигурация подключения к базе данных
type Config struct {
	DBUser       string
	DBPassword   string
	DBName       string
	DBHost       string
	DBPort       string
	JWTSecret    string
	GoogleID     string
	GoogleSecret string
}

// Получение подключения к базе данных
func GetDBConnection(cfg Config) (*sql.DB, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Error opening database connection: ", err)
		return nil, err
	}

	// Проверяем соединение с базой данных
	if err := db.Ping(); err != nil {
		log.Fatal("Error pinging database: ", err)
		return nil, err
	}

	return db, nil
}

// Хранение экземпляра базы данных
var dbInstance *sql.DB

// Функция для получения экземпляра подключения
func GetDB() *sql.DB {
	if dbInstance == nil {
		log.Fatal("Database connection not initialized")
	}
	return dbInstance
}

// Установка экземпляра базы данных
func SetDBInstance(db *sql.DB) {
	dbInstance = db
}
