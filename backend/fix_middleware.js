const fs = require('fs');
const path = require('path');

// Función para reemplazar middleware en un archivo
function fixMiddlewareInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Reemplazar imports
    if (content.includes("const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');")) {
      content = content.replace(
        "const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');",
        "const { authMiddleware, requireAdmin } = require('../middlewares/auth.middleware');"
      );
      modified = true;
    }

    if (content.includes("const { verifyToken } = require('../middlewares/auth.middleware');")) {
      content = content.replace(
        "const { verifyToken } = require('../middlewares/auth.middleware');",
        "const { authMiddleware } = require('../middlewares/auth.middleware');"
      );
      modified = true;
    }

    if (content.includes("const { verifyToken, checkRole, isAdmin } = require('../middlewares/auth.middleware');")) {
      content = content.replace(
        "const { verifyToken, checkRole, isAdmin } = require('../middlewares/auth.middleware');",
        "const { authMiddleware, requireRole, requireAdmin } = require('../middlewares/auth.middleware');"
      );
      modified = true;
    }

    if (content.includes("const { verifyToken, checkRole } = require('../middlewares/auth.middleware');")) {
      content = content.replace(
        "const { verifyToken, checkRole } = require('../middlewares/auth.middleware');",
        "const { authMiddleware, requireRole } = require('../middlewares/auth.middleware');"
      );
      modified = true;
    }

    // Reemplazar usos de verifyToken
    content = content.replace(/verifyToken/g, 'authMiddleware');
    content = content.replace(/isAdmin/g, 'requireAdmin');
    content = content.replace(/checkRole/g, 'requireRole');

    // Reemplazar arrays de middleware
    content = content.replace(/\[verifyToken, isAdmin\]/g, '[authMiddleware, requireAdmin]');
    content = content.replace(/\[verifyToken, checkRole\(/g, '[authMiddleware, requireRole(');

    if (modified || content.includes('verifyToken') || content.includes('isAdmin') || content.includes('checkRole')) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Directorio de rutas
const routesDir = path.join(__dirname, 'src', 'routes');

// Obtener todos los archivos .js en el directorio de rutas
const files = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

console.log('🔧 Fixing middleware imports in route files...\n');

let fixedCount = 0;
files.forEach(file => {
  const filePath = path.join(routesDir, file);
  if (fixMiddlewareInFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
console.log('🎉 Middleware fixes completed!');
