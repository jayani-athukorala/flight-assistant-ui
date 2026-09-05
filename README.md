![Lexicon Logo](https://lexicongruppen.se/media/wi5hphtd/lexicon-logo.svg)

# ✈️ Flight Assistant UI

Responsive React and TypeScript client for the Flight Assistant reservation system. It supports normal flight-booking workflows and an interactive AI chatbot connected to the Spring Boot API.

## Features

- Browse and filter available flights
- View seat classes, prices, and availability
- JWT registration, login, and protected routes
- Create one-way or round-trip bookings
- View and cancel personal bookings
- Open the assistant from any page
- Structured airport, flight, seat, and booking cards
- Explicit confirmation controls for sensitive actions
- Loading, retry, empty, and authentication-required states
- Responsive and keyboard-accessible interface
- Conversation preservation while navigating

## Technology

React 19, TypeScript, Vite, React Router, Axios, Tailwind CSS, Lucide React and ESLint.

## Local setup

```bash
git clone https://github.com/jayani-athukorala/flight-assistant-ui.git
cd flight-assistant-ui
npm install
npm run dev
```

Create `.env.local`:

```env
VITE_API_URL=http://localhost:8080/api
```

The frontend runs at `http://localhost:5173` by default. Start the backend before testing API requests.

## Main routes

```text
/              Home
/available     Available flights
/bookings      Authenticated user's bookings
/booking/:id   Booking flow
/login         Login
/register      Registration
```

## Assistant integration

The chatbot sends messages to:

```http
POST /api/assistant/chat
```

Axios automatically includes the JWT for authenticated requests. React renders important data from structured response fields instead of parsing assistant text. Creating or cancelling a booking requires the user to press a confirmation button.

## Build

```bash
npm run lint
npm run build
```

Set `VITE_API_URL` to the deployed backend URL before building for production, for example:

```env
VITE_API_URL=https://your-flight-assistant-api.onrender.com/api
```

## Repository

[github.com/jayani-athukorala/flight-assistant-ui](https://github.com/jayani-athukorala/flight-assistant-ui)

## Author

Jayani Athukorala
