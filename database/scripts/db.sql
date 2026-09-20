-- =============================================
-- Disagro - Evento de Promociones Anuales
-- Script de inicialización de base de datos
-- =============================================

IF NOT EXISTS (SELECT name FROM master.dbo.sysdatabases WHERE name = 'DisagroEvento')
BEGIN
    CREATE DATABASE DisagroEvento;
    PRINT 'Base de datos DisagroEvento creada';
END
ELSE
BEGIN
    PRINT 'Base de datos DisagroEvento ya existe';
END
GO

USE DisagroEvento;
GO

-- =============================================
-- TABLA: Users (autenticación JWT)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Users' AND xtype = 'U')
BEGIN
    CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(150) NOT NULL,
        email NVARCHAR(150) NOT NULL,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL DEFAULT 'Admin',
        active BIT NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_Users_Email UNIQUE (email)
    );
    PRINT 'Tabla Users creada';
END
ELSE
BEGIN
    PRINT 'Tabla Users ya existe';
END
GO

-- =============================================
-- TABLA: Item (catálogo Servicio / Producto)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Item' AND xtype = 'U')
BEGIN
    CREATE TABLE Item (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(150) NOT NULL,
        description NVARCHAR(MAX) NULL,
        type NVARCHAR(20) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        active BIT NOT NULL DEFAULT 1,
        createdAt DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT CK_Item_Type CHECK (type IN ('SERVICE', 'PRODUCT')),
        CONSTRAINT CK_Item_Price CHECK (price >= 0)
    );
    PRINT 'Tabla Item creada';
END
ELSE
BEGIN
    PRINT 'Tabla Item ya existe';
END
GO

-- =============================================
-- TABLA: Confirmation (registro de asistencia)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Confirmation' AND xtype = 'U')
BEGIN
    CREATE TABLE Confirmation (
        id INT IDENTITY(1,1) PRIMARY KEY,
        clientName NVARCHAR(100) NOT NULL,
        clientLastname NVARCHAR(100) NOT NULL,
        clientEmail NVARCHAR(150) NOT NULL,
        eventDateTime DATETIME NOT NULL,
        servicesDiscountPercentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        productsDiscountPercentage DECIMAL(5,2) NOT NULL DEFAULT 0,
        totalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
        finalAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT CK_Confirmation_ServicesDiscount CHECK (servicesDiscountPercentage IN (0, 3, 5)),
        CONSTRAINT CK_Confirmation_ProductsDiscount CHECK (productsDiscountPercentage IN (0, 3, 5)),
        CONSTRAINT CK_Confirmation_Amounts CHECK (totalAmount >= 0 AND finalAmount >= 0)
    );
    PRINT 'Tabla Confirmation creada';
END
ELSE
BEGIN
    PRINT 'Tabla Confirmation ya existe';
END
GO

-- =============================================
-- TABLA: ConfirmationItem (detalle elegido + snapshot)
-- =============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'ConfirmationItem' AND xtype = 'U')
BEGIN
    CREATE TABLE ConfirmationItem (
        confirmationId INT NOT NULL,
        itemId INT NOT NULL,
        unitPrice DECIMAL(10,2) NOT NULL,
        itemType NVARCHAR(20) NOT NULL,
        itemName NVARCHAR(150) NOT NULL,
        CONSTRAINT PK_ConfirmationItem PRIMARY KEY (confirmationId, itemId),
        CONSTRAINT FK_ConfirmationItem_Confirmation FOREIGN KEY (confirmationId)
            REFERENCES Confirmation(id),
        CONSTRAINT FK_ConfirmationItem_Item FOREIGN KEY (itemId)
            REFERENCES Item(id),
        CONSTRAINT CK_ConfirmationItem_Type CHECK (itemType IN ('SERVICE', 'PRODUCT')),
        CONSTRAINT CK_ConfirmationItem_UnitPrice CHECK (unitPrice >= 0)
    );
    PRINT 'Tabla ConfirmationItem creada';
END
ELSE
BEGIN
    PRINT 'Tabla ConfirmationItem ya existe';
END
GO

-- =============================================
-- DATOS: Users
-- Password: password (hash bcrypt)
-- =============================================
IF NOT EXISTS (SELECT * FROM Users)
BEGIN
    INSERT INTO Users (name, email, password, role, active) VALUES
    ('Administrador Disagro', 'admin@disagro.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 1);

    PRINT 'Usuario administrador insertado (admin@disagro.com / password)';
END
ELSE
BEGIN
    PRINT 'Datos de Users ya existen';
END
GO

-- =============================================
-- DATOS: Item (servicios y productos de ejemplo)
-- =============================================
IF NOT EXISTS (SELECT * FROM Item)
BEGIN
    INSERT INTO Item (name, description, type, price, active) VALUES
    -- Servicios
    (N'Asesoría Técnica Agrícola', N'Diagnóstico y recomendaciones de campo con especialista.', 'SERVICE', 450.00, 1),
    (N'Análisis de Suelos', N'Muestreo y reporte de nutrientes para fertilización.', 'SERVICE', 320.00, 1),
    (N'Capacitación en Buenas Prácticas', N'Taller presencial para personal de finca.', 'SERVICE', 550.00, 1),
    (N'Soporte Post-Venta', N'Acompañamiento técnico durante el ciclo del cultivo.', 'SERVICE', 280.00, 1),
    (N'Diagnóstico Fitopatológico', N'Identificación de plagas y enfermedades.', 'SERVICE', 390.00, 1),

    -- Productos
    (N'Fertilizante Premium NPK', N'Fórmula balanceada para alto rendimiento.', 'PRODUCT', 185.00, 1),
    (N'Semilla Mejorada de Maíz', N'Variedad de alto potencial genético.', 'PRODUCT', 95.00, 1),
    (N'Herbicida Selectivo', N'Control efectivo de malezas de hoja ancha.', 'PRODUCT', 140.00, 1),
    (N'Insecticida Sistémico', N'Protección prolongada contra insectos chupadores.', 'PRODUCT', 160.00, 1),
    (N'Bioestimulante Foliar', N'Mejora absorción de nutrientes y estrés hídrico.', 'PRODUCT', 120.00, 1),
    (N'Fungicida Preventivo', N'Protección contra enfermedades foliares.', 'PRODUCT', 175.00, 1),
    (N'Kit de Riego por Goteo', N'Kit básico para 1 manzana de cultivo.', 'PRODUCT', 890.00, 1);

    PRINT 'Catálogo de Items insertado';
END
ELSE
BEGIN
    PRINT 'Datos de Item ya existen';
END
GO

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================
PRINT '=============================================';
PRINT 'VERIFICACIÓN DE TABLAS CREADAS:';
PRINT '=============================================';

SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
  AND TABLE_CATALOG = 'DisagroEvento'
ORDER BY TABLE_NAME;

PRINT '=============================================';
PRINT 'CONTEO DE REGISTROS:';
PRINT '=============================================';

SELECT 'Users' AS Tabla, COUNT(*) AS Registros FROM Users
UNION ALL
SELECT 'Item', COUNT(*) FROM Item
UNION ALL
SELECT 'Confirmation', COUNT(*) FROM Confirmation
UNION ALL
SELECT 'ConfirmationItem', COUNT(*) FROM ConfirmationItem;

PRINT '=============================================';
PRINT 'BASE DE DATOS INICIALIZADA CORRECTAMENTE';
PRINT '=============================================';
PRINT 'Credenciales demo:';
PRINT '  Email: admin@disagro.com';
PRINT '  Password: password';
PRINT '=============================================';
GO
