# CryptoVault - Cryptocurrency Trading Platform

A modern, secure, and user-friendly cryptocurrency trading platform built with React.js and Node.js.

## 🚀 Features

- **Real-time Cryptocurrency Prices** - Live price updates from CoinGecko API
- **Trading System** - Buy, sell, and convert cryptocurrencies
- **Portfolio Management** - Track your investments and performance
- **User Authentication** - Secure login and registration system
- **Transaction History** - Complete record of all trading activities
- **Responsive Design** - Works seamlessly on desktop and mobile

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Axios for API calls
- CSS3 with modern styling

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- CoinGecko API integration

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cryptovault.git
   cd cryptovault
   ```

2. **Install Backend Dependencies**
   ```bash
   cd Backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../FE
   npm install
   ```

4. **Database Setup**
   - Make sure MongoDB is running on your system
   - The application will automatically connect to `mongodb://localhost:27017/cryptoo`

5. **Start the Application**
   
   **Start Backend Server:**
   ```bash
   cd Backend
   npm start
   ```
   
   **Start Frontend (in a new terminal):**
   ```bash
   cd FE
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the Backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cryptoo
JWT_SECRET=your_jwt_secret_key
```

### API Configuration
The frontend is configured to make API calls to `/api` endpoints. Make sure your backend server is running on port 5000.

## 📊 Database Backup & Restore

### Creating a Database Backup

To backup your MongoDB database, use the provided backup script:

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Run the backup script**
   ```bash
   node backup-database.js
   ```

3. **Backup files will be created in `db-backup/` directory:**
   - `backup-YYYY-MM-DD.json` - Complete database backup
   - Individual collection files (coins.json, users.json, etc.)

### Restoring from Backup

To restore your database from a backup:

1. **Create a restore script** (create `restore-database.js` in Backend directory):
   ```javascript
   const { MongoClient } = require('mongodb');
   const fs = require('fs');
   
   async function restoreDatabase() {
       const client = new MongoClient('mongodb://localhost:27017');
       
       try {
           await client.connect();
           const db = client.db('cryptoo');
           
           // Read backup file
           const backupData = JSON.parse(fs.readFileSync('./db-backup/backup-2025-09-19.json', 'utf8'));
           
           // Restore each collection
           for (const [collectionName, documents] of Object.entries(backupData.collections)) {
               await db.collection(collectionName).deleteMany({});
               if (documents.length > 0) {
                   await db.collection(collectionName).insertMany(documents);
               }
               console.log(`✓ Restored ${documents.length} documents to ${collectionName}`);
           }
           
           console.log('✅ Database restore completed successfully!');
       } catch (error) {
           console.error('❌ Restore failed:', error);
       } finally {
           await client.close();
       }
   }
   
   restoreDatabase();
   ```

2. **Run the restore script**
   ```bash
   node restore-database.js
   ```

### Manual Backup with MongoDB Tools

If you have MongoDB tools installed:

```bash
# Create backup
mongodump --db cryptoo --out ./db-backup

# Restore backup
mongorestore --db cryptoo ./db-backup/cryptoo
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Input validation and sanitization
- CORS configuration

## 📱 Usage

1. **Register/Login** - Create an account or login to existing account
2. **View Coins** - Browse all available cryptocurrencies with live prices
3. **Trade** - Buy, sell, or convert cryptocurrencies
4. **Portfolio** - Monitor your investments and performance
5. **Profile** - Manage your account settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Shubham Lathiya**
- Email: lathiyashubham07@gmail.com
- GitHub: [@yourusername](https://github.com/yourusername)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/cryptovault/issues) page
2. Create a new issue with detailed description
3. Contact: lathiyashubham07@gmail.com

## 🔄 Updates

- **v1.0.0** - Initial release with basic trading functionality
- **v1.1.0** - Added portfolio management and transaction history
- **v1.2.0** - Enhanced UI/UX and real-time price updates

---

**Note:** This is a demo project for educational purposes. For production use, implement additional security measures and error handling.