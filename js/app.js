/* app.js - Main Application Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Apply Theme
    const settings = storage.get('hostel_settings');
    if (settings && settings.theme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Setup Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Setup Mobile Search Toggle
    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    const searchWrapper = document.getElementById('search-wrapper');
    if (mobileSearchBtn && searchWrapper) {
        mobileSearchBtn.addEventListener('click', () => {
            searchWrapper.classList.toggle('mobile-active');
        });
    }

    // Setup User Dropdown
    const userDropdownBtn = document.getElementById('user-dropdown-btn');
    const userDropdownMenu = document.getElementById('user-dropdown-menu');
    if (userDropdownBtn && userDropdownMenu) {
        userDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!userDropdownMenu.contains(e.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    // Render Sidebar based on Role
    renderSidebar();

    // Setup Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });
    }

    // Display Current User Info in Header
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
        const userNameEl = document.getElementById('header-user-name');
        const userRoleEl = document.getElementById('header-user-role');
        if (userNameEl) userNameEl.textContent = currentUser.name;
        if (userRoleEl) userRoleEl.textContent = currentUser.role;
    }
});

function renderSidebar() {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;

    const user = auth.getCurrentUser();
    if (!user) return;

    let navHtml = '';

    const addLink = (href, icon, text) => {
        const isActive = window.location.pathname.endsWith(href) ? 'active' : '';
        return `<a href="${href}" class="sidebar-link ${isActive}">
                    <i data-lucide="${icon}"></i> <span>${text}</span>
                </a>`;
    };

    const addSection = (title) => {
        return `<div class="sidebar-heading">${title}</div>`;
    };

    navHtml += addLink('dashboard.html', 'layout-dashboard', 'Dashboard');

    if (['Super Admin', 'Manager', 'Receptionist'].includes(user.role)) {
        navHtml += addSection('Operations');
        navHtml += addLink('bookings.html', 'calendar-check', 'Bookings');
        navHtml += addLink('rooms.html', 'door-closed', 'Rooms');
        navHtml += addLink('guests.html', 'users', 'Guests');
        navHtml += addLink('payments.html', 'credit-card', 'Payments');
    }

    if (['Super Admin', 'Manager'].includes(user.role)) {
        navHtml += addSection('Management');
        navHtml += addLink('housekeeping.html', 'sparkles', 'Housekeeping');
        navHtml += addLink('staff.html', 'briefcase', 'Staff');
    }

    if (['Housekeeping'].includes(user.role)) {
        navHtml += addSection('Operations');
        navHtml += addLink('housekeeping.html', 'sparkles', 'Cleaning Tasks');
    }

    if (['Guest'].includes(user.role)) {
        navHtml += addSection('Explore');
        navHtml += addLink('rooms.html', 'door-closed', 'Rooms');
        navHtml += addSection('Bookings');
        navHtml += addLink('my-bookings.html', 'calendar', 'My Bookings');
        //navHtml += addLink('payments.html', 'credit-card', 'Payments');
    }

    if (['Super Admin', 'Manager'].includes(user.role)) {
        navHtml += addSection('Analytics');
        navHtml += addLink('reports.html', 'bar-chart-3', 'Reports');
    }

    navHtml += addSection('Account');
    navHtml += addLink('profile.html', 'user', 'Profile');

    if (['Super Admin', 'Manager'].includes(user.role)) {
        navHtml += addSection('System');
        navHtml += addLink('notifications.html', 'bell', 'Notifications');
        navHtml += addLink('settings.html', 'settings', 'Settings');
    } else {
        navHtml += addLink('notifications.html', 'bell', 'Notifications');
    }

    sidebarNav.innerHTML = navHtml;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
