const express = require('express');
const router = express.Router();
const controller = require('./controllers');

router.post('/appointments', controller.createAppointment);
router.post('/appointments/:id/cancel', controller.cancelAppointment);
router.patch('/appointments/:id/status', controller.updateAppointmentStatus);
router.get('/availability', controller.checkAvailability);
router.get('/professionals/:id/schedule', controller.getProfessionalSchedule);

module.exports = router;
