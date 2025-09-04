const DeliveryFee = require('../models/deliveryFee.model');

// Obtener todas las tarifas de envío
exports.getAllDeliveryFees = async (req, res) => {
  try {
    const fees = await DeliveryFee.findAll({ where: { active: true } });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tarifas', error });
  }
};

// Obtener tarifa por distrito
exports.getDeliveryFeeByDistrict = async (req, res) => {
  try {
    const { district } = req.params;
    const fee = await DeliveryFee.findOne({ where: { district } });
    if (fee) {
      res.json(fee);
    } else {
      res.status(404).json({ message: 'Distrito no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar distrito', error });
  }
};

// Crear nueva tarifa
exports.createDeliveryFee = async (req, res) => {
  try {
    const { district, fee } = req.body;
    if (!district || fee === undefined) {
      return res.status(400).json({ message: 'Distrito y tarifa son obligatorios' });
    }
    const newFee = await DeliveryFee.create({ district, fee });
    res.status(201).json(newFee);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear tarifa', error });
  }
};

// Actualizar tarifa
exports.updateDeliveryFee = async (req, res) => {
  try {
    const { id } = req.params;
    const { district, fee, active } = req.body;
    const feeRecord = await DeliveryFee.findByPk(id);
    if (!feeRecord) {
      return res.status(404).json({ message: 'Tarifa no encontrada' });
    }
    if (district) feeRecord.district = district;
    if (fee !== undefined) feeRecord.fee = fee;
    if (active !== undefined) feeRecord.active = active;
    await feeRecord.save();
    res.json(feeRecord);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar tarifa', error });
  }
};

// Eliminar tarifa
exports.deleteDeliveryFee = async (req, res) => {
  try {
    const { id } = req.params;
    const feeRecord = await DeliveryFee.findByPk(id);
    if (!feeRecord) {
      return res.status(404).json({ message: 'Tarifa no encontrada' });
    }
    await feeRecord.destroy();
    res.json({ message: 'Tarifa eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar tarifa', error });
  }
};
