# Notes App Authentication Features

This application now includes complete JWT-based authentication with the following features:

## Backend Features

1. User Registration and Login API
2. JWT Authentication with Access and Refresh Tokens
3. Password Hashing with bcrypt
4. Protected Routes for Note Operations
5. User-specific Notes (users can only access their own notes)
6. Secure Token Management with HTTP-only Cookies
7. Automatic Token Refresh

## Frontend Features

1. Login and Registration Forms
2. Token Storage with localStorage
3. Authenticated API Requests
4. Automatic Token Refresh when Expired
5. User Profile Display
6. Session Management
7. Conditional UI based on Authentication Status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh-token` - Refresh access token using refresh token
- `POST /api/auth/logout` - Logout and invalidate tokens
- `GET /api/auth/me` - Get current authenticated user info

### Notes (Protected Routes)
- `GET /api/notes` - Get all notes for authenticated user
- `GET /api/notes/:id` - Get a specific note
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note
- `GET /api/notes/category/:category` - Get notes by category

## Authentication Flow

1. User registers or logs in
2. Server returns an access token (short-lived) and a refresh token (long-lived in HTTP-only cookie)
3. Access token is stored in localStorage and used for all API requests
4. When access token expires, the frontend automatically uses the refresh token to get a new access token
5. If refresh fails, user is redirected to login

## Security Features

1. Passwords are hashed with bcrypt
2. JWT tokens with proper expiry times
3. HTTP-only cookies for refresh tokens
4. CORS configured for secure communication
5. Validation and error handling
6. Protection against unauthorized access

## Implementation Details

### User Model
- Username, email, password (hashed), and refresh token storage

### Authentication Middleware
- Token validation and verification
- Attaching user info to request objects

### API Error Handling
- Proper error responses for various authentication scenarios
- Clear and descriptive error messages
