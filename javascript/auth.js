// ═══════════════════════════════════════════════
//   javascript/auth.js
//   Maneja el login y registro en index.html
// ═══════════════════════════════════════════════

// ── Alternar entre formularios ──────────────────
function mostrarFormulario(cual) {
    const fLogin    = document.getElementById('form-login');
    const fRegistro = document.getElementById('form-registro');
    const btnLogin  = document.getElementById('tab-login');
    const btnReg    = document.getElementById('tab-registro');

    if (cual === 'login') {
        fLogin.style.display    = 'flex';
        fRegistro.style.display = 'none';
        btnLogin.classList.add('activo');
        btnReg.classList.remove('activo');
    } else {
        fLogin.style.display    = 'none';
        fRegistro.style.display = 'flex';
        btnLogin.classList.remove('activo');
        btnReg.classList.add('activo');
    }
    limpiarMensaje();
}

// ── Mostrar mensaje de error o éxito ───────────
function mostrarMensaje(texto, tipo) {
    const el = document.getElementById('mensaje');
    el.textContent   = texto;
    el.style.color   = tipo === 'ok' ? '#10b981' : '#ef4444';
    el.style.display = 'block';
}

function limpiarMensaje() {
    const el = document.getElementById('mensaje');
    el.style.display = 'none';
}

// ── Acción: Registrar ───────────────────────────
async function accionRegistrar() {
    const nombre   = document.getElementById('reg-nombre').value.trim();
    const usuario  = document.getElementById('reg-usuario').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    if (!nombre || !usuario || !password) {
        mostrarMensaje('¡Completa todos los campos! 📝', 'error');
        return;
    }
    if (password.length < 4) {
        mostrarMensaje('La contraseña debe tener al menos 4 caracteres 🔑', 'error');
        return;
    }

    // Usar API (MySQL) con fallback a localStorage
    const resultado = await api_registrar(nombre, usuario, password);
    mostrarMensaje(resultado.mensaje, resultado.ok ? 'ok' : 'error');

    if (resultado.ok) {
        // Limpiar campos y cambiar a login
        document.getElementById('reg-nombre').value   = '';
        document.getElementById('reg-usuario').value  = '';
        document.getElementById('reg-password').value = '';
        setTimeout(() => mostrarFormulario('login'), 1200);
    }
}

// ── Acción: Iniciar sesión ──────────────────────
async function accionLogin() {
    const usuario  = document.getElementById('login-usuario').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!usuario || !password) {
        mostrarMensaje('¡Ingresa tu usuario y contraseña! 🔐', 'error');
        return;
    }

    const resultado = await api_login(usuario, password);

    if (!resultado.ok) {
        mostrarMensaje(resultado.mensaje, 'error');
        return;
    }

    sessionStorage.setItem('jugador_activo', usuario);
    window.location.href = 'juego.html';
}

// ── Permitir Enter en los inputs ────────────────
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const loginVisible = document.getElementById('form-login').style.display !== 'none';
        if (loginVisible) accionLogin();
        else accionRegistrar();
    }
});