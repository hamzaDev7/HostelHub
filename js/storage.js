const defaultSettings = {
    hostelName: 'HostelHub',
    address: '123 University Road, City Center',
    phone: '+1 234 567 8900',
    email: 'info@hostelhub.com',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    cancellationPolicy: '48 hours prior to check-in',
    maxBookingDuration: 30,
    emailNotifications: true,
    bookingAlerts: true,
    paymentAlerts: true,
    cleaningAlerts: true,
    theme: 'light'
};

const demoUsers = [
    { id: 1, name: 'Admin User', email: 'admin@hostelhub.com', password: 'Admin@123', role: 'Super Admin', phone: '+1234567890' },
    { id: 2, name: 'Manager User', email: 'manager@hostelhub.com', password: 'Manager@123', role: 'Manager', phone: '+1234567891' },
    { id: 3, name: 'Reception User', email: 'reception@hostelhub.com', password: 'Reception@123', role: 'Receptionist', phone: '+1234567892' },
    { id: 4, name: 'Cleaner User', email: 'cleaner@hostelhub.com', password: 'Cleaner@123', role: 'Housekeeping', phone: '+1234567893' },
    { id: 5, name: 'Guest User', email: 'guest@hostelhub.com', password: 'Guest@123', role: 'Guest', phone: '+1234567894' }
];

