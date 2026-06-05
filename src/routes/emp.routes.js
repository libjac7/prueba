import { Router } from 'express';
import { registrarEmpleado, obtenerInformacionEmpleados } from '../controllers/emp.controller.js';
import { verificarJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint exclusivo para empleados
router.post('/', verificarJWT, registrarEmpleado);
router.post('/inf-empleado', verificarJWT, obtenerInformacionEmpleados);

export default router;