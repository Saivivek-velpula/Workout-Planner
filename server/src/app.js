const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { errorHandler, AppError } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const routineRoutes = require('./routes/routineRoutes');
const mealRoutes = require('./routes/mealRoutes');
const entryRoutes = require('./routes/entryRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allows local dev and cross-origin deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Workout Planner API'
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/stats', statsRoutes);

// Optional: Serve compiled frontend in production if client/dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Catch 404 for undefined API routes
app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
