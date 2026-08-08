document.addEventListener('DOMContentLoaded', () => {
    const user = auth.getCurrentUser();
    if (!user) return;

    document.getElementById('welcome-name').textContent = user.name;
    document.getElementById('header-avatar-initial').textContent = user.name.charAt(0).toUpperCase();

    if (['Super Admin', 'Manager'].includes(user.role)) {
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
        renderAdminDashboard();
    } else if (user.role === 'Receptionist') {
        renderReceptionDashboard();
    } else if (user.role === 'Housekeeping') {
        renderHousekeepingDashboard();
    } else if (user.role === 'Guest') {
        renderGuestDashboard();
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
        lucide.createIcons();
        
        let settings = storage.get('hostel_settings') || {};
        settings.theme = isDark ? 'dark' : 'light';
        storage.set('hostel_settings', settings);
    });

    const settings = storage.get('hostel_settings');
    if (settings && settings.theme === 'dark') {
        themeToggle.innerHTML = `<i data-lucide="sun"></i>`;
        lucide.createIcons();
    }
});

function renderAdminDashboard() {
    const rooms = storage.get('hostel_rooms');
    const bookings = storage.get('hostel_bookings');
    const payments = storage.get('hostel_payments');
    const guests = storage.get('hostel_guests');

    const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;
    
    const statsHtml = `
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="dollar-sign"></i></div>
            <div class="stat-details">
                <p>Total Revenue</p>
                <h3>${utils.formatCurrency(totalRevenue)}</h3>
                <div class="stat-trend trend-up"><i data-lucide="trending-up" style="width:12px; height:12px"></i> +12.5%</div>
            </div>
        </div>
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="calendar-check"></i></div>
            <div class="stat-details">
                <p>Total Bookings</p>
                <h3>${bookings.length}</h3>
                <div class="stat-trend trend-up"><i data-lucide="trending-up" style="width:12px; height:12px"></i> +8.2%</div>
            </div>
        </div>
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="users"></i></div>
            <div class="stat-details">
                <p>Total Guests</p>
                <h3>${guests.length}</h3>
                <div class="stat-trend trend-up"><i data-lucide="trending-up" style="width:12px; height:12px"></i> +5.1%</div>
            </div>
        </div>
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="door-open"></i></div>
            <div class="stat-details">
                <p>Available Rooms</p>
                <h3>${availableRooms} / ${rooms.length}</h3>
                <div class="stat-trend trend-down"><i data-lucide="trending-down" style="width:12px; height:12px"></i> -2%</div>
            </div>
        </div>
    `;
    
    document.getElementById('stats-container').innerHTML = statsHtml;
    document.getElementById('charts-container').style.display = 'grid';

    // Render Charts
    setTimeout(() => {
        const revCtx = document.getElementById('revenueChart').getContext('2d');
        new Chart(revCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue',
                    data: [12000, 19000, 15000, 22000, 18000, 25000],
                    borderColor: '#2563EB',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(37, 99, 235, 0.1)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const occCtx = document.getElementById('occupancyChart').getContext('2d');
        new Chart(occCtx, {
            type: 'doughnut',
            data: {
                labels: ['Occupied', 'Available', 'Cleaning', 'Maintenance'],
                datasets: [{
                    data: [
                        occupiedRooms, 
                        availableRooms, 
                        rooms.filter(r => r.status === 'Cleaning').length,
                        rooms.filter(r => r.status === 'Maintenance').length
                    ],
                    backgroundColor: ['#DC2626', '#16A34A', '#0EA5E9', '#64748B']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }, 100);

    lucide.createIcons();
}

function renderReceptionDashboard() {
    renderAdminDashboard(); // Share similar view for now
    document.getElementById('charts-container').style.display = 'none'; // Hide charts
}

function renderHousekeepingDashboard() {
    const user = auth.getCurrentUser();
    const tasks = storage.get('hostel_housekeeping').filter(t => t.staffId === user.id || t.staffName === user.name);
    
    const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;

    const statsHtml = `
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="clipboard-list"></i></div>
            <div class="stat-details">
                <p>Pending Tasks</p>
                <h3>${pendingTasks}</h3>
            </div>
        </div>
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="check-circle"></i></div>
            <div class="stat-details">
                <p>Completed Tasks</p>
                <h3>${completedTasks}</h3>
            </div>
        </div>
    `;
    document.getElementById('stats-container').innerHTML = statsHtml;
    
    let activityHtml = `<div class="card"><h3>My Tasks</h3><div class="table-responsive"><table class="table"><thead><tr><th>Room</th><th>Priority</th><th>Status</th><th>Notes</th></tr></thead><tbody>`;
    tasks.forEach(t => {
        activityHtml += `<tr>
            <td>Room ${t.roomNumber}</td>
            <td><span class="badge ${t.priority === 'High' ? 'badge-danger' : 'badge-info'}">${t.priority}</span></td>
            <td><span class="badge ${utils.getStatusBadgeClass(t.status)}">${t.status}</span></td>
            <td>${t.notes}</td>
        </tr>`;
    });
    activityHtml += `</tbody></table></div></div>`;
    document.getElementById('recent-activity-container').innerHTML = activityHtml;

    lucide.createIcons();
}

function renderGuestDashboard() {
    const user = auth.getCurrentUser();
    const bookings = storage.get('hostel_bookings').filter(b => b.guestName === user.name || b.guestId === user.id);
    
    const upcoming = bookings.filter(b => new Date(b.checkIn) >= new Date());
    const totalSpent = bookings.reduce((sum, b) => sum + b.amount, 0);

    const statsHtml = `
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="calendar"></i></div>
            <div class="stat-details">
                <p>Total Bookings</p>
                <h3>${bookings.length}</h3>
            </div>
        </div>
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="clock"></i></div>
            <div class="stat-details">
                <p>Upcoming Stays</p>
                <h3>${upcoming.length}</h3>
            </div>
        </div>
        <div class="card stat-card">
            <div class="stat-icon"><i data-lucide="dollar-sign"></i></div>
            <div class="stat-details">
                <p>Total Spent</p>
                <h3>${utils.formatCurrency(totalSpent)}</h3>
            </div>
        </div>
    `;
    document.getElementById('stats-container').innerHTML = statsHtml;

    let activityHtml = `<div class="card"><h3>My Recent Bookings</h3><div class="table-responsive"><table class="table"><thead><tr><th>Room</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Amount</th></tr></thead><tbody>`;
    
    if (bookings.length === 0) {
        activityHtml += `<tr><td colspan="5" style="text-align:center;">No bookings found.</td></tr>`;
    } else {
        bookings.slice(0, 5).forEach(b => {
            activityHtml += `<tr>
                <td>Room ${b.roomNumber}</td>
                <td>${utils.formatDate(b.checkIn)}</td>
                <td>${utils.formatDate(b.checkOut)}</td>
                <td><span class="badge ${utils.getStatusBadgeClass(b.status)}">${b.status}</span></td>
                <td>${utils.formatCurrency(b.amount)}</td>
            </tr>`;
        });
    }
    activityHtml += `</tbody></table></div></div>`;
    
    document.getElementById('recent-activity-container').innerHTML = activityHtml;
    lucide.createIcons();
}
