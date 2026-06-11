# ♻️ Juego de Reciclaje — ODS 12
### Producción y Consumo Responsable

## 👤 Autor
HUERTAS SUÁREZ DANIEL EDUARDO

> Juego educativo interactivo desarrollado con HTML5 Canvas, JavaScript ES6, Node.js y SQL Server 2022. Diseñado para niños en proceso de formación sobre clasificación de residuos sólidos.

---

## 📁 Estructura del Proyecto

```
JUEGO_ODS/
├── index.html              ← Pantalla de login y registro
├── juego.html              ← Pantalla del juego
├── css/
│   └── estilos.css         ← Estilos de toda la aplicación
├── javascript/
│   ├── db.js               ← Base de datos localStorage (fallback)
│   ├── api.js              ← Comunicación con el backend
│   ├── auth.js             ← Lógica de login y registro
│   └── juego.js            ← Lógica del juego y Canvas
└── backend/
    ├── server.js           ← Servidor Node.js + Express
    ├── database.js         ← Conexión a SQL Server
    ├── database.sql        ← Script de creación de tablas
    ├── package.json        ← Dependencias Node.js
    ├── .env                ← Variables de entorno (no subir a GitHub)
    └── routes/
        ├── auth.js         ← Rutas de autenticación
        └── game.js         ← Rutas del juego y ranking
```

---

## 🎮 ¿Cómo se juega?

1. Regístrate con tu nombre y usuario
2. Inicia sesión para entrar al juego
3. Mueve el mouse para guiar el objeto que cae
4. Llévalo al tacho correcto antes de que toque el suelo:
   - 🟡 **Plástico** → botellas, vasos, bolsas
   - 🔵 **Papel** → periódicos, cajas
   - 🟢 **Orgánico** → frutas y verduras
5. Cada acierto suma puntos y aumenta la velocidad
6. Tienes **3 vidas** — si pierdes todas, es Game Over
7. Al completar el objetivo de aciertos, subes de nivel

### Niveles
| Nivel | Nombre | Velocidad | Objetivo |
|-------|--------|-----------|----------|
| 1 | Principiante 🌱 | Lenta | 6 aciertos |
| 2 | Explorador 🌿 | Media | 9 aciertos |
| 3 | Guardián 🌳 | Rápida | 12 aciertos |
| 4 | Héroe 🌍 | Muy rápida | 15 aciertos |

---

## ⚙️ Requisitos Previos

Antes de instalar, asegúrate de tener:

