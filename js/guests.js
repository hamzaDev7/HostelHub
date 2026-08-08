document.addEventListener('DOMContentLoaded', () => {
    auth.checkRole(['Super Admin', 'Manager', 'Receptionist']);
    renderGuests();

    document.getElementById('search-input').addEventListener('input', renderGuests);
    document.getElementById('filter-status').addEventListener('change', renderGuests);

    document.getElementById('guest-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveGuest();
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

function renderGuests() {
    let guests = storage.get('hostel_guests');
    
    const search = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;

    guests = guests.filter(g => {
        const matchSearch = g.name.toLowerCase().includes(search) || g.email.toLowerCase().includes(search);
        const matchStatus = statusFilter === '' || g.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const tbody = document.querySelector('#guests-table tbody');
    tbody.innerHTML = '';

    if (guests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No guests found.</td></tr>`;
    }

    guests.forEach(g => {
        tbody.innerHTML += `
            <tr>
                <td>#${g.id}</td>
                <td><strong>${g.name}</strong></td>
                <td>
                    <div style="font-size:0.875rem;">
                        <i data-lucide="mail" style="width:12px;"></i> ${g.email}<br>
                        <i data-lucide="phone" style="width:12px;"></i> ${g.phone || '-'}
                    </div>
                </td>
                <td>${g.room ? 'Room ' + g.room : '-'}</td>
                <td>
                    <div style="font-size:0.875rem;">
                        ${g.checkIn ? `<span style="color:var(--success)">IN:</span> ${utils.formatDateTime(g.checkIn)}` : '-'}<br>
                        ${g.checkOut ? `<span style="color:var(--danger)">OUT:</span> ${utils.formatDateTime(g.checkOut)}` : ''}
                    </div>
                </td>
                <td><span class="badge ${utils.getStatusBadgeClass(g.status)}">${g.status}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editGuest(${g.id})" title="Edit"><i data-lucide="edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteGuest(${g.id})" title="Delete"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    });

    lucide.createIcons();
}

function editGuest(id) {
    const guest = storage.get('hostel_guests').find(g => g.id === id);
    if (guest) {
        document.getElementById('edit-guest-id').value = guest.id;
        document.getElementById('edit-guest-name').value = guest.name;
        document.getElementById('edit-guest-email').value = guest.email;
        document.getElementById('edit-guest-phone').value = guest.phone || '';
        document.getElementById('edit-guest-room').value = guest.room || '';
        
        if (guest.checkIn) {
            const ci = new Date(guest.checkIn);
            document.getElementById('edit-guest-checkin').value = new Date(ci.getTime() - ci.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        } else {
            document.getElementById('edit-guest-checkin').value = '';
        }
        
        if (guest.checkOut) {
            const co = new Date(guest.checkOut);
            document.getElementById('edit-guest-checkout').value = new Date(co.getTime() - co.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        } else {
            document.getElementById('edit-guest-checkout').value = '';
        }
        
        document.getElementById('edit-guest-status').value = guest.status;
        document.getElementById('guest-modal').classList.add('active');
    }
}

function closeGuestModal() {
    document.getElementById('guest-modal').classList.remove('active');
}

function saveGuest() {
    const id = parseInt(document.getElementById('edit-guest-id').value);
    const guest = storage.get('hostel_guests').find(g => g.id === id);
    
    if (guest) {
        guest.name = document.getElementById('edit-guest-name').value;
        guest.email = document.getElementById('edit-guest-email').value;
        guest.phone = document.getElementById('edit-guest-phone').value;
        guest.room = document.getElementById('edit-guest-room').value;
        guest.status = document.getElementById('edit-guest-status').value;
        
        const ciVal = document.getElementById('edit-guest-checkin').value;
        const coVal = document.getElementById('edit-guest-checkout').value;
        if (ciVal) guest.checkIn = new Date(ciVal).toISOString();
        if (coVal) guest.checkOut = new Date(coVal).toISOString();
        
        storage.update('hostel_guests', id, guest);
        utils.showToast('Guest updated successfully', 'success');
        closeGuestModal();
        renderGuests();
    }
}

function deleteGuest(id) {
    if (confirm('Are you sure you want to delete this guest?')) {
        storage.remove('hostel_guests', id);
        utils.showToast('Guest deleted successfully', 'success');
        renderGuests();
    }
}
