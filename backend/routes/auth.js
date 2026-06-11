// ═══════════════════════════════════════════════
//   backend/routes/auth.js
//   Rutas de autenticación para SQL Server
// ═══════════════════════════════════════════════

const express      = require('express');
const router       = express.Router();
const { sql, getPool } = require('../database');

// ── POST /api/auth/registro ────────────────────
router.post('/registro', async (req, res) => {
    const { nombre, usuario, password } = req.body;

    if (!nombre || !usuario || !password)
        return res.status(400).json({ ok: false, mensaje: '¡Completa todos los campos! 📝' });
    if (password.length < 4)
        return res.status(400).json({ ok: false, mensaje: 'Contraseña muy corta 🔑' });

    try {
        const pool = await getPool();

        // Verificar si existe
        const existe = await pool.request()
            .input('usuario', sql.VarChar, usuario)
            .query('SELECT id FROM usuarios WHERE usuario = @usuario');

        if (existe.recordset.length > 0)
            return res.status(409).json({ ok: false, mensaje: 'Ese usuario ya existe 😅' });

        // Insertar
        await pool.request()
            .input('nombre',   sql.VarChar, nombre)
            .input('usuario',  sql.VarChar, usuario)
            .input('password', sql.VarChar, password)
            .query('INSERT INTO usuarios (nombre, usuario, password) VALUES (@nombre, @usuario, @password)');

        res.status(201).json({ ok: true, mensaje: '¡Registro exitoso! 🎉' });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
    }
});

// ── POST /api/auth/login ───────────────────────
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password)
        return res.status(400).json({ ok: false, mensaje: '¡Ingresa tus datos! 🔐' });

    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('usuario',  sql.VarChar, usuario)
            .input('password', sql.VarChar, password)
            .query('SELECT id, nombre, usuario, nivel, puntos, estrellas FROM usuarios WHERE usuario = @usuario AND password = @password');

        if (result.recordset.length === 0)
            return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos 🔒' });

        // Actualizar última sesión
        await pool.request()
            .input('usuario', sql.VarChar, usuario)
            .query('UPDATE usuarios SET ultima_sesion = GETDATE() WHERE usuario = @usuario');

        res.json({ ok: true, datos: result.recordset[0] });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
    }
});

module.exports = router;