const express = require('express');
const User = require('./userModel');
const Proyecto = require('./proyectoModel');

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, titulo, descripcion, imagen, video } = req.body;
    try {
        // Buscar al usuario por su correo electrónico
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Crear el proyecto asociado al usuario encontrado
        const nuevoProyecto = new Proyecto({ usuario: usuario._id, titulo, descripcion, imagen, video });
        await nuevoProyecto.save();
        res.send('Proyecto publicado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar el proyecto');
    }
});

module.exports = router;
