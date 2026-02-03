#!/usr/bin/env node
/**
 * Grammar Coverage Check
 * 
 * Detects drift between diagram factories (java25Grammar.ts) and EBNF definitions (ebnfDefinitions.ts).
 * Run via: npm run check-grammar
 * 
 * Exit code 0 = all rules have both diagram and EBNF
 * Exit code 1 = coverage mismatch detected
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '../src/features/grammar');

// Extract rule names from java25Grammar.ts by parsing rules.set() calls
function extractDiagramRules(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const rulePattern = /rules\.set\(\s*["']([^"']+)["']/g;
  const rules = new Set();
  let match;
  while ((match = rulePattern.exec(content)) !== null) {
    rules.add(match[1]);
  }
  return rules;
}

// Extract rule names from ebnfDefinitions.ts by parsing EBNF_DEFINITIONS keys
function extractEbnfRules(filePath) {
  const content = readFileSync(filePath, 'utf8');
  // Match object keys in the EBNF_DEFINITIONS object
  const rulePattern = /^\s*["']([^"']+)["']\s*:/gm;
  const rules = new Set();
  let match;
  while ((match = rulePattern.exec(content)) !== null) {
    rules.add(match[1]);
  }
  return rules;
}

function main() {
  console.log('🔍 Checking grammar coverage...\n');

  const grammarPath = resolve(srcDir, 'java25Grammar.ts');
  const ebnfPath = resolve(srcDir, 'ebnfDefinitions.ts');

  let diagramRules, ebnfRules;
  
  try {
    diagramRules = extractDiagramRules(grammarPath);
    console.log(`📊 Found ${diagramRules.size} diagram rules in java25Grammar.ts`);
  } catch (err) {
    console.error(`❌ Failed to read java25Grammar.ts: ${err.message}`);
    process.exit(1);
  }

  try {
    ebnfRules = extractEbnfRules(ebnfPath);
    console.log(`📝 Found ${ebnfRules.size} EBNF definitions in ebnfDefinitions.ts`);
  } catch (err) {
    console.error(`❌ Failed to read ebnfDefinitions.ts: ${err.message}`);
    process.exit(1);
  }

  console.log('');

  // Find mismatches
  const missingEbnf = [...diagramRules].filter(r => !ebnfRules.has(r)).sort();
  const missingDiagram = [...ebnfRules].filter(r => !diagramRules.has(r)).sort();

  let hasErrors = false;

  if (missingEbnf.length > 0) {
    hasErrors = true;
    console.log('⚠️  Rules with DIAGRAM but NO EBNF definition:');
    missingEbnf.forEach(r => console.log(`   - ${r}`));
    console.log('');
  }

  if (missingDiagram.length > 0) {
    hasErrors = true;
    console.log('⚠️  Rules with EBNF but NO DIAGRAM factory:');
    missingDiagram.forEach(r => console.log(`   - ${r}`));
    console.log('');
  }

  if (hasErrors) {
    console.log('❌ Grammar coverage check FAILED');
    console.log('   Please ensure every rule has both a diagram factory and EBNF definition.\n');
    process.exit(1);
  }

  console.log('✅ Grammar coverage check PASSED');
  console.log('   All rules have matching diagram factories and EBNF definitions.\n');
  process.exit(0);
}

main();
