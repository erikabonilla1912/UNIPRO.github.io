// reclamoModel.js

const mongoose = require('mongoose');

const reclamoSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Referencia al autor del reclamo
});

module.exports = mongoose.model('Reclamo', reclamoSchema);