- [Node.js](https://nodejs.org) v18 o superior
- [SQL Server 2022](https://www.microsoft.com/sql-server) (Developer o Express Edition)
- [SQL Server Management Studio (SSMS)](https://aka.ms/ssmsfullsetup)
- Editor de código: [VS Code](https://code.visualstudio.com) con extensión **Live Server**

---

## 🚀 Instalación Paso a Paso

### Paso 1 — Clonar o descargar el repositorio

```bash
git clone https://github.com/TU_USUARIO/JUEGO_ODS.git
cd JUEGO_ODS
```

O descarga el ZIP desde GitHub y extrae la carpeta.

---

### Paso 2 — Crear la base de datos en SQL Server

1. Abre **SQL Server Management Studio (SSMS)**
2. Conéctate a tu servidor con autenticación Windows
3. Ve a **File → Open → File** y abre `backend/database.sql`
4. Presiona **F5** para ejecutar

Esto creará:
- Base de datos `reciclaje_ods12`
- Tabla `usuarios`
- Tabla `sesiones`
- Vista `ranking_global`

---

### Paso 3 — Crear usuario SQL Server

En SSMS abre una nueva consulta (**New Query**) y ejecuta:

```sql
USE master;
CREATE LOGIN ods_user WITH PASSWORD = 'Ods12345!';
USE reciclaje_ods12;
CREATE USER ods_user FOR LOGIN ods_user;
ALTER ROLE db_owner ADD MEMBER ods_user;
```

---

### Paso 4 — Verificar el puerto de SQL Server

En SSMS ejecuta esta consulta para saber el puerto:

```sql
EXEC xp_readerrorlog 0, 1, N'Server is listening on'
```

Anota el número de puerto que aparece (ejemplo: `64456`).

---

### Paso 5 — Configurar las variables de entorno

Dentro de la carpeta `backend/` crea un archivo llamado `.env`:

```
PORT=3000
DB_SERVER=localhost
DB_NAME=reciclaje_ods12
DB_USER=ods_user
DB_PASSWORD=Ods12345!
DB_PORT=64456
FRONTEND_URL=http://127.0.0.1:5501
```

> ⚠️ Reemplaza `64456` con el puerto que obtuviste en el Paso 4.

---

### Paso 6 — Instalar dependencias Node.js

Abre una terminal (PowerShell o CMD) y ejecuta:

```bash
cd backend
npm install
```

---

### Paso 7 — Iniciar el servidor backend

```bash
npm start
```

Si todo está correcto verás:

```
🌱 Servidor ODS 12 corriendo en http://localhost:3000
   Endpoints disponibles:
   POST /api/auth/registro
   POST /api/auth/login
   POST /api/game/progreso
   GET  /api/game/jugador/:usuario
   GET  /api/game/ranking
✅ Conexión a SQL Server establecida correctamente
```

---

### Paso 8 — Abrir el juego en el navegador

1. Abre VS Code en la carpeta raíz del proyecto
2. Clic derecho sobre `index.html` → **Open with Live Server**
3. El juego abrirá en `http://127.0.0.1:5501`
4. Regístrate, inicia sesión y juega

---

## 🗄️ Consultas de Base de Datos (SSMS)

```sql
-- Ver todos los jugadores registrados
SELECT * FROM usuarios;

-- Ver ranking top 10
SELECT TOP 10 usuario, nombre, puntos, nivel
FROM usuarios
ORDER BY puntos DESC;

-- Ver historial de sesiones
SELECT u.nombre, s.nivel_alcanzado, s.puntaje, s.tiempo_segundos, s.fecha
FROM sesiones s
JOIN usuarios u ON s.usuario_id = u.id
ORDER BY s.fecha DESC;

-- Contar total de partidas
SELECT COUNT(*) AS total_partidas FROM sesiones;
```

---

## 🔌 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/ping` | Verifica que el servidor está activo |
| `POST` | `/api/auth/registro` | Registra un nuevo usuario |
| `POST` | `/api/auth/login` | Inicia sesión |
| `POST` | `/api/game/progreso` | Guarda progreso del jugador |
| `GET`  | `/api/game/jugador/:usuario` | Obtiene datos del jugador |
| `GET`  | `/api/game/ranking` | Top 10 jugadores |

---

## 💾 Modo Sin Servidor (Offline)

Si el backend Node.js no está corriendo, el juego funciona automáticamente con **localStorage** del navegador como base de datos local. Los datos se guardan solo en ese navegador.

Para ver los datos en modo offline:

```javascript
// En la consola del navegador (F12 → Console)
JSON.parse(localStorage.getItem('ods_reciclaje_usuarios'))
```

---

## 🛑 Solución de Problemas Comunes

| Error | Solución |
|-------|----------|
| `Cannot find module` | Ejecuta `npm install` dentro de la carpeta `backend/` |
| `Failed to connect to SQL Server` | Verifica que el puerto en `.env` sea correcto |
| `Login failed for user` | Verifica usuario y contraseña en el `.env` |
| Canvas en blanco | Abre siempre desde `index.html`, no desde `juego.html` directamente |
| `CORS error` | Verifica que `FRONTEND_URL` en `.env` coincida con tu puerto de Live Server |

---

## 📋 Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript ES6 |
| Gráficos | Canvas API |
| Backend | Node.js, Express.js |
| Base de datos | SQL Server 2022 |
| Driver BD | mssql |
| Almacenamiento local | localStorage / sessionStorage |
| Control de versiones | Git + GitHub |
| Servidor de desarrollo | Live Server (VS Code) |

---

## 🌍 Alineación con los ODS

Este proyecto se alinea con el **ODS 12 — Producción y Consumo Responsables** de la ONU, promoviendo desde la infancia la correcta clasificación de residuos sólidos como práctica fundamental para el desarrollo sostenible.

---


