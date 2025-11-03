const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ⚠️ CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:4200',
    'https://biblioteca-backend-scmy.onrender.com/'  
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('   Body:', req.body);
  }
  next();
});

// ⭐ Conexión a MongoDB Atlas
const connectDB = async () => {
  try {
    console.log('🔍 Conectando a MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Conectado a MongoDB Atlas exitosamente');
    console.log(`📊 Base de datos: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Conectar a la base de datos
connectDB();

// Importar rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const booksRoutes = require('./routes/books');
const loansRoutes = require('./routes/loans');

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/loans', loansRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de Biblioteca',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      books: '/api/books',
      loans: '/api/loans',
      health: '/api/health'
    }
  });
});

// Manejo de errores de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS habilitado para: http://localhost:4200`);
  console.log(`\n✅ Listo para recibir solicitudes!\n`);
});