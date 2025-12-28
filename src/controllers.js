const { sql, poolPromise } = require('./db');

exports.createAppointment = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { customerId, professionalId, serviceId, startDateTime, notes } = req.body;

        await pool.request()
            .input('CustomerId', sql.Int, customerId)
            .input('ProfessionalId', sql.Int, professionalId)
            .input('ServiceId', sql.Int, serviceId)
            .input('StartDateTime', sql.DateTime2, startDateTime)
            .input('Notes', sql.NVarChar(500), notes)
            .execute('sp_CreateAppointment');

        res.status(201).json({ message: 'Appointment created successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { id } = req.params;

        await pool.request()
            .input('AppointmentId', sql.Int, id)
            .execute('sp_CancelAppointment');

        res.status(200).json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { id } = req.params;
        const { status } = req.body;

        await pool.request()
            .input('AppointmentId', sql.Int, id)
            .input('Status', sql.VarChar(20), status)
            .execute('sp_UpdateAppointmentStatus');

        res.status(200).json({ message: 'Appointment status updated successfully' });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.checkAvailability = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { professionalId, start, end } = req.query;

        const result = await pool.request()
            .input('ProfessionalId', sql.Int, professionalId)
            .input('StartDateTime', sql.DateTime2, start)
            .input('EndDateTime', sql.DateTime2, end)
            .execute('sp_CheckAvailability');

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

exports.getProfessionalSchedule = async (req, res) => {
    try {
        const pool = await poolPromise;
        const { id } = req.params;
        const { from, to } = req.query;

        const result = await pool.request()
            .input('ProfessionalId', sql.Int, id)
            .input('FromDate', sql.DateTime2, from)
            .input('ToDate', sql.DateTime2, to)
            .execute('sp_GetProfessionalSchedule');

        res.status(200).json(result.recordset);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};
