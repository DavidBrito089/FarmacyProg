const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Base de datos en memoria (simulación)
const users = [];

// Rutas
app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    const { name, email } = req.body;
    users.push({ name, email });
    res.status(201).send('Usuario agregado');
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
