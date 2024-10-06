const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path'); // Importa el módulo 'path'
const app = express();

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/Unipro', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Definir el esquema y el modelo de usuario
const UserSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String
});
const User = mongoose.model('User', UserSchema);

// Definir el esquema y el modelo de reclamo
const ReclamoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    asunto: String,
    mensaje: String
});
const Reclamo = mongoose.model('Reclamo', ReclamoSchema);

// Definir el esquema y el modelo de proyecto
const ProyectoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    titulo: String,
    descripcion: String,
    imagen: String,
    video: String
});
const Proyecto = mongoose.model('Proyecto', ProyectoSchema);

// Configurar bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

// Ruta para procesar el registro
app.post('/procesar_registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    const newUser = new User({ nombre, email, password });
    await newUser.save();
    res.send('Registro exitoso');
});


// Configurar middleware para servir archivos estáticos desde el directorio 'views'
app.use(express.static(path.join(__dirname, 'views')));

// Ruta para procesar el inicio de sesión
app.post('/procesar_login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        // Redirigir al usuario a la página de PublicarProyecto.html
        res.redirect('/PublicarProyecto.html');
    } else {
        res.send('Usuario o contraseña incorrectos');
    }
});

// Ruta para procesar el reclamo
app.post('/procesar_reclamo', async (req, res) => {
    const { usuario, asunto, mensaje } = req.body;
    const nuevoReclamo = new Reclamo({ usuario, asunto, mensaje });
    await nuevoReclamo.save();
    res.send('Reclamo enviado');
});

// Ruta para procesar la publicación de proyecto
app.post('/procesar_proyecto', async (req, res) => {
    const { usuario, titulo, descripcion, imagen, video } = req.body;
    const nuevoProyecto = new Proyecto({ usuario, titulo, descripcion, imagen, video });
    await nuevoProyecto.save();
    res.send('Proyecto publicado');
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
});
