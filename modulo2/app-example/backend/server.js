const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Importa el paquete cors

const app = express();
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'postgres', // postgres
  database: process.env.PGDATABASE || 'products',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432, //5432
});

app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

// Función para crear la tabla si no existe
const createTableIfNotExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(500) NOT NULL,
      category VARCHAR(255) NOT NULL,
      model VARCHAR(255) NOT NULL
    );
    INSERT INTO products (name, description, category, model) 
    SELECT 'UltraSmart Watch', 'A high-end smartwatch with fitness tracking and advanced health monitoring features.', 'Wearables', 'USW-2024' 
    WHERE NOT EXISTS (
        SELECT 1 FROM products WHERE name = 'UltraSmart Watch'
    );
  `;
  
  try {
    await pool.query(createTableQuery);
    console.log('Tabla products creada o ya existe');
  } catch (err) {
    console.error('Error creando la tabla products:', err);
  }
};

// Llamar a la función para crear la tabla al iniciar el servidor
createTableIfNotExists();

app.get('/api/products', async (req, res) => {
  const result = await pool.query('SELECT * FROM products');
  res.json(result.rows);
});

app.post('/api/products', async (req, res) => {
  const { name, description, category, model  } = req.body;
  await pool.query('INSERT INTO products (name, description, category, model) VALUES ($1,$2,$3,$4)', [name, description, category, model]);
  res.sendStatus(201);
});

// app.delete('/api/products/:id', async (req, res) => {
//   const { id  } = req.params;
//   const result = await pool.query('DELETE FROM products where id = $1', [id]);
//   res.json(result.rows);
// });

app.listen(5000, () => console.log('Server running on port 5000'));