const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  autor: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  anio: {
    type: Number,
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  descripcion: {
    type: String,
    default: ''
  },
  editorial: {
    type: String,
    default: ''
  },
  disponibles: {
    type: Number,
    default: 1,
    min: 0
  },
  total: {
    type: Number,
    default: 1,
    min: 1
  },
  imagen: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);