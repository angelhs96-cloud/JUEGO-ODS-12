// ═══════════════════════════════════════════════
//   javascript/juego.js
//   Lógica del juego de reciclaje con Canvas
//   ODS 12 — Producción y Consumo Responsable
// ═══════════════════════════════════════════════

// ──────────────────────────────────────────────
//  1. CONFIGURACIÓN DE NIVELES  ← editar aquí
// ──────────────────────────────────────────────
const NIVELES = {
    1: { velocidad: 1.2, objetivo: 6,  nombre: 'Principiante 🌱' },
    2: { velocidad: 2.0, objetivo: 9,  nombre: 'Explorador 🌿'   },
    3: { velocidad: 2.8, objetivo: 12, nombre: 'Guardián 🌳'     },
    4: { velocidad: 3.6, objetivo: 15, nombre: 'Héroe 🌍'        }
};

// ──────────────────────────────────────────────
//  2. OBJETOS QUE CAEN (emoji + tipo de tacho)
// ──────────────────────────────────────────────
const OBJETOS = [
    { emoji: '🍾', nombre: 'Botella',    tipo: 'plastico', color: '#fbbf24' },
    { emoji: '🥤', nombre: 'Vaso',       tipo: 'plastico', color: '#fbbf24' },
    { emoji: '🛍️', nombre: 'Bolsa',      tipo: 'plastico', color: '#fbbf24' },
    { emoji: '📰', nombre: 'Periódico',  tipo: 'papel',    color: '#60a5fa' },
    { emoji: '📦', nombre: 'Caja',       tipo: 'papel',    color: '#60a5fa' },
    { emoji: '🍌', nombre: 'Plátano',    tipo: 'organico', color: '#34d399' },
    { emoji: '🍎', nombre: 'Manzana',    tipo: 'organico', color: '#34d399' },
    { emoji: '🥦', nombre: 'Verdura',    tipo: 'organico', color: '#34d399' }
];

// ──────────────────────────────────────────────
//  3. TACHOS (posición y color)
// ──────────────────────────────────────────────
const TACHOS = [
    { tipo: 'plastico', label: '♻️ PLÁSTICO', color: '#f59e0b', x: 30,  ancho: 120 },
    { tipo: 'papel',    label: '📄 PAPEL',    color: '#3b82f6', x: 170, ancho: 120 },
    { tipo: 'organico', label: '🍃 ORGÁNICO', color: '#10b981', x: 310, ancho: 120 }
];

const TACHO_Y    = 420;
const TACHO_ALTO = 70;

// ──────────────────────────────────────────────
//  4. ESTADO DEL JUEGO
// ──────────────────────────────────────────────
let jugadorActivo = '';
let nivelActual   = 1;
let puntaje       = 0;
let vidas         = 3;
let aciertos      = 0;
let jugando       = false;
let pausado       = false;
let tiempoInicio  = 0;   // ← para calcular tiempo de sesión (MySQL)

// Objeto que está cayendo
let objeto = null;  // { emoji, nombre, tipo, color, x, y }

// Efectos visuales
let efectos = [];   // { texto, x, y, vida, color }

// ──────────────────────────────────────────────
//  5. REFERENCIAS DOM
// ──────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// ──────────────────────────────────────────────
//  6. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ──────────────────────────────────────────────
window.onload = async function() {
    jugadorActivo = sessionStorage.getItem('jugador_activo');
    if (!jugadorActivo) {
        window.location.href = 'index.html';
        return;
    }

    // Cargar datos — primero localStorage (inmediato), luego intentar API
    const datosLocal = db_obtenerJugador(jugadorActivo);
    if (datosLocal) {
        nivelActual = datosLocal.nivel;
        puntaje     = datosLocal.puntos;
        document.getElementById('nombre-jugador').textContent = '👤 ' + datosLocal.nombre;
    }

    // Mostrar pantalla de inicio inmediatamente sin esperar el backend
    actualizarHUD();
    mostrarPantalla('inicio');

    // Intentar sincronizar con MySQL en segundo plano (sin bloquear)
    try {
        const datosAPI = await Promise.race([
            api_obtenerJugador(jugadorActivo),
            new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))
        ]);
        if (datosAPI && datosAPI.nivel > nivelActual) {
            nivelActual = datosAPI.nivel;
            puntaje     = datosAPI.puntos;
            actualizarHUD();
        }
    } catch {
        // Backend no disponible — continuar con localStorage
    }
};

