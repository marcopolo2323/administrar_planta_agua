const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DeliveryPerson = sequelize.define('DeliveryPerson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  documentType: {
    type: DataTypes.ENUM('DNI', 'CE'),
    allowNull: false,
    defaultValue: 'DNI'
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vehicleType: {
    type: DataTypes.ENUM('moto', 'bicicleta', 'auto', 'a_pie'),
    allowNull: false,
    defaultValue: 'moto'
  },
  vehiclePlate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('disponible', 'en_ruta', 'no_disponible'),
    allowNull: false,
    defaultValue: 'disponible'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = DeliveryPerson;