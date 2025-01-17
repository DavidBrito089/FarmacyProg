const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Render proporciona esta variable automáticamente
    ssl: {
        rejectUnauthorized: false, // Necesario para conexiones externas en Render
    },
});

// Probar la conexión a la base de datos
pool.connect()
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.error('Error al conectar a la base de datos:', err));

// Endpoints

// Endpoint para insertar un usuario
app.post('/users', async (req, res) => {
    const { name, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.status(201).json(result.rows[0]); // Devuelve el usuario recién creado
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al insertar usuario' });
    }
});

// Endpoint para obtener todos los usuarios
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows); // Devuelve todos los usuarios
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

// Configurar el puerto y lanzar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
