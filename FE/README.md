# Crypto Tracker Frontend

A React-based frontend for the Crypto Tracker application with full authentication integration.

## 🚀 **Features**

- **User Authentication**: Login, Register, and Logout functionality
- **Protected Routes**: Secure access to authenticated content
- **JWT Token Management**: Automatic token handling and storage
- **Responsive Design**: Mobile-friendly interface
- **API Integration**: Seamless connection to backend API

## 🛠️ **Setup Instructions**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Development Server**
```bash
npm run dev
```

The app will run on `http://localhost:5173`

### **3. Build for Production**
```bash
npm run build
```

## 🔐 **Authentication Flow**

### **Registration**
1. User fills out signup form
2. Data sent to `/api/users/register`
3. JWT token received and stored
4. User redirected to home page

### **Login**
1. User enters credentials
2. Data sent to `/api/users/login`
3. JWT token received and stored
4. User redirected to home page

### **Protected Routes**
- All main routes require authentication
- Unauthorized users redirected to login
- JWT token automatically included in API requests

## 📁 **Project Structure**

```
src/
├── components/
│   └── ProtectedRoute.jsx    # Route protection component
├── pages/
│   ├── Home.jsx              # Home page (protected)
│   ├── login.jsx             # Login form
│   ├── signup.jsx            # Registration form
│   └── CoinPage.jsx          # Coin details (protected)
├── services/
│   └── authService.js        # Authentication API service
├── App.jsx                   # Main app component
└── main.jsx                  # App entry point
```

## 🌐 **API Endpoints**

The frontend automatically proxies `/api/*` requests to your backend at `http://localhost:3000`.

### **Authentication Endpoints**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)

### **Protected Endpoints**
- `GET /api/portfolio/portfolio` - User portfolio
- `GET /api/coins` - Available coins

## 🔧 **Configuration**

### **Vite Config**
- **Port**: 5173
- **API Proxy**: `/api` → `http://localhost:3000`
- **React Plugin**: Enabled

### **Environment Variables**
Create a `.env` file if needed for additional configuration.

## 🎨 **Styling**

- **CSS Modules**: Component-specific styles
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface
- **Gradient Themes**: Beautiful color schemes

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Backend Not Running**
   - Ensure backend is running on port 3000
   - Check API proxy configuration

2. **Authentication Errors**
   - Clear localStorage and try again
   - Check browser console for errors
   - Verify JWT_SECRET in backend

3. **Port Conflicts**
   - Change port in `vite.config.js`
   - Kill processes using port 5173

### **Debug Mode**
Open browser console to see detailed authentication logs and API calls.

## 📱 **Browser Support**

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🔒 **Security Features**

- **JWT Token Storage**: Secure localStorage management
- **Automatic Logout**: Token expiration handling
- **Route Protection**: Unauthorized access prevention
- **Input Validation**: Form data sanitization

---

**Happy Coding! 🚀**
