import { execSync } from 'child_process';

try {
  // Remove the old corrupted lockfile if it exists
  try {
    execSync('rm -f /vercel/share/v0-project/package-lock.json', { stdio: 'inherit' });
  } catch {}

  // Generate a fresh lockfile with npm install
  execSync('cd /vercel/share/v0-project && npm install --package-lock-only', { 
    stdio: 'inherit',
    timeout: 120000 
  });
  
  console.log('package-lock.json regenerated successfully');
} catch (error) {
  console.error('Error:', error.message);
}
