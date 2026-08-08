# HostelHub Management System

Welcome to the **HostelHub Management System** – a complete, production-ready, and fully responsive web application designed for managing hostels, hotels, and guest houses. 

This project is built purely with **Vanilla Front-End Technologies** (HTML, CSS, JavaScript) and relies entirely on **LocalStorage** for data persistence. It requires absolutely no backend, no database setup, and no complex build tools to run, making it the perfect lightweight yet comprehensive solution or portfolio piece.

## 🚀 Key Features

### 🌐 Public Facing Pages
- **Modern Landing Page**: Stunning glassmorphism design, smooth scrolling, dynamic hover effects, and a mobile-friendly responsive navigation bar.
- **Rooms Catalog**: Users can explore available rooms, view amenities, pricing, and initiate bookings.
- **Information Pages**: Includes fully styled About, Facilities, Contact, Privacy Policy, Terms & Conditions, and Disclaimer pages.
- **Native Mail Integration**: The Contact form safely intercepts user input to construct pre-filled emails sent directly via the user's native email client.

### 🔐 Authentication & Data Management
- **Login / Signup Flow**: Secure UI for logging in and registering.
- **Demo Mode**: Includes one-click "Demo Credentials" that instantly populate the system with robust mock data (guests, bookings, payments, staff) for immediate testing.
- **Fresh State**: Standard registrations initialize with clean, blank data arrays for a pristine onboarding experience.

### 📊 Admin Dashboard
- **Analytics & Charts**: Real-time visualization of Revenue and Room Occupancy using **Chart.js**.
- **Bookings Management**: Full CRUD operations for bookings. Track dates, guest count, and payment statuses. 
- **Guest Tracking**: Manage guest profiles, track precise Check-in/Check-out timestamps, and assign specific room numbers.
- **Room Management**: Update room statuses (Available, Occupied, Cleaning, Maintenance), capacities, prices, and amenities.
- **Financials (Payments)**: Track transactions and instantly generate printable, professional-grade invoices.
- **Staff & Payroll**: Manage employee directories. Includes an advanced feature to automatically calculate deductions/allowances and generate **Printable Salary Slips**.
- **Housekeeping**: Assign cleaning tasks to specific staff members with priority levels and statuses.
- **Reporting System**: Export data dynamically. Includes specialized print-media CSS ensuring that generated PDFs and printed reports strip away menus and look like official documents.

## 🛠️ Technology Stack
- **HTML5**: Semantic, accessible markup.
- **CSS3**: Vanilla CSS utilizing CSS Variables (Custom Properties) for extensive theming (Light/Dark Mode), Flexbox/Grid layouts, and deep media queries for 100% mobile responsiveness.
- **Vanilla JavaScript (ES6+)**: Handles all state management, routing simulation, and DOM manipulation without any heavy frameworks (No React, Angular, or Vue).
- **LocalStorage API**: Simulates a persistent database entirely within the browser.
- **Lucide Icons**: Clean, scalable, lightweight SVG icons.
- **Chart.js**: Utilized for rendering dashboard analytics.

## 📱 Responsiveness
This application has been meticulously audited for cross-device compatibility:
- **Mobile First**: Forms and modals stack vertically. Tables feature `-webkit-overflow-scrolling: touch` for smooth horizontal swiping without breaking layouts.
- **Dynamic Headers**: The admin search bar automatically toggles into a dropdown mode on narrow screens to prevent overlapping navigation icons.
- **Print Friendly**: Specialized `@media print` rules ensure invoices, reports, and salary slips print perfectly on A4 paper.

## ⚙️ How to Run
Because this project utilizes zero backend architecture:
1. Clone or download the repository.
2. Open `index.html` directly in any modern web browser (Chrome, Firefox, Safari, Edge).
3. **No `npm install`**, **no local server**, and **no databases** are required!

## 🤝 Contact & Support
- **Email**: hamzazahooryts@gmail.com
- **Phone**: +923348910673
- **Location**: University Of Gujrat

---
*Developed with a focus on premium UI/UX and zero-dependency architecture.*
