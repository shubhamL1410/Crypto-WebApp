# Crypto Tracker Backend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the Backend directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/Crypto

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Environment
NODE_ENV=development
```

### 3. Start MongoDB
Make sure MongoDB is running on your system.

### 4. Run the Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get current user profile (protected)
- `PUT /api/users/profile` - Update current user profile (protected)

### Users (Protected Routes)
- `GET /api/users/users` - Get all users
- `PUT /api/users/users/:id` - Update user by ID
- `DELETE /api/users/users/:id` - Delete user by ID

### Portfolio (Protected Routes)
- `GET /api/portfolio/portfolio` - Get user's portfolio
- `GET /api/portfolio/portfolio/:uid` - Get specific portfolio entry
- `POST /api/portfolio/portfolio` - Add new portfolio entry
- `PUT /api/portfolio/portfolio/:id` - Update portfolio entry
- `DELETE /api/portfolio/portfolio/:id` - Delete portfolio entry

### Coins (Protected Routes)
- `GET /api/coins` - Get all coins

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Route protection with middleware
- User data isolation (users can only access their own data)
- Input validation and sanitization
