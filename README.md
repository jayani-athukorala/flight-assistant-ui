# ✈️ Flight Booking UI

A modern React and TypeScript frontend for the Flight Booking application.

The application allows users to browse flights, view available seats, authenticate using JWT, create bookings, view their bookings, and cancel bookings.

The frontend communicates with the separate **Flight Booking API** backend.

---

## 🛠️ Technologies

* React
* TypeScript
* Vite
* React Router
* Axios
* Tailwind CSS
* Lucide React
* JWT Authentication
* ESLint

---

# 📁 Project Structure

```text
flight-booking-ui/
│
├── src/
│   ├── api/
│   │   ├── axios.ts
│   │   ├── authService.ts
│   │   └── flightService.ts
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Footer.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── FlightsPage.tsx
│   │   ├── AvailableFlightsPage.tsx
│   │   ├── BookingLookupPage.tsx
│   │   ├── BookingPage.tsx
│   │   └── NotFound.tsx
│   ├── types/
│   │   ├── Booking.ts
│   │   └── Flight.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

# 🚀 Features

### 🏠 Home

Provides an introduction to the Flight Booking application.

### ✈️ Browse Flights

Users can:

* View all flights
* View available flights
* View individual flight details
* View available seats
* Filter seats by class

### 🔐 Authentication

Users can:

* Register
* Login
* Logout
* Maintain an authenticated session using JWT

### 🎫 Booking

Authenticated users can:

* Select a flight
* Select trip type
* Select seat class
* Add passengers
* Create a booking

### 📋 My Bookings

Authenticated users can view their own bookings.

### ❌ Cancel Booking

Authenticated users can cancel their own bookings.

---

# 🔐 Authentication Flow

The frontend uses JWT authentication.

The flow is:

```text
User
 ├── Register
 │      └── POST /api/auth/register
 ├── Login
 │      └── POST /api/auth/login
 │              └── JWT token
 └── Store authentication state
        └── Send JWT with protected requests
```

The JWT is sent using:

```http
Authorization: Bearer <JWT>
```

---

# 🛡️ Protected Routes

Booking-related pages and operations require authentication.

The frontend uses:

```text
ProtectedRoute.tsx
```

Example:

```tsx
<ProtectedRoute>
    <BookingPage />
</ProtectedRoute>
```

If a user tries to access a protected page without logging in, they are redirected to:

```text
/login
```

The original URL can be stored so the user can return to the requested page after successful authentication.

Example:

```text
User clicks "Book Flight"
        ↓
User is not authenticated
        ↓
Redirect to /login
        ↓
User logs in
        ↓
Return to booking page
```

---

# 🔑 Authentication Components

Authentication components are located in:

```text
src/components/auth/
```

### Login

```text
Login.tsx
```

Responsible for:

* Email input
* Password input
* Calling `/api/auth/login`
* Storing authentication information
* Redirecting the user after login

### Register

```text
Register.tsx
```

Responsible for:

* Creating a new account
* Calling `/api/auth/register`
* Redirecting the user to login

### ProtectedRoute

```text
ProtectedRoute.tsx
```

Responsible for preventing unauthenticated users from accessing protected routes.

---

# 🧭 Routing

React Router is used for application navigation.

Main routes include:

```text
/
├── /flights
├── /available
├── /bookings
├── /booking/:id
├── /login
├── /register
└── *
```

Authentication-protected routes should be wrapped with:

```tsx
<ProtectedRoute>
    ...
</ProtectedRoute>
```

---

# 🌐 API Configuration

The frontend communicates with the backend using Axios.

The API client is configured in:

```text
src/api/axios.ts
```

Base URL:

```text
http://localhost:8080/api
```

Example:

```ts
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
```

---

# 🔗 API Endpoints Used

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## Flights

```text
GET /api/flights
GET /api/flights/available
GET /api/flights/{id}
```

## Seats

```text
GET /api/flights/{flightId}/seats
GET /api/flights/{flightId}/seats/class
```

## Bookings

```text
POST /api/flights/{flightId}/book
GET /api/flights/bookings/my
DELETE /api/flights/{bookingId}/cancel
```

---

# 📦 Installation

Clone the repository:

```bash
git clone https://github.com/jayani-athukorala/flight-booking-ui.git
```

Navigate to the project:

```bash
cd flight-booking-ui
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

---

# 🔧 Backend Requirement

The frontend requires the Flight Booking API to be running.

Backend:

```text
http://localhost:8080
```

Frontend:

```text
http://localhost:5173
```

The architecture is:

```text
┌──────────────────────┐
│   React + TypeScript │
│   flight-booking-ui  │
│                      │
│   localhost:5173     │
└──────────┬───────────┘
           │
           │ HTTP / JSON
           │ JWT
           ▼
┌──────────────────────┐
│ Spring Boot API      │
│ flight-booking-api   │
│                      │
│ localhost:8080       │
└──────────┬───────────┘
           │
           │ JPA / Hibernate
           ▼
┌──────────────────────┐
│       MySQL 8        │
│ flight_booking_db    │
└──────────────────────┘
```

---

# 🔒 CORS

The backend allows requests from the frontend development server.

Development frontend:

```text
http://localhost:5173
```

If the frontend URL changes, the backend CORS configuration must be updated accordingly.

---

# 🧪 Example Login

Sample account:

```text
Email: john@test.com
Password: password123
```

Login:

```text
POST http://localhost:8080/api/auth/login
```

The returned JWT is used for protected API requests.

---

# 📝 Booking Flow

The booking flow is:

```text
Browse Flights
      │
      ▼
Select Flight
      │
      ▼
Click "Book Flight"
      │
      ▼
Authenticated?
   │          │
  NO         YES
   │          │
   ▼          ▼
 Login      Booking
   │         Form
   │          │
   └──────┬───┘
          ▼
      Select Seats
          │
          ▼
       Add Passenger
          │
          ▼
      Confirm Booking
          │
          ▼
     Booking Created
```

---

# 🎨 UI Structure

The application uses reusable components for:

* Navigation
* Footer
* Authentication
* Flight cards
* Booking forms
* Seat selection
* Error handling
* Protected routes

Lucide React is used for interface icons.

---

# 🔄 Backend Repository

The backend is maintained separately:

```text
flight-booking-api
```

It provides:

* REST API
* Authentication
* JWT security
* Flight management
* Seat management
* Booking management
* Passenger management
* MySQL persistence
* Swagger documentation

---

# 👤 Author

## ✈️ Flight Booking Application

- **Backend:** [GitHub Repository](https://github.com/jayani-athukorala/flight-booking-api)
- **Frontend:** [GitHub Repository](https://github.com/jayani-athukorala/flight-booking-ui)