:5000/api/expenses:1   Failed to load resource: the server responded with a status of 401 (Unauthorized)
:5000/api/expenses:1   Failed to load resource: the server responded with a status of 401 (Unauthorized)
:5000/api/expenses:1   Failed to load resource: the server responded with a status of 401 (Unauthorized)
:5000/api/expenses:1   Failed to load resource: the server responded with a status of 401 (Unauthorized)
:5000/api/expenses:1   Failed to load resource: the server responded with a status of 401 (Unauthorized)
:5000/api/expenses:1   Failed to load resource: the server responded with a status of 401 (Unauthorized)
[NEW] Explain Console errors by using Copilot in Edge: click
         
         to explain an error. 
        Learn more
        Don't show again
# Expense Tracker

A full-stack expense tracking application built with React and Node.js.

## Features

- ✅ User authentication (register/login)
- ✅ Add, view, and delete expenses
- ✅ Categorize expenses (food, transport, entertainment, shopping, bills, other)
- ✅ Responsive design for mobile and desktop
- ✅ Real-time expense tracking
- ✅ Secure JWT authentication

## Tech Stack

### Frontend
- React 19
- React Router DOM
- Axios for API calls
- CSS3 with modern styling

### Backend
- Node.js with Express
- JWT for authentication
- bcryptjs for password hashing
- CORS enabled

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EXPENSE_TRACKER
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Start the backend server**
   ```bash
   cd server
   npm run start:simple
   ```
   
   This starts a simple in-memory server for testing. The server will run on `http://localhost:5000`.

4. **Start the React client**
   ```bash
   cd client
   npm start
   ```
   
   The React app will open in your browser at `http://localhost:3000`.

## Usage

1. **Register a new account** or **login** with existing credentials
2. **Add expenses** by clicking the "Add Expense" button
3. **View your expenses** in the dashboard
4. **Delete expenses** by clicking the × button on any expense card
5. **Logout** using the logout button in the header

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses for logged-in user
- `POST /api/expenses` - Add a new expense
- `DELETE /api/expenses/:id` - Delete an expense

## Project Structure

```
EXPENSE_TRACKER/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # React components
│   │   ├── services/      # API service functions
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Authentication middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── server.js         # Main server file
│   ├── server-simple.js  # Simple in-memory server
│   └── package.json
└── README.md
```

## Development

### Running in Development Mode

For development with hot reloading:

```bash
# Backend (requires nodemon)
cd server
npm install -g nodemon
npm run dev

# Frontend
cd client
npm start
```

### Production Setup

For production deployment, you'll want to:

1. Set up a proper MongoDB database
2. Update the `.env` file with production credentials
3. Use the main `server.js` instead of `server-simple.js`
4. Build the React app with `npm run build`

## Troubleshooting

### Common Issues

1. **"ERR_CONNECTION_REFUSED"**
   - Make sure the backend server is running on port 5000
   - Check if the server started successfully

2. **"Module not found" errors**
   - Run `npm install` in both client and server directories
   - Make sure all dependencies are installed

3. **Authentication errors**
   - Clear browser localStorage
   - Try registering a new account

### Server Options

- **Simple Mode** (default): `npm run start:simple` - In-memory storage, no database required
- **Full Mode**: `npm start` - Requires MongoDB connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE). 