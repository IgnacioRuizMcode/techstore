const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const passport = require('./config/auth');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middlewares/errorHandler');
const couponRoutes = require('./routes/couponRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // ← añadida
const addressRoutes = require('./routes/addressRoutes');

const app = express();

// Seguridad
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'http://localhost:5000', 'https://via.placeholder.com', 'data:'],
      },
    },
  })
);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));
} else {
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
}

app.use(mongoSanitize());

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use(passport.initialize());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/notifications', notificationRoutes); // ← añadida
app.use('/api/address', addressRoutes);
app.use('/api/webhooks', require('./routes/webhookRoutes'));

app.use(errorHandler);

module.exports = app;