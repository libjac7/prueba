import express from 'express';
import empleadosController from '../controllers/empleadosController.js';

const router = express.Router();

router.get('/', empleadosController.getEmpleados);
router.get('/:id', empleadosController.getEmpleadosForId);

export default router;