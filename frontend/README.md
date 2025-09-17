# Anime & TV Series Tracker - Frontend

This is the frontend for the Anime & TV Series Tracker application, built with React and Material-UI.

## Features

- **User Authentication**: Secure login and registration.
- **Anime Discovery**: Browse, search, and filter a vast catalog of anime.
- **Personal Watchlist**: Track your anime progress with statuses like "Watching," "Completed," etc.
- **Community Clubs**: Create, join, and participate in discussions in community-run clubs.
- **Personalized Dashboard**: Get a personalized overview of your stats and recommendations.
- **User Profiles**: View your stats, recent activity, and social connections.
- **Admin Panel**: A secure area for administrators to manage the application.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm

### Installation

1.  **Clone the repository**:
    ```sh
    git clone <repository-url>
    ```
2.  **Navigate to the frontend directory**:
    ```sh
    cd frontend
    ```
3.  **Install dependencies**:
    ```sh
    npm install
    ```

### Running the Application

1.  **Create a `.env` file** in the `frontend` directory and add your backend API URL:
    ```
    REACT_APP_API_URL=http://localhost:5000/api
    ```
2.  **Start the development server**:
    ```sh
    npm start
    ```

The application will be available at `http://localhost:3000`.

## Folder Structure

```
/src
|-- /components   # Reusable components (layout, profile, etc.)
|-- /context      # Global state management (Auth, Watchlist)
|-- /pages        # Top-level page components
|-- /services     # API service for backend communication
|-- App.js        # Main application component with routing
|-- index.js      # Entry point of the application
```

## Available Scripts

-   `npm start`: Runs the app in development mode.
-   `npm build`: Builds the app for production.
-   `npm test`: Runs the test suite.
-   `npm eject`: Ejects from Create React App (use with caution).
