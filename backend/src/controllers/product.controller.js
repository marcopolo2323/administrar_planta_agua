const { Product } = require('../models');
const { calculateProductPrice, getWholesalePricingInfo } = require('../utils/pricing.utils');

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      type, 
      unitPrice, 
      wholesalePrice, 
      wholesaleMinQuantity,
      wholesalePrice2,
      wholesaleMinQuantity2,
      wholesalePrice3,
      wholesaleMinQuantity3,
      stock 
    } = req.body;

    const product = await Product.create({
      name,
      description,
      type,
      unitPrice,
      wholesalePrice,
      wholesaleMinQuantity,
      wholesalePrice2,
      wholesaleMinQuantity2,
      wholesalePrice3,
      wholesaleMinQuantity3,
      stock
    });

    return res.status(201).json({
      message: 'Producto creado correctamente',
      product
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      type, 
      unitPrice, 
      wholesalePrice, 
      wholesaleMinQuantity,
      wholesalePrice2,
      wholesaleMinQuantity2,
      wholesalePrice3,
      wholesaleMinQuantity3,
      stock, 
      active 
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await product.update({
      name,
      description,
      type,
      unitPrice,
      wholesalePrice,
      wholesaleMinQuantity,
      wholesalePrice2,
      wholesaleMinQuantity2,
      wholesalePrice3,
      wholesaleMinQuantity3,
      stock,
      active
    });

    return res.status(200).json({
      message: 'Producto actualizado correctamente',
      product
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Eliminar un producto (desactivar)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await product.update({ active: false });

    return res.status(200).json({
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar stock de producto
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    let newStock = product.stock;
    if (operation === 'add') {
      newStock += quantity;
    } else if (operation === 'subtract') {
      newStock -= quantity;
      if (newStock < 0) {
        return res.status(400).json({ message: 'Stock insuficiente' });
      }
    } else {
      return res.status(400).json({ message: 'Operación no válida' });
    }

    await product.update({ stock: newStock });

    return res.status(200).json({
      message: 'Stock actualizado correctamente',
      product
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Calcular precio de un producto según la cantidad
exports.calculatePrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const pricing = calculateProductPrice(product, quantity);

    return res.status(200).json({
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        pricing: pricing,
        pricingInfo: getWholesalePricingInfo(product)
      }
    });
  } catch (error) {
    console.error('Error al calcular precio:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener información de precios de mayoreo de un producto
exports.getPricingInfo = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const pricingInfo = getWholesalePricingInfo(product);

    return res.status(200).json({
      success: true,
      data: {
        productId: product.id,
        productName: product.name,
        pricingInfo: pricingInfo
      }
    });
  } catch (error) {
    console.error('Error al obtener información de precios:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};