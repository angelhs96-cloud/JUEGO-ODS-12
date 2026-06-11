// ═══════════════════════════════════════════════
//   javascript/db.js
//   Base de datos usando localStorage del navegador
//   Guarda: usuarios, niveles y puntajes
// ═══════════════════════════════════════════════

const DB_KEY = 'ods_reciclaje_usuarios';

// ── Obtener todos los usuarios ──────────────────
function db_obtenerUsuarios() {
    const datos = localStorage.getItem(DB_KEY);
    return datos ? JSON.parse(datos) : {};
}

// ── Guardar todos los usuarios ──────────────────
function db_guardarUsuarios(usuarios) {
    localStorage.setItem(DB_KEY, JSON.stringify(usuarios));
}

// ── Registrar usuario nuevo ─────────────────────
function db_registrar(nombre, usuario, password) {
    const usuarios = db_obtenerUsuarios();

    // Verificar que el usuario no exista
    if (usuarios[usuario]) {
        return { ok: false, mensaje: 'Ese usuario ya existe 😅' };
    }

    // Crear el nuevo usuario
    usuarios[usuario] = {
        nombre:   nombre,
        password: password,
        nivel:    1,       // siempre empieza en nivel 1
        puntos:   0,
        estrellas: 0
    };

    db_guardarUsuarios(usuarios);
    return { ok: true, mensaje: '¡Registro exitoso! 🎉' };
}

// ── Iniciar sesión ──────────────────────────────
function db_login(usuario, password) {
    const usuarios = db_obtenerUsuarios();

    if (!usuarios[usuario]) {
        return { ok: false, mensaje: 'Usuario no encontrado 🔍' };
    }

    if (usuarios[usuario].password !== password) {
        return { ok: false, mensaje: 'Contraseña incorrecta 🔒' };
    }

    return { ok: true, datos: usuarios[usuario] };
}

// ── Guardar progreso del jugador ────────────────
function db_guardarProgreso(usuario, nivel, puntos, estrellas) {
    const usuarios = db_obtenerUsuarios();

    if (!usuarios[usuario]) return;

    // Solo actualizar si el nuevo nivel es mayor al guardado
    if (nivel > usuarios[usuario].nivel) {
        usuarios[usuario].nivel = nivel;
    }
    if (puntos > usuarios[usuario].puntos) {
        usuarios[usuario].puntos = puntos;
    }
    usuarios[usuario].estrellas = estrellas;

    db_guardarUsuarios(usuarios);
}

// ── Obtener datos de un usuario ─────────────────
function db_obtenerJugador(usuario) {
    const usuarios = db_obtenerUsuarios();
    return usuarios[usuario] || null;
}