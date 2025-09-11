const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// DEBUG - Agregar estas líneas
console.log('🔍 DEBUG INFO:');
console.log('NODE_ENV:', env);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('Using production config:', env === 'production' && !!process.env.DATABASE_URL);

let sequelize;

if (env === 'production' && process.env.DATABASE_URL) {
  console.log('✅ Using production config with SSL');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else if (process.env.DATABASE_URL) {
  console.log('✅ Using DATABASE_URL with SSL (fallback)');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  console.log('✅ Using local development config');
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging
    }
  );
}

module.exports = sequelize;