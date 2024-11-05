const express = require('express');
const User = require('./userModel');
const Reclamo = require('./reclamoModel');

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, asunto, mensaje } = req.body;
    try {
        // Buscar al usuario por su correo electrónico
        const usuario = await User.findOne({ email });
        if (!usuario) {
            return res.status(404).send('Usuario no encontrado');
        }

        // Crear el reclamo asociado al usuario encontrado
        const nuevoReclamo = new Reclamo({ usuario: usuario._id, asunto, mensaje });
        await nuevoReclamo.save();
        res.send('Reclamo enviado');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error al procesar el reclamo');
    }
});

module.exports = router;
