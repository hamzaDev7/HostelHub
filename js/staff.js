document.addEventListener('DOMContentLoaded', () => {
    auth.checkRole(['Super Admin', 'Manager']);
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'inline-flex');
    
    renderStaff();

    document.getElementById('search-input').addEventListener('input', renderStaff);
    document.getElementById('filter-role').addEventListener('change', renderStaff);
    document.getElementById('filter-status').addEventListener('change', renderStaff);

    document.getElementById('staff-form').addEventListener('submit', (e) => {
        e.preventDefault();
        saveStaff();
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

function renderStaff() {
    let staffList = storage.get('hostel_staff');
    
    const search = document.getElementById('search-input').value.toLowerCase();
    const roleFilter = document.getElementById('filter-role').value;
    const statusFilter = document.getElementById('filter-status').value;

    staffList = staffList.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search);
        const matchRole = roleFilter === '' || s.role === roleFilter;
        const matchStatus = statusFilter === '' || s.status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const tbody = document.querySelector('#staff-table tbody');
    tbody.innerHTML = '';

    if (staffList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem;">No staff members found.</td></tr>`;
    }

    staffList.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${s.employeeId || 'EMP' + s.id}</strong></td>
                <td><strong>${s.name}</strong></td>
                <td>
                    <div style="font-size:0.875rem;">
                        <i data-lucide="mail" style="width:12px;"></i> ${s.email}<br>
                        <i data-lucide="phone" style="width:12px;"></i> ${s.phone}
                    </div>
                </td>
                <td>
                    ${s.role}<br>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${s.department}</span>
                </td>
                <td>${utils.formatDate(s.joiningDate)}</td>
                <td><span class="badge ${utils.getStatusBadgeClass(s.status)}">${s.status}</span></td>
                <td>
                    <a href="staff-details.html?id=${s.id}" class="btn btn-outline btn-sm" title="View Profile"><i data-lucide="user"></i></a>
                    <button class="btn btn-outline btn-sm" onclick="printSalarySlip(${s.id})" title="Print Salary Slip"><i data-lucide="file-text"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="editStaff(${s.id})" title="Edit"><i data-lucide="edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteStaff(${s.id})" title="Delete"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    });

    lucide.createIcons();
}

function openStaffModal() {
    document.getElementById('staff-modal').classList.add('active');
    document.getElementById('modal-title').textContent = 'Add Staff';
    document.getElementById('staff-form').reset();
    document.getElementById('staff-id').value = '';
}

function closeStaffModal() {
    document.getElementById('staff-modal').classList.remove('active');
}

function editStaff(id) {
    const staff = storage.get('hostel_staff').find(s => s.id === id);
    if (staff) {
        document.getElementById('modal-title').textContent = 'Edit Staff';
        document.getElementById('staff-id').value = staff.id;
        document.getElementById('staff-name').value = staff.name;
        document.getElementById('staff-email').value = staff.email;
        document.getElementById('staff-phone').value = staff.phone;
        document.getElementById('staff-role').value = staff.role;
        document.getElementById('staff-dept').value = staff.department;
        document.getElementById('staff-status').value = staff.status;
        document.getElementById('staff-salary-status').value = staff.salaryStatus || 'Not Received Yet';
        document.getElementById('staff-modal').classList.add('active');
    }
}

function saveStaff() {
    const id = document.getElementById('staff-id').value;
    
    const staffData = {
        name: document.getElementById('staff-name').value,
        email: document.getElementById('staff-email').value,
        phone: document.getElementById('staff-phone').value,
        role: document.getElementById('staff-role').value,
        department: document.getElementById('staff-dept').value,
        status: document.getElementById('staff-status').value,
        salaryStatus: document.getElementById('staff-salary-status').value
    };

    if (id) {
        storage.update('hostel_staff', parseInt(id), staffData);
        utils.showToast('Staff updated successfully', 'success');
    } else {
        staffData.joiningDate = new Date().toISOString().split('T')[0];
        const newStaff = storage.add('hostel_staff', staffData);
        newStaff.employeeId = 'EMP00' + newStaff.id; // auto generate ID
        storage.update('hostel_staff', newStaff.id, newStaff);
        
        // Also add to users table for login
        storage.add('hostel_users', {
            name: staffData.name,
            email: staffData.email,
            phone: staffData.phone,
            password: staffData.role + '@123', // default pass
            role: staffData.role
        });

        utils.showToast('Staff added successfully', 'success');
    }

    closeStaffModal();
    renderStaff();
}

function deleteStaff(id) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        storage.remove('hostel_staff', id);
        utils.showToast('Staff deleted successfully', 'success');
        renderStaff();
    }
}

