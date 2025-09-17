const crypto = require('crypto');

/**
 * Genera un token de acceso seguro para pedidos
 * @returns {string} Token de 32 caracteres hexadecimales
 */
function generateAccessToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Genera un token de acceso único que no existe en la base de datos
 * @param {Object} model - Modelo de Sequelize para verificar unicidad
 * @returns {Promise<string>} Token único
 */
async function generateUniqueAccessToken(model) {
  let token;
  let isUnique = false;
  
  while (!isUnique) {
    token = generateAccessToken();
    const existing = await model.findOne({ where: { accessToken: token } });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return token;
}

module.exports = {
  generateAccessToken,
  generateUniqueAccessToken
};
