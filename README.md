# pagina-wons

Sitio web estático que incluye los recursos (HTML, CSS, JS, imágenes, audio y video) necesarios para mostrar la página de Wons.

## Requisitos

- Git para clonar el repositorio.
- Un navegador moderno (Chrome, Firefox, Edge, etc.).
- Opcional: Node.js 18+ y npm 9+ o Python 3 si deseas ejecutar un servidor local.

## Instalación de dependencias

El proyecto no tiene dependencias propias ni `package.json`; basta con descargar el código.  
Si quieres ejecutar la página mediante un servidor local puedes usar cualquiera de estas opciones:

- **Node.js**: instala el paquete `serve` de manera global `npm install --global serve`.
- **Python 3**: viene con un servidor HTTP simple listo para usar, no requiere instalación adicional.

## Ejecución

1. Clona el proyecto  
   ```bash
   git clone https://github.com/<usuario>/pagina-wons.git
   cd pagina-wons
   ```
2. Ejecuta la página:
   - **Abrir el archivo directamente**: haz doble clic en `index.html` o ábrelo desde tu navegador preferido. Esta pantalla muestra la vista de password y, tras ingresar la contraseña correcta, te llevará al menú y desde ahí al cuestionario (`quiz.html`).
   - **Usando Node.js + serve**:  
     ```bash
     serve .
     ```
     Luego abre `http://localhost:3000` (o el puerto que indique el comando).
   - **Usando Python 3**:  
     ```bash
     python -m http.server 8000
     ```
     Luego navega a `http://localhost:8000`.

Con cualquiera de las alternativas el navegador cargará `index.html` (pantalla de contraseña) y los recursos que se encuentran en el directorio `static/`.
