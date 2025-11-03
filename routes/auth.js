const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('📝 [LOGIN] Solicitud recibida');
    console.log('Body recibido:', req.body);
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('❌ [LOGIN] Campos vacíos');
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    console.log(`🔍 [LOGIN] Buscando usuario: ${username}`);
    
    // Buscar usuario por username
    const user = await User.findOne({ username });
    
    console.log(`📊 [LOGIN] Usuario encontrado:`, user ? 'Sí' : 'No');

    if (!user) {
      console.log(`❌ [LOGIN] Usuario ${username} no existe`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    console.log(`🔐 [LOGIN] Verificando contraseña`);
    console.log(`   - Contraseña BD: "${user.password}"`);
    console.log(`   - Contraseña enviada: "${password}"`);
    console.log(`   - ¿Coinciden?: ${user.password === password}`);
    
    if (user.password !== password) {
      console.log(`❌ [LOGIN] Contraseña incorrecta para ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // No retornar la contraseña
    const userResponse = {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      carnetId: user.carnetId
    };

    console.log(`✅ [LOGIN] Login exitoso para ${username}`);
    
    res.json({
      success: true,
      user: userResponse,
      message: 'Autenticación exitosa'
    });

  } catch (error) {
    console.error('💥 [LOGIN] Error del servidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor',
      error: error.message
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada'
  });
});

// Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { username, password, name, email, role } = req.body;

    if (!username || !password || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya existe'
      });
    }

    const newUser = new User({
      username,
      password,
      name,
      email,
      role: role || 'student'
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message
    });
  }
});

module.exports = router;