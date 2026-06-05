import jwt from 'jsonwebtoken';
import db from '../config/db.js';

export const verificarJWT = async (req, res, next) => {
    // 1. CAPTURA DEL HEADER DE AUTORIZACIÓN
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn("⚠️ PETICIÓN RECHAZADA: Formato de token inválido o ausente.");
        return res.status(401).json({ 
            data: { 
                code: 401, 
                message: "TOKEN_REQUERIDO" 
            } 
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // 2. VERIFICACIÓN MATEMÁTICA DE LA FIRMA
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 🧪 LOG DE DIAGNÓSTICO EN CONSOLA
        console.log("👁️ CONTENIDO REAL DEL TOKEN DESCODIFICADO:", decoded);

        // 3. CONSULTA DE CONTROL DE VERSIONES Y ESTADO EN LA BD
        const queryVersion = 'SELECT token_version, id_est FROM usuarios WHERE id_us = ?';
        const [rows] = await db.query(queryVersion, [decoded.id_usuario]);

        if (rows.length === 0) {
            console.warn(`⚠️ TOKEN INVALIDADO: El usuario [${decoded.id_usuario}] ya no existe en el sistema.`);
            return res.status(401).json({ 
                data: { 
                    code: 401, 
                    message: "USUARIO_NO_ENCONTRADO" 
                } 
            });
        }

        const usuarioBD = rows[0];

        // 4. CANDADO EXTRA: Validar si el usuario fue desactivado en tiempo real
        if (usuarioBD.id_est !== 1) { 
             console.warn(`⚠️ TOKEN INVALIDADO: El usuario [${decoded.id_usuario}] ya no está activo.`);
             return res.status(401).json({ 
                 data: { 
                     code: 401, 
                     message: "USUARIO_INACTIVO" 
                 } 
             });
        }

        // 5. COMPARACIÓN DE VERSIONES (Cambio de contraseña o revocación forzada)
        if (decoded.version !== usuarioBD.token_version) {
            console.warn(`🚫 SESIÓN EXPULSADA: Token pide versión [${decoded.version}] pero la BD va por la [${usuarioBD.token_version}].`);
            return res.status(401).json({ 
                data: {
                    code: 401, 
                    message: "SESION_REVOCADA" 
                }
            });
        }

        // 6. EXTENDER SESIÓN DE DATOS EN LA PETICIÓN
        req.user = {
            id_usuario: decoded.id_usuario,
            rol: decoded.rol,
            version: decoded.version
        };

        // Todo correcto, damos luz verde al siguiente controlador
        next();

    } catch (error) {
        console.error("❌ ERROR EN VERIFICACIÓN DE JWT:", error.message || error);
        
        // Control de errores matemáticos específicos del Token de la librería jsonwebtoken
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                data: { 
                    code: 401, 
                    message: "TOKEN_EXPIRADO" 
                } 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                data: { 
                    code: 401, 
                    message: "TOKEN_INVALIDO" 
                } 
            });
        }

        // 🚨 PROTECCIÓN CRÍTICA: Si el error no es del token sino de la BD (ej. caída de Aiven)
        return res.status(500).json({ 
            data: { 
                code: 500, 
                message: "ERROR_INTEGRIDAD_AUTENTICACION" 
            } 
        });
    }
};