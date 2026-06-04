# Desafío Final: Métodos Numéricos 📊

**Simulación numérica de abastecimiento, precios y conflicto social en contexto de crisis.**

Este proyecto es una plataforma web interactiva desarrollada para la materia de Métodos Numéricos de la carrera de Informática en la Universidad Mayor de San Andrés (UMSA), La Paz. Utiliza modelos matemáticos y computacionales para simular, analizar y visualizar distintos escenarios críticos de la vida real, facilitando la toma de decisiones estratégicas mediante el análisis de datos.

## 👨‍💻 Autor
* **Giann Kalef Ledezma Ramos** ## 🚀 Tecnologías Utilizadas
El proyecto está construido bajo una arquitectura Frontend modular y sin dependencias de backend, garantizando un despliegue rápido y cálculos en tiempo real en el navegador del usuario.
* **HTML5:** Estructura semántica.
* **CSS3 & Bootstrap 5:** Diseño responsivo y moderno adaptado a dispositivos móviles y de escritorio.
* **JavaScript (ES6):** Motor de cálculo matemático puro (implementación desde cero de algoritmos iterativos y directos).
* **Chart.js:** Visualización dinámica de datos y renderizado de gráficos de funciones, dispersión y curvas de evolución.

## 🧩 Escenarios y Métodos Implementados

El sistema resuelve en tiempo real los siguientes escenarios matemáticos:

### Escenario A: Optimización del Abastecimiento y Red de Transporte
Simulación de distribución logística desde plantas de acopio (ej. Senkata) hacia distintas zonas urbanas, considerando bloqueos de rutas.
* **Métodos:** Jacobi, Gauss-Seidel, SOR (Sobrerrelajación), Factorización LU, Gradiente Conjugado.

### Escenario B: Vaciado Crítico de Reservas
Análisis de la caída de inventarios de carburantes frente a un consumo regular vs. compras de pánico.
* **Métodos (Ecuaciones Diferenciales Ordinarias):** Euler, Heun, Runge-Kutta de 4to Orden (RK4).

### Escenarios C y D: Precios de Alimentos e Integración del Gasto
Reconstrucción de la curva de inflación a partir de datos diarios dispersos y cálculo de la pérdida del poder adquisitivo familiar acumulado.
* **Métodos de Interpolación:** Polinomio de Lagrange, Newton (Diferencias Divididas), Splines Cúbicos (Catmull-Rom).
* **Métodos de Integración Numérica:** Regla del Trapecio, Simpson 1/3, Simpson 3/8.

### Escenario E: Búsqueda del Umbral Crítico
Determinación del día exacto de quiebre financiero donde el costo acumulado por inflación supera el ingreso límite de una familia.
* **Métodos (Raíces de Ecuaciones):** Bisección, Newton-Raphson, Secante.

## 📂 Estructura del Repositorio
* `index.html`: Contiene la estructura de la interfaz, el contexto teórico, la definición de variables y los formularios interactivos.
* `styles.css`: Hoja de estilos personalizados para tarjetas de módulos, áreas de resultados y reportes iterativos.
* `app.js`: Contiene el núcleo matemático del proyecto. Maneja el estado de la aplicación, los eventos del usuario, la ejecución de los algoritmos paso a paso y la actualización del DOM/Chart.js.

## 🌐 Despliegue en Vivo
El proyecto está configurado para un despliegue continuo y puede visualizarse de manera completamente funcional en el siguiente enlace:
🔗 **(https://proyfinalmetnum.netlify.app/)**

## ⚙️ Ejecución Local
Para ejecutar este proyecto de forma local, no se requieren instalaciones complejas:
1. Clona este repositorio: `git clone (https://github.com/YiKey123/Proyecto-Final-Metodos-Num-ricos.git)`
2. Navega al directorio del proyecto.
3. Abre el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge, Safari).
