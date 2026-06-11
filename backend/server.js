// ═══════════════════════════════════════════════
//   backend/server.js
//   Servidor principal Node.js + Express
//   Juego de Reciclaje ODS 12
// ═══════════════════════════════════════════════

require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares ────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:5501',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// ── Rutas de la API ────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// ── Ruta de verificación (health check) ───────
app.get('/api/ping', (req, res) => {
    res.json({ ok: true, mensaje: 'Servidor ODS 12 funcionando ✅', tiempo: new Date() });
});

// ── Iniciar servidor ───────────────────────────
app.listen(PORT, () => {
    console.log(`\n🌱 Servidor ODS 12 corriendo en http://localhost:${PORT}`);
    console.log(`   Endpoints disponibles:`);
    console.log(`   POST /api/auth/registro`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/game/progreso`);
    console.log(`   GET  /api/game/jugador/:usuario`);
    console.log(`   GET  /api/game/ranking\n`);
});