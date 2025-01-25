const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const ahoraEnZona = moment().tz("America/Guayaquil").format();
console.log(ahoraEnZona);

const daysInEnglish = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const currentDate = new Date();
const currentDay = daysInEnglish[currentDate.getDay()];
console.log(currentDay)

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Asegúrate de tener tu DATABASE_URL configurada en las variables de entorno
    ssl: {
        rejectUnauthorized: false, // Necesario para conexiones externas en Render o en plataformas similares
    },
});

// Verificar conexión
pool.connect()
    .then(() => console.log('Conectado a la base de datos'))
    .catch(err => console.error('Error al conectar a la base de datos:', err));

// Función para verificar el token JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
};

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Verificar si el usuario o el correo ya existe
        const userExists = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'El usuario o correo ya existe' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar nuevo usuario como cliente por defecto
        await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)',
            [username, email, hashedPassword, 'client']
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

// Iniciar sesión de usuario
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).send('Usuario no encontrado');
        }
        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send('Contraseña incorrecta');
        }
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al iniciar sesión');
    }
});

// Agregar productos al carrito
app.post('/cart', authenticateToken, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'INSERT INTO carts (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [userId, productId, quantity]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al agregar al carrito');
    }
});

// Ver el carrito de un usuario
app.get('/cart', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await pool.query(
            'SELECT products.name, products.price, carts.quantity FROM carts JOIN products ON carts.product_id = products.id WHERE carts.user_id = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener carrito');
    }
});

// Ruta para obtener los productos
app.get('/products', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.name AS product_name, p.description, p.price, p.image_url, c.name AS category_name
            FROM products p, categories c,offers
            where p.category_id = c.id
            and offers.category_id = c.id
            and p.category_id = offers.category_id
            and (SELECT categories.name AS category_name
            FROM offers,categories
			where offers.category_id = categories.id
            and  offers.day_of_week = '${currentDay}') != c.name			
            group by p.id,c.name
            order by p.id;
        `);
        res.json(result.rows);  // Devolver los productos con su categoría
    } catch (err) {
        console.error('Error al obtener los productos:', err);
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

app.post('/products', async (req, res) => {
    const { name, description, price, image_url, category_id } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (name, description, price, image_url, category_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, description, price, image_url, category_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al insertar producto:', err);
        res.status(500).json({ error: 'Error al insertar producto' });
    }
});

app.get('/offers', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.name AS product_name, p.description, p.price,
round(p.price - (p.price * (offers.discount_percentage * 0.01)), 2) as descount,
p.image_url, categories.name AS category_name
            FROM products p, offers,categories
			where offers.category_id = categories.id
			and p.category_id = categories.id
            and  offers.day_of_week = '${currentDay}';
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener las ofertas del día');
    }
});

// Puerto para correr la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
