// server/index.js
require("dotenv").config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const tradeRoutes = require('./routes/tradeRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const userRoutes = require("./routes/userRoutes");
const excelRoutes = require('./routes/excelRoutes');
const ruleRoutes = require("./routes/ruleRoutes");
const userLedgerRoutes = require("./routes/userLedgerRoutes");
const contactRoutes = require("./routes/contactRoutes");
const adminUserViewRoutes = require("./routes/adminUserViewRoutes");
const { authMiddleware } = require("./middleware/authMiddleware");

// Connect to Database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'https://fin-trade.netlify.app',
  "https://smartsip.co.in",
  "https://www.smartsip.co.in"
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl) 
    // or if the origin is in our allowed list 
    // or if it ends with .vercel.app
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json()); // Allows us to accept JSON data in the body

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`[DEBUG LOG] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

console.log("[DEBUG] Registering /api/rules");
app.use("/api/rules", ruleRoutes);
console.log("[DEBUG] Registered /api/rules");
app.use('/api/trades', tradeRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/users', userRoutes);
console.log("[DEBUG] Registering /api/contact");
app.use('/api/contact', contactRoutes);
console.log("[DEBUG] Registered /api/contact");
app.use('/api/user-ledger', userLedgerRoutes);
app.use('/api/reports', excelRoutes);
app.use('/api/admin/user-view', adminUserViewRoutes);

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ msg: "Protected route working ✅", user: req.user });
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack}`);
  res.status(500).json({
    msg: "Something went wrong on the server",
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
