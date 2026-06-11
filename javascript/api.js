// ═══════════════════════════════════════════════
//   javascript/api.js
//   Comunicación con el backend Node.js + MySQL
//   Si el backend no está disponible, usa localStorage
// ═══════════════════════════════════════════════

const API_URL = 'http://localhost:3000/api';

// ── Verificar si el backend está disponible ────
let backendDisponible = false;

async function verificarBackend() {
    try {
        const resp = await fetch(`${API_URL}/ping`, { signal: AbortSignal.timeout(2000) });
        backendDisponible = resp.ok;
    } catch {
        backendDisponible = false;
    }
    console.log(backendDisponible
        ? '✅ Backend MySQL conectado'
        : '⚠️ Backend no disponible — usando localStorage como respaldo'
    );
}

verificarBackend();

// ══════════════════════════════════════════════
//  REGISTRO
// ══════════════════════════════════════════════
async function api_registrar(nombre, usuario, password) {
    if (backendDisponible) {
        try {
            const resp = await fetch(`${API_URL}/auth/registro`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ nombre, usuario, password })
            });
            return await resp.json();
        } catch {
            console.warn('Error de red — usando localStorage');
        }
    }
    // Fallback localStorage
    return db_registrar(nombre, usuario, password);
}

// ══════════════════════════════════════════════
//  LOGIN
// ══════════════════════════════════════════════
async function api_login(usuario, password) {
    if (backendDisponible) {
        try {
            const resp = await fetch(`${API_URL}/auth/login`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ usuario, password })
            });
            return await resp.json();
        } catch {
            console.warn('Error de red — usando localStorage');
        }
    }
    return db_login(usuario, password);
}

// ══════════════════════════════════════════════
//  GUARDAR PROGRESO
// ══════════════════════════════════════════════
async function api_guardarProgreso(usuario, nivel, puntos, aciertos, tiempo_segundos = 0) {
    if (backendDisponible) {
        try {
            await fetch(`${API_URL}/game/progreso`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ usuario, nivel, puntos, aciertos, tiempo_segundos })
            });
        } catch {
            console.warn('Error al guardar en MySQL — guardando en localStorage');
        }
    }
    // Siempre guardar también en localStorage (doble respaldo)
    db_guardarProgreso(usuario, nivel, puntos, aciertos);
}

// ══════════════════════════════════════════════
//  OBTENER JUGADOR
// ══════════════════════════════════════════════
async function api_obtenerJugador(usuario) {
    if (backendDisponible) {
        try {
            const resp = await fetch(`${API_URL}/game/jugador/${usuario}`);
            const data = await resp.json();
            if (data.ok) return data.datos;
        } catch {
            console.warn('Error de red — usando localStorage');
        }
    }
    return db_obtenerJugador(usuario);
}

// ══════════════════════════════════════════════
//  RANKING GLOBAL (solo MySQL)
// ══════════════════════════════════════════════
async function api_obtenerRanking() {
    if (!backendDisponible) return [];
    try {
        const resp = await fetch(`${API_URL}/game/ranking`);
        const data = await resp.json();
        return data.ok ? data.ranking : [];
    } catch {
        return [];
    }
}