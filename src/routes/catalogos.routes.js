import express from 'express';
import { 
    obtenerEstados, 
    obtenerRoles, 
    obtenerDepartamentos, 
    obtenerMunicipiosPorDepartamento, 
    obtenerPlanesFinanciamiento 
} from '../controllers/catalogos.controller.js';
import { verificarJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todos los endpoints protegidos con tu middleware de JWT
router.get('/estados', verificarJWT, obtenerEstados);
router.get('/roles', verificarJWT, obtenerRoles);
router.get('/departamentos', verificarJWT, obtenerDepartamentos);
router.get('/planes-financiamiento', verificarJWT, obtenerPlanesFinanciamiento);

// Catálogo dependiente por Path Param para los municipios de Guatemala
router.get('/municipios/:id_dep', verificarJWT, obtenerMunicipiosPorDepartamento);

export default router;