// ──────────────────────────────────────────────
//  7. CONTROL DEL MOUSE (mover objeto)
// ──────────────────────────────────────────────
canvas.addEventListener('mousemove', function(e) {
    if (!jugando || !objeto) return;
    const rect   = canvas.getBoundingClientRect();
    const escala = 460 / rect.width;
    objeto.x = (e.clientX - rect.left) * escala;
    // Mantener dentro del canvas
    objeto.x = Math.max(25, Math.min(435, objeto.x));
});

// Táctil para móvil
canvas.addEventListener('touchmove', function(e) {
    e.preventDefault();
    if (!jugando || !objeto) return;
    const rect   = canvas.getBoundingClientRect();
    const escala = 460 / rect.width;
    objeto.x = (e.touches[0].clientX - rect.left) * escala;
    objeto.x = Math.max(25, Math.min(435, objeto.x));
}, { passive: false });

// Botón jugar / reiniciar
btnJugar.addEventListener('click', iniciarNivel);

// ── Tecla ESC para pausar / reanudar ───────────
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && jugando) {
        pausado ? reanudarJuego() : pausarJuego();
    }
});

// ──────────────────────────────────────────────
//  8. FUNCIONES DE PANTALLA
// ──────────────────────────────────────────────
function mostrarPantalla(cual) {
    document.getElementById('pantalla-inicio').style.display    = cual === 'inicio'    ? 'flex' : 'none';
    document.getElementById('pantalla-nivel').style.display     = cual === 'nivel'     ? 'flex' : 'none';
    document.getElementById('pantalla-gameover').style.display  = cual === 'gameover'  ? 'flex' : 'none';
    document.getElementById('pantalla-completo').style.display  = cual === 'completo'  ? 'flex' : 'none';
    document.getElementById('pantalla-pausa').style.display     = cual === 'pausa'     ? 'flex' : 'none';
}

// ── Pausar el juego ─────────────────────────────
function pausarJuego() {
    if (!jugando) return;
    pausado = true;
    const tiempoSeg = Math.floor((Date.now() - tiempoInicio) / 1000);
    api_guardarProgreso(jugadorActivo, nivelActual, puntaje, aciertos, tiempoSeg);
    document.getElementById('pausa-nivel').textContent    = NIVELES[nivelActual].nombre;
    document.getElementById('pausa-puntaje').textContent  = puntaje;
    document.getElementById('pausa-aciertos').textContent = aciertos + ' / ' + NIVELES[nivelActual].objetivo;
    document.getElementById('btn-pausa').textContent = '▶ Reanudar';
    mostrarPantalla('pausa');
}

// ── Reanudar el juego ───────────────────────────
function reanudarJuego() {
    pausado = false;
    tiempoInicio = Date.now();
    document.getElementById('btn-pausa').textContent = '⏸ Pausa';
    mostrarPantalla(null);
    requestAnimationFrame(bucle);
}

// ── Reiniciar el nivel actual ───────────────────
function reiniciarNivel() {
    pausado = false;
    document.getElementById('btn-pausa').textContent = '⏸ Pausa';
    iniciarNivel();
}

// ── Guardar y salir al menú principal ──────────
async function guardarYSalir() {
    jugando = false;
    pausado = false;
    const tiempoSeg = Math.floor((Date.now() - tiempoInicio) / 1000);
    await api_guardarProgreso(jugadorActivo, nivelActual, puntaje, aciertos, tiempoSeg);
    sessionStorage.removeItem('jugador_activo');
    window.location.href = 'index.html';
}

// ── Mostrar ranking al completar el juego ──────
async function mostrarRanking() {
    const ranking = await api_obtenerRanking();
    if (ranking.length === 0) return;

    const lista = ranking.map((j, i) =>
        `${i+1}. ${j.nombre} — ${j.mejor_puntaje} pts (Nivel ${j.nivel_maximo})`
    ).join('\n');

    const el = document.getElementById('ranking-lista');
    if (el) el.textContent = lista;
}

