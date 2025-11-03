const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');

// Obtener todos los préstamos (admin)
router.get('/', async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('usuarioId', 'name email carnetId')
      .populate('libroId', 'titulo autor isbn')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: loans,
      count: loans.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener préstamos',
      error: error.message
    });
  }
});

// Obtener préstamos del estudiante actual
router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const loans = await Loan.find({ usuarioId: req.params.usuarioId })
      .populate('libroId', 'titulo autor isbn')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: loans,
      count: loans.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener préstamos del usuario',
      error: error.message
    });
  }
});

// Crear nuevo préstamo (solo admin)
router.post('/', async (req, res) => {
  try {
    const { usuarioId, libroId, diasPrestamo } = req.body;

    if (!usuarioId || !libroId) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y Libro son requeridos'
      });
    }

    // Verificar que el libro existe y hay disponibles
    const book = await Book.findById(libroId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    if (book.disponibles <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay copias disponibles del libro'
      });
    }

    // Calcular fecha límite (por defecto 14 días)
    const dias = diasPrestamo || 14;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    // Crear préstamo
    const newLoan = new Loan({
      usuarioId,
      libroId,
      fechaLimite,
      estado: 'activo'
    });

    await newLoan.save();

    // Actualizar disponibilidad del libro
    book.disponibles -= 1;
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Préstamo creado exitosamente',
      data: newLoan
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear préstamo',
      error: error.message
    });
  }
});

// Devolver libro (solo admin)
router.put('/:id/devolver', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    if (loan.estado === 'devuelto') {
      return res.status(400).json({
        success: false,
        message: 'Este préstamo ya fue devuelto'
      });
    }

    // Actualizar préstamo
    loan.fechaDevolucion = new Date();
    
    // Verificar si está vencido
    if (new Date() > loan.fechaLimite) {
      loan.estado = 'vencido';
    } else {
      loan.estado = 'devuelto';
    }

    await loan.save();

    // Aumentar disponibilidad del libro
    const book = await Book.findById(loan.libroId);
    if (book) {
      book.disponibles += 1;
      await book.save();
    }

    res.json({
      success: true,
      message: 'Libro devuelto exitosamente',
      data: loan
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al devolver libro',
      error: error.message
    });
  }
});

// Obtener préstamo por ID
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('usuarioId', 'name email carnetId')
      .populate('libroId', 'titulo autor isbn');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    res.json({
      success: true,
      data: loan
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener préstamo',
      error: error.message
    });
  }
});

module.exports = router;