function printSalarySlip(id) {
    const staff = storage.get('hostel_staff').find(s => s.id === id);
    if (!staff) return;

    // Simulate salary structure based on role
    let baseSalary = 0;
    switch(staff.role) {
        case 'Manager': baseSalary = 85000; break;
        case 'Receptionist': baseSalary = 45000; break;
        case 'Housekeeping': baseSalary = 30000; break;
        case 'Security': baseSalary = 35000; break;
        case 'Maintenance': baseSalary = 40000; break;
        default: baseSalary = 30000;
    }
    
    const allowance = baseSalary * 0.15;
    const deductions = baseSalary * 0.05;
    const netSalary = baseSalary + allowance - deductions;
    const monthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Salary Slip - ${staff.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body { 
                    font-family: 'Inter', sans-serif; 
                    padding: 40px; 
                    color: #1E293B; 
                    background: #FFFFFF; 
                    -webkit-print-color-adjust: exact;
                }
                .slip-box {
                    max-width: 800px;
                    margin: auto;
                    border: 1px solid #E2E8F0;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #F1F5F9;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: 800;
                    color: #4F46E5;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .title {
                    text-align: right;
                }
                .title h2 { margin: 0; color: #0F172A; text-transform: uppercase; font-size: 24px; }
                .title p { margin: 5px 0 0; color: #64748B; font-size: 14px; }
                
                .emp-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    background: #F8FAFC;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                .emp-details p { margin: 5px 0; font-size: 14px; }
                .emp-details strong { color: #334155; display: inline-block; width: 120px; }

                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { background: #F1F5F9; padding: 12px; text-align: left; font-size: 13px; color: #475569; text-transform: uppercase; }
                td { padding: 12px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
                .amount { text-align: right; }
                
                .totals {
                    width: 50%;
                    margin-left: auto;
                    background: #F8FAFC;
                    padding: 20px;
                    border-radius: 8px;
                }
                .totals p {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    font-size: 14px;
                }
                .totals .net {
                    font-size: 18px;
                    font-weight: 700;
                    color: #4F46E5;
                    border-top: 2px solid #E2E8F0;
                    padding-top: 15px;
                    margin-top: 15px;
                }
                
                .footer {
                    margin-top: 50px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                    color: #64748B;
                }
                .signature {
                    border-top: 1px solid #CBD5E1;
                    padding-top: 10px;
                    width: 200px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="slip-box">
                <div class="header">
                    <div class="logo">
                        <div style="background:#4F46E5; color:white; width:36px; height:36px; border-radius:8px; display:flex; justify-content:center; align-items:center; font-size:18px;">H</div>
                        HostelHub
                    </div>
                    <div class="title">
                        <h2>Salary Slip</h2>
                        <p>For the month of ${monthYear}</p>
                    </div>
                </div>

                <div class="emp-details">
                    <div>
                        <p><strong>Employee Name:</strong> ${staff.name}</p>
                        <p><strong>Employee ID:</strong> ${staff.employeeId || 'EMP'+staff.id}</p>
                        <p><strong>Designation:</strong> ${staff.role}</p>
                    </div>
                    <div>
                        <p><strong>Department:</strong> ${staff.department}</p>
                        <p><strong>Salary Status:</strong> <span style="font-weight:700; color:${staff.salaryStatus === 'Paid' ? '#10B981' : '#F59E0B'}">${staff.salaryStatus || 'Not Received Yet'}</span></p>
                        <p><strong>Status:</strong> ${staff.status}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Earnings</th>
                            <th class="amount">Amount (PKR)</th>
                            <th>Deductions</th>
                            <th class="amount">Amount (PKR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Basic Salary</td>
                            <td class="amount">${utils.formatCurrency(baseSalary)}</td>
                            <td>Provident Fund (5%)</td>
                            <td class="amount">${utils.formatCurrency(deductions)}</td>
                        </tr>
                        <tr>
                            <td>House & Medical (15%)</td>
                            <td class="amount">${utils.formatCurrency(allowance)}</td>
                            <td>Tax</td>
                            <td class="amount">PKR 0.00</td>
                        </tr>
                    </tbody>
                </table>

                <div class="totals">
                    <p><span>Total Earnings:</span> <span>${utils.formatCurrency(baseSalary + allowance)}</span></p>
                    <p><span>Total Deductions:</span> <span>${utils.formatCurrency(deductions)}</span></p>
                    <p class="net"><span>Net Salary:</span> <span>${utils.formatCurrency(netSalary)}</span></p>
                </div>

                <div class="footer">
                    <div class="signature">Employer Signature</div>
                    <div class="signature">Employee Signature</div>
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
