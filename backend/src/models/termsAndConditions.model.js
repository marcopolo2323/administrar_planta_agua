const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TermsAndConditions = sequelize.define('TermsAndConditions', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  version: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Versión de los términos (ej: 1.0, 2.0)'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Título de los términos'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Contenido completo de los términos y condiciones'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Si estos términos están activos actualmente'
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Fecha de vigencia de estos términos'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'Usuario que creó estos términos'
  },
  lastModifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
    comment: 'Usuario que modificó por última vez'
  }
}, {
  tableName: 'TermsAndConditions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = TermsAndConditions;
