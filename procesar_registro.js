const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./userModel');  // Importa el modelo de usuario

const router = express.Router();

router.post('/', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nombre, email, password: hashedPassword });
    await newUser.save();
    res.send('Registro exitoso');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar el usuario');
  }
});

module.exports = router;