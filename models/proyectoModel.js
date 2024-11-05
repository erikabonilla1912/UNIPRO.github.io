// proyectoModel.js

const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  imagenes: [String], // Arreglo de URLs de imágenes
  videos: [String], // Arreglo de URLs de videos
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Referencia al autor del proyecto
});

module.exports = mongoose.model('Proyecto', proyectoSchema);

