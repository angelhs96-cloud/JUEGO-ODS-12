-- ═══════════════════════════════════════════════
--   backend/database.sql
--   Script para SQL Server Management Studio
--   Ejecutar en SSMS con autenticación Windows
-- ═══════════════════════════════════════════════

-- Crear base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'reciclaje_ods12')
    CREATE DATABASE reciclaje_ods12;
GO

USE reciclaje_ods12;
GO

-- Tabla de usuarios
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usuarios' AND xtype='U')
CREATE TABLE usuarios (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    nombre          NVARCHAR(100) NOT NULL,
    usuario         NVARCHAR(50)  NOT NULL UNIQUE,
    password        NVARCHAR(255) NOT NULL,
    nivel           INT           DEFAULT 1,
    puntos          INT           DEFAULT 0,
    estrellas       INT           DEFAULT 0,
    fecha_registro  DATETIME      DEFAULT GETDATE(),
    ultima_sesion   DATETIME      NULL
);
GO

-- Tabla de sesiones
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='sesiones' AND xtype='U')
CREATE TABLE sesiones (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id      INT           NOT NULL,
    nivel_alcanzado INT           NOT NULL,
    puntaje         INT           NOT NULL,
    aciertos        INT           DEFAULT 0,
    tiempo_segundos INT           DEFAULT 0,
    fecha           DATETIME      DEFAULT GETDATE(),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
GO

-- Vista ranking global
IF EXISTS (SELECT * FROM sys.views WHERE name = 'ranking_global')
    DROP VIEW ranking_global;
GO
CREATE VIEW ranking_global AS
    SELECT TOP 10
        u.usuario,
        u.nombre,
        u.puntos        AS mejor_puntaje,
        u.nivel         AS nivel_maximo,
        u.ultima_sesion
    FROM usuarios u
    ORDER BY u.puntos DESC;
GO

SELECT 'Base de datos reciclaje_ods12 creada correctamente' AS estado;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
GO