# Income and Expenses Tracker

A full-stack MERN application for tracking personal income and expenses with modern UI and mobile optimization.

## 🚀 Features

- ✅ **Income & Expense Tracking** - Add, edit, and manage financial records
- ✅ **Smart Filtering** - Filter by date, description, and transaction type
- ✅ **Todo Management** - Keep track of financial tasks
- ✅ **Notes System** - Add personal financial notes
- ✅ **Multi-Currency Support** - Support for 11+ currencies
- ✅ **Mobile Optimized** - Responsive design for all devices
- ✅ **Modern UI** - Built with Tailwind CSS and glassmorphism design
- ✅ **Real-time Updates** - Powered by Recoil state management

## 🛠️ Tech Stack

### Frontend

- **React 18.3.1** - Modern React with hooks
- **Recoil** - State management
- **Tailwind CSS** - Styling and responsive design
- **Day.js** - Date manipulation
- **React Router** - Navigation

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB

## 📱 Mobile Features

- Touch-friendly interface
- Responsive navigation
- Mobile-optimized forms
- Swipe gestures support
- PWA capabilities

## 🌍 Supported Currencies

USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, BRL, THB

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd client
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)

```bash
cd server
npm start
# Deploy to Railway or Render
```

## 📦 Installation

### Prerequisites

- Node.js 16+
- MongoDB Atlas account

### Local Development

1. **Clone the repository**

```bash
git clone https://github.com/frongand1998/IncomeAndExpenses.git
cd IncomeAndExpenses
```

2. **Setup Backend**

```bash
cd server
npm install
# Create .env file with your MongoDB Atlas connection string
echo "PORT=3000" > .env
echo "MONGO_URI=your_mongodb_atlas_connection_string" >> .env
npm start
```

3. **Setup Frontend**

```bash
cd ../client
npm install
# Create .env file
echo "REACT_APP_API_URL=http://localhost:3000" > .env
npm start
```

4. **Access the app**

- Frontend: http://localhost:3002
- Backend: http://localhost:3000

## 🎯 Usage

1. **Register/Login** - Create your account
2. **Add Records** - Track your income and expenses
3. **Use Filters** - Find specific transactions
4. **Manage Settings** - Customize currency and preferences
5. **Mobile Access** - Use on any device

## 🔧 Environment Variables

### Backend (.env)

```
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:3000
```

## 📊 Features Roadmap

- [ ] Analytics & Charts
- [ ] Budget Planning
- [ ] Category Management
- [ ] Data Export
- [ ] Dark Mode
- [ ] Notification System

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Built with ❤️ using the MERN stack**