const demoRooms = [
    { id: 1, number: '101', floor: 1, type: 'Single', capacity: 1, price: 1500, status: 'Available', amenities: ['Wi-Fi', 'AC', 'TV'], description: 'Cozy single room for solo travelers.', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800' },
    { id: 2, number: '102', floor: 1, type: 'Double', capacity: 2, price: 2500, status: 'Occupied', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Fridge'], description: 'Spacious double room for couples.', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800' },
    { id: 3, number: '103', floor: 1, type: 'Twin', capacity: 2, price: 2400, status: 'Available', amenities: ['Wi-Fi', 'AC'], description: 'Twin room with two single beds.', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=800' },
    { id: 4, number: '201', floor: 2, type: 'Triple', capacity: 3, price: 3500, status: 'Reserved', amenities: ['Wi-Fi', 'AC', 'Balcony'], description: 'Perfect for small groups.', image: 'https://images.unsplash.com/photo-1582719478250-c89404cb269c?auto=format&fit=crop&q=80&w=800' },
    { id: 5, number: '202', floor: 2, type: 'Dormitory', capacity: 6, price: 800, status: 'Available', amenities: ['Wi-Fi', 'Lockers'], description: 'Budget-friendly dormitory bed.', image: 'https://images.unsplash.com/photo-1522771731475-6a9efa43b593?auto=format&fit=crop&q=80&w=800' },
    { id: 6, number: '301', floor: 3, type: 'Deluxe', capacity: 2, price: 4500, status: 'Available', amenities: ['Wi-Fi', 'AC', 'TV', 'Mini Fridge', 'Bathtub', 'Balcony'], description: 'Premium deluxe room with stunning views.', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800' },
    { id: 7, number: '302', floor: 3, type: 'Single', capacity: 1, price: 1500, status: 'Cleaning', amenities: ['Wi-Fi', 'AC'], description: 'Standard single room.', image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800' },
    { id: 8, number: '401', floor: 4, type: 'Double', capacity: 2, price: 2600, status: 'Maintenance', amenities: ['Wi-Fi', 'AC', 'TV'], description: 'Currently under maintenance.', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800' }
];

const demoGuests = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', phone: '+1 555-0101', room: '102', checkIn: '2023-10-01', checkOut: '2023-10-05', status: 'Checked In' },
    { id: 2, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1 555-0102', room: '201', checkIn: '2023-10-10', checkOut: '2023-10-15', status: 'Reserved' },
    { id: 3, name: 'Charlie Davis', email: 'charlie@example.com', phone: '+1 555-0103', room: '101', checkIn: '2023-09-20', checkOut: '2023-09-25', status: 'Checked Out' }
];

const demoBookings = [
    { id: 1, guestId: 1, guestName: 'Alice Smith', roomId: 2, roomNumber: '102', checkIn: '2023-10-01', checkOut: '2023-10-05', guests: 2, amount: 10000, paymentStatus: 'Paid', status: 'Checked In', date: '2023-09-15' },
    { id: 2, guestId: 2, guestName: 'Bob Johnson', roomId: 4, roomNumber: '201', checkIn: '2023-10-10', checkOut: '2023-10-15', guests: 3, amount: 17500, paymentStatus: 'Pending', status: 'Confirmed', date: '2023-09-20' },
    { id: 3, guestId: 3, guestName: 'Charlie Davis', roomId: 1, roomNumber: '101', checkIn: '2023-09-20', checkOut: '2023-09-25', guests: 1, amount: 7500, paymentStatus: 'Paid', status: 'Checked Out', date: '2023-09-01' }
];

const demoPayments = [
    { id: 1, bookingId: 1, guestName: 'Alice Smith', amount: 10000, method: 'Card', date: '2023-09-15', status: 'Paid' },
    { id: 2, bookingId: 3, guestName: 'Charlie Davis', amount: 7500, method: 'Cash', date: '2023-09-20', status: 'Paid' }
];

const demoStaff = [
    { id: 1, employeeId: 'EMP001', name: 'John Manager', email: 'manager@hostelhub.com', phone: '+1 555-0201', role: 'Manager', department: 'Administration', joiningDate: '2022-01-15', status: 'Active' },
    { id: 2, employeeId: 'EMP002', name: 'Sarah Reception', email: 'reception@hostelhub.com', phone: '+1 555-0202', role: 'Receptionist', department: 'Front Desk', joiningDate: '2022-03-10', status: 'Active' },
    { id: 3, employeeId: 'EMP003', name: 'Mike Cleaner', email: 'cleaner@hostelhub.com', phone: '+1 555-0203', role: 'Housekeeping', department: 'Maintenance', joiningDate: '2022-05-20', status: 'Active' }
];

const demoHousekeeping = [
    { id: 1, roomId: 7, roomNumber: '302', staffId: 3, staffName: 'Mike Cleaner', status: 'In Progress', priority: 'High', lastCleaned: '2023-10-01', nextCleaning: '2023-10-02', notes: 'Guest requested extra towels.' },
    { id: 2, roomId: 1, roomNumber: '101', staffId: 3, staffName: 'Mike Cleaner', status: 'Pending', priority: 'Medium', lastCleaned: '2023-10-01', nextCleaning: '2023-10-03', notes: 'Routine cleaning.' }
];

const demoNotifications = [
    { id: 1, title: 'New Booking', message: 'Bob Johnson booked room 201.', date: '2023-09-20T10:00:00Z', read: false },
    { id: 2, title: 'Payment Received', message: 'Payment of 10000 received from Alice Smith.', date: '2023-09-15T14:30:00Z', read: true }
];

function initializeData() {
    if (!localStorage.getItem('hostel_settings')) {
        localStorage.setItem('hostel_settings', JSON.stringify(defaultSettings));
        localStorage.setItem('hostel_users', JSON.stringify(demoUsers));
        localStorage.setItem('hostel_rooms', JSON.stringify(demoRooms));
        localStorage.setItem('hostel_guests', JSON.stringify([]));
        localStorage.setItem('hostel_bookings', JSON.stringify([]));
        localStorage.setItem('hostel_payments', JSON.stringify([]));
        localStorage.setItem('hostel_staff', JSON.stringify([]));
        localStorage.setItem('hostel_housekeeping', JSON.stringify([]));
        localStorage.setItem('hostel_notifications', JSON.stringify([]));
    }
}

function loadAllDemoData() {
    localStorage.setItem('hostel_guests', JSON.stringify(demoGuests));
    localStorage.setItem('hostel_bookings', JSON.stringify(demoBookings));
    localStorage.setItem('hostel_payments', JSON.stringify(demoPayments));
    localStorage.setItem('hostel_staff', JSON.stringify(demoStaff));
    localStorage.setItem('hostel_housekeeping', JSON.stringify(demoHousekeeping));
    localStorage.setItem('hostel_notifications', JSON.stringify(demoNotifications));
    localStorage.setItem('hostel_rooms', JSON.stringify(demoRooms));
}

const storage = {
    get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    add: (key, item) => {
        const data = storage.get(key);
        item.id = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
        data.push(item);
        storage.set(key, data);
        return item;
    },
    update: (key, id, item) => {
        const data = storage.get(key);
        const index = data.findIndex(d => d.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...item };
            storage.set(key, data);
            return data[index];
        }
        return null;
    },
    remove: (key, id) => {
        const data = storage.get(key);
        const newData = data.filter(d => d.id !== id);
        storage.set(key, newData);
    },
    loadDemoData: loadAllDemoData
};

initializeData();
