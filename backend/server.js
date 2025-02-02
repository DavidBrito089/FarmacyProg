const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const nodemailer = require('nodemailer');
require('dotenv').config();



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

 const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
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
  const { username, email, password, role = 'client' } = req.body;

  try {
    // Verifica si el usuario ya existe
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }

    // Encripta la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Inserta el nuevo usuario y obtiene su ID
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [username, email, passwordHash, role]
    );

    const user_id = newUser.rows[0].id;

    // Crea automáticamente un carrito para el usuario
    await pool.query('INSERT INTO cart (user_id) VALUES ($1)', [user_id]);

    res.status(201).json({ message: 'Usuario registrado con éxito.', user_id });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error en el servidor.', error });
  }
});

  app.get('/verify-email', async (req, res) => {
    const { token } = req.query;
  
    try {
      // Verifica el token
      const payload = jwt.verify(token, process.env.JWT_SECRET);
  
      // Actualiza el estado del usuario en la base de datos
      await pool.query('UPDATE users SET is_verified = $1 WHERE id = $2', [true, payload.userId]);
  
      res.status(200).json({ message: 'Correo verificado con éxito.' });
    } catch (error) {
      res.status(400).json({ message: 'Token inválido o expirado.', error });
    }
  });
  
  /* app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
  
      const user = userCheck.rows[0];
  
      if (!user.is_verified) {
        return res.status(403).json({ message: 'Por favor, verifica tu correo electrónico antes de iniciar sesión.' });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }
  
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ message: 'Inicio de sesión exitoso.', token, role: user.role });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor.', error });
    }
  }); */

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      // Busca al usuario por correo
      const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }
  
      const user = userCheck.rows[0];
  
      // Compara las contraseñas
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        return res.status(401).json({ message: 'Credenciales incorrectas.' });
      }
  
      // Genera el token con el rol incluido
      const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ message: 'Inicio de sesión exitoso.', token, username: user.username });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor.', error });
    }
  });

  app.get('/profile', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Obtener token del encabezado

    if (!token) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ decoded});
    } catch (error) {
        res.status(401).json({ error: 'Token inválido o expirado' });
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

app.post('/cart/add', async (req, res) => {
  const { user_id, product_id, quantity = 1 } = req.body;

  try {
    // Verifica si el usuario tiene un carrito
    const cartCheck = await pool.query('SELECT id FROM cart WHERE user_id = $1', [user_id]);

    if (cartCheck.rows.length === 0) {
      return res.status(400).json({ message: 'No se encontró un carrito para este usuario.' });
    }

    const cart_id = cartCheck.rows[0].id;

    // Verifica si el producto ya está en el carrito
    const itemCheck = await pool.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cart_id, product_id]
    );

    if (itemCheck.rows.length > 0) {
      // Si el producto ya está en el carrito, actualiza la cantidad
      const newQuantity = itemCheck.rows[0].quantity + quantity;
      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQuantity, itemCheck.rows[0].id]);
    } else {
      // Si no está, agrégalo al carrito
      await pool.query(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cart_id, product_id, quantity]
      );
    }

    res.status(200).json({ message: 'Producto agregado al carrito correctamente.' });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ message: 'Error en el servidor.', error });
  }
});


app.get('/cart-items/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const query = `
    SELECT 
      ci.id AS cart_item_id, 
      p.id AS product_id, 
      p.name, 
      p.description, 
      p.image_url,
      CASE 
        WHEN o.discount_percentage IS NOT NULL 
          THEN ROUND(p.price - (p.price * (o.discount_percentage * 0.01)), 2)
        ELSE p.price
      END AS price,
      ci.quantity
    FROM cart_items ci
    JOIN cart c ON ci.cart_id = c.id
    JOIN products p ON ci.product_id = p.id
    JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN offers o ON o.category_id = cat.id 
                       AND o.day_of_week = '${currentDay}'
    WHERE c.user_id = $1;
  `;

  try {
    const { rows } = await pool.query(query, [user_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los productos del carrito:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Endpoint para actualizar la cantidad de un item en el carrito
app.patch('/cart/update/:cartItemId', async (req, res) => {
  const { cartItemId } = req.params;
  const { change } = req.body; // Ejemplo: { change: 1 } o { change: -1 }

  try {
    // Consultar la cantidad actual del item
    const itemResult = await pool.query(
      'SELECT quantity FROM cart_items WHERE id = $1',
      [cartItemId]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'El item del carrito no fue encontrado.' });
    }

    const currentQuantity = itemResult.rows[0].quantity;
    const newQuantity = currentQuantity + change;

    if (newQuantity <= 0) {
      // Si la nueva cantidad es 0 o menor, elimina el item
      await pool.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
      return res.json({ message: 'El item fue eliminado del carrito porque la cantidad llegó a 0.' });
    } else {
      // Actualiza la cantidad con el nuevo valor
      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQuantity, cartItemId]);
      return res.json({ message: 'Cantidad actualizada correctamente.', newQuantity });
    }
  } catch (error) {
    console.error('Error al actualizar el item del carrito:', error);
    res.status(500).json({ message: 'Error en el servidor al actualizar el item.' });
  }
});

// Endpoint para eliminar un item del carrito
app.delete('/cart/remove/:cartItemId', async (req, res) => {
  const { cartItemId } = req.params;

  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
    res.json({ message: 'El item del carrito se eliminó correctamente.' });
  } catch (error) {
    console.error('Error al eliminar el item del carrito:', error);
    res.status(500).json({ message: 'Error en el servidor al eliminar el item.' });
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
