const utils = {
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
    },
    formatDate: (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },
    formatDateTime: (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleString(undefined, options);
    },
    showToast: (message, type = 'info') => {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'info';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'alert-circle';
        if (type === 'warning') icon = 'alert-triangle';

        toast.innerHTML = `
            <i data-lucide="${icon}"></i>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons({ root: toast });
        }

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },
    calculateNights: (checkIn, checkOut) => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    getStatusBadgeClass: (status) => {
        const statuses = {
            'Available': 'badge-success',
            'Occupied': 'badge-danger',
            'Reserved': 'badge-warning',
            'Cleaning': 'badge-info',
            'Maintenance': 'badge-secondary',
            'Paid': 'badge-success',
            'Pending': 'badge-warning',
            'Confirmed': 'badge-success',
            'Checked In': 'badge-info',
            'Checked Out': 'badge-secondary',
            'Cancelled': 'badge-danger',
            'In Progress': 'badge-info',
            'Completed': 'badge-success',
            'Active': 'badge-success'
        };
        return statuses[status] || 'badge-secondary';
    }
};
