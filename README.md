<div align="center">

# ThesisMatch
### Plataforma web de matching académico para la búsqueda de directores de tesis doctoral

<img src="https://drive.google.com/uc?export=view&id=1CgQDqWUGG6QGh0albUbLMY_lagns79iZ" alt="ThesisMatch Logo" width="180"/>

<br/>

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot)
![Next JS](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql)
![JWT](https://img.shields.io/badge/JWT-Authentication-black?style=for-the-badge&logo=jsonwebtokens)
![License](https://img.shields.io/badge/License-Academic-blue?style=for-the-badge)

</div>

---

# Descripción del proyecto

**ThesisMatch** es una plataforma web desarrollada como Trabajo Fin de Grado (TFG) en la Escuela Técnica Superior de Ingenieros Informáticos de la Universidad Politécnica de Madrid (UPM).

El objetivo principal del sistema es facilitar el proceso de emparejamiento académico entre estudiantes interesados en iniciar estudios de doctorado y profesores con capacidad y disponibilidad para dirigir tesis doctorales.

La plataforma permite realizar:

- Gestión estructurada de perfiles académicos.
- Búsquedas manuales mediante filtros.
- Recomendaciones automáticas basadas en afinidad.
- Envío formal de solicitudes de dirección de tesis.
- Gestión administrativa del sistema.

El sistema implementa un mecanismo de matching académico basado en líneas de investigación, programas de doctorado y criterios académicos estructurados.

---

# Problema abordado

Actualmente, muchos estudiantes de doctorado buscan director de tesis mediante envíos masivos de correos electrónicos a profesores, lo que genera:

- Procesos poco eficientes.
- Falta de estructuración académica.
- Frustración tanto para estudiantes como para profesores.
- Baja precisión en la búsqueda de afinidad investigadora.

ThesisMatch propone un entorno formal y estructurado que optimiza este proceso mediante mecanismos automáticos de matching académico.

---

# Funcionalidades principales

## Gestión de usuarios y autenticación

- Registro de usuarios.
- Inicio de sesión seguro.
- Recuperación de contraseña.
- Control de acceso basado en roles:
  - Estudiante
  - Profesor
  - Administrador

---

## Gestión de perfiles académicos

### Estudiantes
- Información académica estructurada.
- Líneas de investigación.
- Programas de doctorado.
- Motivación académica.
- Título provisional de tesis.
- CV en formato PDF.

### Profesores
- Líneas de investigación.
- Programas de doctorado.
- Historial de tesis dirigidas.
- CV en formato PDF.

---

## Sistema de búsqueda manual

Permite realizar búsquedas mediante filtros estructurados:

- Líneas de investigación.
- Programas de doctorado.
- Dedicación.
- Coincidencias académicas.

---

## Sistema de matching académico

El sistema calcula automáticamente un índice de afinidad entre perfiles académicos utilizando:

- Coincidencia de líneas de investigación.
- Programas de doctorado compartidos.
- Reglas deterministas.
- Coincidencia de palabras clave.

Los resultados se muestran ordenados según el porcentaje de afinidad obtenido.

---

## Sistema formal de solicitudes

La plataforma permite:

- Enviar solicitudes formales de dirección de tesis.
- Registrar histórico de solicitudes.
- Gestionar estados:
  - Pendiente
  - Aceptada
  - Rechazada

---

## Panel administrativo

El administrador puede:

- Supervisar usuarios.
- Activar/desactivar cuentas.
- Gestionar incidencias.
- Controlar el estado general del sistema.

---

# Arquitectura del sistema

El sistema sigue una arquitectura cliente-servidor dividida en:

## Frontend
- Next.js
- TypeScript
- Tailwind CSS

## Backend
- Spring Boot
- API REST
- Spring Security
- JWT Authentication
- JPA / Hibernate

## Base de datos
- PostgreSQL

---

# Arquitectura backend

El backend se organiza mediante arquitectura en capas:

```text
Controller Layer
       ↓
Service Layer
       ↓
Repository Layer
       ↓
PostgreSQL Database
```

Además, el sistema incorpora:

- Módulo de matching académico independiente.
- Seguridad basada en JWT.
- Persistencia mediante ORM.
- Control de acceso basado en roles.

---

# Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Java 21 | Backend |
| Spring Boot | API REST |
| Spring Security | Seguridad |
| JWT | Autenticación |
| PostgreSQL | Base de datos |
| Hibernate / JPA | Persistencia |
| Next.js | Frontend |
| TypeScript | Frontend |
| Tailwind CSS | Estilos |
| Maven | Gestión de dependencias |

---

# Modelo de datos

El sistema implementa un modelo relacional compuesto principalmente por:

- users
- student_profile
- professor_profile
- doctoral_program
- research_line
- thesis_request
- supervised_thesis
- password_reset_token

Además, se utilizan tablas intermedias para relaciones N:M.

---

# Instalación y ejecución

## Requisitos previos

- Java 21
- Maven
- Node.js
- PostgreSQL

---

## Clonar repositorio

```bash
git clone https://github.com/alvaroogarciia1/TFG-PlataformaDirectoresTesis.git
```

---

## Backend

```bash
cd backend/thesisplatform
./mvnw spring-boot:run
```

Backend disponible en:

```text
http://localhost:8080
```

---

## Frontend

```bash
cd frontend/thesisplatform-frontend
npm install
npm run dev
```

Frontend disponible en:

```text
http://localhost:3000
```

---

# Estructura del proyecto

```text
TFG-PlataformaDirectoresTesis/
│
├── backend/
│   └── thesisplatform/
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── model/
│       ├── dto/
│       ├── security/
│       └── config/
│
├── frontend/
│   └── thesisplatform-frontend/
│       ├── app/
│       ├── components/
│       ├── lib/
│       ├── types/
│       └── public/
│
└── docs/
```

---

# Seguridad

La plataforma implementa:

- Autenticación JWT.
- Contraseñas cifradas.
- Control de acceso basado en roles.
- Protección de endpoints.
- Recuperación segura de contraseña.

---

# Estado del proyecto

Proyecto desarrollado como Trabajo Fin de Grado (TFG).

Estado actual:

- Backend funcional.
- Frontend funcional.
- Sistema de matching implementado.
- Sistema de autenticación implementado.
- Integración completa realizada.
- Pruebas funcionales realizadas.

---

# Posibles mejoras futuras

- Matching avanzado mediante NLP.
- TF-IDF y embeddings semánticos.
- Sistema de recomendaciones bidireccional.
- Paneles estadísticos avanzados.
- Notificaciones en tiempo real.
- Verificación institucional automática.

---

# Autor

## Álvaro García-Caro Bartolomé

Trabajo Fin de Grado — Ingeniería Informática  
Universidad Politécnica de Madrid (UPM)

---

# Tutores

- Alejandro Rodríguez González
- Lucía Prieto Santamaría

---

# Licencia

Proyecto desarrollado con fines académicos como Trabajo Fin de Grado.
