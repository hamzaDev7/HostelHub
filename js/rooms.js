document.addEventListener('DOMContentLoaded', () => {
    auth.checkAuth();
    const user = auth.getCurrentUser();
    
    if (['Super Admin', 'Manager'].includes(user.role)) {
        document.getElementById('room-actions').innerHTML = `
            <button class="btn btn-primary" onclick="openModal()"><i data-lucide="plus"></i> Add Room</button>
        `;
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
    }

    renderRooms();

    // Filters
    document.getElementById('search-input').addEventListener('input', renderRooms);
    document.getElementById('filter-status').addEventListener('change', renderRooms);
    document.getElementById('filter-type').addEventListener('change', renderRooms);

    // Form Submit
    document.getElementById('room-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveRoom();
    });

    // Theme toggle (if not in app.js)
    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            themeToggle.innerHTML = `<i data-lucide="${isDark ? 'sun' : 'moon'}"></i>`;
            lucide.createIcons();
            let settings = storage.get('hostel_settings') || {};
            settings.theme = isDark ? 'dark' : 'light';
            storage.set('hostel_settings', settings);
        });
    }
});

function renderRooms() {
    const user = auth.getCurrentUser();
    let rooms = storage.get('hostel_rooms');
    
    const search = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;
    const typeFilter = document.getElementById('filter-type').value;

    rooms = rooms.filter(r => {
        const matchSearch = r.number.toLowerCase().includes(search) || r.type.toLowerCase().includes(search);
        const matchStatus = statusFilter === '' || r.status === statusFilter;
        const matchType = typeFilter === '' || r.type === typeFilter;
        return matchSearch && matchStatus && matchType;
    });

    const container = document.getElementById('rooms-container');
    container.innerHTML = '';

    if (rooms.length === 0) {
        container.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <i data-lucide="search-x" style="width:48px; height:48px; color:var(--text-muted); margin-bottom:1rem;"></i>
            <h3>No rooms found</h3>
            <p>Try adjusting your filters.</p>
        </div>`;
    }

    const isAdmin = ['Super Admin', 'Manager'].includes(user.role);

    rooms.forEach(room => {
        const badgeClass = utils.getStatusBadgeClass(room.status);
        let actionButtons = '';
        
        if (isAdmin) {
            actionButtons = `
                <button class="btn btn-outline btn-sm" onclick="editRoom(${room.id})"><i data-lucide="edit"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteRoom(${room.id})"><i data-lucide="trash-2"></i></button>
            `;
        }

        container.innerHTML += `
            <div class="card room-card">
                <div class="room-img-wrapper">
                    <img src="${room.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'}" alt="Room ${room.number}">
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <h3 style="margin:0;">Room ${room.number} <span style="font-size:0.875rem; color:var(--text-muted); font-weight:normal;">(${room.type})</span></h3>
                    <span class="badge ${badgeClass}">${room.status}</span>
                </div>
                <div style="display:flex; gap:1rem; margin-bottom:1rem; font-size:0.875rem; color:var(--text-muted);">
                    <span style="display:flex; align-items:center; gap:5px;"><i data-lucide="users" style="width:16px;"></i> ${room.capacity}</span>
                    <span style="display:flex; align-items:center; gap:5px;"><i data-lucide="layers" style="width:16px;"></i> Floor ${room.floor}</span>
                </div>
                <h4 style="color:var(--primary); font-size:1.25rem; margin-bottom:1rem;">${utils.formatCurrency(room.price)} <span style="font-size:0.875rem; color:var(--text-muted);">/ night</span></h4>
                <div style="display:flex; gap:10px;">
                    <a href="room-details.html?id=${room.id}" class="btn btn-primary" style="flex:1;">View Details</a>
                    ${actionButtons}
                </div>
            </div>
        `;
    });

    lucide.createIcons();
}

function openModal() {
    document.getElementById('room-modal').classList.add('active');
    document.getElementById('modal-title').textContent = 'Add Room';
    document.getElementById('room-form').reset();
    document.getElementById('room-id').value = '';
}

function closeModal() {
    document.getElementById('room-modal').classList.remove('active');
}

function saveRoom() {
    const id = document.getElementById('room-id').value;
    const room = {
        number: document.getElementById('room-number').value,
        floor: parseInt(document.getElementById('room-floor').value),
        type: document.getElementById('room-type').value,
        capacity: parseInt(document.getElementById('room-capacity').value),
        price: parseFloat(document.getElementById('room-price').value),
        status: document.getElementById('room-status').value,
        amenities: document.getElementById('room-amenities').value.split(',').map(a => a.trim()),
        image: document.getElementById('room-image').value,
        description: document.getElementById('room-description').value
    };

    if (id) {
        storage.update('hostel_rooms', parseInt(id), room);
        utils.showToast('Room updated successfully', 'success');
    } else {
        storage.add('hostel_rooms', room);
        utils.showToast('Room added successfully', 'success');
    }

    closeModal();
    renderRooms();
}

function editRoom(id) {
    const room = storage.get('hostel_rooms').find(r => r.id === id);
    if (room) {
        document.getElementById('modal-title').textContent = 'Edit Room';
        document.getElementById('room-id').value = room.id;
        document.getElementById('room-number').value = room.number;
        document.getElementById('room-floor').value = room.floor;
        document.getElementById('room-type').value = room.type;
        document.getElementById('room-capacity').value = room.capacity;
        document.getElementById('room-price').value = room.price;
        document.getElementById('room-status').value = room.status;
        document.getElementById('room-amenities').value = (room.amenities || []).join(', ');
        document.getElementById('room-image').value = room.image || '';
        document.getElementById('room-description').value = room.description || '';
        document.getElementById('room-modal').classList.add('active');
    }
}

function deleteRoom(id) {
    if (confirm('Are you sure you want to delete this room?')) {
        storage.remove('hostel_rooms', id);
        utils.showToast('Room deleted successfully', 'success');
        renderRooms();
    }
}
