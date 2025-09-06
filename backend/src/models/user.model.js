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
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reference: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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