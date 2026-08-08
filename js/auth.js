const auth = {
    login: (email, password) => {
        const users = storage.get('hostel_users');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('hostel_currentUser', JSON.stringify(user));
            return user;
        }
        return null;
    },
    logout: () => {
        localStorage.removeItem('hostel_currentUser');
        window.location.href = 'login.html';
    },
    getCurrentUser: () => {
        const userStr = localStorage.getItem('hostel_currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },
    checkAuth: () => {
        const user = auth.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
        }
        return user;
    },
    checkRole: (allowedRoles) => {
        const user = auth.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return false;
        }
        if (!allowedRoles.includes(user.role) && user.role !== 'Super Admin') {
            document.body.innerHTML = `
                <div style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; font-family:sans-serif;">
                    <h1 style="color:var(--danger)">Access Denied</h1>
                    <p>You do not have permission to view this page.</p>
                    <a href="dashboard.html" style="margin-top:20px; padding:10px 20px; background:var(--primary); color:white; text-decoration:none; border-radius:5px;">Go to Dashboard</a>
                </div>
            `;
            return false;
        }
        return true;
    }
};

// Auto check auth on protected pages
if (!window.location.pathname.endsWith('login.html') &&
    !window.location.pathname.endsWith('signup.html') &&
    !window.location.pathname.endsWith('forgot-password.html') &&
    !window.location.pathname.endsWith('index.html') &&
    window.location.pathname !== '/' &&
    window.location.pathname !== '/hostelhub/') {

    auth.checkAuth();
}
