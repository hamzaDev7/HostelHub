document.addEventListener('DOMContentLoaded', () => {
    auth.checkRole(['Super Admin', 'Manager', 'Receptionist']);
    renderPayments();

    document.getElementById('search-input').addEventListener('input', renderPayments);
    document.getElementById('filter-status').addEventListener('change', renderPayments);

    document.getElementById('payment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        savePayment();
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

function renderPayments() {
    let payments = storage.get('hostel_payments');
    
    const search = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('filter-status').value;

    payments = payments.filter(p => {
        const matchSearch = p.guestName.toLowerCase().includes(search) || p.id.toString().includes(search) || p.bookingId.toString().includes(search);
        const matchStatus = statusFilter === '' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    payments.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.querySelector('#payments-table tbody');
    tbody.innerHTML = '';

    if (payments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem;">No payments found.</td></tr>`;
    }

    payments.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td>#${p.id}</td>
                <td>#${p.bookingId}</td>
                <td><strong>${p.guestName}</strong></td>
                <td><strong>${utils.formatCurrency(p.amount)}</strong></td>
                <td>${p.method}</td>
                <td>${utils.formatDate(p.date)}</td>
                <td><span class="badge ${utils.getStatusBadgeClass(p.status)}">${p.status}</span></td>
                <td>
                    <button class="btn btn-outline btn-sm" onclick="editPayment(${p.id})" title="Update Status"><i data-lucide="edit"></i></button>
                    <button class="btn btn-outline btn-sm" onclick="printReceipt(${p.bookingId})" title="Print Receipt"><i data-lucide="printer"></i></button>
                </td>
            </tr>
        `;
    });

    lucide.createIcons();
}

function editPayment(id) {
    const payment = storage.get('hostel_payments').find(p => p.id === id);
    if (payment) {
        document.getElementById('edit-payment-id').value = payment.id;
        document.getElementById('edit-payment-status').value = payment.status;
        document.getElementById('payment-modal').classList.add('active');
    }
}

function closePaymentModal() {
    document.getElementById('payment-modal').classList.remove('active');
}

function savePayment() {
    const id = parseInt(document.getElementById('edit-payment-id').value);
    const payment = storage.get('hostel_payments').find(p => p.id === id);
    
    if (payment) {
        payment.status = document.getElementById('edit-payment-status').value;
        storage.update('hostel_payments', id, payment);
        
        // Update booking payment status too
        const booking = storage.get('hostel_bookings').find(b => b.id === payment.bookingId);
        if (booking && (payment.status === 'Paid' || payment.status === 'Pending')) {
            booking.paymentStatus = payment.status;
            storage.update('hostel_bookings', booking.id, booking);
        }
        
        utils.showToast('Payment status updated', 'success');
        closePaymentModal();
        renderPayments();
    }
}

function printReceipt(bookingId) {
    const booking = storage.get('hostel_bookings').find(b => b.id === bookingId);
    if (!booking) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Invoice - #${booking.id}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                body { 
                    font-family: 'Inter', sans-serif; 
                    padding: 40px; 
                    color: #1E293B; 
                    background: #F8FAFC; 
                    -webkit-print-color-adjust: exact;
                }
                .invoice-box {
                    max-width: 800px;
                    margin: auto;
                    padding: 40px;
                    background: #FFFFFF;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
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
                .company-info {
                    text-align: right;
                    color: #64748B;
                    font-size: 14px;
                }
                .invoice-title {
                    font-size: 36px;
                    font-weight: 800;
                    margin: 0;
                    color: #0F172A;
                }
                .grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .info-block h4 {
                    font-size: 12px;
                    text-transform: uppercase;
                    color: #64748B;
                    margin: 0 0 5px 0;
                    letter-spacing: 0.05em;
                }
                .info-block p { margin: 0; font-weight: 600; font-size: 15px; }
                
                .table-container { margin-bottom: 40px; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th {
                    background: #F8FAFC;
                    color: #64748B;
                    font-size: 12px;
                    text-transform: uppercase;
                    padding: 15px;
                    text-align: left;
                    font-weight: 600;
                }
                td {
                    padding: 15px;
                    border-bottom: 1px solid #F1F5F9;
                    font-weight: 500;
                }
                .total-row {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 20px;
                }
                .total-box {
                    background: #EEF2FF;
                    padding: 20px 30px;
                    border-radius: 12px;
                    min-width: 250px;
                }
                .total-box .line {
                    display: flex; justify-content: space-between; margin-bottom: 10px;
                    color: #4F46E5; font-weight: 600;
                }
                .total-box .final {
                    display: flex; justify-content: space-between;
                    font-size: 24px; font-weight: 800; color: #4F46E5;
                    border-top: 2px solid #C7D2FE;
                    padding-top: 10px; margin-top: 10px;
                }
                .badge {
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    background: #DC2626; color: white;
                }
                .badge.Paid, .badge.Confirmed { background: #10B981; }
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
            <div class="invoice-box">
                <div class="header">
                    <div>
                        <div class="logo">
                            <div class="logo-icon">H</div>
                            HostelHub
                        </div>
                    </div>
                    <div class="company-info">
                        <h2 class="invoice-title">RECEIPT</h2>
                        <p>#INV-${new Date().getFullYear()}-${String(booking.id).padStart(4, '0')}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="info-block">
                        <h4>Billed To:</h4>
                        <p style="font-size: 18px;">${booking.guestName}</p>
                        <p style="color: #64748B; font-weight: 400; margin-top: 5px;">Guest ID: #${booking.guestId || '-'}</p>
                    </div>
                    <div class="info-block" style="text-align: right;">
                        <h4>Payment Status</h4>
                        <span class="badge ${booking.paymentStatus}">${booking.paymentStatus}</span>
                        <h4 style="margin-top: 15px;">Booking Status</h4>
                        <span class="badge ${booking.status}">${booking.status}</span>
                    </div>
                </div>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Check In</th>
                                <th>Check Out</th>
                                <th>Guests</th>
                                <th style="text-align: right;">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong style="color: #0F172A; display:block;">Room ${booking.roomNumber}</strong>
                                    <span style="color: #64748B; font-size:13px;">Hostel Accommodation</span>
                                </td>
                                <td>${utils.formatDate(booking.checkIn)}</td>
                                <td>${utils.formatDate(booking.checkOut)}</td>
                                <td>${booking.guests}</td>
                                <td style="text-align: right; font-weight: 700;">${utils.formatCurrency(booking.amount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="total-row">
                    <div class="total-box">
                        <div class="line"><span>Subtotal:</span> <span>${utils.formatCurrency(booking.amount / 1.05)}</span></div>
                        <div class="line"><span>Tax (5%):</span> <span>${utils.formatCurrency(booking.amount - (booking.amount / 1.05))}</span></div>
                        <div class="final"><span>Total:</span> <span>${utils.formatCurrency(booking.amount)}</span></div>
                    </div>
                </div>

                <div class="footer-note">
                    <p>Thank you for choosing HostelHub. We hope you enjoyed your stay!</p>
                    <p style="font-size: 12px; margin-top: 5px;">If you have any questions, please contact info@hostelhub.com</p>
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
