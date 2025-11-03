const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  libroId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  fechaPrestamo: {
    type: Date,
    default: Date.now
  },
  fechaDevolucion: {
    type: Date,
    default: null
  },
  fechaLimite: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    enum: ['activo', 'devuelto', 'vencido'],
    default: 'activo'
  },
  notas: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);