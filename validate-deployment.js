#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Deployment validation checks
const checks = {
  // Check if required files exist
  checkRequiredFiles() {
    const requiredFiles = [
      'package.json',
      'server/index.ts',
      'server/config.ts',
      'shared/schema.ts',
      'vite.config.ts'
    ];

    const missing = requiredFiles.filter(file => 
      !fs.existsSync(path.join(__dirname, file))
    );

    if (missing.length > 0) {
      throw new Error(`Missing required files: ${missing.join(', ')}`);
    }
    console.log('✓ All required files present');
  },

  // Check package.json scripts
  checkPackageScripts() {
    const packagePath = path.join(__dirname, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const requiredScripts = ['build', 'start', 'dev'];
    const missing = requiredScripts.filter(script => !pkg.scripts[script]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required scripts: ${missing.join(', ')}`);
    }
    console.log('✓ All required scripts present');
  },

  // Check server configuration
  checkServerConfig() {
    const configPath = path.join(__dirname, 'server/config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const requiredExports = ['config', 'validateProductionConfig', 'addSecurityHeaders'];
    const missing = requiredExports.filter(exp => 
      !configContent.includes(`export function ${exp}`) && 
      !configContent.includes(`export const ${exp}`)
    );
    
    if (missing.length > 0) {
      throw new Error(`Missing required config exports: ${missing.join(', ')}`);
    }
    console.log('✓ Server configuration properly set up');
  },

  // Check environment handling
  checkEnvironmentHandling() {
    const indexPath = path.join(__dirname, 'server/index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    const requiredFeatures = [
      'validateProductionConfig',
      'addSecurityHeaders',
      'process.env.NODE_ENV',
      'SIGTERM',
      'SIGINT'
    ];
    
    const missing = requiredFeatures.filter(feature => 
      !indexContent.includes(feature)
    );
    
    if (missing.length > 0) {
      throw new Error(`Missing environment handling features: ${missing.join(', ')}`);
    }
    console.log('✓ Environment handling properly configured');
  }
};

// Run all validation checks
async function validateDeployment() {
  console.log('🔍 Validating deployment configuration...\n');
  
  try {
    checks.checkRequiredFiles();
    checks.checkPackageScripts();
    checks.checkServerConfig();
    checks.checkEnvironmentHandling();
    
    console.log('\n✅ Deployment validation successful!');
    console.log('\nDeployment fixes applied:');
    console.log('• NODE_ENV environment variable handling');
    console.log('• Production configuration validation');
    console.log('• Security headers for production');
    console.log('• Graceful shutdown handling');
    console.log('• Error handling improvements');
    console.log('• Server binding configuration');
    
  } catch (error) {
    console.error('\n❌ Deployment validation failed:');
    console.error(error.message);
    process.exit(1);
  }
}

validateDeployment();