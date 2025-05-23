# Notes App with Split Deployment

This application demonstrates how to deploy a Notes application with:
- Backend running on your local machine
- Frontend running on a VM (Virtual Machine)

## Setup Instructions

### 1. Backend Setup (Local Machine)

1. Clone this repository to your local machine
2. Install dependencies:
   ```
   npm install
   ```
3. Setup environment variables by creating a `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASS=your_mysql_password
   DB_NAME=your_database_name
   
   # JWT Configuration
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   
   # Frontend URL for CORS in production
   FRONTEND_URL=http://your_frontend_url
   ```
4. Start the backend server:
   ```
   node server.js
   ```
5. Note the IP address shown in the console output. You'll need this to connect the VM frontend.

### 2. Frontend Setup (VM)

1. Copy the `vm-frontend` folder to your VM
2. You can serve these files using any HTTP server. For example:
   - Using Python's built-in server:
     ```
     cd vm-frontend
     python -m http.server 8080
     ```
   - Or using Node.js with http-server:
     ```
     npm install -g http-server
     cd vm-frontend
     http-server -p 8080
     ```
3. Access the frontend in your browser at `http://VM-IP-ADDRESS:8080`
4. When prompted, enter the IP address and port (3000) of your local backend server

## How it Works

- The backend provides a REST API that the frontend consumes
- Cross-Origin Resource Sharing (CORS) is configured to allow requests from any origin
- The frontend connects to the backend using the IP address and port you provide

## Testing Connection

1. Start the backend on your local machine
2. Note the local IP address shown in the console (not localhost/127.0.0.1)
3. Access the frontend on the VM
4. Enter the local IP address and port when prompted
5. If everything works correctly, you'll see your notes displayed

## Troubleshooting

If you encounter connection issues:

1. Make sure your local firewall allows incoming connections on port 3000
2. Verify the VM and local machine are on the same network
3. Try using the network IP address instead of localhost
4. Check that CORS is properly configured in the backend
5. Look at the browser console for any error messages
6. Make sure the backend server is running

## Architecture

```
┌─────────────────┐               ┌─────────────────┐
│                 │               │                 │
│     VM          │◄──────────────┤  Local Machine  │
│     Frontend    │      HTTP     │     Backend     │
│                 │      API      │                 │
└─────────────────┘   Requests    └─────────────────┘
                                         │
                                         │
                                   ┌─────▼────────┐
                                   │             │
                                   │  Database   │
                                   │             │
                                   └─────────────┘
```

# Notes App

A feature-rich notes application with a modern UI built using jQuery, AJAX, and Tailwind CSS, connected to a MySQL database hosted on Google Cloud Platform.

## Features

- Create, read, update, and delete notes
- Categorize notes (Work, Personal, Study)
- Search functionality
- Responsive design with sidebar navigation
- Grid and list view options
- Filter notes by category
- Modern UI with animations and notifications
- Cloud-hosted MySQL database on GCP
- Environment variable configuration
- **Authentication with JWT tokens:**
  - User registration and login
  - Secure routes with access tokens
  - Automatic token refresh with refresh tokens
  - User-specific notes (users can only see their own notes)

## Screenshots

![Notes App Screenshot](https://via.placeholder.com/800x450.png?text=Notes+App+Screenshot)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MySQL database (hosted on GCP)

### Installation

1. Clone the repository or extract the files to your preferred location

2. Navigate to the project directory
```bash
cd "C:/Nitro/Cloud Computing/Final Notes/Tugas4/Notes"
```

3. Install dependencies
```bash
npm install
```

4. Configure environment variables
   - Rename `.env.example` to `.env` (if needed)
   - Update database credentials and other configurations in the `.env` file

5. Start the server
```bash
npm start
```

6. For development with auto-restart:
```bash
npm run dev
```

7. Generate new JWT secrets (optional - already included in .env):
```bash
npm run generate-jwt-secret
```

## Authentication API Endpoints

### User Registration
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### User Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Refresh Token
- **URL**: `/api/auth/refresh-token`
- **Method**: `POST`
- **Cookie**: `refreshToken` (set automatically on login/register)
- **Response**: 
  ```json
  {
    "message": "Token refreshed successfully",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Response**: 
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response**: 
  ```json
  {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
  ```

## Securing API Endpoints
All note endpoints now require authentication with a valid JWT access token:

```javascript
// Example API call with token
fetch('http://localhost:3000/api/notes', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

7. Open your browser and go to http://localhost:3000

## API Endpoints

The application uses the following REST API endpoints:

- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a specific note
- `DELETE /api/notes/:id` - Delete a specific note
- `GET /api/notes/category/:category` - Get notes by category

## Project Structure

```
/Notes
├── config/
│   └── database.js      # Database configuration for GCP MySQL
├── controllers/
│   └── noteController.js # Controller functions for notes
├── models/
│   ├── index.js         # Models initialization
│   └── note.js          # Note model definition
├── public/
│   ├── css/
│   │   └── style.css    # Custom CSS styles
│   ├── js/
│   │   └── script.js    # Frontend JavaScript
│   └── index.html       # Main HTML file
├── routes/
│   └── noteRoutes.js    # API routes
├── utils/
│   ├── migrate-categories.js   # Category migration utility
│   └── mysql-error-handler.js  # MySQL error handling utilities
├── .env                 # Environment configuration
├── app.js               # Simple Express setup
├── server.js            # Main Express server with advanced features
└── package.json         # Project dependencies
```

## Environment Variables

The application uses the following environment variables defined in `.env`:

```
# Database Configuration
DB_HOST=your-gcp-mysql-ip
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=notes_app

# Server Configuration
PORT=3000
```

## Error Handling

The application includes comprehensive error handling:

- MySQL-specific error detection and friendly messages
- Middleware for handling database connection issues
- Detailed logging for debugging

## Built With

- [Express](https://expressjs.com/) - Web framework for Node.js
- [Sequelize](https://sequelize.org/) - Promise-based ORM for Node.js
- [MySQL](https://www.mysql.com/) - Relational database on Google Cloud Platform
- [jQuery](https://jquery.com/) - JavaScript library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Font Awesome](https://fontawesome.com/) - Icon library
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variable management

## License

This project is licensed under the MIT License# autentikasiCC
