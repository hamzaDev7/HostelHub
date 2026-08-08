document.addEventListener('DOMContentLoaded', () => {
    auth.checkRole(['Super Admin', 'Manager']);
    
    // Set default dates to current month
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('report-start').value = firstDay.toISOString().split('T')[0];
    document.getElementById('report-end').value = today.toISOString().split('T')[0];
    
    generateReport(); // Generate initial

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

let currentReportData = [];
let currentReportHeaders = [];

function generateReport() {
    const type = document.getElementById('report-type').value;
    const start = document.getElementById('report-start').value;
    const end = document.getElementById('report-end').value;
    
    if (!start || !end) {
        utils.showToast('Please select date range', 'error');
        return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59); // include whole end day

    const container = document.getElementById('report-content');
    let html = '';

    if (type === 'revenue') {
        const payments = storage.get('hostel_payments').filter(p => {
            const d = new Date(p.date);
            return d >= startDate && d <= endDate && p.status === 'Paid';
        });

        const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
        currentReportData = payments.map(p => [p.id, p.bookingId, p.guestName, p.method, p.date, p.amount]);
        currentReportHeaders = ['Payment ID', 'Booking ID', 'Guest', 'Method', 'Date', 'Amount (PKR)'];

        html = `
            <div class="stats-grid">
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="dollar-sign"></i></div>
                    <div class="stat-details">
                        <p>Total Revenue</p>
                        <h3>${utils.formatCurrency(totalRevenue)}</h3>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="credit-card"></i></div>
                    <div class="stat-details">
                        <p>Transactions</p>
                        <h3>${payments.length}</h3>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>Revenue Details</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr><th>ID</th><th>Booking</th><th>Guest</th><th>Method</th><th>Date</th><th>Amount</th></tr></thead>
                        <tbody>
                            ${payments.length ? payments.map(p => `<tr><td>#${p.id}</td><td>#${p.bookingId}</td><td>${p.guestName}</td><td>${p.method}</td><td>${utils.formatDate(p.date)}</td><td>${utils.formatCurrency(p.amount)}</td></tr>`).join('') : '<tr><td colspan="6" style="text-align:center;">No data found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (type === 'bookings') {
        const bookings = storage.get('hostel_bookings').filter(b => {
            const d = new Date(b.date);
            return d >= startDate && d <= endDate;
        });

        const confirmed = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked In' || b.status === 'Checked Out').length;
        currentReportData = bookings.map(b => [b.id, b.guestName, b.roomNumber, b.checkIn, b.checkOut, b.status, b.amount]);
        currentReportHeaders = ['Booking ID', 'Guest', 'Room', 'Check In', 'Check Out', 'Status', 'Amount (PKR)'];

        html = `
            <div class="stats-grid">
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="calendar-check"></i></div>
                    <div class="stat-details">
                        <p>Total Bookings</p>
                        <h3>${bookings.length}</h3>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="check-circle"></i></div>
                    <div class="stat-details">
                        <p>Confirmed</p>
                        <h3>${confirmed}</h3>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>Booking Details</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr><th>ID</th><th>Guest</th><th>Room</th><th>Check In</th><th>Status</th><th>Amount</th></tr></thead>
                        <tbody>
                            ${bookings.length ? bookings.map(b => `<tr><td>#${b.id}</td><td>${b.guestName}</td><td>${b.roomNumber}</td><td>${utils.formatDate(b.checkIn)}</td><td><span class="badge ${utils.getStatusBadgeClass(b.status)}">${b.status}</span></td><td>${utils.formatCurrency(b.amount)}</td></tr>`).join('') : '<tr><td colspan="6" style="text-align:center;">No data found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (type === 'occupancy') {
        const rooms = storage.get('hostel_rooms');
        const occupied = rooms.filter(r => r.status === 'Occupied' || r.status === 'Reserved').length;
        const occRate = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;
        
        currentReportData = rooms.map(r => [r.number, r.type, r.capacity, r.status]);
        currentReportHeaders = ['Room Number', 'Type', 'Capacity', 'Current Status'];

        html = `
            <div class="stats-grid">
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="pie-chart"></i></div>
                    <div class="stat-details">
                        <p>Occupancy Rate</p>
                        <h3>${occRate}%</h3>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="door-open"></i></div>
                    <div class="stat-details">
                        <p>Occupied/Reserved</p>
                        <h3>${occupied} / ${rooms.length}</h3>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>Current Room Statuses</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr><th>Room</th><th>Type</th><th>Capacity</th><th>Status</th></tr></thead>
                        <tbody>
                            ${rooms.map(r => `<tr><td>Room ${r.number}</td><td>${r.type}</td><td>${r.capacity} Guests</td><td><span class="badge ${utils.getStatusBadgeClass(r.status)}">${r.status}</span></td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } else if (type === 'staff') {
        const staff = storage.get('hostel_staff').filter(s => {
            const d = new Date(s.joiningDate);
            return d <= endDate;
        });
        
        const activeStaff = staff.filter(s => s.status === 'Active').length;
        currentReportData = staff.map(s => [s.employeeId || 'EMP'+s.id, s.name, s.role, s.department, s.joiningDate, s.status]);
        currentReportHeaders = ['Emp ID', 'Name', 'Role', 'Department', 'Joining Date', 'Status'];

        html = `
            <div class="stats-grid">
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="users"></i></div>
                    <div class="stat-details">
                        <p>Total Staff</p>
                        <h3>${staff.length}</h3>
                    </div>
                </div>
                <div class="card stat-card">
                    <div class="stat-icon"><i data-lucide="user-check"></i></div>
                    <div class="stat-details">
                        <p>Active Staff</p>
                        <h3>${activeStaff}</h3>
                    </div>
                </div>
            </div>
            <div class="card">
                <h3>Staff Directory</h3>
                <div class="table-responsive">
                    <table class="table">
                        <thead><tr><th>Emp ID</th><th>Name</th><th>Role</th><th>Department</th><th>Joining Date</th><th>Status</th></tr></thead>
                        <tbody>
                            ${staff.length ? staff.map(s => `<tr><td>${s.employeeId || 'EMP'+s.id}</td><td>${s.name}</td><td>${s.role}</td><td>${s.department}</td><td>${utils.formatDate(s.joiningDate)}</td><td><span class="badge ${utils.getStatusBadgeClass(s.status)}">${s.status}</span></td></tr>`).join('') : '<tr><td colspan="6" style="text-align:center;">No data found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
    lucide.createIcons();
}

function exportCSV() {
    if (currentReportData.length === 0) {
        utils.showToast('No data to export', 'error');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += currentReportHeaders.join(",") + "\r\n";
    
    currentReportData.forEach(row => {
        csvContent += row.join(",") + "\r\n";
    });

    const type = document.getElementById('report-type').options[document.getElementById('report-type').selectedIndex].text;
    const date = new Date().toISOString().split('T')[0];
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HostelHub_${type}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printReport() {
    if (currentReportData.length === 0) {
        utils.showToast('No data to print', 'error');
        return;
    }

    const typeText = document.getElementById('report-type').options[document.getElementById('report-type').selectedIndex].text;
    const start = document.getElementById('report-start').value;
    const end = document.getElementById('report-end').value;

    const printWindow = window.open('', '_blank');
    
    let tableHtml = '<table><thead><tr>';
    currentReportHeaders.forEach(h => {
        tableHtml += `<th>${h}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';
    
    currentReportData.forEach(row => {
        tableHtml += '<tr>';
        row.forEach((cell, i) => {
            let val = cell;
            if (typeof val === 'number' && (currentReportHeaders[i].includes('Amount') || currentReportHeaders[i].includes('Revenue') || currentReportHeaders[i].includes('PKR'))) {
                val = utils.formatCurrency(val);
            } else if (currentReportHeaders[i].includes('Date') || currentReportHeaders[i].includes('Check')) {
                val = utils.formatDate(val);
            }
            // add status badges for the print view if it's a status column
            if (currentReportHeaders[i].includes('Status')) {
                val = `<span class="badge ${val}">${val}</span>`;
            }
            tableHtml += `<td>${val}</td>`;
        });
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';

    printWindow.document.write(`
        <html>
        <head>
            <title>${typeText} - HostelHub</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body { 
                    font-family: 'Inter', sans-serif; 
                    padding: 40px; 
                    color: #1E293B; 
                    background: #FFFFFF; 
                    -webkit-print-color-adjust: exact;
                }
                .report-box {
                    max-width: 1000px;
                    margin: auto;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #F1F5F9;
                    padding-bottom: 30px;
                    margin-bottom: 40px;
                }
                .logo {
                    font-size: 28px;
                    font-weight: 800;
                    color: #4F46E5;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .logo-icon {
                    width: 40px; height: 40px;
                    background: #4F46E5;
                    border-radius: 10px;
                    display: flex; justify-content: center; align-items: center;
                    color: white; font-size: 20px;
                }
                .report-info {
                    text-align: right;
                    color: #64748B;
                    font-size: 14px;
                }
                .report-title {
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 0 5px 0;
                    color: #0F172A;
                    text-transform: uppercase;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 40px;
                }
                th {
                    background: #F8FAFC;
                    color: #64748B;
                    font-size: 12px;
                    text-transform: uppercase;
                    padding: 15px;
                    text-align: left;
                    font-weight: 700;
                    border-bottom: 2px solid #E2E8F0;
                }
                td {
                    padding: 15px;
                    border-bottom: 1px solid #F1F5F9;
                    font-weight: 500;
                    font-size: 14px;
                }
                .badge {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 700;
                    background: #E2E8F0; color: #475569;
                    display: inline-block;
                }
                .badge.Paid, .badge.Confirmed, .badge.Available { background: #10B981; color: white; }
                .badge.Pending, .badge.Reserved { background: #F59E0B; color: white; }
                .badge.Occupied, .badge.Failed, .badge.Cancelled { background: #EF4444; color: white; }
                .badge.Cleaning, .badge.Refunded { background: #3B82F6; color: white; }
                .footer-note {
                    text-align: center;
                    color: #94A3B8;
                    font-size: 14px;
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px dashed #E2E8F0;
                }
            </style>
        </head>
        <body>
            <div class="report-box">
                <div class="header">
                    <div class="logo">
                        <div class="logo-icon">H</div>
                        HostelHub
                    </div>
                    <div class="report-info">
                        <h2 class="report-title">${typeText}</h2>
                        <p style="margin:0;">Period: <strong>${utils.formatDate(start)}</strong> to <strong>${utils.formatDate(end)}</strong></p>
                        <p style="margin:5px 0 0 0;">Generated: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
                
                ${tableHtml}

                <div class="footer-note">
                    <p>HostelHub Management System - Official Report Document</p>
                </div>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 800);
}
