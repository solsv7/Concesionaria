# Prueba Técnica – Concesionaria

Aplicación **mini full stack** para gestión de vehículos, ventas, pagos y consulta de compras propias, desarrollada como prueba técnica.

El proyecto está preparado para ejecutarse **exclusivamente con Docker Compose**, sin necesidad de configurar nada manualmente en tu máquina (más allá de Docker).

---

## 1. Instrucciones para correr el proyecto

### 1.1. Requisitos previos

- Docker instalado
- Docker Compose 

Estructura del repositorio:

/Backend
/Database
/Frontend
docker-compose.yml
Decisiones técnicas – Prueba Concesionaria.pdf

yaml
Copy code

El archivo `docker-compose.yml` se encuentra en la raíz y levanta:

- MySQL 8 (`db`)
- phpMyAdmin (`phpmyadmin`)
- Backend Node.js/Express (`backend`)
- Frontend React/Vite (`frontend`)

---

### 1.2. Pasos para ejecutar

1. Clonar el repositorio:

   ```bash
   git clone (https://github.com/solsv7/Concesionaria
   cd Concesionaria
Levantar todos los servicios con Docker Compose:

bash
Copy code
docker compose up --build
El primer build puede demorar unos minutos porque se descargan las imágenes y se instalan dependencias.

Una vez que todos los contenedores estén en estado healthy/running, acceder a:

Frontend (app web):
http://localhost:5173

Backend (API REST):
http://localhost:3001

phpMyAdmin (inspección de base de datos):
http://localhost:8080

servidor: db

usuario: root

contraseña: rootpassword

La base de datos se inicializa automáticamente:

El contenedor db monta:

./Database/mysql_data como volumen de datos.

./Database/init como carpeta de scripts SQL de inicialización.

Al primer arranque se crean:

Esquema de tablas.

Datos de prueba.

Stored procedures necesarios.

No es necesario crear .env:
todas las variables necesarias (credenciales de DB, JWT, URL de API, claves de ImageKit, etc.) ya están definidas en el docker-compose.yml para los contenedores backend y frontend.

Para detener los servicios:

docker compose down
