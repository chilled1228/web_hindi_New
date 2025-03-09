const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create directory for module resolution
const modulesDir = path.join(process.cwd(), 'node_modules', '.next-build-modules');
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir, { recursive: true });
}

// Create symlinks for key directories
const dirsToLink = ['lib', 'components', 'app'];
dirsToLink.forEach(dir => {
  const sourcePath = path.join(process.cwd(), dir);
  const targetPath = path.join(modulesDir, dir);
  
  if (fs.existsSync(sourcePath)) {
    if (!fs.existsSync(targetPath)) {
      try {
        // On Windows, use junction for directories
        if (process.platform === 'win32') {
          fs.symlinkSync(sourcePath, targetPath, 'junction');
        } else {
          fs.symlinkSync(sourcePath, targetPath);
        }
        console.log(`Created symlink for ${dir}`);
      } catch (error) {
        console.error(`Failed to create symlink for ${dir}:`, error);
        // Fallback to copy if symlink fails
        execSync(`cp -r "${sourcePath}" "${targetPath}"`);
        console.log(`Copied ${dir} instead`);
      }
    }
  } else {
    console.warn(`Directory ${dir} does not exist`);
  }
});

// Run the Next.js build
console.log('Running Next.js build...');
try {
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 