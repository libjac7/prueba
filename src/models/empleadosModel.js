
import db from '../config/dbconfig.js';

class Empleados {

    getEmpleados(callback) {
        const sql = "SELECT * FROM empleados";
        db.query(sql, callback);
    }

    getEmpleadosForId(id, callback) {
        const sql = "SELECT * FROM empleados WHERE id_emp = ?";
        db.query(sql, [id], callback);
    }

}

export default new Empleados();