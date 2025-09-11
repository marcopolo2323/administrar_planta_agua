-- Migración para Supabase - AquaYara
-- Ejecutar en el SQL Editor de Supabase

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS "Users" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vendedor', 'repartidor', 'cliente')),
    phone VARCHAR(20),
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS "Products" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    wholesalePrice DECIMAL(10,2),
    minWholesaleQuantity INTEGER DEFAULT 0,
    type VARCHAR(50),
    isActive BOOLEAN DEFAULT true,
    imageUrl VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de distritos
CREATE TABLE IF NOT EXISTS "Districts" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    deliveryFee DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS "Clients" (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES "Users"(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    documentType VARCHAR(10) NOT NULL CHECK (documentType IN ('DNI', 'RUC')),
    documentNumber VARCHAR(20) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    clientStatus VARCHAR(20) DEFAULT 'nuevo' CHECK (clientStatus IN ('activo', 'nuevo', 'inactivo', 'retomando')),
    recommendations TEXT,
    notes TEXT,
    lastOrderDate DATE,
    totalOrders INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de planes de suscripción
CREATE TABLE IF NOT EXISTS "SubscriptionPlans" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    bottles INTEGER NOT NULL,
    bonuses INTEGER DEFAULT 0,
    description TEXT,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS "Subscriptions" (
    id SERIAL PRIMARY KEY,
    clientId INTEGER REFERENCES "Clients"(id) ON DELETE CASCADE,
    planId INTEGER REFERENCES "SubscriptionPlans"(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    remainingBottles INTEGER NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS "Orders" (
    id SERIAL PRIMARY KEY,
    clientId INTEGER REFERENCES "Clients"(id) ON DELETE CASCADE,
    deliveryPersonId INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
    subscriptionId INTEGER REFERENCES "Subscriptions"(id) ON DELETE SET NULL,
    total DECIMAL(10,2) NOT NULL,
    deliveryFee DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado')),
    deliveryAddress TEXT NOT NULL,
    deliveryDistrict VARCHAR(100) NOT NULL,
    contactPhone VARCHAR(20),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de detalles de pedidos
CREATE TABLE IF NOT EXISTS "OrderDetails" (
    id SERIAL PRIMARY KEY,
    orderId INTEGER REFERENCES "Orders"(id) ON DELETE CASCADE,
    productId INTEGER REFERENCES "Products"(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pedidos de invitados
CREATE TABLE IF NOT EXISTS "GuestOrders" (
    id SERIAL PRIMARY KEY,
    customerName VARCHAR(100) NOT NULL,
    customerPhone VARCHAR(20) NOT NULL,
    deliveryAddress TEXT NOT NULL,
    deliveryDistrict VARCHAR(100) NOT NULL,
    districtId INTEGER REFERENCES "Districts"(id) ON DELETE SET NULL,
    deliveryPersonId INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
    total DECIMAL(10,2) NOT NULL,
    deliveryFee DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'en_preparacion', 'en_camino', 'entregado', 'cancelado')),
    paymentMethod VARCHAR(20) DEFAULT 'cash' CHECK (paymentMethod IN ('cash', 'card', 'yape', 'plin')),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos de pedidos de invitados
CREATE TABLE IF NOT EXISTS "GuestOrderProducts" (
    id SERIAL PRIMARY KEY,
    guestOrderId INTEGER REFERENCES "GuestOrders"(id) ON DELETE CASCADE,
    productId INTEGER REFERENCES "Products"(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de vales
CREATE TABLE IF NOT EXISTS "Vouchers" (
    id SERIAL PRIMARY KEY,
    clientId INTEGER REFERENCES "Clients"(id) ON DELETE CASCADE,
    orderId INTEGER REFERENCES "Orders"(id) ON DELETE CASCADE,
    productId INTEGER REFERENCES "Products"(id) ON DELETE CASCADE,
    deliveryPersonId INTEGER REFERENCES "Users"(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unitPrice DECIMAL(10,2) NOT NULL,
    totalAmount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'cancelled')),
    deliveryDate DATE,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos mensuales
CREATE TABLE IF NOT EXISTS "MonthlyPayments" (
    id SERIAL PRIMARY KEY,
    clientId INTEGER REFERENCES "Clients"(id) ON DELETE CASCADE,
    totalAmount DECIMAL(10,2) NOT NULL,
    deliveryFee DECIMAL(10,2) NOT NULL DEFAULT 0,
    paymentMethod VARCHAR(20) NOT NULL CHECK (paymentMethod IN ('cash', 'card', 'yape', 'plin')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    paymentDate DATE,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales
INSERT INTO "Users" (username, email, password, role, phone) VALUES
('admin', 'admin@aquayara.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '+51999999999'),
('vendedor', 'vendedor@aquayara.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'vendedor', '+51999999998'),
('repartidor', 'repartidor@aquayara.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'repartidor', '+51999999997'),
('cliente1', 'cliente1@aquayara.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cliente', '+51999999996');

INSERT INTO "Products" (name, description, price, wholesalePrice, minWholesaleQuantity, type, imageUrl) VALUES
('Bidón de Agua 20L', 'Bidón de agua purificada de 20 litros', 7.00, 5.00, 2, 'bidon', '/images/img_buyon.jpeg'),
('Paquete de Botellas', 'Paquete de botellas de agua purificada', 10.00, 9.00, 60, 'botellas', '/images/img_paquete_botellas.jpeg');

INSERT INTO "Districts" (name, deliveryFee) VALUES
('Miraflores', 1.00),
('San Isidro', 1.00),
('La Molina', 1.50),
('Surco', 1.50),
('Lima', 2.00),
('Callao', 2.00),
('Pueblo Libre', 1.50),
('Magdalena', 1.50),
('San Miguel', 2.00),
('Bellavista', 2.00);

INSERT INTO "SubscriptionPlans" (name, price, bottles, bonuses, description) VALUES
('Plan Básico', 50.00, 10, 1, '10 botellas + 1 de bonificación'),
('Plan Estándar', 100.00, 20, 3, '20 botellas + 3 de bonificación'),
('Plan Premium', 200.00, 50, 10, '50 botellas + 10 de bonificación');

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON "Clients"(userId);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON "Orders"(clientId);
CREATE INDEX IF NOT EXISTS idx_orders_status ON "Orders"(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_client_id ON "Vouchers"(clientId);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON "Vouchers"(status);
CREATE INDEX IF NOT EXISTS idx_guest_orders_status ON "GuestOrders"(status);
