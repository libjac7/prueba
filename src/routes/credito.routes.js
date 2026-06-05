import { Router } from 'express';
import { afiliarCredito } from '../controllers/credito.controller.js';
import { verificarJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint limpio para la creacion de clientes
router.post('/', verificarJWT, afiliarCredito);

// 🚨 ESTA ES LA LÍNEA QUE TE FALTA O TIENE UN ERROR DE DEDO:
export default router;