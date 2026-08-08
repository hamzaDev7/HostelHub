document.addEventListener('DOMContentLoaded', () => {
    auth.checkRole(['Super Admin', 'Manager']);
    
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    loadSettings();

    document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveSettings();
    });

    document.getElementById('set-theme-dark').addEventListener('change', (e) => {
        if(e.target.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });

    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            if(isDark) {
                document.body.classList.remove('dark-mode');
                document.getElementById('set-theme-dark').checked = false;
                themeToggle.innerHTML = `<i data-lucide="moon"></i>`;
            } else {
                document.body.classList.add('dark-mode');
                document.getElementById('set-theme-dark').checked = true;
                themeToggle.innerHTML = `<i data-lucide="sun"></i>`;
            }
            lucide.createIcons();
            saveSettings(false); // save silently
        });
    }
});

function loadSettings() {
    const s = storage.get('hostel_settings');
    if (!s) return;

    document.getElementById('set-name').value = s.hostelName || '';
    document.getElementById('set-email').value = s.email || '';
    document.getElementById('set-phone').value = s.phone || '';
    document.getElementById('set-address').value = s.address || '';
    
    document.getElementById('set-checkin').value = s.checkInTime || '';
    document.getElementById('set-checkout').value = s.checkOutTime || '';
    document.getElementById('set-policy').value = s.cancellationPolicy || '';
    document.getElementById('set-maxduration').value = s.maxBookingDuration || 30;

    document.getElementById('set-notif-email').checked = s.emailNotifications;
    document.getElementById('set-notif-booking').checked = s.bookingAlerts;
    document.getElementById('set-notif-payment').checked = s.paymentAlerts;
    
    document.getElementById('set-theme-dark').checked = s.theme === 'dark';
    
    if (s.theme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeToggle = document.getElementById('theme-toggle');
        if(themeToggle) {
            themeToggle.innerHTML = `<i data-lucide="sun"></i>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
}

function saveSettings(showToast = true) {
    const settings = {
        hostelName: document.getElementById('set-name').value,
        email: document.getElementById('set-email').value,
        phone: document.getElementById('set-phone').value,
        address: document.getElementById('set-address').value,
        
        checkInTime: document.getElementById('set-checkin').value,
        checkOutTime: document.getElementById('set-checkout').value,
        cancellationPolicy: document.getElementById('set-policy').value,
        maxBookingDuration: parseInt(document.getElementById('set-maxduration').value),
        
        emailNotifications: document.getElementById('set-notif-email').checked,
        bookingAlerts: document.getElementById('set-notif-booking').checked,
        paymentAlerts: document.getElementById('set-notif-payment').checked,
        
        theme: document.getElementById('set-theme-dark').checked ? 'dark' : 'light'
    };

    storage.set('hostel_settings', settings);
    if (showToast) {
        utils.showToast('Settings saved successfully', 'success');
    }
}
