// ═══════════════════════════════════════════════
//   backend/routes/game.js
//   Rutas del juego para SQL Server
// ═══════════════════════════════════════════════

const express      = require('express');
const router       = express.Router();
const { sql, getPool } = require('../database');

// ── POST /api/game/progreso ────────────────────
router.post('/progreso', async (req, res) => {
    const { usuario, nivel, puntos, aciertos, tiempo_segundos } = req.body;

    if (!usuario)
        return res.status(400).json({ ok: false, mensaje: 'Usuario requerido' });

    try {
        const pool = await getPool();

        const jugador = await pool.request()
            .input('usuario', sql.VarChar, usuario)
            .query('SELECT id, nivel, puntos FROM usuarios WHERE usuario = @usuario');

        if (jugador.recordset.length === 0)
            return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado' });

        const j = jugador.recordset[0];
        const nivelNuevo  = nivel  > j.nivel  ? nivel  : j.nivel;
        const puntosNuevo = puntos > j.puntos ? puntos : j.puntos;

        await pool.request()
            .input('nivel',     sql.Int,     nivelNuevo)
            .input('puntos',    sql.Int,     puntosNuevo)
            .input('estrellas', sql.Int,     aciertos || 0)
            .input('usuario',   sql.VarChar, usuario)
            .query('UPDATE usuarios SET nivel = @nivel, puntos = @puntos, estrellas = @estrellas WHERE usuario = @usuario');

        await pool.request()
            .input('usuario_id',      sql.Int, j.id)
            .input('nivel_alcanzado', sql.Int, nivel || 1)
            .input('puntaje',         sql.Int, puntos || 0)
            .input('aciertos',        sql.Int, aciertos || 0)
            .input('tiempo_segundos', sql.Int, tiempo_segundos || 0)
            .query('INSERT INTO sesiones (usuario_id, nivel_alcanzado, puntaje, aciertos, tiempo_segundos) VALUES (@usuario_id, @nivel_alcanzado, @puntaje, @aciertos, @tiempo_segundos)');

        res.json({ ok: true, mensaje: '¡Progreso guardado! ✅' });

    } catch (error) {
        console.error('Error guardando progreso:', error);
        res.status(500).json({ ok: false, mensaje: 'Error al guardar progreso' });
    }
});

// ── GET /api/game/jugador/:usuario ─────────────
router.get('/jugador/:usuario', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('usuario', sql.VarChar, req.params.usuario)
            .query('SELECT nombre, usuario, nivel, puntos, estrellas FROM usuarios WHERE usuario = @usuario');

        if (result.recordset.length === 0)
            return res.status(404).json({ ok: false, mensaje: 'Jugador no encontrado' });

        res.json({ ok: true, datos: result.recordset[0] });

    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener jugador' });
    }
});

// ── GET /api/game/ranking ──────────────────────
router.get('/ranking', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query('SELECT TOP 10 usuario, nombre, puntos AS mejor_puntaje, nivel AS nivel_maximo FROM usuarios ORDER BY puntos DESC');

        res.json({ ok: true, ranking: result.recordset });

    } catch (error) {
        res.status(500).json({ ok: false, mensaje: 'Error al obtener ranking' });
    }
});

module.exports = router;