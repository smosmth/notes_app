// Регистрация пользователя
async function registerUser(event) {
    console.log("registerUser is called");

    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    });

    if (response.ok) {
        alert("Регистрация успешна! Теперь вы можете войти.");
        window.location.href = "/login";
    } else {
        const error = await response.text();
        alert("Ошибка: " + error);
    }
}

// Авторизация пользователя
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        const token = await response.text();
        localStorage.setItem("authToken", token);
        alert("Авторизация успешна!");
        window.location.href = "/main";
    } else {
        const error = await response.text();
        alert("Ошибка: " + error);
    }
}

// Авторизация через Google
function googleLogin(event) {
    event.preventDefault();

    // Перенаправление пользователя на маршрут начала авторизации через Google
    window.location.href = "/auth/google/login";
}

// Привязка обработчиков событий
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const googleLoginButton = document.getElementById("google-login-btn");

    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }

    if (googleLoginButton) {
        googleLoginButton.addEventListener("click", googleLogin);
    }
});