function actualizarHUD() {
    document.getElementById('hud-nivel').textContent   = 'Nivel ' + nivelActual;
    document.getElementById('hud-puntaje').textContent = '⭐ ' + puntaje;
    document.getElementById('hud-vidas').textContent   = '❤️'.repeat(Math.max(0, vidas));
    document.getElementById('hud-aciertos').textContent = aciertos + ' / ' + (NIVELES[nivelActual]?.objetivo || 15);
}

// ──────────────────────────────────────────────
//  9. INICIAR / REINICIAR JUEGO
// ──────────────────────────────────────────────
function iniciarNivel() {
    vidas       = 3;
    aciertos    = 0;
    efectos     = [];
    jugando     = true;
    pausado     = false;
    tiempoInicio = Date.now();   // ← registrar inicio para MySQL
    document.getElementById('btn-pausa').textContent = '⏸ Pausa';
    actualizarHUD();
    mostrarPantalla(null);
    lanzarObjeto();
    requestAnimationFrame(bucle);
}

function lanzarObjeto() {
    const obj  = OBJETOS[Math.floor(Math.random() * OBJETOS.length)];
    objeto = {
        emoji:  obj.emoji,
        nombre: obj.nombre,
        tipo:   obj.tipo,
        color:  obj.color,
        x:      80 + Math.random() * 300,
        y:      -30
    };
}

// ──────────────────────────────────────────────
//  10. EFECTOS VISUALES (texto flotante)
// ──────────────────────────────────────────────
function crearEfecto(texto, x, y, color) {
    efectos.push({ texto, x, y, color, vida: 60 });
}

function actualizarEfectos() {
    efectos = efectos.filter(e => e.vida > 0);
    efectos.forEach(e => { e.y -= 1.5; e.vida -= 2; });
}

function dibujarEfectos() {
    efectos.forEach(e => {
        ctx.globalAlpha = e.vida / 60;
        ctx.fillStyle   = e.color;
        ctx.font        = 'bold 22px Arial';
        ctx.textAlign   = 'center';
        ctx.fillText(e.texto, e.x, e.y);
    });
    ctx.globalAlpha = 1;
}

