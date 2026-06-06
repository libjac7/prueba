import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../config/db.js';

export const login = async (req, res) => {
    const { username, password } = req.body;

    // Validar estructura del JSON entrante
    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
        console.warn("⚠️ INTENTO DE LOGIN FALLIDO: Parámetros inválidos en el Body.");
        return res.status(400).json({ 
            data: {
                code: 400, 
                message: "El nombre de usuario (username) y la contraseña (password) son obligatorios." 
            }
        });
    }

    try {
        //  BUSQUEDA EN BASE DE DATOS
        const [rows] = await db.query('CALL sp_login_usuario(?)', [username.trim()]);

        // Valida si el SP retornó registros en la primera posición del array
        if (!rows || rows[0].length === 0) {
            console.warn(`⚠️ LOGIN FALLIDO: El usuario [${username.trim()}] no existe.`);
            return res.status(401).json({ 
                data: { code: 401, message: "Credenciales inválidas o usuario inactivo." } 
            });
        }

        const usuarioDB = rows[0][0];

        // Validar si el usuario está activo
        if (usuarioDB.id_est_usuario !== 1 && usuarioDB.estado_empleado === 'Inactivo') {
            console.warn(`⚠️ LOGIN FALLIDO: El usuario [${username.trim()}] se encuentra inactivo.`);
            return res.status(401).json({ 
                data: { code: 401, message: "Credenciales inválidas o usuario inactivo." } 
            });
        }

        // Verifica contraseña
        const coinciden = await bcrypt.compare(password.trim(), usuarioDB.pass_us);
        if (!coinciden) {
            console.warn(`⚠️ LOGIN FALLIDO: Contraseña incorrecta para el usuario [${username.trim()}].`);
            return res.status(401).json({ 
                data: { code: 401, message: "Credenciales inválidas." } 
            });
        }

        // Datos para jwt
        const payload = {
            id_emp: usuarioDB.id_emp,
            id_usuario: usuarioDB.id_us,
            rol: usuarioDB.name_rol
        };

        // Crea token con vigencia de 1 hora
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log(`✅ LOGIN EXITOSO: El usuario [${usuarioDB.id_us}] inició sesión.`);

        // Respuesta segun datos extraidos en el sp
        return res.status(200).json({
            data: {
                code: 200,
                message: "Login exitoso.",
                token,
                usuario: {
                    id_emp: usuarioDB.id_emp, 
                    id: usuarioDB.id_us,
                    rol: usuarioDB.name_rol,
                    nombre: usuarioDB.name_emp,
                    apellido: usuarioDB.ape_emp,
                    es_password_defecto: usuarioDB.es_password_defecto 
                }
            }
        });

    } catch (error) {
        console.error("❌ ERROR CRÍTICO EN LOGIN:", error);
        return res.status(500).json({ 
            data: { code: 500, message: "Error interno en el servidor." } 
        });
    }
};
