import express from 'express';
import bodyParser from 'body-parser';
import empleadosRoutes from './src/routes/rutasEmpleados.js';

const app = express();
const port = 3002;

app.use(bodyParser.json());

// Rutas de toda la API
app.use('/api/empleados', empleadosRoutes);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Iniciando servidor en el puerto: http://localhost:${port}`);
});