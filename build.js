const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Paths
const serverDir = __dirname;
const myAppDir = path.join(serverDir, '..', 'MyApp');
const serverPublicDir = path.join(serverDir, 'public');
const myAppDistDir = path.join(myAppDir, 'dist');
const myAppPublicDir = path.join(myAppDir, 'public');
const redirectsFile = path.join(serverPublicDir, '_redirects');

console.log('🚀 Starting build process...\n');

// Step 1: Run build in MyApp
console.log('📦 Running build in MyApp...');
try {
  execSync('npm run build', {
    cwd: myAppDir,
    stdio: 'inherit'
  });
  console.log('✅ MyApp build completed\n');
} catch (error) {
  console.error('❌ Error running build in MyApp:', error.message);
  process.exit(1);
}

// Step 2: Save _redirects temporarily
let redirectsContent = '';
if (fs.existsSync(redirectsFile)) {
  redirectsContent = fs.readFileSync(redirectsFile, 'utf8');
  console.log('💾 _redirects file saved temporarily\n');
}

// Step 3: Clean server/public (except _redirects)
console.log('🧹 Cleaning server/public...');
if (fs.existsSync(serverPublicDir)) {
  const files = fs.readdirSync(serverPublicDir);
  files.forEach(file => {
    if (file !== '_redirects') {
      const filePath = path.join(serverPublicDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  });
  console.log('✅ server/public cleaned\n');
}

// Step 4: Copy files from MyApp/dist to server/public
console.log('📋 Copying files from MyApp/dist to server/public...');
if (!fs.existsSync(myAppDistDir)) {
  console.error('❌ Error: MyApp/dist does not exist. Was the build executed correctly?');
  process.exit(1);
}

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(myAppDistDir, serverPublicDir);
console.log('✅ Files from MyApp/dist copied\n');

// Step 5: Copy files from MyApp/public to server/public (if they exist and are not already in dist)
console.log('📋 Copying files from MyApp/public to server/public...');
if (fs.existsSync(myAppPublicDir)) {
  const publicFiles = fs.readdirSync(myAppPublicDir);
  publicFiles.forEach(item => {
    const srcPath = path.join(myAppPublicDir, item);
    const destPath = path.join(serverPublicDir, item);
    
    // Only copy if it doesn't exist in dest (to avoid overwriting build files)
    if (!fs.existsSync(destPath)) {
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  });
  console.log('✅ Files from MyApp/public copied\n');
}

// Step 6: Restore _redirects
if (redirectsContent) {
  fs.writeFileSync(redirectsFile, redirectsContent, 'utf8');
  console.log('✅ _redirects file restored\n');
}

console.log('🎉 Build completed successfully!');

