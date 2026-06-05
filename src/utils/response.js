import { DiccionarioMensajes } from '../config/mensajes.js';

/**
 * Genera una estructura de respuesta unificada basada en códigos de estado HTTP.
 * @param {string} claveMensaje - Clave del diccionario (ej: 'CREADO', 'PARAMETROS_INVALIDOS')
 * @param {any} [data=null] - Datos opcionales para respuestas exitosas (200 o 201)
 */
export const enviarRespuesta = (claveMensaje, data = null) => {
    const plantilla = DiccionarioMensajes[claveMensaje] || { code: 500, message: 'Error desconocido' };
    
    const respuesta = {
        code: plantilla.code,
        message: plantilla.message
    };

    // La propiedad 'data' solo se incluye si es un éxito y contiene información
    if (data !== null && (plantilla.code === 200 || plantilla.code === 201)) {
        respuesta.data = data;
    }

    return respuesta;
};