const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'vendedor', 'cliente', 'repartidor'),
    defaultValue: 'cliente'
  },
  // Datos personales
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nombre del usuario'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Apellido del usuario'
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'DNI del usuario'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Teléfono del usuario'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Dirección del usuario'
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Distrito del usuario'
  },
  reference: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Referencia de dirección'
  },
  
  // Datos específicos para repartidores
  vehicleType: {
    type: DataTypes.ENUM('motorcycle', 'bicycle', 'car', 'truck'),
    allowNull: true,
    comment: 'Tipo de vehículo del repartidor'
  },
  vehiclePlate: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Placa del vehículo'
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de licencia de conducir'
  },
  insuranceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Número de seguro'
  },
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Contacto de emergencia'
  },
  emergencyPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Teléfono de emergencia'
  },
  
  // Estado del usuario
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si el usuario está activo'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Último inicio de sesión'
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para verificar si el usuario es un cliente
User.prototype.isClient = function() {
  return this.role === 'cliente';
};

// Método para verificar si el usuario es un repartidor
User.prototype.isDeliveryPerson = function() {
  return this.role === 'repartidor';
};

// Método para verificar si el usuario es un administrador
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// Método para verificar si el usuario es un vendedor
User.prototype.isSeller = function() {
  return this.role === 'vendedor';
};

module.exports = User;