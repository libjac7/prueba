import db from '../config/db.js';

export const afiliarCredito = async (req, res) => {
    // 1. EXTRACCIÓN DE DATOS DE AUTENTICACIÓN (INYECTADOS POR EL MIDDLEWARE)
    const idUsAutenticado = req.user?.id_usuario;
    const rolCrudo = req.user && req.user.rol ? req.user.rol : '';
    const rolOperador = rolCrudo.trim().toLowerCase();

    // 2. EXTRACCIÓN DE PARÁMETROS DEL BODY
    const { id_cli, id_finan, monto_otorgado, total_cuotas } = req.body;

    console.log(`🏦 INTENTO DE AFILIACIÓN DE CRÉDITO -> Operador: [${idUsAutenticado}] con Rol: '${rolOperador}'`);

    // 3. CANDADO DE SEGURIDAD: CONTROL DE ACCESO POR ROLES PERMITIDOS
    const rolesPermitidos = ['administrador', 'gerente', 'secretaria'];
    
    if (!rolesPermitidos.includes(rolOperador)) {
        console.warn(`🚫 BLOQUEO DE SEGURIDAD: El usuario [${idUsAutenticado}] con rol '${rolOperador}' intentó crear un crédito sin privilegios.`);
        return res.status(403).json({
            data: {
                code: 403,
                message: "No está autorizado para realizar esta acción"
            }
        });
    }

    // 4. VALIDACIÓN PREVENTIVA DE ESTRUCTURA DEL BODY
    if (!id_cli || !id_finan || !monto_otorgado || !total_cuotas) {
        return res.status(400).json({
            data: {
                code: 400,
                message: "Todos los campos (id_cli, id_finan, monto_otorgado, total_cuotas) son obligatorios."
            }
        });
    }

    if (isNaN(monto_otorgado) || monto_otorgado <= 0 || isNaN(total_cuotas) || total_cuotas <= 0) {
        return res.status(400).json({
            data: {
                code: 400,
                message: "El monto otorgado y el total de cuotas deben ser números mayores a cero."
            }
        });
    }

    try {
        console.log(`⚡ PROCESANDO TRANSACCIÓN -> Cliente: [${id_cli}], Plan: [${id_finan}], Monto: Q.${monto_otorgado}`);

        // 5. EJECUCIÓN DEL SP PRINCIPAL
        const query = `
            CALL sp_crear_credito_cliente(?, ?, ?, ?, @cod, @men);
            SELECT @cod AS codigo, @men AS mensaje;
        `;

        const [rawResult] = await db.query(query, [id_cli.trim(), id_finan.trim(), monto_otorgado, total_cuotas]);
        const datasetSelect = rawResult.find(element => Array.isArray(element) && element[0] && 'codigo' in element[0]);
        const resultado = datasetSelect ? datasetSelect[0] : null;

        // 6. RESPUESTAS UNIFICADAS ENVOLVIENDO TODO EN "data"
        if (resultado) {
            switch (resultado.codigo) {
                case 1:
                    console.log(`✅ CRÉDITO REGISTRADO CON ÉXITO para cliente [${id_cli}] por el operador [${idUsAutenticado}].`);
                    return res.status(201).json({
                        data: {
                            code: 201,
                            message: resultado.mensaje
                        }
                    });

                case 3:
                case 4:
                    console.warn(`⚠️ VALIDACIÓN DE NEGOCIO RECHAZADA EN BD: ${resultado.mensaje}`);
                    return res.status(404).json({
                        data: { code: 404, message: resultado.mensaje }
                    });

                case 5:
                    console.warn(`🚫 REGLA DE NEGOCIO VIOLADA EN BD: ${resultado.mensaje}`);
                    return res.status(409).json({
                        data: { code: 409, message: resultado.mensaje }
                    });

                default:
                    console.error("❌ ERROR EN PROCEDIMIENTO ALMACENADO:", resultado.mensaje);
                    return res.status(500).json({
                        data: { code: 500, message: resultado.mensaje }
                    });
            }
        }

        return res.status(500).json({
            data: { code: 500, message: "No se recibió una respuesta válida desde la base de datos." }
        });

    } catch (error) {
        console.error("❌ ERROR CRÍTICO EN CONTROLADOR DE CRÉDITOS:", error);
        return res.status(500).json({
            data: {
                code: 500,
                message: "Error crítico interno en el servidor."
            }
        });
    }
};