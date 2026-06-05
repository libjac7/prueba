import { Router } from 'express';
import { asignarAsesorCobro, registrarCliente, obtenerInformacion, actualizarCliente } from '../controllers/cliente.controller.js';
import { verificarJWT } from '../middlewares/auth.middleware.js'; // <-- Verifica si es auth.middleware o authMiddleware

const router = Router();

router.post('/', verificarJWT, registrarCliente); 
router.post('/asignar-cobro', verificarJWT, asignarAsesorCobro); 
router.get('/obtener-clientes', verificarJWT, obtenerInformacion);

// PRUEBA DE CONTROL DIRECTA (Comenta la vieja y pon esta línea limpia)
router.put('/actualizar-cliente', verificarJWT, actualizarCliente)

export default router;