# Anime & TV Series Tracker - Backend

This is the backend API for the Anime & TV Series Tracker application, built with Node.js, Express, and MongoDB.

## Features

- **RESTful API**: A complete set of endpoints for managing users, anime, watchlists, clubs, and more.
- **JWT Authentication**: Secure, token-based authentication to protect user data and routes.
- **Admin Functionality**: Protected routes for administrative tasks like managing users and content.
- **MongoDB Integration**: Uses Mongoose for elegant and straightforward database modeling and interaction.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm
- MongoDB (local instance or a cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository**:
    ```sh
    git clone <repository-url>
    ```
2.  **Navigate to the backend directory**:
    ```sh
    cd backend
    ```
3.  **Install dependencies**:
    ```sh
    npm install
    ```

### Environment Configuration

1.  **Create a `.env` file** in the `backend` directory.
2.  **Add the following environment variables**:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    PORT=5000
    ```

### Running the Application

-   **To run in development mode (with hot-reloading)**:
    ```sh
    npm run dev
    ```
-   **To run in production mode**:
    ```sh
    npm start
    ```

The server will be available at `http://localhost:5000`.

## Folder Structure

```
/
|-- /middleware   # Custom middleware (e.g., auth, admin)
|-- /models       # Mongoose schemas for the database
|-- /routes       # API route definitions
|-- server.js     # Main server entry point
|-- .env          # Environment variables (not committed)
```

## API Endpoints

-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/login`: Log in a user.
-   `GET /api/auth/me`: Get the current authenticated user.
-   `GET /api/anime`: Get a list of anime with filtering and pagination.
-   `GET /api/anime/:id`: Get details for a specific anime.
-   `GET /api/users/watchlist`: Get the current user's watchlist.
-   `POST /api/anime/:id/watchlist`: Add or update an anime in the watchlist.
-   `GET /api/clubs`: Get a list of all clubs.
-   `POST /api/clubs`: Create a new club.
-   `GET /api/clubs/:id`: Get details for a specific club.
-   `GET /api/admin/users`: [Admin] Get all users.
