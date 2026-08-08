document.addEventListener('DOMContentLoaded', () => {
    auth.checkRole(['Super Admin', 'Manager', 'Housekeeping']);
    const user = auth.getCurrentUser();
    
    if (['Super Admin', 'Manager'].includes(user.role)) {
        document.getElementById('hk-actions').innerHTML = `
            <button class="btn btn-primary" onclick="openHKModal()"><i data-lucide="plus"></i> Create Task</button>
        `;
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    } else {
        // hide assign staff for cleaner
        document.querySelectorAll('.admin-only-field').forEach(el => el.style.display = 'none');
    }

    renderTasks();
    populateSelects();

    document.getElementById('search-input').addEventListener('input', renderTasks);
    document.getElementById('filter-status').addEventListener('change', renderTasks);
    document.getElementById('filter-priority').addEventListener('change', renderTasks);

    document.getElementById('hk-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveTask();
    });

    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
            lucide.createIcons();
        });
    }
});

function renderTasks() {
    const user = auth.getCurrentUser();
    let tasks = storage.get('hostel_housekeeping');
    
    if (user.role === 'Housekeeping') {
        tasks = tasks.filter(t => t.staffId === user.id || t.staffName === user.name);
    }

    const search = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const priorityFilter = document.getElementById('filter-priority').value;

    tasks = tasks.filter(t => {
        const matchSearch = t.roomNumber.includes(search) || t.staffName.toLowerCase().includes(search);
        const matchStatus = statusFilter === '' || t.status === statusFilter;
        const matchPriority = priorityFilter === '' || t.priority === priorityFilter;
        return matchSearch && matchStatus && matchPriority;
    });

    const tbody = document.querySelector('#hk-table tbody');
    tbody.innerHTML = '';

    if (tasks.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No cleaning tasks found.</td></tr>`;
    }

    tasks.forEach(t => {
        const pClass = t.priority === 'High' || t.priority === 'Urgent' ? 'badge-danger' : 'badge-info';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>Room ${t.roomNumber}</strong></td>
                <td>${t.staffName}</td>
                <td><span class="badge ${pClass}">${t.priority}</span></td>
                <td>${utils.formatDate(t.nextCleaning)}</td>
                <td>${t.notes || '-'}</td>
                <td><span class="badge ${utils.getStatusBadgeClass(t.status)}">${t.status}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editTask(${t.id})" title="Update Task"><i data-lucide="edit"></i></button>
                    ${['Super Admin', 'Manager'].includes(user.role) ? `<button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})" title="Delete"><i data-lucide="trash-2"></i></button>` : ''}
                </td>
            </tr>
        `;
    });

    lucide.createIcons();
}

function populateSelects() {
    const rooms = storage.get('hostel_rooms');
    const staff = storage.get('hostel_staff').filter(s => s.role === 'Housekeeping');
    
    const roomSelect = document.getElementById('hk-room');
    const staffSelect = document.getElementById('hk-staff');
    
    roomSelect.innerHTML = rooms.map(r => `<option value="${r.id}">Room ${r.number}</option>`).join('');
    staffSelect.innerHTML = staff.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function openHKModal() {
    document.getElementById('hk-modal').classList.add('active');
    document.getElementById('modal-title').textContent = 'Create Task';
    document.getElementById('hk-form').reset();
    document.getElementById('hk-id').value = '';
    
    const user = auth.getCurrentUser();
    if (user.role === 'Housekeeping') {
        document.getElementById('hk-staff').value = user.id;
    }
}

function closeHKModal() {
    document.getElementById('hk-modal').classList.remove('active');
}

function editTask(id) {
    const task = storage.get('hostel_housekeeping').find(t => t.id === id);
    if (task) {
        document.getElementById('modal-title').textContent = 'Update Task';
        document.getElementById('hk-id').value = task.id;
        document.getElementById('hk-room').value = task.roomId;
        
        const user = auth.getCurrentUser();
        if (['Super Admin', 'Manager'].includes(user.role)) {
            document.getElementById('hk-staff').value = task.staffId;
        }
        
        document.getElementById('hk-priority').value = task.priority;
        document.getElementById('hk-status').value = task.status;
        document.getElementById('hk-notes').value = task.notes || '';
        document.getElementById('hk-modal').classList.add('active');
    }
}

function saveTask() {
    const id = document.getElementById('hk-id').value;
    const user = auth.getCurrentUser();
    
    const roomId = parseInt(document.getElementById('hk-room').value);
    const room = storage.get('hostel_rooms').find(r => r.id === roomId);
    
    let staffId = user.id;
    let staffName = user.name;
    
    if (['Super Admin', 'Manager'].includes(user.role)) {
        staffId = parseInt(document.getElementById('hk-staff').value);
        const staff = storage.get('hostel_staff').find(s => s.id === staffId);
        if (staff) staffName = staff.name;
    }

    const taskData = {
        roomId,
        roomNumber: room.number,
        staffId,
        staffName,
        priority: document.getElementById('hk-priority').value,
        status: document.getElementById('hk-status').value,
        notes: document.getElementById('hk-notes').value,
        lastCleaned: new Date().toISOString().split('T')[0],
        nextCleaning: new Date().toISOString().split('T')[0] // simplified for demo
    };

    if (id) {
        storage.update('hostel_housekeeping', parseInt(id), taskData);
        utils.showToast('Task updated successfully', 'success');
        
        // if completed, update room status if it was 'Cleaning'
        if (taskData.status === 'Completed' && room.status === 'Cleaning') {
            room.status = 'Available';
            storage.update('hostel_rooms', room.id, room);
        }
    } else {
        storage.add('hostel_housekeeping', taskData);
        utils.showToast('Task created successfully', 'success');
    }

    closeHKModal();
    renderTasks();
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        storage.remove('hostel_housekeeping', id);
        utils.showToast('Task deleted successfully', 'success');
        renderTasks();
    }
}
