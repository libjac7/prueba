

import empleadosModel from '../models/empleadosModel.js';

const empleadosController = {

    getEmpleados: (req, res) => {
        empleadosModel.getEmpleados((err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ data: result });
        });
    },

    getEmpleadosForId: (req, res) => {
          console.log(req.params.id);
        const { id } = req.params;
        empleadosModel.getEmpleadosForId(id, (err, result) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: 'Empleado no encontrado'
                });
            }

            res.status(200).json({ data: result });
        });
    }

};

export default empleadosController;

