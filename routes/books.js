const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Obtener todos los libros
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener libros',
      error: error.message
    });
  }
});

// Obtener libro por ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener libro',
      error: error.message
    });
  }
});

// Crear nuevo libro (solo admin)
router.post('/', async (req, res) => {
  try {
    const { titulo, autor, isbn, anio, categoria, descripcion, editorial, total } = req.body;

    if (!titulo || !autor || !isbn || !anio || !categoria) {
      return res.status(400).json({
        success: false,
        message: 'Campos requeridos: título, autor, isbn, año, categoría'
      });
    }

    // Verificar si el ISBN ya existe
    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un libro con este ISBN'
      });
    }

    const newBook = new Book({
      titulo,
      autor,
      isbn,
      anio,
      categoria,
      descripcion,
      editorial,
      total: total || 1,
      disponibles: total || 1
    });

    await newBook.save();

    res.status(201).json({
      success: true,
      message: 'Libro creado exitosamente',
      data: newBook
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear libro',
      error: error.message
    });
  }
});

// Actualizar libro (solo admin)
router.put('/:id', async (req, res) => {
  try {
    const { titulo, autor, categoria, descripcion, editorial, total } = req.body;

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { titulo, autor, categoria, descripcion, editorial, total },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Libro actualizado exitosamente',
      data: book
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar libro',
      error: error.message
    });
  }
});

// Eliminar libro (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Libro no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Libro eliminado exitosamente',
      data: book
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar libro',
      error: error.message
    });
  }
});

// Buscar libros por título, autor o categoría
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const books = await Book.find({
      $or: [
        { titulo: { $regex: query, $options: 'i' } },
        { autor: { $regex: query, $options: 'i' } },
        { categoria: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      success: true,
      data: books,
      count: books.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
});

module.exports = router;