// ──────────────────────────────────────────────
//  11. DIBUJO DEL CANVAS
// ──────────────────────────────────────────────
function dibujarFondo() {
    // Cielo degradado
    const grad = ctx.createLinearGradient(0, 0, 0, 500);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(1, '#f0fdf4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 460, 500);

    // Pasto
    ctx.fillStyle = '#86efac';
    ctx.fillRect(0, 410, 460, 90);

    // Nubecitas decorativas
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    dibujarNube(60,  40, 50);
    dibujarNube(350, 25, 40);
    dibujarNube(200, 60, 35);
}

function dibujarNube(x, y, r) {
    ctx.beginPath();
    ctx.arc(x,      y,     r * 0.6, 0, Math.PI * 2);
    ctx.arc(x + r,  y,     r * 0.5, 0, Math.PI * 2);
    ctx.arc(x + 25, y - r * 0.4, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
}

function dibujarTachos() {
    TACHOS.forEach(t => {
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(t.x + 4, TACHO_Y + 4, t.ancho, TACHO_ALTO);

        // Cuerpo del tacho
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.roundRect(t.x, TACHO_Y, t.ancho, TACHO_ALTO, 8);
        ctx.fill();

        // Borde
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth   = 2;
        ctx.stroke();

        // Etiqueta
        ctx.fillStyle  = 'white';
        ctx.font       = 'bold 11px Arial';
        ctx.textAlign  = 'center';
        ctx.fillText(t.label, t.x + t.ancho / 2, TACHO_Y + TACHO_ALTO / 2 + 4);
    });
}

function dibujarObjeto() {
    if (!objeto) return;
    // Sombra del objeto
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(objeto.x + 3, objeto.y + 3, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fondo circular del emoji
    ctx.fillStyle = objeto.color + '44';
    ctx.beginPath();
    ctx.arc(objeto.x, objeto.y, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = objeto.color;
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Emoji del objeto
    ctx.font      = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(objeto.emoji, objeto.x, objeto.y + 10);

    // Nombre del objeto (pista para el niño)
    ctx.fillStyle = '#1e293b';
    ctx.font      = 'bold 10px Arial';
    ctx.fillText(objeto.nombre, objeto.x, objeto.y + 46);
}

// ──────────────────────────────────────────────
//  12. LÓGICA: MOVER Y VERIFICAR COLISIÓN
// ──────────────────────────────────────────────
function moverObjeto() {
    if (!objeto) return;
    objeto.y += NIVELES[nivelActual].velocidad;
}

async function verificarColision() {
    if (!objeto) return;

    // ¿Llegó al nivel de los tachos?
    if (objeto.y >= TACHO_Y + 10) {
        let tachoAlcanzado = null;

        TACHOS.forEach(t => {
            if (objeto.x >= t.x && objeto.x <= t.x + t.ancho) {
                tachoAlcanzado = t;
            }
        });

        if (tachoAlcanzado) {
            if (tachoAlcanzado.tipo === objeto.tipo) {
                // ✅ ACIERTO
                puntaje  += 10 * nivelActual;
                aciertos++;
                crearEfecto('¡Muy bien! +' + (10 * nivelActual), objeto.x, TACHO_Y - 20, '#10b981');
            } else {
                // ❌ ERROR
                vidas--;
                crearEfecto('¡Ups! Tacho equivocado 😅', objeto.x, TACHO_Y - 20, '#ef4444');
            }
        } else {
            // Cayó fuera de los tachos
            vidas--;
            crearEfecto('¡Se cayó! 😬', objeto.x, TACHO_Y - 20, '#f59e0b');
        }

        actualizarHUD();
        objeto = null;

        // ¿Sin vidas?
        if (vidas <= 0) {
            jugando = false;
            const tiempoSeg = Math.floor((Date.now() - tiempoInicio) / 1000);
            await api_guardarProgreso(jugadorActivo, nivelActual, puntaje, aciertos, tiempoSeg);
            document.getElementById('go-puntaje').textContent = puntaje;
            document.getElementById('go-nivel').textContent   = NIVELES[nivelActual].nombre;
            mostrarPantalla('gameover');
            return;
        }

        // ¿Completó el nivel?
        if (aciertos >= NIVELES[nivelActual].objetivo) {
            jugando = false;
            const nivelSiguiente = nivelActual + 1;
            const tiempoSeg = Math.floor((Date.now() - tiempoInicio) / 1000);
            await api_guardarProgreso(jugadorActivo, nivelSiguiente, puntaje, aciertos, tiempoSeg);

            if (NIVELES[nivelSiguiente]) {
                nivelActual = nivelSiguiente;
                document.getElementById('nivel-completo-num').textContent  = '¡Nivel ' + (nivelActual - 1) + ' completado! 🎉';
                document.getElementById('nivel-siguiente-num').textContent = 'Siguiente: ' + NIVELES[nivelActual].nombre;
                mostrarPantalla('nivel');
            } else {
                // ¡Juego completo! — mostrar ranking
                document.getElementById('puntaje-final').textContent = puntaje;
                await mostrarRanking();
                mostrarPantalla('completo');
            }
            return;
        }

        // Lanzar siguiente objeto
        setTimeout(lanzarObjeto, 600);
    }
}

// ──────────────────────────────────────────────
//  13. BUCLE PRINCIPAL
// ──────────────────────────────────────────────
async function bucle() {
    if (!jugando || pausado) return;

    dibujarFondo();
    dibujarTachos();
    dibujarObjeto();
    actualizarEfectos();
    dibujarEfectos();

    moverObjeto();
    await verificarColision();

    requestAnimationFrame(bucle);
}

// ──────────────────────────────────────────────
//  14. BOTONES DE PANTALLA
// ──────────────────────────────────────────────
function btnIniciar()        { iniciarNivel(); }
function btnSiguienteNivel() { iniciarNivel(); }
function btnReintentar()     { iniciarNivel(); }

async function btnCerrarSesion() {
    jugando = false;
    pausado = false;
    const tiempoSeg = Math.floor((Date.now() - tiempoInicio) / 1000);
    await api_guardarProgreso(jugadorActivo, nivelActual, puntaje, aciertos, tiempoSeg);
    sessionStorage.removeItem('jugador_activo');
    window.location.href = 'index.html';
}

function btnTogglePausa() {
    if (!jugando) return;
    pausado ? reanudarJuego() : pausarJuego();
}