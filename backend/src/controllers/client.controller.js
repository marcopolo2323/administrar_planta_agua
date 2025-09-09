const { Client, sequelize } = require('../models');

// Obtener todos los clientes
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });

    return res.status(200).json(clients);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Buscar cliente por número de documento (para clientes frecuentes)
exports.findClientByDocument = async (req, res) => {
  try {
    const { documentNumber } = req.params;
    
    if (!documentNumber) {
      return res.status(400).json({ message: 'El número de documento es requerido' });
    }
    
    const client = await Client.findOne({
      where: { documentNumber, active: true }
    });
    
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    return res.status(200).json(client);
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener un cliente por ID
exports.getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    return res.status(200).json(client);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear un nuevo cliente
exports.createClient = async (req, res) => {
  try {
    const { 
      name, 
      documentType, 
      documentNumber, 
      address, 
      district, 
      phone, 
      email, 
      isCompany, 
      hasCredit,
      clientStatus,
      recommendations,
      notes
    } = req.body;

    // Verificar si ya existe un cliente con el mismo número de documento
    const existingClient = await Client.findOne({ where: { documentNumber } });
    if (existingClient) {
      return res.status(400).json({ message: 'Ya existe un cliente con este número de documento' });
    }

    const client = await Client.create({
      name,
      documentType,
      documentNumber,
      address,
      district,
      phone,
      email,
      isCompany,
      hasCredit,
      clientStatus: clientStatus || 'nuevo',
      recommendations,
      notes
    });

    return res.status(201).json({
      message: 'Cliente creado correctamente',
      client
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar un cliente
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      documentType, 
      documentNumber, 
      address, 
      district, 
      phone, 
      email, 
      isCompany, 
      hasCredit, 
      active,
      clientStatus,
      recommendations,
      notes
    } = req.body;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar si el nuevo número de documento ya existe en otro cliente
    if (documentNumber !== client.documentNumber) {
      const existingClient = await Client.findOne({ where: { documentNumber } });
      if (existingClient && existingClient.id !== parseInt(id)) {
        return res.status(400).json({ message: 'Ya existe un cliente con este número de documento' });
      }
    }

    await client.update({
      name,
      documentType,
      documentNumber,
      address,
      district,
      phone,
      email,
      isCompany,
      hasCredit,
      active,
      clientStatus,
      recommendations,
      notes
    });

    return res.status(200).json({
      message: 'Cliente actualizado correctamente',
      client
    });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Eliminar un cliente (desactivar)
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    await client.update({ active: false });

    return res.status(200).json({
      message: 'Cliente eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Buscar clientes por nombre o número de documento
exports.searchClients = async (req, res) => {
  try {
    const { term } = req.query;

    const clients = await Client.findAll({
      where: {
        active: true,
        [sequelize.Op.or]: [
          { name: { [sequelize.Op.iLike]: `%${term}%` } },
          { documentNumber: { [sequelize.Op.iLike]: `%${term}%` } }
        ]
      },
      order: [['name', 'ASC']]
    });

    return res.status(200).json(clients);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};