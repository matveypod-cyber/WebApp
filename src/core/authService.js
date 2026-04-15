// Заглушка для авторизации (MVP)

let currentUser = {
    id: 1,
    name: "Пользователь",
    email: "user@example.com",
    totalPoints: 0
};

export const AuthService = {
    async login(email, password) {
        console.log("Login attempt", email);
        return { success: true, user: currentUser };
    },
    
    async logout() {
        console.log("Logout");
        currentUser = null;
        return true;
    },
    
    getCurrentUser() {
        return currentUser;
    },
    
    isAuthenticated() {
        return currentUser !== null;
    }
};